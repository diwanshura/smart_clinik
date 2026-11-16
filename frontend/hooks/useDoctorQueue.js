'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { useToast } from '@/context/ToastContext';
import { doctorService } from '@/services/doctorService';
import { adminService } from '@/services/adminService';
import { appointmentService } from '@/services/appointmentService';
import { errorMessage } from '@/services/api';

const byToken = (a, b) => a.tokenNumber - b.tokenNumber;

/**
 * Everything the doctor screens need for one day: the doctor's profile, that day's appointments,
 * live socket updates, and the actions (start / complete / absent / notes).
 */
export function useDoctorQueue(date) {
  const toast = useToast();

  // A 404 simply means "profile not created yet" - not an error state.
  const profile = useAsyncData(
    () =>
      doctorService.me().catch((err) => {
        if (err?.status === 404) return { doctor: null };
        throw err;
      }),
    []
  );
  const doctor = profile.data?.doctor || null;

  const appointments = useAsyncData(() => adminService.appointments({ date, limit: 100 }), [date], {
    enabled: !!doctor,
  });

  const { connected } = useQueueSocket({
    date,
    doctorId: doctor?._id,
    enabled: !!doctor,
    onUpdate: () => appointments.reload({ silent: true }),
  });

  const [busyId, setBusyId] = useState(null);

  const groups = useMemo(() => {
    const list = appointments.data?.appointments || [];
    const pick = (status) => list.filter((a) => a.status === status).sort(byToken);
    return {
      all: list,
      active: pick('in-progress'),
      waiting: pick('booked'),
      completed: pick('completed'),
      missed: pick('missed'),
      cancelled: pick('cancelled'),
    };
  }, [appointments.data]);

  const updateStatus = useCallback(
    async (appointment, status, successMessage) => {
      setBusyId(appointment._id);
      try {
        await appointmentService.updateStatus(appointment._id, status);
        toast.success(successMessage || 'Updated.');
        await appointments.reload({ silent: true });
        return true;
      } catch (err) {
        toast.error(errorMessage(err, 'Could not update the appointment.'));
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [appointments, toast]
  );

  const start = useCallback(
    (appointment) => {
      if (groups.active.length > 0) {
        toast.warning('Please finish the current patient before calling the next one.');
        return Promise.resolve(false);
      }
      return updateStatus(appointment, 'in-progress', `Token #${appointment.tokenNumber} is now with the doctor.`);
    },
    [groups.active.length, toast, updateStatus]
  );

  const callNext = useCallback(() => {
    const next = groups.waiting[0];
    if (!next) {
      toast.info('No more patients are waiting.');
      return Promise.resolve(false);
    }
    return start(next);
  }, [groups.waiting, start, toast]);

  const complete = useCallback(
    (appointment) => updateStatus(appointment, 'completed', `Token #${appointment.tokenNumber} marked as completed.`),
    [updateStatus]
  );
  const markMissed = useCallback(
    (appointment) => updateStatus(appointment, 'missed', `Token #${appointment.tokenNumber} marked as absent.`),
    [updateStatus]
  );

  return {
    doctor,
    profile,
    appointments,
    groups,
    connected,
    busyId,
    start,
    callNext,
    complete,
    markMissed,
    refresh: () => appointments.reload({ silent: true }),
  };
}
