import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { transfers, bankAccounts } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(transfers).where(eq(transfers.id, id));
    if (!item) return notFound();
    return ok(item);
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
    const [old] = await getDb().select().from(transfers).where(eq(transfers.id, id));
    if (!old) return notFound();

    const [item] = await getDb().update(transfers).set({
      amount: body.amount,
      date: body.date,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      memberId: body.memberId,
      description: body.description,
      updatedAt: new Date(),
    }).where(eq(transfers.id, id)).returning();

    const oldAmount = Number(old.amount);
    const newAmount = Number(body.amount);

    await Promise.all([
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${oldAmount} - ${newAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.fromAccountId)),
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${oldAmount} + ${newAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.toAccountId)),
    ]);

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
    const [old] = await getDb().select().from(transfers).where(eq(transfers.id, id));
    if (!old) return notFound();

    const [item] = await getDb().delete(transfers).where(eq(transfers.id, id)).returning();

    const amount = Number(old.amount);
    await Promise.all([
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.fromAccountId)),
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.toAccountId)),
    ]);

    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
