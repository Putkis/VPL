import React from "react";
import { getPlayerCatalog } from "../../lib/game/catalog";
import { PlayersBoard } from "./players-board";

export default function PlayersPage() {
  return <PlayersBoard players={getPlayerCatalog()} />;
}
