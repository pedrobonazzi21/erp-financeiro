import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recurringBills, expenses } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError, subtractBalance, addCreditUsed } from "@/lib/api-helpers";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(recurringBills).orderBy(recurringBills.name);
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
    const [item] = await getDb().insert(recurringBills).values({
      id: crypto.randomUUID(),
      name: body.name,
      amount: body.amount,
      dueDay: body.dueDay,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      frequency: body.frequency || "monthly",
      startDate: body.startDate,
      endDate: body.endDate,
      autoAdjust: body.autoAdjust ?? false,
      suspended: body.suspended ?? false,
      status: body.status || "pending",
      month: body.month,
      year: body.year,
    }).returning();

    // Backfill expense entries from startDate up to now (isolated)
    if (item.status === "pending" && !item.suspended) {
      try {
        const start = new Date(item.startDate);
        const end = item.endDate ? new Date(item.endDate) : new Date();
        if (end >= start) {
          const yearStart = start.getFullYear();
          const monthStart = start.getMonth();
          const yearEnd = end.getFullYear();
          const monthEnd = end.getMonth();
          let m = new Date(yearStart, monthStart, 1);
          const last = new Date(yearEnd, monthEnd, 1);
          while (m <= last) {
            const compDate = new Date(m);
            const nextMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1);
            const [existing] = await getDb()
              .select({ count: sql<number>`count(*)::int` })
              .from(expenses)
              .where(and(
                eq(expenses.description, item.name),
                eq(expenses.accountId, item.accountId),
                eq(expenses.categoryId, item.categoryId),
                eq(expenses.recurring, true),
                sql`${expenses.competenceDate} >= ${compDate}`,
                sql`${expenses.competenceDate} < ${nextMonth}`,
              ));
            if (!existing || existing.count === 0) {
              const [newExpense] = await getDb().insert(expenses).values({
                id: crypto.randomUUID(),
                categoryId: item.categoryId,
                amount: item.amount,
                competenceDate: compDate,
                accountId: item.accountId,
                memberId: item.memberId,
                description: item.name,
                recurring: true,
                sourceType: "recurring_bill",
                sourceId: item.id,
              }).returning();
              if (newExpense.accountId) await subtractBalance(newExpense.accountId, newExpense.amount);
              if (newExpense.creditCardId) await addCreditUsed(newExpense.creditCardId, newExpense.amount);
            }
            m = nextMonth;
          }
        }
      } catch (_) {
        console.error('Failed to auto-create past expense entries:', _);
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
