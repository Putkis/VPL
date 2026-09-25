import { seedPlayerGameweekStats, type SeedPlayerStat } from "./mock-league";
import { seedGameweeks } from "./seed-data";

type StoredScoreRun = {
  gameweekSlug: string;
  ranAt: string;
  submittedBy: string;
};

const overridesByGameweekId = new Map<string, SeedPlayerStat[]>();
let lastScoreRun: StoredScoreRun | null = null;

function getGameweekBySlug(gameweekSlug: string) {
  return seedGameweeks.find((gameweek) => gameweek.slug === gameweekSlug) ?? null;
}

export function getResolvedPlayerStats(gameweekSlug: string) {
  const gameweek = getGameweekBySlug(gameweekSlug);
  if (!gameweek) {
    return [];
  }

  return (
    overridesByGameweekId.get(gameweek.id) ??
    seedPlayerGameweekStats.filter((stat) => stat.gameweekId === gameweek.id)
  );
}

export function saveGameweekPlayerStats(gameweekSlug: string, stats: Omit<SeedPlayerStat, "gameweekId">[]) {
  const gameweek = getGameweekBySlug(gameweekSlug);
  if (!gameweek) {
    return null;
  }

  const normalizedStats = stats.map((stat) => ({
    ...stat,
    gameweekId: gameweek.id
  }));
  overridesByGameweekId.set(gameweek.id, normalizedStats);

  return normalizedStats;
}

export function markScoreRun(gameweekSlug: string, submittedBy: string) {
  lastScoreRun = {
    gameweekSlug,
    submittedBy,
    ranAt: new Date().toISOString()
  };

  return lastScoreRun;
}

export function getLastScoreRun() {
  return lastScoreRun;
}

export function clearResultsStoreForTests() {
  overridesByGameweekId.clear();
  lastScoreRun = null;
}
