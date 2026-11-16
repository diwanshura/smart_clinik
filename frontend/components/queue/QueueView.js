'use client';

import { Activity, Clock, Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatTime } from '@/lib/utils';

/** Everything the patient sees for one doctor/day queue. `queue` is `queueStatus` from GET /queue/status. */
export function QueueView({ queue }) {
  const mine = queue.userAppointment;
  const serving = queue.currentlyServing;

  return (
    <div className="flex flex-col gap-6">
      {mine ? (
        <section
          aria-label="Your place in the queue"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 text-white shadow-xl sm:flex sm:items-center sm:gap-6 sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />

          <div className="relative flex h-22 w-22 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Your token</span>
            <span className="font-display text-3xl font-black leading-none text-white sm:text-4xl">
              #{mine.tokenNumber}
            </span>
          </div>

          <div className="relative mt-4 flex-1 sm:mt-0 text-center sm:text-left">
            {mine.status === 'booked' ? (
              <>
                <p className="text-xl font-extrabold sm:text-2xl">
                  {mine.position <= 1
                    ? '✨ You are next in line!'
                    : `${mine.position - 1} ${mine.position - 1 === 1 ? 'patient' : 'patients'} ahead of you`}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  Scheduled for {formatTime(mine.slotTime)} · Keep this tab open for live turn alert
                </p>
              </>
            ) : mine.status === 'in-progress' ? (
              <>
                <p className="text-xl font-extrabold text-emerald-200 sm:text-2xl">
                  🔔 It is your turn — Please enter the doctor's room!
                </p>
                <p className="mt-1 text-sm text-white/90">Your appointment is currently in progress.</p>
              </>
            ) : (
              <p className="text-xl font-bold">
                Your visit status: <span className="capitalize">{mine.status.replace('-', ' ')}</span>
              </p>
            )}
          </div>

          {mine.status === 'booked' ? (
            <div className="relative mt-4 shrink-0 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-sm sm:mt-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">Estimated wait</p>
              <p className="font-display text-3xl font-extrabold leading-tight text-white">
                {mine.estimatedWaitMinutes || 0}
              </p>
              <p className="text-xs text-blue-100">minutes</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Digital Now Serving Cockpit */}
          <section
            aria-label="Now serving"
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-8 text-center text-white shadow-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Now Serving
            </div>

            <p
              className="my-3 font-display text-7xl font-black tracking-tight text-amber-300 sm:text-8xl"
              aria-live="polite"
            >
              {serving ? `#${serving.tokenNumber}` : '—'}
            </p>

            <p className="text-sm font-medium text-slate-300">
              {serving ? `Scheduled time: ${formatTime(serving.slotTime)}` : 'No patient is with the doctor right now'}
            </p>
          </section>

          <Card>
            <CardHeader title="Queue Overview" subtitle="Live statistics for today's roster" />
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Waiting in line', value: queue.totalWaiting, bg: 'bg-amber-50 text-amber-800 border-amber-200/60' },
                { label: 'Completed', value: queue.totalCompleted, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60' },
                { label: 'Missed / Absent', value: queue.totalMissed, bg: 'bg-rose-50 text-rose-800 border-rose-200/60' },
                { label: 'Minutes per visit', value: `${queue.slotDuration}m`, bg: 'bg-blue-50 text-blue-800 border-blue-200/60' },
              ].map((item) => (
                <div key={item.label} className={cn('rounded-2xl border p-4 text-center', item.bg)}>
                  <dd className="font-display text-2xl font-black">{item.value ?? 0}</dd>
                  <dt className="mt-1 text-xs font-semibold uppercase tracking-wider">{item.label}</dt>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Waiting List"
            subtitle="Patients ordered by token number"
            action={<Badge tone="info">{queue.totalWaiting} waiting</Badge>}
          />
          {queue.waitingList.length === 0 ? (
            <EmptyState icon={Users} title="No one is waiting" text="The queue is clear right now." />
          ) : (
            <ol className="flex flex-col gap-2.5">
              {queue.waitingList.map((w, i) => (
                <li
                  key={w.tokenNumber}
                  className={cn(
                    'flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all',
                    w.isCurrentUser
                      ? 'border-blue-500/80 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm',
                      w.isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                    )}
                    aria-hidden="true"
                  >
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        Token #{w.tokenNumber}
                      </p>
                      {w.isCurrentUser ? <Badge tone="success">You</Badge> : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Approx. {w.estimatedWaitMinutes} min wait</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
