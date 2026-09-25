// @vitest-environment node

import { describe, expect, it } from "vitest";
import { buildWeekChanges } from "../../src/lib/game/week-changes";

describe("week changes", () => {
  it("builds ranking movement and player deltas between gameweeks", () => {
    const changes = buildWeekChanges("gw-1", "gw-2");

    expect(changes.ok).toBe(true);
    if (changes.ok) {
      expect(changes.teamChanges).toHaveLength(3);
      expect(changes.playerMovers[0]?.scoreDelta).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects identical or reversed gameweek comparisons", () => {
    expect(buildWeekChanges("gw-2", "gw-2")).toMatchObject({
      ok: false,
      code: "same_gameweek"
    });
    expect(buildWeekChanges("gw-3", "gw-2")).toMatchObject({
      ok: false,
      code: "invalid_gameweek_order"
    });
  });
});
