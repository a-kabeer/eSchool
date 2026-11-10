export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center rounded-full bg-subtle p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`min-w-[88px] rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${
              active
                ? 'bg-surface text-ink shadow-[0_1px_4px_rgba(17,28,45,0.08)]'
                : 'text-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
