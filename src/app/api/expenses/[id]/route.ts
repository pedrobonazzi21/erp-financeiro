import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { expenses, bankAccounts, creditCards } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(expenses).where(eq(expenses.id, id));
    if (!item) return notFound();
    return ok({ ...item, status: item.paidDate ? "paid" as const : "pending" as const });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const [item] = await getDb().update(expenses).set({
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
      recurring: body.recurring,
      splitMembers: body.splitMembers || null,
      updatedAt: new Date(),
    }).where(eq(expenses.id, id)).returning();
    if (!item) return notFound();
    return ok(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    await getDb().transaction(async (tx) => {
      const [item] = await tx.delete(expenses).where(eq(expenses.id, id)).returning();
      if (!item) throw new Error("Not found");
      if (item.accountId) {
        await tx.update(bankAccounts).set({
          balance: sql`${bankAccounts.balance} + ${Number(item.amount)}`,
        }).where(eq(bankAccounts.id, item.accountId));
      }
      if (item.creditCardId) {
        await tx.update(creditCards).set({
          used: sql`${creditCards.used} - ${Number(item.amount)}`,
        }).where(eq(creditCards.id, item.creditCardId));
      }
    });
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Not found") return notFound();
    return serverError(e);
  }
}
