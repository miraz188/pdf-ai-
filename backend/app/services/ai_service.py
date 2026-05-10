import json
import httpx
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from ..config import settings
from ..utils.text_chunker import TextChunker
from ..utils.prompts import PromptTemplates

class AIService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.text_chunker = TextChunker()
        self.client = httpx.AsyncClient(timeout=120.0)

    async def check_ollama_status(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return any(model.get("name") == self.model for model in models)
            return False
        except Exception:
            return False

    async def generate_completion(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.7, "top_p": 0.9, "num_predict": 2048}
            }

            if system_prompt:
                payload["system"] = system_prompt

            response = await self.client.post(f"{self.base_url}/api/generate", json=payload)

            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                raise HTTPException(status_code=500, detail=f"Ollama API error: {response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Could not connect to Ollama: {str(e)}")

    async def generate_summary(self, text: str, summary_type: str, custom_instructions: Optional[str] = None) -> Dict[str, Any]:
        if len(text) > 4000:
            chunks = self.text_chunker.chunk_text(text)
            summaries = []

            for chunk in chunks:
                prompt = PromptTemplates.get_summary_prompt(chunk, summary_type, custom_instructions)
                chunk_summary = await self.generate_completion(prompt)
                summaries.append(chunk_summary)

            combined_text = "\n\n".join(summaries)
            final_prompt = f"""Combine the following partial summaries into one coherent {summary_type} summary:\n\n{combined_text}\n\nCombined summary:"""
            final_summary = await self.generate_completion(final_prompt)

            return {"content": final_summary, "word_count": len(final_summary.split())}
        else:
            prompt = PromptTemplates.get_summary_prompt(text, summary_type, custom_instructions)
            summary = await self.generate_completion(prompt)
            return {"content": summary, "word_count": len(summary.split())}

    async def generate_quiz(self, text: str, num_questions: int, difficulty: str) -> List[Dict[str, Any]]:
        if len(text) > 6000:
            chunks = self.text_chunker.chunk_text(text)
            selected_chunks = []
            if chunks:
                selected_chunks.append(chunks[0])
            if len(chunks) > 2:
                selected_chunks.append(chunks[len(chunks) // 2])
            if len(chunks) > 1:
                selected_chunks.append(chunks[-1])
            text = "\n\n".join(selected_chunks)

        prompt = PromptTemplates.get_quiz_prompt(text, num_questions, difficulty)
        response = await self.generate_completion(prompt)

        try:
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                questions = json.loads(json_str)
                return questions[:num_questions]
            else:
                questions = json.loads(response)
                return questions[:num_questions]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse quiz questions from AI response")

    async def generate_flashcards(self, text: str, num_cards: int) -> List[Dict[str, Any]]:
        if len(text) > 6000:
            chunks = self.text_chunker.chunk_text(text)
            selected_chunks = []
            if chunks:
                selected_chunks.append(chunks[0])
            if len(chunks) > 2:
                selected_chunks.append(chunks[len(chunks) // 2])
            if len(chunks) > 1:
                selected_chunks.append(chunks[-1])
            text = "\n\n".join(selected_chunks)

        prompt = PromptTemplates.get_flashcard_prompt(text, num_cards)
        response = await self.generate_completion(prompt)

        try:
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                flashcards = json.loads(json_str)
                return flashcards[:num_cards]
            else:
                flashcards = json.loads(response)
                return flashcards[:num_cards]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse flashcards from AI response")

    async def chat_with_document(self, document_text: str, user_message: str, chat_history: Optional[str] = None) -> Dict[str, Any]:
        relevant_context = document_text

        if len(document_text) > 4000:
            chunks = self.text_chunker.chunk_text(document_text)
            keywords = set(user_message.lower().split())

            scored_chunks = []
            for chunk in chunks:
                chunk_lower = chunk.lower()
                score = sum(1 for keyword in keywords if keyword in chunk_lower)
                scored_chunks.append((score, chunk))

            scored_chunks.sort(reverse=True, key=lambda x: x[0])
            relevant_chunks = [chunk for score, chunk in scored_chunks[:3] if score > 0]

            if relevant_chunks:
                relevant_context = "\n\n".join(relevant_chunks)
            else:
                relevant_context = chunks[0] if chunks else document_text[:2000]

        system_prompt = PromptTemplates.get_chat_system_prompt(relevant_context)
        prompt = PromptTemplates.get_chat_prompt(user_message, chat_history)
        response = await self.generate_completion(prompt, system_prompt)

        return {"content": response, "tokens_used": len(response.split())}

    async def close(self):
        await self.client.aclose()
