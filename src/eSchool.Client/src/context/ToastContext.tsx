import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (title: string, tone?: ToastTone, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, tone: ToastTone = 'success', description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, tone, description }]);
      window.setTimeout(() => {
        dismiss(id);
      }, 3600);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-6 z-50 flex w-full max-w-sm flex-col gap-2.5"
      >
        {toasts.map((t) => {
          const toneClasses: Record<ToastTone, string> = {
            success: 'border-success/30 bg-surface text-ink',
            error: 'border-error/30 bg-surface text-ink',
            warning: 'border-warning/30 bg-surface text-ink',
            info: 'border-primary/30 bg-surface text-ink',
          };
          const iconColors: Record<ToastTone, string> = {
            success: 'text-success bg-light-success',
            error: 'text-error bg-light-error',
            warning: 'text-warning bg-light-warning',
            info: 'text-primary bg-light-primary',
          };

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-[var(--mm-shadow-dropdown)] transition-all ${toneClasses[t.tone]}`}
            >
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconColors[t.tone]}`}
              >
                {t.tone === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {t.tone === 'error' && <AlertTriangle className="h-4 w-4" />}
                {t.tone === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {t.tone === 'info' && <Info className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 text-muted hover:bg-subtle hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
