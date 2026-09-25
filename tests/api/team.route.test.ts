// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST, PUT } from "../../src/app/api/team/route";
import { getPlayerCatalog } from "../../src/lib/game/catalog";

const teamStoreMocks = vi.hoisted(() => {
  const records = new Map<string, Record<string, unknown>>();
  return {
    records,
    getAuthenticatedUserId: vi.fn(async (): Promise<string | null> => "user-123"),
    getStoredTeam: vi.fn(async (ownerId: string, gameweekSlug: string) =>
      records.get(`${ownerId}::${gameweekSlug}`) ?? null
    ),
    saveStoredTeam: vi.fn(async (input: { ownerId: string; gameweekSlug: string; teamName: string; playerIds: string[] }) => {
      const key = `${input.ownerId}::${input.gameweekSlug}`;
      const previous = records.get(key);
      const record = {
        ownerId: input.ownerId,
        gameweekSlug: input.gameweekSlug,
        teamName: input.teamName,
        playerIds: [...input.playerIds],
        revision: Number(previous?.revision ?? 0) + 1,
        updatedAt: "2026-03-18T12:00:00.000Z"
      };
      records.set(key, record);
      return record;
    })
  };
});

vi.mock("../../src/lib/game/team-store", () => teamStoreMocks);

function createPostRequest(body: unknown) {
  return new Request("http://localhost/api/team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-test-token"
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

function createGetRequest(_viewerKey?: string, gameweek = "gw-3") {
  return new Request(
    `http://localhost/api/team?gameweek=${encodeURIComponent(gameweek)}`,
    { headers: { Authorization: "Bearer valid-test-token" } }
  );
}

describe("POST /api/team", () => {
  beforeEach(() => {
    teamStoreMocks.records.clear();
    teamStoreMocks.getAuthenticatedUserId.mockResolvedValue("user-123");
    teamStoreMocks.getStoredTeam.mockClear();
    teamStoreMocks.saveStoredTeam.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-18T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("rejects malformed JSON payloads", async () => {
    const response = await POST(createRawPostRequest("{"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_payload" });
  });

  it("rejects incomplete team payloads", async () => {
    const response = await POST(
      createPostRequest({
        viewerKey: "aino@example.com"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_team" });
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

  it("rejects unknown gameweeks", async () => {
    const response = await POST(
      createPostRequest({
        viewerKey: "aino@example.com",
        teamName: "Tuntematon",
        playerIds: balancedIds,
        gameweekSlug: "gw-99"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      ok: false,
      code: "unknown_gameweek",
      message: "Valittua gameweekia ei loydy."
    });
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
        viewerKey: "aino@example.com",
        teamName: "Liian kallis",
        playerIds: expensiveIds,
        gameweekSlug: "gw-3"
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("budget_exceeded");
    expect(payload.message).toContain("Budjetti ylittyy");
  });

  it("rejects unauthenticated saves", async () => {
    teamStoreMocks.getAuthenticatedUserId.mockResolvedValueOnce(null);
    const response = await POST(createPostRequest({ teamName: "Tasapaino", playerIds: balancedIds }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, code: "unauthorized" });
    expect(teamStoreMocks.saveStoredTeam).not.toHaveBeenCalled();
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

  it("persists a saved team and loads it back for the authenticated user", async () => {
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
      name: "Tasapaino",
      teamName: "Tasapaino",
      gameweekSlug: "gw-3",
      playerIds: balancedIds,
      revision: 1
    });
  });

  it("rejects saved-team reads without authentication", async () => {
    teamStoreMocks.getAuthenticatedUserId.mockResolvedValueOnce(null);
    const response = await GET(new Request("http://localhost/api/team?gameweek=gw-3"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ ok: false, code: "unauthorized" });
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
