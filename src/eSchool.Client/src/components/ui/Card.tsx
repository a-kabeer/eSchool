import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { SemanticTone } from '@/types';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'tinted';
  tone?: SemanticTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const TINTED_TONE_CLASSES: Record<SemanticTone, string> = {
  primary: 'bg-light-primary',
  secondary: 'bg-light-secondary',
  success: 'bg-light-success',
  warning: 'bg-light-warning',
  error: 'bg-light-error',
  info: 'bg-light-info',
  neutral: 'bg-subtle',
};

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-7',
};

export function Card({
  variant = 'default',
  tone = 'primary',
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  const { cardElevation } = useTheme();

  const surfaceClass =
    variant === 'tinted'
      ? `rounded-[24px] shadow-none ${TINTED_TONE_CLASSES[tone]}`
      : cardElevation === 'border'
        ? 'mm-card-outlined'
        : 'mm-card';

  return (
    <div className={`${surfaceClass} ${PADDING_CLASSES[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
