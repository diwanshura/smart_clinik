'use client';

import { AlertCircle, CheckCircle2, Phone, Play, SkipForward, StickyNote } from 'lucide-react';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { cn, formatTime } from '@/lib/utils';

/** One patient in the doctor's queue, with the actions that make sense for their status. */
export function PatientRow({ appointment: a, busy, canStart, onStart, onComplete, onMissed, onNotes }) {
  const active = a.status === 'in-progress';
  return (
    <li
      className={cn(
        'flex flex-col gap-4 rounded-2xl border-2 bg-white p-4 sm:flex-row sm:items-center sm:p-5',
        active ? 'border-brand-700 bg-brand-50' : 'border-transparent shadow-card',
        a.status === 'cancelled' && 'opacity-70'
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white',
          active ? 'bg-brand-700' : a.isEmergency ? 'bg-red-700' : 'bg-ink-800'
        )}
        aria-label={`Token ${a.tokenNumber}`}
      >
        #{a.tokenNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink-900">
          {a.userId?.name || 'Patient'}
          {a.isEmergency ? (
            <Badge tone="danger">
              <AlertCircle className="h-4 w-4" aria-hidden="true" /> Emergency
            </Badge>
          ) : null}
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-700">
          <span>{formatTime(a.slotTime)}</span>
          {a.userId?.phone ? (
            <a href={`tel:${a.userId.phone}`} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {a.userId.phone}
            </a>
          ) : null}
        </p>
        {a.symptoms ? <p className="mt-1 line-clamp-2 text-sm text-slate-600">Reason: {a.symptoms}</p> : null}
        {a.notes ? <p className="mt-1 line-clamp-2 text-sm text-brand-800">Notes: {a.notes}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <StatusBadge status={a.status} />
        {a.status === 'booked' ? (
          <Button size="sm" icon={Play} loading={busy} disabled={!canStart} onClick={() => onStart(a)}>
            Start
          </Button>
        ) : null}
        {active ? (
          <>
            <Button size="sm" icon={CheckCircle2} loading={busy} onClick={() => onComplete(a)}>
              Done
            </Button>
            <Button size="sm" variant="secondary" icon={SkipForward} disabled={busy} onClick={() => onMissed(a)}>
              Absent
            </Button>
          </>
        ) : null}
        {a.status !== 'cancelled' ? (
          <Button size="sm" variant="ghost" icon={StickyNote} onClick={() => onNotes(a)} aria-label={`Notes for ${a.userId?.name || 'patient'}`}>
            Notes
          </Button>
        ) : null}
      </div>
    </li>
  );
}
