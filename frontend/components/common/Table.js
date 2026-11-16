import { cn } from '@/lib/utils';

/** Responsive data table: scrolls horizontally on small screens instead of breaking the layout. */
export function Table({ columns, children, caption, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-ink-900 text-sm uppercase tracking-wide text-white">
            {columns.map((col) => (
              <th key={col} scope="col" className="px-4 py-3 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ className, children, ...props }) {
  return (
    <td className={cn('px-4 py-3.5 align-middle text-base text-ink-900', className)} {...props}>
      {children}
    </td>
  );
}
