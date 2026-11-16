import { cn } from '@/lib/utils';

export function Card({ as: Tag = 'section', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-shadow duration-200 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div
      className={cn(
        'mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4',
        className
      )}
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
