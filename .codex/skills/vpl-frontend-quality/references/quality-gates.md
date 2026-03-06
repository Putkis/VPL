# Frontend Quality Gates

## Scope gates

- Confirm issue goal in one sentence before coding.
- Confirm non-goals in one sentence before coding.
- Confirm changed routes/components list.

## UX gates

- Support loading, success, and error states.
- Avoid dead-end errors without user recovery path.
- Keep mobile and desktop layout usable.

## Accessibility gates

- Keep semantic headings and labels.
- Keep keyboard navigation intact.
- Keep form errors connected to inputs.

## Data and validation gates

- Validate all user input explicitly.
- Reject malformed values with clear messages.
- Avoid hidden client-only assumptions.

## Performance gates

- Avoid unnecessary client components.
- Avoid duplicate network calls for the same state.
- Keep page load behavior stable.

## Test gates

- Add or update unit tests for logic changes.
- Add or update e2e/smoke test for critical flow changes.
- Verify acceptance criteria manually when automation is missing.
- Run `pnpm test` and require a passing result before marking PR review-ready.
- Run `pnpm test:coverage` and require a passing result before marking PR review-ready.

## Release gates

- Confirm no debug output or temporary placeholders.
- Confirm analytics events are intentional and named consistently.
- Confirm copy and CTA text are final for this issue scope.
- Keep PR limited to one issue and one vertical slice.
- Keep PR size target at most 8 changed files and 300 net LOC.
