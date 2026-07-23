import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { expenses, bankAccounts, creditCards } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(expenses).orderBy(expenses.createdAt);
    const enriched = all.map((r) => ({
      ...r,
      status: r.paidDate ? ("paid" as const) : ("pending" as const),
    }));
    return ok(enriched);
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
    const result = await getDb().transaction(async (tx) => {
      const [item] = await tx.insert(expenses).values({
        id: crypto.randomUUID(),
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        amount: body.amount,
        competenceDate: new Date(body.competenceDate),
        paidDate: body.paidDate ? new Date(body.paidDate) : null,
        memberId: body.memberId,
        accountId: body.accountId || null,
        creditCardId: body.creditCardId || null,
        paymentMethodId: body.paymentMethodId || null,
        costCenterId: body.costCenterId || null,
        description: body.description || null,
        receipt: body.receipt || null,
        recurring: body.recurring ?? false,
        splitMembers: body.splitMembers || null,
      }).returning();
      if (item.accountId) {
        await tx.update(bankAccounts).set({
          balance: sql`${bankAccounts.balance} - ${Number(item.amount)}`,
        }).where(eq(bankAccounts.id, item.accountId));
      }
      if (item.creditCardId) {
        await tx.update(creditCards).set({
          used: sql`${creditCards.used} + ${Number(item.amount)}`,
        }).where(eq(creditCards.id, item.creditCardId));
      }
      return item;
    });
    return created(result);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error('Expenses POST error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
