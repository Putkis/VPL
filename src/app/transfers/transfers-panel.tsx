"use client";

import React, { useState } from "react";
import { getPlayerCatalog } from "../../lib/game/catalog";
import { seedGameweeks } from "../../lib/game/seed-data";
import { getDefaultManagedTeam, quoteTransfer } from "../../lib/game/transfers";

const catalog = getPlayerCatalog();
const team = getDefaultManagedTeam();
const selectedSquad = catalog.filter((player) => team.playerIds.includes(player.id));

export function TransfersPanel() {
  const [gameweekSlug, setGameweekSlug] = useState("gw-3");
  const [playerOutId, setPlayerOutId] = useState(
    selectedSquad.find((player) => player.name === "Oskar Niemi")?.id ?? selectedSquad[0]?.id ?? ""
  );
  const [playerInId, setPlayerInId] = useState(
    catalog.find((player) => !team.playerIds.includes(player.id))?.id ?? ""
  );
  const [plannedTransferCount, setPlannedTransferCount] = useState("1");

  const quote = quoteTransfer({
    gameweekSlug,
    playerOutId,
    playerInId,
    plannedTransferCount: Number(plannedTransferCount)
  });

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Transfers</p>
        <h1>Siirrot + miinuspisteet</h1>
        <p className="lead">
          Ensimmainen siirto on ilmainen. Lisasiirrot veloitetaan automaattisesti -4
          pistetta per siirto.
        </p>

        <div className="filters-grid">
          <label>
            Gameweek
            <select value={gameweekSlug} onChange={(event) => setGameweekSlug(event.target.value)}>
              {seedGameweeks.map((gameweek) => (
                <option key={gameweek.id} value={gameweek.slug}>
                  {gameweek.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Pelaaja ulos
            <select value={playerOutId} onChange={(event) => setPlayerOutId(event.target.value)}>
              {selectedSquad.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Pelaaja sisaan
            <select value={playerInId} onChange={(event) => setPlayerInId(event.target.value)}>
              {catalog
                .filter((player) => !team.playerIds.includes(player.id))
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Siirtojen maara talla viikolla
            <input
              type="number"
              min="1"
              max="5"
              value={plannedTransferCount}
              onChange={(event) => setPlannedTransferCount(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="panel">
        {quote.ok ? (
          <>
            <p className="status status-success">
              Siirto onnistuu. Miinuspisteet: {quote.penaltyPoints}
            </p>
            <div className="player-grid">
              {quote.players.map((player) => (
                <article key={player.id} className="player-card">
                  <strong>{player.name}</strong>
                  <span>{player.position}</span>
                  <span>{(player.priceCents / 100).toFixed(1)}M</span>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="status status-error">{quote.message}</p>
        )}
      </div>
    </section>
  );
}
