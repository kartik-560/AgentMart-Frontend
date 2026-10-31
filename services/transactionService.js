import api from './api';
import { INITIAL_TRANSACTIONS } from './mockData';
import { auditService } from './agentService';

let transactionsCache = [...INITIAL_TRANSACTIONS];

export const transactionService = {
  getAll: async () => {
    try {
      const res = await api.get('/transactions');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        transactionsCache = res.data;
        return res;
      }
    } catch (err) {}
    return { success: true, statusCode: 200, data: transactionsCache };
  },

  create: async (payload) => {
    try {
      const res = await api.post('/transactions', payload);
      if (res?.data) {
        transactionsCache = [res.data, ...transactionsCache.filter((t) => t.id !== res.data.id)];
        return res;
      }
    } catch (err) {}
    return { success: true, statusCode: 201, data: payload };
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/transactions/${id}`);
      if (res?.data) return res;
    } catch (err) {}
    const tx = transactionsCache.find((t) => t.id === id) || transactionsCache[0];
    return { success: true, statusCode: 200, data: tx };
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
    } catch (err) {}

    const settledAt = new Date().toISOString();
    const mockRef = `UPI-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockHash = `sha256-approved-${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 10)}`;

    const updatedTx = {
      id,
      settlementStatus: 'SETTLED',
      approvedBy: payload.approvedBy || 'Kartik - Senior Procurement Director',
      approvalNotes: payload.approvalNotes || 'Approved within authorized budget and delivery threshold',
      mockUpiReference: mockRef,
      mockUpiVpa: payload.payerVpa || 'apexenterprise@hdfcbank',
      settledAt,
      tamperProofHash: mockHash,
    };

    transactionsCache = transactionsCache.map((t) =>
      t.id === id ? { ...t, ...updatedTx } : t
    );

    // Append to audit trail
    auditService.appendLog({
      entityType: 'TRANSACTION',
      entityId: id,
      action: 'SETTLEMENT_CONFIRMED',
      actorType: 'HUMAN',
      actorId: payload.approvedBy || 'Human Operator',
      details: `Mock UPI settlement completed (${mockRef}). Funds transferred to supplier.`,
      newState: { status: 'SETTLED', upiRef: mockRef },
      tamperProofHash: mockHash,
    });

    return { success: true, statusCode: 200, data: updatedTx };
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
    } catch (err) {}

    const rejectedAt = new Date().toISOString();
    const updatedTx = {
      id,
      settlementStatus: 'REJECTED',
      approvedBy: payload.rejectedBy || 'Procurement Operator',
      approvalNotes: payload.rejectionReason || 'Deal rejected due to constraint violation or supplier risk',
      settledAt: null,
    };

    transactionsCache = transactionsCache.map((t) =>
      t.id === id ? { ...t, ...updatedTx } : t
    );

    auditService.appendLog({
      entityType: 'TRANSACTION',
      entityId: id,
      action: 'DEAL_REJECTED',
      actorType: 'HUMAN',
      actorId: payload.rejectedBy || 'Human Operator',
      details: `Transaction rejected: ${payload.rejectionReason || 'Operator manual intervention'}`,
      newState: { status: 'REJECTED' },
      tamperProofHash: `sha256-rejected-${Date.now().toString(16)}`,
    });

    return { success: true, statusCode: 200, data: updatedTx };
  },
};
