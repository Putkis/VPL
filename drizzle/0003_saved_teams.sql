create table if not exists public.saved_teams (
  owner_id uuid not null references auth.users(id) on delete cascade,
  gameweek_slug text not null,
  team_name text not null check (char_length(team_name) between 3 and 30),
  player_ids uuid[] not null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, gameweek_slug)
);

alter table public.saved_teams enable row level security;

drop policy if exists saved_teams_select_own on public.saved_teams;
create policy saved_teams_select_own on public.saved_teams
  for select using (auth.uid() = owner_id);

drop policy if exists saved_teams_insert_own on public.saved_teams;
create policy saved_teams_insert_own on public.saved_teams
  for insert with check (auth.uid() = owner_id);

drop policy if exists saved_teams_update_own on public.saved_teams;
create policy saved_teams_update_own on public.saved_teams
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.bump_saved_team_revision()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists saved_teams_revision on public.saved_teams;
create trigger saved_teams_revision
before update on public.saved_teams
for each row execute function public.bump_saved_team_revision();
