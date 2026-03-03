import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  budgetCents: integer("budget_cents").notNull().default(100000),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

