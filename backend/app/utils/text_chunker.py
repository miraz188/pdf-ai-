from typing import List, Dict, Any

class TextChunker:
    def __init__(self, chunk_size: int = 2000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str) -> List[str]:
        if not text or len(text) <= self.chunk_size:
            return [text] if text else []

        chunks = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size

            if end < len(text):
                search_start = max(end - 200, start)
                chunk_segment = text[search_start:end]
                last_period = chunk_segment.rfind('.')
                last_exclamation = chunk_segment.rfind('!')
                last_question = chunk_segment.rfind('?')
                last_sentence_end = max(last_period, last_exclamation, last_question)

                if last_sentence_end != -1:
                    end = search_start + last_sentence_end + 1
            else:
                end = len(text)

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - self.overlap

        return chunks

    def chunk_with_metadata(self, text: str, page_numbers: List[int] = None) -> List[Dict[str, Any]]:
        chunks = self.chunk_text(text)
        chunks_with_metadata = []

        for i, chunk in enumerate(chunks):
            metadata = {
                "chunk_index": i,
                "total_chunks": len(chunks),
                "char_count": len(chunk),
                "word_count": len(chunk.split()),
                "is_first": i == 0,
                "is_last": i == len(chunks) - 1
            }

            if page_numbers:
                page_index = int((i / len(chunks)) * len(page_numbers))
                metadata["approximate_page"] = page_numbers[min(page_index, len(page_numbers) - 1)]

            chunks_with_metadata.append({"text": chunk, "metadata": metadata})

        return chunks_with_metadata

    def combine_chunks(self, chunks: List[str]) -> str:
        if len(chunks) <= 1:
            return chunks[0] if chunks else ""

        combined = chunks[0]
        for i in range(1, len(chunks)):
            overlap_found = False
            for j in range(min(self.overlap, len(combined)), 0, -1):
                if combined[-j:] == chunks[i][:j]:
                    combined += chunks[i][j:]
                    overlap_found = True
                    break

            if not overlap_found:
                combined += " " + chunks[i]

        return combined
