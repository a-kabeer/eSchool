import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export function FormInput({
  label,
  error,
  helperText,
  leftIcon,
  id,
  className = '',
  ...rest
}: FormInputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-xs font-semibold text-ink">
        {label}
        {rest.required && <span className="ml-0.5 text-error">*</span>}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 text-muted">{leftIcon}</span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full rounded-xl border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:outline-none ${
            leftIcon ? 'pl-10' : ''
          } ${
            error
              ? 'border-error focus:border-error'
              : 'border-border focus:border-primary'
          } disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
      {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
}
