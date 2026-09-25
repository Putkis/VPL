// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getDefaultFriendLeague, getFriendLeagues } from "../../src/lib/game/leagues";

describe("friend leagues", () => {
  it("returns league membership data", () => {
    const leagues = getFriendLeagues();

    expect(leagues).toHaveLength(2);
    expect(leagues[0]?.members.length).toBeGreaterThan(1);
  });

  it("returns the viewer default league", () => {
    expect(getDefaultFriendLeague()?.name).toBe("South Stand");
  });
});
