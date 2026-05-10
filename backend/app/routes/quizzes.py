from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import time
from ..database import get_db
from ..models.user import User
from ..models.quiz import Quiz, QuizQuestion
from ..schemas.quiz import QuizCreate, QuizResponse
from ..services.auth_service import AuthService
from ..services.document_service import DocumentService
from ..services.ai_service import AIService

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

@router.post("/", response_model=QuizResponse)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    document = DocumentService.get_document(db, quiz_data.document_id, current_user.id)

    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document has no extracted text")

    ai_service = AIService()

    try:
        if not await ai_service.check_ollama_status():
            raise HTTPException(status_code=503, detail="Ollama is not running or model not available")

        questions_data = await ai_service.generate_quiz(
            text=document.extracted_text,
            num_questions=quiz_data.num_questions,
            difficulty=quiz_data.difficulty
        )

        quiz = Quiz(
            user_id=current_user.id,
            document_id=document.id,
            title=quiz_data.title or f"Quiz on {document.original_filename}",
            difficulty=quiz_data.difficulty,
            total_questions=len(questions_data)
        )

        db.add(quiz)
        db.flush()

        for i, q_data in enumerate(questions_data):
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_data.get("question_text", ""),
                question_type=q_data.get("question_type", "multiple_choice"),
                options=q_data.get("options", []),
                correct_answer=q_data.get("correct_answer", ""),
                explanation=q_data.get("explanation", ""),
                points=1,
                order_number=i + 1
            )
            db.add(question)

        db.commit()
        db.refresh(quiz)

        return quiz

    finally:
        await ai_service.close()

@router.get("/document/{document_id}", response_model=List[QuizResponse])
async def get_document_quizzes(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    DocumentService.get_document(db, document_id, current_user.id)

    return (
        db.query(Quiz)
        .filter(Quiz.document_id == document_id, Quiz.user_id == current_user.id)
        .order_by(Quiz.created_at.desc())
        .all()
    )

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return quiz

@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db.delete(quiz)
    db.commit()

    return {"message": "Quiz deleted successfully"}
