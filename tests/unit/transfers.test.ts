// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { quoteTransfer } from "../../src/lib/game/transfers";

describe("transfer penalties", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-18T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
});
