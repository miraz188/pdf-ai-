from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.flashcard import FlashcardDeck, Flashcard
from ..schemas.flashcard import FlashcardDeckCreate, FlashcardDeckResponse
from ..services.auth_service import AuthService
from ..services.document_service import DocumentService
from ..services.ai_service import AIService

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])

@router.post("/decks", response_model=FlashcardDeckResponse)
async def create_flashcard_deck(
    deck_data: FlashcardDeckCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    document = DocumentService.get_document(db, deck_data.document_id, current_user.id)

    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document has no extracted text")

    ai_service = AIService()

    try:
        if not await ai_service.check_ollama_status():
            raise HTTPException(status_code=503, detail="Ollama is not running or model not available")

        flashcards_data = await ai_service.generate_flashcards(
            text=document.extracted_text,
            num_cards=deck_data.num_cards
        )

        deck = FlashcardDeck(
            user_id=current_user.id,
            document_id=document.id,
            title=deck_data.title or f"Flashcards for {document.original_filename}",
            card_count=len(flashcards_data)
        )

        db.add(deck)
        db.flush()

        for i, card_data in enumerate(flashcards_data):
            flashcard = Flashcard(
                deck_id=deck.id,
                front_text=card_data.get("front_text", ""),
                back_text=card_data.get("back_text", ""),
                hint=card_data.get("hint"),
                category=card_data.get("category"),
                difficulty=card_data.get("difficulty", "medium"),
                order_number=i + 1
            )
            db.add(flashcard)

        db.commit()
        db.refresh(deck)

        return deck

    finally:
        await ai_service.close()

@router.get("/decks/document/{document_id}", response_model=List[FlashcardDeckResponse])
async def get_document_decks(
    document_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    DocumentService.get_document(db, document_id, current_user.id)

    return (
        db.query(FlashcardDeck)
        .filter(FlashcardDeck.document_id == document_id, FlashcardDeck.user_id == current_user.id)
        .order_by(FlashcardDeck.created_at.desc())
        .all()
    )

@router.get("/decks/{deck_id}", response_model=FlashcardDeckResponse)
async def get_deck(
    deck_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id, FlashcardDeck.user_id == current_user.id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Flashcard deck not found")

    return deck

@router.delete("/decks/{deck_id}")
async def delete_deck(
    deck_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id, FlashcardDeck.user_id == current_user.id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Flashcard deck not found")

    db.delete(deck)
    db.commit()

    return {"message": "Flashcard deck deleted successfully"}
