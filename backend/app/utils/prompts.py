from typing import Optional

class PromptTemplates:
    @staticmethod
    def get_summary_prompt(text: str, summary_type: str, custom_instructions: Optional[str] = None) -> str:
        base_prompt = "You are an expert educational content summarizer. Based on the following text from a document, "

        prompts = {
            "short": f"{base_prompt}provide a concise summary in 2-3 paragraphs:\n\n{text}\n\nShort summary:",
            "detailed": f"{base_prompt}provide a comprehensive and detailed summary covering all main points:\n\n{text}\n\nDetailed summary:",
            "bullet_points": f"{base_prompt}extract and list the key points as bullet points:\n\n{text}\n\nKey points:",
            "key_concepts": f"{base_prompt}identify and explain the most important concepts and their relationships:\n\n{text}\n\nKey concepts:"
        }

        prompt = prompts.get(summary_type, prompts["short"])

        if custom_instructions:
            prompt += f"\n\nAdditional instructions: {custom_instructions}"

        return prompt

    @staticmethod
    def get_quiz_prompt(text: str, num_questions: int, difficulty: str) -> str:
        difficulty_guide = {
            "easy": "Create straightforward questions that test basic understanding and recall of the material.",
            "medium": "Create questions that test comprehension and application of concepts.",
            "hard": "Create challenging questions that test analysis, synthesis, and deep understanding."
        }

        prompt = f"""You are an expert quiz creator. Based on the following document text, create {num_questions} multiple-choice questions at {difficulty} difficulty level.

{difficulty_guide.get(difficulty, difficulty_guide["medium"])}

Format each question as JSON with these fields:
- question_text
- options (array of 4 strings)
- correct_answer (A, B, C, or D)
- explanation

Document text:
{text}

Generate {num_questions} questions in the following JSON format:
[
  {{
    "question_text": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": "A",
    "explanation": "..."
  }}
]

Quiz questions:"""

        return prompt

    @staticmethod
    def get_flashcard_prompt(text: str, num_cards: int) -> str:
        prompt = f"""You are an expert at creating educational flashcards. Based on the following document text, create {num_cards} flashcards that cover the most important concepts.

Format the flashcards as a JSON array:
[
  {{
    "front_text": "What is...?",
    "back_text": "The answer is...",
    "hint": "Think about...",
    "category": "Concept Name",
    "difficulty": "medium"
  }}
]

Document text:
{text}

Flashcards:"""

        return prompt

    @staticmethod
    def get_chat_system_prompt(document_context: str) -> str:
        return f"""You are an AI tutor helping a student understand a document. You have access to the following document content:

{document_context}

Your role is to answer questions accurately, explain concepts clearly, and provide examples when helpful.
Always base your answers on the document content provided."""

    @staticmethod
    def get_chat_prompt(user_message: str, chat_history: str = "") -> str:
        if chat_history:
            return f"""Previous conversation:
{chat_history}

Student's question: {user_message}

Provide a helpful, clear, and educational response based on the document content:"""
        else:
            return f"""Student's question: {user_message}

Provide a helpful, clear, and educational response based on the document content:"""
