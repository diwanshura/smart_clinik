import { cn } from '@/lib/utils';

export function LiveIndicator({ connected }) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold',
        connected ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-900'
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-2.5 w-2.5 rounded-full', connected ? 'animate-pulse bg-brand-600' : 'bg-amber-600')}
      />
      {connected ? 'Live updates on' : 'Reconnecting… (refreshing every 20 s)'}
    </span>
  );
}
