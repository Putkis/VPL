import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamBuilder } from "../../src/app/team-builder/team-builder";
import { getPlayerCatalog } from "../../src/lib/game/catalog";

const fetchMock = vi.fn();

describe("TeamBuilder", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows role or team-size validation feedback before save", async () => {
    const user = userEvent.setup();
    render(<TeamBuilder players={getPlayerCatalog()} />);

    await user.click(screen.getByRole("button", { name: /Luke Hakala/i }));
    await user.click(screen.getByRole("button", { name: /Juho Lehto/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Valitse tasan 7 pelaajaa.");
  });

  it("shows lock state for already started gameweeks", async () => {
    const user = userEvent.setup();
    render(<TeamBuilder players={getPlayerCatalog()} />);

    await user.selectOptions(screen.getByLabelText("Gameweek"), "gw-2");

    expect(
      screen.getByText("Valittu gameweek on lukittu. API hylkaa tallennuksen deadline-ajan jalkeen.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tallenna joukkue" })).toBeDisabled();
  });
});
