'use client';

import { useEffect, useState, useTransition } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useTraceInteraction } from '@/hooks/use-trace-interaction';
import { cn } from '@/lib/utils';

export type ThemeToggleProps = {
  className?: string;
};

const SunIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const traceInteraction = useTraceInteraction();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    startTransition(() => {
      void traceInteraction(
        'ui.theme_toggle',
        () => {
          toggleTheme();
        },
        {
          'ui.theme.previous': resolvedTheme,
          'ui.theme.next': resolvedTheme === 'dark' ? 'light' : 'dark',
        },
      );
    });
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-surface/80 text-foreground shadow-sm backdrop-blur-md transition hover:border-accent/30 hover:text-accent dark:border-foreground/20 dark:bg-surface/60 dark:text-foreground/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className="flex h-5 w-5 items-center justify-center transition-transform duration-300 ease-out">
        {mounted ? (
          resolvedTheme === 'dark' ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          )
        ) : (
          <span className="h-3 w-3 rounded-full bg-muted/60" />
        )}
      </span>
    </button>
  );
};
