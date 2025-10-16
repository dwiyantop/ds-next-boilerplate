import { notFound } from 'next/navigation';

import { getServerFeatureFlags } from '@/config/flags';
import { type FeatureFlagKey, featureFlagSchema } from '@/types/feature-flags';

import FlagToggleList from './toggle-list';

const FLAG_DESCRIPTIONS: Record<FeatureFlagKey, string> = {
  'landing.changelogCta': 'Display the changelog call-to-action button on the hero.',
  'landing.experimentalBadge': 'Show the experimental badge in the hero headline.',
};

export const metadata = {
  title: 'Feature Flags',
};

export default function FlagsPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const flags = getServerFeatureFlags();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Feature flags</h1>
        <p className="text-sm text-muted">
          Toggle feature flags locally while developing. Overrides persist in localStorage and do
          not affect server defaults.
        </p>
      </header>
      <section className="space-y-4 rounded-3xl border border-foreground/10 bg-background/60 p-6 shadow-inner">
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(featureFlagSchema.shape).map(([key]) => {
            const typedKey = key as FeatureFlagKey;
            return (
              <div
                key={key}
                className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{key}</p>
                  <p className="text-xs text-muted">{FLAG_DESCRIPTIONS[typedKey]}</p>
                </div>
                <FlagToggleList flagKey={typedKey} initial={flags[typedKey]} />
              </div>
            );
          })}
        </div>
      </section>
      <section className="space-y-2 rounded-3xl border border-foreground/10 bg-background/60 p-6 shadow-inner">
        <h2 className="text-lg font-semibold">Current snapshot</h2>
        <pre className="overflow-x-auto rounded-xl bg-foreground/10 p-4 text-xs">
          {JSON.stringify(flags, null, 2)}
        </pre>
      </section>
    </main>
  );
}
