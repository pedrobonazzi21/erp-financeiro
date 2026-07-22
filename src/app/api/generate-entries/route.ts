import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes, recurringBills, incomes, expenses } from "@/lib/db/schema";
import { requireAuth, ok, serverError, addBalance, subtractBalance, addCreditUsed } from "@/lib/api-helpers";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const generated = { incomes: 0, expenses: 0 };

    // Fixed incomes → Income entries (backfill all from startDate, or just current month)
    const activeFixedIncomes = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.active, true));
    for (const fi of activeFixedIncomes) {
      try {
        let m = fi.startDate ? new Date(fi.startDate) : new Date(startOfMonth);
        m = new Date(m.getFullYear(), m.getMonth(), 1);
        const last = new Date(endOfMonth);
        while (m <= last) {
          const compDate = new Date(m);
          const nextMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1);
          const [existing] = await getDb()
            .select({ count: sql<number>`count(*)::int` })
            .from(incomes)
            .where(and(
              eq(incomes.description, fi.name),
              eq(incomes.accountId, fi.accountId),
              eq(incomes.categoryId, fi.categoryId),
              eq(incomes.recurring, true),
              sql`${incomes.competenceDate} >= ${compDate}`,
              sql`${incomes.competenceDate} < ${nextMonth}`,
            ));

          if (!existing || existing.count === 0) {
            const [newIncome] = await getDb().insert(incomes).values({
              id: crypto.randomUUID(),
              categoryId: fi.categoryId,
              amount: fi.amount,
              competenceDate: compDate,
              accountId: fi.accountId,
              memberId: fi.memberId,
              description: fi.name,
              recurring: true,
            }).returning();
            await addBalance(newIncome.accountId, newIncome.amount);
            generated.incomes++;
          }
          m = nextMonth;
        }
      } catch (_) {
        console.error('Failed to generate income for fixed income:', fi.id, _);
      }
    }

    // Recurring bills → Expense entries (backfill all from startDate)
    const pendingBills = await getDb().select().from(recurringBills).where(
      and(eq(recurringBills.status, "pending"), eq(recurringBills.suspended, false))
    );
    for (const rb of pendingBills) {
      try {
        let m = new Date(rb.startDate);
        m = new Date(m.getFullYear(), m.getMonth(), 1);
        const last = rb.endDate
          ? new Date(Math.min(new Date(rb.endDate).getTime(), endOfMonth.getTime()))
          : new Date(endOfMonth);
        while (m <= last) {
          const compDate = new Date(m);
          const nextMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1);
          const [existing] = await getDb()
            .select({ count: sql<number>`count(*)::int` })
            .from(expenses)
            .where(and(
              eq(expenses.description, rb.name),
              eq(expenses.accountId, rb.accountId),
              eq(expenses.categoryId, rb.categoryId),
              eq(expenses.recurring, true),
              sql`${expenses.competenceDate} >= ${compDate}`,
              sql`${expenses.competenceDate} < ${nextMonth}`,
            ));

          if (!existing || existing.count === 0) {
            const [newExpense] = await getDb().insert(expenses).values({
              id: crypto.randomUUID(),
              categoryId: rb.categoryId,
              amount: rb.amount,
              competenceDate: compDate,
              accountId: rb.accountId,
              memberId: rb.memberId,
              description: rb.name,
              recurring: true,
            }).returning();
            if (newExpense.accountId) await subtractBalance(newExpense.accountId, newExpense.amount);
            if (newExpense.creditCardId) await addCreditUsed(newExpense.creditCardId, newExpense.amount);
            generated.expenses++;
          }
          m = nextMonth;
        }
      } catch (_) {
        console.error('Failed to generate expense for recurring bill:', rb.id, _);
      }
    }

    return ok({ generated, month, year });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
