from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class FlashcardDeck(Base):
    __tablename__ = "flashcard_decks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    card_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="flashcard_decks")
    document = relationship("Document", back_populates="flashcard_decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FlashcardDeck {self.title}>"

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("flashcard_decks.id", ondelete="CASCADE"), nullable=False)
    front_text = Column(Text, nullable=False)
    back_text = Column(Text, nullable=False)
    hint = Column(Text)
    category = Column(String(255))
    difficulty = Column(String(50), default="medium")
    order_number = Column(Integer, nullable=False)
    times_reviewed = Column(Integer, default=0)
    last_reviewed = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    deck = relationship("FlashcardDeck", back_populates="flashcards")

    def __repr__(self):
        return f"<Flashcard {self.id}>"
