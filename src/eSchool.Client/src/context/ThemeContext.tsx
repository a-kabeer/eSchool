import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CardElevation, ColorPreset, LayoutWidth, ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  colorPreset: ColorPreset;
  layoutWidth: LayoutWidth;
  cardElevation: CardElevation;
  sidebarCollapsed: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
}

interface ThemeContextValue extends ThemeState {
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setColorPreset: (preset: ColorPreset) => void;
  setLayoutWidth: (width: LayoutWidth) => void;
  setCardElevation: (elevation: CardElevation) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setLanguage: (lang: 'en' | 'es' | 'fr' | 'de') => void;
}

const DEFAULT_THEME: ThemeState = {
  mode: 'light',
  colorPreset: 'blue',
  layoutWidth: 'full',
  cardElevation: 'shadow',
  sidebarCollapsed: false,
  language: 'en',
};

const STORAGE_KEY = 'materialm_theme_prefs_v1';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_THEME, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.mode);
    root.setAttribute('data-color-preset', state.colorPreset);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const value: ThemeContextValue = {
    ...state,
    toggleMode: () => setState((prev) => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' })),
    setMode: (mode) => setState((prev) => ({ ...prev, mode })),
    setColorPreset: (colorPreset) => setState((prev) => ({ ...prev, colorPreset })),
    setLayoutWidth: (layoutWidth) => setState((prev) => ({ ...prev, layoutWidth })),
    setCardElevation: (cardElevation) => setState((prev) => ({ ...prev, cardElevation })),
    setSidebarCollapsed: (sidebarCollapsed) => setState((prev) => ({ ...prev, sidebarCollapsed })),
    toggleSidebarCollapsed: () =>
      setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed })),
    setLanguage: (language) => setState((prev) => ({ ...prev, language })),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
