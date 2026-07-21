import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recurringBills } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

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
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
