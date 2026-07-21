import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { getDb } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasFirebaseSA: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, name } = body

    if (!idToken) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)

    const db = getDb()
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
      {
        error: error?.message || "Erro desconhecido",
        code: error?.code || null,
      },
      { status: 500 }
    )
  }
}
