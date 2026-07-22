"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Lightbulb,
} from "lucide-react"
import { useApi } from "@/lib/use-api"

interface FixedIncome {
  id: string
  name: string
  amount: number
  active: boolean
}
interface RecurringBill {
  id: string
  name: string
  amount: number
  status: string
}

interface ProjectedMonth {
  month: string
  income: number
  expense: number
  balance: number
  cumulative: number
}

interface Scenario {
  id: string
  name: string
  description: string
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export default function ProjecaoFinanceiraPage() {
  const { data: fixedIncomes } = useApi<FixedIncome>("/api/fixed-incomes")
  const { data: recurringBills } = useApi<RecurringBill>("/api/recurring-bills")

  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const [scenarioForm, setScenarioForm] = useState({ name: "", description: "" })

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const projectedIncome = useMemo(() => {
    return fixedIncomes
      .filter((i) => i.active)
      .reduce((sum, i) => sum + Number(i.amount), 0)
  }, [fixedIncomes])

  const projectedExpense = useMemo(() => {
    return recurringBills
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + Number(b.amount), 0)
  }, [recurringBills])

  const projection: ProjectedMonth[] = useMemo(() => {
    const result: ProjectedMonth[] = []
    let cumulative = 0
    for (let m = 6; m < 12; m++) {
      const y = currentYear
      const balance = projectedIncome - projectedExpense
      cumulative += balance
      result.push({
        month: `${MONTHS[m]}/${String(y).slice(2)}`,
        income: projectedIncome,
        expense: projectedExpense,
        balance,
        cumulative,
      })
    }
    return result
  }, [projectedIncome, projectedExpense, currentYear])

  const totalIncome = projection.reduce((a, b) => a + b.income, 0)
  const totalExpense = projection.reduce((a, b) => a + b.expense, 0)
  const finalBalance = projection[projection.length - 1]?.cumulative || 0
  const maxCumulative = Math.max(...projection.map((p) => p.cumulative), 1)
  const positiveMonths = projection.filter((p) => p.balance >= 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projeção Financeira</h1>
          <p className="text-muted-foreground">
            Visualize o saldo futuro com base em receitas fixas e contas recorrentes.
          </p>
        </div>
        <Dialog open={scenarioOpen} onOpenChange={setScenarioOpen}>
          <DialogTrigger render={<Button variant="outline" />}>
            <Lightbulb className="mr-2 h-4 w-4" /> Nova simulação
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova simulação</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={scenarioForm.name} onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })} placeholder="Ex: Comprar carro" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={scenarioForm.description} onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })} placeholder="Descreva o cenário" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={() => { setScenarios((prev) => [...prev, { id: crypto.randomUUID(), ...scenarioForm }]); setScenarioForm({ name: "", description: "" }); setScenarioOpen(false) }}>
                Criar simulação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Saldo em 6 meses</span>
            <p className={cn("mt-1 text-xl font-bold", finalBalance >= 0 ? "text-green-600" : "text-red-600")}>
              R$ {finalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Receitas previstas</span>
            <p className="mt-1 text-xl font-bold text-green-600">R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Despesas previstas</span>
            <p className="mt-1 text-xl font-bold text-red-600">R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Meses positivos</span>
            <p className="mt-1 text-xl font-bold text-green-600">{positiveMonths}/{projection.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Média mensal</span>
            <p className="mt-1 text-xl font-bold">
              R$ {(projectedIncome - projectedExpense).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projeção — Próximos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projection.map((p) => {
              const cumWidth = (p.cumulative / maxCumulative) * 100
              return (
                <div key={p.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-16">{p.month}</span>
                    <div className="flex items-center gap-3 flex-1 justify-center">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="tabular-nums">R$ {p.income.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        <span className="tabular-nums">R$ {p.expense.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                    <span className={cn("font-bold tabular-nums w-28 text-right", p.balance >= 0 ? "text-green-600" : "text-red-600")}>
                      {p.balance >= 0 ? "+" : ""}R$ {p.balance.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-6 rounded-md bg-muted overflow-hidden relative">
                    <div
                      className={cn("h-full rounded-md transition-all", p.cumulative >= 0 ? "bg-green-500/80" : "bg-red-500/80")}
                      style={{ width: `${Math.abs(cumWidth)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/80">
                      Saldo acumulado: R$ {p.cumulative.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulações</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma simulação criada ainda.</p>
              <p className="text-xs mt-1">Crie cenários como &quot;Comprar um carro&quot; ou &quot;Aumentar investimentos&quot; sem alterar dados reais.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setScenarioOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Criar simulação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <Badge variant="outline">Simulação</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
