import { NextResponse } from "next/server";
import { z } from "zod";
import { captureServerError } from "../../../../lib/observability.server";

const clientErrorSchema = z.object({
  message: z.string().trim().min(1).max(500),
  stack: z.string().trim().max(8000).optional(),
  digest: z.string().trim().max(256).optional(),
  source: z.string().trim().min(1).max(120),
  fatal: z.boolean().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = clientErrorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const result = await captureServerError(new Error(parsed.data.message), {
    source: parsed.data.source,
    route: "/api/ops/errors",
    severity: parsed.data.fatal ? "critical" : "error",
    stackOverride: parsed.data.stack ?? null,
    metadata: {
      digest: parsed.data.digest ?? null,
      kind: "client_report"
    }
  });

  return NextResponse.json({
    ok: true,
    alertAttempted: result.alert.attempted,
    alertSent: result.alert.sent
  });
}
