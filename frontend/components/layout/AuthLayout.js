import Link from 'next/link';
import { CalendarCheck, HeartPulse, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

/** Modern branded shell for authentication screens with ambient lighting and split showcase. */
export function AuthLayout({ title, subtitle, children, footer, showVisualPanel = false }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:py-12">
      {/* Ambient aurora lighting */}
      <div className="pointer-events-none absolute -left-20 top-[-10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-[-10rem] h-[36rem] w-[36rem] rounded-full bg-indigo-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[100px]" />

      <div
        className={
          showVisualPanel
            ? 'relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]'
            : 'relative w-full max-w-lg'
        }
      >
        {showVisualPanel ? (
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950/90 via-slate-900/90 to-indigo-950/95 p-10 text-white lg:flex border-r border-white/10">
            {/* Background texture element */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Smart Clinic Platform 2.0
              </div>

              <h2 className="mt-8 max-w-sm text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-white">
                Next-gen healthcare with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">zero waiting.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
                Track live queues in real time, confirm appointments in seconds, and stay connected with top specialists.
              </p>

              {/* Live Preview Card */}
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Queue Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Serving Now
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-3">
                  <span className="text-2xl font-black text-amber-300">Token #07</span>
                  <span className="text-xs text-slate-300">Dr. Sarah Jenkins · Cardiology</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-slate-300">
                  <span>Estimated Wait: <strong className="text-white">~6 mins</strong></span>
                  <span className="text-emerald-400 font-medium">Next up: Token #08</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-3 pt-8 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                  <CalendarCheck className="h-3.5 w-3.5" />
                </div>
                Instant booking with live slot availability
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                Enterprise-grade medical data encryption
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                Real-time web push queue notifications
              </div>
            </div>
          </div>
        ) : null}

        <div className={showVisualPanel ? 'bg-white p-6 sm:p-10' : 'rounded-3xl border border-white/15 bg-white p-6 shadow-2xl sm:p-10'}>
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo light={false} />
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>

          <div>{children}</div>

          {footer ? <div className="mt-6 text-center text-xs text-slate-500">{footer}</div> : null}

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-blue-600"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
