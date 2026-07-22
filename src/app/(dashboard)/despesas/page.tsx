"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MonthPicker, useMonth } from "@/components/month-picker"
import { useApi } from "@/lib/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ExpenseForm } from "./expense-form"
import type { ExpenseFormData } from "@/lib/validations"
import {
   Plus,
   Search,
   ArrowUpDown,
   TrendingDown,
   Pencil,
   Trash2,
   Repeat,
   ExternalLink,
 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Expense {
  id: string
  description: string
  categoryId: string
  amount: number
  competenceDate: string
  paidDate: string
  accountId: string
  creditCardId: string
  paymentMethodId: string
  memberId: string
  costCenterId: string
  installment: string
  status: "paid" | "pending" | "overdue"
  sourceType: string
  sourceId: string
}
interface Category { id: string; name: string }
interface BankAccount { id: string; bank: string }
interface CreditCard { id: string; name: string }
interface PaymentMethod { id: string; name: string }
interface FamilyMember { id: string; name: string }
interface CostCenter { id: string; name: string }

export default function DespesasPage() {
  const router = useRouter()
  const { data: expenses, loading, error, create, update, remove } = useApi<Expense>("/api/expenses")
  const { data: categories } = useApi<Category>("/api/categories")
  const { data: accounts } = useApi<BankAccount>("/api/bank-accounts")
  const { data: creditCards } = useApi<CreditCard>("/api/credit-cards")
  const { data: paymentMethods } = useApi<PaymentMethod>("/api/payment-methods")
  const { data: members } = useApi<FamilyMember>("/api/family-members")
  const { data: costCenters } = useApi<CostCenter>("/api/cost-centers")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"paidDate" | "amount">("paidDate")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { month, year, monthKey, onChange: onMonthChange } = useMonth()

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(categories || []).forEach((c) => { map[c.id] = c.name })
    return map
  }, [categories])
  const accountMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(accounts || []).forEach((a) => { map[a.id] = a.bank })
    return map
  }, [accounts])
  const creditCardMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(creditCards || []).forEach((c) => { map[c.id] = c.name })
    return map
  }, [creditCards])
  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(paymentMethods || []).forEach((p) => { map[p.id] = p.name })
    return map
  }, [paymentMethods])
  const memberMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(members || []).forEach((m) => { map[m.id] = m.name })
    return map
  }, [members])

  const filtered = useMemo(() => {
    let data = [...expenses]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((e) => {
        const catName = (categoryMap[e.categoryId] || "").toLowerCase()
        return e.description.toLowerCase().includes(q) || catName.includes(q)
      })
    }
    if (statusFilter !== "all") data = data.filter((e) => e.status === statusFilter)
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "amount") return mul * (a.amount - b.amount)
      return mul * (new Date(a.paidDate || a.competenceDate).getTime() - new Date(b.paidDate || b.competenceDate).getTime())
    })
    return data
  }, [expenses, search, statusFilter, sortField, sortDir, categoryMap])

  const totalThisMonth = useMemo(
    () => expenses
      .filter((e) => (e.paidDate || e.competenceDate)?.startsWith(monthKey))
      .reduce((a, b) => a + Number(b.amount), 0),
    [expenses, monthKey]
  )
  const totalPaid = expenses.filter((e) => e.status === "paid").reduce((a, b) => a + Number(b.amount), 0)
  const totalPending = expenses.filter((e) => e.status === "pending" || e.status === "overdue").reduce((a, b) => a + Number(b.amount), 0)

  function toggleSort(field: "paidDate" | "amount") {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  async function handleSave(data: ExpenseFormData, id?: string) {
    const paidDate = data.paidDate || new Date().toISOString().split("T")[0]
    const installmentLabel = Number(data.installments) > 1 ? `1/${data.installments}` : ""
    const payload: Partial<Expense> = {
      description: data.description,
      categoryId: data.categoryId,
      amount: Number(data.amount),
      competenceDate: paidDate,
      paidDate: data.paidDate || "",
      accountId: data.paymentType === "account" ? data.accountId || "" : "",
      creditCardId: data.paymentType === "credit" ? data.creditCardId || "" : "",
      paymentMethodId: data.paymentMethodId,
      memberId: data.memberId,
      costCenterId: data.costCenterId || "",
      installment: installmentLabel,
      status: data.paidDate ? "paid" : "pending",
    }
    if (id) {
      await update(id, payload)
    } else {
      await create(payload)
    }
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">Controle todas as suas saídas financeiras.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button onClick={() => { setEditingId(null); setOpen(true) }} />}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova despesa
          </DialogTrigger>
          <ExpenseForm
            editingId={editingId}
            categories={categories || []}
            accounts={accounts || []}
            creditCards={creditCards || []}
            paymentMethods={paymentMethods || []}
            members={members || []}
            costCenters={costCenters || []}
            onSave={handleSave}
          />
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total do mês</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-red-600">R$ {totalThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">{monthKey}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Pago</span>
            <p className="mt-1 text-xl font-bold">R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Pendente</span>
            <p className="mt-1 text-xl font-bold text-yellow-600">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Lançamentos</span>
            <p className="mt-1 text-xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MonthPicker month={month} year={year} onChange={onMonthChange} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar despesas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><button onClick={() => toggleSort("paidDate")} className="flex items-center gap-1">Data <ArrowUpDown className="h-3 w-3" /></button></TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right"><button onClick={() => toggleSort("amount")} className="flex items-center gap-1 ml-auto">Valor <ArrowUpDown className="h-3 w-3" /></button></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada.</TableCell>
              </TableRow>
            ) : (
              filtered.map((expense) => {
                const paymentLabel = `${paymentMethodMap[expense.paymentMethodId] || expense.paymentMethodId} • ${expense.accountId ? (accountMap[expense.accountId] || expense.accountId) : (creditCardMap[expense.creditCardId] || expense.creditCardId)}`
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="text-muted-foreground">{expense.paidDate ? new Date(expense.paidDate).toLocaleDateString("pt-BR") : new Date(expense.competenceDate).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <span className="flex items-center gap-1">
                        {expense.description}
                        {expense.sourceType === "recurring_bill" && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 font-normal text-orange-600 border-orange-200 cursor-pointer" onClick={() => router.push("/contas-recorrentes")}>
                            <Repeat className="h-2.5 w-2.5" />Recorrente
                          </Badge>
                        )}
                        {expense.sourceType === "invoice" && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 font-normal text-blue-600 border-blue-200 cursor-pointer" onClick={() => router.push("/faturas")}>
                            <ExternalLink className="h-2.5 w-2.5" />Fatura
                          </Badge>
                        )}
                        {expense.installment && <span className="ml-1 text-xs text-muted-foreground">({expense.installment})</span>}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant="outline">{categoryMap[expense.categoryId] || expense.categoryId}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{paymentLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{memberMap[expense.memberId] || expense.memberId}</TableCell>
                    <TableCell className={cn("text-right font-medium tabular-nums text-red-600")}>
                      -R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.status === "paid" ? "default" : expense.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                        {expense.status === "paid" ? "Pago" : expense.status === "pending" ? "Pendente" : "Vencido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => { setEditingId(expense.id); setOpen(true) }}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => remove(expense.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {expenses.length} despesas</p>
    </div>
  )
}
