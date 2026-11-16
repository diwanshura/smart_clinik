'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * Subscribes to real-time queue changes for a date (and optionally one doctor).
 *
 * `onUpdate` is called whenever the backend emits `queue-updated` for the matching
 * date/doctor. If the socket can't connect (e.g. the free Render instance is waking up),
 * the hook falls back to calling `onUpdate({ type: 'poll' })` every `fallbackPollMs`.
 */
export function useQueueSocket({ date, doctorId, onUpdate, enabled = true, fallbackPollMs = 20000 }) {
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || !date) return undefined;
    const socket = getSocket();

    const join = () => {
      setConnected(true);
      socket.emit('join-queue', { doctorId, date });
    };
    const handleDisconnect = () => setConnected(false);
    const handleUpdate = (event) => {
      if (event?.date && event.date !== date) return;
      if (doctorId && event?.doctorId && String(event.doctorId) !== String(doctorId)) return;
      callbackRef.current?.(event);
    };

    socket.on('connect', join);
    socket.on('disconnect', handleDisconnect);
    socket.on('queue-updated', handleUpdate);

    if (socket.connected) join();
    else socket.connect();

    return () => {
      socket.off('connect', join);
      socket.off('disconnect', handleDisconnect);
      socket.off('queue-updated', handleUpdate);
    };
  }, [date, doctorId, enabled]);

  // Polling safety net while the socket is down.
  useEffect(() => {
    if (!enabled || !date || connected || !fallbackPollMs) return undefined;
    const timer = setInterval(() => callbackRef.current?.({ type: 'poll' }), fallbackPollMs);
    return () => clearInterval(timer);
  }, [enabled, date, connected, fallbackPollMs]);

  return { connected };
}
