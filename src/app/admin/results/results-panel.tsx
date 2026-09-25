"use client";

import React, { useEffect, useState } from "react";
import { seedGameweeks } from "../../../lib/game/seed-data";
import { getSupabaseClient } from "../../../lib/supabase/client";

type AdminStatLine = {
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  saves: number;
  yellowCards: number;
  redCards: number;
  bonusPoints: number;
};

type ScoreRunPayload = {
  ok: boolean;
  scoreRun?: {
    gameweekSlug: string;
    ranAt: string;
    submittedBy: string;
  };
  teamScores?: Array<{ teamName: string; gameweekPoints: number; rank: number }>;
  message?: string;
};

function getSeededJsonExample(gameweekSlug: string) {
  const defaultsByGameweek: Record<string, AdminStatLine[]> = {
    "gw-2": [
      {
        playerId: "20000000-0000-4000-8000-000000000001",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        saves: 6,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 1
      },
      {
        playerId: "20000000-0000-4000-8000-000000000002",
        minutesPlayed: 90,
        goals: 0,
        assists: 1,
        cleanSheet: false,
        saves: 0,
        yellowCards: 1,
        redCards: 0,
        bonusPoints: 0
      }
    ],
    "gw-3": [
      {
        playerId: "20000000-0000-4000-8000-000000000001",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        saves: 4,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 2
      },
      {
        playerId: "20000000-0000-4000-8000-000000000004",
        minutesPlayed: 85,
        goals: 1,
        assists: 1,
        cleanSheet: false,
        saves: 0,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 3
      }
    ]
  };

  return JSON.stringify(defaultsByGameweek[gameweekSlug] ?? defaultsByGameweek["gw-2"], null, 2);
}

export function AdminResultsPanel() {
  const [viewerEmail, setViewerEmail] = useState("");
  const [gameweekSlug, setGameweekSlug] = useState("gw-2");
  const [statsJson, setStatsJson] = useState(getSeededJsonExample("gw-2"));
  const [status, setStatus] = useState("Lataa JSON-esimerkki, muokkaa tarvittaessa ja tallenna.");
  const [scoreSummary, setScoreSummary] = useState<ScoreRunPayload | null>(null);

  useEffect(() => {
    try {
      void getSupabaseClient().auth.getSession().then(({ data }) => {
        setViewerEmail(data.session?.user.email ?? "");
      }).catch(() => setStatus("Kirjaudu sisään admin-tilillä."));
    } catch {
      setStatus("Kirjaudu sisään admin-tilillä.");
    }
  }, []);

  useEffect(() => {
    setStatsJson(getSeededJsonExample(gameweekSlug));
  }, [gameweekSlug]);

  async function saveResults() {
    let stats: AdminStatLine[];
    try {
      stats = JSON.parse(statsJson) as AdminStatLine[];
    } catch {
      setStatus("JSON ei ole kelvollinen.");
      return;
    }

    try {
      const session = (await getSupabaseClient().auth.getSession()).data.session;
      if (!session) {
        setStatus("Kirjaudu sisään admin-tilillä.");
        return;
      }
      const response = await fetch("/api/admin/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          gameweekSlug,
          stats
        })
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        savedStatCount?: number;
      };

      if (!response.ok) {
        setStatus(payload.message ?? "Tulosten tallennus epaonnistui.");
        return;
      }

      setStatus(`Tulokset tallennettu. Riveja ${payload.savedStatCount ?? 0}.`);
    } catch {
      setStatus("Tulosten tallennus epäonnistui. Tarkista kirjautuminen ja yhteys.");
    }
  }

  async function runScoring() {
    let response: Response;
    try {
      const session = (await getSupabaseClient().auth.getSession()).data.session;
      if (!session) throw new Error("Kirjaudu sisään admin-tilillä.");
      response = await fetch("/api/admin/results/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ gameweekSlug })
      });
    } catch {
      setStatus("Kirjaudu sisään admin-tilillä tai tarkista yhteys.");
      setScoreSummary(null);
      return;
    }

    const payload = (await response.json()) as ScoreRunPayload;
    if (!response.ok) {
      setStatus(payload.message ?? "Pisteytyksen kaynnistys epaonnistui.");
      setScoreSummary(null);
      return;
    }

    setScoreSummary(payload);
    setStatus(`Pisteytys ajettu gameweekille ${gameweekSlug}.`);
  }

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Admin</p>
        <h1>Tulosten syotto + pisteytyksen ajo</h1>
        <p className="lead">
          Kirjautunut käyttäjä: {viewerEmail || "ei kirjautunut"}. Vain ADMIN_EMAILS-asetuksessa
          määritellyt adminit voivat tallentaa tuloksia ja käynnistää pisteytyksen.
        </p>

        <div className="filters-grid">
          <label>
            Gameweek
            <select value={gameweekSlug} onChange={(event) => setGameweekSlug(event.target.value)}>
              {seedGameweeks.slice(1).map((gameweek) => (
                <option key={gameweek.id} value={gameweek.slug}>
                  {gameweek.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Stat-rivit JSON
          <textarea
            className="admin-textarea"
            value={statsJson}
            onChange={(event) => setStatsJson(event.target.value)}
            rows={16}
          />
        </label>

        <div className="builder-summary">
          <button type="button" className="auth-submit" onClick={saveResults}>
            Tallenna tulokset
          </button>
          <button type="button" className="auth-submit secondary-button" onClick={runScoring}>
            Kaynnista pisteytys
          </button>
        </div>

        <p className="status status-idle" role="status">{status}</p>
      </div>

      {scoreSummary ? (
        <div className="panel">
          <p className="panel-caption">
            Score run {scoreSummary.scoreRun?.gameweekSlug} / {scoreSummary.scoreRun?.ranAt}
          </p>
          <div className="leaderboard-table">
            <div className="leaderboard-row leaderboard-head">
              <span>Rank</span>
              <span>Team</span>
              <span>GW points</span>
              <span>Run by</span>
            </div>
            {scoreSummary.teamScores?.map((team) => (
              <div key={team.teamName} className="leaderboard-row">
                <span>#{team.rank}</span>
                <strong>{team.teamName}</strong>
                <span>{team.gameweekPoints}</span>
                <span>{scoreSummary.scoreRun?.submittedBy}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
