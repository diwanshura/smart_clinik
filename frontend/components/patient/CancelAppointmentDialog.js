'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { appointmentService } from '@/services/appointmentService';
import { errorMessage } from '@/services/api';
import { doctorDisplayName, formatDate, formatTime } from '@/lib/utils';

/** Confirm + perform a cancellation. Calls `onCancelled` after the API succeeds. */
export function CancelAppointmentDialog({ appointment, onClose, onCancelled }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await appointmentService.cancel(appointment._id);
      toast.success('Your appointment has been cancelled.');
      onCancelled?.(appointment);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'We could not cancel the appointment.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      open={!!appointment}
      onClose={onClose}
      onConfirm={confirm}
      loading={busy}
      tone="danger"
      title="Cancel this appointment?"
      message={
        appointment
          ? `${doctorDisplayName(appointment.doctorId)} on ${formatDate(appointment.date)} at ${formatTime(
              appointment.slotTime
            )}. The time slot will be given to someone else.`
          : ''
      }
      confirmLabel="Yes, cancel it"
      cancelLabel="Keep my appointment"
    />
  );
}
