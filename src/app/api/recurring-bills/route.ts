import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recurringBills, expenses } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
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

    // Auto-create expense entry for current month (isolated)
    if (item.status === "pending" && !item.suspended) {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [existing] = await getDb()
          .select({ count: sql<number>`count(*)::int` })
          .from(expenses)
          .where(and(
            eq(expenses.description, item.name),
            eq(expenses.accountId, item.accountId),
            eq(expenses.categoryId, item.categoryId),
            eq(expenses.recurring, true),
            sql`${expenses.competenceDate} >= ${startOfMonth}`,
          ));
        if (!existing || existing.count === 0) {
          await getDb().insert(expenses).values({
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
      } catch (_) {
        console.error('Failed to auto-create expense entry:', _);
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
