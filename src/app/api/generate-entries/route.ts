import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes, recurringBills, incomes, expenses } from "@/lib/db/schema";
import { requireAuth, ok, serverError } from "@/lib/api-helpers";
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

    // Fixed incomes → Income entries
    const activeFixedIncomes = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.active, true));
    for (const fi of activeFixedIncomes) {
      try {
        const [existing] = await getDb()
          .select({ count: sql<number>`count(*)::int` })
          .from(incomes)
          .where(and(
            eq(incomes.description, fi.name),
            eq(incomes.accountId, fi.accountId),
            eq(incomes.categoryId, fi.categoryId),
            eq(incomes.recurring, true),
            sql`${incomes.competenceDate} >= ${startOfMonth}`,
            sql`${incomes.competenceDate} <= ${endOfMonth}`,
          ));

        if (!existing || existing.count === 0) {
          await getDb().insert(incomes).values({
            id: crypto.randomUUID(),
            categoryId: fi.categoryId,
            amount: fi.amount,
            competenceDate: startOfMonth,
            accountId: fi.accountId,
            memberId: fi.memberId,
            description: fi.name,
            recurring: true,
            sourceType: 'fixed_income',
            sourceId: fi.id,
          });
          generated.incomes++;
        }
      } catch (_) {
        console.error('Failed to generate income for fixed income:', fi.id, _);
      }
    }

    // Recurring bills → Expense entries
    const pendingBills = await getDb().select().from(recurringBills).where(
      and(eq(recurringBills.status, "pending"), eq(recurringBills.suspended, false))
    );
    for (const rb of pendingBills) {
      try {
        const [existing] = await getDb()
          .select({ count: sql<number>`count(*)::int` })
          .from(expenses)
          .where(and(
            eq(expenses.description, rb.name),
            eq(expenses.accountId, rb.accountId),
            eq(expenses.categoryId, rb.categoryId),
            eq(expenses.recurring, true),
            sql`${expenses.competenceDate} >= ${startOfMonth}`,
            sql`${expenses.competenceDate} <= ${endOfMonth}`,
          ));

        if (!existing || existing.count === 0) {
          await getDb().insert(expenses).values({
            id: crypto.randomUUID(),
            categoryId: rb.categoryId,
            amount: rb.amount,
            competenceDate: startOfMonth,
            accountId: rb.accountId,
            memberId: rb.memberId,
            description: rb.name,
            recurring: true,
            sourceType: 'recurring_bill',
            sourceId: rb.id,
          });
          generated.expenses++;
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
