# dsNEXT Boilerplate

Modern, opinionated Next.js 15 starter crafted for design-system driven teams. dsNEXT brings a cohesive Tailwind palette, observability scaffolding, feature flags, and production-ready DX so you can build once and scale everywhere.

## Table of contents

1. [Overview](#overview)
2. [Stack & tooling](#stack--tooling)
3. [Getting started](#getting-started)
4. [Project scripts](#project-scripts)
5. [Folder layout](#folder-layout)
6. [Observability](#observability)
7. [Feature flags](#feature-flags)
8. [Testing & quality](#testing--quality)
9. [Docker & local infra](#docker--local-infra)
10. [CI pipeline](#ci-pipeline)
11. [Authentication demo](#authentication-demo)
12. [Data fetching example](#data-fetching-example)
13. [Performance budgets](#performance-budgets)
14. [Deployment](#deployment)
15. [Environment variables](#environment-variables)
16. [Next steps](#next-steps)

## Overview

- **Name:** dsNEXT — _Build once. Scale everywhere._
- **Purpose:** A design-system baseline for Next.js projects requiring dependable tooling, telemetry, and typography.
- **Audience:** Product teams that care about maintainability, developer experience, and visual consistency.
- **Tone:** Calm, confident, technical.

## Stack & tooling

| Area                 | Tech                                                 |
| -------------------- | ---------------------------------------------------- |
| Framework            | Next.js 15 (App Router)                              |
| Language             | TypeScript (strict mode)                             |
| Styling              | Tailwind CSS 3 with dsNEXT token palette             |
| Fonts                | Geist Sans / Geist Mono                              |
| Package manager      | pnpm                                                 |
| Linting & formatting | ESLint 9, Prettier 3, lint-staged, Husky             |
| Testing              | Vitest (node environment)                            |
| Telemetry            | OpenTelemetry logs, traces, metrics + OTLP exporters |
| Feature flags        | Typed schema + React provider                        |

## Getting started

```bash
git clone <repo-url> dsnext
cd dsnext
cp .env.example .env.local
pnpm install
pnpm dev
```

Visit <http://localhost:3000> to explore the hero experience, theme toggle, and feature flag dashboard.

## Project scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Run Next.js in development (Turbopack).        |
| `pnpm build`      | Production build.                              |
| `pnpm start`      | Start the production server.                   |
| `pnpm lint`       | ESLint across the repo (warnings fail).        |
| `pnpm type-check` | TypeScript `--noEmit` validation.              |
| `pnpm test`       | Vitest integration/unit suite.                 |
| `pnpm format`     | Prettier write mode.                           |
| `pnpm perf`       | Lighthouse CI budgets (requires `pnpm build`). |
| `pnpm prepare`    | Install Husky hooks (auto-run after install).  |

## Folder layout

```
.
├── app/
│   ├── (routes)/flags      # Dev-only feature flag dashboard
│   ├── (routes)/dashboard  # Protected demo route using mock auth
│   ├── (routes)/showcase   # Component showcases
│   ├── api/auth/demo       # Demo session endpoint
│   ├── api/log             # OTEL log ingestion
│   ├── api/metrics         # Prometheus exporter
│   ├── api/status          # Health/readiness endpoint
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Hero (dsNEXT brand)
│   └── providers.tsx       # Client telemetry + trace helpers
├── components/
│   ├── layout/             # Theme + feature flag providers
│   └── ui/                 # Button, theme toggle, etc.
├── config/                 # Runtime config (env, theme, telemetry, flags)
├── hooks/                  # Reusable hooks (feature flag, trace interaction...)
├── lib/
│   ├── auth/               # Mock session helpers
│   ├── data/               # Demo changelog data
│   ├── logging/            # OTEL logger + client transports
│   └── telemetry/          # Web vitals instrumentation
├── styles/                 # Tailwind global styles + tokens
├── types/                  # Shared TypeScript types & schemas
├── middleware.ts           # Demo auth guard for /dashboard
├── instrumentation.ts      # Server-side OTEL bootstrap
└── vitest.config.ts        # Vitest setup
```

## Observability

### Server runtime

- `instrumentation.ts` registers OTEL providers (logs, traces, metrics) and HTTP instrumentation.
- `/api/status` returns service identity, build metadata, feature flag snapshot, and OTLP endpoint health.
- `/api/metrics` exposes Prometheus text format (e.g., `app_startups_total`).
- Logs flow through `otelLogger` and respect `OTEL_LOGS_EXPORTER`.

### Browser runtime

- `ClientProviders` initialises `@opentelemetry/sdk-trace-web`, records navigation spans, and exposes `useTraceInteraction` for spans around user actions.
- Web Vitals emit OTLP histograms via `web-vitals` integration (`src/lib/telemetry/web-vitals.ts`).
- Client logs (`logClientError`, `logClientMessage`) send to `/api/log` with retry/backoff and include browser metadata.

### Recommended workflow

1. Point `OTEL_*` env vars to your collector (Fluent Bit, Grafana Alloy, etc.).
2. Run `docker compose up otel-collector` locally for quick experiments.
3. Build dashboards around spans, metrics, and log levels.

## Feature flags

- Schema lives in `src/types/feature-flags.ts` with typed keys (`landing.changelogCta`, `landing.experimentalBadge`).
- Server defaults via `FEATURE_FLAGS`; client overrides via `NEXT_PUBLIC_FEATURE_FLAGS`.
- Server components call `isFeatureEnabled(key)`; client components use `useFeatureFlag(key)`.
- `/flags` route (dev-only) lets you toggle flags; overrides persist in `localStorage`.

## Testing & quality

- `pnpm lint` – ESLint (warnings fail the run).
- `pnpm test` – Vitest suite covering `/api/log`, `/api/metrics`, `/api/status`.
- `pnpm perf` – Lighthouse CI budgets (configured in `lighthouserc.json`).
- Suggested additions: Playwright smoke tests for theme switching, flag toggles, dashboard auth flow.

## Docker & local infra

- **Dockerfile** – Multi-stage build (`deps` → `build` → `runtime`), runs as non-root user.
- **.dockerignore** – Excludes caches, env files, editor configs for lean images.
- **compose.yaml** – Launches the app alongside a demo OpenTelemetry Collector (`ops/otel-collector.yaml`).

## CI & release pipeline

- `.github/workflows/ci.yml` runs lint, test, type-check, and build on pushes/PRs to `main`.
- A manual job (`workflow_dispatch`) triggers semantic-release. It:
  - runs `pnpm release` to bump versions, update `CHANGELOG.md`, tag the repo, and open a GitHub release with generated notes.
  - deploys to Vercel using `vercel/action@v2`. Provide repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` with the values from your Vercel project.
- Release notes use conventional commits; the GitHub release title matches the version and the description mirrors the generated changelog.

## Authentication demo

- `middleware.ts` guards `/dashboard` using a demo cookie/header (`demo-auth-token`).
- `/login` + `/api/auth/demo` issue the cookie for quick testing.
- Replace `src/lib/auth/mock-session.ts` with your real identity provider.

## Data fetching example

- `src/lib/data/changelog.ts` provides sample releases.
- `src/app/(routes)/dashboard/page.tsx` demonstrates using authenticated data in server components.

## Performance budgets

- `lighthouserc.json` enforces performance ≥ 0.80 and accessibility/best-practices/SEO ≥ 0.90.
- Run `pnpm build && pnpm perf` locally or in CI.

## Deployment

This boilerplate provides local infra helpers (Dockerfile, compose.yaml) but leaves production hosting up to you. Pick the target that fits your team (Vercel, Docker/Kubernetes, Fly.io, etc.) and reuse the scripts above.

Suggested flow:

1. Configure environment variables in your platform.
2. Ensure OTLP collectors/endpoints are reachable (or disable exporters).
3. Build & start the app:

   ```bash
   pnpm build
   pnpm start
   ```

4. In CI/CD, run at minimum `pnpm lint`, `pnpm test`, `pnpm type-check`, and `pnpm build` before deploy.

### Want Docker?

- Build a local image: `docker build -t dsnext .`
- Run with the collector: `docker compose up --build`
- Provide production environment variables (`OTEL_*`, feature flags, etc.) via your orchestrator or `.env.production`.

## Environment variables

| Variable                                         | Type                      | Default                 | Notes                                                     |
| ------------------------------------------------ | ------------------------- | ----------------------- | --------------------------------------------------------- |
| `NODE_ENV`                                       | string                    | `development`           | Automatically set by Next.js in production.               |
| `FEATURE_FLAGS`                                  | JSON / key:value          | —                       | Server-only defaults for feature flags.                   |
| `OTEL_SERVICE_NAME`                              | string                    | `dsnext`                | Used for telemetry resource attributes and storage slugs. |
| `OTEL_LOGS_EXPORTER`                             | `console`\|`otlp`         | `console`               | Switch to `otlp` to ship logs.                            |
| `OTEL_TRACES_EXPORTER`                           | `console`\|`otlp`\|`none` | `none`                  | Enable when a collector is available.                     |
| `OTEL_METRICS_EXPORTER`                          | `console`\|`otlp`\|`none` | `none`                  | Enable when a collector is available.                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                    | URL                       | —                       | Base OTLP endpoint.                                       |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`             | URL                       | —                       | Overrides trace endpoint.                                 |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`            | URL                       | —                       | Overrides metric endpoint.                                |
| `OTEL_EXPORTER_OTLP_HEADERS`                     | string                    | —                       | Comma-separated headers (`key=value`).                    |
| `NEXT_PUBLIC_SITE_URL`                           | URL                       | `http://localhost:3000` | Used for metadata and canonical tags.                     |
| `NEXT_PUBLIC_FEATURE_FLAGS`                      | JSON / key:value          | —                       | Client-visible flag overrides.                            |
| `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`        | URL                       | —                       | Browser OTLP endpoint (optional).                         |
| `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | URL                       | —                       | Browser trace-specific endpoint.                          |
| `VERCEL_TOKEN`                                   | secret                    | —                       | Required for release job to deploy via Vercel.            |
| `VERCEL_ORG_ID`                                  | secret                    | —                       | Vercel organization ID for deployment.                    |
| `VERCEL_PROJECT_ID`                              | secret                    | —                       | Vercel project ID for deployment.                         |

See `.env.example` for a starter template.

## Next steps

- Swap the mock auth/data layers for your real services.
- Integrate Playwright or Cypress to capture end-to-end flows.
- Extend the component library (inputs, tables, navigation) in `/showcase`.
- Wire up deployment (Vercel, Render, Kubernetes, etc.) using the provided Dockerfile or your own pipeline.
- Build Grafana dashboards or alerting rules against `/api/status` and `/api/metrics`.

---

_Design system. Developer ready._
