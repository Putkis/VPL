"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { trackEvent } from "../lib/analytics";

const highlights = [
  "Rakennetaan kilpailukykyinen Veikkausliiga-fantasy alusta asti kunnolla.",
  "Aikainen odotuslista saa ensimmäisenä kutsun suljettuun betaan.",
  "Saat viikoittaiset päivitykset kehityksestä ja julkaisuaikataulusta."
];

const topFeatureInterestValues = [
  "live_scores",
  "player_stats",
  "friend_leagues",
  "transfer_tools",
  "other"
] as const;

const topFeatureInterestOptions: Array<{
  value: (typeof topFeatureInterestValues)[number];
  label: string;
}> = [
  { value: "live_scores", label: "Live-pisteet ottelupäivän aikana" },
  { value: "player_stats", label: "Syvemmät pelaajatilastot" },
  { value: "friend_leagues", label: "Kaveriliigat ja haastot" },
  { value: "transfer_tools", label: "Paremmat siirto- ja kokoonpanotyökalut" },
  { value: "other", label: "Jokin muu" }
];

type FormStatus = "idle" | "submitting" | "success" | "error";

const emailSchema = z.string().email();
const topFeatureInterestSchema = z.enum(topFeatureInterestValues);
type TopFeatureInterest = z.infer<typeof topFeatureInterestSchema>;

function getStatusMessage(status: FormStatus, errorMessage: string) {
  if (status === "success") {
    return "Kiitos! Olet nyt odotuslistalla.";
  }

  if (status === "error") {
    return errorMessage;
  }

  return "Ei roskapostia. Vain olennaiset päivitykset ja kutsut.";
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [topFeatureInterest, setTopFeatureInterest] = useState<TopFeatureInterest | "">("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    trackEvent("page_view");
  }, []);

  function submitWaitlist(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const parsedTopFeatureInterest = topFeatureInterestSchema.safeParse(topFeatureInterest);

    if (!parsedTopFeatureInterest.success) {
      setStatus("error");
      setErrorMessage("Valitse sinua eniten kiinnostava toiminnallisuus.");
      trackEvent("signup_error", { reason: "invalid_feature_interest" });
      return;
    }

    const selectedFeatureInterest = parsedTopFeatureInterest.data;
    trackEvent("signup_submit", {
      top_feature_interest: selectedFeatureInterest
    });

    if (!emailSchema.safeParse(normalizedEmail).success) {
      setStatus("error");
      setErrorMessage("Anna kelvollinen sähköpostiosoite.");
      trackEvent("signup_error", { reason: "invalid_email" });
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
          body: JSON.stringify({
            email: normalizedEmail,
            topFeatureInterest: selectedFeatureInterest
          })
        });

        if (!response.ok) {
          let invalidCode = "invalid_email";
          if (response.status === 400) {
            try {
              const responsePayload = (await response.json()) as { code?: string };
              if (responsePayload.code === "invalid_feature_interest") {
                invalidCode = "invalid_feature_interest";
              }
            } catch {
              invalidCode = "invalid_email";
            }
          }

          const reason = response.status === 400 ? invalidCode : "server_error";
          setStatus("error");
          setErrorMessage(
            reason === "invalid_feature_interest"
              ? "Valitse sinua eniten kiinnostava toiminnallisuus."
              : response.status === 400
              ? "Sähköpostiosoite ei kelpaa. Tarkista osoite ja yritä uudelleen."
              : "Tallennus ei onnistunut. Yritä hetken päästä uudelleen."
          );
          trackEvent("signup_error", { reason });
          return;
        }

        setStatus("success");
        setEmail("");
        setTopFeatureInterest("");
        trackEvent("signup_success");
      } catch {
        setStatus("error");
        setErrorMessage("Yhteys katkesi. Tarkista verkkoyhteys ja yritä uudelleen.");
        trackEvent("signup_error", { reason: "network_error" });
      }
    })();
  }

  return (
    <main className="landing">
      <section className="hero">
        <p className="eyebrow">VPL / Veikkausliiga Fantasy</p>
        <h1>Liity odotuslistalle ennen julkista avautumista.</h1>
        <p className="lead">
          Ensimmäiset käyttäjät pääsevät mukaan suljettuun betaan ja vaikuttamaan
          tuotteen ydinominaisuuksiin.
        </p>
        <form className="waitlist-form" onSubmit={submitWaitlist} noValidate>
          <fieldset className="feature-question">
            <legend>Mikä toiminnallisuus kiinnostaa eniten?</legend>
            <div className="feature-options">
              {topFeatureInterestOptions.map((option) => (
                <label key={option.value} className="feature-option">
                  <input
                    type="radio"
                    name="top-feature-interest"
                    value={option.value}
                    checked={topFeatureInterest === option.value}
                    onChange={(event) => {
                      setTopFeatureInterest(event.target.value as TopFeatureInterest);
                      if (status !== "submitting") {
                        setStatus("idle");
                        setErrorMessage("");
                      }
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="waitlist-email">Sähköposti</label>
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
              {status === "submitting" ? "Liitytään..." : "Liity odotuslistalle"}
            </button>
          </div>
          <output
            id="waitlist-status"
            className={`status status-${status}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {getStatusMessage(status, errorMessage)}
          </output>
        </form>
      </section>

      <section className="highlights" aria-label="Miksi liittyä nyt">
        <ul>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
