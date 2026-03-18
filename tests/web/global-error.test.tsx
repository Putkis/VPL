import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GlobalError from "../../src/app/global-error";

const fetchMock = vi.fn();

describe("GlobalError", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env.NEXT_PUBLIC_APP_RELEASE = "sha-ui";
  });

  it("reports the client error and allows retry", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();

    render(
      <GlobalError
        error={Object.assign(new Error("render exploded"), { digest: "digest-1" })}
        reset={reset}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/ops/errors",
        expect.objectContaining({
          method: "POST"
        })
      );
    });
    expect(screen.getByText("Sovellus kohtasi kriittisen virheen")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yrita uudelleen" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("swallows reporting failures without crashing the fallback UI", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    render(<GlobalError error={new Error("boom")} reset={() => undefined} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText(/Virhe kirjattiin observability-putkeen/i)).toBeInTheDocument();
  });
});
