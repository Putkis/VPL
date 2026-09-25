import { validateGameweekRange } from "./gameweeks";
import { buildPlayerScoreBreakdown, buildTeamGameweekScores } from "./scoring";

export function buildWeekChanges(fromGameweekSlug: string, toGameweekSlug: string) {
  const range = validateGameweekRange(fromGameweekSlug, toGameweekSlug);
  if (!range.ok) {
    return range;
  }

  const previousTable = new Map(
    buildTeamGameweekScores(fromGameweekSlug).map((entry) => [entry.teamId, entry])
  );
  const currentTable = buildTeamGameweekScores(toGameweekSlug);

  const teamChanges = currentTable.map((entry) => {
    const previous = previousTable.get(entry.teamId);
    return {
      teamId: entry.teamId,
      teamName: entry.teamName,
      currentRank: entry.rank,
      previousRank: previous?.rank ?? null,
      rankDelta: previous ? previous.rank - entry.rank : 0,
      latestPoints: entry.gameweekPoints,
      pointDelta: previous ? entry.gameweekPoints - previous.gameweekPoints : entry.gameweekPoints
    };
  });

  const previousPlayers = new Map(
    buildPlayerScoreBreakdown(fromGameweekSlug).map((entry) => [entry.playerId, entry])
  );

  const playerMovers = buildPlayerScoreBreakdown(toGameweekSlug)
    .map((entry) => {
      const previous = previousPlayers.get(entry.playerId);
      return {
        playerId: entry.playerId,
        playerName: entry.playerName,
        team: entry.team,
        currentScore: entry.score,
        scoreDelta: entry.score - (previous?.score ?? 0)
      };
    })
    .sort((left, right) => right.scoreDelta - left.scoreDelta);

  return {
    ok: true,
    teamChanges,
    playerMovers
  } as const;
}
