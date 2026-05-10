import api from './api';

export const quizService = {
  async createQuiz(documentId, numQuestions = 5, difficulty = 'medium', title = null) {
    const response = await api.post('/quizzes/', {
      document_id: documentId,
      num_questions: numQuestions,
      difficulty: difficulty,
      title: title
    });
    return response.data;
  },

  async getDocumentQuizzes(documentId) {
    const response = await api.get(`/quizzes/document/${documentId}`);
    return response.data;
  },

  async getQuiz(quizId) {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  async deleteQuiz(quizId) {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  }
};
