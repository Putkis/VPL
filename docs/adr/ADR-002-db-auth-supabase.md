# ADR-002: Use Supabase for Postgres and Auth in MVP

- Status: Accepted
- Date: 2026-03-03

## Context

We need fast MVP delivery with relational data, authentication, and low upfront cost.

## Decision

Use Supabase (EU region) for:

- Postgres database
- Authentication (email/password)

Use Drizzle for schema and migrations.

## Consequences

- Pros:
  - Fast setup and low ops burden.
  - Relational model fits fantasy game domain.
  - Easy migration path to Cloud SQL later (Postgres to Postgres).
- Cons:
  - Not fully GCP-native in MVP phase.
  - Supabase-specific features should be used carefully to keep migration easy.

