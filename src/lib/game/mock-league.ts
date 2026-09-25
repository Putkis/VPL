export type SeedFantasyTeam = {
  id: string;
  userId: string;
  name: string;
  playerIds: string[];
};

export type SeedPlayerStat = {
  playerId: string;
  gameweekId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  saves: number;
  yellowCards: number;
  redCards: number;
  bonusPoints: number;
};

export type SeedFriendLeague = {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  ownerUserId: string;
};

export type SeedFriendLeagueMember = {
  leagueId: string;
  userId: string;
  teamId: string;
};

export const seedFantasyTeams: SeedFantasyTeam[] = [
  {
    id: "40000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000001",
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
    id: "40000000-0000-4000-8000-000000000002",
    userId: "00000000-0000-4000-8000-000000000002",
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
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    userId: "00000000-0000-4000-8000-000000000003",
    name: "Riski XI",
    playerIds: [
      "20000000-0000-4000-8000-000000000001",
      "20000000-0000-4000-8000-000000000002",
      "20000000-0000-4000-8000-000000000003",
      "20000000-0000-4000-8000-000000000004",
      "20000000-0000-4000-8000-000000000006",
      "20000000-0000-4000-8000-000000000007",
      "20000000-0000-4000-8000-000000000008"
    ]
  }
];

export const seedFriendLeagues: SeedFriendLeague[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    name: "South Stand",
    slug: "south-stand",
    inviteCode: "SOUTH26",
    ownerUserId: "00000000-0000-4000-8000-000000000001"
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    name: "Data Nerds",
    slug: "data-nerds",
    inviteCode: "DATA26",
    ownerUserId: "00000000-0000-4000-8000-000000000002"
  }
];

export const seedFriendLeagueMembers: SeedFriendLeagueMember[] = [
  {
    leagueId: "50000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000001",
    teamId: "40000000-0000-4000-8000-000000000001"
  },
  {
    leagueId: "50000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000002",
    teamId: "40000000-0000-4000-8000-000000000002"
  },
  {
    leagueId: "50000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000003",
    teamId: "40000000-0000-4000-8000-000000000003"
  },
  {
    leagueId: "50000000-0000-4000-8000-000000000002",
    userId: "00000000-0000-4000-8000-000000000002",
    teamId: "40000000-0000-4000-8000-000000000002"
  }
];

export const seedPlayerGameweekStats: SeedPlayerStat[] = [
  {
    playerId: "20000000-0000-4000-8000-000000000001",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    cleanSheet: true,
    saves: 5,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 2
  },
  {
    playerId: "20000000-0000-4000-8000-000000000002",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 90,
    goals: 1,
    assists: 0,
    cleanSheet: true,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 3
  },
  {
    playerId: "20000000-0000-4000-8000-000000000003",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 90,
    goals: 0,
    assists: 1,
    cleanSheet: false,
    saves: 0,
    yellowCards: 1,
    redCards: 0,
    bonusPoints: 1
  },
  {
    playerId: "20000000-0000-4000-8000-000000000004",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 76,
    goals: 1,
    assists: 1,
    cleanSheet: false,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 2
  },
  {
    playerId: "20000000-0000-4000-8000-000000000005",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 90,
    goals: 0,
    assists: 2,
    cleanSheet: true,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 2
  },
  {
    playerId: "20000000-0000-4000-8000-000000000006",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 88,
    goals: 2,
    assists: 0,
    cleanSheet: false,
    saves: 0,
    yellowCards: 1,
    redCards: 0,
    bonusPoints: 3
  },
  {
    playerId: "20000000-0000-4000-8000-000000000007",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 67,
    goals: 1,
    assists: 0,
    cleanSheet: false,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 1
  },
  {
    playerId: "20000000-0000-4000-8000-000000000008",
    gameweekId: "30000000-0000-4000-8000-000000000001",
    minutesPlayed: 58,
    goals: 0,
    assists: 1,
    cleanSheet: false,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    bonusPoints: 0
  },
  {
    playerId: "20000000-0000-4000-8000-000000000001",
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
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
    gameweekId: "30000000-0000-4000-8000-000000000002",
    minutesPlayed: 72,
    goals: 0,
    assists: 1,
    cleanSheet: false,
    saves: 0,
    yellowCards: 1,
    redCards: 0,
    bonusPoints: 0
  }
];
