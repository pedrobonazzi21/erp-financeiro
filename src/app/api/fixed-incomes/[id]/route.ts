import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fixedIncomes } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(fixedIncomes).where(eq(fixedIncomes.id, id));
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
    const [item] = await getDb().update(fixedIncomes).set({
      name: body.name,
      amount: body.amount,
      categoryId: body.categoryId,
      accountId: body.accountId,
      memberId: body.memberId,
      dueDay: body.dueDay ?? null,
      frequency: body.frequency,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      description: body.description ?? null,
      active: body.active,
      updatedAt: new Date(),
    }).where(eq(fixedIncomes.id, id)).returning();
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
    const [item] = await getDb().delete(fixedIncomes).where(eq(fixedIncomes.id, id)).returning();
    if (!item) return notFound();
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
