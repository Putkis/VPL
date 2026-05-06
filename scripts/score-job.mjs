import process from "node:process";

const runAt = new Date().toISOString();
const gameweek = process.env.GAMEWEEK ?? "gw-2";

const players = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Luke Hakala",
    position: "goalkeeper"
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Juho Lehto",
    position: "defender"
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Matti Kallio",
    position: "defender"
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Oskar Niemi",
    position: "midfielder"
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Leo Laine",
    position: "midfielder"
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    name: "Eetu Koski",
    position: "forward"
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    name: "Vilho Salo",
    position: "forward"
  },
  {
    id: "20000000-0000-4000-8000-000000000008",
    name: "Samu Virtanen",
    position: "midfielder"
  }
];

const teamSelections = [
  {
    name: "Viherio CF",
    playerIds: [
      "20000000-0000-4000-8000-000000000001",
      "20000000-0000-4000-8000-000000000002",
      "20000000-0000-4000-8000-000000000003",
      "20000000-0000-4000-8000-000000000004",
      "20000000-0000-4000-8000-000000000005",
      "20000000-0000-4000-8000-000000000006",
      "20000000-0000-4000-8000-000000000008"
    ]
  },
  {
    name: "Pressing United",
    playerIds: [
      "20000000-0000-4000-8000-000000000001",
      "20000000-0000-4000-8000-000000000002",
      "20000000-0000-4000-8000-000000000003",
      "20000000-0000-4000-8000-000000000004",
      "20000000-0000-4000-8000-000000000005",
      "20000000-0000-4000-8000-000000000007",
      "20000000-0000-4000-8000-000000000008"
    ]
  }
];

const statsByGameweek = {
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
    },
    {
      playerId: "20000000-0000-4000-8000-000000000003",
      minutesPlayed: 90,
      goals: 0,
      assists: 0,
      cleanSheet: true,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      bonusPoints: 2
    },
    {
      playerId: "20000000-0000-4000-8000-000000000004",
      minutesPlayed: 90,
      goals: 0,
      assists: 2,
      cleanSheet: false,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      bonusPoints: 3
    },
    {
      playerId: "20000000-0000-4000-8000-000000000005",
      minutesPlayed: 82,
      goals: 1,
      assists: 0,
      cleanSheet: false,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      bonusPoints: 2
    },
    {
      playerId: "20000000-0000-4000-8000-000000000006",
      minutesPlayed: 61,
      goals: 1,
      assists: 0,
      cleanSheet: false,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      bonusPoints: 2
    },
    {
      playerId: "20000000-0000-4000-8000-000000000007",
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheet: false,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      bonusPoints: 0
    },
    {
      playerId: "20000000-0000-4000-8000-000000000008",
      minutesPlayed: 72,
      goals: 0,
      assists: 1,
      cleanSheet: false,
      saves: 0,
      yellowCards: 1,
      redCards: 0,
      bonusPoints: 0
    }
  ]
};

function calculatePlayerScore(position, stat) {
  const appearancePoints =
    stat.minutesPlayed >= 60 ? 2 : stat.minutesPlayed > 0 ? 1 : 0;
  const goalPoints =
    position === "goalkeeper" || position === "defender"
      ? stat.goals * 6
      : position === "midfielder"
      ? stat.goals * 5
      : stat.goals * 4;
  const cleanSheetPoints =
    stat.cleanSheet && (position === "goalkeeper" || position === "defender")
      ? 4
      : stat.cleanSheet && position === "midfielder"
      ? 1
      : 0;

  return (
    appearancePoints +
    goalPoints +
    stat.assists * 3 +
    cleanSheetPoints +
    Math.floor(stat.saves / 3) +
    stat.bonusPoints -
    stat.yellowCards -
    stat.redCards * 3
  );
}

const statLines = statsByGameweek[gameweek] ?? [];
const playerScores = statLines
  .map((stat) => {
    const player = players.find((candidate) => candidate.id === stat.playerId);
    return player
      ? {
          player: player.name,
          score: calculatePlayerScore(player.position, stat)
        }
      : null;
  })
  .filter(Boolean)
  .sort((left, right) => right.score - left.score);

const scoreMap = new Map(playerScores.map((entry) => [players.find((player) => player.name === entry.player)?.id, entry.score]));
const teamScores = teamSelections
  .map((team) => ({
    team: team.name,
    points: team.playerIds.reduce((sum, playerId) => sum + (scoreMap.get(playerId) ?? 0), 0)
  }))
  .sort((left, right) => right.points - left.points);

console.log(`[score-job] start: ${runAt}`);
console.log(`[score-job] gameweek: ${gameweek}`);
console.table(playerScores);
console.table(teamScores);
console.log("[score-job] done");
