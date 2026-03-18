// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { GET as getScoringPreview } from "../../src/app/api/scoring/preview/route";
import { POST as postAdminResults } from "../../src/app/api/admin/results/route";
import { POST as runAdminScore } from "../../src/app/api/admin/results/score/route";
import { clearResultsStoreForTests } from "../../src/lib/game/results-store";

function createJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("admin results routes", () => {
  beforeEach(() => {
    clearResultsStoreForTests();
  });

  it("allows an admin to save validated result rows", async () => {
    const response = await postAdminResults(
      createJsonRequest("http://localhost/api/admin/results", {
        viewerKey: "aino@example.com",
        gameweekSlug: "gw-3",
        stats: [
          {
            playerId: "20000000-0000-4000-8000-000000000001",
            minutesPlayed: 90,
            goals: 0,
            assists: 0,
            cleanSheet: true,
            saves: 4,
            yellowCards: 0,
            redCards: 0,
            bonusPoints: 2
          }
        ]
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      gameweekSlug: "gw-3",
      savedStatCount: 1
    });
  });

  it("rejects non-admin submissions", async () => {
    const response = await postAdminResults(
      createJsonRequest("http://localhost/api/admin/results", {
        viewerKey: "viewer@example.com",
        gameweekSlug: "gw-3",
        stats: [
          {
            playerId: "20000000-0000-4000-8000-000000000001",
            minutesPlayed: 90,
            goals: 0,
            assists: 0,
            cleanSheet: true,
            saves: 4,
            yellowCards: 0,
            redCards: 0,
            bonusPoints: 2
          }
        ]
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.code).toBe("forbidden");
  });

  it("runs a score job against the manually entered results", async () => {
    await postAdminResults(
      createJsonRequest("http://localhost/api/admin/results", {
        viewerKey: "aino@example.com",
        gameweekSlug: "gw-3",
        stats: [
          {
            playerId: "20000000-0000-4000-8000-000000000006",
            minutesPlayed: 90,
            goals: 3,
            assists: 0,
            cleanSheet: false,
            saves: 0,
            yellowCards: 0,
            redCards: 0,
            bonusPoints: 3
          }
        ]
      })
    );

    const scoreResponse = await runAdminScore(
      createJsonRequest("http://localhost/api/admin/results/score", {
        viewerKey: "aino@example.com",
        gameweekSlug: "gw-3"
      })
    );
    const scorePayload = await scoreResponse.json();

    expect(scoreResponse.status).toBe(200);
    expect(scorePayload.ok).toBe(true);
    expect(scorePayload.scoreRun?.gameweekSlug).toBe("gw-3");

    const previewResponse = await getScoringPreview(
      new Request("http://localhost/api/scoring/preview?gameweek=gw-3")
    );
    const previewPayload = await previewResponse.json();

    expect(previewPayload.playerScores[0]).toMatchObject({
      playerName: "Eetu Koski"
    });
  });
});
