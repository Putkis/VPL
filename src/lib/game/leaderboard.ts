import { seedFantasyTeams } from "./mock-league";
import { buildOverallTable, buildTeamGameweekScores } from "./scoring";
import { getDefaultFriendTeamIds } from "./leagues";

const defaultViewerTeamId = "40000000-0000-4000-8000-000000000001";

export type LeaderboardScope = "global" | "friends";

export function getLeaderboard(scope: LeaderboardScope) {
  const baseTable = buildOverallTable();
  const latestGameweekScores = new Map(
    buildTeamGameweekScores("gw-2").map((entry) => [entry.teamId, entry.gameweekPoints])
  );

  const filtered =
    scope === "friends"
      ? baseTable.filter((entry) =>
          [defaultViewerTeamId, ...getDefaultFriendTeamIds()].includes(entry.teamId)
        )
      : baseTable;

  return filtered.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    latestPoints: latestGameweekScores.get(entry.teamId) ?? 0
  }));
}

export function getLeaderboardSummary() {
  const globalTable = getLeaderboard("global");
  const viewer = globalTable.find((entry) => entry.teamId === defaultViewerTeamId);

  return {
    viewerTeamName:
      seedFantasyTeams.find((team) => team.id === defaultViewerTeamId)?.name ?? "Viewer",
    viewerRank: viewer?.rank ?? null,
    viewerPoints: viewer?.totalPoints ?? 0
  };
}
