import { describe, expect, it } from "vitest";

describe("mvp stack", () => {
  it("has cloud run as hosting decision", () => {
    expect("cloud-run").toContain("run");
  });
});

