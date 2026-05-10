import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setToken(token) { localStorage.setItem('access_token', token); },
  setUser(user) { localStorage.setItem('user', JSON.stringify(user)); },
  getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; },
  getToken() { return localStorage.getItem('access_token'); },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated() { return !!this.getToken(); }
};
