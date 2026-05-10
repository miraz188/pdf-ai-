from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatSessionCreate(BaseModel):
    document_id: int
    title: Optional[str] = "New Chat"

class ChatMessageCreate(BaseModel):
    session_id: int
    message: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    tokens_used: Optional[int]
    processing_time: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
