import { NextResponse } from "next/server";
import {
  filterAndSortPlayers,
  getPlayerCatalog,
  getPlayerCatalogMeta
} from "../../../lib/game/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const maxPrice = url.searchParams.get("maxPrice");
  const players = getPlayerCatalog();
  const filtered = filterAndSortPlayers(players, {
    query: url.searchParams.get("query") ?? undefined,
    club: url.searchParams.get("club") ?? undefined,
    position: url.searchParams.get("position") ?? undefined,
    maxPriceCents: maxPrice ? Number(maxPrice) : undefined,
    sort: (url.searchParams.get("sort") as "price-asc" | "price-desc" | "points-desc" | null) ??
      undefined
  });

  return NextResponse.json({
    ok: true,
    players: filtered,
    meta: getPlayerCatalogMeta(players)
  });
}
