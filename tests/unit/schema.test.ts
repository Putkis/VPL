// @vitest-environment node

import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { appUsers, teams, waitlistSignups } from "../../src/lib/db/schema";

describe("database schema", () => {
  it("defines expected table names", () => {
    expect(getTableName(appUsers)).toBe("app_users");
    expect(getTableName(teams)).toBe("teams");
    expect(getTableName(waitlistSignups)).toBe("waitlist_signups");
  });

  it("exposes expected key columns", () => {
    expect(appUsers.email).toBeDefined();
    expect(teams.userId).toBeDefined();
    expect(waitlistSignups.email).toBeDefined();
    expect(waitlistSignups.topFeatureInterest).toBeDefined();
  });
});
