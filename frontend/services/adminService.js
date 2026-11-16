import { api } from '@/services/api';

// Endpoints under /api/admin. Some are shared with doctors (appointments, emergency, patient search).
export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  analytics: (days = 7) => api.get('/admin/analytics', { query: { days } }),
  /** query: { date, doctorId, status, page, limit } - doctors only ever see their own. */
  appointments: (query) => api.get('/admin/appointments', { query }),
  /** query: { search, page, limit } */
  patients: (query) => api.get('/admin/patients', { query }),
  setUserActive: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),
  generateSlots: ({ doctorId, date }) => api.post('/admin/generate-slots', { doctorId, date }),
  addEmergencyPatient: (payload) => api.post('/admin/emergency-patient', payload),
};
