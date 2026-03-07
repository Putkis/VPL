Use the approved plan for GitHub issue #<NUMBER> and implement it now.

Use the VPL project quality skills as needed:
- $vpl-frontend-quality
- $vpl-backend-quality
- $vpl-ops-quality
- $vpl-research-quality

Execution requirements:
- Keep scope strictly to the approved issue plan.
- Keep PR size small: one issue/one vertical slice per PR.
- Target at most 8 changed files and 300 net LOC; if larger, split into follow-up PRs.
- Make code changes directly in this repository.
- Preserve existing unrelated changes.
- If blocked, continue with unblocked parts and report blockers clearly.

Verification requirements:
- Run relevant lint/build/tests for changed areas.
- Add or update tests for behavior changes.
- Verify implementation against issue acceptance criteria.
- `pnpm test` must pass before PR is review-ready.
- `pnpm test:coverage` must pass before PR is review-ready.

Output format:
1. What changed
2. Files changed
3. Test and command results
4. Acceptance criteria mapping
5. Remaining risks or follow-ups
