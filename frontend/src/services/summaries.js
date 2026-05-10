import api from './api';

export const summaryService = {
  async createSummary(documentId, summaryType, customInstructions = null) {
    const response = await api.post('/summaries/', {
      document_id: documentId,
      summary_type: summaryType,
      custom_instructions: customInstructions
    });
    return response.data;
  },

  async getDocumentSummaries(documentId) {
    const response = await api.get(`/summaries/document/${documentId}`);
    return response.data;
  },

  async getSummary(summaryId) {
    const response = await api.get(`/summaries/${summaryId}`);
    return response.data;
  },

  async deleteSummary(summaryId) {
    const response = await api.delete(`/summaries/${summaryId}`);
    return response.data;
  }
};
