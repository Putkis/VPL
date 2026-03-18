// @vitest-environment node

import { describe, expect, it } from "vitest";
import { seedGameweeks, seedPlayers, seedUsers } from "../../src/lib/game/seed-data";

describe("core seed data", () => {
  it("includes minimum users, players, and gameweeks for smoke testing", () => {
    expect(seedUsers).toHaveLength(3);
    expect(seedPlayers.length).toBeGreaterThanOrEqual(8);
    expect(seedGameweeks).toHaveLength(3);
  });

  it("keeps player slugs unique and gameweeks ordered", () => {
    const uniquePlayerSlugs = new Set(seedPlayers.map((player) => player.slug));
    expect(uniquePlayerSlugs.size).toBe(seedPlayers.length);

    const roundNumbers = seedGameweeks.map((gameweek) => gameweek.roundNumber);
    expect(roundNumbers).toEqual([1, 2, 3]);
  });
});
