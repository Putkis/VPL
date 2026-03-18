"use client";

import React, { useState } from "react";
import { CatalogPlayer } from "../../lib/game/catalog";
import { TEAM_BUDGET_CENTS, TEAM_FORMATION_RULES, TEAM_SIZE, validateTeamSelection } from "../../lib/game/team-rules";

type TeamBuilderProps = {
  players: CatalogPlayer[];
};

export function TeamBuilder({ players }: TeamBuilderProps) {
  const [teamName, setTeamName] = useState("Viikon nousijat");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState("Valitse kokoonpano ja tallenna backend-validaatiolla.");

  const selectedPlayers = players.filter((player) => selectedIds.includes(player.id));
  const validation = validateTeamSelection(selectedPlayers);

  async function saveTeam() {
    const response = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        teamName,
        playerIds: selectedIds
      })
    });

    const payload = (await response.json()) as { ok: boolean; message?: string; validation?: { message: string } };
    if (!response.ok) {
      setStatus(payload.message ?? payload.validation?.message ?? "Tallennus epaonnistui.");
      return;
    }

    setStatus("Joukkue tallennettu. Backend vahvisti budjetin ja roolijaon.");
  }

  function togglePlayer(playerId: string) {
    setSelectedIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : current.length < TEAM_SIZE
        ? [...current, playerId]
        : current
    );
  }

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Team Builder</p>
        <h1>Joukkueen luonti budjettisaannoilla</h1>
        <p className="lead">
          Saannot: {TEAM_SIZE} pelaajaa, budjetti {(TEAM_BUDGET_CENTS / 100).toFixed(1)}M,
          1 MV, 2-3 PUOL, 2-3 KESK, 1-2 HYOK.
        </p>

        <label>
          Joukkueen nimi
          <input
            className="builder-input"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
        </label>

        <div className="builder-summary">
          <div>
            <strong>{selectedPlayers.length}</strong>
            <span> / {TEAM_SIZE} valittu</span>
          </div>
          <div>
            <strong>{(validation.totalPriceCents / 100).toFixed(1)}M</strong>
            <span> kaytetty</span>
          </div>
        </div>

        <ul className="rule-list">
          {Object.entries(TEAM_FORMATION_RULES).map(([position, rule]) => (
            <li key={position}>
              {position}: {validation.counts[position as keyof typeof validation.counts]}/
              {rule.min}-{rule.max}
            </li>
          ))}
        </ul>

        <p className={validation.ok ? "status status-success" : "status status-error"} role="status">
          {validation.message}
        </p>
        <p className="status status-idle">{status}</p>
        <button type="button" className="auth-submit" onClick={saveTeam}>
          Tallenna joukkue
        </button>
      </div>

      <div className="panel">
        <div className="player-grid">
          {players.map((player) => {
            const isSelected = selectedIds.includes(player.id);

            return (
              <button
                key={player.id}
                type="button"
                className={isSelected ? "builder-card selected" : "builder-card"}
                onClick={() => togglePlayer(player.id)}
              >
                <strong>{player.name}</strong>
                <span>{player.club}</span>
                <span>{player.position}</span>
                <span>{(player.priceCents / 100).toFixed(1)}M</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
