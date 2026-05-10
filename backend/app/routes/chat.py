from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import time
from ..database import get_db
from ..models.user import User
from ..models.chat import ChatSession, ChatMessage
from ..schemas.chat import ChatSessionCreate, ChatSessionResponse, ChatMessageCreate, ChatMessageResponse
from ..services.auth_service import AuthService
from ..services.document_service import DocumentService
from ..services.ai_service import AIService

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    document = DocumentService.get_document(db, session_data.document_id, current_user.id)

    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document has no extracted text")

    session = ChatSession(
        user_id=current_user.id,
        document_id=document.id,
        title=session_data.title or f"Chat about {document.original_filename}"
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: int,
    message_data: ChatMessageCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    document = session.document
    if not document or not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document text not available")

    user_message = ChatMessage(session_id=session.id, role="user", content=message_data.message)
    db.add(user_message)

    previous_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    chat_history = "\n".join([
        f"{'User' if msg.role == 'user' else 'Assistant'}: {msg.content}"
        for msg in previous_messages[-10:]
    ])

    ai_service = AIService()

    try:
        if not await ai_service.check_ollama_status():
            raise HTTPException(status_code=503, detail="Ollama is not running or model not available")

        start_time = time.time()
        response = await ai_service.chat_with_document(
            document_text=document.extracted_text,
            user_message=message_data.message,
            chat_history=chat_history
        )
        processing_time = int((time.time() - start_time) * 1000)

        ai_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response["content"],
            tokens_used=response.get("tokens_used", 0),
            processing_time=processing_time
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        return ai_message

    finally:
        await ai_service.close()

@router.get("/sessions/document/{document_id}", response_model=List[ChatSessionResponse])
async def get_document_sessions(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    DocumentService.get_document(db, document_id, current_user.id)

    return (
        db.query(ChatSession)
        .filter(ChatSession.document_id == document_id, ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return session

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    db.delete(session)
    db.commit()

    return {"message": "Chat session deleted successfully"}
