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
import { Plus, HandCoins, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

type DebtType = "loan" | "financing" | "installment";

interface Debt {
  id: string;
  type: DebtType;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  installmentsTotal: number;
  installmentsRemaining: number;
  member: string;
}

const typeConfig: Record<DebtType, { label: string }> = {
  loan: { label: "Empréstimo" },
  financing: { label: "Financiamento" },
  installment: { label: "Parcelamento" },
};

const members = ["Carlos", "Maria", "João"];

export default function DividasPage() {
  const { data: debts, loading, error, create, update, remove } = useApi<Debt>('/api/debts');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "loan" as DebtType, description: "", totalAmount: "", remainingAmount: "",
    interestRate: "0", installmentsTotal: "1", installmentsRemaining: "1", member: members[0],
  });

  const totalRemaining = debts.reduce((a, b) => a + b.remainingAmount, 0);
  const totalOriginal = debts.reduce((a, b) => a + b.totalAmount, 0);
  const totalPaid = totalOriginal - totalRemaining;
  const pctPaid = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 0;

  function resetForm() {
    setForm({ type: "loan", description: "", totalAmount: "", remainingAmount: "", interestRate: "0", installmentsTotal: "1", installmentsRemaining: "1", member: members[0] });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(debt: Debt) {
    setEditingId(debt.id);
    setForm({
      type: debt.type, description: debt.description, totalAmount: String(debt.totalAmount),
      remainingAmount: String(debt.remainingAmount), interestRate: String(debt.interestRate),
      installmentsTotal: String(debt.installmentsTotal), installmentsRemaining: String(debt.installmentsRemaining),
      member: debt.member,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.description || !form.totalAmount) return;
    const debt: Debt = {
      id: editingId || crypto.randomUUID(),
      type: form.type, description: form.description,
      totalAmount: Number(form.totalAmount), remainingAmount: Number(form.remainingAmount) || 0,
      interestRate: Number(form.interestRate) || 0,
      installmentsTotal: Number(form.installmentsTotal) || 1,
      installmentsRemaining: Number(form.installmentsRemaining) || 1,
      member: form.member,
    };
    if (editingId) update(editingId, debt);
    else create(debt);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dívidas</h1>
          <p className="text-muted-foreground">Controle empréstimos, financiamentos e parcelamentos.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Nova dívida
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Nova"} dívida</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Financiamento Imóvel" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as DebtType })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Empréstimo</SelectItem>
                    <SelectItem value="financing">Financiamento</SelectItem>
                    <SelectItem value="installment">Parcelamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Taxa de juros (%)</Label>
                <Input type="number" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor total (R$)</Label>
                <Input type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Saldo devedor (R$)</Label>
                <Input type="number" step="0.01" value={form.remainingAmount} onChange={(e) => setForm({ ...form, remainingAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Total parcelas</Label>
                <Input type="number" value={form.installmentsTotal} onChange={(e) => setForm({ ...form, installmentsTotal: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Parcelas restantes</Label>
                <Input type="number" value={form.installmentsRemaining} onChange={(e) => setForm({ ...form, installmentsRemaining: e.target.value })} />
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
            <span className="text-sm text-muted-foreground">Saldo devedor</span>
            <p className="mt-1 text-2xl font-bold text-red-600">R$ {totalRemaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total original</span>
            <p className="mt-1 text-2xl font-bold">R$ {totalOriginal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Já pago</span>
            <p className="mt-1 text-2xl font-bold text-green-600">R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Quitado</span>
            <p className="mt-1 text-2xl font-bold">{pctPaid}%</p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="space-y-4">
        {debts.map((debt) => {
          const progress = debt.totalAmount > 0 ? Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100) : 0;
          const installmentValue = debt.installmentsRemaining > 0 ? debt.remainingAmount / debt.installmentsRemaining : 0;
          return (
            <Card key={debt.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                      <HandCoins className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{debt.description}</p>
                      <Badge variant="outline" className="text-xs">{typeConfig[debt.type].label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(debt)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(debt.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Saldo devedor</span>
                    <p className="font-bold text-red-600">R$ {debt.remainingAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parcela</span>
                    <p className="font-medium">R$ {installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progresso</span>
                    <p className="font-medium">{debt.installmentsTotal - debt.installmentsRemaining}/{debt.installmentsTotal}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Juros</span>
                    <p className="font-medium">{debt.interestRate}% a.m.</p>
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{debt.member}</span>
                  <span>{debt.installmentsRemaining} parcelas restantes</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
