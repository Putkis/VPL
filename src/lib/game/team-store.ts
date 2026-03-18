export type StoredTeamRecord = {
  viewerKey: string;
  gameweekSlug: string;
  teamName: string;
  playerIds: string[];
  revision: number;
  updatedAt: string;
};

type SaveStoredTeamInput = {
  viewerKey: string;
  gameweekSlug: string;
  teamName: string;
  playerIds: string[];
};

const teamStore = new Map<string, StoredTeamRecord>();

function getTeamStoreKey(viewerKey: string, gameweekSlug: string) {
  return `${viewerKey.trim().toLowerCase()}::${gameweekSlug.trim().toLowerCase()}`;
}

export function getStoredTeam(viewerKey: string, gameweekSlug: string) {
  return teamStore.get(getTeamStoreKey(viewerKey, gameweekSlug)) ?? null;
}

export function saveStoredTeam(input: SaveStoredTeamInput) {
  const current = getStoredTeam(input.viewerKey, input.gameweekSlug);
  const nextRecord: StoredTeamRecord = {
    viewerKey: input.viewerKey.trim().toLowerCase(),
    gameweekSlug: input.gameweekSlug.trim().toLowerCase(),
    teamName: input.teamName.trim(),
    playerIds: [...input.playerIds],
    revision: (current?.revision ?? 0) + 1,
    updatedAt: new Date().toISOString()
  };

  teamStore.set(getTeamStoreKey(input.viewerKey, input.gameweekSlug), nextRecord);

  return nextRecord;
}

export function clearStoredTeamsForTests() {
  teamStore.clear();
}
