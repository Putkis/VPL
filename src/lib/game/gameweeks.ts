import { seedGameweeks } from "./seed-data";

export function getGameweekBySlug(gameweekSlug: string) {
  return seedGameweeks.find((gameweek) => gameweek.slug === gameweekSlug) ?? null;
}

export function isGameweekLocked(gameweekSlug: string, now = new Date()) {
  const gameweek = getGameweekBySlug(gameweekSlug);
  if (!gameweek) {
    return false;
  }

  return new Date(gameweek.locksAt) <= now || gameweek.status !== "upcoming";
}
