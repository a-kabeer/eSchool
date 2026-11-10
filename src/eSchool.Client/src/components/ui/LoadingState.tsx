export interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ rows = 4, label = 'Loading records...' }: LoadingStateProps) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-subtle/70 px-4 py-3.5 animate-pulse">
          <div className="h-9 w-9 shrink-0 rounded-full bg-border" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded-full bg-border" />
            <div className="h-2.5 w-1/2 rounded-full bg-border/70" />
          </div>
          <div className="h-6 w-20 rounded-full bg-border" />
        </div>
      ))}
    </div>
  );
}
