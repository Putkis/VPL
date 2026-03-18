// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

describe("POST /api/ops/errors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("ingests a fatal client error and attempts an alert", async () => {
    process.env.APP_ENV = "staging";
    process.env.APP_RELEASE = "sha-789";
    process.env.ALERT_WEBHOOK_URL = "https://alerts.example.test";

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("../../src/app/api/ops/errors/route");
    const response = await POST(
      new Request("http://localhost/api/ops/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Client crash",
          stack: "stack-trace",
          digest: "digest-123",
          source: "app.global-error",
          fatal: true
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      alertAttempted: true,
      alertSent: true
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed payloads", async () => {
    const { POST } = await import("../../src/app/api/ops/errors/route");
    const response = await POST(
      new Request("http://localhost/api/ops/errors", {
        method: "POST",
        body: "{"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, code: "invalid_payload" });
  });
});
