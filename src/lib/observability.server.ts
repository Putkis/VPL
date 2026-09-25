import "server-only";

import { getRuntimeTags, normalizeError } from "./observability";

type ErrorSeverity = "error" | "critical";

type ErrorContext = {
  source: string;
  route?: string;
  viewerKey?: string;
  severity?: ErrorSeverity;
  metadata?: Record<string, unknown>;
  stackOverride?: string | null;
};

type AlertResult = {
  attempted: boolean;
  sent: boolean;
};

function getAlertWebhookUrl() {
  return process.env.ALERT_WEBHOOK_URL?.trim() || null;
}

function buildErrorEntry(error: unknown, context: ErrorContext) {
  const normalizedError = normalizeError(error);

  return {
    event: "application_error",
    level: context.severity ?? "error",
    timestamp: new Date().toISOString(),
    ...getRuntimeTags(),
    source: context.source,
    route: context.route ?? null,
    viewerKey: context.viewerKey ?? null,
    errorName: normalizedError.name,
    message: normalizedError.message,
    stack: context.stackOverride ?? normalizedError.stack,
    metadata: context.metadata ?? null
  };
}

async function sendCriticalAlert(entry: ReturnType<typeof buildErrorEntry>): Promise<AlertResult> {
  const alertWebhookUrl = getAlertWebhookUrl();
  if (!alertWebhookUrl) {
    return {
      attempted: false,
      sent: false
    };
  }

  const response = await fetch(alertWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: `[${entry.environment}] ${entry.source}: ${entry.message}`,
      entry
    })
  }).catch(() => null);

  return {
    attempted: true,
    sent: Boolean(response?.ok)
  };
}

export async function captureServerError(error: unknown, context: ErrorContext) {
  const entry = buildErrorEntry(error, context);
  console.error(JSON.stringify(entry));

  const alert =
    entry.level === "critical"
      ? await sendCriticalAlert(entry)
      : {
          attempted: false,
          sent: false
        };

  return {
    entry,
    alert
  };
}
