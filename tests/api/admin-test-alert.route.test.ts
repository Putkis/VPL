// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getAuthenticatedAdminEmailMock } = vi.hoisted(() => ({
  getAuthenticatedAdminEmailMock: vi.fn()
}));

vi.mock("../../src/lib/game/admin", () => ({
  getAuthenticatedAdminEmail: getAuthenticatedAdminEmailMock
}));

const originalEnv = { ...process.env };

describe("POST /api/admin/ops/test-alert", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    getAuthenticatedAdminEmailMock.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects non-admin callers", async () => {
    getAuthenticatedAdminEmailMock.mockResolvedValue(null);
    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          viewerKey: "admin@example.com",
          message: "test alert"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      code: "forbidden",
      message: "Admin-oikeus puuttuu."
    });
  });

  it("rejects malformed payloads", async () => {
    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        body: "{"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_payload" });
  });

  it("returns 503 when the alert webhook is missing", async () => {
    getAuthenticatedAdminEmailMock.mockResolvedValue("aino@example.com");

    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-test-token"
        },
        body: JSON.stringify({ message: "test alert" })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      ok: false,
      code: "alert_not_configured",
      message: "Alert-webhookia ei ole maaritetty."
    });
  });

  it("sends a critical alert for an admin caller when webhook is configured", async () => {
    getAuthenticatedAdminEmailMock.mockResolvedValue("aino@example.com");
    process.env.APP_ENV = "staging";
    process.env.APP_RELEASE = "sha-999";
    process.env.ALERT_WEBHOOK_URL = "https://alerts.example.test";

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-test-token"
        },
        body: JSON.stringify({
          message: "Stage smoke alert"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      alertAttempted: true,
      alertSent: true,
      environment: "staging",
      release: "sha-999"
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns service unavailable when session verification fails", async () => {
    getAuthenticatedAdminEmailMock.mockRejectedValue(new Error("auth unavailable"));

    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test alert" })
      })
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "auth_unavailable" });
  });
});
