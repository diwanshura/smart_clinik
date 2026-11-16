import { cn } from '@/lib/utils';

/** Modern pill-style filter buttons (e.g. All / Upcoming / Completed). */
export function FilterTabs({ options, value, onChange, label = 'Filter' }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-h-9 select-none rounded-xl px-4 text-xs font-bold tracking-tight transition-all duration-150',
              active
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
