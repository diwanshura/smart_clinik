'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { doctorService } from '@/services/doctorService';
import { errorMessage } from '@/services/api';
import { WEEKDAYS } from '@/lib/constants';
import { cn, doctorName } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { ErrorState } from '@/components/common/EmptyState';
import { Switch, TextField, TextareaField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';

const EMPTY = {
  specialization: '',
  qualification: '',
  experience: 0,
  consultationFee: 0,
  bio: '',
  slotDuration: 15,
  maxPatientsPerDay: 30,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  start: '09:00',
  end: '17:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  isAvailable: true,
};

function fromDoctor(d) {
  if (!d) return EMPTY;
  return {
    specialization: d.specialization || '',
    qualification: d.qualification || '',
    experience: d.experience ?? 0,
    consultationFee: d.consultationFee ?? 0,
    bio: d.bio || '',
    slotDuration: d.slotDuration || 15,
    maxPatientsPerDay: d.maxPatientsPerDay || 30,
    workingDays: d.workingDays || EMPTY.workingDays,
    start: d.workingHours?.start || '09:00',
    end: d.workingHours?.end || '17:00',
    breakStart: d.breakTime?.start || '',
    breakEnd: d.breakTime?.end || '',
    isAvailable: d.isAvailable !== false,
  };
}

export default function DoctorSettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    () =>
      doctorService.me().catch((err) => {
        if (err?.status === 404) return { doctor: null };
        throw err;
      }),
    []
  );
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(fromDoctor(data.doctor));
  }, [data]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day) ? f.workingDays.filter((d) => d !== day) : [...f.workingDays, day],
    }));

  async function handleSubmit(e) {
    e.preventDefault();
    const found = {};
    if (!form.specialization.trim()) found.specialization = 'Please enter your speciality.';
    if (form.workingDays.length === 0) found.workingDays = 'Choose at least one working day.';
    if (form.start >= form.end) found.end = 'Finishing time must be after the starting time.';
    const dur = Number(form.slotDuration);
    if (!(dur >= 5 && dur <= 60)) found.slotDuration = 'Choose between 5 and 60 minutes.';
    if (Boolean(form.breakStart) !== Boolean(form.breakEnd)) found.breakEnd = 'Set both break times, or leave both empty.';
    else if (form.breakStart && form.breakStart >= form.breakEnd) found.breakEnd = 'Break must end after it starts.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await doctorService.saveMe({
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim() || undefined,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        bio: form.bio.trim() || undefined,
        slotDuration: dur,
        maxPatientsPerDay: Number(form.maxPatientsPerDay) || 30,
        workingDays: form.workingDays,
        workingHours: { start: form.start, end: form.end },
        // Empty strings clear the break (the slot generator treats them as "no break").
        breakTime: { start: form.breakStart, end: form.breakEnd },
        isAvailable: form.isAvailable,
      });
      toast.success('Your clinic settings are saved.');
      reload({ silent: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your settings.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <LoadingBlock label="Loading your settings…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Clinic settings"
        subtitle={`${doctorName(user?.name)} — your professional details and working hours`}
      />
      {!data?.doctor ? (
        <p role="status" className="mb-6 rounded-xl bg-amber-100 px-4 py-3 text-lg text-amber-900">
          Your doctor profile is not complete yet. Fill in the form below to start receiving appointments.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Professional details" />
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Speciality" placeholder="e.g. Cardiologist" value={form.specialization} onChange={set('specialization')} error={errors.specialization} required />
              <TextField label="Qualification" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={set('qualification')} />
              <TextField label="Experience (years)" type="number" min="0" value={form.experience} onChange={set('experience')} />
              <TextField label="Consultation fee (₹)" type="number" min="0" value={form.consultationFee} onChange={set('consultationFee')} />
            </div>
            <TextareaField label="About you" hint="Shown to patients when they choose a doctor." value={form.bio} onChange={set('bio')} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Availability" />
          <div className="flex flex-col gap-5">
            <Switch
              checked={form.isAvailable}
              onChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
              label="Accepting new appointments"
              description="Turn off to hide yourself from the booking page (e.g. on leave)."
            />

            <fieldset>
              <legend className="mb-2 text-base font-semibold">Working days</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {WEEKDAYS.map((day) => {
                  const on = form.workingDays.includes(day);
                  return (
                    <label
                      key={day}
                      className={cn(
                        'flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 font-semibold',
                        'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600',
                        on ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-slate-300 bg-white text-slate-700'
                      )}
                    >
                      <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={on} onChange={() => toggleDay(day)} />
                      {day}
                    </label>
                  );
                })}
              </div>
              {errors.workingDays ? <p className="mt-2 text-sm font-medium text-red-700">{errors.workingDays}</p> : null}
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <TextField label="Start time" type="time" value={form.start} onChange={set('start')} required />
              <TextField label="End time" type="time" value={form.end} onChange={set('end')} error={errors.end} required />
              <TextField label="Break starts" type="time" value={form.breakStart} onChange={set('breakStart')} />
              <TextField label="Break ends" type="time" value={form.breakEnd} onChange={set('breakEnd')} error={errors.breakEnd} />
              <TextField label="Minutes per patient" type="number" min="5" max="60" value={form.slotDuration} onChange={set('slotDuration')} error={errors.slotDuration} />
              <TextField label="Max patients per day" type="number" min="1" value={form.maxPatientsPerDay} onChange={set('maxPatientsPerDay')} />
            </div>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => { setForm(fromDoctor(data?.doctor)); setErrors({}); }} disabled={saving}>
            Reset changes
          </Button>
          <Button type="submit" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>
    </>
  );
}
