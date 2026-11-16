import { api } from '@/services/api';

export const slotService = {
  list: ({ doctorId, date }) => api.get('/slots', { query: { doctorId, date } }),
};
