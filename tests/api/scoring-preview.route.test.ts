// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/scoring/preview/route";

describe("GET /api/scoring/preview", () => {
  it("returns player scores, team scores, and overall ranking", async () => {
    const response = await GET(
      new Request("http://localhost/api/scoring/preview?gameweek=gw-2")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.playerScores.length).toBeGreaterThan(0);
    expect(payload.teamScores[0].rank).toBe(1);
    expect(payload.overallTable).toHaveLength(3);
  });
});
