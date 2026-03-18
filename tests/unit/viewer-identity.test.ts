import { beforeEach, describe, expect, it } from "vitest";
import {
  clearViewerEmail,
  demoViewerKey,
  getViewerKey,
  setViewerEmail
} from "../../src/lib/game/viewer-identity";

describe("viewer identity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("falls back to the demo viewer when no email is stored", () => {
    expect(getViewerKey()).toBe(demoViewerKey);
  });

  it("normalizes and stores the viewer email", () => {
    setViewerEmail("  Aino@Example.com ");

    expect(window.localStorage.getItem("vpl.viewer.email")).toBe("aino@example.com");
    expect(getViewerKey()).toBe("aino@example.com");
  });

  it("ignores blank emails and clears the stored viewer", () => {
    setViewerEmail("aino@example.com");
    setViewerEmail("   ");

    expect(getViewerKey()).toBe("aino@example.com");

    clearViewerEmail();

    expect(getViewerKey()).toBe(demoViewerKey);
  });
});
