import React from "react";
import { getPlayerCatalog } from "../../lib/game/catalog";
import { TeamBuilder } from "./team-builder";

export default function TeamBuilderPage() {
  return <TeamBuilder players={getPlayerCatalog()} />;
}
