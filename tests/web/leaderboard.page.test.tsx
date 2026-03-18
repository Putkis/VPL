import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LeaderboardPanel } from "../../src/app/leaderboard/leaderboard-panel";

describe("LeaderboardPanel", () => {
  it("switches between global and friends scopes", async () => {
    const user = userEvent.setup();
    render(<LeaderboardPanel />);

    expect(screen.getByText("Pressing United")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Friends" }));

    expect(screen.getAllByText("Viherio CF").length).toBeGreaterThan(0);
  });
});
