import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes, incomes } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(fixedIncomes).orderBy(fixedIncomes.name);
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
    const [item] = await getDb().insert(fixedIncomes).values({
      id: crypto.randomUUID(),
      name: body.name,
      amount: body.amount,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      dueDay: body.dueDay ?? null,
      frequency: body.frequency ?? 'monthly',
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      description: body.description ?? null,
      active: body.active ?? true,
    }).returning();

    // Backfill income entries from startDate up to now (isolated)
    if (item.active && item.startDate) {
      try {
        const start = new Date(item.startDate);
        const end = new Date();
        if (end >= start) {
          let m = new Date(start.getFullYear(), start.getMonth(), 1);
          const last = new Date(end.getFullYear(), end.getMonth(), 1);
          while (m <= last) {
            const compDate = new Date(m);
            const nextMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1);
            const [existing] = await getDb()
              .select({ count: sql<number>`count(*)::int` })
              .from(incomes)
              .where(and(
                eq(incomes.description, item.name),
                eq(incomes.accountId, item.accountId),
                eq(incomes.categoryId, item.categoryId),
                eq(incomes.recurring, true),
                sql`${incomes.competenceDate} >= ${compDate}`,
                sql`${incomes.competenceDate} < ${nextMonth}`,
              ));
            if (!existing || existing.count === 0) {
              await getDb().insert(incomes).values({
                id: crypto.randomUUID(),
                categoryId: item.categoryId,
                amount: item.amount,
                competenceDate: compDate,
                accountId: item.accountId,
                memberId: item.memberId,
                description: item.name,
                recurring: true,
              });
            }
            m = nextMonth;
          }
        }
      } catch (_) {
        console.error('Failed to backfill income entries:', _);
      }
    }

    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
