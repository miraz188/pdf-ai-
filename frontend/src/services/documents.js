import api from './api';

export const documentService = {
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    return response.data;
  },

  async getDocuments(skip = 0, limit = 20) {
    const response = await api.get('/documents/', { params: { skip, limit } });
    return response.data;
  },

  async getDocument(documentId) {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  async getDocumentText(documentId) {
    const response = await api.get(`/documents/${documentId}/text`);
    return response.data;
  },

  async deleteDocument(documentId) {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  }
};
