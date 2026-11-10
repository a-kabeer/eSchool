import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'soft' | 'danger' | 'ghost';
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

const SOFT_CLASSES = {
  primary: 'bg-light-primary text-primary hover:bg-primary hover:text-white',
  secondary: 'bg-light-secondary text-secondary hover:bg-secondary hover:text-white',
  success: 'bg-light-success text-success hover:bg-success hover:text-white',
  warning: 'bg-light-warning text-warning hover:bg-warning hover:text-white',
  error: 'bg-light-error text-error hover:bg-error hover:text-white',
};

export function Button({
  variant = 'primary',
  tone = 'primary',
  size = 'md',
  pill = true,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const sizeClass =
    size === 'sm'
      ? 'px-3.5 py-1.5 text-xs'
      : size === 'lg'
        ? 'px-6 py-3 text-sm'
        : 'px-4.5 py-2.5 text-sm';

  const radiusClass = pill ? 'rounded-full' : 'rounded-xl';

  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white hover:brightness-105 shadow-xs'
      : variant === 'outline'
        ? 'border border-primary text-primary bg-transparent hover:bg-light-primary'
        : variant === 'danger'
          ? 'bg-error text-white hover:brightness-105'
          : variant === 'ghost'
            ? 'bg-transparent text-muted hover:bg-subtle hover:text-ink'
            : SOFT_CLASSES[tone];

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${sizeClass} ${radiusClass} ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
