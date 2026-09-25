"use client";

import React, { useState } from "react";
import { seedGameweeks } from "../../lib/game/seed-data";
import { buildWeekChanges } from "../../lib/game/week-changes";

export function WeekViewPanel() {
  const [from, setFrom] = useState("gw-1");
  const [to, setTo] = useState("gw-2");
  const changes = buildWeekChanges(from, to);

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Week View</p>
        <h1>Viikkonakyma: mita muuttui</h1>
        <p className="lead">
          Vertaa kahta gameweekia ja nosta esiin rankingmuutokset seka kovimmat nousijat.
        </p>

        <div className="filters-grid">
          <label>
            Edellinen viikko
            <select value={from} onChange={(event) => setFrom(event.target.value)}>
              {seedGameweeks.slice(0, 2).map((gameweek) => (
                <option key={`from-${gameweek.id}`} value={gameweek.slug}>
                  {gameweek.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nykyinen viikko
            <select value={to} onChange={(event) => setTo(event.target.value)}>
              {seedGameweeks.slice(1).map((gameweek) => (
                <option key={`to-${gameweek.id}`} value={gameweek.slug}>
                  {gameweek.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="panel">
        <p className="panel-caption">Sijoitusmuutokset</p>
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-head">
            <span>Team</span>
            <span>Prev</span>
            <span>Now</span>
            <span>Delta</span>
          </div>
          {changes.teamChanges.map((team) => (
            <div key={team.teamId} className="leaderboard-row">
              <strong>{team.teamName}</strong>
              <span>#{team.previousRank ?? "-"}</span>
              <span>#{team.currentRank}</span>
              <span>{team.rankDelta > 0 ? `+${team.rankDelta}` : team.rankDelta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <p className="panel-caption">Top movers</p>
        <div className="player-grid">
          {changes.playerMovers.slice(0, 4).map((player) => (
            <article key={player.playerId} className="player-card">
              <strong>{player.playerName}</strong>
              <span>{player.team}</span>
              <span>{player.currentScore} pts</span>
              <span>{player.scoreDelta > 0 ? `+${player.scoreDelta}` : player.scoreDelta} vs prev</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
