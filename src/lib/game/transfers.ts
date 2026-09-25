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
  const playerOut = currentPlayers.find((player) => player.id === options.playerOutId);
  const playerIn = catalog.find((player) => player.id === options.playerInId);

  if (window.locked) {
    return {
      ok: false,
      code: "gameweek_locked",
      message: "Siirtoikkuna on suljettu."
    };
  }

  if (options.playerOutId === options.playerInId) {
    return {
      ok: false,
      code: "same_player_swap",
      message: "Samaa pelaajaa ei voi vaihtaa ulos ja sisaan samalla siirrolla."
    };
  }

  if (!playerOut) {
    return {
      ok: false,
      code: "player_out_not_in_team",
      message: "Valittu ulosmeneva pelaaja ei kuulu nykyiseen joukkueeseen."
    };
  }

  if (!playerIn) {
    return {
      ok: false,
      code: "unknown_player_in",
      message: "Valittua sisaan tulevaa pelaajaa ei loydy."
    };
  }

  if (currentPlayers.some((player) => player.id === playerIn.id)) {
    return {
      ok: false,
      code: "player_already_owned",
      message: "Valittu sisaan tuleva pelaaja on jo joukkueessa."
    };
  }

  const nextPlayers = currentPlayers
    .filter((player) => player.id !== options.playerOutId)
    .concat(playerIn);

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
