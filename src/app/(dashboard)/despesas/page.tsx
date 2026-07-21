"use client";

import { useState, useMemo } from "react";
import { useApi } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  ArrowUpDown,
  TrendingDown,
  Pencil,
  Trash2,
  CreditCard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  description: string;
  categoryId: string;
  amount: number;
  competenceDate: string;
  paidDate: string;
  accountId: string;
  creditCardId: string;
  paymentMethodId: string;
  memberId: string;
  costCenterId: string;
  installment: string;
  status: "paid" | "pending" | "overdue";
}

interface Category { id: string; name: string; }
interface BankAccount { id: string; bank: string; }
interface CreditCard { id: string; name: string; }
interface PaymentMethod { id: string; name: string; }
interface FamilyMember { id: string; name: string; }
interface CostCenter { id: string; name: string; }

export default function DespesasPage() {
  const { data: expenses, loading, error, create, update, remove } = useApi<Expense>('/api/expenses');
  const { data: categories } = useApi<Category>('/api/categories');
  const { data: accounts } = useApi<BankAccount>('/api/bank-accounts');
  const { data: creditCards } = useApi<CreditCard>('/api/credit-cards');
  const { data: paymentMethods } = useApi<PaymentMethod>('/api/payment-methods');
  const { data: members } = useApi<FamilyMember>('/api/family-members');
  const { data: costCenters } = useApi<CostCenter>('/api/cost-centers');

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"competenceDate" | "amount">("competenceDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"account" | "credit">("account");

  const [form, setForm] = useState({
    description: "",
    categoryId: "",
    amount: "",
    competenceDate: "",
    paidDate: "",
    accountId: "",
    creditCardId: "",
    paymentMethodId: "",
    memberId: "",
    costCenterId: "",
    installments: "1",
  });

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    (categories || []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    (accounts || []).forEach((a) => { map[a.id] = a.bank; });
    return map;
  }, [accounts]);

  const creditCardMap = useMemo(() => {
    const map: Record<string, string> = {};
    (creditCards || []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [creditCards]);

  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {};
    (paymentMethods || []).forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [paymentMethods]);

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    (members || []).forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [members]);

  const costCenterMap = useMemo(() => {
    const map: Record<string, string> = {};
    (costCenters || []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [costCenters]);

  const filtered = useMemo(() => {
    let data = [...expenses];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((e) => {
        const catName = (categoryMap[e.categoryId] || "").toLowerCase();
        return e.description.toLowerCase().includes(q) || catName.includes(q);
      });
    }
    if (statusFilter !== "all") data = data.filter((e) => e.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "amount") return mul * (a.amount - b.amount);
      return mul * (new Date(a.competenceDate).getTime() - new Date(b.competenceDate).getTime());
    });
    return data;
  }, [expenses, search, statusFilter, sortField, sortDir, categoryMap]);

  const totalThisMonth = expenses
    .filter((e) => e.competenceDate.startsWith("2026-07"))
    .reduce((a, b) => a + b.amount, 0);

  const totalPaid = expenses.filter((e) => e.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalPending = expenses.filter((e) => e.status === "pending" || e.status === "overdue").reduce((a, b) => a + b.amount, 0);

  function toggleSort(field: "competenceDate" | "amount") {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function resetForm() {
    setForm({
      description: "",
      categoryId: categories[0]?.id || "",
      amount: "",
      competenceDate: "",
      paidDate: "",
      accountId: accounts[0]?.id || "",
      creditCardId: "",
      paymentMethodId: paymentMethods[0]?.id || "",
      memberId: members[0]?.id || "",
      costCenterId: "",
      installments: "1",
    });
    setEditingId(null);
    setPaymentType("account");
    setOpen(false);
  }

  function handleEdit(expense: Expense) {
    setEditingId(expense.id);
    const useCredit = !!expense.creditCardId;
    setPaymentType(useCredit ? "credit" : "account");
    setForm({
      description: expense.description,
      categoryId: expense.categoryId,
      amount: String(expense.amount),
      competenceDate: expense.competenceDate,
      paidDate: expense.paidDate,
      accountId: expense.accountId,
      creditCardId: expense.creditCardId,
      paymentMethodId: expense.paymentMethodId,
      memberId: expense.memberId,
      costCenterId: expense.costCenterId,
      installments: "1",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.description || !form.amount) return;
    const installmentLabel = Number(form.installments) > 1 ? `1/${form.installments}` : "";
    const payload: Partial<Expense> = {
      description: form.description,
      categoryId: form.categoryId,
      amount: Number(form.amount),
      competenceDate: form.competenceDate || new Date().toISOString().split("T")[0],
      paidDate: form.paidDate,
      accountId: paymentType === "account" ? form.accountId : "",
      creditCardId: paymentType === "credit" ? form.creditCardId : "",
      paymentMethodId: form.paymentMethodId,
      memberId: form.memberId,
      costCenterId: form.costCenterId,
      installment: installmentLabel,
      status: form.paidDate ? "paid" : "pending",
    };
    try {
      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      resetForm();
    } catch {}
  }

  async function handleDelete(id: string) {
    try { await remove(id); } catch {}
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
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova despesa
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} despesa</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Mercado" />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
              </div>

              <div className="space-y-2">
                <Label>Data de competência</Label>
                <Input type="date" value={form.competenceDate} onChange={(e) => setForm({ ...form, competenceDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data de pagamento</Label>
                <Input type="date" value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Select value={form.paymentMethodId} onValueChange={(v) => v && setForm({ ...form, paymentMethodId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pagamento via</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentType("account")}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg border p-2 text-xs ${paymentType === "account" ? "border-primary bg-primary/5" : "border-input"}`}
                  >
                    <Building2 className="h-3 w-3" /> Conta
                  </button>
                  <button
                    onClick={() => setPaymentType("credit")}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg border p-2 text-xs ${paymentType === "credit" ? "border-primary bg-primary/5" : "border-input"}`}
                  >
                    <CreditCard className="h-3 w-3" /> Cartão
                  </button>
                </div>
                {paymentType === "account" ? (
                  <Select value={form.accountId} onValueChange={(v) => v && setForm({ ...form, accountId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={form.creditCardId} onValueChange={(v) => v && setForm({ ...form, creditCardId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {creditCards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Select value={form.installments} onValueChange={(v) => v && setForm({ ...form, installments: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}x {n === 1 ? "(à vista)" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Centro de custo</Label>
                <Select value={form.costCenterId} onValueChange={(v) => v && setForm({ ...form, costCenterId: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {costCenters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">Rateio entre membros</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-1">
                      <input type="checkbox" className="h-3 w-3 rounded" /> {m.name}
                    </label>
                  ))}
                </div>
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
              <span className="text-sm text-muted-foreground">Total do mês</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-red-600">
              R$ {totalThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
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
              <TableHead><button onClick={() => toggleSort("competenceDate")} className="flex items-center gap-1">Competência <ArrowUpDown className="h-3 w-3" /></button></TableHead>
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
                const paymentLabel = `${paymentMethodMap[expense.paymentMethodId] || expense.paymentMethodId} • ${expense.accountId ? (accountMap[expense.accountId] || expense.accountId) : (creditCardMap[expense.creditCardId] || expense.creditCardId)}`;
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="text-muted-foreground">{new Date(expense.competenceDate).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description}
                      {expense.installment && <span className="ml-1 text-xs text-muted-foreground">({expense.installment})</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryMap[expense.categoryId] || expense.categoryId}</Badge>
                    </TableCell>
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
                        <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(expense)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(expense.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {expenses.length} despesas</p>
    </div>
  );
}
