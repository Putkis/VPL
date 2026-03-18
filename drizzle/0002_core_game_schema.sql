create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  display_name text not null,
  favorite_club text,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  first_name text not null,
  last_name text not null,
  club text not null,
  position text not null check (position in ('goalkeeper', 'defender', 'midfielder', 'forward')),
  price_cents integer not null,
  total_points integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists players_club_idx on public.players (club);
create index if not exists players_position_idx on public.players (position);
create index if not exists players_price_idx on public.players (price_cents);

create table if not exists public.gameweeks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  round_number integer not null unique,
  starts_at timestamptz not null,
  locks_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'live', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists gameweeks_status_idx on public.gameweeks (status);

alter table if exists public.teams
  add column if not exists bank_cents integer not null default 0;

alter table if exists public.teams
  add column if not exists total_points integer not null default 0;

alter table if exists public.teams
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teams_user_fk'
  ) then
    alter table public.teams
      add constraint teams_user_fk foreign key (user_id) references public.app_users(id) on delete cascade;
  end if;
end $$;

create index if not exists teams_user_idx on public.teams (user_id);
create unique index if not exists teams_user_name_idx on public.teams (user_id, name);

create table if not exists public.team_selections (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  position_slot integer not null,
  is_starter boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (team_id, player_id)
);

create unique index if not exists team_selections_team_slot_idx
  on public.team_selections (team_id, position_slot);

create table if not exists public.player_gameweek_stats (
  player_id uuid not null references public.players(id) on delete cascade,
  gameweek_id uuid not null references public.gameweeks(id) on delete cascade,
  minutes_played integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  clean_sheet boolean not null default false,
  saves integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  bonus_points integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (player_id, gameweek_id)
);

create table if not exists public.team_gameweek_scores (
  team_id uuid not null references public.teams(id) on delete cascade,
  gameweek_id uuid not null references public.gameweeks(id) on delete cascade,
  points integer not null default 0,
  rank integer,
  created_at timestamptz not null default now(),
  primary key (team_id, gameweek_id)
);

create index if not exists team_gameweek_scores_rank_idx
  on public.team_gameweek_scores (gameweek_id, rank);

create table if not exists public.friend_leagues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references public.app_users(id) on delete cascade,
  visibility text not null default 'private'
    check (visibility in ('private', 'public')),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists friend_leagues_owner_idx on public.friend_leagues (owner_user_id);

create table if not exists public.friend_league_members (
  league_id uuid not null references public.friend_leagues(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create table if not exists public.transfer_windows (
  id uuid primary key default gen_random_uuid(),
  gameweek_id uuid not null unique references public.gameweeks(id) on delete cascade,
  opens_at timestamptz not null,
  locks_at timestamptz not null,
  free_transfers integer not null default 1,
  extra_transfer_penalty integer not null default 4
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  gameweek_id uuid not null references public.gameweeks(id) on delete cascade,
  player_out_id uuid not null references public.players(id),
  player_in_id uuid not null references public.players(id),
  penalty_points integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists transfers_team_idx on public.transfers (team_id, gameweek_id);
