// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST, PUT } from "../../src/app/api/team/route";
import { getPlayerCatalog } from "../../src/lib/game/catalog";
import { clearStoredTeamsForTests } from "../../src/lib/game/team-store";

function createPostRequest(body: unknown) {
  return new Request("http://localhost/api/team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function createGetRequest(viewerKey: string, gameweek = "gw-3") {
  return new Request(
    `http://localhost/api/team?viewerKey=${encodeURIComponent(viewerKey)}&gameweek=${encodeURIComponent(gameweek)}`
  );
}

describe("POST /api/team", () => {
  beforeEach(() => {
    clearStoredTeamsForTests();
  });

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
        viewerKey: "aino@example.com",
        teamName: "Tasapaino",
        playerIds: balancedIds,
        gameweekSlug: "gw-3"
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("rejects a team with unknown player ids", async () => {
    const response = await POST(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Virhe",
        playerIds: ["00000000-0000-4000-8000-999999999999"],
        gameweekSlug: "gw-3"
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "unknown_player" });
  });

  it("rejects team changes for locked gameweeks", async () => {
    const response = await POST(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Lukittu",
        playerIds: balancedIds,
        gameweekSlug: "gw-2"
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(423);
    expect(payload).toEqual({
      ok: false,
      code: "gameweek_locked",
      message: "Gameweek on lukittu. Muutokset eivat ole enaa sallittuja."
    });
  });

  it("persists a saved team and loads it back for the same viewer", async () => {
    await POST(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Tasapaino",
        playerIds: balancedIds,
        gameweekSlug: "gw-3"
      })
    );

    const response = await GET(createGetRequest("aino@example.com"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.team).toMatchObject({
      viewerKey: "aino@example.com",
      name: "Tasapaino",
      teamName: "Tasapaino",
      gameweekSlug: "gw-3",
      playerIds: balancedIds,
      revision: 1
    });
  });

  it("updates an existing team and bumps the revision", async () => {
    await POST(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Ensimmainen",
        playerIds: balancedIds,
        gameweekSlug: "gw-3"
      })
    );

    const updatedIds = getPlayerCatalog()
      .filter((player) =>
        [
          "Luke Hakala",
          "Juho Lehto",
          "Matti Kallio",
          "Oskar Niemi",
          "Samu Virtanen",
          "Eetu Koski",
          "Vilho Salo"
        ].includes(player.name)
      )
      .map((player) => player.id);

    const updateResponse = await PUT(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Paivitetty",
        playerIds: updatedIds,
        gameweekSlug: "gw-3"
      })
    );
    const updatePayload = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updatePayload.team).toMatchObject({
      name: "Paivitetty",
      revision: 2,
      playerIds: updatedIds
    });
  });
});
