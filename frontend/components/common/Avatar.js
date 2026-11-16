import { cn, initials } from '@/lib/utils';

const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-20 w-20 text-3xl',
};

export function Avatar({ name, size = 'md', tone = 'brand', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        tone === 'brand' ? 'bg-brand-700 text-white' : 'bg-ink-800 text-white',
        SIZES[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
