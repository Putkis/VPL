export type SeedUser = {
  id: string;
  authUserId: string;
  email: string;
  displayName: string;
  favoriteClub: string;
};

export type SeedPlayer = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  club: string;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  priceCents: number;
  totalPoints: number;
};

export type SeedGameweek = {
  id: string;
  slug: string;
  name: string;
  roundNumber: number;
  startsAt: string;
  locksAt: string;
  endsAt: string;
  status: "upcoming" | "live" | "closed";
};

export const seedUsers: SeedUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    authUserId: "10000000-0000-4000-8000-000000000001",
    email: "aino@example.com",
    displayName: "Aino",
    favoriteClub: "HJK"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    authUserId: "10000000-0000-4000-8000-000000000002",
    email: "mika@example.com",
    displayName: "Mika",
    favoriteClub: "KuPS"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    authUserId: "10000000-0000-4000-8000-000000000003",
    email: "sara@example.com",
    displayName: "Sara",
    favoriteClub: "Ilves"
  }
];

export const seedPlayers: SeedPlayer[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    slug: "luke-hakala",
    firstName: "Luke",
    lastName: "Hakala",
    club: "HJK",
    position: "goalkeeper",
    priceCents: 6200,
    totalPoints: 42
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    slug: "juho-lehto",
    firstName: "Juho",
    lastName: "Lehto",
    club: "KuPS",
    position: "defender",
    priceCents: 6900,
    totalPoints: 47
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    slug: "matti-kallio",
    firstName: "Matti",
    lastName: "Kallio",
    club: "Ilves",
    position: "defender",
    priceCents: 5600,
    totalPoints: 38
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    slug: "oskar-niemi",
    firstName: "Oskar",
    lastName: "Niemi",
    club: "SJK",
    position: "midfielder",
    priceCents: 9500,
    totalPoints: 61
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    slug: "leo-laine",
    firstName: "Leo",
    lastName: "Laine",
    club: "Inter",
    position: "midfielder",
    priceCents: 8400,
    totalPoints: 51
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    slug: "eetu-koski",
    firstName: "Eetu",
    lastName: "Koski",
    club: "Haka",
    position: "forward",
    priceCents: 10100,
    totalPoints: 66
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    slug: "vilho-salo",
    firstName: "Vilho",
    lastName: "Salo",
    club: "VPS",
    position: "forward",
    priceCents: 8800,
    totalPoints: 48
  },
  {
    id: "20000000-0000-4000-8000-000000000008",
    slug: "samu-virtanen",
    firstName: "Samu",
    lastName: "Virtanen",
    club: "Gnistan",
    position: "midfielder",
    priceCents: 7200,
    totalPoints: 34
  }
];

export const seedGameweeks: SeedGameweek[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    slug: "gw-1",
    name: "Gameweek 1",
    roundNumber: 1,
    startsAt: "2026-04-04T13:00:00.000Z",
    locksAt: "2026-04-04T12:55:00.000Z",
    endsAt: "2026-04-06T19:00:00.000Z",
    status: "closed"
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    slug: "gw-2",
    name: "Gameweek 2",
    roundNumber: 2,
    startsAt: "2026-04-11T13:00:00.000Z",
    locksAt: "2026-04-11T12:55:00.000Z",
    endsAt: "2026-04-13T19:00:00.000Z",
    status: "live"
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    slug: "gw-3",
    name: "Gameweek 3",
    roundNumber: 3,
    startsAt: "2026-04-18T13:00:00.000Z",
    locksAt: "2026-04-18T12:55:00.000Z",
    endsAt: "2026-04-20T19:00:00.000Z",
    status: "upcoming"
  }
];
