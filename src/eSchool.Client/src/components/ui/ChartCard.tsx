import React from 'react';
import { Card } from './Card';
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  menuItems?: DropdownMenuItem[];
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  headerRight,
  menuItems,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {menuItems && menuItems.length > 0 && (
            <DropdownMenu items={menuItems} ariaLabel={`${title} options`} />
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}
