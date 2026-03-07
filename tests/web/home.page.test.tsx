import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../../src/app/page";

const fetchMock = vi.fn();

describe("Home landing page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders hero content and default status text", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Liity odotuslistalle ennen julkista avautumista."
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ei roskapostia. Vain olennaiset paivitykset ja kutsut.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Sahkoposti")).toBeInTheDocument();
  });

  it("shows validation error for invalid email and does not call API", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Sahkoposti"), "invalid-email");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Anna kelvollinen sahkopostiosoite.")).toBeInTheDocument();
  });

  it("submits normalized email and shows success state", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    render(<Home />);

    await user.type(screen.getByLabelText("Sahkoposti"), "Hello@Example.com ");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hello@example.com" })
    });
    expect(screen.getByText("Kiitos! Olet nyt odotuslistalla.")).toBeInTheDocument();
  });

  it("shows backend validation message on 400 response", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 400 }));

    render(<Home />);

    await user.type(screen.getByLabelText("Sahkoposti"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(
      screen.getByText("Sahkopostiosoite ei kelpaa. Tarkista osoite ja yrita uudelleen.")
    ).toBeInTheDocument();
  });
});
