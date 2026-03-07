import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../../src/app/page";

const fetchMock = vi.fn();
const gtagMock = vi.fn();

type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void;
};

const defaultFeatureLabel = "Kaveriliigat ja haastot";

async function selectTopFeatureInterest(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: defaultFeatureLabel }));
}

describe("Home landing page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    gtagMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    (window as WindowWithGtag).gtag = gtagMock;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (window as WindowWithGtag).gtag;
  });

  it("renders hero content and default status text", async () => {
    render(<Home />);
    const status = screen.getByRole("status");

    expect(
      screen.getByRole("heading", {
        name: "Liity odotuslistalle ennen julkista avautumista."
      })
    ).toBeInTheDocument();
    expect(status).toHaveTextContent("Ei roskapostia. Vain olennaiset päivitykset ja kutsut.");
    expect(
      screen.getByRole("group", { name: "Mikä toiminnallisuus kiinnostaa eniten?" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: defaultFeatureLabel })).toBeInTheDocument();
    expect(screen.getByLabelText("Sähköposti")).toBeInTheDocument();
    await waitFor(() => {
      expect(gtagMock).toHaveBeenCalledWith("event", "page_view");
    });
  });

  it("shows validation error for missing feature choice and does not call API", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const status = screen.getByRole("status");

    await user.type(screen.getByLabelText("Sähköposti"), "valid@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(status).toHaveTextContent("Valitse sinua eniten kiinnostava toiminnallisuus.");
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_error", {
      reason: "invalid_feature_interest"
    });
  });

  it("shows validation error for invalid email and does not call API", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const status = screen.getByRole("status");

    await selectTopFeatureInterest(user);
    await user.type(screen.getByLabelText("Sähköposti"), "invalid-email");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(status).toHaveTextContent("Anna kelvollinen sähköpostiosoite.");
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_submit", {
      top_feature_interest: "friend_leagues"
    });
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_error", {
      reason: "invalid_email"
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

    await selectTopFeatureInterest(user);
    await user.type(screen.getByLabelText("Sähköposti"), "Hello@Example.com ");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "hello@example.com",
        topFeatureInterest: "friend_leagues"
      })
    });
    expect(status).toHaveTextContent("Kiitos! Olet nyt odotuslistalla.");
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_submit", {
      top_feature_interest: "friend_leagues"
    });
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_success");
  });

  it("shows backend validation message on 400 response", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 400 }));

    render(<Home />);
    const status = screen.getByRole("status");

    await selectTopFeatureInterest(user);
    await user.type(screen.getByLabelText("Sähköposti"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(status).toHaveTextContent(
      "Sähköpostiosoite ei kelpaa. Tarkista osoite ja yritä uudelleen."
    );
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_submit", {
      top_feature_interest: "friend_leagues"
    });
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_error", {
      reason: "invalid_email"
    });
  });

  it("tracks network error separately when request throws", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new Error("connection lost"));

    render(<Home />);
    const status = screen.getByRole("status");

    await selectTopFeatureInterest(user);
    await user.type(screen.getByLabelText("Sähköposti"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Liity odotuslistalle" }));

    expect(status).toHaveTextContent(
      "Yhteys katkesi. Tarkista verkkoyhteys ja yritä uudelleen."
    );
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_submit", {
      top_feature_interest: "friend_leagues"
    });
    expect(gtagMock).toHaveBeenCalledWith("event", "signup_error", {
      reason: "network_error"
    });
  });
});
