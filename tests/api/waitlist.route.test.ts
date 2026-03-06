// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsertMock, fromMock, createClientMock } = vi.hoisted(() => {
  const upsert = vi.fn();
  const from = vi.fn(() => ({
    upsert
  }));
  const createClient = vi.fn(() => ({
    from
  }));
  return {
    upsertMock: upsert,
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

import { POST } from "../../src/app/api/waitlist/route";

function createPostRequest(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    createClientMock.mockClear();
    fromMock.mockClear();
    upsertMock.mockReset();
    upsertMock.mockResolvedValue({ error: null });
  });

  it("stores a valid email", async () => {
    const response = await POST(createPostRequest({ email: "hello@example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ ok: true });
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith("waitlist_signups");
    expect(upsertMock).toHaveBeenCalledWith(
      { email: "hello@example.com" },
      { onConflict: "email", ignoreDuplicates: true }
    );
  });

  it("rejects an invalid email", async () => {
    const response = await POST(createPostRequest({ email: "invalid-email" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_email" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: "not-json"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_payload" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns a server error when storage fails", async () => {
    upsertMock.mockResolvedValue({
      error: { message: "db down" }
    });

    const response = await POST(createPostRequest({ email: "hello@example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ ok: false, code: "server_error" });
  });
});
