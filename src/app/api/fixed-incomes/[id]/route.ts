import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes, incomes } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.id, id));
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
    const [old] = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.id, id));
    if (!old) return notFound();

    const [item] = await getDb().update(fixedIncomes).set({
      name: body.name,
      amount: body.amount,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      dueDay: body.dueDay ?? null,
      frequency: body.frequency,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      description: body.description ?? null,
      active: body.active,
      updatedAt: new Date(),
    }).where(eq(fixedIncomes.id, id)).returning();

    // Auto-create income entry when re-activated
    if (body.active && !old.active) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const [existing] = await getDb()
        .select({ count: sql<number>`count(*)::int` })
        .from(incomes)
        .where(and(
          eq(incomes.description, item.name),
          eq(incomes.accountId, item.accountId),
          eq(incomes.categoryId, item.categoryId),
          eq(incomes.recurring, true),
          sql`${incomes.competenceDate} >= ${startOfMonth}`,
        ));
      if (!existing || existing.count === 0) {
        await getDb().insert(incomes).values({
          id: crypto.randomUUID(),
          categoryId: item.categoryId,
          amount: item.amount,
          competenceDate: startOfMonth,
          accountId: item.accountId,
          memberId: item.memberId,
          description: item.name,
          recurring: true,
        });
      }
    }

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
    const [item] = await getDb().delete(fixedIncomes).where(eq(fixedIncomes.id, id)).returning();
    if (!item) return notFound();
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
