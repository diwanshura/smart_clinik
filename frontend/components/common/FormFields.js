'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export const inputClasses =
  'block w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'shadow-sm transition-all duration-150 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/15 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/15';

/** Label + control + hint/error wrapper. `children` receives the generated ids. */
function FieldShell({ label, hint, error, required, id, className, children }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
          {required ? (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children({ describedBy, invalid: error ? true : undefined })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const TextField = forwardRef(function TextField(
  { label, hint, error, className, inputClassName, required, id: idProp, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {({ describedBy, invalid }) => (
        <input
          ref={ref}
          id={id}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(inputClasses, inputClassName)}
          {...props}
        />
      )}
    </FieldShell>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, hint, error, className, required, id: idProp, children, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {({ describedBy, invalid }) => (
        <select
          ref={ref}
          id={id}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={inputClasses}
          {...props}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { label, hint, error, className, required, id: idProp, rows = 4, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {({ describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(inputClasses, 'resize-y')}
          {...props}
        />
      )}
    </FieldShell>
  );
});

/** Big, tappable on/off choice (radio group semantics). */
export function ChoiceGroup({ legend, options, value, onChange, className }) {
  return (
    <fieldset className={className}>
      <legend className="mb-1.5 text-sm font-semibold text-slate-700">{legend}</legend>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={cn(
                'flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-all duration-150',
                selected
                  ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={legend}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Accessible toggle switch. */
export function Switch({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {label}
        </label>
        {description ? <p className="text-xs text-slate-500 mt-0.5">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}
