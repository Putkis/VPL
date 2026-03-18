import { getPlayerCatalog } from "./catalog";
import { isGameweekLocked } from "./gameweeks";
import { seedFantasyTeams } from "./mock-league";
import { TEAM_BUDGET_CENTS, validateTeamSelection } from "./team-rules";

export function getDefaultTransferWindow(gameweekSlug: string) {
  return {
    gameweekSlug,
    freeTransfers: 1,
    extraTransferPenalty: 4,
    locked: isGameweekLocked(gameweekSlug)
  };
}

export function getDefaultManagedTeam() {
  return seedFantasyTeams[0];
}

export function quoteTransfer(options: {
  gameweekSlug: string;
  playerOutId: string;
  playerInId: string;
  plannedTransferCount: number;
}) {
  const window = getDefaultTransferWindow(options.gameweekSlug);
  const team = getDefaultManagedTeam();
  const catalog = getPlayerCatalog();
  const currentPlayers = team.playerIds
    .map((playerId) => catalog.find((player) => player.id === playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  if (window.locked) {
    return {
      ok: false,
      code: "gameweek_locked",
      message: "Siirtoikkuna on suljettu."
    };
  }

  const nextPlayers = currentPlayers
    .filter((player) => player.id !== options.playerOutId)
    .concat(catalog.find((player) => player.id === options.playerInId) ?? []);

  const validation = validateTeamSelection(nextPlayers);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid_team_after_transfer",
      message: validation.message
    };
  }

  if (nextPlayers.reduce((sum, player) => sum + player.priceCents, 0) > TEAM_BUDGET_CENTS) {
    return {
      ok: false,
      code: "budget_exceeded",
      message: "Siirto ylittaa budjetin."
    };
  }

  return {
    ok: true,
    teamName: team.name,
    penaltyPoints:
      options.plannedTransferCount > window.freeTransfers
        ? (options.plannedTransferCount - window.freeTransfers) * window.extraTransferPenalty
        : 0,
    players: nextPlayers
  };
}
