import React from 'react';
import type { SemanticTone } from '@/types';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  tone?: SemanticTone;
  onClick?: () => void;
  className?: string;
}

const SOLID_ICON_BG: Record<SemanticTone, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  neutral: 'bg-ink text-white',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'primary',
  onClick,
  className = '',
}: StatCardProps) {
  return (
    <Card
      variant="tinted"
      tone={tone}
      padding="md"
      onClick={onClick}
      className={`transition-transform duration-150 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${SOLID_ICON_BG[tone]}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-sm font-medium text-muted">{subtitle ?? value}</p>
        </div>
      </div>
    </Card>
  );
}
