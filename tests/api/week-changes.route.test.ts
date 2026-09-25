// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/weeks/changes/route";

describe("GET /api/weeks/changes", () => {
  it("returns a delta view between two gameweeks", async () => {
    const response = await GET(
      new Request("http://localhost/api/weeks/changes?from=gw-1&to=gw-2")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.teamChanges).toHaveLength(3);
    expect(payload.playerMovers.length).toBeGreaterThan(0);
  });

  it("rejects invalid gameweek ordering", async () => {
    const response = await GET(
      new Request("http://localhost/api/weeks/changes?from=gw-3&to=gw-2")
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      ok: false,
      code: "invalid_gameweek_order",
      message: "Nykyisen gameweekin on oltava vertailuviikkoa uudempi.",
      from: "gw-3",
      to: "gw-2"
    });
  });
});
