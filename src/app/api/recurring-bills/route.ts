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
    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    const [item] = await getDb().insert(recurringBills).values({
      id: crypto.randomUUID(),
      name: body.name,
      amount: body.amount,
      dueDay: body.dueDay,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      frequency: body.frequency || "monthly",
      startDate: startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
      autoAdjust: body.autoGenerate ?? body.autoAdjust ?? false,
      suspended: body.suspended ?? false,
      status: "pending",
      month: body.month ?? (startDate.getMonth() + 1),
      year: body.year ?? startDate.getFullYear(),
    }).returning();

    // Backfill expense entries from startDate up to now (isolated)
    if (item.status === "pending" && !item.suspended) {
      try {
        const now = new Date();
        const endDate = body.endDate ? new Date(body.endDate) : null;
        const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()));
        let m = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth()));
        const last = endDate
          ? new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1))
          : new Date(nowUtc);
        while (m <= last) {
          const compDate = new Date(m);
          const nextMonth = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1));
          const [existing] = await getDb()
            .select({ count: sql<number>`count(*)::int` })
            .from(expenses)
            .where(and(
              eq(expenses.sourceType, "recurring_bill"),
              eq(expenses.sourceId, item.id),
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
      } catch (_) {
        console.error('Failed to auto-create past expense entries:', _);
      }
    }

    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error('Recurring bills POST error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
