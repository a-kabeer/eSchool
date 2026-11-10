import React from 'react';
import type { SemanticTone } from '@/types';
import { Card } from './Card';
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu';

export interface AnalyticsCardProps {
  title: string;
  value: string;
  deltaLabel: string;
  icon: React.ReactNode;
  tone: SemanticTone;
  chart?: React.ReactNode;
  menuItems?: DropdownMenuItem[];
  className?: string;
}

const ICON_PILL_BG: Record<SemanticTone, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  neutral: 'bg-ink text-white',
};

export function AnalyticsCard({
  title,
  value,
  deltaLabel,
  icon,
  tone,
  chart,
  menuItems,
  className = '',
}: AnalyticsCardProps) {
  return (
    <Card variant="tinted" tone={tone} padding="md" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-12 items-center justify-center rounded-full ${ICON_PILL_BG[tone]}`}
          >
            {icon}
          </span>
          <h3 className="text-base font-medium text-muted">{title}</h3>
        </div>
        {menuItems && menuItems.length > 0 && <DropdownMenu items={menuItems} ariaLabel={`${title} options`} />}
      </div>

      <div className="mt-5 grid grid-cols-12 items-end gap-2">
        <div className="col-span-7">
          <p className="text-[28px] leading-tight font-bold tracking-tight text-ink">{value}</p>
          <span className="mt-2.5 inline-flex items-center whitespace-nowrap rounded-full border border-ink/20 px-2.5 py-1 text-[11px] font-semibold text-muted">
            {deltaLabel}
          </span>
        </div>
        <div className="col-span-5 h-[90px] min-w-0">{chart}</div>
      </div>
    </Card>
  );
}
