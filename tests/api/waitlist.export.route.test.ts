// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { orderMock, selectMock, fromMock, createClientMock } = vi.hoisted(() => {
  const order = vi.fn();
  const select = vi.fn(() => ({
    order
  }));
  const from = vi.fn(() => ({
    select
  }));
  const createClient = vi.fn(() => ({
    from
  }));
  return {
    orderMock: order,
    selectMock: select,
    fromMock: from,
    createClientMock: createClient
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("../../src/lib/env.server", () => ({
  readServerEnv: () => ({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key"
  })
}));

import { GET } from "../../src/app/api/admin/waitlist/export/route";

function createGetRequest(token?: string) {
  return new Request("http://localhost/api/admin/waitlist/export", {
    method: "GET",
    headers: token
      ? {
          "x-admin-export-token": token
        }
      : undefined
  });
}

const originalExportToken = process.env.WAITLIST_EXPORT_TOKEN;

describe("GET /api/admin/waitlist/export", () => {
  beforeEach(() => {
    process.env.WAITLIST_EXPORT_TOKEN = "secret-token";
    createClientMock.mockClear();
    fromMock.mockClear();
    selectMock.mockClear();
    orderMock.mockReset();
    orderMock.mockResolvedValue({
      data: [
        {
          email: "hello@example.com",
          top_feature_interest: "friend_leagues",
          created_at: "2026-03-07T11:00:00.000Z"
        }
      ],
      error: null
    });
  });

  afterAll(() => {
    process.env.WAITLIST_EXPORT_TOKEN = originalExportToken;
  });

  it("returns 503 when export token is not configured", async () => {
    delete process.env.WAITLIST_EXPORT_TOKEN;

    const response = await GET(createGetRequest("secret-token"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({ ok: false, code: "export_not_configured" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const response = await GET(createGetRequest("wrong-token"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ ok: false, code: "unauthorized" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns CSV export for authorized admin", async () => {
    const response = await GET(createGetRequest("secret-token"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain("waitlist-signups.csv");
    expect(fromMock).toHaveBeenCalledWith("waitlist_signups");
    expect(selectMock).toHaveBeenCalledWith("email,top_feature_interest,created_at");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(body).toContain("email,top_feature_interest,created_at");
    expect(body).toContain("hello@example.com,friend_leagues,2026-03-07T11:00:00.000Z");
  });

  it("returns 500 when export query fails", async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: { message: "db down" }
    });

    const response = await GET(createGetRequest("secret-token"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ ok: false, code: "server_error" });
  });
});
