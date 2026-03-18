import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const playerPositions = ["goalkeeper", "defender", "midfielder", "forward"] as const;
export const gameweekStatuses = ["upcoming", "live", "closed"] as const;
export const leagueVisibilities = ["private", "public"] as const;

export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  favoriteClub: text("favorite_club"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  budgetCents: integer("budget_cents").notNull().default(100000),
  bankCents: integer("bank_cents").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIndex: index("teams_user_idx").on(table.userId),
  uniqueUserTeamName: uniqueIndex("teams_user_name_idx").on(table.userId, table.name)
}));

export const waitlistSignups = pgTable("waitlist_signups", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  topFeatureInterest: text("top_feature_interest").notNull().default("other"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  club: text("club").notNull(),
  position: text("position", { enum: playerPositions }).notNull(),
  priceCents: integer("price_cents").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  clubIndex: index("players_club_idx").on(table.club),
  positionIndex: index("players_position_idx").on(table.position),
  priceIndex: index("players_price_idx").on(table.priceCents)
}));

export const gameweeks = pgTable("gameweeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  roundNumber: integer("round_number").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  locksAt: timestamp("locks_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: text("status", { enum: gameweekStatuses }).notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  roundIndex: uniqueIndex("gameweeks_round_idx").on(table.roundNumber),
  statusIndex: index("gameweeks_status_idx").on(table.status)
}));

export const teamSelections = pgTable("team_selections", {
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  positionSlot: integer("position_slot").notNull(),
  isStarter: boolean("is_starter").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.teamId, table.playerId] }),
  uniqueTeamSlot: uniqueIndex("team_selections_team_slot_idx").on(
    table.teamId,
    table.positionSlot
  )
}));

export const playerGameweekStats = pgTable("player_gameweek_stats", {
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  gameweekId: uuid("gameweek_id")
    .notNull()
    .references(() => gameweeks.id, { onDelete: "cascade" }),
  minutesPlayed: integer("minutes_played").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  cleanSheet: boolean("clean_sheet").notNull().default(false),
  saves: integer("saves").notNull().default(0),
  yellowCards: integer("yellow_cards").notNull().default(0),
  redCards: integer("red_cards").notNull().default(0),
  bonusPoints: integer("bonus_points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.playerId, table.gameweekId] })
}));

export const teamGameweekScores = pgTable("team_gameweek_scores", {
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  gameweekId: uuid("gameweek_id")
    .notNull()
    .references(() => gameweeks.id, { onDelete: "cascade" }),
  points: integer("points").notNull().default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.teamId, table.gameweekId] }),
  rankIndex: index("team_gameweek_scores_rank_idx").on(table.gameweekId, table.rank)
}));

export const friendLeagues = pgTable("friend_leagues", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  visibility: text("visibility", { enum: leagueVisibilities }).notNull().default("private"),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  ownerIndex: index("friend_leagues_owner_idx").on(table.ownerUserId)
}));

export const friendLeagueMembers = pgTable("friend_league_members", {
  leagueId: uuid("league_id")
    .notNull()
    .references(() => friendLeagues.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.leagueId, table.userId] })
}));

export const transferWindows = pgTable("transfer_windows", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameweekId: uuid("gameweek_id")
    .notNull()
    .references(() => gameweeks.id, { onDelete: "cascade" }),
  opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
  locksAt: timestamp("locks_at", { withTimezone: true }).notNull(),
  freeTransfers: integer("free_transfers").notNull().default(1),
  extraTransferPenalty: integer("extra_transfer_penalty").notNull().default(4)
}, (table) => ({
  gameweekIndex: uniqueIndex("transfer_windows_gameweek_idx").on(table.gameweekId)
}));

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  gameweekId: uuid("gameweek_id")
    .notNull()
    .references(() => gameweeks.id, { onDelete: "cascade" }),
  playerOutId: uuid("player_out_id")
    .notNull()
    .references(() => players.id, { onDelete: "restrict" }),
  playerInId: uuid("player_in_id")
    .notNull()
    .references(() => players.id, { onDelete: "restrict" }),
  penaltyPoints: integer("penalty_points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  teamIndex: index("transfers_team_idx").on(table.teamId, table.gameweekId)
}));
