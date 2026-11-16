import { api } from '@/services/api';

export const queueService = {
  status: ({ doctorId, date }) => api.get('/queue/status', { query: { doctorId, date } }),
  myPosition: (appointmentId) => api.get('/queue/my-position', { query: { appointmentId } }),
};
