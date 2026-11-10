import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-muted/50" aria-hidden="true" />
            )}
            {isLast ? (
              <span className="rounded-full bg-light-primary px-3 py-1 text-xs font-semibold text-primary">
                {item.label}
              </span>
            ) : item.path ? (
              <Link
                to={item.path}
                className="font-medium text-muted transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-muted">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
