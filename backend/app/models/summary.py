from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class SummaryType(str, enum.Enum):
    SHORT = "short"
    DETAILED = "detailed"
    BULLET_POINTS = "bullet_points"
    KEY_CONCEPTS = "key_concepts"

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    summary_type = Column(SQLEnum(SummaryType), default=SummaryType.SHORT)
    content = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    processing_time = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="summaries")
    document = relationship("Document", back_populates="summaries")

    def __repr__(self):
        return f"<Summary {self.summary_type} for Document {self.document_id}>"
