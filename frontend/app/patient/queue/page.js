'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Stethoscope } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { doctorService } from '@/services/doctorService';
import { queueService } from '@/services/queueService';
import { appointmentService } from '@/services/appointmentService';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { SelectField, TextField } from '@/components/common/FormFields';
import { QueueView } from '@/components/queue/QueueView';
import { doctorDisplayName, toDateInputValue } from '@/lib/utils';

function PatientQueue() {
  const router = useRouter();
  const params = useSearchParams();

  const [doctorId, setDoctorId] = useState(params.get('doctorId') || '');
  const [date, setDate] = useState(params.get('date') || toDateInputValue());
  // When the page is opened without a doctor, jump to the patient's next booked visit.
  const [autoPicked, setAutoPicked] = useState(!!params.get('doctorId'));

  const doctors = useAsyncData(() => doctorService.list(), []);

  useEffect(() => {
    if (autoPicked) return;
    let cancelled = false;
    appointmentService
      .mine({ status: 'booked', limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const next = (res.appointments || []).sort(
          (a, b) => a.date.localeCompare(b.date) || String(a.slotTime).localeCompare(String(b.slotTime))
        )[0];
        if (next) {
          setDoctorId(next.doctorId?._id || '');
          setDate(next.date);
        }
      })
      .catch(() => {
        /* picking a doctor manually still works */
      })
      .finally(() => !cancelled && setAutoPicked(true));
    return () => {
      cancelled = true;
    };
  }, [autoPicked]);

  const queue = useAsyncData(() => queueService.status({ doctorId, date }), [doctorId, date], {
    enabled: !!doctorId && !!date,
  });

  const { connected } = useQueueSocket({
    date,
    doctorId,
    enabled: !!doctorId && !!date,
    onUpdate: () => queue.reload({ silent: true }),
  });

  // Keep the address bar shareable without adding history entries.
  useEffect(() => {
    if (!doctorId) return;
    router.replace(`/patient/queue?doctorId=${doctorId}&date=${date}`, { scroll: false });
  }, [doctorId, date, router]);

  const doctorList = doctors.data?.doctors || [];

  return (
    <>
      <PageHeader
        title="Live queue"
        subtitle="Follow the queue in real time — no need to call the clinic."
        actions={doctorId ? <LiveIndicator connected={connected} /> : null}
      />

      <Card className="mb-6">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_14rem_auto]">
          <SelectField label="Doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} disabled={doctors.loading}>
            <option value="">{doctors.loading ? 'Loading doctors…' : 'Select a doctor'}</option>
            {doctorList.map((d) => (
              <option key={d._id} value={d._id}>
                {doctorDisplayName(d)} — {d.specialization}
              </option>
            ))}
          </SelectField>
          <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={!doctorId}
            loading={queue.loading && !!queue.data}
            onClick={() => queue.reload()}
          >
            Refresh
          </Button>
        </div>
        {doctors.error ? <p className="mt-3 text-red-700">Could not load the doctor list. Please refresh the page.</p> : null}
      </Card>

      {!doctorId ? (
        <EmptyState
          icon={Stethoscope}
          title="Choose a doctor to see the queue"
          text="Select a doctor and a date above."
        />
      ) : queue.loading && !queue.data ? (
        <LoadingBlock label="Loading the queue…" />
      ) : queue.error ? (
        <ErrorState error={queue.error} onRetry={queue.reload} />
      ) : queue.data ? (
        <QueueView queue={queue.data.queueStatus} />
      ) : null}
    </>
  );
}

export default function PatientQueuePage() {
  // useSearchParams() requires a Suspense boundary for static prerendering.
  return (
    <Suspense fallback={<LoadingBlock label="Loading…" />}>
      <PatientQueue />
    </Suspense>
  );
}
