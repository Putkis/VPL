// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

describe("POST /api/admin/ops/test-alert", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects non-admin callers", async () => {
    const { POST } = await import("../../src/app/api/admin/ops/test-alert/route");
    const response = await POST(
      new Request("http://localhost/api/admin/ops/test-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          viewerKey: "viewer@example.com"
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

  it("sends a critical alert for an admin caller when webhook is configured", async () => {
    process.env.ADMIN_EMAILS = "aino@example.com";
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          viewerKey: "aino@example.com",
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
});
