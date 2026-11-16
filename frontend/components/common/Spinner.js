import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn('h-6 w-6 animate-spin text-brand-600', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Centered loading block used inside cards and pages. */
export function LoadingBlock({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-slate-600', className)}>
      <Spinner className="h-8 w-8" label={label} />
      <p aria-hidden="true">{label}</p>
    </div>
  );
}

/** Full-screen loader (auth check, route guards). */
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory">
      <LoadingBlock label={label} />
    </div>
  );
}
