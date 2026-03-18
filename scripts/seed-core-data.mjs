import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const seedUsers = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    auth_user_id: "10000000-0000-4000-8000-000000000001",
    email: "aino@example.com",
    display_name: "Aino",
    favorite_club: "HJK"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    auth_user_id: "10000000-0000-4000-8000-000000000002",
    email: "mika@example.com",
    display_name: "Mika",
    favorite_club: "KuPS"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    auth_user_id: "10000000-0000-4000-8000-000000000003",
    email: "sara@example.com",
    display_name: "Sara",
    favorite_club: "Ilves"
  }
];

const seedPlayers = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    slug: "luke-hakala",
    first_name: "Luke",
    last_name: "Hakala",
    club: "HJK",
    position: "goalkeeper",
    price_cents: 6200,
    total_points: 42
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    slug: "juho-lehto",
    first_name: "Juho",
    last_name: "Lehto",
    club: "KuPS",
    position: "defender",
    price_cents: 6900,
    total_points: 47
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    slug: "matti-kallio",
    first_name: "Matti",
    last_name: "Kallio",
    club: "Ilves",
    position: "defender",
    price_cents: 5600,
    total_points: 38
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    slug: "oskar-niemi",
    first_name: "Oskar",
    last_name: "Niemi",
    club: "SJK",
    position: "midfielder",
    price_cents: 9500,
    total_points: 61
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    slug: "leo-laine",
    first_name: "Leo",
    last_name: "Laine",
    club: "Inter",
    position: "midfielder",
    price_cents: 8400,
    total_points: 51
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    slug: "eetu-koski",
    first_name: "Eetu",
    last_name: "Koski",
    club: "Haka",
    position: "forward",
    price_cents: 10100,
    total_points: 66
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    slug: "vilho-salo",
    first_name: "Vilho",
    last_name: "Salo",
    club: "VPS",
    position: "forward",
    price_cents: 8800,
    total_points: 48
  },
  {
    id: "20000000-0000-4000-8000-000000000008",
    slug: "samu-virtanen",
    first_name: "Samu",
    last_name: "Virtanen",
    club: "Gnistan",
    position: "midfielder",
    price_cents: 7200,
    total_points: 34
  }
];

const seedGameweeks = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    slug: "gw-1",
    name: "Gameweek 1",
    round_number: 1,
    starts_at: "2026-04-04T13:00:00.000Z",
    locks_at: "2026-04-04T12:55:00.000Z",
    ends_at: "2026-04-06T19:00:00.000Z",
    status: "closed"
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    slug: "gw-2",
    name: "Gameweek 2",
    round_number: 2,
    starts_at: "2026-04-11T13:00:00.000Z",
    locks_at: "2026-04-11T12:55:00.000Z",
    ends_at: "2026-04-13T19:00:00.000Z",
    status: "live"
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    slug: "gw-3",
    name: "Gameweek 3",
    round_number: 3,
    starts_at: "2026-04-18T13:00:00.000Z",
    locks_at: "2026-04-18T12:55:00.000Z",
    ends_at: "2026-04-20T19:00:00.000Z",
    status: "upcoming"
  }
];

const seedTransferWindows = seedGameweeks.map((gameweek) => ({
  id: gameweek.id.replace("30000000", "70000000"),
  gameweek_id: gameweek.id,
  opens_at: gameweek.ends_at,
  locks_at: gameweek.locks_at,
  free_transfers: 1,
  extra_transfer_penalty: 4
}));

async function upsert(table, rows, options) {
  const { error } = await supabase.from(table).upsert(rows, options);
  if (error) {
    throw error;
  }
}

await upsert("app_users", seedUsers, { onConflict: "email" });
await upsert("players", seedPlayers, { onConflict: "slug" });
await upsert("gameweeks", seedGameweeks, { onConflict: "slug" });
await upsert("transfer_windows", seedTransferWindows, { onConflict: "gameweek_id" });

console.log(
  `Seeded ${seedUsers.length} users, ${seedPlayers.length} players, and ${seedGameweeks.length} gameweeks.`
);
