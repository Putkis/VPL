import { seedPlayers } from "./seed-data";

export type PlayerSortKey = "price-asc" | "price-desc" | "points-desc";

export type PlayerCatalogFilters = {
  query?: string;
  club?: string;
  position?: string;
  maxPriceCents?: number;
  sort?: PlayerSortKey;
};

export type CatalogPlayer = {
  id: string;
  slug: string;
  name: string;
  club: string;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  priceCents: number;
  totalPoints: number;
};

export function getPlayerCatalog(): CatalogPlayer[] {
  return seedPlayers.map((player) => ({
    id: player.id,
    slug: player.slug,
    name: `${player.firstName} ${player.lastName}`,
    club: player.club,
    position: player.position,
    priceCents: player.priceCents,
    totalPoints: player.totalPoints
  }));
}

export function filterAndSortPlayers(
  players: CatalogPlayer[],
  filters: PlayerCatalogFilters
) {
  const query = filters.query?.trim().toLowerCase();
  const sort = filters.sort ?? "points-desc";

  return [...players]
    .filter((player) => {
      if (query && !`${player.name} ${player.club}`.toLowerCase().includes(query)) {
        return false;
      }

      if (filters.club && filters.club !== "all" && player.club !== filters.club) {
        return false;
      }

      if (
        filters.position &&
        filters.position !== "all" &&
        player.position !== filters.position
      ) {
        return false;
      }

      if (filters.maxPriceCents && player.priceCents > filters.maxPriceCents) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (sort === "price-asc") {
        return left.priceCents - right.priceCents;
      }

      if (sort === "price-desc") {
        return right.priceCents - left.priceCents;
      }

      return right.totalPoints - left.totalPoints;
    });
}

export function getPlayerCatalogMeta(players: CatalogPlayer[]) {
  return {
    clubs: [...new Set(players.map((player) => player.club))].sort((left, right) =>
      left.localeCompare(right)
    ),
    positions: [...new Set(players.map((player) => player.position))]
  };
}
