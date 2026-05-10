from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class QuizCreate(BaseModel):
    document_id: int
    title: Optional[str] = None
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")

class QuizQuestionResponse(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    question_type: str
    options: Optional[List[str]]
    correct_answer: str
    explanation: Optional[str]
    points: int
    order_number: int

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    title: str
    description: Optional[str]
    difficulty: str
    total_questions: int
    created_at: datetime
    questions: List[QuizQuestionResponse] = []

    class Config:
        from_attributes = True
