import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminResultsPanel } from "../../src/app/admin/results/results-panel";

const fetchMock = vi.fn();
const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(async (): Promise<{ data: { session: { access_token: string; user: { email: string } } | null } }> => ({
    data: { session: { access_token: "valid-admin-token", user: { email: "aino@example.com" } } }
  }))
}));

vi.mock("../../src/lib/supabase/client", () => ({
  getSupabaseClient: () => ({ auth: { getSession: getSessionMock } })
}));

describe("AdminResultsPanel", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "valid-admin-token", user: { email: "aino@example.com" } } }
    });
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

    await waitFor(() => {
      expect(screen.getByText(/Kirjautunut käyttäjä: aino@example.com/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));

    await waitFor(() => {
      expect(screen.getByText("Tulokset tallennettu. Riveja 2.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Kaynnista pisteytys" }));

    await waitFor(() => {
      expect(screen.getByText(/Pisteytys ajettu gameweekille gw-2/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Viherio CF")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer valid-admin-token");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty("viewerKey");
  });

  it("reports malformed JSON before sending the request", async () => {
    const user = userEvent.setup();
    render(<AdminResultsPanel />);

    fireEvent.change(screen.getByLabelText("Stat-rivit JSON"), { target: { value: "{" } });
    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));

    expect(fetchMock).not.toHaveBeenCalledWith("/api/admin/results", expect.anything());
    expect(screen.getByText("JSON ei ole kelvollinen.")).toBeInTheDocument();
  });

  it("does not call the admin API without a signed-in user", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const user = userEvent.setup();
    render(<AdminResultsPanel />);
    await user.click(screen.getByRole("button", { name: "Tallenna tulokset" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Kirjaudu sisään admin-tilillä.");
  });
});
