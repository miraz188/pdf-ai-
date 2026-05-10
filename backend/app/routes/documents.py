from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.document import Document
from ..schemas.document import DocumentResponse, DocumentUploadResponse
from ..services.auth_service import AuthService
from ..services.pdf_service import PDFService
from ..services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    PDFService.validate_pdf(file)
    file_path, unique_filename, file_size = await PDFService.save_pdf(file)

    try:
        extracted_text, page_count = PDFService.extract_text(file_path)

        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract meaningful text from the PDF")

        document = Document(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type="application/pdf",
            page_count=page_count,
            extracted_text=extracted_text,
            status="completed"
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "message": "Document uploaded and processed successfully",
            "document": document,
            "extracted_text_length": len(extracted_text)
        }

    except Exception as e:
        PDFService.delete_pdf(file_path)
        raise e

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    return DocumentService.get_user_documents(db, current_user.id, skip, limit)

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    return DocumentService.get_document(db, document_id, current_user.id)

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    DocumentService.delete_document(db, document_id, current_user.id)
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/text")
async def get_document_text(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    document = DocumentService.get_document(db, document_id, current_user.id)
    return {"document_id": document.id, "text": document.extracted_text, "page_count": document.page_count}
