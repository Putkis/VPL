import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminResultsPanel } from "../../src/app/admin/results/results-panel";

const fetchMock = vi.fn();

describe("AdminResultsPanel", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input: string) => {
      if (input === "/api/admin/results") {
        return {
          ok: true,
          json: async () => ({ ok: true, savedStatCount: 2 })
        };
      }

      return {
        ok: true,
        json: async () => ({
          ok: true,
          scoreRun: {
            gameweekSlug: "gw-2",
            ranAt: "2026-03-18T00:00:00.000Z",
            submittedBy: "aino@example.com"
          },
          teamScores: [
            {
              rank: 1,
              teamName: "Viherio CF",
              gameweekPoints: 52
            }
          ]
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("saves result rows and runs scoring from the same panel", async () => {
    const user = userEvent.setup();
    render(<AdminResultsPanel />);

    await user.clear(screen.getByLabelText("Viewer / admin email"));
    await user.type(screen.getByLabelText("Viewer / admin email"), "aino@example.com");
    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));

    await waitFor(() => {
      expect(screen.getByText("Tulokset tallennettu. Riveja 2.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Kaynnista pisteytys" }));

    await waitFor(() => {
      expect(screen.getByText(/Pisteytys ajettu gameweekille gw-2/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Viherio CF")).toBeInTheDocument();
  });

  it("reports malformed JSON before sending the request", async () => {
    const user = userEvent.setup();
    render(<AdminResultsPanel />);

    fireEvent.change(screen.getByLabelText("Stat-rivit JSON"), { target: { value: "{" } });
    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));

    expect(fetchMock).not.toHaveBeenCalledWith("/api/admin/results", expect.anything());
    expect(screen.getByText("JSON ei ole kelvollinen.")).toBeInTheDocument();
  });

  it("disables both actions while a save is in flight", async () => {
    let resolveSave: (() => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = () =>
            resolve({
              ok: true,
              json: async () => ({ ok: true, savedStatCount: 2 })
            });
        })
    );

    const user = userEvent.setup();
    render(<AdminResultsPanel />);

    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));

    expect(screen.getByRole("button", { name: "Tallennetaan..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Kaynnista pisteytys" })).toBeDisabled();

    resolveSave?.();
    await waitFor(() => {
      expect(screen.getByText("Tulokset tallennettu. Riveja 2.")).toBeInTheDocument();
    });
  });
});
