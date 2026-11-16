'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  ListOrdered,
  MapPin,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { appointmentService } from '@/services/appointmentService';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Spinner';
import { StatCard } from '@/components/common/StatCard';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { AppointmentCard, DateBox, queueHref } from '@/components/patient/AppointmentCard';
import { AppointmentDetailModal } from '@/components/patient/AppointmentDetailModal';
import { CancelAppointmentDialog } from '@/components/patient/CancelAppointmentDialog';
import { NotificationPrompt } from '@/components/patient/NotificationPrompt';
import {
  doctorDisplayName,
  firstName,
  formatLongDate,
  formatTime,
  greeting,
  toDateInputValue,
} from '@/lib/utils';

async function fetchDashboard() {
  const [all, completed, missed, booked] = await Promise.all([
    appointmentService.mine({ limit: 50 }),
    appointmentService.mine({ status: 'completed', limit: 1 }),
    appointmentService.mine({ status: 'missed', limit: 1 }),
    appointmentService.mine({ status: 'booked', limit: 1 }),
  ]);
  return {
    appointments: all.appointments || [],
    totals: {
      all: all.total ?? 0,
      completed: completed.total ?? 0,
      missed: missed.total ?? 0,
      upcoming: booked.total ?? 0,
    },
  };
}

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(fetchDashboard, []);
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const now = new Date();
  const today = toDateInputValue(now);

  const { next, recent } = useMemo(() => {
    const list = data?.appointments || [];
    const upcoming = list
      .filter((a) => ['booked', 'in-progress'].includes(a.status))
      .sort((a, b) => a.date.localeCompare(b.date) || String(a.slotTime).localeCompare(String(b.slotTime)));
    return { next: upcoming[0] || null, recent: list.slice(0, 5) };
  }, [data]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── High-Efficiency Welcome Hero Banner ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-semibold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Clinic Network Active
              </span>
              <span className="text-xs text-blue-100 font-medium">· Today is {formatLongDate(now)}</span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              {greeting(now)}, {firstName(user?.name) || 'there'}!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
              {next
                ? `You have an upcoming appointment with ${doctorDisplayName(next.doctorId)} on ${
                    next.date === today ? 'Today' : formatLongDate(next.date)
                  }.`
                : 'Welcome to your smart clinic command center. Book your visits and follow real-time queues.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink
              href="/patient/book"
              icon={CalendarPlus}
              size="lg"
              className="bg-white text-blue-900 shadow-lg shadow-black/10 hover:bg-blue-50"
            >
              Book a visit
            </ButtonLink>
            <ButtonLink
              href="/patient/queue"
              variant="dark"
              size="lg"
              icon={ListOrdered}
              className="border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            >
              Live queue
            </ButtonLink>
          </div>
        </div>
      </section>

      <NotificationPrompt />

      {loading && !data ? (
        <LoadingBlock label="Loading your dashboard…" />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : (
        <>
          {/* ── High-Efficiency Stat Cards Grid ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={CalendarCheck}
              label="All Appointments"
              value={data.totals.all}
              tone="navy"
              trend="All-time"
              subtitle="Registered visits"
            />
            <StatCard
              icon={CalendarClock}
              label="Upcoming"
              value={data.totals.upcoming}
              tone="gold"
              trend={data.totals.upcoming > 0 ? 'Active' : 'None'}
              subtitle="Scheduled visits"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={data.totals.completed}
              tone="teal"
              trend="Finished"
              subtitle="Past consultations"
            />
            <StatCard
              icon={XCircle}
              label="Missed"
              value={data.totals.missed}
              tone="red"
              trend={data.totals.missed === 0 ? '0% Absent' : 'Notice'}
              subtitle="Unattended tokens"
            />
          </div>

          {/* ── Main Two-Column Layout ─────────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Digital Boarding Pass / Next Appointment (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader
                  title="Next Appointment"
                  subtitle="Your active consultation pass & token status"
                  action={
                    next ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Synchronized
                      </span>
                    ) : null
                  }
                />

                {next ? (
                  <div className="flex flex-col gap-6">
                    {/* Doctor Details Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-3.5">
                        <DateBox date={next.date} className="h-16 w-16" />
                        <div>
                          <p className="text-lg font-extrabold text-slate-900">{doctorDisplayName(next.doctorId)}</p>
                          <p className="text-xs font-semibold text-blue-600">
                            {next.doctorId?.specialization || 'Consultant Physician'}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {next.date === today ? 'Today' : formatLongDate(next.date)} · {formatTime(next.slotTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t border-slate-200/60 pt-2 sm:border-0 sm:pt-0">
                        <StatusBadge status={next.status} />
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" /> Room 102 · Pavilion
                        </span>
                      </div>
                    </div>

                    {/* Cyber High-Tech Token Board */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-center text-white shadow-2xl">
                      {/* Ambient corner glows */}
                      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-xl" />
                      <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-amber-500/20 blur-xl" />

                      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-300">
                          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          Live Queue Radar
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Slot: {formatTime(next.slotTime)}
                        </span>
                      </div>

                      <div className="relative z-10 my-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Assigned Token</p>
                        <p className="font-display text-7xl sm:text-8xl font-black text-amber-300 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)] my-1">
                          #{next.tokenNumber}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                          {next.tokenNumber === 1
                            ? '✨ First in line! You will be called first when the session begins.'
                            : `Estimated position: ${next.tokenNumber} in line.`}
                        </p>
                      </div>

                      {/* Barcode / ticket graphic simulation */}
                      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-slate-300" />
                          <span className="font-mono text-[11px] tracking-widest text-slate-300">
                            TK-{next._id ? next._id.slice(-6).toUpperCase() : '00192A'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">Keep tab open for sound alert</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <ButtonLink href={queueHref(next)} icon={ListOrdered} size="lg" full>
                        Track my live queue
                      </ButtonLink>
                      {next.status === 'booked' ? (
                        <Button
                          variant="danger"
                          icon={XCircle}
                          size="lg"
                          full
                          onClick={() => setCancelTarget(next)}
                        >
                          Cancel appointment
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarPlus}
                    title="No upcoming visits scheduled"
                    text="Book your next consultation with our specialists in just four easy steps."
                    action={
                      <ButtonLink href="/patient/book" icon={CalendarPlus}>
                        Book an appointment
                      </ButtonLink>
                    }
                  />
                )}
              </Card>

              {/* ── Pre-Visit Preparation Card ────────────────────────────────────── */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pre-Visit Preparation Checklist</h3>
                    <p className="text-xs text-slate-500">Quick steps to ensure a smooth consultation</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Token Ready</p>
                      <p className="text-[11px] text-slate-500">No physical counter ticket needed.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Medical Records</p>
                      <p className="text-[11px] text-slate-500">Keep recent test results handy.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Arrive 10m Early</p>
                      <p className="text-[11px] text-slate-500">Be ready outside consultation room.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Appointments & Live Ticker (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Recent Appointments Card */}
              <Card>
                <CardHeader
                  title="Recent Appointments"
                  subtitle="Your past and current visits"
                  action={
                    <ButtonLink href="/patient/appointments" variant="ghost" size="sm">
                      View all →
                    </ButtonLink>
                  }
                />
                {recent.length === 0 ? (
                  <EmptyState
                    icon={CalendarCheck}
                    title="No past appointments"
                    text="Your appointment history will appear here once completed."
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {recent.map((a) => (
                      <li key={a._id}>
                        <AppointmentCard appointment={a} onOpen={setSelected} showActions={false} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {/* Clinic Operational Radar Widget */}
              <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-card">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Clinic Status
                    </span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                    Auto-Refreshing
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-slate-300">Average consultation pace:</span>
                    <strong className="text-white">~6–8 min / patient</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-slate-300">Working clinic hours:</span>
                    <strong className="text-white">09:00 AM – 05:00 PM</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-slate-300">Current reception queue:</span>
                    <strong className="text-emerald-300">Moving smoothly</strong>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Need immediate help?</span>
                  <Link href="/patient/queue" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
                    Open Queue Board →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── High-Efficiency Interactive Command Grid ─────────────────────────── */}
          <div className="mt-4">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              Quick Command Center
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/patient/book"
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-110">
                    <CalendarPlus className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Book Appointment
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Choose doctors, dates, and grab your live token in seconds.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Schedule now →
                </span>
              </Link>

              <Link
                href="/patient/queue"
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-110">
                    <ListOrdered className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Live Queue Radar
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Track which token is currently inside with the doctor.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  Track live →
                </span>
              </Link>

              <Link
                href="/patient/appointments"
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/20 transition-transform group-hover:scale-110">
                    <CalendarCheck className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    All Appointments
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Review completed visits, cancellation history, and timings.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                  View history →
                </span>
              </Link>

              <Link
                href="/patient/profile"
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20 transition-transform group-hover:scale-110">
                    <UserRound className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    Patient Profile
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Update phone, emergency contact, date of birth & blood group.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:translate-x-1 transition-transform">
                  Edit profile →
                </span>
              </Link>
            </div>
          </div>
        </>
      )}

      <AppointmentDetailModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onCancel={(a) => {
          setSelected(null);
          setCancelTarget(a);
        }}
      />
      <CancelAppointmentDialog
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => reload({ silent: true })}
      />
    </div>
  );
}
