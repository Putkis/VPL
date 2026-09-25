import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFlow } from "../../src/app/onboarding/onboarding-flow";

const fetchMock = vi.fn();
const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn()
}));

vi.mock("../../src/lib/supabase/client", () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } })
    }
  })
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: "valid-onboarding-token",
          user: { email: "aino@example.com" }
        }
      },
      error: null
    });
  });

  it("shows progress and advances through the condensed steps", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText("aino@example.com")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Onboarding progress")).toHaveTextContent("1 / 3");
    await user.click(screen.getByRole("button", { name: "Seuraava" }));

    expect(screen.getByLabelText("Onboarding progress")).toHaveTextContent("2 / 3");
    expect(screen.getByRole("button", { name: /Tasapainoinen/i })).toBeInTheDocument();
  });

  it("requires a real session before the user can continue", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });

    render(<OnboardingFlow />);

    expect(await screen.findByRole("link", { name: "Kirjaudu sisään" })).toHaveAttribute("href", "/auth");
    expect(screen.getByRole("button", { name: "Seuraava" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves the starter team and exposes the next navigation links", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText("aino@example.com")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Tallenna aloitusjoukkue" }));

    await waitFor(() => {
      expect(screen.getByText(/Aloitusjoukkue tallennettu/i)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/team", expect.objectContaining({ method: "POST" }));
    const request = fetchMock.mock.calls[0][1];
    expect(request.headers.Authorization).toBe("Bearer valid-onboarding-token");
    expect(JSON.parse(request.body)).not.toHaveProperty("viewerKey");
    expect(screen.getByRole("link", { name: "Jatka team builderiin" })).toBeInTheDocument();
  });

  it("keeps the review step available for retry after a network failure", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      });

    render(<OnboardingFlow />);
    await waitFor(() => expect(screen.getByText("aino@example.com")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Tallenna aloitusjoukkue" }));

    expect(await screen.findByText(/Tallennus epäonnistui verkkovirheen vuoksi/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tallenna aloitusjoukkue" }));

    expect(await screen.findByText(/Aloitusjoukkue tallennettu/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
