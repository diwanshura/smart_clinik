'use client';

import { BellRing } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Asks (politely, on a button press) to turn on reminders. Hidden when unsupported or already decided. */
export function NotificationPrompt() {
  const { permission, enable, busy } = usePushNotifications();
  if (permission !== 'default') return null;

  return (
    <div className="mb-8 flex flex-col items-start gap-4 rounded-2xl bg-brand-50 p-5 ring-1 ring-inset ring-brand-200 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
        <BellRing className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-ink-900">Get a reminder before your turn</h2>
        <p className="text-slate-700">We will send an alert to this device shortly before your appointment.</p>
      </div>
      <Button onClick={enable} loading={busy}>
        Turn on reminders
      </Button>
    </div>
  );
}
