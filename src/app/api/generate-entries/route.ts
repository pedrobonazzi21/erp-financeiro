import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes, recurringBills, incomes, expenses, creditCards, bankAccounts, invoices } from "@/lib/db/schema";
import { requireAuth, ok, serverError, addBalance, subtractBalance, addCreditUsed } from "@/lib/api-helpers";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();
    const currentDay = now.getUTCDate();
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const generated = { incomes: 0, expenses: 0, invoicesPaid: 0 };

    // ── Fixed incomes → Income entries ──
    const activeFixedIncomes = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.active, true));
    for (const fi of activeFixedIncomes) {
      try {
        let m = fi.startDate ? new Date(fi.startDate) : new Date(startOfMonth);
        m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth()));
        const last = new Date(endOfMonth);
        while (m <= last) {
          const isCurrentMonth = m.getTime() === startOfMonth.getTime();
          const dueDay = fi.dueDay || 1;

          if (isCurrentMonth && dueDay > currentDay) {
            m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1));
            continue;
          }

          const compDay = Math.min(dueDay, new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate());
          const compDate = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), compDay));
          const nextMonth = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1));
          const [existing] = await getDb()
            .select({ count: sql<number>`count(*)::int` })
            .from(incomes)
            .where(and(
              eq(incomes.sourceType, "fixed_income"),
              eq(incomes.sourceId, fi.id),
              sql`${incomes.competenceDate} >= ${compDate}`,
              sql`${incomes.competenceDate} < ${nextMonth}`,
            ));

          if (!existing || existing.count === 0) {
            const [newIncome] = await getDb().insert(incomes).values({
              id: crypto.randomUUID(),
              categoryId: fi.categoryId,
              amount: fi.amount,
              competenceDate: compDate,
              receivedDate: compDate,
              accountId: fi.accountId,
              memberId: fi.memberId,
              description: fi.name,
              recurring: true,
              sourceType: "fixed_income",
              sourceId: fi.id,
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

    // ── Recurring bills → Expense entries ──
    const pendingBills = await getDb().select().from(recurringBills).where(
      and(eq(recurringBills.status, "pending"), eq(recurringBills.suspended, false))
    );
    for (const rb of pendingBills) {
      try {
        let m = new Date(rb.startDate);
        m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth()));
        const last = rb.endDate
          ? new Date(Math.min(new Date(rb.endDate).getTime(), endOfMonth.getTime()))
          : new Date(endOfMonth);
        while (m <= last) {
          const isCurrentMonth = m.getUTCFullYear() === year && m.getUTCMonth() === month - 1;

          // Skip current month if dueDay hasn't arrived yet
          if (isCurrentMonth && rb.dueDay > currentDay) {
            m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1));
            continue;
          }

          const compDate = new Date(m);
          const nextMonth = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1));
          const [existing] = await getDb()
            .select({ count: sql<number>`count(*)::int` })
            .from(expenses)
            .where(and(
              eq(expenses.sourceType, "recurring_bill"),
              eq(expenses.sourceId, rb.id),
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
              sourceType: "recurring_bill",
              sourceId: rb.id,
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

    // ── Credit card closing: auto-pay invoices when closing day arrives ──
    const allCards = await getDb().select().from(creditCards);
    for (const card of allCards) {
      try {
        if (card.closingDay > currentDay) continue;
        if (!card.bankAccountId) continue;
        const used = Number(card.used);
        if (used <= 0) continue;

        // Check if already paid this month
        const [existingInvoice] = await getDb()
          .select()
          .from(invoices)
          .where(and(
            eq(invoices.creditCardId, card.id),
            eq(invoices.month, month),
            eq(invoices.year, year),
            eq(invoices.status, "paid"),
          ))
          .limit(1);

        if (existingInvoice) continue;

        // Deduct used amount from linked bank account
        await subtractBalance(card.bankAccountId, used);

        // Reset credit card
        await getDb().update(creditCards).set({
          used: "0",
          available: sql`${creditCards.limit}`,
        }).where(eq(creditCards.id, card.id));

        // Create/update invoice as paid
        const [existingOpen] = await getDb()
          .select()
          .from(invoices)
          .where(and(
            eq(invoices.creditCardId, card.id),
            eq(invoices.month, month),
            eq(invoices.year, year),
          ))
          .limit(1);

        if (existingOpen) {
          await getDb().update(invoices).set({
            amount: String(used),
            paidAmount: String(used),
            status: "paid",
            paidAt: now,
          }).where(eq(invoices.id, existingOpen.id));
        } else {
          await getDb().insert(invoices).values({
            id: crypto.randomUUID(),
            creditCardId: card.id,
            month,
            year,
            amount: String(used),
            paidAmount: String(used),
            status: "paid",
            dueDate: new Date(year, month - 1, card.dueDay),
            closingDate: new Date(year, month - 1, card.closingDay),
            paidAt: now,
          });
        }

        generated.invoicesPaid++;
      } catch (_) {
        console.error('Failed to auto-pay credit card invoice:', card.id, _);
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
