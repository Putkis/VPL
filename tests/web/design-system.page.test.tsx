import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DesignSystemPage from "../../src/app/design-system/page";

describe("DesignSystemPage", () => {
  it("renders core sections from the design system", () => {
    render(<DesignSystemPage />);

    expect(screen.getByRole("heading", { name: "Brand Identity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Color Palette" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Typography" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Buttons & UI Elements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cards & Components" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Iconography" })).toBeInTheDocument();
  });
});
