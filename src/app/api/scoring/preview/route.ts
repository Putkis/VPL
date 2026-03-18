import { NextResponse } from "next/server";
import {
  buildOverallTable,
  buildPlayerScoreBreakdown,
  buildTeamGameweekScores
} from "../../../../lib/game/scoring";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const gameweek = url.searchParams.get("gameweek") ?? "gw-2";

  return NextResponse.json({
    ok: true,
    gameweek,
    playerScores: buildPlayerScoreBreakdown(gameweek),
    teamScores: buildTeamGameweekScores(gameweek),
    overallTable: buildOverallTable()
  });
}
