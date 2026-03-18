// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/leaderboard/route";

describe("GET /api/leaderboard", () => {
  it("returns the requested leaderboard scope", async () => {
    const response = await GET(
      new Request("http://localhost/api/leaderboard?scope=friends")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.scope).toBe("friends");
    expect(payload.rows.length).toBeGreaterThan(0);
    expect(payload.summary.viewerTeamName).toBe("Viherio CF");
  });
});
