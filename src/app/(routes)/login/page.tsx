import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <section className="rounded-3xl border border-foreground/10 bg-background/70 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Demo login</h1>
        <p className="mt-2 text-sm text-muted">
          This boilerplate does not ship with a full auth stack. Use the button below to set a demo
          cookie so you can explore protected routes like the dashboard.
        </p>
        <form className="mt-6 flex flex-col gap-3" action="/api/auth/demo" method="post">
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Sign in as demo user
          </button>
        </form>
        <p className="mt-6 text-xs text-muted">
          Already authenticated? Head straight to the{' '}
          <Link className="text-primary underline" href="/dashboard">
            dashboard
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
