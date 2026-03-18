import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteTransfer } from "../../../../lib/game/transfers";

const transferQuoteSchema = z.object({
  gameweekSlug: z.string().trim().min(1),
  playerOutId: z.string().uuid(),
  playerInId: z.string().uuid(),
  plannedTransferCount: z.number().int().min(1).max(5)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, code: "invalid_transfer" }, { status: 400 });
  }

  const parsed = transferQuoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_transfer" }, { status: 400 });
  }

  const quote = quoteTransfer(parsed.data);
  if (!quote.ok) {
    return NextResponse.json(quote, { status: quote.code === "gameweek_locked" ? 423 : 400 });
  }

  return NextResponse.json(quote);
}
