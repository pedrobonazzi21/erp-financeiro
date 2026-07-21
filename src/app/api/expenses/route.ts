import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await db.select().from(expenses).orderBy(expenses.createdAt);
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
    const [item] = await db.insert(expenses).values({
      id: crypto.randomUUID(),
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId,
      amount: body.amount,
      competenceDate: body.competenceDate,
      paidDate: body.paidDate,
      memberId: body.memberId,
      accountId: body.accountId,
      creditCardId: body.creditCardId,
      paymentMethodId: body.paymentMethodId,
      costCenterId: body.costCenterId,
      description: body.description,
      receipt: body.receipt,
      recurring: body.recurring ?? false,
      splitMembers: body.splitMembers,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
