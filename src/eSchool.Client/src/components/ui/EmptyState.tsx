import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-light-primary text-primary">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
