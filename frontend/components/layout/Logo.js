import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ href = '/', light = false, className }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-3 select-none', className)}>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
        <HeartPulse className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'font-display text-xl font-bold tracking-tight transition-colors',
            light ? 'text-white group-hover:text-blue-200' : 'text-slate-900 group-hover:text-blue-600'
          )}
        >
          Smart Clinic
        </span>
        <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 border border-blue-500/20">
          2.0
        </span>
      </div>
    </Link>
  );
}
