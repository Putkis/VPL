import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PlayersBoard } from "../../src/app/players/players-board";
import { getPlayerCatalog } from "../../src/lib/game/catalog";

describe("PlayersBoard", () => {
  it("filters visible players based on the selected controls", async () => {
    const user = userEvent.setup();
    render(<PlayersBoard players={getPlayerCatalog()} />);

    await user.selectOptions(screen.getByLabelText("Rooli"), "forward");
    await user.selectOptions(screen.getByLabelText("Lajittelu"), "price-asc");

    expect(screen.getByText("Vilho Salo")).toBeInTheDocument();
    expect(screen.getByText("Eetu Koski")).toBeInTheDocument();
    expect(screen.queryByText("Leo Laine")).not.toBeInTheDocument();
  });
});
