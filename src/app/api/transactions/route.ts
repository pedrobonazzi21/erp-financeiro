import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  incomes, expenses, transfers, investments, debts,
  categories, bankAccounts, familyMembers,
} from "@/lib/db/schema";
import { requireAuth, ok } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const [incomeRows, expenseRows, transferRows, investmentRows, debtRows, allCategories, allAccounts, allMembers] = await Promise.all([
      getDb().select().from(incomes).orderBy(incomes.createdAt),
      getDb().select().from(expenses).orderBy(expenses.createdAt),
      getDb().select().from(transfers).orderBy(transfers.createdAt),
      getDb().select().from(investments).orderBy(investments.createdAt),
      getDb().select().from(debts).orderBy(debts.createdAt),
      getDb().select().from(categories),
      getDb().select().from(bankAccounts),
      getDb().select().from(familyMembers),
    ]);

    const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));
    const accountMap = new Map(allAccounts.map((a) => [a.id, a.bank]));
    const memberMap = new Map(allMembers.map((m) => [m.id, m.name]));

    const mapped: Array<{
      id: string;
      date: string;
      type: string;
      category: string;
      categoryId: string;
      description: string;
      account: string;
      accountId: string;
      amount: number;
      status: string;
      member: string;
      memberId: string;
      sourceType: string;
      sourceId: string;
    }> = [];

    incomeRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.competenceDate.toISOString(),
        type: "income",
        category: categoryMap.get(r.categoryId) || r.categoryId,
        categoryId: r.categoryId,
        description: r.description ?? "",
        account: accountMap.get(r.accountId) || r.accountId,
        accountId: r.accountId,
        amount: Number(r.amount),
        status: r.receivedDate ? "confirmed" : "pending",
        member: memberMap.get(r.memberId) || r.memberId,
        memberId: r.memberId,
        sourceType: r.sourceType ?? "",
        sourceId: r.sourceId ?? "",
      });
    });

    expenseRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.competenceDate.toISOString(),
        type: "expense",
        category: categoryMap.get(r.categoryId) || r.categoryId,
        categoryId: r.categoryId,
        description: r.description ?? "",
        account: r.accountId ? (accountMap.get(r.accountId) || r.accountId) : (r.creditCardId || ""),
        accountId: r.accountId ?? "",
        amount: Number(r.amount),
        status: r.paidDate ? "confirmed" : "pending",
        member: memberMap.get(r.memberId) || r.memberId,
        memberId: r.memberId,
        sourceType: r.sourceType ?? "",
        sourceId: r.sourceId ?? "",
      });
    });

    transferRows.forEach((r) => {
      const fromName = accountMap.get(r.fromAccountId) || r.fromAccountId;
      const toName = accountMap.get(r.toAccountId) || r.toAccountId;
      mapped.push({
        id: r.id,
        date: r.date.toISOString(),
        type: "transfer",
        category: "Transferência",
        categoryId: "",
        description: r.description ?? `Transferência: ${fromName} → ${toName}`,
        account: `${fromName} → ${toName}`,
        accountId: r.fromAccountId,
        amount: Number(r.amount),
        status: "confirmed",
        member: memberMap.get(r.memberId) || r.memberId,
        memberId: r.memberId,
        sourceType: "",
        sourceId: "",
      });
    });

    investmentRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.createdAt.toISOString(),
        type: "investment",
        category: r.type,
        categoryId: "",
        description: r.name,
        account: accountMap.get(r.memberId) || r.memberId,
        accountId: "",
        amount: Number(r.amount),
        status: "confirmed",
        member: memberMap.get(r.memberId) || r.memberId,
        memberId: r.memberId,
        sourceType: "",
        sourceId: "",
      });
    });

    debtRows.forEach((r) => {
      mapped.push({
        id: r.id,
        date: r.createdAt.toISOString(),
        type: "debt_payment",
        category: r.type,
        categoryId: "",
        description: r.description,
        account: "",
        accountId: "",
        amount: Number(r.remainingAmount),
        status: "confirmed",
        member: memberMap.get(r.memberId) || r.memberId,
        memberId: r.memberId,
        sourceType: "",
        sourceId: "",
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
