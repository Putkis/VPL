"use client";

import React, { useEffect, useState } from "react";
import { CatalogPlayer } from "../../lib/game/catalog";
import { getViewerKey } from "../../lib/game/viewer-identity";
import { seedGameweeks } from "../../lib/game/seed-data";
import { TEAM_BUDGET_CENTS, TEAM_FORMATION_RULES, TEAM_SIZE, validateTeamSelection } from "../../lib/game/team-rules";
import { isGameweekLocked } from "../../lib/game/gameweeks";

type TeamBuilderProps = {
  players: CatalogPlayer[];
};

type PersistedTeamResponse = {
  ok: boolean;
  team: {
    name: string;
    playerIds: string[];
    gameweekSlug: string;
    viewerKey: string;
    revision: number;
    updatedAt: string;
  } | null;
};

type SaveTeamResponse = {
  ok: boolean;
  message?: string;
  validation?: { message: string };
  team?: {
    name: string;
    playerIds: string[];
    gameweekSlug: string;
    revision: number;
    updatedAt: string;
  };
};

export function TeamBuilder({ players }: TeamBuilderProps) {
  const defaultTeamName = "Viikon nousijat";
  const [teamName, setTeamName] = useState(defaultTeamName);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gameweekSlug, setGameweekSlug] = useState("gw-3");
  const [viewerKey, setViewerKey] = useState("demo@local.vpl");
  const [loadStatus, setLoadStatus] = useState("Ladataan mahdollinen tallennettu joukkue...");
  const [isLoadingSavedTeam, setIsLoadingSavedTeam] = useState(true);
  const [isPersisted, setIsPersisted] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{
    teamName: string;
    playerIds: string[];
    gameweekSlug: string;
    revision: number;
    updatedAt: string;
  } | null>(null);
  const [status, setStatus] = useState("Valitse kokoonpano ja tallenna backend-validaatiolla.");

  useEffect(() => {
    setViewerKey(getViewerKey());
  }, []);

  const selectedPlayers = players.filter((player) => selectedIds.includes(player.id));
  const validation = validateTeamSelection(selectedPlayers);
  const locked = isGameweekLocked(gameweekSlug);
  const canSave = validation.ok && !locked && !isLoadingSavedTeam;

  function resetDraftTeam(nextStatus: string, nextLoadStatus: string) {
    setTeamName(defaultTeamName);
    setSelectedIds([]);
    setIsPersisted(false);
    setLastSavedSnapshot(null);
    setStatus(nextStatus);
    setLoadStatus(nextLoadStatus);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSavedTeam() {
      setIsLoadingSavedTeam(true);

      try {
        const response = await fetch(
          `/api/team?viewerKey=${encodeURIComponent(viewerKey)}&gameweek=${encodeURIComponent(gameweekSlug)}`
        );
        const payload = (await response.json()) as PersistedTeamResponse;

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          resetDraftTeam(
            "Valitse kokoonpano ja tallenna backend-validaatiolla.",
            "Tallennetun joukkueen lataus epaonnistui."
          );
          return;
        }

        if (!payload.team) {
          resetDraftTeam(
            "Valitse kokoonpano ja tallenna backend-validaatiolla.",
            "Tallettua joukkuetta ei loytynyt valitulle gameweekille."
          );
          return;
        }

        setTeamName(payload.team.name);
        setSelectedIds(payload.team.playerIds);
        setIsPersisted(true);
        setLastSavedSnapshot({
          teamName: payload.team.name,
          playerIds: payload.team.playerIds,
          gameweekSlug: payload.team.gameweekSlug,
          revision: payload.team.revision,
          updatedAt: payload.team.updatedAt
        });
        setLoadStatus(
          `Tallennettu joukkue ladattu. Versio ${payload.team.revision} / ${payload.team.updatedAt.slice(0, 10)}.`
        );
      } catch {
        if (isMounted) {
          resetDraftTeam(
            "Valitse kokoonpano ja tallenna backend-validaatiolla.",
            "Tallennetun joukkueen lataus epaonnistui."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSavedTeam(false);
        }
      }
    }

    void loadSavedTeam();

    return () => {
      isMounted = false;
    };
  }, [gameweekSlug, viewerKey]);

  async function saveTeam() {
    const previousSnapshot = lastSavedSnapshot;
    setStatus(
      isPersisted
        ? "Paivitetaan joukkuetta optimistic UI:lla. Virhetilassa palautetaan viimeisin tallennettu versio."
        : "Tallennetaan joukkuetta optimistic UI:lla."
    );

    try {
      const response = await fetch("/api/team", {
        method: isPersisted ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          viewerKey,
          teamName,
          playerIds: selectedIds,
          gameweekSlug
        })
      });

      const payload = (await response.json()) as SaveTeamResponse;
      if (!response.ok || !payload.team) {
        if (previousSnapshot) {
          setTeamName(previousSnapshot.teamName);
          setSelectedIds(previousSnapshot.playerIds);
          setGameweekSlug(previousSnapshot.gameweekSlug);
          setStatus(
            payload.message ??
              payload.validation?.message ??
              "Tallennus epaonnistui. Edellinen versio palautettiin."
          );
          return;
        }

        setStatus(payload.message ?? payload.validation?.message ?? "Tallennus epaonnistui.");
        return;
      }

      setIsPersisted(true);
      setLastSavedSnapshot({
        teamName: payload.team.name,
        playerIds: payload.team.playerIds,
        gameweekSlug: payload.team.gameweekSlug,
        revision: payload.team.revision,
        updatedAt: payload.team.updatedAt
      });
      setLoadStatus(
        `Tallennettu joukkue ladattu. Versio ${payload.team.revision} / ${payload.team.updatedAt.slice(0, 10)}.`
      );
      setStatus("Joukkue tallennettu. Backend vahvisti budjetin, roolijaon ja persistenssin.");
    } catch {
      if (previousSnapshot) {
        setTeamName(previousSnapshot.teamName);
        setSelectedIds(previousSnapshot.playerIds);
        setGameweekSlug(previousSnapshot.gameweekSlug);
        setStatus("Tallennus epaonnistui. Edellinen versio palautettiin.");
        return;
      }

      setStatus("Tallennus epaonnistui.");
    }
  }

  function togglePlayer(playerId: string) {
    if (locked || isLoadingSavedTeam) {
      return;
    }

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

        <label>
          Gameweek
          <select
            className="builder-input"
            value={gameweekSlug}
            onChange={(event) => setGameweekSlug(event.target.value)}
          >
            {seedGameweeks.map((gameweek) => (
              <option key={gameweek.id} value={gameweek.slug}>
                {gameweek.name}
              </option>
            ))}
          </select>
        </label>

        <div className="builder-summary">
          <div>
            <strong>{viewerKey}</strong>
            <span> aktiivinen demo/kayttaja</span>
          </div>
          <div>
            <strong>{selectedPlayers.length}</strong>
            <span> / {TEAM_SIZE} valittu</span>
          </div>
          <div>
            <strong>{(validation.totalPriceCents / 100).toFixed(1)}M</strong>
            <span> kaytetty</span>
          </div>
        </div>

        <p className={isLoadingSavedTeam ? "status status-submitting" : "status status-idle"}>
          {loadStatus}
        </p>

        <ul className="rule-list">
          {Object.entries(TEAM_FORMATION_RULES).map(([position, rule]) => (
            <li key={position}>
              {position}: {validation.counts[position as keyof typeof validation.counts]}/
              {rule.min}-{rule.max}
            </li>
          ))}
        </ul>

        <p className={locked ? "status status-error" : "status status-success"}>
          {locked
            ? "Valittu gameweek on lukittu. API hylkaa tallennuksen deadline-ajan jalkeen."
            : "Valittu gameweek on avoin muokkauksille."}
        </p>
        <p className={validation.ok ? "status status-success" : "status status-error"} role="status">
          {validation.message}
        </p>
        <p className="status status-idle">{status}</p>
        <button
          type="button"
          className="auth-submit"
          onClick={saveTeam}
          disabled={!canSave}
        >
          {isPersisted ? "Paivita joukkue" : "Tallenna joukkue"}
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
                disabled={locked || isLoadingSavedTeam}
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
