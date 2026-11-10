import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel,
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-9 text-sm text-ink placeholder:text-muted/80 transition-colors focus:border-primary focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 rounded-full p-1 text-muted hover:bg-subtle hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
