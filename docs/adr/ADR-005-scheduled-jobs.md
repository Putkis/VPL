# ADR-005: Schedule scoring with Cloud Scheduler and Cloud Run Jobs

- Status: Accepted
- Date: 2026-03-03

## Context

Fantasy scoring, locks, and periodic maintenance need predictable background execution.

## Decision

Use Cloud Run Jobs for scoring tasks, triggered by Cloud Scheduler.

## Consequences

- Pros:
  - Managed execution model, no always-on worker needed.
  - Clear separation from web traffic path.
  - Fits periodic gameweek processing.
- Cons:
  - Requires separate deployment flow and service account permissions.
  - Retry/idempotency must be designed in job logic.

