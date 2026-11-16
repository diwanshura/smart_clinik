'use client';

import { useEffect, useState } from 'react';
import { Search, Stethoscope, UserPlus } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/adminService';
import { doctorService } from '@/services/doctorService';
import { errorMessage } from '@/services/api';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { TextField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { cn, doctorDisplayName } from '@/lib/utils';

function AddDoctorModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ specialization: '', qualification: '', experience: 0, consultationFee: 0, slotDuration: 15, start: '09:00', end: '17:00' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await adminService.patients({ search: term, limit: 8 });
        if (!cancelled) setResults(data.patients || []);
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err, 'Search failed.'));
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, toast]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!selected) return toast.warning('Please choose a registered user first.');
    if (!form.specialization.trim()) return toast.warning('Please enter a speciality.');
    setSaving(true);
    try {
      await doctorService.create({
        userId: selected._id,
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim() || undefined,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        slotDuration: Number(form.slotDuration) || 15,
        workingHours: { start: form.start, end: form.end },
      });
      toast.success(`${selected.name} is now a doctor.`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the doctor profile.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a doctor" size="lg">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <TextField
            label="Find the registered user"
            hint="The person must already have a patient account. Search by name, email or phone."
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            autoComplete="off"
          />
          {results.length > 0 ? (
            <ul className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    aria-pressed={selected?._id === p._id}
                    onClick={() => setSelected(p)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left',
                      selected?._id === p._id ? 'border-brand-700 bg-brand-50' : 'border-slate-200 hover:border-brand-600'
                    )}
                  >
                    <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block truncate text-sm text-slate-600">{p.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Speciality" value={form.specialization} onChange={set('specialization')} placeholder="Cardiologist" required />
          <TextField label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD" />
          <TextField label="Experience (years)" type="number" min="0" value={form.experience} onChange={set('experience')} />
          <TextField label="Fee (₹)" type="number" min="0" value={form.consultationFee} onChange={set('consultationFee')} />
          <TextField label="Start time" type="time" value={form.start} onChange={set('start')} />
          <TextField label="End time" type="time" value={form.end} onChange={set('end')} />
          <TextField label="Minutes per patient" type="number" min="5" max="60" value={form.slotDuration} onChange={set('slotDuration')} />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" icon={UserPlus} loading={saving} disabled={!selected}>
            Create doctor
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminDoctorsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(() => doctorService.listAll(), []);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function toggleAvailability(doctor) {
    setBusyId(doctor._id);
    try {
      await doctorService.update(doctor._id, { isAvailable: !doctor.isAvailable });
      toast.success(
        `${doctorDisplayName(doctor)} is ${doctor.isAvailable ? 'hidden from' : 'now visible on'} the booking page.`
      );
      await reload({ silent: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the doctor.'));
    } finally {
      setBusyId(null);
    }
  }

  const doctors = data?.doctors || [];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Manage who can be booked"
        actions={
          <Button icon={UserPlus} onClick={() => setAdding(true)}>
            Add doctor
          </Button>
        }
      />

      {loading && !data ? (
        <LoadingBlock label="Loading doctors…" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState icon={Stethoscope} title="No doctors yet" text="Add your first doctor to open bookings." />
        </Card>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {doctors.map((d) => (
            <li key={d._id}>
              <Card className="flex h-full flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar name={d.userId?.name} size="md" tone="ink" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-ink-900">{doctorDisplayName(d)}</p>
                  <p className="text-slate-700">
                    {d.specialization}
                    {d.experience ? ` · ${d.experience} yrs` : ''}
                  </p>
                  <p className="text-sm text-slate-600">
                    {d.workingHours?.start}–{d.workingHours?.end} · {d.slotDuration} min slots · ₹{d.consultationFee || 0}
                  </p>
                  <p className="truncate text-sm text-slate-600">{d.userId?.email}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Badge tone={d.isAvailable ? 'success' : 'neutral'}>{d.isAvailable ? 'Accepting bookings' : 'Hidden'}</Badge>
                  <Button size="sm" variant="secondary" loading={busyId === d._id} onClick={() => toggleAvailability(d)}>
                    {d.isAvailable ? 'Hide from booking' : 'Show in booking'}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AddDoctorModal open={adding} onClose={() => setAdding(false)} onCreated={() => reload({ silent: true })} />
    </>
  );
}
