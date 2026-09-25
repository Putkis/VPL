"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { onboardingPresets, onboardingSteps, OnboardingStepId } from "../../lib/game/onboarding";
import { getSupabaseClient } from "../../lib/supabase/client";

type SaveResponse = {
  ok: boolean;
  message?: string;
};

const gameweekSlug = "gw-3";

export function OnboardingFlow() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<OnboardingStepId>("identity");
  const [selectedPresetId, setSelectedPresetId] = useState(onboardingPresets[0]?.id ?? "balanced");
  const [teamName, setTeamName] = useState(onboardingPresets[0]?.teamName ?? "Nopea nousu");
  const [status, setStatus] = useState(
    "Kirjaudu sisään, niin tallennettu joukkue liitetään omaan tiliisi."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let supabase: ReturnType<typeof getSupabaseClient>;

    try {
      supabase = getSupabaseClient();
    } catch {
      setAuthAvailable(false);
      setAuthLoading(false);
      setStatus("Kirjautuminen ei ole saatavilla. Tarkista Supabase-ympäristöasetukset.");
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setAccessToken(session?.access_token ?? null);
      setViewerEmail(session?.user.email ?? null);
      setAuthLoadError(null);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setAuthLoadError("Kirjautumistietojen lataus epäonnistui. Yritä ladata sivu uudelleen.");
      } else {
        setAuthLoadError(null);
      }
      setAccessToken(data.session?.access_token ?? null);
      setViewerEmail(data.session?.user.email ?? null);
      setAuthLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setAuthLoadError("Kirjautumistietojen lataus epäonnistui. Yritä ladata sivu uudelleen.");
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const activeStepIndex = onboardingSteps.findIndex((step) => step.id === activeStep);
  const selectedPreset =
    onboardingPresets.find((preset) => preset.id === selectedPresetId) ?? onboardingPresets[0];
  const canAdvanceFromIdentity = !authLoading && Boolean(accessToken && viewerEmail);
  const progressValue = ((activeStepIndex + 1) / onboardingSteps.length) * 100;
  const progressLabel = `${activeStepIndex + 1} / ${onboardingSteps.length}`;
  const starterPlayerNames = useMemo(
    () => selectedPreset?.players.map((player) => player.name).join(", ") ?? "",
    [selectedPreset]
  );

  useEffect(() => {
    if (selectedPreset) {
      setTeamName(selectedPreset.teamName);
    }
  }, [selectedPreset]);

  function goToNextStep() {
    if (activeStep === "identity") {
      setActiveStep("starter");
      setStatus("Valitse valmis aloituskokoonpano. Voit hienosaattaa sita myohemmin team builderissa.");
      return;
    }

    if (activeStep === "starter") {
      setActiveStep("review");
      setStatus("Tarkista nimi ja tallenna joukkue. Taman jalkeen voit siirtya suoraan team builderiin.");
    }
  }

  function goToPreviousStep() {
    if (activeStep === "review") {
      setActiveStep("starter");
      return;
    }

    if (activeStep === "starter") {
      setActiveStep("identity");
    }
  }

  async function saveStarterTeam() {
    if (!selectedPreset || !accessToken) {
      setStatus("Kirjaudu sisään ennen aloitusjoukkueen tallentamista.");
      return;
    }

    setIsSaving(true);
    setStatus("Tallennetaan aloitusjoukkuetta...");

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          teamName,
          playerIds: selectedPreset.playerIds,
          gameweekSlug
        })
      });

      const payload = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !payload?.ok) {
        setIsSaved(false);
        setStatus(payload?.message ?? "Tallennus epäonnistui. Voit yrittää uudelleen.");
        return;
      }

      setIsSaved(true);
      setStatus("Aloitusjoukkue tallennettu. Voit jatkaa suoraan team builderiin tai leaderboardiin.");
    } catch {
      setIsSaved(false);
      setStatus("Tallennus epäonnistui verkkovirheen vuoksi. Voit yrittää uudelleen.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="app-shell">
      <div className="panel onboarding-hero">
        <p className="eyebrow">Onboarding</p>
        <div className="onboarding-header">
          <div>
            <h1>Luo ensimmainen joukkue alle viidessa minuutissa</h1>
            <p className="lead">
              Valitse valmis runko ja tallenna se omalle tilillesi. Hienosaato tapahtuu vasta
              ensimmaisen joukkueen jalkeen.
            </p>
          </div>
          <div className="progress-card" aria-label="Onboarding progress">
            <strong>{progressLabel}</strong>
            <span>{onboardingSteps[activeStepIndex]?.label}</span>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progressValue}%` }} />
            </div>
          </div>
        </div>

        <ol className="onboarding-steps">
          {onboardingSteps.map((step, index) => (
            <li
              key={step.id}
              className={
                index === activeStepIndex
                  ? "onboarding-step active"
                  : index < activeStepIndex
                  ? "onboarding-step completed"
                  : "onboarding-step"
              }
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
            </li>
          ))}
        </ol>
      </div>

      {activeStep === "identity" ? (
        <div className="panel">
          <p className="panel-caption">Vaihe 1 / Käyttäjä</p>
          {authLoading ? <p className="status status-submitting">Tarkistetaan kirjautumista…</p> : null}
          {authAvailable && viewerEmail ? (
            <p className="status status-success">Kirjautunut käyttäjä: <strong>{viewerEmail}</strong></p>
          ) : null}
          {!authLoading && !viewerEmail ? (
            <div>
              <p className="status status-error">
                {authLoadError ??
                  (authAvailable ? "Kirjaudu sisään ennen joukkueen tallentamista." : status)}
              </p>
              {authAvailable && !authLoadError ? (
                <Link href="/auth" className="topbar-link">Kirjaudu sisään</Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeStep === "starter" ? (
        <div className="panel">
          <p className="panel-caption">Vaihe 2 / Aloituskokoonpano</p>
          <div className="onboarding-presets">
            {onboardingPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={
                  preset.id === selectedPresetId ? "onboarding-preset active" : "onboarding-preset"
                }
                onClick={() => setSelectedPresetId(preset.id)}
              >
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
                <span>{(preset.totalPriceCents / 100).toFixed(1)}M kaytetty</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeStep === "review" && selectedPreset ? (
        <div className="panel">
          <p className="panel-caption">Vaihe 3 / Vahvista</p>
          <label>
            Joukkueen nimi
            <input className="builder-input" value={teamName} onChange={(event) => setTeamName(event.target.value)} />
          </label>
          <div className="builder-summary">
            <div>
              <strong>{viewerEmail}</strong>
              <span> kayttaja</span>
            </div>
            <div>
              <strong>{selectedPreset.name}</strong>
              <span> preset</span>
            </div>
            <div>
              <strong>{(selectedPreset.totalPriceCents / 100).toFixed(1)}M</strong>
              <span> budjetista</span>
            </div>
          </div>
          <p className="status status-idle">{starterPlayerNames}</p>
          {isSaved ? (
            <div className="builder-summary">
              <Link href="/team-builder" className="topbar-link">
                Jatka team builderiin
              </Link>
              <Link href="/leaderboard" className="topbar-link">
                Katso leaderboard
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="panel">
        <div className="builder-summary">
          <button
            type="button"
            className="auth-submit secondary-button"
            onClick={goToPreviousStep}
            disabled={activeStep === "identity" || isSaving}
          >
            Edellinen
          </button>

          {activeStep !== "review" ? (
            <button
              type="button"
              className="auth-submit"
              onClick={goToNextStep}
              disabled={activeStep === "identity" ? !canAdvanceFromIdentity : false}
            >
              Seuraava
            </button>
          ) : (
            <button type="button" className="auth-submit" onClick={saveStarterTeam} disabled={isSaving}>
              {isSaving ? "Tallennetaan..." : "Tallenna aloitusjoukkue"}
            </button>
          )}
        </div>
        <p className={isSaved ? "status status-success" : "status status-idle"}>{status}</p>
      </div>
    </section>
  );
}
