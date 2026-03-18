// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import {
  buildOverallTable,
  buildPlayerScoreBreakdown,
  buildTeamGameweekScores,
  calculatePlayerScore
} from "../../src/lib/game/scoring";
import { clearResultsStoreForTests } from "../../src/lib/game/results-store";

describe("scoring engine", () => {
  beforeEach(() => {
    clearResultsStoreForTests();
  });

  it("calculates defender clean sheet and goal points deterministically", () => {
    expect(
      calculatePlayerScore("defender", {
        playerId: "x",
        gameweekId: "y",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: true,
        saves: 0,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 3
      })
    ).toBe(15);
  });

  it("builds ranked team scores for a gameweek", () => {
    const scores = buildTeamGameweekScores("gw-2");

    expect(scores[0]?.rank).toBe(1);
    expect(scores[0]?.gameweekPoints).toBeGreaterThan(scores[1]?.gameweekPoints ?? 0);
  });

  it("builds an overall table across available scored gameweeks", () => {
    const table = buildOverallTable();
    const playerScores = buildPlayerScoreBreakdown("gw-1");

    expect(table).toHaveLength(3);
    expect(playerScores[0]?.score).toBeGreaterThan(0);
  });
});
