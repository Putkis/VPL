import { NextResponse } from "next/server";
import { getLeaderboard, getLeaderboardSummary } from "../../../lib/game/leaderboard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedScope = url.searchParams.get("scope");
  const scope = requestedScope === "friends" ? "friends" : "global";

  return NextResponse.json({
    ok: true,
    scope,
    summary: getLeaderboardSummary(),
    rows: getLeaderboard(scope)
  });
}
