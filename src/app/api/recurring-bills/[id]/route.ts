import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recurringBills } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(recurringBills).where(eq(recurringBills.id, id));
    if (!item) return notFound();
    return ok(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    const [item] = await getDb().update(recurringBills).set({
      name: body.name,
      amount: body.amount,
      dueDay: body.dueDay,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      frequency: body.frequency,
      startDate: startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
      autoAdjust: body.autoGenerate ?? body.autoAdjust ?? false,
      suspended: body.suspended ?? false,
      status: body.status ?? "pending",
      month: body.month ?? (startDate.getMonth() + 1),
      year: body.year ?? startDate.getFullYear(),
      updatedAt: new Date(),
    }).where(eq(recurringBills.id, id)).returning();
    if (!item) return notFound();
    return ok(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().delete(recurringBills).where(eq(recurringBills.id, id)).returning();
    if (!item) return notFound();
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
