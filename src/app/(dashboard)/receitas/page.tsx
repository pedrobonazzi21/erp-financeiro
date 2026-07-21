"use client";

import { useState, useMemo } from "react";
import { useApi } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingUp,
  Pencil,
  Trash2,
  Repeat,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Income {
  id: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  amount: number;
  competenceDate: string;
  receivedDate: string;
  accountId: string;
  memberId: string;
  costCenterId: string;
  recurring: boolean;
  status: "received" | "pending" | "scheduled";
}

interface Category { id: string; name: string; }
interface BankAccount { id: string; bank: string; }
interface FamilyMember { id: string; name: string; }
interface CostCenter { id: string; name: string; }

const subcategories = ["Fixo", "Variável", "Desenvolvimento", "Dividendos", "Imóvel"];

export default function ReceitasPage() {
  const { data: incomes, loading, error, create, update, remove } = useApi<Income>('/api/incomes');
  const { data: categories } = useApi<Category>('/api/categories');
  const { data: accounts } = useApi<BankAccount>('/api/bank-accounts');
  const { data: members } = useApi<FamilyMember>('/api/family-members');
  const { data: costCenters } = useApi<CostCenter>('/api/cost-centers');

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"competenceDate" | "amount">("competenceDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: "",
    categoryId: "",
    subcategoryId: "",
    amount: "",
    competenceDate: "",
    receivedDate: "",
    accountId: "",
    memberId: "",
    costCenterId: "",
    recurring: false,
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
    let data = [...incomes];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((i) => {
        const catName = (categoryMap[i.categoryId] || "").toLowerCase();
        return i.description.toLowerCase().includes(q) || catName.includes(q);
      });
    }
    if (statusFilter !== "all") data = data.filter((i) => i.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "amount") return mul * (a.amount - b.amount);
      return mul * (new Date(a.competenceDate).getTime() - new Date(b.competenceDate).getTime());
    });
    return data;
  }, [incomes, search, statusFilter, sortField, sortDir, categoryMap]);

  const totalReceived = incomes.filter((i) => i.status === "received").reduce((a, b) => a + b.amount, 0);
  const totalPending = incomes.filter((i) => i.status === "pending").reduce((a, b) => a + b.amount, 0);

  function toggleSort(field: "competenceDate" | "amount") {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function resetForm() {
    setForm({
      description: "",
      categoryId: categories[0]?.id || "",
      subcategoryId: "",
      amount: "",
      competenceDate: "",
      receivedDate: "",
      accountId: accounts[0]?.id || "",
      memberId: members[0]?.id || "",
      costCenterId: "",
      recurring: false,
    });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(income: Income) {
    setEditingId(income.id);
    setForm({
      description: income.description,
      categoryId: income.categoryId,
      subcategoryId: income.subcategoryId,
      amount: String(income.amount),
      competenceDate: income.competenceDate,
      receivedDate: income.receivedDate,
      accountId: income.accountId,
      memberId: income.memberId,
      costCenterId: income.costCenterId,
      recurring: income.recurring,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.description || !form.amount) return;
    const payload: Partial<Income> = {
      description: form.description,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      amount: Number(form.amount),
      competenceDate: form.competenceDate || new Date().toISOString().split("T")[0],
      receivedDate: form.receivedDate,
      accountId: form.accountId,
      memberId: form.memberId,
      costCenterId: form.costCenterId,
      recurring: form.recurring,
      status: form.receivedDate ? "received" : form.competenceDate > new Date().toISOString().split("T")[0] ? "scheduled" : "pending",
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

  const totalThisMonth = incomes
    .filter((i) => i.competenceDate.startsWith("2026-07"))
    .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas entradas financeiras.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova receita
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} receita</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Salário mensal" />
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
                <Label>Subcategoria</Label>
                <Select value={form.subcategoryId} onValueChange={(v) => v && setForm({ ...form, subcategoryId: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {subcategories.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={form.accountId} onValueChange={(v) => v && setForm({ ...form, accountId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de competência</Label>
                <Input type="date" value={form.competenceDate} onChange={(e) => setForm({ ...form, competenceDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data de recebimento</Label>
                <Input type="date" value={form.receivedDate} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} />
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
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="recurring" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="h-4 w-4 rounded border-input" />
                <Label htmlFor="recurring" className="flex items-center gap-1 text-sm">
                  <Repeat className="h-3 w-3" /> Receita recorrente
                </Label>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Observações adicionais..." />
              </div>
              <div className="col-span-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="mr-2 h-4 w-4" /> Anexar comprovante
                </Button>
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
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">
              R$ {totalThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Recebido</span>
            <p className="mt-1 text-xl font-bold">R$ {totalReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
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
            <p className="mt-1 text-xl font-bold">{incomes.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar receitas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="received">Recebido</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
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
              <TableHead>Conta</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right"><button onClick={() => toggleSort("amount")} className="flex items-center gap-1 ml-auto">Valor <ArrowUpDown className="h-3 w-3" /></button></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</TableCell>
              </TableRow>
            ) : (
              filtered.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="text-muted-foreground">{new Date(income.competenceDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <span className="flex items-center gap-1">
                      {income.description}
                      {income.recurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryMap[income.categoryId] || income.categoryId}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{accountMap[income.accountId] || income.accountId}</TableCell>
                  <TableCell className="text-muted-foreground">{memberMap[income.memberId] || income.memberId}</TableCell>
                  <TableCell className={cn("text-right font-medium tabular-nums text-green-600")}>
                    +R$ {income.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={income.status === "received" ? "default" : income.status === "pending" ? "secondary" : "outline"} className="text-xs">
                      {income.status === "received" ? "Recebido" : income.status === "pending" ? "Pendente" : "Agendado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(income)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(income.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {incomes.length} receitas</p>
    </div>
  );
}
