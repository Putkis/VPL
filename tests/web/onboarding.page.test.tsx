import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFlow } from "../../src/app/onboarding/onboarding-flow";

const fetchMock = vi.fn();

describe("OnboardingFlow", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.clear();
  });

  it("shows progress and advances through the condensed steps", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);

    expect(screen.getByLabelText("Onboarding progress")).toHaveTextContent("1 / 3");
    await user.click(screen.getByRole("button", { name: "Seuraava" }));

    expect(screen.getByLabelText("Onboarding progress")).toHaveTextContent("2 / 3");
    expect(screen.getByRole("button", { name: /Tasapainoinen/i })).toBeInTheDocument();
  });

  it("saves the starter team and exposes the next navigation links", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    });

    render(<OnboardingFlow />);

    await user.clear(screen.getByLabelText("Demo tai oma sahkoposti"));
    await user.type(screen.getByLabelText("Demo tai oma sahkoposti"), "aino@example.com");
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Seuraava" }));
    await user.click(screen.getByRole("button", { name: "Tallenna aloitusjoukkue" }));

    await waitFor(() => {
      expect(screen.getByText(/Aloitusjoukkue tallennettu/i)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/team", expect.objectContaining({ method: "POST" }));
    expect(screen.getByRole("link", { name: "Jatka team builderiin" })).toBeInTheDocument();
  });
});
