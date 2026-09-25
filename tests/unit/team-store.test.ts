import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, fromMock, queryMock, createClientMock } = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    upsert: vi.fn(),
    single: vi.fn()
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.upsert.mockReturnValue(query);
  return {
    getUserMock: vi.fn(),
    fromMock: vi.fn(() => query),
    queryMock: query,
    createClientMock: vi.fn(() => ({ auth: { getUser: vi.fn() }, from: vi.fn() }))
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

import { getAuthenticatedUser, getStoredTeam, saveStoredTeam } from "../../src/lib/game/team-store";

describe("saved team storage", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    vi.clearAllMocks();
    queryMock.select.mockReturnValue(queryMock);
    queryMock.eq.mockReturnValue(queryMock);
    queryMock.upsert.mockReturnValue(queryMock);
  });

  it("validates the bearer token with Supabase Auth", async () => {
    const client = { auth: { getUser: getUserMock }, from: fromMock };
    createClientMock.mockReturnValue(client as never);
    getUserMock.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });

    await expect(getAuthenticatedUser(new Request("http://localhost", {
      headers: { Authorization: "Bearer valid-token" }
    }))).resolves.toEqual({ userId: "user-123", accessToken: "valid-token" });
    expect(getUserMock).toHaveBeenCalledWith("valid-token");
  });

  it("does not create an auth client when a bearer token is missing", async () => {
    createClientMock.mockClear();
    await expect(getAuthenticatedUser(new Request("http://localhost"))).resolves.toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("loads a saved team scoped by user and gameweek", async () => {
    queryMock.maybeSingle.mockResolvedValue({
      data: {
        owner_id: "user-123", gameweek_slug: "gw-3", team_name: "Tallennettu",
        player_ids: ["player-1"], revision: 2, updated_at: "2026-03-18T12:00:00Z"
      }, error: null
    });
    createClientMock.mockReturnValue({ auth: { getUser: getUserMock }, from: fromMock } as never);

    await expect(getStoredTeam("user-123", "gw-3", "valid-token")).resolves.toMatchObject({
      ownerId: "user-123", teamName: "Tallennettu", revision: 2
    });
    expect(fromMock).toHaveBeenCalledWith("saved_teams");
    expect(queryMock.eq).toHaveBeenNthCalledWith(1, "owner_id", "user-123");
    expect(queryMock.eq).toHaveBeenNthCalledWith(2, "gameweek_slug", "gw-3");
    expect(createClientMock).toHaveBeenCalledWith("https://example.supabase.co", "anon-key", expect.objectContaining({
      global: { headers: { Authorization: "Bearer valid-token" } }
    }));
  });

  it("upserts a team using the authenticated owner and returns the stored revision", async () => {
    queryMock.single.mockResolvedValue({
      data: {
        owner_id: "user-123", gameweek_slug: "gw-3", team_name: "Oma joukkue",
        player_ids: ["player-1"], revision: 1, updated_at: "2026-03-18T12:00:00Z"
      }, error: null
    });
    createClientMock.mockReturnValue({ auth: { getUser: getUserMock }, from: fromMock } as never);

    await expect(saveStoredTeam({
      ownerId: "user-123", gameweekSlug: "gw-3", teamName: "Oma joukkue",
      playerIds: ["player-1"], accessToken: "valid-token"
    })).resolves.toMatchObject({ ownerId: "user-123", revision: 1 });
    expect(queryMock.upsert).toHaveBeenCalledWith(expect.objectContaining({ owner_id: "user-123" }), {
      onConflict: "owner_id,gameweek_slug"
    });
  });
});
