# GitHub Actions secrets

Configure deployment secrets in the repository's **Settings → Secrets and variables → Actions → Repository secrets**.

## `ADMIN_EMAILS`

Add the comma-separated email addresses of users allowed to enter or edit match results, for example `admin1@example.com,admin2@example.com`. Keep the value in the GitHub secret; do not commit it to the repository. If the secret is missing or empty, admin result endpoints remain unavailable (fail closed).

## `ALERT_WEBHOOK_URL`

Add the destination webhook URL used for critical error alerts. Treat it as a credential: store it only as a GitHub secret and never commit or print its value. If it is missing, alert delivery is disabled; the application can still log errors. Configure the secret only after the destination webhook is ready.

## Apply changes

Repository administrators can add or update either secret from the settings page above. GitHub Actions and deployment workflows read the secrets during their next run. These secrets are intentionally not configured as part of this change; add them only when the corresponding production feature is ready to be enabled.
