import React from "react";
import { getFriendLeagues } from "../../lib/game/leagues";

export function LeaguesPanel() {
  const leagues = getFriendLeagues();

  return (
    <section className="app-shell">
      <div className="panel">
        <p className="eyebrow">Friend Leagues</p>
        <h1>Kaveriliigat</h1>
        <p className="lead">
          Liigat jarjestavat pienemman kilvan globaalin taulukon rinnalle. Kutsu tapahtuu
          yksinkertaisella invite codella MVP-vaiheessa.
        </p>
      </div>

      <div className="player-grid">
        {leagues.map((league) => (
          <article key={league.id} className="panel">
            <div className="player-card-header">
              <strong>{league.name}</strong>
              <span>{league.inviteCode}</span>
            </div>
            <ul className="rule-list">
              {league.members.map((member) => (
                <li key={`${league.id}-${member.teamName}`}>
                  {member.userName} / {member.teamName}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
