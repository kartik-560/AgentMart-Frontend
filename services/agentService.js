import api from './api';

export const agentService = {
  getAll: () => api.get('/agents'),
  updateStatus: (id, status, reason) => api.patch(`/agents/${id}/status`, { status, reason }),
};

export const businessService = {
  getProfile: () => api.get('/business/profile'),
  updateProfile: (data) => api.put('/business/profile', data),
};

export const productService = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export const securityService = {
  getAlerts: () => api.get('/security/alerts'),
  getThreatRadar: () => api.get('/security/threat-radar'),
  resolveAlert: (id, data) => api.post(`/security/alerts/${id}/resolve`, data),
};

export const auditService = {
  getLogs: (params = {}) => api.get('/audit/logs', { params }),
};

