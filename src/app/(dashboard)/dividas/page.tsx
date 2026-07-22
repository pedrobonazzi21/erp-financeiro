"use client";

import { useState, useMemo } from "react";
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
import { Plus, HandCoins, Pencil, Trash2, ExternalLink } from "lucide-react";
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
  memberId: string;
  creditorName: string | null;
  forMemberIds: string[] | null;
}

interface FamilyMember {
  id: string;
  name: string;
}

const typeConfig: Record<DebtType, { label: string }> = {
  loan: { label: "Empréstimo" },
  financing: { label: "Financiamento" },
  installment: { label: "Parcelamento" },
};

export default function DividasPage() {
  const { data: debts, loading, error, create, update, remove } = useApi<Debt>('/api/debts');
  const { data: members } = useApi<FamilyMember>('/api/family-members');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "loan" as DebtType,
    description: "",
    totalAmount: "",
    remainingAmount: "",
    interestRate: "0",
    installmentsTotal: "1",
    installmentsRemaining: "1",
    memberId: "",
    creditorName: "",
    forMemberIds: [] as string[],
  });

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    (members || []).forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [members]);

  const totalRemaining = debts.reduce((a, b) => a + Number(b.remainingAmount), 0);
  const totalOriginal = debts.reduce((a, b) => a + Number(b.totalAmount), 0);
  const totalPaid = totalOriginal - totalRemaining;
  const pctPaid = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 0;

  function resetForm() {
    setForm({
      type: "loan", description: "", totalAmount: "", remainingAmount: "",
      interestRate: "0", installmentsTotal: "1", installmentsRemaining: "1",
      memberId: members?.[0]?.id || "", creditorName: "", forMemberIds: [],
    });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(debt: Debt) {
    setEditingId(debt.id);
    setForm({
      type: debt.type,
      description: debt.description,
      totalAmount: String(debt.totalAmount),
      remainingAmount: String(debt.remainingAmount),
      interestRate: String(debt.interestRate),
      installmentsTotal: String(debt.installmentsTotal),
      installmentsRemaining: String(debt.installmentsRemaining),
      memberId: debt.memberId,
      creditorName: debt.creditorName || "",
      forMemberIds: debt.forMemberIds || [],
    });
    setOpen(true);
  }

  function toggleForMember(id: string) {
    setForm((prev) => ({
      ...prev,
      forMemberIds: prev.forMemberIds.includes(id)
        ? prev.forMemberIds.filter((x) => x !== id)
        : [...prev.forMemberIds, id],
    }));
  }

  async function handleSave() {
    if (!form.description || !form.totalAmount || !form.memberId) return;
    const payload: Partial<Debt> = {
      type: form.type,
      description: form.description,
      totalAmount: Number(form.totalAmount),
      remainingAmount: Number(form.remainingAmount) || 0,
      interestRate: Number(form.interestRate) || 0,
      installmentsTotal: Number(form.installmentsTotal) || 1,
      installmentsRemaining: Number(form.installmentsRemaining) || 1,
      memberId: form.memberId,
      creditorName: form.creditorName || null,
      forMemberIds: form.forMemberIds.length > 0 ? form.forMemberIds : null,
    };
    try {
      if (editingId) await update(editingId, payload);
      else await create(payload);
      resetForm();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dívidas</h1>
          <p className="text-muted-foreground">Controle empréstimos, financiamentos e parcelamentos.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button onClick={resetForm} />}>
            <Plus className="mr-2 h-4 w-4" /> Nova dívida
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
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
                <Label>Credor (quem recebe)</Label>
                <Input value={form.creditorName} onChange={(e) => setForm({ ...form, creditorName: e.target.value })} placeholder="Ex: Banco XPTO, João" />
              </div>
              <div className="space-y-2">
                <Label>Quem paga</Label>
                <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(members || []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Para quem (responsáveis)</Label>
                <div className="flex flex-wrap gap-2">
                  {(members || []).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleForMember(m.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        form.forMemberIds.includes(m.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Selecione um ou mais membros responsáveis pela dívida.</p>
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

      <div className="space-y-4">
        {debts.map((debt) => {
          const progress = debt.totalAmount > 0 ? Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100) : 0;
          const installmentValue = debt.installmentsRemaining > 0 ? debt.remainingAmount / debt.installmentsRemaining : 0;
          const forNames = (debt.forMemberIds || [])
            .map((id) => memberMap[id])
            .filter(Boolean)
            .join(", ");
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
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-xs">{typeConfig[debt.type].label}</Badge>
                        {debt.creditorName && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <ExternalLink className="h-2.5 w-2.5" />{debt.creditorName}
                          </Badge>
                        )}
                      </div>
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
                    <p className="font-bold text-red-600">R$ {Number(debt.remainingAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
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
                <div className="mt-1 flex flex-wrap justify-between gap-1 text-xs text-muted-foreground">
                  <span>Pagador: {memberMap[debt.memberId] || debt.memberId}</span>
                  {forNames && <span>Para: {forNames}</span>}
                  <span>{debt.installmentsRemaining} parcela(s) restante(s)</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
