import api from './api';

export const sellerService = {
  async getDashboard() {
    return await api.get('/seller/dashboard');
  },

  async getInventory() {
    return await api.get('/seller/inventory');
  },

  async createProduct(payload) {
    return await api.post('/seller/products', payload);
  },

  async updateStock(productId, payload) {
    return await api.put(`/seller/inventory/${productId}/stock`, payload);
  },

  async deleteProduct(productId) {
    return await api.delete(`/seller/products/${productId}`);
  },

  async getSettings() {
    return await api.get('/seller/settings');
  },

  async updateBusinessSettings(payload) {
    return await api.put('/seller/settings/business', payload);
  },

  async updateAgentSettings(payload) {
    return await api.put('/seller/settings/agent', payload);
  },

  async updateProductPricing(productId, payload) {
    return await api.put(`/seller/products/${productId}`, payload);
  },
};

export default sellerService;
