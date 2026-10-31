import api from './api';

let transactionsCache = [];

export const transactionService = {
  getAll: async () => {
    try {
      const res = await api.get('/transactions');
      if (res && Array.isArray(res.data)) {
        transactionsCache = res.data;
        return res;
      }
    } catch (err) {
      console.error('transactionService.getAll error:', err);
    }
    return { success: true, statusCode: 200, data: transactionsCache };
  },

  create: async (payload) => {
    try {
      const res = await api.post('/transactions', payload);
      if (res?.data) {
        transactionsCache = [res.data, ...transactionsCache.filter((t) => t.id !== res.data.id)];
        return res;
      }
      throw new Error(res?.message || 'Failed to create transaction');
    } catch (err) {
      console.error('transactionService.create error:', err);
      throw err;
    }
  },

  getById: async (id) => {
    if (!id) {
      return { success: false, statusCode: 400, data: null, error: 'No transaction ID specified' };
    }
    try {
      const res = await api.get(`/transactions/${id}`);
      if (res?.data) {
        transactionsCache = [res.data, ...transactionsCache.filter((t) => t.id !== res.data.id)];
        return res;
      }
    } catch (err) {
      console.error(`transactionService.getById(${id}) error:`, err);
      // Only return cached item if it matches the requested ID exactly
      const cached = transactionsCache.find((t) => t.id === id);
      if (cached) {
        return { success: true, statusCode: 200, data: cached };
      }
      throw err;
    }
    const cached = transactionsCache.find((t) => t.id === id);
    if (cached) {
      return { success: true, statusCode: 200, data: cached };
    }
    return { success: false, statusCode: 404, data: null, error: 'Transaction not found' };
  },

  approve: async (id, payload) => {
    try {
      const res = await api.post(`/transactions/${id}/approve`, payload);
      if (res?.data) {
        transactionsCache = transactionsCache.map((t) =>
          t.id === id ? { ...t, ...res.data, settlementStatus: 'SETTLED' } : t
        );
        return res;
      }
      throw new Error(res?.message || 'Failed to approve transaction');
    } catch (err) {
      console.error(`transactionService.approve(${id}) error:`, err);
      throw err;
    }
  },

  reject: async (id, payload) => {
    try {
      const res = await api.post(`/transactions/${id}/reject`, payload);
      if (res?.data) {
        transactionsCache = transactionsCache.map((t) =>
          t.id === id ? { ...t, ...res.data, settlementStatus: 'REJECTED' } : t
        );
        return res;
      }
      throw new Error(res?.message || 'Failed to reject transaction');
    } catch (err) {
      console.error(`transactionService.reject(${id}) error:`, err);
      throw err;
    }
  },
};
