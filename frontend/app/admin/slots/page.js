'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/adminService';
import { doctorService } from '@/services/doctorService';
import { errorMessage } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ErrorState } from '@/components/common/EmptyState';
import { SelectField, TextField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { doctorDisplayName, formatDate, formatTime, toDateInputValue } from '@/lib/utils';

export default function AdminSlotsPage() {
  const toast = useToast();
  const doctors = useAsyncData(() => doctorService.listAll(), []);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(() => toDateInputValue());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function generate(e) {
    e.preventDefault();
    if (!doctorId || !date) return toast.warning('Please choose a doctor and a date.');
    setBusy(true);
    try {
      const data = await adminService.generateSlots({ doctorId, date });
      setResult({ date, slots: data.slots || [] });
      toast.success(data.message || 'Slots generated.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not generate slots.'));
    } finally {
      setBusy(false);
    }
  }

  if (doctors.loading && !doctors.data) return <LoadingBlock label="Loading doctors…" />;
  if (doctors.error) return <ErrorState error={doctors.error} onRetry={doctors.reload} />;

  return (
    <>
      <PageHeader
        title="Time slots"
        subtitle="Rebuild a doctor’s bookable times for a day. Slots that are already booked are kept."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[24rem_1fr]">
        <Card>
          <form onSubmit={generate} className="flex flex-col gap-5">
            <SelectField label="Doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
              <option value="">Select a doctor</option>
              {(doctors.data?.doctors || []).map((d) => (
                <option key={d._id} value={d._id}>
                  {doctorDisplayName(d)} — {d.specialization}
                </option>
              ))}
            </SelectField>
            <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Button type="submit" icon={CalendarClock} loading={busy} full>
              Generate slots
            </Button>
          </form>
        </Card>

        {result ? (
          <Card>
            <h2 className="mb-4 text-xl">
              {result.slots.length} slots for {formatDate(result.date)}
            </h2>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
              {result.slots.map((s) => (
                <li key={s._id} className="rounded-lg bg-brand-50 px-2 py-2 text-center font-semibold text-brand-800">
                  {formatTime(s.startTime)}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
