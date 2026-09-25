import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaguesPanel } from "../../src/app/leagues/leagues-panel";

describe("LeaguesPanel", () => {
  it("renders league cards and member names", () => {
    render(<LeaguesPanel />);

    expect(screen.getByText("South Stand")).toBeInTheDocument();
    expect(screen.getByText("Aino / Viherio CF")).toBeInTheDocument();
  });
});
