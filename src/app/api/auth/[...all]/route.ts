import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, idToken, name } = body

    if (!idToken) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)

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
    console.error("Auth error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split("\n").slice(0, 3).join("\n"),
    })

    const status = error?.code === "app/invalid-credential" ? 500 : 401
    return NextResponse.json(
      { error: error?.message || "Falha na autenticação" },
      { status }
    )
  }
}
