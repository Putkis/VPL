// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../src/app/api/transfers/quote/route";

describe("POST /api/transfers/quote", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-18T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a valid quote for an open gameweek", async () => {
    const response = await POST(
      new Request("http://localhost/api/transfers/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gameweekSlug: "gw-3",
          playerOutId: "20000000-0000-4000-8000-000000000004",
          playerInId: "20000000-0000-4000-8000-000000000007",
          plannedTransferCount: 2
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.penaltyPoints).toBe(4);
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/transfers/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: "{"
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, code: "invalid_transfer" });
  });

  it("rejects transfers for a locked gameweek", async () => {
    const response = await POST(
      new Request("http://localhost/api/transfers/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gameweekSlug: "gw-2",
          playerOutId: "20000000-0000-4000-8000-000000000004",
          playerInId: "20000000-0000-4000-8000-000000000007",
          plannedTransferCount: 2
        })
      })
    );

    expect(response.status).toBe(423);
    expect(await response.json()).toMatchObject({ ok: false, code: "gameweek_locked" });
  });
});
