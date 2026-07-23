import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { creditCards } from "@/lib/db/schema";
import { requireAuth, ok, serverError } from "@/lib/api-helpers";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select({ id: creditCards.id, limit: creditCards.limit, used: creditCards.used }).from(creditCards);
    for (const card of all) {
      const limit = Number(card.limit);
      const used = Number(card.used);
      const available = limit - used;
      await getDb().update(creditCards).set({
        available: String(available),
      }).where(eq(creditCards.id, card.id));
    }
    return ok({ synced: all.length });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
