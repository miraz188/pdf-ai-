import api from './api';

export const flashcardService = {
  async createDeck(documentId, numCards = 10, title = null) {
    const response = await api.post('/flashcards/decks', {
      document_id: documentId,
      num_cards: numCards,
      title: title
    });
    return response.data;
  },

  async getDocumentDecks(documentId) {
    const response = await api.get(`/flashcards/decks/document/${documentId}`);
    return response.data;
  },

  async getDeck(deckId) {
    const response = await api.get(`/flashcards/decks/${deckId}`);
    return response.data;
  },

  async deleteDeck(deckId) {
    const response = await api.delete(`/flashcards/decks/${deckId}`);
    return response.data;
  }
};
