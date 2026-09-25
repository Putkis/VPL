import { NextResponse } from "next/server";
import { buildWeekChanges } from "../../../../lib/game/week-changes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "gw-1";
  const to = url.searchParams.get("to") ?? "gw-2";

  return NextResponse.json({
    ok: true,
    from,
    to,
    ...buildWeekChanges(from, to)
  });
}
