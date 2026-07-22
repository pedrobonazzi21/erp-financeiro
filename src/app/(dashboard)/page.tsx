"use client";

import { useApi } from "@/lib/use-api";
import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentYear } from "@/components/month-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChartCard, BarChart, PieChart, AreaChart, LineChart } from "@/components/charts";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Target,
  ArrowUpRight, ArrowDownRight, Landmark, AlertTriangle, Clock,
  ShoppingCart, Home, Car, Heart, Zap, MoreHorizontal,
  Eye, EyeOff, Settings2, DollarSign, Calendar,
  Utensils, Gamepad2,
} from "lucide-react";

// ===== WIDGET CONFIG =====
interface WidgetDef {
  id: string;
  title: string;
  defaultEnabled: boolean;
}

const allWidgets: WidgetDef[] = [
  { id: "resumo", title: "Resumo Financeiro", defaultEnabled: true },
  { id: "receita-despesa", title: "Receita vs Despesa", defaultEnabled: true },
  { id: "contas-bancarias", title: "Contas Bancárias", defaultEnabled: true },
  { id: "cartoes", title: "Cartões", defaultEnabled: true },
  { id: "contas-vencer", title: "Contas a Vencer", defaultEnabled: true },
  { id: "ultimos-lancamentos", title: "Últimos Lançamentos", defaultEnabled: true },
  { id: "gastos-categoria", title: "Gastos por Categoria", defaultEnabled: true },
  { id: "metas", title: "Metas Financeiras", defaultEnabled: true },
  { id: "projecao", title: "Projeção Financeira", defaultEnabled: false },
  { id: "alertas", title: "Alertas", defaultEnabled: true },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ===== DASHBOARD =====
export default function DashboardPage() {
  const { data: incomes = [] } = useApi<{id:string; description:string; amount:number; competenceDate:string; categoryId:string; status:string}>('/api/incomes');
  const { data: expenses = [] } = useApi<{id:string; description:string; amount:number; competenceDate:string; categoryId:string; status:string; dueDate:string}>('/api/expenses');
  const { data: bankAccounts = [] } = useApi<{id:string; bank:string; balance:number}>('/api/bank-accounts');
  const { data: creditCards = [] } = useApi<{id:string; bankAccountId:string; creditLimit:number; currentInvoice:number; closingDay:number; dueDay:number}>('/api/credit-cards');
  const { data: recurringBills = [] } = useApi<{id:string; description:string; amount:number; dueDay:number; status:string}>('/api/recurring-bills');
  const { data: goals = [] } = useApi<{id:string; name:string; savedAmount:number; targetAmount:number; deadline:string}>('/api/goals');
  const { data: categories = [] } = useApi<{id:string; name:string; icon:string}>('/api/categories');

  const [chartYear, setChartYear] = useState(getCurrentYear());
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    import("@/lib/firebase/auth").then(({ auth }) => {
      if (auth.currentUser) {
        auth.currentUser.getIdToken().then((token) => {
          headers["Authorization"] = `Bearer ${token}`;
          fetch("/api/generate-entries", { headers }).catch(() => {});
        });
      }
    });
  }, []);

  const icons = [Utensils, Home, Car, Heart, Gamepad2, MoreHorizontal];

  const monthlyData = useMemo(() => {
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const data = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(chartYear, i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const monthIncomes = incomes
        .filter(inc => inc.competenceDate?.startsWith(monthKey))
        .reduce((s, inc) => s + Number(inc.amount), 0);
      const monthExpenses = expenses
        .filter(exp => exp.competenceDate?.startsWith(monthKey))
        .reduce((s, exp) => s + Number(exp.amount), 0);
      data.push({
        month: months[d.getMonth()],
        receitas: monthIncomes,
        despesas: monthExpenses,
        saldo: monthIncomes - monthExpenses,
      });
    }
    return data;
  }, [incomes, expenses, chartYear]);

  const mockMonthIncome = useMemo(
    () => incomes
      .filter(inc => inc.competenceDate?.startsWith(`${currentYear}-${String(currentMonth+1).padStart(2,'0')}`))
      .reduce((s, inc) => s + Number(inc.amount), 0),
    [incomes]
  );

  const mockMonthExpense = useMemo(
    () => expenses
      .filter(exp => exp.competenceDate?.startsWith(`${currentYear}-${String(currentMonth+1).padStart(2,'0')}`))
      .reduce((s, exp) => s + Number(exp.amount), 0),
    [expenses]
  );

  const mockBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + Number(a.balance), 0),
    [bankAccounts]
  );

  const mockNetWorth = mockBalance;

  const monthResult = mockMonthIncome - mockMonthExpense;

  const bankAccountsDisplay = useMemo(
    () => bankAccounts.map((a, i) => ({
      name: a.bank,
      balance: Number(a.balance),
      color: ['#820ad1','#ff7a00','#005ca9'][i % 3],
    })),
    [bankAccounts]
  );

  const creditCardsDisplay = useMemo(
    () => creditCards.map((c, i) => {
      const bank = bankAccounts.find(a => a.id === c.bankAccountId);
      return {
        name: bank?.bank || c.bankAccountId,
        used: Number(c.currentInvoice),
        limit: Number(c.creditLimit),
        closingDay: c.closingDay,
        dueDay: c.dueDay,
        color: ['#820ad1','#ff7a00','#005ca9'][i % 3],
      };
    }),
    [creditCards, bankAccounts]
  );

  const bills = useMemo(() => {
    const today = new Date();
    const fromRecurring = recurringBills.map(b => ({
      name: b.description,
      amount: Number(b.amount),
      daysUntilDue: b.dueDay - today.getDate(),
      color: (b.dueDay - today.getDate()) <= 1 ? 'red' as const : (b.dueDay - today.getDate()) <= 5 ? 'yellow' as const : 'green' as const,
    }));
    return fromRecurring.slice(0, 4);
  }, [recurringBills]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ type: 'expense' as const, description: e.description, amount: Number(e.amount), date: e.competenceDate ? new Date(e.competenceDate).toLocaleDateString('pt-BR') : '', time: '' })),
      ...incomes.map(i => ({ type: 'income' as const, description: i.description, amount: Number(i.amount), date: i.competenceDate ? new Date(i.competenceDate).toLocaleDateString('pt-BR') : '', time: '' })),
    ];
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [expenses, incomes]);

  const expensesByCategory = useMemo(() => {
    const catTotals: Record<string, number> = {};
    expenses.forEach(exp => {
      const catId = exp.categoryId || 'other';
      catTotals[catId] = (catTotals[catId] || 0) + Number(exp.amount);
    });
    const total = Object.values(catTotals).reduce((s, v) => s + v, 0);
    const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#6b7280'];
    return Object.entries(catTotals).map(([catId, amount], i) => ({
      name: categories.find(c => c.id === catId)?.name || catId,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      amount,
      icon: icons[Math.min(i, icons.length - 1)] as any,
      color: colors[i % colors.length],
    }));
  }, [expenses, categories]);

  const goalsDisplay = useMemo(() => {
    const goalColors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6'];
    return goals.map((g, i) => ({
      name: g.name,
      saved: Number(g.savedAmount),
      target: Number(g.targetAmount),
      deadline: g.deadline ? new Date(g.deadline).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '',
      color: goalColors[i % goalColors.length],
    }));
  }, [goals]);

  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'info'; text: string }[] = [];
    const today = new Date();
    const todayBills = recurringBills.filter(b => b.dueDay === today.getDate());
    todayBills.forEach(b => list.push({ type: 'warning' as const, text: `Conta de ${b.description} vence hoje.` }));
    return list.length > 0 ? list : [{ type: 'info' as const, text: 'Todas as contas em dia.' }, { type: 'info' as const, text: 'Nenhum alerta pendente.' }];
  }, [recurringBills]);

  const projection = useMemo(() => {
    if (monthlyData.length < 2) return [{ month: 'Janeiro', balance: 0 }];
    const last = monthlyData[monthlyData.length - 1]?.saldo || 0;
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return months.map((m, i) => ({
      month: m,
      balance: Math.max(0, last + (last * 0.05 * (i + 1))),
    }));
  }, [monthlyData]);

  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(
    allWidgets.filter((w) => w.defaultEnabled).map((w) => w.id)
  );
  const [showConfig, setShowConfig] = useState(false);

  // ===== WIDGET COMPONENTS =====
  function ResumoFinanceiro() {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">💰 Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className="text-lg font-bold">{formatCurrency(mockBalance)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Patrimônio Líquido</p>
              <p className="text-lg font-bold">{formatCurrency(mockNetWorth)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Receitas do Mês</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(mockMonthIncome)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Despesas do Mês</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(mockMonthExpense)}</p>
            </div>
            <div className={`rounded-lg p-3 ${monthResult >= 0 ? "bg-green-600/10" : "bg-red-600/10"}`}>
              <p className="text-xs text-muted-foreground">Resultado do Mês</p>
              <p className={`text-lg font-bold ${monthResult >= 0 ? "text-green-600" : "text-red-600"}`}>
                {monthResult >= 0 ? "+" : ""}{formatCurrency(monthResult)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function ReceitaDespesa() {
    const [chartType, setChartType] = useState<"stacked" | "line">("stacked");

    return (
      <ChartCard
        title="📈 Receita vs Despesa"
        periods={[
          { value: "stacked", label: "Barras" },
          { value: "line", label: "Linha" },
        ]}
        defaultPeriod="stacked"
        onPeriodChange={(v) => setChartType(v as "stacked" | "line")}
      >
        {chartType === "stacked" ? (
          <BarChart
            data={monthlyData}
            xKey="month"
            series={[
              { key: "receitas", name: "Receitas", color: "#22c55e" },
              { key: "despesas", name: "Despesas", color: "#ef4444" },
            ]}
            stacked
            formatValue={(v) => formatCurrency(v)}
          />
        ) : (
          <LineChart
            data={monthlyData}
            xKey="month"
            series={[
              { key: "receitas", name: "Receitas", color: "#22c55e" },
              { key: "despesas", name: "Despesas", color: "#ef4444" },
              { key: "saldo", name: "Saldo", color: "#3b82f6" },
            ]}
            formatValue={(v) => formatCurrency(v)}
          />
        )}
      </ChartCard>
    );
  }

  function ContasBancarias() {
    const total = bankAccountsDisplay.reduce((s, a) => s + a.balance, 0);
    return (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">🏦 Contas Bancárias</CardTitle>
          <span className="text-sm font-bold">{formatCurrency(total)}</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {bankAccountsDisplay.map((acc) => (
            <div key={acc.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                <span className="text-sm">{acc.name}</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(acc.balance)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  function CartoesWidget() {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">💳 Cartões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creditCardsDisplay.map((card) => {
            const pct = (card.used / card.limit) * 100;
            return (
              <div key={card.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{card.name}</span>
                  <span className="text-muted-foreground">{formatCurrency(card.used)} / {formatCurrency(card.limit)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: card.color }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>🔒 Fecha dia {card.closingDay}</span>
                  <span>📅 Vence dia {card.dueDay}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  function ContasVencer() {
    const priorityIcon = (color: string) => {
      if (color === "red") return <span className="text-red-500 text-xs font-bold">🔴</span>;
      if (color === "yellow") return <span className="text-yellow-500 text-xs font-bold">🟡</span>;
      return <span className="text-green-500 text-xs font-bold">🟢</span>;
    };
    const priorityLabel = (color: string, days: number) => {
      if (days === 0) return "Hoje";
      if (days === 1) return "Amanhã";
      return `Em ${days} dias`;
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📅 Contas a Vencer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bills.map((bill) => (
            <div key={bill.name} className="flex items-center justify-between rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                {priorityIcon(bill.color)}
                <div>
                  <p className="text-sm font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">{priorityLabel(bill.color, bill.daysUntilDue)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(bill.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  function UltimosLancamentos() {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📋 Últimos Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {t.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date} • {t.time}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  function GastosCategoria() {
    const total = expensesByCategory.reduce((s, c) => s + c.amount, 0);
    const slices = expensesByCategory.map((c) => ({
      key: c.name,
      name: c.name,
      value: c.amount,
      color: c.color,
    }));

    return (
      <ChartCard title="🥧 Gastos por Categoria">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="shrink-0">
            <PieChart data={slices} height={200} outerRadius={80} donut formatValue={(v) => formatCurrency(v)} />
          </div>
          <div className="flex-1 space-y-1.5 min-w-0 w-full">
            {expensesByCategory.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="font-medium">{cat.percent}%</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{formatCurrency(cat.amount)}</span>
                </div>
              );
            })}
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </ChartCard>
    );
  }

  function MetasFinanceiras() {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🎯 Metas Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goalsDisplay.map((goal) => {
            const pct = Math.round((goal.saved / goal.target) * 100);
            return (
              <div key={goal.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{goal.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatCurrency(goal.saved)} / {formatCurrency(goal.target)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{pct}% concluído</span>
                  <span className="text-muted-foreground">📅 Previsão: {goal.deadline}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  function ProjecaoFinanceira() {
    const minBalance = Math.min(...projection.map((p) => p.balance));
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🔮 Projeção Financeira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {projection.map((p) => {
              const isMin = p.balance === minBalance;
              return (
                <div key={p.month} className={`rounded-lg p-2 text-center ${isMin ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800" : "bg-muted/50"}`}>
                  <p className="text-xs text-muted-foreground">{p.month}</p>
                  <p className={`text-sm font-bold ${isMin ? "text-yellow-600" : ""}`}>{formatCurrency(p.balance)}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 space-y-1">
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
              ⚠ Agosto terá o menor saldo do trimestre.
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              Maior impacto: Seguro do caro • IPTU
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function AlertasWidget() {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🔔 Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border p-2.5">
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${alert.type === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
              <p className="text-sm">{alert.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const toggleWidget = (id: string) => {
    setEnabledWidgets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const orderedWidgets = useMemo(
    () => allWidgets.filter((w) => enabledWidgets.includes(w.id)),
    [enabledWidgets]
  );

  const renderWidget = (id: string) => {
    switch (id) {
      case "resumo": return <ResumoFinanceiro />;
      case "receita-despesa": return <ReceitaDespesa />;
      case "contas-bancarias": return <ContasBancarias />;
      case "cartoes": return <CartoesWidget />;
      case "contas-vencer": return <ContasVencer />;
      case "ultimos-lancamentos": return <UltimosLancamentos />;
      case "gastos-categoria": return <GastosCategoria />;
      case "metas": return <MetasFinanceiras />;
      case "projecao": return <ProjecaoFinanceira />;
      case "alertas": return <AlertasWidget />;
      default: return null;
    }
  };

  const getWidgetClass = (id: string) => {
    switch (id) {
      case "resumo": return "col-span-full";
      case "receita-despesa": return "lg:col-span-2";
      case "gastos-categoria": return "lg:col-span-2";
      case "projecao": return "lg:col-span-2";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(chartYear)}
            onValueChange={(v) => setChartYear(Number(v))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 8 }, (_, i) => getCurrentYear() - 5 + i).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Widgets
          </Button>
        </div>
      </div>

      {/* Widget config panel */}
      {showConfig && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Widgets visíveis</p>
            <div className="flex flex-wrap gap-2">
              {allWidgets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleWidget(w.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    enabledWidgets.includes(w.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {enabledWidgets.includes(w.id) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {w.title}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {orderedWidgets.map((w) => (
          <div key={w.id} className={getWidgetClass(w.id)}>
            {renderWidget(w.id)}
          </div>
        ))}
      </div>
    </div>
  );
}
