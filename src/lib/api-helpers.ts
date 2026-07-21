import { NextResponse, type NextRequest } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"

export async function requireAuth(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized")

    const token = authHeader.slice(7)
    const decoded = await getAdminAuth().verifyIdToken(token)
    return decoded.uid
  } catch {
    throw new Error("Unauthorized")
  }
}

export function ok<T>(data: T) {
  return NextResponse.json(data)
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(error: unknown) {
  console.error(error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
