import Link from 'next/link';

import { requireSession } from '@/lib/auth/mock-session';
import { getChangelogEntries } from '@/lib/data/changelog';

export default async function DashboardPage() {
  const session = await requireSession();
  const changelog = await getChangelogEntries();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <section className="flex flex-col gap-2 rounded-3xl border border-foreground/10 bg-background/70 p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Welcome back, {session.user.name}</h1>
        <p className="text-sm text-muted">
          This dashboard route is protected by a simple middleware + session helper. Replace the
          mock auth in
          <code className="mx-1 rounded bg-foreground/10 px-1 py-0.5">
            src/lib/auth/mock-session.ts
          </code>{' '}
          with your real identity provider.
        </p>
        <form className="mt-4 flex flex-col gap-2" action="/api/auth/demo" method="post">
          <button className="self-start rounded-full border border-foreground/20 px-4 py-2 text-xs text-muted transition hover:border-foreground/40">
            Regenerate demo session cookie
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Changelog highlights</h2>
          <Link className="text-xs font-medium text-primary underline" href="/showcase">
            Browse UI components
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {changelog.map((entry) => (
            <article
              key={entry.version}
              className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-background/70 p-5 shadow-inner"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {entry.date}
              </span>
              <h3 className="text-sm font-semibold">{entry.version}</h3>
              <p className="text-xs text-muted">{entry.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
