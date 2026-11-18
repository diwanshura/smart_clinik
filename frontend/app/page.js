import { Suspense } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ListOrdered,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { AuthRedirect } from '@/components/layout/AuthRedirect';
import { Logo } from '@/components/layout/Logo';

const METRICS = [
  { value: '15,000+', label: 'Patients Treated', tone: 'text-blue-600' },
  { value: '< 8 min', label: 'Average Wait Time', tone: 'text-emerald-600' },
  { value: '99.4%', label: 'On-Time Call Rate', tone: 'text-indigo-600' },
  { value: '100%', label: 'Digital Token Tracking', tone: 'text-cyan-600' },
];

const FEATURES = [
  {
    icon: CalendarPlus,
    title: 'Instant 4-Step Booking',
    text: 'Select your doctor, pick a date, choose an open slot, and get your digital token in under 30 seconds.',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    icon: ListOrdered,
    title: 'Live Real-Time Queue',
    text: 'Watch current token numbers live on your phone. Leave home at the right moment without sitting in waiting rooms.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: BellRing,
    title: 'Smart Reminders',
    text: 'Automated web push notifications trigger right before your turn arrives so you never miss a visit.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Stethoscope,
    title: 'Doctor & Staff Console',
    text: 'Doctors call the next patient, add clinical notes, handle emergencies, and manage slots with a single tap.',
    gradient: 'from-purple-600 to-indigo-600',
  },
];

const AUDIENCES = [
  {
    icon: Users,
    role: 'Patients',
    title: 'Spend less time waiting, more time living.',
    desc: 'Book visits 24/7, track your live position in queue from home or a nearby cafe, and access all your past appointments in one place.',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    link: '/register',
    linkText: 'Create patient account',
  },
  {
    icon: Stethoscope,
    role: 'Doctors',
    title: 'A focused, distraction-free consultation room.',
    desc: 'Call the next patient with one click, write private clinical remarks, track today’s consultation stats, and mark absent patients easily.',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    link: '/login',
    linkText: 'Doctor portal',
  },
  {
    icon: ShieldCheck,
    role: 'Clinic Admins',
    title: 'Operational visibility across the entire clinic.',
    desc: 'Manage doctor rosters, customize consultation slot durations, inspect patient wait-time analytics, and monitor performance in real time.',
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    link: '/login',
    linkText: 'Admin dashboard',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>

      {/* Modern Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo light />
          <nav aria-label="Account" className="flex items-center gap-2.5 sm:gap-3">
            <ButtonLink href="/login" variant="dark" size="sm">
              Sign in
            </ButtonLink>
            <ButtonLink href="/register" size="sm">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Modern Split Hero Section */}
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-24 lg:py-28">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -left-20 top-[-10rem] h-[38rem] w-[38rem] rounded-full bg-blue-600/20 blur-[130px]" />
          <div className="pointer-events-none absolute right-[-5rem] top-10 h-[34rem] w-[34rem] rounded-full bg-indigo-600/20 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Headline & Action */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Smart Clinic 2.0 • Real-Time AI Queue &amp; Fast Booking
                </div>

                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
                  Healthcare Without{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                    The Waiting Room.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
                  Book a visit in seconds, get your instant token, and track the live queue from your phone. Know
                  exactly when it’s your turn so you never waste hours sitting in crowded clinics.
                </p>

                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <ButtonLink href="/register" size="lg" icon={CalendarPlus}>
                    Book your first visit
                  </ButtonLink>
                  <ButtonLink href="/login" variant="dark" size="lg" icon={ArrowRight}>
                    Sign in with Google or Email
                  </ButtonLink>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Free patient registration</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Live token tracking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Push reminders</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Queue Card Cockpit */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Live Clinic Display
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                      Room 102
                    </span>
                  </div>

                  {/* Active Serving Token Showcase */}
                  <div className="mt-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 text-center shadow-inner border border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Now with Doctor</p>
                    <p className="my-2 font-display text-6xl font-black text-amber-300 sm:text-7xl">
                      Token #07
                    </p>
                    <p className="text-sm font-semibold text-white">Dr. Sarah Jenkins</p>
                    <p className="text-xs text-slate-400">Cardiology &amp; General Medicine</p>
                  </div>

                  {/* Live Queue Strip */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2 text-xs">
                      <span className="font-medium text-slate-300">Next Patient:</span>
                      <span className="font-bold text-emerald-400">Token #08 (Ready at door)</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2 text-xs">
                      <span className="font-medium text-slate-300">Estimated Consultation:</span>
                      <span className="font-bold text-white">~6 minutes remaining</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2 text-xs">
                      <span className="font-medium text-slate-300">Waiting Patients:</span>
                      <span className="font-bold text-blue-300">3 ahead in queue</span>
                    </div>
                  </div>

                  {/* Quick Live Preview Action */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Real-time sync enabled</span>
                    <Link href="/patient/queue" className="font-semibold text-cyan-300 hover:text-cyan-200">
                      View live queue demo →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="border-y border-slate-200/80 bg-white py-10 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {METRICS.map((m) => (
                <div key={m.label} className="text-center sm:text-left">
                  <p className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${m.tone}`}>
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section aria-labelledby="features-heading" className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 border border-blue-200/60">
                Engineered for speed
              </span>
              <h2 id="features-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need for a modern clinic visit
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Eliminate the anxiety of endless waiting rooms with live digital queues and instant scheduling.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text, gradient }) => (
                <div
                  key={title}
                  className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-md transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience / Roles Section */}
        <section aria-labelledby="audience-heading" className="bg-slate-100/70 border-y border-slate-200/80 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="rounded-full bg-slate-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                Seamless Collaboration
              </span>
              <h2 id="audience-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Built for everyone in the clinic
              </h2>
              <p className="mt-3 text-base text-slate-600">
                A single synchronized platform that connects patients, doctors, and clinic administrators.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {AUDIENCES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.role}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-card transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${item.badge}`}>
                          {item.role}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100">
                      <ButtonLink href={item.link} variant="secondary" size="sm" full>
                        {item.linkText} →
                      </ButtonLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-10 text-white shadow-2xl sm:p-16">
              <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-2xl" />

              <div className="relative z-10 max-w-2xl">
                <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Get started in 30 seconds
                </span>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  Ready to experience healthcare without the wait?
                </h2>
                <p className="mt-4 text-base text-blue-100 sm:text-lg">
                  Join thousands of patients who book their clinic visits and track queues with Smart Clinic.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/register" variant="dark" size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    Create free account
                  </ButtonLink>
                  <ButtonLink href="/login" variant="dark" size="lg">
                    Sign in with Google
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Sleek Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Logo light />
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>All systems operational · Live queue active</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Smart Clinic 2.0. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
