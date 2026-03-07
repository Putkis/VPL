import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../../src/app/page";

const fetchMock = vi.fn();
const plausibleMock = vi.fn();

type WindowWithPlausible = Window & {
  plausible?: (
    eventName: string,
    options?: { props?: Record<string, string | number | boolean> }
  ) => void;
};

describe("Home landing page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    plausibleMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    (window as WindowWithPlausible).plausible = plausibleMock;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (window as WindowWithPlausible).plausible;
  });

  it("renders hero content and default status text", async () => {
    render(<Home />);
    const status = screen.getByRole("status");

    expect(
      screen.getByRole("heading", {
        name: "Liity odotuslistalle ennen julkista avautumista."
      })
    ).toBeInTheDocument();
    expect(status).toHaveTextContent("Ei roskapostia. Vain olennaiset paivitykset ja kutsut.");
    expect(screen.getByLabelText("Sahkoposti")).toBeInTheDocument();
    await waitFor(() => {
      expect(plausibleMock).toHaveBeenCalledWith("page_view");
    });
  });

  it("shows validation error for invalid email and does not call API", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const status = screen.getByRole("status");

    await user.type(screen.getByLabelText("Sahkoposti"), "invalid-email");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(status).toHaveTextContent("Anna kelvollinen sahkopostiosoite.");
    expect(plausibleMock).toHaveBeenCalledWith("signup_submit");
    expect(plausibleMock).toHaveBeenCalledWith("signup_error", {
      props: { reason: "invalid_email" }
    });
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
    const status = screen.getByRole("status");

    await user.type(screen.getByLabelText("Sahkoposti"), "Hello@Example.com ");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hello@example.com" })
    });
    expect(status).toHaveTextContent("Kiitos! Olet nyt odotuslistalla.");
    expect(plausibleMock).toHaveBeenCalledWith("signup_submit");
    expect(plausibleMock).toHaveBeenCalledWith("signup_success");
  });

  it("shows backend validation message on 400 response", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 400 }));

    render(<Home />);
    const status = screen.getByRole("status");

    await user.type(screen.getByLabelText("Sahkoposti"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(status).toHaveTextContent(
      "Sahkopostiosoite ei kelpaa. Tarkista osoite ja yrita uudelleen."
    );
    expect(plausibleMock).toHaveBeenCalledWith("signup_submit");
    expect(plausibleMock).toHaveBeenCalledWith("signup_error", {
      props: { reason: "invalid_email" }
    });
  });

  it("tracks network error separately when request throws", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new Error("connection lost"));

    render(<Home />);
    const status = screen.getByRole("status");

    await user.type(screen.getByLabelText("Sahkoposti"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(status).toHaveTextContent(
      "Yhteys katkesi. Tarkista verkkoyhteys ja yrita uudelleen."
    );
    expect(plausibleMock).toHaveBeenCalledWith("signup_submit");
    expect(plausibleMock).toHaveBeenCalledWith("signup_error", {
      props: { reason: "network_error" }
    });
  });
});
