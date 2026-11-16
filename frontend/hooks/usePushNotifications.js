'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPushPermission, isPushSupported, registerPush } from '@/lib/firebase';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';

/**
 * Push notification state for the signed-in user.
 * - If the browser permission is already "granted" the token is refreshed silently.
 * - Otherwise the user must press a button (calling `enable`) - we never pop a permission
 *   dialog on page load.
 */
export function usePushNotifications({ autoRegister = false } = {}) {
  const toast = useToast();
  const [permission, setPermission] = useState('unsupported');
  const [busy, setBusy] = useState(false);

  const onForeground = useCallback(({ title, body }) => toast.info(`${title}: ${body}`), [toast]);

  useEffect(() => {
    setPermission(isPushSupported() ? getPushPermission() : 'unsupported');
  }, []);

  useEffect(() => {
    if (!autoRegister || permission !== 'granted') return;
    registerPush({ onForeground })
      .then((token) => token && authService.saveFcmToken(token))
      .catch(() => {
        /* push is a bonus - never block the app */
      });
  }, [autoRegister, permission, onForeground]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const token = await registerPush({ requestPermission: true, onForeground });
      setPermission(getPushPermission());
      if (token) {
        await authService.saveFcmToken(token);
        toast.success('Reminders are on. We will notify you before your turn.');
      } else if (getPushPermission() === 'denied') {
        toast.warning('Notifications are blocked. Allow them in your browser settings to get reminders.');
      }
    } catch {
      toast.error('Could not turn on notifications on this device.');
    } finally {
      setBusy(false);
    }
  }, [onForeground, toast]);

  return { permission, busy, enable, supported: permission !== 'unsupported' };
}
