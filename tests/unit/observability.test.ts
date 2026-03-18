// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

describe("observability helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("reads runtime tags from app env and release vars", async () => {
    process.env.APP_ENV = "staging";
    process.env.APP_RELEASE = "sha-123";

    const { getRuntimeTags } = await import("../../src/lib/observability");

    expect(getRuntimeTags()).toEqual({
      environment: "staging",
      release: "sha-123"
    });
  });

  it("logs structured errors and sends alerts for critical incidents", async () => {
    process.env.APP_ENV = "staging";
    process.env.APP_RELEASE = "sha-456";
    process.env.ALERT_WEBHOOK_URL = "https://alerts.example.test";

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);

    const { captureServerError } = await import("../../src/lib/observability.server");

    const result = await captureServerError(new Error("boom"), {
      source: "test.runner",
      route: "/api/test",
      severity: "critical",
      metadata: {
        ticket: 23
      }
    });

    expect(result.alert).toEqual({
      attempted: true,
      sent: true
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock.mock.calls[0]?.[0]).toContain("\"environment\":\"staging\"");
    expect(consoleErrorMock.mock.calls[0]?.[0]).toContain("\"release\":\"sha-456\"");
  });

  it("normalizes plain objects with a message field", async () => {
    const { normalizeError } = await import("../../src/lib/observability");

    expect(normalizeError({ message: "db down" })).toEqual({
      name: "UnknownError",
      message: "db down",
      stack: null
    });
  });
});
