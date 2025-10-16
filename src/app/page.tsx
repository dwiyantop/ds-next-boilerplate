import type { Route } from 'next';
import Link from 'next/link';

import { buttonStyles, ThemeToggle } from '@/components/ui';
import { isFeatureEnabled } from '@/config/flags';
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, SOCIAL_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const NAV_LINKS: { label: string; href: Route }[] = [
  { label: 'Components', href: '/showcase' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Flags', href: '/flags' },
];

const HIGHLIGHTS = [
  'Production-ready Next.js 15 foundation',
  'Tailwind tokens aligned to the dsNEXT palette',
  'OpenTelemetry logging, tracing, and metrics wired in',
  'Typed feature flags with React providers',
];

const STATS = [
  { label: 'Teams launched', value: '120+' },
  { label: 'Component primitives', value: '48' },
  { label: 'Setup time saved', value: '2× faster' },
];

const FEATURES = [
  {
    title: 'Design tokens in sync',
    description: 'Consistent spacing, typography, and color primitives tuned for product teams.',
  },
  {
    title: 'Observability baked in',
    description: 'OpenTelemetry wiring for logs, traces, and metrics from day one.',
  },
  {
    title: 'Feature flags with types',
    description: 'Schema-backed flags with hooks, dashboard, and server helpers ready to extend.',
  },
];

const TESTIMONIAL = {
  quote:
    '“dsNEXT gave us guardrails without getting in the way. From theming to telemetry, everything felt production-ready out of the box.”',
  author: 'Lina Park',
  role: 'Design Systems Lead · Orbit Labs',
};

const BOILERPLATE_SNIPPET = 'pnpm dlx create-dsnext-app';

export default function HomePage() {
  const showChangelogCta = isFeatureEnabled('landing.changelogCta');

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-grid bg-[length:160px_160px] opacity-20" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-radial-spot opacity-70" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link className="text-sm font-semibold uppercase tracking-[0.28em]" href="/">
              {APP_NAME}
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  className="transition hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonStyles({ variant: 'ghost', size: 'sm' }),
                'hidden border border-foreground/15 bg-transparent text-muted hover:text-foreground md:inline-flex',
              )}
            >
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="flex flex-col gap-9">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {APP_NAME} • {APP_TAGLINE}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Design system. Developer ready.
              </h1>
              <p className="max-w-2xl text-base text-muted sm:text-lg">{APP_DESCRIPTION}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonStyles({ size: 'lg' }),
                  'bg-accent text-slate-950 shadow-lg shadow-accent/35 hover:bg-accent/90',
                )}
              >
                Start New Project
              </a>
              <a
                href={SOCIAL_LINKS.docs}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonStyles({ variant: 'secondary', size: 'lg' }),
                  'border-foreground/15 bg-transparent text-foreground hover:border-accent/40 hover:text-accent',
                )}
              >
                Read Documentation
              </a>
              {showChangelogCta && (
                <a
                  href="https://github.com/your-org/dsnext/releases"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonStyles({ variant: 'ghost', size: 'lg' }),
                    'text-muted hover:text-foreground',
                  )}
                >
                  View Changelog
                </a>
              )}
            </div>

            <ul className="grid gap-3 text-sm text-muted sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/12 bg-surface/90 px-4 py-2 text-foreground/85 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="surface relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-6 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
            <div className="relative flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Bootstrap
                </p>
                <p className="mt-2 text-sm text-muted">
                  Scaffold a dsNEXT workspace with telemetry, theme tokens, and feature flags in
                  minutes.
                </p>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-[#06141a] px-4 py-3 text-sm text-accent shadow-inner">
                <code>{BOILERPLATE_SNIPPET}</code>
              </pre>
              <div className="grid gap-3 text-xs text-muted">
                <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-surface/70 px-3 py-2">
                  <span>Telemetry</span>
                  <span className="font-medium text-accent">OTEL-ready</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-surface/70 px-3 py-2">
                  <span>Theme tokens</span>
                  <span className="font-medium text-accent">Aligned to dsNEXT</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-surface/70 px-3 py-2">
                  <span>Feature flags</span>
                  <span className="font-medium text-accent">Schema + hooks</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="surface p-6 text-sm">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-2 text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="surface p-6">
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          <div className="surface p-6">
            <h3 className="text-lg font-semibold text-foreground">Design tokens preview</h3>
            <p className="mt-3 text-sm text-muted">
              Extend the palette without breaking alignment. Update the config once and the entire
              surfaces, borders, and typography system follow.
            </p>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-[#061822] px-4 py-3 text-accent">
                --color-background: hsl(var(--background));
              </div>
              <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-[#061822] px-4 py-3 text-accent">
                --color-primary: hsl(var(--primary));
              </div>
              <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-[#061822] px-4 py-3 text-accent">
                --color-accent: hsl(var(--accent));
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <h3 className="text-lg font-semibold text-foreground">Telemetry blueprint</h3>
            <p className="mt-3 text-sm text-muted">
              OTEL providers are wired in both server and browser contexts, with Prometheus-friendly
              endpoints ready for inspection.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> `/api/status` health + build
                metadata endpoints
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> `/api/metrics` Prometheus
                exporter
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Browser spans via
                `useTraceInteraction`
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-20">
          <div className="surface flex flex-col gap-6 p-8">
            <p className="text-base text-foreground">{TESTIMONIAL.quote}</p>
            <div className="text-xs text-muted">
              <p className="font-semibold text-foreground">{TESTIMONIAL.author}</p>
              <p>{TESTIMONIAL.role}</p>
            </div>
          </div>
        </section>

        <section className="mt-16 surface flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Build once. Scale everywhere.</h3>
            <p className="mt-2 text-sm text-muted">
              Clone the repo, adjust tokens, and ship with the same stack that powers the dsNEXT
              design system.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonStyles({ size: 'md' }),
                'bg-accent text-slate-950 shadow-lg shadow-accent/35 hover:bg-accent/90',
              )}
            >
              Clone Repository
            </a>
            <a
              href={SOCIAL_LINKS.docs}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonStyles({ variant: 'ghost', size: 'md' }),
                'text-muted hover:text-foreground',
              )}
            >
              View Docs
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
