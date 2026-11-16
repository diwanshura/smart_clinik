'use client';

import { Clock, ListOrdered, XCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/Badge';
import { cn, doctorDisplayName, formatTime, parseDateString } from '@/lib/utils';

export function DateBox({ date, className }) {
  const d = parseDateString(date);
  return (
    <div
      className={cn(
        'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-indigo-950 text-white shadow-sm',
        className
      )}
      aria-hidden="true"
    >
      <span className="text-lg font-black leading-none">{d ? d.getDate() : '–'}</span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
        {d ? d.toLocaleString('en-US', { month: 'short' }) : ''}
      </span>
    </div>
  );
}

export function canTrack(appointment) {
  return ['booked', 'in-progress'].includes(appointment.status);
}

export function queueHref(appointment) {
  const doctorId = appointment.doctorId?._id || appointment.doctorId;
  return `/patient/queue?doctorId=${doctorId}&date=${appointment.date}`;
}

/**
 * One appointment as a modern card.
 */
export function AppointmentCard({ appointment, onOpen, onCancel, showActions = true }) {
  const active = canTrack(appointment);
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-all duration-150 hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:p-5">
      <button
        type="button"
        onClick={() => onOpen?.(appointment)}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-xl text-left"
        aria-label={`View details: ${doctorDisplayName(appointment.doctorId)} on ${appointment.date}`}
      >
        <DateBox date={appointment.date} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-slate-900">
            {doctorDisplayName(appointment.doctorId)}
          </span>
          {appointment.doctorId?.specialization ? (
            <span className="block text-xs font-medium text-slate-500">{appointment.doctorId.specialization}</span>
          ) : null}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {formatTime(appointment.slotTime)}
            </span>
            <span className="rounded-md border border-blue-200/80 bg-blue-50/80 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              Token #{appointment.tokenNumber}
            </span>
          </span>
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
        <StatusBadge status={appointment.status} />
        {showActions && active ? (
          <>
            <ButtonLink href={queueHref(appointment)} variant="secondary" size="sm" icon={ListOrdered}>
              Track queue
            </ButtonLink>
            {appointment.status === 'booked' && onCancel ? (
              <Button variant="danger" size="sm" icon={XCircle} onClick={() => onCancel(appointment)}>
                Cancel
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
