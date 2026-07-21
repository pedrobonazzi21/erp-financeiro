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
import { Plus, Pencil, Trash2, Wallet, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

interface BudgetItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

const currentMonth = 7;
const currentYear = 2026;

const fallbackCategories = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Assinaturas", "Impostos", "Pets", "Presentes"];

export default function OrcamentoPage() {
  const { data: budgets, loading, error, create, update, remove } = useApi<BudgetItem>('/api/budgets');
  const { data: apiCategories } = useApi<{ id: string; name: string }>('/api/categories');
  const categories = apiCategories.length > 0 ? apiCategories.map((c) => c.name) : fallbackCategories;
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: categories[0], limit: "" });

  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

  function resetForm() {
    setForm({ category: categories[0], limit: "" });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(item: BudgetItem) {
    setEditingId(item.id);
    setForm({ category: item.category, limit: String(item.limit) });
    setOpen(true);
  }

  function handleSave() {
    if (!form.limit) return;
    if (editingId) {
      update(editingId, { category: form.category, limit: Number(form.limit) });
    } else {
      create({ category: form.category, limit: Number(form.limit), spent: 0, month: currentMonth, year: currentYear });
    }
    resetForm();
  }

  const usageColor = (spent: number, limit: number) => {
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamento</h1>
          <p className="text-muted-foreground">Defina limites por categoria e acompanhe seus gastos.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo orçamento
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} orçamento</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => v && setForm({ ...form, category: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite mensal (R$)</Label>
                <Input type="number" step="0.01" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orçamento total</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">R$ {totalLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Gasto total</span>
            <p className="mt-1 text-2xl font-bold text-red-600">R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Restante</span>
            <p className={cn("mt-1 text-2xl font-bold", totalLimit - totalSpent >= 0 ? "text-green-600" : "text-red-600")}>
              R$ {(totalLimit - totalSpent).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="space-y-3">
        {budgets.map((item) => {
          const pct = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;
          const remaining = item.limit - item.spent;
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.category}</span>
                    {pct >= 80 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums">
                      <span className="text-red-600">R$ {item.spent.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span>R$ {item.limit.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                    </span>
                    <Badge variant={pct >= 80 ? "destructive" : pct >= 60 ? "secondary" : "outline"}>{pct}%</Badge>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(item.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", usageColor(item.spent, item.limit))} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {remaining >= 0 ? `Restam R$ ${remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : `Excedido em R$ ${Math.abs(remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
