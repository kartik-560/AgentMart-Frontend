import api from './api';

export const authService = {
  async login({ email, password, accountType }) {
    return await api.post('/auth/login', { email, password, accountType });
  },

  async requestOtp({ email, name, purpose }) {
    return await api.post('/auth/otp/send', { email, name, purpose });
  },

  async verifyOtp({ email, otp, purpose }) {
    return await api.post('/auth/otp/verify', { email, otp, purpose });
  },

  async register({
    email,
    password,
    name,
    accountType,
    businessName,
    businessType,
    contactPhone,
    otp,
  }) {
    return await api.post('/auth/register', {
      email,
      password,
      name,
      accountType,
      businessName,
      businessType,
      contactPhone,
      otp,
    });
  },

  async getMe() {
    return await api.get('/auth/me');
  },
};

export default authService;
