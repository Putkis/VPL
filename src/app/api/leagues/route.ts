import { NextResponse } from "next/server";
import { getFriendLeagues } from "../../../lib/game/leagues";

export async function GET() {
  return NextResponse.json({
    ok: true,
    leagues: getFriendLeagues()
  });
}
