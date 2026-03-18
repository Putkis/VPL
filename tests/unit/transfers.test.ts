// @vitest-environment node

import { describe, expect, it } from "vitest";
import { quoteTransfer } from "../../src/lib/game/transfers";

describe("transfer penalties", () => {
  it("keeps the first transfer free", () => {
    const quote = quoteTransfer({
      gameweekSlug: "gw-3",
      playerOutId: "20000000-0000-4000-8000-000000000004",
      playerInId: "20000000-0000-4000-8000-000000000007",
      plannedTransferCount: 1
    });

    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(quote.penaltyPoints).toBe(0);
    }
  });

  it("charges -4 for the second transfer in the same gameweek", () => {
    const quote = quoteTransfer({
      gameweekSlug: "gw-3",
      playerOutId: "20000000-0000-4000-8000-000000000004",
      playerInId: "20000000-0000-4000-8000-000000000007",
      plannedTransferCount: 2
    });

    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(quote.penaltyPoints).toBe(4);
    }
  });

  it("rejects swapping the same player in and out", () => {
    const quote = quoteTransfer({
      gameweekSlug: "gw-3",
      playerOutId: "20000000-0000-4000-8000-000000000004",
      playerInId: "20000000-0000-4000-8000-000000000004",
      plannedTransferCount: 1
    });

    expect(quote).toMatchObject({
      ok: false,
      code: "same_player_swap"
    });
  });

  it("rejects transfers when the outgoing player is not in the managed team", () => {
    const quote = quoteTransfer({
      gameweekSlug: "gw-3",
      playerOutId: "20000000-0000-4000-8000-000000000007",
      playerInId: "20000000-0000-4000-8000-000000000006",
      plannedTransferCount: 1
    });

    expect(quote).toMatchObject({
      ok: false,
      code: "player_out_not_in_team"
    });
  });

  it("rejects transfers when the incoming player id is unknown", () => {
    const quote = quoteTransfer({
      gameweekSlug: "gw-3",
      playerOutId: "20000000-0000-4000-8000-000000000004",
      playerInId: "20000000-0000-4000-8000-999999999999",
      plannedTransferCount: 1
    });

    expect(quote).toMatchObject({
      ok: false,
      code: "unknown_player_in"
    });
  });
});
