# VPL

Veikkausliiga fantasy MVP foundation.

## Locked MVP Stack

- Runtime: Node.js 22
- Package manager: pnpm
- Frontend/Backend: Next.js
- Hosting: Google Cloud Run
- Database/Auth: Supabase (Postgres + Auth, EU region)
- ORM: Drizzle
- CI/CD: GitHub Actions + Artifact Registry + Cloud Run deploy
- Scheduled jobs: Cloud Scheduler -> Cloud Run Job
- Observability: Google Cloud Logging + Monitoring
- Testing: Vitest + Playwright

## 0 EUR MVP Model

This repo is set up so initial operation can stay close to 0 EUR while usage is low:

- Cloud Run within free tier limits
- Supabase Free plan
- GitHub Actions within free minutes limits
- No paid analytics dependency by default

Note: Billing accounts are still required for GCP services.

## Project Setup

```bash
pnpm install
pnpm dev
```

## Deploy Prerequisites

Set these GitHub repository secrets:

- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional repository variables:

- `GCP_REGION` (default `europe-north1`)
- `ARTIFACT_REGISTRY_REPO` (default `vpl`)
- `CLOUD_RUN_SERVICE` (default `vpl-web`)

## Architecture Decisions

See [`docs/adr/`](docs/adr/) for the locked decisions and rationale.

## Operations

- Cloud Scheduler setup: [`docs/operations/cloud-scheduler.md`](docs/operations/cloud-scheduler.md)

## Analytics Tracking (Plausible)

This project uses Plausible for funnel tracking on the landing page.

Required env var:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (for example `vpl.example.com`)

Tracked events:

- `page_view`
- `signup_submit`
- `signup_success`
- `signup_error` (with `reason`: `invalid_email`, `server_error`, or `network_error`)

Conversion dashboard setup:

- Use `signup_success / page_view` as the core conversion ratio.
- Segment by `signup_error.reason` to see where drop-offs happen.
