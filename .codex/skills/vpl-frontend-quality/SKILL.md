---
name: vpl-frontend-quality
description: Standard quality workflow for VPL frontend implementation in Next.js. Use when working on pages, components, forms, styling, UX, accessibility, client-side validation, and frontend performance tasks. Apply this skill when implementing or reviewing frontend GitHub issues to keep scope, testing, and acceptance criteria consistent.
---

# VPL Frontend Quality

Follow this workflow for every frontend task.

## Global Delivery Constraints

- Keep each PR limited to one issue and one vertical slice.
- Keep PR size small: target at most 8 changed files and 300 net LOC.
- Split work into follow-up PRs when the change exceeds those limits.
- Run `pnpm test` and require a passing result before review-ready status.
- Run `pnpm test:coverage` and require a passing result before review-ready status.

## 1) Lock Scope

- Identify issue goal, acceptance criteria, and non-goals.
- List touched surfaces: page routes, UI components, form states, analytics events.
- Keep changes minimal to the issue scope.

## 2) Design Before Coding

- Define UI states first: loading, empty, success, error.
- Define responsive behavior for mobile and desktop.
- Define accessibility behavior for keyboard and screen reader use.

## 3) Implement Predictably

- Keep data validation explicit at input boundaries.
- Keep components composable and avoid duplicate state logic.
- Keep user-facing errors actionable and specific.
- Keep visual consistency with existing product direction.

## 4) Verify With Gates

- Run the checklist in `references/quality-gates.md`.
- Verify issue acceptance criteria one by one.
- Run available tests and add missing tests for changed behavior.

## 5) Report Completion

- Summarize implemented behavior and user impact.
- Note test coverage and known limitations.
- Map completed behavior directly back to issue criteria.
