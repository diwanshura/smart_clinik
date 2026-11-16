import { api } from '@/services/api';

export const appointmentService = {
  book: (payload) => api.post('/appointments/book-slot', payload),
  /** Patient's own appointments. query: { status, page, limit } */
  mine: (query) => api.get('/appointments/my-appointments', { query }),
  get: (id) => api.get(`/appointments/${id}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  /** Doctor/admin: move an appointment through the queue. */
  updateStatus: (id, status, notes) => api.put(`/appointments/${id}/update-status`, { status, notes }),
  /** Doctor/admin: save clinical notes without changing the status. */
  saveNotes: (id, notes) => api.put(`/appointments/${id}/notes`, { notes }),
};
