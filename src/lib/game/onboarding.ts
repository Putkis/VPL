import { getPlayerCatalog } from "./catalog";
import { validateTeamSelection } from "./team-rules";

export const onboardingSteps = [
  {
    id: "identity",
    label: "Kayttaja"
  },
  {
    id: "starter",
    label: "Aloituskokoonpano"
  },
  {
    id: "review",
    label: "Vahvista"
  }
] as const;

export type OnboardingStepId = (typeof onboardingSteps)[number]["id"];

type PresetDefinition = {
  id: string;
  name: string;
  description: string;
  teamName: string;
  playerNames: string[];
};

const presetDefinitions: PresetDefinition[] = [
  {
    id: "balanced",
    name: "Tasapainoinen",
    description: "Vakaa 1-2-3-1 runko, joka toimii heti ilman lisasaatoa.",
    teamName: "Nopea nousu",
    playerNames: [
      "Luke Hakala",
      "Juho Lehto",
      "Matti Kallio",
      "Oskar Niemi",
      "Leo Laine",
      "Samu Virtanen",
      "Eetu Koski"
    ]
  },
  {
    id: "safe",
    name: "Turvallinen",
    description: "Edullisempi avaus, joka jattaa pelivaraa jatkosiirroille.",
    teamName: "Perusvarma XI",
    playerNames: [
      "Luke Hakala",
      "Juho Lehto",
      "Matti Kallio",
      "Leo Laine",
      "Samu Virtanen",
      "Eetu Koski",
      "Vilho Salo"
    ]
  },
  {
    id: "attack",
    name: "Hyokkaava",
    description: "Maksimoi pistepotentiaalia keskikentalla ja piikissa.",
    teamName: "Riski ja palkinto",
    playerNames: [
      "Luke Hakala",
      "Juho Lehto",
      "Matti Kallio",
      "Oskar Niemi",
      "Samu Virtanen",
      "Eetu Koski",
      "Vilho Salo"
    ]
  }
];

const catalog = getPlayerCatalog();

export const onboardingPresets = presetDefinitions.map((preset) => {
  const players = preset.playerNames
    .map((playerName) => catalog.find((player) => player.name === playerName))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));
  const validation = validateTeamSelection(players);

  return {
    ...preset,
    playerIds: players.map((player) => player.id),
    players,
    totalPriceCents: validation.totalPriceCents
  };
});
