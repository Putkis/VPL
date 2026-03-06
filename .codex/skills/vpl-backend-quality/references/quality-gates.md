# Backend Quality Gates

## Contract gates

- Validate request payloads at boundary.
- Return stable response shape and status codes.
- Return actionable error messages for expected failures.

## Auth and security gates

- Enforce auth and role checks server-side.
- Prevent privilege escalation by default-deny behavior.
- Avoid leaking internal error details to clients.

## Data integrity gates

- Enforce constraints in schema where possible.
- Avoid orphan records and broken references.
- Use transactions for multi-step state transitions.

## Migration gates

- Keep migrations forward-applicable and reproducible.
- Provide rollback strategy for risky changes.
- Verify migration on a clean database.

## Logic gates

- Keep scoring and rule logic deterministic.
- Keep retry-sensitive operations idempotent.
- Record enough context for debugging failed runs.

## Test gates

- Cover happy path and rejection path.
- Cover authorization failures.
- Cover edge cases around deadlines and repeated requests.
- Run `pnpm test` and require a passing result before marking PR review-ready.
- Run `pnpm test:coverage` and require a passing result before marking PR review-ready.

## Release gates

- Document new env vars and secrets usage.
- Document API or schema changes for dependent surfaces.
- Confirm issue acceptance criteria are all verifiable.
- Keep PR limited to one issue and one vertical slice.
- Keep PR size target at most 8 changed files and 300 net LOC.
