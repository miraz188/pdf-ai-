import os
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.document import Document

class DocumentService:
    @staticmethod
    def get_user_documents(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Document]:
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_document(db: Session, document_id: int, user_id: int) -> Document:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()

        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        return document

    @staticmethod
    def update_document_status(db: Session, document_id: int, user_id: int, status: str, **kwargs) -> Document:
        document = DocumentService.get_document(db, document_id, user_id)
        document.status = status

        for key, value in kwargs.items():
            if hasattr(document, key):
                setattr(document, key, value)

        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def delete_document(db: Session, document_id: int, user_id: int) -> None:
        document = DocumentService.get_document(db, document_id, user_id)

        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        db.delete(document)
        db.commit()

    @staticmethod
    def get_document_count(db: Session, user_id: int) -> int:
        return db.query(Document).filter(Document.user_id == user_id).count()
