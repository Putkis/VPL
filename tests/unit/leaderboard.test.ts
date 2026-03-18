// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getLeaderboard, getLeaderboardSummary } from "../../src/lib/game/leaderboard";

describe("leaderboard queries", () => {
  it("returns a ranked global table", () => {
    const table = getLeaderboard("global");

    expect(table).toHaveLength(3);
    expect(table[0]?.rank).toBe(1);
    expect(table[0]?.totalPoints).toBeGreaterThan(table[1]?.totalPoints ?? 0);
  });

  it("returns a compact friends table and viewer summary", () => {
    const table = getLeaderboard("friends");
    const summary = getLeaderboardSummary();

    expect(table.length).toBeLessThanOrEqual(3);
    expect(summary.viewerTeamName).toBe("Viherio CF");
  });
});
