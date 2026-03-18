import { seedGameweeks } from "./seed-data";

export function getGameweekBySlug(gameweekSlug: string) {
  return seedGameweeks.find((gameweek) => gameweek.slug === gameweekSlug) ?? null;
}

export function getGameweekIndex(gameweekSlug: string) {
  return seedGameweeks.findIndex((gameweek) => gameweek.slug === gameweekSlug);
}

export function validateGameweekRange(fromGameweekSlug: string, toGameweekSlug: string) {
  const from = getGameweekBySlug(fromGameweekSlug);
  const to = getGameweekBySlug(toGameweekSlug);

  if (!from || !to) {
    return {
      ok: false,
      code: "unknown_gameweek",
      message: "Valittua gameweek-paria ei loydy."
    } as const;
  }

  if (from.slug === to.slug) {
    return {
      ok: false,
      code: "same_gameweek",
      message: "Valitse kaksi eri gameweekia vertailuun."
    } as const;
  }

  if (from.roundNumber >= to.roundNumber) {
    return {
      ok: false,
      code: "invalid_gameweek_order",
      message: "Nykyisen gameweekin on oltava vertailuviikkoa uudempi."
    } as const;
  }

  return { ok: true, from, to } as const;
}

export function isGameweekLocked(gameweekSlug: string, now = new Date()) {
  const gameweek = getGameweekBySlug(gameweekSlug);
  if (!gameweek) {
    return false;
  }

  return new Date(gameweek.locksAt) <= now || gameweek.status !== "upcoming";
}
