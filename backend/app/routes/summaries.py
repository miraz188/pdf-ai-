from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import time
from ..database import get_db
from ..models.user import User
from ..models.summary import Summary
from ..schemas.summary import SummaryCreate, SummaryResponse
from ..services.auth_service import AuthService
from ..services.document_service import DocumentService
from ..services.ai_service import AIService

router = APIRouter(prefix="/api/summaries", tags=["Summaries"])

@router.post("/", response_model=SummaryResponse)
async def create_summary(
    summary_data: SummaryCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    document = DocumentService.get_document(db, summary_data.document_id, current_user.id)

    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document has no extracted text")

    ai_service = AIService()

    try:
        if not await ai_service.check_ollama_status():
            raise HTTPException(status_code=503, detail="Ollama is not running or model not available")

        start_time = time.time()
        summary_result = await ai_service.generate_summary(
            text=document.extracted_text,
            summary_type=summary_data.summary_type,
            custom_instructions=summary_data.custom_instructions
        )
        processing_time = int((time.time() - start_time) * 1000)

        summary = Summary(
            user_id=current_user.id,
            document_id=document.id,
            summary_type=summary_data.summary_type,
            content=summary_result["content"],
            word_count=summary_result["word_count"],
            processing_time=processing_time
        )

        db.add(summary)
        db.commit()
        db.refresh(summary)

        return summary

    finally:
        await ai_service.close()

@router.get("/document/{document_id}", response_model=List[SummaryResponse])
async def get_document_summaries(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    DocumentService.get_document(db, document_id, current_user.id)

    return (
        db.query(Summary)
        .filter(Summary.document_id == document_id, Summary.user_id == current_user.id)
        .order_by(Summary.created_at.desc())
        .all()
    )

@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary(
    summary_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()

    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    return summary

@router.delete("/{summary_id}")
async def delete_summary(
    summary_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()

    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    db.delete(summary)
    db.commit()

    return {"message": "Summary deleted successfully"}
