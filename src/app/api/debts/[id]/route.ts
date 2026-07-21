import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { debts } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(debts).where(eq(debts.id, id));
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
    const [item] = await getDb().update(debts).set({
      type: body.type,
      description: body.description,
      totalAmount: body.totalAmount,
      remainingAmount: body.remainingAmount,
      interestRate: body.interestRate,
      installmentsTotal: body.installmentsTotal,
      installmentsRemaining: body.installmentsRemaining,
      memberId: body.memberId,
      updatedAt: new Date(),
    }).where(eq(debts.id, id)).returning();
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
    const [item] = await getDb().delete(debts).where(eq(debts.id, id)).returning();
    if (!item) return notFound();
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
