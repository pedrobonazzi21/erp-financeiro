import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const checks: Record<string, any> = {}

  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
  }

  try {
    const mod = await import("@/lib/firebase/admin")
    checks.firebaseAdmin = "imported ok"
    try {
      mod.getAdminAuth()
      checks.firebaseInit = "ok"
    } catch (e: any) {
      checks.firebaseInit = e?.message
    }
  } catch (e: any) {
    checks.firebaseAdmin = e?.message
  }

  try {
    const mod = await import("@/lib/db")
    checks.db = "imported ok"
    try {
      mod.getDb()
      checks.dbInit = "ok"
    } catch (e: any) {
      checks.dbInit = e?.message
    }
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

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)

    const { getDb } = await import("@/lib/db")
    const db = getDb()
    const { users } = await import("@/lib/db/schema")
    const { eq } = await import("drizzle-orm")

    const existingUser = await db.select().from(users).where(eq(users.id, decoded.uid)).limit(1)

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: decoded.uid,
        name: name || decoded.name || "Usuário",
        email: decoded.email!,
        emailVerified: true,
        image: decoded.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ uid: decoded.uid, email: decoded.email })
  } catch (error: any) {
    console.error("Auth error:", error?.message, error?.code)
    return NextResponse.json(
      { error: error?.message || "Erro desconhecido", code: error?.code || null },
      { status: 500 }
    )
  }
}
