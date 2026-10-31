import api from './api';

export const negotiationService = {
  getAll: () => api.get('/negotiations'),
  getById: (id) => api.get(`/negotiations/${id}`),
  create: (data) => api.post('/negotiations', data),
  advanceRound: (id, roundData = {}) => api.post(`/negotiations/${id}/advance-round`, roundData),
  getComparison: (id) => api.get(`/negotiations/${id}/comparison`),
};

