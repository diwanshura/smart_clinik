import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99]',
  secondary:
    'bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50/80 hover:border-slate-300 hover:text-slate-900 active:scale-[0.99]',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-500/20 hover:from-rose-700 hover:to-red-700 active:scale-[0.99]',
  ghost:
    'bg-transparent text-blue-600 hover:bg-blue-50/80 hover:text-blue-700 active:scale-[0.99]',
  dark:
    'bg-slate-800/90 text-white border border-slate-700/80 hover:bg-slate-700/90 hover:border-slate-600 active:scale-[0.99]',
  emerald:
    'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99]',
};

const SIZES = {
  sm: 'min-h-9 px-3.5 text-xs font-semibold rounded-xl',
  md: 'min-h-11 px-5 text-sm font-semibold rounded-xl',
  lg: 'min-h-12 px-6 text-base font-semibold rounded-2xl',
};

export function buttonClasses({ variant = 'primary', size = 'md', full = false, className } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    full && 'w-full',
    className
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, full, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  full = false,
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, full, className })} {...props}>
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </Link>
  );
}
