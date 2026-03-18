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

function createRawPostRequest(body: string) {
  return new Request("http://localhost/api/team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
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

  const expensiveIds = getPlayerCatalog()
    .filter((player) =>
      [
        "Luke Hakala",
        "Juho Lehto",
        "Matti Kallio",
        "Oskar Niemi",
        "Leo Laine",
        "Eetu Koski",
        "Vilho Salo"
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

  it("rejects malformed JSON payloads", async () => {
    const response = await POST(createRawPostRequest("{"));

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_payload" });
  });

  it("rejects invalid team payloads before catalog lookup", async () => {
    const response = await POST(
      createPostRequest({
        teamName: "No",
        playerIds: []
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_team" });
  });

  it("rejects balanced squads that exceed the budget", async () => {
    const response = await POST(
      createPostRequest({
        teamName: "Liian kallis",
        playerIds: expensiveIds
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("budget_exceeded");
    expect(payload.message).toContain("Budjetti ylittyy");
  });
});
