import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminViewer } from "../../../../../lib/game/admin";
import { captureServerError } from "../../../../../lib/observability.server";

const testAlertSchema = z.object({
  viewerKey: z.string().trim().min(3).max(120),
  message: z.string().trim().min(3).max(280).optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = testAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  if (!isAdminViewer(parsed.data.viewerKey)) {
    return NextResponse.json(
      { ok: false, code: "forbidden", message: "Admin-oikeus puuttuu." },
      { status: 403 }
    );
  }

  if (!process.env.ALERT_WEBHOOK_URL?.trim()) {
    return NextResponse.json(
      { ok: false, code: "alert_not_configured", message: "Alert-webhookia ei ole maaritetty." },
      { status: 503 }
    );
  }

  const result = await captureServerError(
    new Error(parsed.data.message ?? "Manual critical alert test"),
    {
      source: "admin.test-alert",
      route: "/api/admin/ops/test-alert",
      severity: "critical",
      viewerKey: parsed.data.viewerKey,
      metadata: {
        kind: "staging_test"
      }
    }
  );

  return NextResponse.json({
    ok: true,
    alertAttempted: result.alert.attempted,
    alertSent: result.alert.sent,
    environment: result.entry.environment,
    release: result.entry.release
  });
}
