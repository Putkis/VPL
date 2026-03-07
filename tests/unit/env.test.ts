// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("parses required public Supabase env vars", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";

    const { env } = await import("../../src/lib/env");

    expect(env.SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.SUPABASE_ANON_KEY).toBe("anon-key");
  });

  it("throws when public Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    await expect(import("../../src/lib/env")).rejects.toThrow();
  });
});
