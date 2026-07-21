"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, AreaChart } from "@/components/charts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "yearly";

interface FlowEntry {
  label: string;
  income: number;
  expense: number;
}

const monthlyData: FlowEntry[] = [
  { label: "Jan", income: 12200, expense: 5800 },
  { label: "Fev", income: 12200, expense: 6200 },
  { label: "Mar", income: 12200, expense: 5400 },
  { label: "Abr", income: 13500, expense: 6100 },
  { label: "Mai", income: 12200, expense: 5900 },
  { label: "Jun", income: 12200, expense: 5700 },
  { label: "Jul", income: 14700, expense: 5430 },
];

const weeklyData: FlowEntry[] = [
  { label: "Sem 1", income: 5200, expense: 1800 },
  { label: "Sem 2", income: 7000, expense: 2100 },
  { label: "Sem 3", income: 2500, expense: 980 },
  { label: "Sem 4", income: 0, expense: 550 },
];

const dailyData: FlowEntry[] = [
  { label: "01/07", income: 7000, expense: 0 },
  { label: "03/07", income: 0, expense: 580 },
  { label: "05/07", income: 0, expense: 2000 },
  { label: "08/07", income: 0, expense: 580 },
  { label: "10/07", income: 5200, expense: 180 },
  { label: "15/07", income: 0, expense: 55 },
  { label: "20/07", income: 2500, expense: 119 },
];

const yearlyData: FlowEntry[] = [
  { label: "2023", income: 125000, expense: 72000 },
  { label: "2024", income: 138000, expense: 75000 },
  { label: "2025", income: 142000, expense: 71000 },
  { label: "2026", income: 89000, expense: 42000 },
];

export default function FluxoCaixaPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [weekOffset, setWeekOffset] = useState(0);

  const data = period === "daily" ? dailyData : period === "weekly" ? weeklyData : period === "monthly" ? monthlyData : yearlyData;

  const totalIncome = data.reduce((a, b) => a + b.income, 0);
  const totalExpense = data.reduce((a, b) => a + b.expense, 0);
  const balance = totalIncome - totalExpense;
  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

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
            data={data.map((d) => ({ ...d, label: d.label }))}
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
  );
}
