# ADR-001: Host Next.js on Google Cloud Run

- Status: Accepted
- Date: 2026-03-03

## Context

We need GCP-first hosting with low initial cost and minimal ops overhead.

## Decision

Host the web application on Google Cloud Run using a containerized Next.js app.

## Consequences

- Pros:
  - Native GCP integration for logging, monitoring, IAM, and deployment.
  - Can stay near 0 EUR at low traffic with Cloud Run free tier limits.
  - No server patching/maintenance.
- Cons:
  - Requires container build/deploy workflow.
  - Billing account is required even for free-tier usage.

