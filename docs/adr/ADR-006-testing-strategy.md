# ADR-006: Testing with Vitest and Playwright

- Status: Accepted
- Date: 2026-03-03

## Context

We need fast confidence in core game logic and basic user flows with minimal test overhead.

## Decision

Use:

- Vitest for unit/integration tests (scoring logic, utils, data transforms)
- Playwright for key end-to-end flow checks (auth, team create, leaderboard view)

## Consequences

- Pros:
  - Fast local and CI feedback.
  - Good balance between coverage and maintenance.
- Cons:
  - Browser tests can be flaky if not isolated well.
  - Requires disciplined test data setup for repeatability.

