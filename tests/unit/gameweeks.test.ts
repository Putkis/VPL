// @vitest-environment node

import { describe, expect, it } from "vitest";
import { isGameweekLocked } from "../../src/lib/game/gameweeks";

describe("gameweek lock state", () => {
  it("marks historical/live gameweeks as locked", () => {
    expect(isGameweekLocked("gw-1", new Date("2026-03-18T12:00:00.000Z"))).toBe(true);
    expect(isGameweekLocked("gw-2", new Date("2026-03-18T12:00:00.000Z"))).toBe(true);
  });

  it("keeps the next upcoming gameweek unlocked before deadline", () => {
    expect(isGameweekLocked("gw-3", new Date("2026-03-18T12:00:00.000Z"))).toBe(false);
  });
});
