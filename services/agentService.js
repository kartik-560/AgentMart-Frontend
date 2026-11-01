import api from './api';
import {
  INITIAL_AGENTS,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_THREAT_RADAR,
} from './mockData';

// In-memory runtime cache for seamless offline/fallback state
let agentsCache = [...INITIAL_AGENTS];
let businessProfileCache = { ...INITIAL_BUSINESS_PROFILE };
let productsCache = [];
let auditLogsCache = [...INITIAL_AUDIT_LOGS];
let threatRadarCache = { ...INITIAL_THREAT_RADAR };

export const agentService = {
  getAll: async () => {
    try {
      const res = await api.get('/agents');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        agentsCache = res.data;
        return res;
      }
    } catch (err) {
      // Graceful fallback to mock data
    }
    return { success: true, statusCode: 200, data: agentsCache };
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/agents/${id}`);
      if (res?.data) return res;
    } catch (err) {}
    const agent = agentsCache.find((a) => a.id === id) || agentsCache[0];
    return { success: true, statusCode: 200, data: agent };
  },

  updateStatus: async (id, status, reason = '') => {
    try {
      const res = await api.patch(`/agents/${id}/status`, { status, reason });
      if (res?.data) {
        agentsCache = agentsCache.map((a) => (a.id === id ? { ...a, status } : a));
        return res;
      }
    } catch (err) {}
    agentsCache = agentsCache.map((a) => (a.id === id ? { ...a, status } : a));
    return { success: true, statusCode: 200, data: { id, status, reason } };
  },
};

export const businessService = {
  getProfile: async () => {
    try {
      const res = await api.get('/business/profile');
      if (res?.data) {
        businessProfileCache = { ...businessProfileCache, ...res.data };
        return res;
      }
    } catch (err) {}
    return { success: true, statusCode: 200, data: businessProfileCache };
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/business/profile', data);
      if (res?.data) {
        businessProfileCache = { ...businessProfileCache, ...res.data };
        return res;
      }
    } catch (err) {}
    businessProfileCache = { ...businessProfileCache, ...data };
    return { success: true, statusCode: 200, data: businessProfileCache };
  },
};

export const productService = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      if (res?.data?.products !== undefined) {
        return res;
      }
    } catch (err) {
      console.warn('Failed to fetch products from backend:', err?.message);
    }
    return {
      success: true,
      statusCode: 200,
      data: {
        products: [],
        total: 0,
        limit: params.limit || 50,
        offset: params.offset || 0,
      },
    };
  },

  getById: async (id) => {
    try {
      const res = await api.get('/products/' + id);
      if (res?.data) return res;
    } catch (err) {}
    return { success: false, statusCode: 404, data: null };
  },

  getMyProducts: async () => {
    return await api.get('/products/mine');
  },

  create: async (payload) => {
    return await api.post('/products', payload);
  },

  update: async (id, payload) => {
    return await api.put('/products/' + id, payload);
  },

  delete: async (id) => {
    return await api.delete('/products/' + id);
  },
};

export const securityService = {
  getAlerts: async () => {
    try {
      const res = await api.get('/security/alerts');
      if (res?.data && Array.isArray(res.data)) {
        return res;
      }
    } catch (err) {}
    // Return alerts from initial mock negotiation
    const { INITIAL_NEGOTIATION } = await import('./mockData');
    return { success: true, statusCode: 200, data: INITIAL_NEGOTIATION.securityAlerts };
  },

  getThreatRadar: async () => {
    try {
      const res = await api.get('/security/threat-radar');
      if (res?.data) {
        threatRadarCache = res.data;
        return res;
      }
    } catch (err) {}
    return { success: true, statusCode: 200, data: threatRadarCache };
  },

  resolveAlert: async (id, data = {}) => {
    try {
      const res = await api.post(`/security/alerts/${id}/resolve`, data);
      if (res?.data) return res;
    } catch (err) {}
    return {
      success: true,
      statusCode: 200,
      data: { id, resolved: true, ...data, resolvedAt: new Date().toISOString() },
    };
  },
};

export const auditService = {
  getLogs: async (params = {}) => {
    try {
      const res = await api.get('/audit/logs', { params });
      if (res?.data?.logs) return res;
    } catch (err) {}

    let filtered = [...auditLogsCache];
    if (params.entityType && params.entityType !== 'ALL') {
      filtered = filtered.filter((l) => l.entityType === params.entityType);
    }
    if (params.actorType && params.actorType !== 'ALL') {
      filtered = filtered.filter((l) => l.actorType === params.actorType);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        logs: filtered,
        total: filtered.length,
        limit: params.limit || 50,
        offset: params.offset || 0,
      },
    };
  },

  appendLog: (entry) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    auditLogsCache.unshift(newLog);
    return newLog;
  },
};
