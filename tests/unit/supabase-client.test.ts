// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn(() => ({ mocked: true }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

const originalEnv = { ...process.env };

describe("supabase client", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockClear();
    process.env = { ...originalEnv };
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("creates client using public env vars", async () => {
    const { supabase } = await import("../../src/lib/supabase/client");

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
    expect(supabase).toEqual({ mocked: true });
  });
});
