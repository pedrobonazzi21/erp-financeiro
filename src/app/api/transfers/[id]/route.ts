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

    const isExternal = !!body.externalTo;

    const [item] = await getDb().update(transfers).set({
      amount: body.amount,
      date: body.date,
      fromAccountId: body.fromAccountId,
      toAccountId: isExternal ? "" : body.toAccountId,
      memberId: body.memberId,
      externalTo: isExternal ? body.externalTo : null,
      description: body.description || body.externalTo || null,
      updatedAt: new Date(),
    }).where(eq(transfers.id, id)).returning();

    const oldAmount = Number(old.amount);
    const newAmount = Number(body.amount);
    const wasExternal = !!old.externalTo;
    const fromSame = old.fromAccountId === body.fromAccountId;

    const updates: Promise<unknown>[] = [];

    // Reverse old: give back to source, take from dest
    updates.push(
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${oldAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.fromAccountId)),
    );
    if (!wasExternal && old.toAccountId) {
      updates.push(
        getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${oldAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.toAccountId)),
      );
    }

    // Apply new: take from source, add to dest
    updates.push(
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${newAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.fromAccountId)),
    );
    if (!isExternal && body.toAccountId) {
      updates.push(
        getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${newAmount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, body.toAccountId)),
      );
    }

    await Promise.all(updates);

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
    const wasExternal = !!old.externalTo;

    const updates: Promise<unknown>[] = [
      getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.fromAccountId)),
    ];
    if (!wasExternal && old.toAccountId) {
      updates.push(
        getDb().update(bankAccounts).set({ balance: sql`${bankAccounts.balance} - ${amount}`, updatedAt: new Date() }).where(eq(bankAccounts.id, old.toAccountId)),
      );
    }
    await Promise.all(updates);

    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
