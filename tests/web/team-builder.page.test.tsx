import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeamBuilderPage from "../../src/app/team-builder/page";
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

  it("saves a valid team and confirms the backend accepted it", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    });

    render(<TeamBuilder players={getPlayerCatalog()} />);

    for (const name of [
      "Luke Hakala",
      "Juho Lehto",
      "Matti Kallio",
      "Oskar Niemi",
      "Leo Laine",
      "Eetu Koski",
      "Samu Virtanen"
    ]) {
      await user.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
    }

    await user.click(screen.getByRole("button", { name: "Tallenna joukkue" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/team",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        })
      );
    });
    expect(screen.getByText("Joukkue tallennettu. Backend vahvisti budjetin ja roolijaon.")).toBeInTheDocument();

    const [, options] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(options.body)).toMatchObject({
      teamName: "Viikon nousijat"
    });
    expect(JSON.parse(options.body).playerIds).toHaveLength(7);
  });

  it("shows backend errors and caps the selection at seven players", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, validation: { message: "Backend esti tallennuksen." } })
    });

    render(<TeamBuilder players={getPlayerCatalog()} />);

    for (const name of [
      "Luke Hakala",
      "Juho Lehto",
      "Matti Kallio",
      "Oskar Niemi",
      "Leo Laine",
      "Eetu Koski",
      "Vilho Salo",
      "Samu Virtanen"
    ]) {
      await user.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
    }

    expect(screen.getByRole("button", { name: /Vilho Salo/i })).toHaveClass("selected");
    expect(screen.getByRole("button", { name: /Samu Virtanen/i })).not.toHaveClass("selected");

    await user.click(screen.getByRole("button", { name: "Tallenna joukkue" }));

    await waitFor(() => {
      expect(screen.getByText("Backend esti tallennuksen.")).toBeInTheDocument();
    });
  });
});

describe("TeamBuilderPage", () => {
  it("renders the team builder with the seeded player catalog", () => {
    render(<TeamBuilderPage />);

    expect(screen.getByRole("heading", { name: /Joukkueen luonti budjettisaannoilla/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Luke Hakala/i })).toBeInTheDocument();
  });
});
