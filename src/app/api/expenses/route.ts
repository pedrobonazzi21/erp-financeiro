import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError, subtractBalance } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(expenses).orderBy(expenses.createdAt);
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
    const [item] = await getDb().insert(expenses).values({
      id: crypto.randomUUID(),
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId || null,
      amount: body.amount,
      competenceDate: new Date(body.competenceDate),
      paidDate: body.paidDate ? new Date(body.paidDate) : null,
      memberId: body.memberId,
      accountId: body.accountId || null,
      creditCardId: body.creditCardId || null,
      paymentMethodId: body.paymentMethodId || null,
      costCenterId: body.costCenterId || null,
      description: body.description || null,
      receipt: body.receipt || null,
      recurring: body.recurring ?? false,
      splitMembers: body.splitMembers || null,
    }).returning();
    if (item.accountId) await subtractBalance(item.accountId, item.amount);
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error('Expenses POST error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
