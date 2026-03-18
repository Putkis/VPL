// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST } from "../../src/app/api/transfers/quote/route";

describe("POST /api/transfers/quote", () => {
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
});
