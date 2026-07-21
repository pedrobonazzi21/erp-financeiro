import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, idToken, name } = body

    if (action === "login" || action === "register") {
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
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
