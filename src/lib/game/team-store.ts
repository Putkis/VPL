import { createClient } from "@supabase/supabase-js";

export type StoredTeamRecord = {
  ownerId: string;
  gameweekSlug: string;
  teamName: string;
  playerIds: string[];
  revision: number;
  updatedAt: string;
};

type SaveStoredTeamInput = {
  gameweekSlug: string;
  teamName: string;
  playerIds: string[];
};

function getSupabase(accessToken?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Team storage is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  });
}

export async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return null;
  const { data, error } = await getSupabase().auth.getUser(accessToken);
  return error || !data.user ? null : { userId: data.user.id, accessToken };
}

export async function getStoredTeam(
  ownerId: string,
  gameweekSlug: string,
  accessToken: string
): Promise<StoredTeamRecord | null> {
  const { data, error } = await getSupabase(accessToken)
    .from("saved_teams")
    .select("owner_id,gameweek_slug,team_name,player_ids,revision,updated_at")
    .eq("owner_id", ownerId)
    .eq("gameweek_slug", gameweekSlug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const record: StoredTeamRecord = {
    ownerId: data.owner_id,
    gameweekSlug: data.gameweek_slug,
    teamName: data.team_name,
    playerIds: data.player_ids as string[],
    revision: data.revision,
    updatedAt: data.updated_at
  };
  return record;
}

export async function saveStoredTeam(
  input: SaveStoredTeamInput & { ownerId: string; accessToken: string }
): Promise<StoredTeamRecord> {
  const { data, error } = await getSupabase(input.accessToken)
    .from("saved_teams")
    .upsert({
      owner_id: input.ownerId,
      gameweek_slug: input.gameweekSlug,
      team_name: input.teamName.trim(),
      player_ids: input.playerIds
    }, { onConflict: "owner_id,gameweek_slug" })
    .select("owner_id,gameweek_slug,team_name,player_ids,revision,updated_at")
    .single();
  if (error) throw error;
  const record: StoredTeamRecord = {
    ownerId: data.owner_id,
    gameweekSlug: data.gameweek_slug,
    teamName: data.team_name,
    playerIds: data.player_ids as string[],
    revision: data.revision,
    updatedAt: data.updated_at
  };
  return record;
}
