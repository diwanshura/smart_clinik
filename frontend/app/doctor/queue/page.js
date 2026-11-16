'use client';

import { useState } from 'react';
import { RefreshCw, Settings, Siren, Users } from 'lucide-react';
import { useDoctorQueue } from '@/hooks/useDoctorQueue';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { FilterTabs } from '@/components/common/FilterTabs';
import { TextField } from '@/components/common/FormFields';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { EmergencyModal } from '@/components/doctor/EmergencyModal';
import { NotesModal } from '@/components/doctor/NotesModal';
import { PatientRow } from '@/components/doctor/PatientRow';
import { toDateInputValue } from '@/lib/utils';

const FILTERS = [
  { value: 'all', label: 'Everyone' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'active', label: 'With doctor' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function DoctorQueuePage() {
  const [date, setDate] = useState(() => toDateInputValue());
  const [filter, setFilter] = useState('all');
  const [notesFor, setNotesFor] = useState(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const q = useDoctorQueue(date);
  const { doctor, profile, appointments, groups } = q;

  if (profile.loading) return <LoadingBlock label="Loading your clinic…" />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.reload} />;
  if (!doctor) {
    return (
      <Card>
        <EmptyState
          icon={Settings}
          title="Finish setting up your profile"
          text="Your queue appears here once your profile is complete."
          action={<ButtonLink href="/doctor/settings">Complete my profile</ButtonLink>}
        />
      </Card>
    );
  }

  // "All" lists the active patient first, then waiting, then finished visits.
  const list =
    filter === 'all'
      ? [...groups.active, ...groups.waiting, ...groups.completed, ...groups.missed, ...groups.cancelled]
      : groups[filter];
  const hasActive = groups.active.length > 0;

  return (
    <>
      <PageHeader
        title="Patient queue"
        subtitle="Start, finish and add notes for each patient"
        actions={
          <>
            <LiveIndicator connected={q.connected} />
            <Button variant="danger" icon={Siren} onClick={() => setEmergencyOpen(true)}>
              Add emergency
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <FilterTabs label="Filter patients" options={FILTERS} value={filter} onChange={setFilter} />
          <div className="flex items-end gap-3">
            <TextField label="Date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
            <Button variant="secondary" icon={RefreshCw} onClick={q.refresh} aria-label="Refresh queue">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {appointments.loading && !appointments.data ? (
        <LoadingBlock label="Loading patients…" />
      ) : appointments.error ? (
        <ErrorState error={appointments.error} onRetry={appointments.reload} />
      ) : list.length === 0 ? (
        <EmptyState icon={Users} title="No patients here" text="Nothing matches this day and filter." />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((a) => (
            <PatientRow
              key={a._id}
              appointment={a}
              busy={q.busyId === a._id}
              canStart={!hasActive}
              onStart={q.start}
              onComplete={q.complete}
              onMissed={q.markMissed}
              onNotes={setNotesFor}
            />
          ))}
        </ul>
      )}

      <NotesModal appointment={notesFor} onClose={() => setNotesFor(null)} onSaved={q.refresh} />
      <EmergencyModal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        doctorId={doctor._id}
        date={date}
        onAdded={q.refresh}
      />
    </>
  );
}
