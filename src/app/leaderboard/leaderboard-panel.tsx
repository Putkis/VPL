"use client";

import React, { useState } from "react";
import { getLeaderboard, getLeaderboardSummary, LeaderboardScope } from "../../lib/game/leaderboard";

export function LeaderboardPanel() {
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const summary = getLeaderboardSummary();
  const rows = getLeaderboard(scope);

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Leaderboard</p>
        <h1>Global + friends ranking</h1>
        <p className="lead">
          Rankit paivittyvat score-jobin jalkeen. Friends-nakyma rajaa samat pisteet pieneen
          vertailevaan ryhmaan.
        </p>

        <div className="builder-summary">
          <div>
            <strong>{summary.viewerTeamName}</strong>
            <span> oma joukkue</span>
          </div>
          <div>
            <strong>#{summary.viewerRank}</strong>
            <span> sijoitus</span>
          </div>
          <div>
            <strong>{summary.viewerPoints}</strong>
            <span> kokonaispisteet</span>
          </div>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Leaderboard scope">
          <button
            type="button"
            role="tab"
            className={scope === "global" ? "auth-tab active" : "auth-tab"}
            aria-selected={scope === "global"}
            onClick={() => setScope("global")}
          >
            Global
          </button>
          <button
            type="button"
            role="tab"
            className={scope === "friends" ? "auth-tab active" : "auth-tab"}
            aria-selected={scope === "friends"}
            onClick={() => setScope("friends")}
          >
            Friends
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-head">
            <span>Rank</span>
            <span>Team</span>
            <span>Total</span>
            <span>Latest GW</span>
          </div>
          {rows.map((row) => (
            <div key={row.teamId} className="leaderboard-row">
              <span>#{row.rank}</span>
              <strong>{row.teamName}</strong>
              <span>{row.totalPoints}</span>
              <span>{row.latestPoints}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
