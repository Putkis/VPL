# ADR-004: Observability on Google Cloud Logging and Monitoring

- Status: Accepted
- Date: 2026-03-03

## Context

We need operational visibility without adding paid tooling in MVP by default.

## Decision

Use Google Cloud Observability as default:

- Cloud Logging for application/runtime logs
- Cloud Monitoring + alert policies for uptime and error signals

Sentry remains optional for future front-end error grouping.

## Consequences

- Pros:
  - Native integration with Cloud Run.
  - Can remain in free quotas at low volume.
  - Good baseline for incident handling.
- Cons:
  - Front-end exception grouping is weaker than dedicated error products.
  - Alert policy design must be done carefully to avoid noise.

