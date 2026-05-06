import { NextResponse } from "next/server";
import { getLeaderboard, getLeaderboardSummary } from "../../../lib/game/leaderboard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") as "global" | "friends" | null) ?? "global";

  return NextResponse.json({
    ok: true,
    scope,
    summary: getLeaderboardSummary(),
    rows: getLeaderboard(scope)
  });
}
