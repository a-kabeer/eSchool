import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onSelect: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  ariaLabel?: string;
}

export function DropdownMenu({ items, ariaLabel = 'Card actions' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/75 transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10"
      >
        <MoreVertical className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-30 min-w-[176px] rounded-2xl border border-border bg-surface py-1.5 shadow-[var(--mm-shadow-dropdown)]"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-subtle ${
                item.danger ? 'text-error' : 'text-ink'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
