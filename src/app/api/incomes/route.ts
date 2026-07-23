import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { incomes } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError, addBalance } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(incomes).orderBy(incomes.createdAt);
    const enriched = all.map((r) => ({
      ...r,
      status: r.receivedDate ? "received" as const : "pending" as const,
    }));
    return ok(enriched);
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
    const [item] = await getDb().insert(incomes).values({
      id: crypto.randomUUID(),
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId,
      amount: body.amount,
      competenceDate: body.competenceDate,
      receivedDate: body.receivedDate,
      accountId: body.accountId,
      memberId: body.memberId,
      paymentMethodId: body.paymentMethodId,
      costCenterId: body.costCenterId,
      description: body.description,
      receipt: body.receipt,
      recurring: body.recurring ?? false,
    }).returning();
    if (item.accountId) await addBalance(item.accountId, item.amount);
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
