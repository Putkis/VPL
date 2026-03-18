import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readServerEnv } from "../../../lib/env.server";
import { captureServerError } from "../../../lib/observability.server";

const featureInterestOptions = [
  "live_scores",
  "player_stats",
  "friend_leagues",
  "transfer_tools",
  "other"
] as const;

const waitlistPayloadSchema = z.object({
  email: z.string().trim().email().max(254),
  topFeatureInterest: z.enum(featureInterestOptions)
});

type WaitlistPayload = z.infer<typeof waitlistPayloadSchema>;

function createWaitlistClient() {
  const env = readServerEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

async function saveSignup(payload: WaitlistPayload) {
  const supabase = createWaitlistClient();
  const { error } = await supabase.from("waitlist_signups").upsert(payload, {
    onConflict: "email",
    ignoreDuplicates: true
  });

  if (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_payload" },
      { status: 400 }
    );
  }

  const parsedPayload = waitlistPayloadSchema.safeParse(body);
  if (!parsedPayload.success) {
    const hasEmailError = parsedPayload.error.issues.some(
      (issue) => issue.path[0] === "email"
    );
    const errorCode = hasEmailError ? "invalid_email" : "invalid_feature_interest";

    return NextResponse.json(
      { ok: false, code: errorCode },
      { status: 400 }
    );
  }

  try {
    await saveSignup(parsedPayload.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    await captureServerError(error, {
      source: "waitlist.signup",
      route: "/api/waitlist",
      severity: "critical",
      metadata: {
        email: parsedPayload.data.email,
        topFeatureInterest: parsedPayload.data.topFeatureInterest
      }
    });

    return NextResponse.json(
      { ok: false, code: "server_error" },
      { status: 500 }
    );
  }
}
