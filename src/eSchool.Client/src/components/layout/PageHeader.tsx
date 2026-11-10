import React from 'react';
import { Card } from '@/components/ui';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Card padding="none" className="mb-6 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Breadcrumbs items={breadcrumbs} />
          {actions}
        </div>
      </div>
    </Card>
  );
}
