'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

/** Shows the "your appointment is in 10 minutes" reminders the scheduler pushes over Socket.io. */
export function usePatientReminders() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return undefined;
    const socket = getSocket();
    const event = `reminder-${userId}`;
    const handler = (data) => toast.warning(data?.message || 'You have an appointment coming up.');
    socket.on(event, handler);
    if (!socket.connected) socket.connect();
    return () => {
      socket.off(event, handler);
    };
  }, [userId, toast]);
}
