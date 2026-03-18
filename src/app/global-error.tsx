"use client";

import React, { useEffect } from "react";
import { getRuntimeTags } from "../lib/observability";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global_error_boundary", {
      ...getRuntimeTags(),
      message: error.message,
      digest: error.digest ?? null
    });

    void fetch("/api/ops/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        source: "app.global-error",
        fatal: true
      })
    }).catch(() => null);
  }, [error]);

  return (
    <html lang="fi">
      <body>
        <main className="app-shell">
          <section className="panel">
            <p className="eyebrow">Virhe</p>
            <h1>Sovellus kohtasi kriittisen virheen</h1>
            <p className="status status-error">
              Virhe kirjattiin observability-putkeen. Yrita uudelleen tai tarkista staging-alertti.
            </p>
            <button type="button" className="auth-submit" onClick={() => reset()}>
              Yrita uudelleen
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
