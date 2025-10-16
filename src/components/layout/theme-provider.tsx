'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/config/theme';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ThemeContext } from '@/hooks/use-theme';
import type { ResolvedTheme, ThemeMode } from '@/types/theme';

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? null;
};

const resolveTheme = (mode: ThemeMode, prefersDark: boolean): ResolvedTheme => {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return mode;
};

const setDocumentTheme = (resolved: ResolvedTheme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.dataset.theme = resolved;
};

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
};

export const ThemeProvider = ({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme() ?? defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredTheme() ?? defaultTheme, prefersDark),
  );

  useEffect(() => {
    const stored = getStoredTheme();

    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const nextResolved = resolveTheme(theme, prefersDark);
    setResolvedTheme(nextResolved);
    setDocumentTheme(nextResolved);

    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [prefersDark, theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const currentResolved = resolveTheme(prev, prefersDark);
      return currentResolved === 'dark' ? 'light' : 'dark';
    });
  }, [prefersDark]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handler = (event: KeyboardEvent) => {
      const isModKey = navigator.platform.toLowerCase().includes('mac')
        ? event.metaKey
        : event.ctrlKey;

      if (isModKey && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [toggleTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [resolvedTheme, setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
