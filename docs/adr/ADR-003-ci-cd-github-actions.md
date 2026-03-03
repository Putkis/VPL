# ADR-003: CI/CD with GitHub Actions

- Status: Accepted
- Date: 2026-03-03

## Context

Repository and issues are managed in GitHub. We need automated build, test, and deployment.

## Decision

Use GitHub Actions for:

- CI on pull requests and main branch pushes
- Container image build and push to Artifact Registry
- Deployments to Cloud Run via Workload Identity Federation

## Consequences

- Pros:
  - Single platform for code + automation.
  - No static credentials needed when using OIDC federation.
  - Fast feedback loop for solo development.
- Cons:
  - CI minutes can become a cost factor if usage grows.
  - Workflow maintenance is required as infra evolves.

