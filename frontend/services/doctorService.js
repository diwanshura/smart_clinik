import { api } from '@/services/api';

export const doctorService = {
  /** Public list of doctors who are accepting appointments. */
  list: () => api.get('/doctors'),
  /** The signed-in doctor's own profile (404 when not created yet). */
  me: () => api.get('/doctors/me'),
  saveMe: (payload) => api.post('/doctors/me', payload),
  /** Admin: create a doctor profile for an existing user. */
  create: (payload) => api.post('/doctors', payload),
  /** Admin: update a doctor profile (e.g. availability). */
  update: (id, payload) => api.put(`/doctors/${id}`, payload),
  /** Admin: every doctor, including those not accepting appointments. */
  listAll: () => api.get('/admin/doctors'),
};
