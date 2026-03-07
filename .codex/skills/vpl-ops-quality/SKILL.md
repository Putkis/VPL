---
name: vpl-ops-quality
description: Standard quality workflow for VPL operations and release tasks. Use when working on CI/CD, Cloud Run deploys, jobs, scheduler, secrets, monitoring, alerting, runbooks, and reliability changes. Apply this skill when implementing or reviewing ops GitHub issues to keep deployment safety and observability consistent.
---

# VPL Ops Quality

Follow this workflow for every ops task.

## Global Delivery Constraints

- Keep each PR limited to one issue and one vertical slice.
- Keep PR size small: target at most 8 changed files and 300 net LOC.
- Split work into follow-up PRs when the change exceeds those limits.
- Run `pnpm test` and require a passing result before review-ready status.
- Run `pnpm test:coverage` and require a passing result before review-ready status.

## 1) Lock Change Risk

- Define blast radius, rollback path, and verification checkpoints.
- Define required secrets, IAM roles, and environment changes.
- Define what success and failure look like in logs and metrics.

## 2) Implement Safely

- Keep deployments repeatable and scriptable.
- Keep configuration explicit and environment-scoped.
- Keep credentials out of source control and logs.

## 3) Verify Deployment Behavior

- Validate build and deploy workflow behavior.
- Validate runtime health, logs, and alert hooks.
- Validate scheduled jobs and retry behavior where relevant.

## 4) Verify With Gates

- Run the checklist in `references/quality-gates.md`.
- Verify issue acceptance criteria one by one.
- Capture evidence: command output, revision id, and timestamps.

## 5) Report Completion

- Summarize what changed in infra and runtime.
- Provide rollback instructions for the exact change.
- Map completed behavior directly back to issue criteria.
