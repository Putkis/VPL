"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { demoViewerKey, getViewerKey, setViewerEmail } from "../../lib/game/viewer-identity";
import { onboardingPresets, onboardingSteps, OnboardingStepId } from "../../lib/game/onboarding";

type SaveResponse = {
  ok: boolean;
  message?: string;
};

const gameweekSlug = "gw-3";

export function OnboardingFlow() {
  const [viewerKey, setViewerKey] = useState(demoViewerKey);
  const [activeStep, setActiveStep] = useState<OnboardingStepId>("identity");
  const [selectedPresetId, setSelectedPresetId] = useState(onboardingPresets[0]?.id ?? "balanced");
  const [teamName, setTeamName] = useState(onboardingPresets[0]?.teamName ?? "Nopea nousu");
  const [status, setStatus] = useState(
    "Valitse nopea aloitustapa. Demotili toimii ilman erillista kirjautumista."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setViewerKey(getViewerKey());
  }, []);

  const activeStepIndex = onboardingSteps.findIndex((step) => step.id === activeStep);
  const selectedPreset =
    onboardingPresets.find((preset) => preset.id === selectedPresetId) ?? onboardingPresets[0];
  const canAdvanceFromIdentity = viewerKey.trim().length >= 3;
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
      setViewerEmail(viewerKey);
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
    if (!selectedPreset) {
      return;
    }

    setIsSaving(true);
    setStatus("Tallennetaan aloitusjoukkuetta...");

    const response = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        viewerKey,
        teamName,
        playerIds: selectedPreset.playerIds,
        gameweekSlug
      })
    }).catch(() => null);

    if (!response) {
      setIsSaving(false);
      setIsSaved(false);
      setStatus("Tallennus epaonnistui verkko-ongelman vuoksi. Voit yrittää heti uudelleen.");
      return;
    }

    const payload = (await response.json()) as SaveResponse;
    if (!response.ok) {
      setIsSaving(false);
      setIsSaved(false);
      setStatus(payload.message ?? "Tallennus epaonnistui. Palaa tarvittaessa edelliseen vaiheeseen.");
      return;
    }

    setViewerEmail(viewerKey);
    setIsSaving(false);
    setIsSaved(true);
    setStatus("Aloitusjoukkue tallennettu. Voit jatkaa suoraan team builderiin tai leaderboardiin.");
  }

  return (
    <section className="app-shell">
      <div className="panel onboarding-hero">
        <p className="eyebrow">Onboarding</p>
        <div className="onboarding-header">
          <div>
            <h1>Luo ensimmainen joukkue alle viidessa minuutissa</h1>
            <p className="lead">
              Onboarding ohittaa turhat valinnat: kayta demokayttajaa, valitse valmis runko ja
              tallenna. Hienosaato tapahtuu vasta sen jalkeen.
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
          <p className="panel-caption">Vaihe 1 / Kayttaja</p>
          <div className="filters-grid">
            <label>
              Demo tai oma sahkoposti
              <input value={viewerKey} onChange={(event) => setViewerKey(event.target.value)} />
            </label>
          </div>
          <p className="status status-idle">
            Oletus: <strong>{demoViewerKey}</strong>. Kirjautuminen ei ole pakollinen onboardingin
            ensivaiheessa.
          </p>
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
              <strong>{viewerKey}</strong>
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
