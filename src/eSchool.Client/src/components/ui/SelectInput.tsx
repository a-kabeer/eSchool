import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export function SelectInput({
  label,
  options,
  error,
  helperText,
  id,
  className = '',
  ...rest
}: SelectInputProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-ink">
        {label}
        {rest.required && <span className="ml-0.5 text-error">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full appearance-none rounded-xl border bg-surface pl-3.5 pr-9 text-sm text-ink transition-colors focus:outline-none ${
            error ? 'border-error focus:border-error' : 'border-border focus:border-primary'
          }`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
      {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
}
