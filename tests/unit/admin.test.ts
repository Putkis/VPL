import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, createClientMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  createClientMock: vi.fn(() => ({ auth: { getUser: vi.fn() } }))
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));

import { getAdminEmails, getAuthenticatedAdminEmail, isAdminViewer } from "../../src/lib/game/admin";

describe("admin authorization", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = "admin@example.com, another@example.com";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    vi.clearAllMocks();
    createClientMock.mockReturnValue({ auth: { getUser: getUserMock } } as never);
  });

  it("has no seeded or default admin when no admin list is configured", () => {
    delete process.env.ADMIN_EMAILS;
    expect(getAdminEmails()).toEqual([]);
    expect(isAdminViewer("aino@example.com")).toBe(false);
  });

  it("authorizes only the email verified from the bearer token", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ADMIN@example.com" } },
      error: null
    });
    const request = new Request("http://localhost", {
      headers: { Authorization: "Bearer signed-access-token" }
    });

    await expect(getAuthenticatedAdminEmail(request)).resolves.toBe("admin@example.com");
    expect(createClientMock).toHaveBeenCalledWith("https://example.supabase.co", "anon-key", expect.any(Object));
    expect(getUserMock).toHaveBeenCalledWith("signed-access-token");
  });

  it("rejects missing or invalid tokens and users outside the configured list", async () => {
    await expect(getAuthenticatedAdminEmail(new Request("http://localhost"))).resolves.toBeNull();
    getUserMock.mockResolvedValue({ data: { user: { email: "ordinary@example.com" } }, error: null });
    await expect(getAuthenticatedAdminEmail(new Request("http://localhost", {
      headers: { Authorization: "Bearer signed-access-token" }
    }))).resolves.toBeNull();
    getUserMock.mockResolvedValue({ data: { user: null }, error: new Error("invalid token") });
    await expect(getAuthenticatedAdminEmail(new Request("http://localhost", {
      headers: { Authorization: "Bearer bad-token" }
    }))).resolves.toBeNull();
  });

  it("reports missing auth configuration instead of granting access", async () => {
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await expect(getAuthenticatedAdminEmail(new Request("http://localhost", {
      headers: { Authorization: "Bearer signed-access-token" }
    }))).rejects.toThrow("Supabase Auth is not configured");
  });
});
