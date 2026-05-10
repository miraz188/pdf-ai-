import os
import uuid
from typing import Tuple
import PyPDF2
import pdfplumber
from fastapi import UploadFile, HTTPException
from ..config import settings

class PDFService:
    ALLOWED_EXTENSIONS = {".pdf"}
    ALLOWED_MIME_TYPES = {"application/pdf"}

    @staticmethod
    def validate_pdf(file: UploadFile) -> None:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in PDFService.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Only PDF files are accepted.")

        if file.content_type not in PDFService.ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail=f"Only PDF files are accepted.")

    @staticmethod
    async def save_pdf(file: UploadFile) -> Tuple[str, str, int]:
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        try:
            content = await file.read()
            file_size = len(content)

            if file_size > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(status_code=400, detail=f"File too large")

            with open(file_path, "wb") as f:
                f.write(content)

            return file_path, unique_filename, file_size

        except HTTPException:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    @staticmethod
    def extract_text_pypdf2(file_path: str) -> str:
        try:
            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

    @staticmethod
    def extract_text_pdfplumber(file_path: str) -> Tuple[str, int]:
        try:
            text = ""
            page_count = 0
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            return text.strip(), page_count
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

    @staticmethod
    def extract_text(file_path: str) -> Tuple[str, int]:
        try:
            text, page_count = PDFService.extract_text_pdfplumber(file_path)

            if len(text) < 100:
                text = PDFService.extract_text_pypdf2(file_path)
                with open(file_path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    page_count = len(reader.pages)

            return text, page_count

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

    @staticmethod
    def delete_pdf(file_path: str) -> None:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Warning: Could not delete file {file_path}: {str(e)}")
