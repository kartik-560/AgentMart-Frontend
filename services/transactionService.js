import api from './api';

export const transactionService = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  approve: (id, payload) => api.post(`/transactions/${id}/approve`, payload),
  reject: (id, payload) => api.post(`/transactions/${id}/reject`, payload),
};

