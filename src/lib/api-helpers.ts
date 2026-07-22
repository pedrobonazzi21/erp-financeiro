import { NextResponse, type NextRequest } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { getDb } from "@/lib/db"
import { bankAccounts, creditCards } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function requireAuth(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized")

    const token = authHeader.slice(7)
    const decoded = await verifyIdToken(token)
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

export async function addBalance(accountId: string | null | undefined, amount: string | number) {
  if (!accountId) return
  await getDb().update(bankAccounts).set({
    balance: sql`${bankAccounts.balance} + ${Number(amount)}`,
  }).where(eq(bankAccounts.id, accountId))
}

export async function subtractBalance(accountId: string | null | undefined, amount: string | number) {
  if (!accountId) return
  await getDb().update(bankAccounts).set({
    balance: sql`${bankAccounts.balance} - ${Number(amount)}`,
  }).where(eq(bankAccounts.id, accountId))
}

export async function addCreditUsed(cardId: string | null | undefined, amount: string | number) {
  if (!cardId) return
  await getDb().update(creditCards).set({
    used: sql`${creditCards.used} + ${Number(amount)}`,
  }).where(eq(creditCards.id, cardId))
}

export async function subtractCreditUsed(cardId: string | null | undefined, amount: string | number) {
  if (!cardId) return
  await getDb().update(creditCards).set({
    used: sql`${creditCards.used} - ${Number(amount)}`,
  }).where(eq(creditCards.id, cardId))
}
