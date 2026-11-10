import { useState } from 'react';
import { Check, Maximize2, Minimize2, Moon, PanelLeft, Settings, Sparkles, Sun, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { ColorPreset } from '@/types';

const COLOR_PRESETS: { id: ColorPreset; label: string; hex: string }[] = [
  { id: 'blue', label: 'Blue', hex: '#00a1ff' },
  { id: 'aqua', label: 'Aqua', hex: '#0074ba' },
  { id: 'purple', label: 'Purple', hex: '#6e35b7' },
  { id: 'green', label: 'Green', hex: '#06769a' },
  { id: 'cyan', label: 'Cyan', hex: '#00b9c0' },
  { id: 'orange', label: 'Orange', hex: '#fa896b' },
];

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const {
    mode,
    setMode,
    colorPreset,
    setColorPreset,
    layoutWidth,
    setLayoutWidth,
    cardElevation,
    setCardElevation,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useTheme();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open theme customizer"
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success text-white shadow-[0_6px_18px_rgba(0,206,182,0.4)] transition-transform hover:scale-105"
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Theme customizer">
          <div className="fixed inset-0 bg-[#111c2d]/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex h-full w-80 flex-col bg-surface shadow-[var(--mm-shadow-drawer)]">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-ink">Settings</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close customizer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 mm-scrollbar">
              {/* Theme Option */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Theme Option
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('light')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold transition-all ${
                      mode === 'light'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('dark')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold transition-all ${
                      mode === 'dark'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Theme Colors */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Theme Colors
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_PRESETS.map((preset) => {
                    const active = colorPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setColorPreset(preset.id)}
                        aria-label={`Select ${preset.label} color theme`}
                        className={`flex items-center justify-center rounded-xl border py-3 transition-all ${
                          active ? 'border-primary bg-subtle' : 'border-border hover:bg-subtle'
                        }`}
                      >
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {active && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Container Option */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Container Option
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutWidth('boxed')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold ${
                      layoutWidth === 'boxed'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    Boxed
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutWidth('full')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold ${
                      layoutWidth === 'full'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Full
                  </button>
                </div>
              </div>

              {/* Sidebar Type */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Sidebar Type
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold ${
                      !sidebarCollapsed
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <PanelLeft className="h-3.5 w-3.5" />
                    Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold ${
                      sidebarCollapsed
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    <PanelLeft className="h-3.5 w-3.5" />
                    Mini
                  </button>
                </div>
              </div>

              {/* Card Style */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Card With
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardElevation('shadow')}
                    className={`rounded-xl border py-3 text-xs font-semibold ${
                      cardElevation === 'shadow'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    Shadow
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardElevation('border')}
                    className={`rounded-xl border py-3 text-xs font-semibold ${
                      cardElevation === 'border'
                        ? 'border-primary bg-light-primary text-primary'
                        : 'border-border text-ink hover:bg-subtle'
                    }`}
                  >
                    Border
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
