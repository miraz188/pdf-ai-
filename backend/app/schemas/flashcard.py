from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FlashcardDeckCreate(BaseModel):
    document_id: int
    title: Optional[str] = None
    num_cards: int = Field(default=10, ge=1, le=50)

class FlashcardResponse(BaseModel):
    id: int
    deck_id: int
    front_text: str
    back_text: str
    hint: Optional[str]
    category: Optional[str]
    difficulty: str
    order_number: int

    class Config:
        from_attributes = True

class FlashcardDeckResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    title: str
    description: Optional[str]
    card_count: int
    created_at: datetime
    flashcards: List[FlashcardResponse] = []

    class Config:
        from_attributes = True
