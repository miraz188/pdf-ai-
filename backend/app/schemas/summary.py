from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.summary import SummaryType

class SummaryCreate(BaseModel):
    document_id: int
    summary_type: SummaryType = SummaryType.SHORT
    custom_instructions: Optional[str] = None

class SummaryResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    summary_type: SummaryType
    content: str
    word_count: int
    processing_time: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
