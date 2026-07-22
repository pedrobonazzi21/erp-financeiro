"use client"

import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "@/components/charts"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from "lucide-react"
import { useApi } from "@/lib/use-api"

type Period = "daily" | "weekly" | "monthly" | "yearly"

interface IncomeData {
  id: string
  amount: number
  competenceDate: string
}
interface ExpenseData {
  id: string
  amount: number
  competenceDate: string
}

function getPeriodLabel(date: Date, period: Period): string {
  if (period === "daily") return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  if (period === "weekly") {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
    return `Sem ${week}`
  }
  if (period === "monthly") return date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
  return String(date.getFullYear())
}

function getPeriodKey(date: Date, period: Period): string {
  if (period === "daily") return date.toISOString().slice(0, 10)
  if (period === "weekly") {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
    return `${date.getFullYear()}-W${week}`
  }
  if (period === "monthly") return `${date.getFullYear()}-${date.getMonth()}`
  return String(date.getFullYear())
}

export default function FluxoCaixaPage() {
  const [period, setPeriod] = useState<Period>("monthly")
  const { data: incomes } = useApi<IncomeData>("/api/incomes")
  const { data: expenses } = useApi<ExpenseData>("/api/expenses")

  const data = useMemo(() => {
    const groups: Record<string, { income: number; expense: number; label: string }> = {}

    incomes.forEach((inc) => {
      const d = new Date(inc.competenceDate)
      const key = getPeriodKey(d, period)
      if (!groups[key]) groups[key] = { income: 0, expense: 0, label: getPeriodLabel(d, period) }
      groups[key].income += Number(inc.amount)
    })

    expenses.forEach((exp) => {
      const d = new Date(exp.competenceDate)
      const key = getPeriodKey(d, period)
      if (!groups[key]) groups[key] = { income: 0, expense: 0, label: getPeriodLabel(d, period) }
      groups[key].expense += Number(exp.amount)
    })

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)
  }, [incomes, expenses, period])

  const totalIncome = data.reduce((a, b) => a + b.income, 0)
  const totalExpense = data.reduce((a, b) => a + b.expense, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Acompanhe entradas e saídas ao longo do tempo.</p>
        </div>
        <Select value={period} onValueChange={(v) => v && setPeriod(v as Period)}>
          <SelectTrigger className="w-[140px]">
            <CalendarDays className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entradas</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-green-600">
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saídas</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600">
              R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className={cn("mt-1 text-2xl font-bold", balance >= 0 ? "text-green-600" : "text-red-600")}>
              {balance >= 0 ? "+" : ""}R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Períodos</span>
            <p className="mt-1 text-2xl font-bold">{data.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {period === "daily" ? "Diário" : period === "weekly" ? "Semanal" : period === "monthly" ? "Mensal" : "Anual"}
          </CardTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded bg-green-500" /> Entradas</span>
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded bg-red-500" /> Saídas</span>
          </div>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data}
            xKey="label"
            series={[
              { key: "income", name: "Entradas", color: "#22c55e" },
              { key: "expense", name: "Saídas", color: "#ef4444" },
            ]}
            height={320}
            stacked
            formatValue={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
