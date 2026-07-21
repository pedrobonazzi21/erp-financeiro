import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await db.select().from(invoices).orderBy(invoices.year, invoices.month);
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
    const [item] = await db.insert(invoices).values({
      id: crypto.randomUUID(),
      creditCardId: body.creditCardId,
      month: body.month,
      year: body.year,
      amount: body.amount || "0",
      paidAmount: body.paidAmount || "0",
      status: body.status || "open",
      dueDate: body.dueDate,
      closingDate: body.closingDate,
      paidAt: body.paidAt,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
