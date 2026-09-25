"use client";

import React, { useState } from "react";
import {
  CatalogPlayer,
  filterAndSortPlayers,
  getPlayerCatalogMeta,
  PlayerSortKey
} from "../../lib/game/catalog";

type PlayersBoardProps = {
  players: CatalogPlayer[];
};

export function PlayersBoard({ players }: PlayersBoardProps) {
  const meta = getPlayerCatalogMeta(players);
  const [query, setQuery] = useState("");
  const [club, setClub] = useState("all");
  const [position, setPosition] = useState("all");
  const [maxPriceCents, setMaxPriceCents] = useState("12000");
  const [sort, setSort] = useState<PlayerSortKey>("points-desc");

  const visiblePlayers = filterAndSortPlayers(players, {
    query,
    club,
    position,
    maxPriceCents: Number(maxPriceCents),
    sort
  });

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Players</p>
        <h1>Pelaajalista ja hinnat</h1>
        <p className="lead">
          Suodata roolin, hinnan ja seuran mukaan. Oletuslajittelu nostaa eniten pisteita
          tuottaneet pelaajat ensin.
        </p>

        <div className="filters-grid">
          <label>
            Haku
            <input
              aria-label="Haku"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Etsi pelaajaa tai seuraa"
            />
          </label>

          <label>
            Seura
            <select aria-label="Seura" value={club} onChange={(event) => setClub(event.target.value)}>
              <option value="all">Kaikki</option>
              {meta.clubs.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rooli
            <select
              aria-label="Rooli"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              <option value="all">Kaikki</option>
              {meta.positions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Maksimihinta
            <input
              aria-label="Maksimihinta"
              type="number"
              min="5000"
              step="100"
              value={maxPriceCents}
              onChange={(event) => setMaxPriceCents(event.target.value)}
            />
          </label>

          <label>
            Lajittelu
            <select
              aria-label="Lajittelu"
              value={sort}
              onChange={(event) => setSort(event.target.value as PlayerSortKey)}
            >
              <option value="points-desc">Pisteet, eniten ensin</option>
              <option value="price-asc">Hinta, halvin ensin</option>
              <option value="price-desc">Hinta, kallein ensin</option>
            </select>
          </label>
        </div>
      </div>

      <div className="panel">
        <p className="panel-caption">
          Loydetty {visiblePlayers.length} / {players.length} pelaajaa
        </p>
        <div className="player-grid">
          {visiblePlayers.length === 0 ? (
            <p>Valituilla suodattimilla ei loydy pelaajia.</p>
          ) : (
            visiblePlayers.map((player) => (
              <article key={player.id} className="player-card">
                <div className="player-card-header">
                  <strong>{player.name}</strong>
                  <span>{player.club}</span>
                </div>
                <dl className="player-stats">
                  <div>
                    <dt>Rooli</dt>
                    <dd>{player.position}</dd>
                  </div>
                  <div>
                    <dt>Hinta</dt>
                    <dd>{(player.priceCents / 100).toFixed(1)}M</dd>
                  </div>
                  <div>
                    <dt>Pisteet</dt>
                    <dd>{player.totalPoints}</dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
