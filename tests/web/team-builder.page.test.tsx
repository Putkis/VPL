import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamBuilder } from "../../src/app/team-builder/team-builder";
import { getPlayerCatalog } from "../../src/lib/game/catalog";

const fetchMock = vi.fn();

describe("TeamBuilder", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input: string, init?: { method?: string }) => {
      if (!init?.method || init.method === "GET") {
        return {
          ok: true,
          json: async () => ({ ok: true, team: null })
        };
      }

      return {
        ok: true,
        json: async () => ({
          ok: true,
          team: {
            name: "Viikon nousijat",
            playerIds: [],
            gameweekSlug: "gw-3",
            revision: 1,
            updatedAt: "2026-03-18T00:00:00.000Z"
          }
        })
      };
    });
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

  it("loads a saved team for the active viewer", async () => {
    fetchMock.mockImplementation(async (input: string, init?: { method?: string }) => {
      if (!init?.method || init.method === "GET") {
        expect(input).toContain("viewerKey=demo%40local.vpl");
        return {
          ok: true,
          json: async () => ({
            ok: true,
            team: {
              viewerKey: "demo@local.vpl",
              name: "Tallennettu XI",
              teamName: "Tallennettu XI",
              playerIds: getPlayerCatalog()
                .filter((player) =>
                  ["Luke Hakala", "Juho Lehto", "Matti Kallio"].includes(player.name)
                )
                .map((player) => player.id),
              gameweekSlug: "gw-3",
              revision: 2,
              updatedAt: "2026-03-18T00:00:00.000Z"
            }
          })
        };
      }

      return {
        ok: true,
        json: async () => ({ ok: true, team: null })
      };
    });

    render(<TeamBuilder players={getPlayerCatalog()} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Tallennettu XI")).toBeInTheDocument();
    });
    expect(screen.getByText(/Versio 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paivita joukkue" })).toBeInTheDocument();
  });

  it("restores the last saved team when an optimistic update fails", async () => {
    const savedPlayerIds = getPlayerCatalog()
      .filter((player) =>
        [
          "Luke Hakala",
          "Juho Lehto",
          "Matti Kallio",
          "Oskar Niemi",
          "Leo Laine",
          "Eetu Koski",
          "Samu Virtanen"
        ].includes(player.name)
      )
      .map((player) => player.id);

    fetchMock.mockImplementation(async (_input: string, init?: { method?: string }) => {
      if (!init?.method || init.method === "GET") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            team: {
              viewerKey: "demo@local.vpl",
              name: "Tallennettu XI",
              teamName: "Tallennettu XI",
              playerIds: savedPlayerIds,
              gameweekSlug: "gw-3",
              revision: 1,
              updatedAt: "2026-03-18T00:00:00.000Z"
            }
          })
        };
      }

      return {
        ok: false,
        json: async () => ({
          ok: false,
          message: "Tallennus epaonnistui. Edellinen versio palautettiin."
        })
      };
    });

    const user = userEvent.setup();
    render(<TeamBuilder players={getPlayerCatalog()} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Tallennettu XI")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Joukkueen nimi");
    await user.clear(nameInput);
    await user.type(nameInput, "Muutettu nimi");
    await user.click(screen.getByRole("button", { name: /Samu Virtanen/i }));
    await user.click(screen.getByRole("button", { name: "Paivita joukkue" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Tallennettu XI")).toBeInTheDocument();
    });
    expect(screen.getByText("Tallennus epaonnistui. Edellinen versio palautettiin.")).toBeInTheDocument();
  });
});
