import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readServerEnv } from "../../../lib/env.server";

const waitlistPayloadSchema = z.object({
  email: z.string().trim().email().max(254)
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
    return NextResponse.json(
      { ok: false, code: "invalid_email" },
      { status: 400 }
    );
  }

  try {
    await saveSignup(parsedPayload.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, code: "server_error" },
      { status: 500 }
    );
  }
}
