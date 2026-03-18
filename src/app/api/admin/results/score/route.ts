import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminEmails, isAdminViewer } from "../../../../../lib/game/admin";
import {
  buildOverallTable,
  buildPlayerScoreBreakdown,
  buildTeamGameweekScores
} from "../../../../../lib/game/scoring";
import { markScoreRun } from "../../../../../lib/game/results-store";
import { seedGameweeks } from "../../../../../lib/game/seed-data";

const runScoreSchema = z.object({
  viewerKey: z.string().trim().min(3),
  gameweekSlug: z.string().trim().min(1)
});

export async function POST(request: Request) {
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

  if (!isAdminViewer(parsed.data.viewerKey)) {
    return NextResponse.json(
      {
        ok: false,
        code: "forbidden",
        message: "Vain admin voi kaynnistaa pisteytyksen.",
        admins: getAdminEmails()
      },
      { status: 403 }
    );
  }

  if (!seedGameweeks.some((gameweek) => gameweek.slug === parsed.data.gameweekSlug)) {
    return NextResponse.json({ ok: false, code: "unknown_gameweek" }, { status: 400 });
  }

  const scoreRun = markScoreRun(parsed.data.gameweekSlug, parsed.data.viewerKey);

  return NextResponse.json({
    ok: true,
    scoreRun,
    playerScores: buildPlayerScoreBreakdown(parsed.data.gameweekSlug),
    teamScores: buildTeamGameweekScores(parsed.data.gameweekSlug),
    overallTable: buildOverallTable()
  });
}
