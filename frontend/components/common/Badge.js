import { STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/70',
  info: 'bg-blue-50 text-blue-700 border-blue-200/70',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/70',
};

const DOTS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
};

export function Badge({ tone = 'neutral', dot = true, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DOTS[tone] || DOTS.neutral)} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] || { label: status || 'Unknown', tone: 'neutral' };
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
