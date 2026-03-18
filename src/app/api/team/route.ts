import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlayerCatalog } from "../../../lib/game/catalog";
import { getGameweekBySlug, isGameweekLocked } from "../../../lib/game/gameweeks";
import { validateTeamSelection } from "../../../lib/game/team-rules";
import { getStoredTeam, saveStoredTeam } from "../../../lib/game/team-store";

const teamSchema = z.object({
  viewerKey: z.string().trim().min(3).max(120),
  teamName: z.string().trim().min(3).max(30),
  playerIds: z.array(z.string().uuid()).min(1),
  gameweekSlug: z.string().trim().min(1).default("gw-3")
});

function buildUnknownGameweekResponse() {
  return NextResponse.json(
    {
      ok: false,
      code: "unknown_gameweek",
      message: "Valittua gameweekia ei loydy."
    },
    { status: 400 }
  );
}

function buildLockedGameweekResponse() {
  return NextResponse.json(
    {
      ok: false,
      code: "gameweek_locked",
      message: "Gameweek on lukittu. Muutokset eivat ole enaa sallittuja."
    },
    { status: 423 }
  );
}

function buildTeamPayload(data: z.infer<typeof teamSchema>) {
  const catalog = getPlayerCatalog();
  const selectedPlayers = data.playerIds
    .map((playerId) => catalog.find((player) => player.id === playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  if (selectedPlayers.length !== data.playerIds.length) {
    return NextResponse.json({ ok: false, code: "unknown_player" }, { status: 400 });
  }

  const validation = validateTeamSelection(selectedPlayers);
  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        code:
          validation.totalPriceCents > 55000 ? "budget_exceeded" : "invalid_role_distribution",
        message: validation.message,
        validation
      },
      { status: 400 }
    );
  }

  const savedTeam = saveStoredTeam(data);

  return NextResponse.json({
    ok: true,
    team: {
      name: savedTeam.teamName,
      players: selectedPlayers,
      playerIds: savedTeam.playerIds,
      gameweekSlug: savedTeam.gameweekSlug,
      viewerKey: savedTeam.viewerKey,
      revision: savedTeam.revision,
      updatedAt: savedTeam.updatedAt
    },
    validation,
    persistence: {
      revision: savedTeam.revision,
      updatedAt: savedTeam.updatedAt
    }
  });
}

function parseBody(request: Request) {
  return request.json().catch(() => null);
}

async function saveTeamFromRequest(request: Request) {
  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_team" }, { status: 400 });
  }

  if (!getGameweekBySlug(parsed.data.gameweekSlug)) {
    return buildUnknownGameweekResponse();
  }

  if (isGameweekLocked(parsed.data.gameweekSlug)) {
    return buildLockedGameweekResponse();
  }

  return buildTeamPayload(parsed.data);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const viewerKey = url.searchParams.get("viewerKey")?.trim();
  const gameweekSlug = url.searchParams.get("gameweek")?.trim() ?? "gw-3";

  if (!viewerKey) {
    return NextResponse.json({ ok: false, code: "invalid_viewer" }, { status: 400 });
  }

  const team = getStoredTeam(viewerKey, gameweekSlug);
  if (!team) {
    return NextResponse.json({ ok: true, team: null });
  }

  const catalog = getPlayerCatalog();
  const players = team.playerIds
    .map((playerId) => catalog.find((player) => player.id === playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  return NextResponse.json({
    ok: true,
    team: {
      ...team,
      name: team.teamName,
      players
    }
  });
}

export async function POST(request: Request) {
  return saveTeamFromRequest(request);
}

export async function PUT(request: Request) {
  return saveTeamFromRequest(request);
}
