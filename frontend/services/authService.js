import { api } from '@/services/api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }, { auth: false }),
  googleLogin: (payload) => api.post('/auth/google', payload, { auth: false }),
  register: (payload) => api.post('/auth/register', payload, { auth: false }),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  saveFcmToken: (fcmToken) => api.put('/auth/update-fcm-token', { fcmToken }),
};
