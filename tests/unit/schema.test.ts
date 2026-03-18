// @vitest-environment node

import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  appUsers,
  friendLeagueMembers,
  friendLeagues,
  gameweeks,
  playerGameweekStats,
  players,
  teamGameweekScores,
  teams,
  teamSelections,
  transfers,
  transferWindows,
  waitlistSignups
} from "../../src/lib/db/schema";

describe("database schema", () => {
  it("defines expected table names", () => {
    expect(getTableName(appUsers)).toBe("app_users");
    expect(getTableName(players)).toBe("players");
    expect(getTableName(gameweeks)).toBe("gameweeks");
    expect(getTableName(teams)).toBe("teams");
    expect(getTableName(teamSelections)).toBe("team_selections");
    expect(getTableName(playerGameweekStats)).toBe("player_gameweek_stats");
    expect(getTableName(teamGameweekScores)).toBe("team_gameweek_scores");
    expect(getTableName(friendLeagues)).toBe("friend_leagues");
    expect(getTableName(friendLeagueMembers)).toBe("friend_league_members");
    expect(getTableName(transferWindows)).toBe("transfer_windows");
    expect(getTableName(transfers)).toBe("transfers");
    expect(getTableName(waitlistSignups)).toBe("waitlist_signups");
  });

  it("exposes expected key columns", () => {
    expect(appUsers.email).toBeDefined();
    expect(players.position).toBeDefined();
    expect(players.priceCents).toBeDefined();
    expect(gameweeks.locksAt).toBeDefined();
    expect(teams.userId).toBeDefined();
    expect(teamSelections.positionSlot).toBeDefined();
    expect(playerGameweekStats.goals).toBeDefined();
    expect(teamGameweekScores.points).toBeDefined();
    expect(friendLeagues.ownerUserId).toBeDefined();
    expect(friendLeagueMembers.userId).toBeDefined();
    expect(transferWindows.extraTransferPenalty).toBeDefined();
    expect(transfers.playerInId).toBeDefined();
    expect(waitlistSignups.email).toBeDefined();
    expect(waitlistSignups.topFeatureInterest).toBeDefined();
  });
});
