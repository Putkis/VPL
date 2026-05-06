import { getPlayerCatalog } from "./catalog";
import { seedGameweeks } from "./seed-data";
import { seedFantasyTeams, seedPlayerGameweekStats, SeedPlayerStat } from "./mock-league";

export function calculatePlayerScore(position: string, stat: SeedPlayerStat) {
  const appearancePoints =
    stat.minutesPlayed >= 60 ? 2 : stat.minutesPlayed > 0 ? 1 : 0;
  const goalPoints =
    position === "goalkeeper" || position === "defender"
      ? stat.goals * 6
      : position === "midfielder"
      ? stat.goals * 5
      : stat.goals * 4;
  const cleanSheetPoints =
    stat.cleanSheet && (position === "goalkeeper" || position === "defender")
      ? 4
      : stat.cleanSheet && position === "midfielder"
      ? 1
      : 0;

  return (
    appearancePoints +
    goalPoints +
    stat.assists * 3 +
    cleanSheetPoints +
    Math.floor(stat.saves / 3) +
    stat.bonusPoints -
    stat.yellowCards -
    stat.redCards * 3
  );
}

export function buildPlayerScoreBreakdown(gameweekSlug: string) {
  const playersById = new Map(getPlayerCatalog().map((player) => [player.id, player]));
  const gameweek = seedGameweeks.find((item) => item.slug === gameweekSlug);
  if (!gameweek) {
    return [];
  }

  return seedPlayerGameweekStats
    .filter((stat) => stat.gameweekId === gameweek.id)
    .map((stat) => {
      const player = playersById.get(stat.playerId);
      if (!player) {
        return null;
      }

      return {
        playerId: player.id,
        playerName: player.name,
        team: player.club,
        score: calculatePlayerScore(player.position, stat),
        statLine: stat
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => right.score - left.score);
}

export function buildTeamGameweekScores(gameweekSlug: string) {
  const playerBreakdown = new Map(
    buildPlayerScoreBreakdown(gameweekSlug).map((entry) => [entry.playerId, entry.score])
  );

  return seedFantasyTeams
    .map((team) => ({
      teamId: team.id,
      teamName: team.name,
      gameweekPoints: team.playerIds.reduce(
        (sum, playerId) => sum + (playerBreakdown.get(playerId) ?? 0),
        0
      )
    }))
    .sort((left, right) => right.gameweekPoints - left.gameweekPoints)
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));
}

export function buildOverallTable() {
  const closedOrLiveGameweeks = seedGameweeks.filter((gameweek) =>
    ["closed", "live"].includes(gameweek.status)
  );

  const totals = new Map<string, { teamName: string; totalPoints: number }>();
  for (const team of seedFantasyTeams) {
    totals.set(team.id, { teamName: team.name, totalPoints: 0 });
  }

  for (const gameweek of closedOrLiveGameweeks) {
    for (const teamScore of buildTeamGameweekScores(gameweek.slug)) {
      const current = totals.get(teamScore.teamId);
      if (current) {
        current.totalPoints += teamScore.gameweekPoints;
      }
    }
  }

  return [...totals.entries()]
    .map(([teamId, value]) => ({
      teamId,
      teamName: value.teamName,
      totalPoints: value.totalPoints
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));
}
