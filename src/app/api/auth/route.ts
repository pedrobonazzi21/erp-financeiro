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
    const raw = await request.text()
    const body = JSON.parse(raw)
    const rawToken = request.headers.get("X-Auth-Token") || body.t || body.idToken
    const { name } = body

    if (!rawToken) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    let idToken: string
    try {
      const b64decoded = Buffer.from(rawToken, "base64").toString("utf-8")
      if (b64decoded.includes(".")) idToken = b64decoded
      else idToken = rawToken
    } catch {
      idToken = rawToken
    }

    const decodedToken = await verifyIdToken(idToken)
    const db = getDb()

    const existingUser = await db.select().from(users).where(eq(users.id, decodedToken.uid)).limit(1)

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: decodedToken.uid,
        name: name || decodedToken.name || "Usuário",
        email: decodedToken.email || "",
        emailVerified: true,
        image: decodedToken.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ uid: decodedToken.uid, email: decodedToken.email })
  } catch (error: any) {
    console.error("Auth error:", error?.message)
    return NextResponse.json(
      { error: error?.message || "Erro desconhecido" },
      { status: 500 }
    )
  }
}
