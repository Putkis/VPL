import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPanel } from "../../src/app/auth/auth-panel";

const {
  getSupabaseClientMock,
  signUpMock,
  signInMock,
  signOutMock,
  getSessionMock,
  unsubscribeMock,
  onAuthStateChangeMock
} = vi.hoisted(() => ({
  getSupabaseClientMock: vi.fn(),
  signUpMock: vi.fn(),
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  getSessionMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  onAuthStateChangeMock: vi.fn()
}));

vi.mock("../../src/lib/supabase/client", () => ({
  getSupabaseClient: getSupabaseClientMock
}));

describe("AuthPanel", () => {
  beforeEach(() => {
    getSupabaseClientMock.mockReset();
    signUpMock.mockReset();
    signInMock.mockReset();
    signOutMock.mockReset();
    getSessionMock.mockReset();
    unsubscribeMock.mockReset();
    onAuthStateChangeMock.mockReset();

    getSessionMock.mockResolvedValue({ data: { session: null } });
    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock
        }
      }
    });
    getSupabaseClientMock.mockImplementation(() => ({
      auth: {
        signUp: signUpMock,
        signInWithPassword: signInMock,
        signOut: signOutMock,
        getSession: getSessionMock,
        onAuthStateChange: onAuthStateChangeMock
      }
    }));
  });

  it("signs up with email and password", async () => {
    const user = userEvent.setup();
    signUpMock.mockResolvedValue({
      error: null,
      data: {
        session: null
      }
    });

    render(<AuthPanel />);

    await user.type(screen.getByLabelText("Sahkoposti"), "new@example.com");
    await user.type(screen.getByLabelText("Salasana"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Luo tili" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "supersecret"
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Tili luotu. Tarkista sahkopostivahvistus, jos projekti vaatii sen."
    );
  });

  it("signs in and out with an existing account", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({
      error: null,
      data: {
        session: {
          user: {
            email: "aino@example.com"
          }
        }
      }
    });
    signOutMock.mockResolvedValue({ error: null });

    render(<AuthPanel />);

    await user.click(screen.getByRole("tab", { name: "Kirjaudu" }));
    await user.type(screen.getByLabelText("Sahkoposti"), "aino@example.com");
    await user.type(screen.getByLabelText("Salasana"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Kirjaudu sisaan" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "aino@example.com",
        password: "supersecret"
      });
    });

    expect(screen.getByText("aino@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Kirjaudu ulos" }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Kirjauduit ulos onnistuneesti.");
  });

  it("blocks short passwords before sending auth requests", async () => {
    const user = userEvent.setup();
    render(<AuthPanel />);

    await user.type(screen.getByLabelText("Sahkoposti"), "new@example.com");
    await user.type(screen.getByLabelText("Salasana"), "short");
    await user.click(screen.getByRole("button", { name: "Luo tili" }));

    expect(signUpMock).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Salasanan on oltava vahintaan 8 merkkia."
    );
  });

  it("shows a local preview message instead of crashing when Supabase env vars are missing", async () => {
    getSupabaseClientMock.mockImplementation(() => {
      throw new Error("missing public env");
    });

    render(<AuthPanel />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Supabase-ymparistomuuttujat puuttuvat"
    );
    expect(screen.getByRole("button", { name: "Luo tili" })).toBeDisabled();
  });
});
