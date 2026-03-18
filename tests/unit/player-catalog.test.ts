// @vitest-environment node

import { describe, expect, it } from "vitest";
import { filterAndSortPlayers, getPlayerCatalog } from "../../src/lib/game/catalog";

describe("player catalog", () => {
  it("filters by position, club, and max price together", () => {
    const players = getPlayerCatalog();
    const filtered = filterAndSortPlayers(players, {
      position: "midfielder",
      club: "Inter",
      maxPriceCents: 9000,
      sort: "price-asc"
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Leo Laine");
  });

  it("sorts by points descending by default", () => {
    const players = getPlayerCatalog();
    const filtered = filterAndSortPlayers(players, {});

    expect(filtered[0]?.name).toBe("Eetu Koski");
    expect(filtered[1]?.name).toBe("Oskar Niemi");
  });
});
