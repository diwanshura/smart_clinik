'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardList, Clock, ListOrdered, Megaphone, Settings, SkipForward, Users, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDoctorQueue } from '@/hooks/useDoctorQueue';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { NotesModal } from '@/components/doctor/NotesModal';
import { PatientRow } from '@/components/doctor/PatientRow';
import { doctorName, formatLongDate, toDateInputValue } from '@/lib/utils';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [today] = useState(() => toDateInputValue());
  const q = useDoctorQueue(today);
  const [notesFor, setNotesFor] = useState(null);

  const { doctor, profile, appointments, groups } = q;
  const current = groups.active[0] || null;
  const upNext = groups.waiting.slice(0, 5);

  if (profile.loading) return <LoadingBlock label="Loading your clinic…" />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.reload} />;

  if (!doctor) {
    return (
      <Card>
        <EmptyState
          icon={Settings}
          title="Finish setting up your profile"
          text="Add your speciality and working hours so patients can book appointments with you."
          action={<ButtonLink href="/doctor/settings">Complete my profile</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={doctorName(user?.name)}
        subtitle={`${doctor.specialization} · ${formatLongDate(today)}`}
        actions={<LiveIndicator connected={q.connected} />}
      />

      {appointments.loading && !appointments.data ? (
        <LoadingBlock label="Loading today’s patients…" />
      ) : appointments.error ? (
        <ErrorState error={appointments.error} onRetry={appointments.reload} />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Clock} label="Waiting" value={groups.waiting.length} tone="gold" />
            <StatCard icon={CheckCircle2} label="Completed" value={groups.completed.length} tone="teal" />
            <StatCard icon={XCircle} label="Missed" value={groups.missed.length} tone="red" />
            <StatCard icon={ClipboardList} label="Total today" value={groups.all.length} tone="blue" />
          </div>

          <section aria-label="Now serving" className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Currently Consulting
                </span>
                <p className="my-2 font-display text-6xl font-black text-amber-300 sm:text-7xl">
                  {current ? `#${current.tokenNumber}` : '—'}
                </p>
                <p className="text-base font-semibold text-white/90">{current ? current.userId?.name || 'Patient' : 'No active patient in room'}</p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
                {current ? (
                  <>
                    <Button variant="emerald" icon={CheckCircle2} loading={q.busyId === current._id} onClick={() => q.complete(current)}>
                      Complete visit
                    </Button>
                    <Button variant="dark" icon={SkipForward} disabled={q.busyId === current._id} onClick={() => q.markMissed(current)}>
                      Mark absent
                    </Button>
                  </>
                ) : (
                  <Button icon={Megaphone} size="lg" disabled={groups.waiting.length === 0} onClick={q.callNext}>
                    Call next patient
                  </Button>
                )}
              </div>
            </div>
          </section>

          <Card>
            <CardHeader
              title="Up next"
              subtitle={`${groups.waiting.length} waiting`}
              action={
                <ButtonLink href="/doctor/queue" variant="secondary" size="sm" icon={ListOrdered}>
                  Full queue
                </ButtonLink>
              }
            />
            {upNext.length === 0 ? (
              <EmptyState icon={Users} title="No one is waiting" text="New bookings appear here instantly." />
            ) : (
              <ul className="flex flex-col gap-3">
                {upNext.map((a) => (
                  <PatientRow
                    key={a._id}
                    appointment={a}
                    busy={q.busyId === a._id}
                    canStart={!current}
                    onStart={q.start}
                    onComplete={q.complete}
                    onMissed={q.markMissed}
                    onNotes={setNotesFor}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <NotesModal appointment={notesFor} onClose={() => setNotesFor(null)} onSaved={q.refresh} />
    </>
  );
}
