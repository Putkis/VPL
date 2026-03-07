import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import RootLayout from "../../src/app/layout";

const originalDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

describe("RootLayout", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = originalDomain;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = originalDomain;
  });

  it("wraps children in html and body tags", () => {
    delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

    const html = renderToStaticMarkup(
      <RootLayout>
        <main>content</main>
      </RootLayout>
    );

    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("<body>");
    expect(html).toContain("<main>content</main>");
    expect(html).toContain("</body>");
    expect(html).toContain("</html>");
  });

  it("adds Plausible script tags when domain is configured", () => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = "vpl.example.com";

    const html = renderToStaticMarkup(
      <RootLayout>
        <main>content</main>
      </RootLayout>
    );

    expect(html).toContain("https://plausible.io/js/script.js");
    expect(html).toContain("data-domain=\"vpl.example.com\"");
    expect(html).toContain("window.plausible=window.plausible||function()");
  });
});
