import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentMethods } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const all = await getDb().select().from(paymentMethods).orderBy(paymentMethods.name);
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
    const [item] = await getDb().insert(paymentMethods).values({
      id: crypto.randomUUID(),
      name: body.name,
      icon: body.icon,
      familyId: body.familyId,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
