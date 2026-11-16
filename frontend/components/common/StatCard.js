import { cn } from '@/lib/utils';

const TONES = {
  teal: {
    icon: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25',
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  gold: {
    icon: 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/25',
    bar: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  red: {
    icon: 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25',
    bar: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  blue: {
    icon: 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25',
    bar: 'bg-blue-600',
    pill: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  navy: {
    icon: 'bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md shadow-slate-900/25',
    bar: 'bg-slate-900',
    pill: 'bg-slate-100 text-slate-700 border-slate-200/80',
  },
  purple: {
    icon: 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25',
    bar: 'bg-violet-600',
    pill: 'bg-violet-50 text-violet-700 border-violet-200/80',
  },
};

export function StatCard({ icon: Icon, label, value, tone = 'teal', trend, subtitle }) {
  const meta = TONES[tone] || TONES.teal;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:shadow-xl">
      {/* Top row: Icon + Pill */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
            meta.icon
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {trend ? (
          <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-tight', meta.pill)}>
            {trend}
          </span>
        ) : null}
      </div>

      {/* Middle row: Large Metric */}
      <div className="mt-4">
        <p className="font-display text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-none">
          {value ?? '—'}
        </p>
        <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {subtitle ? <p className="mt-0.5 text-[11px] font-medium text-slate-400">{subtitle}</p> : null}
      </div>

      {/* Subtle bottom accent line that glows on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-slate-100">
        <div
          className={cn(
            'h-full w-full opacity-40 transition-opacity duration-300 group-hover:opacity-100',
            meta.bar
          )}
        />
      </div>
    </div>
  );
}
