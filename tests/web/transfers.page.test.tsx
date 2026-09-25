import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransfersPanel } from "../../src/app/transfers/transfers-panel";

describe("TransfersPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-04-18T12:54:59.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows minus points after the free transfer is exceeded", async () => {
    const user = userEvent.setup();
    render(<TransfersPanel />);

    await user.clear(screen.getByLabelText("Siirtojen maara talla viikolla"));
    await user.type(screen.getByLabelText("Siirtojen maara talla viikolla"), "2");

    expect(screen.getByText("Siirto onnistuu. Miinuspisteet: 4")).toBeInTheDocument();
  });
});
