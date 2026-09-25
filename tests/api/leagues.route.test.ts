// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/leagues/route";

describe("GET /api/leagues", () => {
  it("returns friend league data", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.leagues).toHaveLength(2);
  });
});
