import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export function EmptyState({ icon: Icon, title, text, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-12 text-center', className)}>
      {Icon ? (
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ivory-2 text-slate-600">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-xl text-ink-900">{title}</h3>
      {text ? <p className="mt-2 max-w-md text-slate-600">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'We could not load this' }) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-12 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h3 className="text-xl text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-slate-600">{error?.message || 'Please try again in a moment.'}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={() => onRetry()}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
