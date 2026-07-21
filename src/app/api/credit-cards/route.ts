import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { creditCards } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(creditCards).orderBy(creditCards.name);
    return ok(all);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const [item] = await getDb().insert(creditCards).values({
      id: crypto.randomUUID(),
      name: body.name,
      limit: body.limit,
      used: body.used || "0",
      available: body.available,
      bestDay: body.bestDay,
      closingDay: body.closingDay,
      dueDay: body.dueDay,
      memberId: body.memberId,
      bankAccountId: body.bankAccountId,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
