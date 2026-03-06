# Ops Quality Gates

## Change safety gates

- Define rollback before deployment.
- Define verification checkpoints before and after change.
- Avoid combining unrelated infra changes in one deploy.

## CI/CD gates

- Ensure CI checks are deterministic and non-interactive.
- Ensure failed build blocks deployment path.
- Ensure environment-specific deploy behavior is explicit.

## Security gates

- Keep secrets in secret managers or CI secret store only.
- Keep least-privilege IAM for services and jobs.
- Keep auditability for who changed what and when.

## Observability gates

- Ensure key errors are logged with useful context.
- Ensure alerts exist for critical failures.
- Ensure alert route reaches a human owner.

## Runtime gates

- Verify service start, request handling, and shutdown behavior.
- Verify scheduled job trigger and completion behavior.
- Verify timeout, retry, and idempotency expectations.

## Release evidence gates

- Capture service revision/image digest after deploy.
- Capture health check or smoke-test result.
- Capture post-deploy log check window.
