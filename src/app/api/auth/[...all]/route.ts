import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { getDb } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const checks: Record<string, any> = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    },
  }

  try {
    const { verifyIdToken } = await import("@/lib/firebase/admin")
    checks.firebase = "ok"
  } catch (e: any) {
    checks.firebase = e?.message
  }

  try {
    const { getDb } = await import("@/lib/db")
    checks.db = "ok"
  } catch (e: any) {
    checks.db = e?.message
  }

  return NextResponse.json(checks)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, name } = body

    if (!idToken) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const decoded = await verifyIdToken(idToken)
    const db = getDb()

    const existingUser = await db.select().from(users).where(eq(users.id, decoded.uid)).limit(1)

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: decoded.uid,
        name: name || decoded.name || "Usuário",
        email: decoded.email || "",
        emailVerified: true,
        image: decoded.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ uid: decoded.uid, email: decoded.email })
  } catch (error: any) {
    console.error("Auth error:", error?.message)
    return NextResponse.json(
      { error: error?.message || "Erro desconhecido" },
      { status: 500 }
    )
  }
}
