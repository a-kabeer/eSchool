import React from 'react';
import type { SemanticTone } from '@/types';

export interface StatusBadgeProps {
  label: string;
  tone?: SemanticTone;
  variant?: 'soft' | 'solid' | 'outlined';
  size?: 'xs' | 'sm';
  icon?: React.ReactNode;
  className?: string;
}

const SOFT_MAP: Record<SemanticTone, string> = {
  primary: 'bg-light-primary text-primary',
  secondary: 'bg-light-secondary text-secondary',
  success: 'bg-light-success text-success',
  warning: 'bg-light-warning text-warning',
  error: 'bg-light-error text-error',
  info: 'bg-light-info text-info',
  neutral: 'bg-subtle text-muted',
};

const SOLID_MAP: Record<SemanticTone, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  neutral: 'bg-ink text-white',
};

const OUTLINED_MAP: Record<SemanticTone, string> = {
  primary: 'border border-primary/50 text-primary bg-transparent',
  secondary: 'border border-secondary/50 text-secondary bg-transparent',
  success: 'border border-success/50 text-success bg-transparent',
  warning: 'border border-warning/50 text-warning bg-transparent',
  error: 'border border-error/50 text-error bg-transparent',
  info: 'border border-info/50 text-info bg-transparent',
  neutral: 'border border-muted/40 text-muted bg-transparent',
};

export function StatusBadge({
  label,
  tone = 'primary',
  variant = 'soft',
  size = 'xs',
  icon,
  className = '',
}: StatusBadgeProps) {
  const palette =
    variant === 'solid'
      ? SOLID_MAP[tone]
      : variant === 'outlined'
        ? OUTLINED_MAP[tone]
        : SOFT_MAP[tone];

  const sizing = size === 'xs' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-[13px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${sizing} ${palette} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
