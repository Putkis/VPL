import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminEmails, isAdminViewer } from "../../../../lib/game/admin";
import { getPlayerCatalog } from "../../../../lib/game/catalog";
import { getResolvedPlayerStats, saveGameweekPlayerStats } from "../../../../lib/game/results-store";
import { seedGameweeks } from "../../../../lib/game/seed-data";

const statSchema = z.object({
  playerId: z.string().uuid(),
  minutesPlayed: z.number().int().min(0).max(130),
  goals: z.number().int().min(0).max(10),
  assists: z.number().int().min(0).max(10),
  cleanSheet: z.boolean(),
  saves: z.number().int().min(0).max(30),
  yellowCards: z.number().int().min(0).max(2),
  redCards: z.number().int().min(0).max(1),
  bonusPoints: z.number().int().min(0).max(5)
});

const saveResultsSchema = z.object({
  viewerKey: z.string().trim().min(3),
  gameweekSlug: z.string().trim().min(1),
  stats: z.array(statSchema).min(1)
});

function buildForbiddenResponse() {
  return NextResponse.json(
    {
      ok: false,
      code: "forbidden",
      message: "Vain admin voi syottaa tuloksia.",
      admins: getAdminEmails()
    },
    { status: 403 }
  );
}

function validatePlayerIds(stats: z.infer<typeof statSchema>[]) {
  const players = new Set(getPlayerCatalog().map((player) => player.id));
  return stats.every((stat) => players.has(stat.playerId));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const gameweekSlug = url.searchParams.get("gameweek") ?? "gw-2";

  if (!seedGameweeks.some((gameweek) => gameweek.slug === gameweekSlug)) {
    return NextResponse.json({ ok: false, code: "unknown_gameweek" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    gameweekSlug,
    stats: getResolvedPlayerStats(gameweekSlug)
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = saveResultsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_results" }, { status: 400 });
  }

  if (!isAdminViewer(parsed.data.viewerKey)) {
    return buildForbiddenResponse();
  }

  if (!seedGameweeks.some((gameweek) => gameweek.slug === parsed.data.gameweekSlug)) {
    return NextResponse.json({ ok: false, code: "unknown_gameweek" }, { status: 400 });
  }

  if (!validatePlayerIds(parsed.data.stats)) {
    return NextResponse.json({ ok: false, code: "unknown_player" }, { status: 400 });
  }

  const savedStats = saveGameweekPlayerStats(parsed.data.gameweekSlug, parsed.data.stats);
  if (!savedStats) {
    return NextResponse.json({ ok: false, code: "unknown_gameweek" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    gameweekSlug: parsed.data.gameweekSlug,
    savedStatCount: savedStats.length
  });
}
