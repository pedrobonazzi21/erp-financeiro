import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { invoices, expenses, creditCards, categories } from "@/lib/db/schema";
import { requireAuth, ok, noContent, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

async function getOrCreateCreditCardExpenseCategory(): Promise<string> {
  const [existing] = await getDb().select().from(categories).where(eq(categories.name, "Fatura Cartão"));
  if (existing) return existing.id;
  const [created] = await getDb().insert(categories).values({
    id: crypto.randomUUID(),
    name: "Fatura Cartão",
    icon: "credit-card",
    type: "expense",
  }).returning();
  return created.id;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const [item] = await getDb().select().from(invoices).where(eq(invoices.id, id));
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
    const [old] = await getDb().select().from(invoices).where(eq(invoices.id, id));
    if (!old) return notFound();

    const [item] = await getDb().update(invoices).set({
      creditCardId: body.creditCardId,
      month: body.month,
      year: body.year,
      amount: body.amount,
      paidAmount: body.paidAmount,
      status: body.status,
      dueDate: body.dueDate,
      closingDate: body.closingDate,
      paidAt: body.paidAt,
      updatedAt: new Date(),
    }).where(eq(invoices.id, id)).returning();

    // When invoice is marked as paid, auto-create an expense entry
    if (body.status === "paid" && old.status !== "paid") {
      const [card] = await getDb().select().from(creditCards).where(eq(creditCards.id, old.creditCardId));
      const categoryId = await getOrCreateCreditCardExpenseCategory();
      const amount = body.paidAmount || body.amount || old.amount;

      await getDb().insert(expenses).values({
        id: crypto.randomUUID(),
        categoryId,
        amount,
        competenceDate: body.paidAt || body.dueDate || new Date(),
        paidDate: body.paidAt || new Date(),
        memberId: card?.memberId || "",
        creditCardId: old.creditCardId,
        description: `Fatura ${String(old.month).padStart(2, "0")}/${old.year}`,
          recurring: false,
          sourceType: 'invoice',
          sourceId: id,
        });
    }

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
    const [item] = await getDb().delete(invoices).where(eq(invoices.id, id)).returning();
    if (!item) return notFound();
    return noContent();
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
