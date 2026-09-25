import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdminEmail } from "../../../../../lib/game/admin";
import {
  buildOverallTable,
  buildPlayerScoreBreakdown,
  buildTeamGameweekScores
} from "../../../../../lib/game/scoring";
import { markScoreRun } from "../../../../../lib/game/results-store";
import { seedGameweeks } from "../../../../../lib/game/seed-data";

const runScoreSchema = z.object({
  gameweekSlug: z.string().trim().min(1)
});

export async function POST(request: Request) {
  let adminEmail: string | null;
  try {
    adminEmail = await getAuthenticatedAdminEmail(request);
  } catch {
    return NextResponse.json({ ok: false, code: "auth_unavailable" }, { status: 503 });
  }
  if (!adminEmail) {
    return NextResponse.json({
      ok: false,
      code: "forbidden",
      message: "Vain admin voi kaynnistaa pisteytyksen."
    }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = runScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  if (!seedGameweeks.some((gameweek) => gameweek.slug === parsed.data.gameweekSlug)) {
    return NextResponse.json({ ok: false, code: "unknown_gameweek" }, { status: 400 });
  }

  const scoreRun = markScoreRun(parsed.data.gameweekSlug, adminEmail);

  return NextResponse.json({
    ok: true,
    scoreRun,
    playerScores: buildPlayerScoreBreakdown(parsed.data.gameweekSlug),
    teamScores: buildTeamGameweekScores(parsed.data.gameweekSlug),
    overallTable: buildOverallTable()
  });
}
