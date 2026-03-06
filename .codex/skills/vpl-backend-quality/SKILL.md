---
name: vpl-backend-quality
description: Standard quality workflow for VPL backend implementation. Use when working on API routes, database schema, migrations, auth, scoring logic, validation, and business rules. Apply this skill when implementing or reviewing backend GitHub issues so data integrity, idempotency, and test quality remain consistent.
---

# VPL Backend Quality

Follow this workflow for every backend task.

## 1) Lock Contract

- Define input schema, output schema, and failure modes.
- Define authorization requirements for every endpoint.
- Define invariants that must always hold in storage.

## 2) Model Data Safely

- Encode constraints in schema and not only in application code.
- Add indexes needed for expected access paths.
- Plan migration and rollback behavior before applying changes.

## 3) Implement Business Rules

- Keep rule evaluation deterministic and testable.
- Keep side effects explicit and traceable.
- Keep operations idempotent where retries are expected.

## 4) Verify With Gates

- Run the checklist in `references/quality-gates.md`.
- Verify issue acceptance criteria one by one.
- Run tests for happy path, validation failures, and permissions.

## 5) Report Completion

- Summarize contract changes and migration impact.
- List any operational risks and mitigation.
- Map completed behavior directly back to issue criteria.
