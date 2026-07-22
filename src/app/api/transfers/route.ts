import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { transfers, bankAccounts } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(transfers).orderBy(transfers.date);
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
    const amount = body.amount;

    const [item] = await getDb().insert(transfers).values({
      id: crypto.randomUUID(),
      amount,
      date: body.date,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      memberId: body.memberId,
      description: body.description,
    }).returning();

    await Promise.all([
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.fromAccountId)),
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.toAccountId)),
    ]);

    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
