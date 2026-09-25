import { seedUsers } from "./seed-data";
import { seedFantasyTeams, seedFriendLeagueMembers, seedFriendLeagues } from "./mock-league";

const defaultViewerUserId = "00000000-0000-4000-8000-000000000001";
const defaultViewerLeagueId = "50000000-0000-4000-8000-000000000001";

export function getFriendLeagues() {
  return seedFriendLeagues.map((league) => {
    const members = seedFriendLeagueMembers
      .filter((member) => member.leagueId === league.id)
      .map((member) => ({
        userName:
          seedUsers.find((user) => user.id === member.userId)?.displayName ?? "Unknown",
        teamName:
          seedFantasyTeams.find((team) => team.id === member.teamId)?.name ?? "Unknown team"
      }));

    return {
      ...league,
      members
    };
  });
}

export function getDefaultFriendLeague() {
  return getFriendLeagues().find((league) => league.id === defaultViewerLeagueId) ?? null;
}

export function getDefaultFriendTeamIds() {
  return seedFriendLeagueMembers
    .filter((member) => member.leagueId === defaultViewerLeagueId)
    .map((member) => member.teamId);
}

export function getDefaultViewerUserId() {
  return defaultViewerUserId;
}
