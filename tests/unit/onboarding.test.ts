// @vitest-environment node

import { describe, expect, it } from "vitest";
import { onboardingPresets, onboardingSteps } from "../../src/lib/game/onboarding";
import { validateTeamSelection } from "../../src/lib/game/team-rules";

describe("onboarding presets", () => {
  it("defines a compact three-step onboarding flow", () => {
    expect(onboardingSteps.map((step) => step.id)).toEqual(["identity", "starter", "review"]);
  });

  it("ships only valid starter presets", () => {
    expect(onboardingPresets).toHaveLength(3);

    onboardingPresets.forEach((preset) => {
      const validation = validateTeamSelection(preset.players);

      expect(preset.playerIds).toHaveLength(7);
      expect(validation.ok).toBe(true);
    });
  });
});
