import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WeekViewPanel } from "../../src/app/week-view/week-view-panel";

describe("WeekViewPanel", () => {
  it("renders the week-delta view and updates selection", async () => {
    const user = userEvent.setup();
    render(<WeekViewPanel />);

    expect(screen.getByText("Sijoitusmuutokset")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Nykyinen viikko"), "gw-3");

    expect(screen.getByText("Top movers")).toBeInTheDocument();
  });

  it("keeps the current-week selector ahead of the comparison week", async () => {
    const user = userEvent.setup();
    render(<WeekViewPanel />);

    await user.selectOptions(screen.getByLabelText("Edellinen viikko"), "gw-2");

    expect(screen.getByLabelText("Nykyinen viikko")).toHaveValue("gw-3");
    expect(screen.queryByText("Valitse kaksi eri gameweekia vertailuun.")).not.toBeInTheDocument();
  });
});
