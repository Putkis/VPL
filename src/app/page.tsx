"use client";

import React, { useState } from "react";
import { z } from "zod";

const highlights = [
  "Rakennetaan kilpailukykyinen Veikkausliiga-fantasy alusta asti kunnolla.",
  "Aikainen odotuslista saa ensimmaisena kutsun suljettuun betaan.",
  "Saat viikottaiset paivitykset kehityksesta ja julkaisuaikataulusta."
];

type FormStatus = "idle" | "submitting" | "success" | "error";

const emailSchema = z.string().email();

function getStatusMessage(status: FormStatus, errorMessage: string) {
  if (status === "success") {
    return "Kiitos! Olet nyt odotuslistalla.";
  }

  if (status === "error") {
    return errorMessage;
  }

  return "Ei roskapostia. Vain olennaiset paivitykset ja kutsut.";
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function submitWaitlist(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailSchema.safeParse(normalizedEmail).success) {
      setStatus("error");
      setErrorMessage("Anna kelvollinen sahkopostiosoite.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    void (async () => {
      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: normalizedEmail })
        });

        if (!response.ok) {
          setStatus("error");
          setErrorMessage(
            response.status === 400
              ? "Sahkopostiosoite ei kelpaa. Tarkista osoite ja yrita uudelleen."
              : "Tallennus ei onnistunut. Yrita hetken paasta uudelleen."
          );
          return;
        }

        setStatus("success");
        setEmail("");
      } catch {
        setStatus("error");
        setErrorMessage("Yhteys katkesi. Tarkista verkkoyhteys ja yrita uudelleen.");
      }
    })();
  }

  return (
    <main className="landing">
      <section className="hero">
        <p className="eyebrow">VPL / Veikkausliiga Fantasy</p>
        <h1>Liity odotuslistalle ennen julkista avautumista.</h1>
        <p className="lead">
          Ensimmaiset kayttajat paasevat mukaan suljettuun betaan ja vaikuttamaan
          tuotteen ydinominaisuuksiin.
        </p>
        <form className="waitlist-form" onSubmit={submitWaitlist} noValidate>
          <label htmlFor="waitlist-email">Sahkoposti</label>
          <div className="input-row">
            <input
              id="waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="sinun@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== "submitting") {
                  setStatus("idle");
                  setErrorMessage("");
                }
              }}
              aria-invalid={status === "error"}
              aria-describedby="waitlist-status"
              required
            />
            <button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Liitytaan..." : "Liity odotuslistalle"}
            </button>
          </div>
          <output
            id="waitlist-status"
            className={`status status-${status}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {getStatusMessage(status, errorMessage)}
          </output>
        </form>
      </section>

      <section className="highlights" aria-label="Miksi liittya nyt">
        <ul>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
