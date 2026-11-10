import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Card } from './Card';

export interface FilterChipOption {
  label: string;
  value: string;
}

export interface FilterPanelProps {
  title?: string;
  children?: React.ReactNode;
  chips?: {
    label: string;
    options: FilterChipOption[];
    value: string;
    onChange: (val: string) => void;
  }[];
  onReset?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function FilterPanel({
  title,
  children,
  chips,
  onReset,
  rightSlot,
  className = '',
}: FilterPanelProps) {
  return (
    <Card padding="sm" className={`px-5 py-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {title && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {title}
            </span>
          )}
          {children}
          {chips?.map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted mr-1">{group.label}:</span>
              {group.options.map((opt) => {
                const active = opt.value === group.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => group.onChange(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-subtle text-muted hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-subtle hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
          {rightSlot}
        </div>
      </div>
    </Card>
  );
}
