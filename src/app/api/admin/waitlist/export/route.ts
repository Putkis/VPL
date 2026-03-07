import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { readServerEnv } from "../../../../../lib/env.server";

function createWaitlistClient() {
  const env = readServerEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}

export async function GET(request: Request) {
  const configuredToken = process.env.WAITLIST_EXPORT_TOKEN;
  const requestToken = request.headers.get("x-admin-export-token");

  if (!configuredToken) {
    return NextResponse.json(
      { ok: false, code: "export_not_configured" },
      { status: 503 }
    );
  }

  if (requestToken !== configuredToken) {
    return NextResponse.json(
      { ok: false, code: "unauthorized" },
      { status: 401 }
    );
  }

  const supabase = createWaitlistClient();
  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("email,top_feature_interest,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "server_error" },
      { status: 500 }
    );
  }

  const header = "email,top_feature_interest,created_at";
  const rows = (data ?? []).map((row) =>
    [
      escapeCsvValue(String(row.email ?? "")),
      escapeCsvValue(String(row.top_feature_interest ?? "")),
      escapeCsvValue(String(row.created_at ?? ""))
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"waitlist-signups.csv\""
    }
  });
}
