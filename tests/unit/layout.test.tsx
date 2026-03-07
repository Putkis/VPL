import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import RootLayout from "../../src/app/layout";

const originalMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

describe("RootLayout", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalMeasurementId;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalMeasurementId;
  });

  it("wraps children in html and body tags", () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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

  it("adds GA script tags when measurement id is configured", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";

    const html = renderToStaticMarkup(
      <RootLayout>
        <main>content</main>
      </RootLayout>
    );

    expect(html).toContain("https://www.googletagmanager.com/gtag/js?id=G-TEST123");
    expect(html).toContain("window.dataLayer = window.dataLayer || [];");
    expect(html).toContain("gtag('config', 'G-TEST123');");
  });
});
