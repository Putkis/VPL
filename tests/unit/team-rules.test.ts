// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getPlayerCatalog } from "../../src/lib/game/catalog";
import { validateTeamSelection } from "../../src/lib/game/team-rules";

describe("team validation rules", () => {
  it("accepts a balanced 7-player squad within budget", () => {
    const players = getPlayerCatalog().filter((player) =>
      [
        "Luke Hakala",
        "Juho Lehto",
        "Matti Kallio",
        "Oskar Niemi",
        "Leo Laine",
        "Eetu Koski",
        "Samu Virtanen"
      ].includes(player.name)
    );

    const result = validateTeamSelection(players);

    expect(result.ok).toBe(true);
  });

  it("rejects squads that break the position minimums", () => {
    const players = getPlayerCatalog().filter((player) =>
      ["Luke Hakala", "Juho Lehto", "Matti Kallio", "Leo Laine", "Samu Virtanen"].includes(
        player.name
      )
    );

    const result = validateTeamSelection(players);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Valitse tasan");
  });
});
