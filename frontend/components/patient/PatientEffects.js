'use client';

import { usePatientReminders } from '@/hooks/usePatientRealtime';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Background behaviour for signed-in patients: live reminders + silent push-token refresh. */
export function PatientEffects() {
  usePatientReminders();
  usePushNotifications({ autoRegister: true });
  return null;
}
