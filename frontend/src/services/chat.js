import api from './api';

export const chatService = {
  async createSession(documentId, title = null) {
    const response = await api.post('/chat/sessions', {
      document_id: documentId,
      title: title
    });
    return response.data;
  },

  async sendMessage(sessionId, message) {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
      session_id: sessionId,
      message: message
    });
    return response.data;
  },

  async getDocumentSessions(documentId) {
    const response = await api.get(`/chat/sessions/document/${documentId}`);
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  async deleteSession(sessionId) {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  }
};
