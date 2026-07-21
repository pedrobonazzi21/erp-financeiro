import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { installments } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(installments).orderBy(installments.startDate);
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
    const [item] = await getDb().insert(installments).values({
      id: crypto.randomUUID(),
      description: body.description,
      totalAmount: body.totalAmount,
      installmentAmount: body.installmentAmount,
      totalCount: body.totalCount,
      currentCount: body.currentCount || 1,
      creditCardId: body.creditCardId,
      categoryId: body.categoryId,
      startDate: body.startDate,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
