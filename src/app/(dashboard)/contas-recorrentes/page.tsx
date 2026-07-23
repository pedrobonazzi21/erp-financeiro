"use client";

import { useState, useMemo } from "react";
import { useApi } from "@/lib/use-api";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Repeat,
  Pencil,
  Trash2,
  Pause,
  Play,
  Zap,
  Loader2,
} from "lucide-react";

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  accountId: string;
  memberId: string;
  dueDay: number;
  frequency: "monthly" | "weekly" | "yearly" | "bimonthly" | "quarterly";
  suspended: boolean;
  autoGenerate: boolean;
  startDate: string;
  endDate: string | null;
  nextGeneration: string;
}

const frequencies = [
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "bimonthly", label: "Bimestral" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

export default function ContasRecorrentesPage() {
  const { data: bills, loading, error, create, update, remove } = useApi<RecurringBill>('/api/recurring-bills');
  const { data: apiCategories } = useApi<{ id: string; name: string }>('/api/categories');
  const { data: apiAccounts } = useApi<{ id: string; bank: string }>('/api/bank-accounts');
  const { data: apiMembers } = useApi<{ id: string; name: string }>('/api/family-members');
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    (apiCategories || []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [apiCategories]);
  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    (apiAccounts || []).forEach((a) => { map[a.id] = a.bank; });
    return map;
  }, [apiAccounts]);
  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    (apiMembers || []).forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [apiMembers]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", amount: "", categoryId: apiCategories[0]?.id || "", accountId: apiAccounts[0]?.id || "", memberId: apiMembers[0]?.id || "", dueDay: "15", frequency: "monthly" as RecurringBill["frequency"], autoGenerate: true, startDate: new Date().toISOString().split("T")[0], endDate: "" });

  const totalMonthly = bills.filter((b) => b.frequency === "monthly" && !b.suspended).reduce((a, b) => a + Number(b.amount), 0);

  function resetForm() {
    setForm({ name: "", amount: "", categoryId: apiCategories[0]?.id || "", accountId: apiAccounts[0]?.id || "", memberId: apiMembers[0]?.id || "", dueDay: "15", frequency: "monthly", autoGenerate: true, startDate: new Date().toISOString().split("T")[0], endDate: "" });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(bill: RecurringBill) {
    setEditingId(bill.id);
    setForm({ name: bill.name, amount: String(bill.amount), categoryId: bill.categoryId, accountId: bill.accountId, memberId: bill.memberId, dueDay: String(bill.dueDay), frequency: bill.frequency, autoGenerate: bill.autoGenerate, startDate: bill.startDate, endDate: bill.endDate ? new Date(bill.endDate).toISOString().split("T")[0] : "" });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.amount) return;
    const payload = {
      name: form.name,
      amount: Number(form.amount),
      categoryId: form.categoryId,
      accountId: form.accountId,
      memberId: form.memberId,
      dueDay: Number(form.dueDay),
      frequency: form.frequency,
      autoGenerate: form.autoGenerate,
      startDate: form.startDate,
      endDate: form.endDate || null,
      suspended: false,
    };
    if (editingId) {
      update(editingId, payload);
    } else {
      create(payload);
    }
    resetForm();
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenResult(null);
    try {
      const { auth } = await import("@/lib/firebase/auth");
      const user = auth.currentUser;
      if (!user) { setGenResult("Usuário não autenticado"); return; }
      const token = await user.getIdToken();
      const res = await fetch("/api/generate-entries", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.generated) {
        setGenResult(`${data.generated.incomes} receitas e ${data.generated.expenses} despesas geradas`);
        if (data.generated.incomes > 0 || data.generated.expenses > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        setGenResult(data.error || "Erro ao gerar");
      }
    } catch (e) {
      setGenResult(e instanceof Error ? e.message : "Erro ao gerar");
    } finally {
      setGenerating(false);
    }
  }

  function toggleStatus(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (bill) update(id, { suspended: !bill.suspended });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas Recorrentes</h1>
          <p className="text-muted-foreground">Assinaturas e contas que se repetem automaticamente.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {generating ? "Gerando..." : "Gerar lançamentos"}
          </Button>
          {genResult && (
            <span className={`text-xs ${genResult.includes("Erro") ? "text-red-500" : "text-green-600"}`}>
              {genResult}
            </span>
          )}
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Nova conta recorrente
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Nova"} conta recorrente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Netflix" />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Dia vencimento</Label>
                <Select value={form.dueDay} onValueChange={(v) => v && setForm({ ...form, dueDay: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}º</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(apiCategories || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={form.frequency} onValueChange={(v) => v && setForm({ ...form, frequency: v as RecurringBill["frequency"] })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {frequencies.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={form.accountId} onValueChange={(v) => v && setForm({ ...form, accountId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(apiAccounts || []).map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(apiMembers || []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data final (opcional)</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="auto" checked={form.autoGenerate} onChange={(e) => setForm({ ...form, autoGenerate: e.target.checked })} className="h-4 w-4 rounded border-input" />
                <Label htmlFor="auto" className="text-sm">Gerar lançamento automaticamente</Label>
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
            <span className="text-sm text-muted-foreground">Contas ativas</span>
            <p className="mt-1 text-xl font-bold">{bills.filter((b) => !b.suspended).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Pausadas</span>
            <p className="mt-1 text-xl font-bold text-yellow-600">{bills.filter((b) => b.suspended).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total mensal</span>
            <p className="mt-1 text-xl font-bold">R$ {totalMonthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Próximas a gerar</span>
            <p className="mt-1 text-xl font-bold">{bills.filter((b) => !b.suspended).length}</p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Próxima geração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.name}</TableCell>
                <TableCell><Badge variant="outline">{categoryMap[bill.categoryId] || bill.categoryId}</Badge></TableCell>
                <TableCell className="tabular-nums">R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>Dia {bill.dueDay}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{frequencies.find((f) => f.value === bill.frequency)?.label}</TableCell>
                <TableCell className="text-muted-foreground">{accountMap[bill.accountId] || bill.accountId}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(bill.nextGeneration).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Badge variant={!bill.suspended ? "default" : "secondary"} className="text-xs">
                    {!bill.suspended ? "Ativa" : "Pausada"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => toggleStatus(bill.id)}>
                      {!bill.suspended ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(bill)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(bill.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
