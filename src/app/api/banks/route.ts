import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { banks } from "@/lib/db/schema";
import { requireAuth, ok, created, badRequest, serverError } from "@/lib/api-helpers";
import { eq, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const all = search
      ? await getDb().select().from(banks).where(like(banks.name, `%${search}%`)).orderBy(banks.name)
      : await getDb().select().from(banks).orderBy(banks.name);
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
    if (!body.name?.trim()) {
      return badRequest("Nome do banco é obrigatório");
    }
    const [item] = await getDb().insert(banks).values({
      id: crypto.randomUUID(),
      name: body.name.trim(),
      code: body.code?.trim() || null,
    }).returning();
    return created(item);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return serverError(e);
  }
}
