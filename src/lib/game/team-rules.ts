import { CatalogPlayer } from "./catalog";

export const TEAM_BUDGET_CENTS = 55000;
export const TEAM_FORMATION_RULES = {
  goalkeeper: { min: 1, max: 1 },
  defender: { min: 2, max: 3 },
  midfielder: { min: 2, max: 3 },
  forward: { min: 1, max: 2 }
} as const;
export const TEAM_SIZE = 7;

export type TeamValidationResult = {
  ok: boolean;
  message: string;
  counts: Record<keyof typeof TEAM_FORMATION_RULES, number>;
  totalPriceCents: number;
};

export function validateTeamSelection(players: CatalogPlayer[]): TeamValidationResult {
  const counts = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    forward: 0
  };

  for (const player of players) {
    counts[player.position] += 1;
  }

  const totalPriceCents = players.reduce((sum, player) => sum + player.priceCents, 0);

  if (players.length !== TEAM_SIZE) {
    return {
      ok: false,
      message: `Valitse tasan ${TEAM_SIZE} pelaajaa.`,
      counts,
      totalPriceCents
    };
  }

  if (totalPriceCents > TEAM_BUDGET_CENTS) {
    return {
      ok: false,
      message: "Budjetti ylittyy. Poista kallis pelaaja tai vaihda halvempaan.",
      counts,
      totalPriceCents
    };
  }

  for (const [position, rule] of Object.entries(TEAM_FORMATION_RULES)) {
    const count = counts[position as keyof typeof counts];
    if (count < rule.min || count > rule.max) {
      return {
        ok: false,
        message: `Roolijakauma ei kelpaa: ${position} ${count}/${rule.min}-${rule.max}.`,
        counts,
        totalPriceCents
      };
    }
  }

  return {
    ok: true,
    message: "Kokoonpano kelpaa tallennettavaksi.",
    counts,
    totalPriceCents
  };
}
