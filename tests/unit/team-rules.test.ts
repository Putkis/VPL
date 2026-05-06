// @vitest-environment node

import { describe, expect, it } from "vitest";
import { type CatalogPlayer, getPlayerCatalog } from "../../src/lib/game/catalog";
import { validateTeamSelection } from "../../src/lib/game/team-rules";

function createPlayer(
  id: string,
  position: CatalogPlayer["position"],
  priceCents: number
): CatalogPlayer {
  return {
    id,
    slug: id,
    name: id,
    club: "Test FC",
    position,
    priceCents,
    totalPoints: 0
  };
}

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

  it("rejects squads that exceed the budget", () => {
    const players = getPlayerCatalog().filter((player) =>
      [
        "Luke Hakala",
        "Juho Lehto",
        "Matti Kallio",
        "Oskar Niemi",
        "Leo Laine",
        "Eetu Koski",
        "Vilho Salo"
      ].includes(player.name)
    );

    const result = validateTeamSelection(players);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Budjetti ylittyy");
    expect(result.totalPriceCents).toBeGreaterThan(55000);
  });

  it("rejects squads with an invalid role distribution after the team is otherwise complete", () => {
    const players = [
      createPlayer("gk-1", "goalkeeper", 5000),
      createPlayer("def-1", "defender", 7000),
      createPlayer("mid-1", "midfielder", 6500),
      createPlayer("mid-2", "midfielder", 6500),
      createPlayer("mid-3", "midfielder", 6500),
      createPlayer("fwd-1", "forward", 8000),
      createPlayer("fwd-2", "forward", 8000)
    ];

    const result = validateTeamSelection(players);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Roolijakauma ei kelpaa");
    expect(result.message).toContain("defender 1/2-3");
  });
});
