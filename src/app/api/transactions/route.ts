import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { incomes, expenses, transfers, investments, debts } from "@/lib/db/schema";
import { requireAuth, ok } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const [incomeRows, expenseRows, transferRows, investmentRows, debtRows] = await Promise.all([
      db.select().from(incomes).orderBy(incomes.createdAt),
      db.select().from(expenses).orderBy(expenses.createdAt),
      db.select().from(transfers).orderBy(transfers.createdAt),
      db.select().from(investments).orderBy(investments.createdAt),
      db.select().from(debts).orderBy(debts.createdAt),
    ]);

    const mapped: Array<{
      id: string;
      date: string;
      type: string;
      category: string;
      description: string;
      account: string;
      amount: number;
      status: string;
      member: string;
    }> = [];

    incomeRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.competenceDate.toISOString(),
        type: "income",
        category: r.categoryId,
        description: r.description ?? "",
        account: r.accountId,
        amount: Number(r.amount),
        status: r.receivedDate ? "confirmed" : "pending",
        member: r.memberId,
      });
    });

    expenseRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.competenceDate.toISOString(),
        type: "expense",
        category: r.categoryId,
        description: r.description ?? "",
        account: r.accountId ?? "",
        amount: Number(r.amount),
        status: r.paidDate ? "confirmed" : "pending",
        member: r.memberId,
      });
    });

    transferRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.date.toISOString(),
        type: "transfer",
        category: "Transferência",
        description: r.description ?? "",
        account: r.fromAccountId,
        amount: Number(r.amount),
        status: "confirmed",
        member: r.memberId,
      });
    });

    investmentRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.createdAt.toISOString(),
        type: "investment",
        category: r.type,
        description: r.name,
        account: "",
        amount: Number(r.amount),
        status: "confirmed",
        member: r.memberId,
      });
    });

    debtRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.createdAt.toISOString(),
        type: "debt_payment",
        category: r.type,
        description: r.description,
        account: "",
        amount: Number(r.remainingAmount),
        status: "confirmed",
        member: r.memberId,
      });
    });

    mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return ok(mapped);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
