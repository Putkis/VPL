// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST } from "../../src/app/api/team/route";
import { getPlayerCatalog } from "../../src/lib/game/catalog";

function createPostRequest(body: unknown) {
  return new Request("http://localhost/api/team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("POST /api/team", () => {
  const balancedIds = getPlayerCatalog()
    .filter((player) =>
      [
        "Luke Hakala",
        "Juho Lehto",
        "Matti Kallio",
        "Oskar Niemi",
        "Leo Laine",
        "Eetu Koski",
        "Samu Virtanen"
      ].includes(player.name)
    )
    .map((player) => player.id);

  it("accepts a team that stays in budget and follows the role rules", async () => {
    const response = await POST(
      createPostRequest({
        teamName: "Tasapaino",
        playerIds: balancedIds
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("rejects a team with unknown player ids", async () => {
    const response = await POST(
      createPostRequest({
        teamName: "Virhe",
        playerIds: ["00000000-0000-4000-8000-999999999999"]
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "unknown_player" });
  });
});
