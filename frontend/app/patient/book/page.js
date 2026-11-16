'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Check, CheckCircle2, ListOrdered, Stethoscope } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { useToast } from '@/context/ToastContext';
import { doctorService } from '@/services/doctorService';
import { slotService } from '@/services/slotService';
import { appointmentService } from '@/services/appointmentService';
import { errorMessage } from '@/services/api';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { TextareaField } from '@/components/common/FormFields';
import { queueHref } from '@/components/patient/AppointmentCard';
import {
  addDays,
  cn,
  doctorDisplayName,
  formatDate,
  formatLongDate,
  formatTime,
  isPastSlot,
  toDateInputValue,
  weekdayName,
} from '@/lib/utils';

const STEPS = ['Doctor', 'Date', 'Time', 'Confirm'];
const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAYS_AHEAD = 14;

function StepIndicator({ current }) {
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border-t-4 px-2 py-3 text-center text-xs sm:text-sm font-bold transition-all duration-200',
              done && 'border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-sm',
              active && 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-sm ring-2 ring-blue-500/20',
              !done && !active && 'border-slate-200 bg-white/70 text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                done ? 'bg-emerald-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
            </span>
            {label}
            {done ? <span className="sr-only"> (done)</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <dt className="text-white/70">{label}</dt>
      <dd className="text-right font-semibold text-white">{value || '—'}</dd>
    </div>
  );
}

export default function BookAppointmentPage() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);
  const headingRef = useRef(null);

  const doctors = useAsyncData(() => doctorService.list(), []);

  const slotsEnabled = step === 3 && !!doctor && !!date;
  const slots = useAsyncData(() => slotService.list({ doctorId: doctor._id, date }), [doctor?._id, date], {
    enabled: slotsEnabled,
  });

  // Other patients booking at the same time -> refresh availability instantly.
  const { connected } = useQueueSocket({
    date,
    doctorId: doctor?._id,
    enabled: slotsEnabled,
    onUpdate: () => slots.reload({ silent: true }),
  });

  const visibleSlots = useMemo(
    () => (slots.data?.slots || []).filter((s) => s.startTime !== 'EMERGENCY'),
    [slots.data]
  );

  // If the slot we picked gets taken by someone else, say so and let the person choose again.
  useEffect(() => {
    if (!slot) return;
    const latest = visibleSlots.find((s) => s._id === slot._id);
    if (latest && (latest.isBooked || latest.isBlocked)) {
      setSlot(null);
      toast.warning('That time was just taken. Please choose another.');
    }
  }, [visibleSlots, slot, toast]);

  // Move keyboard / screen-reader focus to the new step heading.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true; // don't steal focus on first load
      return;
    }
    headingRef.current?.focus();
  }, [step, booked]);

  const dates = useMemo(() => {
    if (!doctor) return [];
    const workingDays = doctor.workingDays?.length ? doctor.workingDays : DEFAULT_DAYS;
    const today = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = addDays(today, i);
      return {
        value: toDateInputValue(d),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        full: formatLongDate(d),
        isToday: i === 0,
        open: workingDays.includes(weekdayName(d)),
      };
    });
  }, [doctor]);

  function chooseDoctor(d) {
    if (doctor?._id !== d._id) {
      setDate('');
      setSlot(null);
    }
    setDoctor(d);
    setStep(2);
  }

  function chooseDate(value) {
    if (value !== date) setSlot(null);
    setDate(value);
    setStep(3);
  }

  function chooseSlot(s) {
    setSlot(s);
    setStep(4);
  }

  async function confirmBooking() {
    setBooking(true);
    try {
      const data = await appointmentService.book({
        doctorId: doctor._id,
        slotId: slot._id,
        date,
        symptoms: symptoms.trim() || undefined,
      });
      setBooked(data.appointment);
      toast.success('Your appointment is booked!');
    } catch (err) {
      const message = errorMessage(err, 'Booking failed. Please try again.');
      toast.error(message);
      if (/no longer available/i.test(message)) {
        // Slot was taken in the meantime: go back and refresh the list.
        setSlot(null);
        setStep(3);
        slots.reload({ silent: true });
      }
    } finally {
      setBooking(false);
    }
  }

  function startOver() {
    setBooked(null);
    setDoctor(null);
    setDate('');
    setSlot(null);
    setSymptoms('');
    setStep(1);
    doctors.reload({ silent: true });
  }

  /* ───────────── success screen ───────────── */
  if (booked) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-800">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </span>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl text-ink-900 outline-none">
            Appointment booked!
          </h1>
          <p className="mt-2 text-lg text-slate-700">Your token number is</p>
          <p className="mx-auto my-4 flex h-28 w-28 items-center justify-center rounded-full bg-brand-700 font-display text-5xl text-white shadow-pop">
            #{booked.tokenNumber}
          </p>
          <p className="text-lg text-slate-700">
            {formatLongDate(booked.date)} at <strong>{formatTime(booked.slotTime)}</strong>
            <br />
            with <strong>{doctorDisplayName(doctor)}</strong>
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href={queueHref({ ...booked, doctorId: doctor._id })} icon={ListOrdered} size="lg" full>
              Track my place in the queue
            </ButtonLink>
            <ButtonLink href="/patient/appointments" variant="secondary" full>
              View my appointments
            </ButtonLink>
            <Button variant="ghost" onClick={startOver}>
              Book another visit
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ───────────── wizard ───────────── */
  const anySelectable = visibleSlots.some(
    (s) => !s.isBooked && !s.isBlocked && !isPastSlot(date, s.startTime)
  );

  return (
    <>
      <PageHeader title="Book an appointment" subtitle="Choose a doctor, a day and a time. It takes about a minute." />
      <StepIndicator current={step} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {/* STEP 1 - doctor */}
          {step === 1 ? (
            <Card>
              <CardHeader title="Step 1 · Choose a doctor" />
              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                Choose a doctor
              </h2>
              {doctors.loading ? (
                <LoadingBlock label="Loading doctors…" />
              ) : doctors.error ? (
                <ErrorState error={doctors.error} onRetry={doctors.reload} />
              ) : (doctors.data?.doctors || []).length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="No doctors are available right now"
                  text="Please check again a little later."
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {doctors.data.doctors.map((d) => (
                    <li key={d._id}>
                      <button
                        type="button"
                        onClick={() => chooseDoctor(d)}
                        aria-pressed={doctor?._id === d._id}
                        className={cn(
                          'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors',
                          doctor?._id === d._id
                            ? 'border-brand-700 bg-brand-50'
                            : 'border-slate-200 bg-white hover:border-brand-600 hover:bg-brand-50/60'
                        )}
                      >
                        <Avatar name={d.userId?.name} size="md" tone="ink" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-semibold text-ink-900">{doctorDisplayName(d)}</span>
                          <span className="block text-base text-slate-700">
                            {d.specialization}
                            {d.qualification ? ` · ${d.qualification}` : ''}
                          </span>
                          <span className="block text-sm text-slate-600">
                            {d.experience ? `${d.experience} years of experience` : 'Experienced clinician'}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                          {d.consultationFee ? `₹${d.consultationFee}` : 'Free'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}

          {/* STEP 2 - date */}
          {step === 2 ? (
            <Card>
              <CardHeader
                title="Step 2 · Choose a day"
                action={
                  <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep(1)}>
                    Back
                  </Button>
                }
              />
              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                Choose a day
              </h2>
              <p className="mb-4 text-slate-700">
                {doctorDisplayName(doctor)} sees patients on{' '}
                <strong>{(doctor.workingDays?.length ? doctor.workingDays : DEFAULT_DAYS).join(', ')}</strong>.
              </p>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7">
                {dates.map((d) => (
                  <li key={d.value}>
                    <button
                      type="button"
                      disabled={!d.open}
                      onClick={() => chooseDate(d.value)}
                      aria-pressed={date === d.value}
                      aria-label={`${d.full}${d.isToday ? ' (today)' : ''}${d.open ? '' : ' – doctor not available'}`}
                      className={cn(
                        'flex w-full flex-col items-center rounded-xl border-2 px-2 py-3 transition-colors',
                        'disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500',
                        date === d.value
                          ? 'border-brand-700 bg-brand-700 text-white'
                          : 'border-slate-300 bg-white text-ink-900 enabled:hover:border-brand-600 enabled:hover:bg-brand-50'
                      )}
                    >
                      <span className="text-sm font-semibold">{d.isToday ? 'Today' : d.weekday}</span>
                      <span className="text-2xl font-bold leading-tight">{d.day}</span>
                      <span className="text-sm">{d.month}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-600">You can book up to {DAYS_AHEAD} days ahead.</p>
            </Card>
          ) : null}

          {/* STEP 3 - slot */}
          {step === 3 ? (
            <Card>
              <CardHeader
                title="Step 3 · Choose a time"
                action={
                  <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep(2)}>
                    Back
                  </Button>
                }
              />
              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                Choose a time
              </h2>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-medium text-ink-900">{formatLongDate(date)}</p>
                <LiveIndicator connected={connected} />
              </div>

              {slots.loading ? (
                <LoadingBlock label="Loading available times…" />
              ) : slots.error ? (
                <ErrorState error={slots.error} onRetry={slots.reload} />
              ) : visibleSlots.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No times on this day"
                  text="The doctor has no time slots on this date. Please pick another day."
                  action={<Button onClick={() => setStep(2)}>Choose another day</Button>}
                />
              ) : (
                <>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {visibleSlots.map((s) => {
                      const past = isPastSlot(date, s.startTime);
                      const unavailable = s.isBooked || s.isBlocked || past;
                      const note = s.isBooked ? 'Booked' : s.isBlocked ? 'Unavailable' : past ? 'Passed' : '';
                      return (
                        <li key={s._id}>
                          <button
                            type="button"
                            disabled={unavailable}
                            onClick={() => chooseSlot(s)}
                            aria-pressed={slot?._id === s._id}
                            className={cn(
                              'flex min-h-14 w-full flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-lg font-semibold transition-colors',
                              'disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500',
                              slot?._id === s._id
                                ? 'border-brand-700 bg-brand-700 text-white'
                                : 'border-slate-300 bg-white text-ink-900 enabled:hover:border-brand-600 enabled:hover:bg-brand-50'
                            )}
                          >
                            {formatTime(s.startTime)}
                            {note ? <span className="text-xs font-medium">{note}</span> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {!anySelectable ? (
                    <p role="status" className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-amber-900">
                      There are no free times left on this day. Please{' '}
                      <button type="button" className="font-semibold underline" onClick={() => setStep(2)}>
                        choose another day
                      </button>
                      .
                    </p>
                  ) : null}
                </>
              )}
            </Card>
          ) : null}

          {/* STEP 4 - confirm */}
          {step === 4 && slot ? (
            <Card>
              <CardHeader
                title="Step 4 · Check and confirm"
                action={
                  <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep(3)}>
                    Back
                  </Button>
                }
              />
              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                Check and confirm
              </h2>
              <dl className="mb-6 grid gap-4 rounded-2xl bg-ivory-2 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-600">Doctor</dt>
                  <dd className="text-lg font-semibold">{doctorDisplayName(doctor)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Speciality</dt>
                  <dd className="text-lg font-semibold">{doctor.specialization}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Day</dt>
                  <dd className="text-lg font-semibold">{formatDate(date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Time</dt>
                  <dd className="text-lg font-semibold">{formatTime(slot.startTime)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Consultation fee</dt>
                  <dd className="text-lg font-semibold">
                    {doctor.consultationFee ? `₹${doctor.consultationFee}` : 'Free'}
                  </dd>
                </div>
              </dl>

              <TextareaField
                label="Reason for your visit (optional)"
                hint="A few words help the doctor prepare."
                placeholder="For example: fever and cough for two days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                maxLength={500}
                rows={3}
              />

              <Button className="mt-6" size="lg" full icon={CheckCircle2} loading={booking} onClick={confirmBooking}>
                {booking ? 'Booking…' : 'Confirm my appointment'}
              </Button>
            </Card>
          ) : null}
        </div>

        {/* Summary */}
        <aside aria-label="Booking summary" className="rounded-2xl bg-ink-900 p-6 text-white shadow-card lg:sticky lg:top-24">
          <h2 className="mb-2 text-xl">Your booking</h2>
          <dl>
            <SummaryRow label="Doctor" value={doctor ? doctorDisplayName(doctor) : ''} />
            <SummaryRow label="Speciality" value={doctor?.specialization} />
            <SummaryRow label="Day" value={date ? formatDate(date) : ''} />
            <SummaryRow label="Time" value={slot ? formatTime(slot.startTime) : ''} />
            <SummaryRow
              label="Fee"
              value={doctor ? (doctor.consultationFee ? `₹${doctor.consultationFee}` : 'Free') : ''}
            />
          </dl>
          <p className="mt-4 text-sm text-white/70">Your token number is given when you confirm.</p>
        </aside>
      </div>
    </>
  );
}
