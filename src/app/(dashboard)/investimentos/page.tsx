"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, LineChart, ChartCard } from "@/components/charts";
import {
  Plus,
  PiggyBank,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

type InvestmentType = "treasury" | "cdb" | "stock" | "fii" | "etf" | "crypto" | "pension";

interface Investment {
  id: string;
  type: InvestmentType;
  name: string;
  amount: number;
  profitability: number;
  member: string;
}

const typeColors: Record<InvestmentType, string> = {
  treasury: "#3b82f6",
  cdb: "#22c55e",
  stock: "#8b5cf6",
  fii: "#eab308",
  etf: "#06b6d4",
  crypto: "#f97316",
  pension: "#6b7280",
};

const typeConfig: Record<InvestmentType, { label: string; color: string }> = {
  treasury: { label: "Tesouro", color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
  cdb: { label: "CDB", color: "text-green-600 bg-green-50 dark:bg-green-950" },
  stock: { label: "Ação", color: "text-purple-600 bg-purple-50 dark:bg-purple-950" },
  fii: { label: "FII", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
  etf: { label: "ETF", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950" },
  crypto: { label: "Cripto", color: "text-orange-600 bg-orange-50 dark:bg-orange-950" },
  pension: { label: "Previdência", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950" },
};

const members = ["Carlos", "Maria", "João"];

export default function InvestimentosPage() {
  const { data: investments, loading, error, create, update, remove } = useApi<Investment>('/api/investments');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "cdb" as InvestmentType, name: "", amount: "", profitability: "0", member: members[0] });

  const totalAmount = investments.reduce((a, b) => a + b.amount, 0);
  const avgProfit = investments.length > 0 ? investments.reduce((a, b) => a + b.profitability, 0) / investments.length : 0;

  function resetForm() {
    setForm({ type: "cdb", name: "", amount: "", profitability: "0", member: members[0] });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(inv: Investment) {
    setEditingId(inv.id);
    setForm({ type: inv.type, name: inv.name, amount: String(inv.amount), profitability: String(inv.profitability), member: inv.member });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.amount) return;
    const inv: Investment = {
      id: editingId || crypto.randomUUID(),
      type: form.type,
      name: form.name,
      amount: Number(form.amount),
      profitability: Number(form.profitability) || 0,
      member: form.member,
    };
    if (editingId) update(editingId, inv);
    else create(inv);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe seus ativos e rentabilidade.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo ativo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} ativo</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as InvestmentType })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Tesouro Selic 2028" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor aplicado (R$)</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Rentabilidade (%)</Label>
                  <Input type="number" step="0.01" value={form.profitability} onChange={(e) => setForm({ ...form, profitability: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.member} onValueChange={(v) => v && setForm({ ...form, member: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Patrimônio</span>
              <PiggyBank className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Ativos</span>
            <p className="mt-1 text-2xl font-bold">{investments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Rent. média</span>
            <p className={cn("mt-1 text-2xl font-bold", avgProfit >= 0 ? "text-green-600" : "text-red-600")}>
              {avgProfit >= 0 ? "+" : ""}{avgProfit.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Tipos</span>
            <p className="mt-1 text-2xl font-bold">{new Set(investments.map((i) => i.type)).size}</p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {/* Distribuição por tipo */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="🥧 Distribuição por Tipo">
          <PieChart
            data={(() => {
              const byType: Record<string, { name: string; value: number; color: string }> = {};
              investments.forEach((inv) => {
                const t = typeConfig[inv.type];
                if (byType[inv.type]) byType[inv.type].value += inv.amount;
                else byType[inv.type] = { name: t.label, value: inv.amount, color: typeColors[inv.type] };
              });
              return Object.entries(byType).map(([key, val]) => ({ key, ...val }));
            })()}
            height={280}
            donut
            formatValue={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          />
        </ChartCard>
        <ChartCard title="📈 Rentabilidade por Ativo">
          <LineChart
            data={investments.map((inv) => ({
              name: inv.name,
              rentabilidade: inv.profitability,
            }))}
            xKey="name"
            series={[{ key: "rentabilidade", name: "Rentabilidade (%)", color: "#22c55e" }]}
            height={280}
            formatValue={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {investments.map((inv) => {
          const profitAmount = inv.amount * (inv.profitability / 100);
          return (
            <Card key={inv.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeConfig[inv.type].color)}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{inv.name}</p>
                      <Badge variant="outline" className={cn("text-xs mt-0.5", typeConfig[inv.type].color)}>
                        {typeConfig[inv.type].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(inv)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(inv.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-xl font-bold">R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{inv.member}</span>
                  <span className={cn("font-medium", inv.profitability >= 0 ? "text-green-600" : "text-red-600")}>
                    {inv.profitability >= 0 ? "+" : ""}{inv.profitability}% ({profitAmount >= 0 ? "+" : ""}R$ {profitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
