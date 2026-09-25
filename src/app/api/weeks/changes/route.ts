import { NextResponse } from "next/server";
import { buildWeekChanges } from "../../../../lib/game/week-changes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "gw-1";
  const to = url.searchParams.get("to") ?? "gw-2";
  const changes = buildWeekChanges(from, to);

  if (!changes.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: changes.code,
        message: changes.message,
        from,
        to
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    from,
    to,
    teamChanges: changes.teamChanges,
    playerMovers: changes.playerMovers
  });
}
