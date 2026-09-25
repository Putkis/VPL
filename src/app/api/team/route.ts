import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlayerCatalog } from "../../../lib/game/catalog";
import { validateTeamSelection } from "../../../lib/game/team-rules";

const teamSchema = z.object({
  teamName: z.string().trim().min(3).max(30),
  playerIds: z.array(z.string().uuid()).min(1),
  gameweekSlug: z.string().trim().min(1).default("gw-3")
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_payload" }, { status: 400 });
  }

  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_team" }, { status: 400 });
  }

  const { isGameweekLocked } = await import("../../../lib/game/gameweeks");
  if (isGameweekLocked(parsed.data.gameweekSlug)) {
    return NextResponse.json(
      {
        ok: false,
        code: "gameweek_locked",
        message: "Gameweek on lukittu. Muutokset eivat ole enaa sallittuja."
      },
      { status: 423 }
    );
  }

  const catalog = getPlayerCatalog();
  const selectedPlayers = parsed.data.playerIds
    .map((playerId) => catalog.find((player) => player.id === playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  if (selectedPlayers.length !== parsed.data.playerIds.length) {
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

  return NextResponse.json({
    ok: true,
    team: {
      name: parsed.data.teamName,
      players: selectedPlayers,
      gameweekSlug: parsed.data.gameweekSlug
    },
    validation
  });
}
