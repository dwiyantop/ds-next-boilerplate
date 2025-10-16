import type { Metadata } from 'next';
import Link from 'next/link';

import { Button, buttonStyles, ThemeToggle } from '@/components/ui';
import { cn } from '@/lib/utils';

const palette = [
  { name: 'Primary', token: '--primary', description: 'Primary calls-to-action and key accents.' },
  {
    name: 'Secondary',
    token: '--secondary',
    description: 'Secondary actions and complementary accents.',
  },
  { name: 'Accent', token: '--accent', description: 'Highlight states, info badges, or links.' },
  { name: 'Muted', token: '--muted', description: 'Low-emphasis text and supporting UI.' },
];

export const metadata: Metadata = {
  title: 'Component Showcase — GAG World',
  description: 'Preview of foundational UI patterns delivered with the GAG World boilerplate.',
};

export default function ShowcasePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-24">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              Showcase
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Product-ready building blocks
            </h1>
            <p className="max-w-2xl text-sm text-muted sm:text-base">
              A quick tour of the patterns included out of the box. Mix and match these composable
              pieces to accelerate feature delivery without sacrificing polish.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className={cn(
              buttonStyles({ variant: 'secondary', size: 'md' }),
              'inline-flex items-center',
            )}
          >
            ← Back to home
          </Link>
          <Link
            href="https://nextjs.org/docs"
            className={cn(
              buttonStyles({ variant: 'ghost', size: 'md' }),
              'inline-flex items-center gap-2',
            )}
            target="_blank"
            rel="noreferrer"
          >
            View Next.js docs
          </Link>
        </div>
      </header>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/70 p-8 shadow-glass backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <p className="text-sm text-muted sm:text-base">
          Tailwind Variants power the button system, enabling instant customization from a single
          API.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Primary action</Button>
          <Button variant="secondary" size="lg">
            Secondary action
          </Button>
          <Button variant="ghost" size="lg">
            Ghost action
          </Button>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/70 p-8 shadow-glass backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold">Theme palette</h2>
        <p className="text-sm text-muted sm:text-base">
          Token-driven colors keep light and dark themes perfectly in sync. Adjust the CSS variables
          once to restyle the entire surface area.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {palette.map((color) => (
            <div
              key={color.token}
              className="flex items-center justify-between gap-6 rounded-2xl border border-foreground/10 bg-background/40 p-4 transition hover:border-foreground/15"
            >
              <div className="space-y-1">
                <p className="text-base font-medium">{color.name}</p>
                <p className="text-sm text-muted">{color.description}</p>
              </div>
              <span
                aria-hidden
                className="h-12 w-12 rounded-full shadow-inner shadow-black/10"
                style={{ backgroundColor: `hsl(var(${color.token}))` }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/70 p-8 shadow-glass backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold">Layout primitives</h2>
        <p className="text-sm text-muted sm:text-base">
          Combine cards, gradients, and glassmorphism overlays to craft hero sections and dashboards
          in minutes.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-primary/20 via-background to-secondary/30 p-6 shadow-lg">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-radial opacity-70" />
              <div className="absolute inset-y-8 left-1/2 w-40 -translate-x-1/2 rounded-full bg-gradient-conic blur-3xl" />
            </div>
            <div className="relative space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Analytics</p>
              <h3 className="text-lg font-semibold">Weekly activity</h3>
              <p className="text-sm text-muted">
                Use this structure for summary cards, onboarding flows, or feature highlights.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Design tokens</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary/80">
                System synced
              </span>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Spacing scale</span>
                <span className="font-medium">4 / 8 / 12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Radius</span>
                <span className="font-medium">1rem</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Font stack</span>
                <span className="font-medium">Geist Sans</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
