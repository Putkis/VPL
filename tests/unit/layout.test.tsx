import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout from "../../src/app/layout";

describe("RootLayout", () => {
  it("wraps children in html and body tags", () => {
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
});
