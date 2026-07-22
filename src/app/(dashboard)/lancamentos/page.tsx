"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  PiggyBank,
  HandCoins,
  Wallet,
  Trash2,
  ExternalLink,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "adjustment"
  | "investment"
  | "debt_payment";

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  categoryId: string;
  description: string;
  account: string;
  accountId: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
  member: string;
  memberId: string;
  sourceType: string;
  sourceId: string;
}

const typeConfig: Record<TransactionType, { label: string; icon: typeof ArrowUpRight; color: string }> = {
  income: { label: "Receita", icon: ArrowUpRight, color: "text-green-600 bg-green-50 dark:bg-green-950" },
  expense: { label: "Despesa", icon: ArrowDownRight, color: "text-red-600 bg-red-50 dark:bg-red-950" },
  transfer: { label: "Transferência", icon: ArrowLeftRight, color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
  adjustment: { label: "Ajuste", icon: Wallet, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
  investment: { label: "Investimento", icon: PiggyBank, color: "text-purple-600 bg-purple-50 dark:bg-purple-950" },
  debt_payment: { label: "Dívida", icon: HandCoins, color: "text-orange-600 bg-orange-50 dark:bg-orange-950" },
};

type SortField = "date" | "amount";
type SortDir = "asc" | "desc";

export default function LancamentosPage() {
  const router = useRouter();
  const { data: transactions, loading, error, create } = useApi<Transaction>('/api/transactions');
  const { data: categories } = useApi<{ id: string; name: string; type: string }>('/api/categories');
  const { data: accounts } = useApi<{ id: string; bank: string }>('/api/bank-accounts');
  const { data: members } = useApi<{ id: string; name: string }>('/api/family-members');

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [open, setOpen] = useState(false);

  const [newType, setNewType] = useState("expense");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const filtered = useMemo(() => {
    let data = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") data = data.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") data = data.filter((t) => t.status === statusFilter);
    if (memberFilter !== "all") data = data.filter((t) => t.member === memberFilter);

    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return mul * (a.amount - b.amount);
    });

    return data;
  }, [transactions, search, typeFilter, statusFilter, memberFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }

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

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  const memberOptions = [...new Set(transactions.map((t) => t.member))];

  const availableCategories = useMemo(
    () => (categories || []).filter((c) => newType === "income" ? c.type === "income" : c.type === "expense"),
    [categories, newType]
  );

  async function handleCreate() {
    try {
      const endpoint = newType === "income" ? "/api/incomes" : "/api/expenses";
      const payload: Record<string, unknown> = {
        description: newDescription,
        categoryId: newCategoryId,
        accountId: newType === "income" ? newAccountId : newAccountId,
        memberId: newMemberId,
        amount: Number(newAmount),
        competenceDate: newDate,
        receivedDate: newType === "income" ? newDate : undefined,
        paidDate: newType !== "income" ? newDate : undefined,
        recurring: false,
      };
      const auth = (await import("@/lib/firebase/auth")).auth;
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao criar");
      setOpen(false);
      resetForm();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao criar");
    }
  }

  function resetForm() {
    setNewType("expense");
    setNewCategoryId("");
    setNewAccountId("");
    setNewMemberId("");
    setNewDescription("");
    setNewAmount("");
    setNewDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground">
            Todas as movimentações financeiras em um só lugar.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={resetForm} />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo lançamento
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo lançamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={(v) => v && setNewType(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input placeholder="Descrição" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newCategoryId} onValueChange={(v) => v && setNewCategoryId(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={newAccountId} onValueChange={(v) => v && setNewAccountId(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(accounts || []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={newMemberId} onValueChange={(v) => v && setNewMemberId(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(members || []).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receitas</span>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Despesas</span>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-red-600">
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
            <p
              className={cn(
                "mt-1 text-xl font-bold",
                totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              R$ {(totalIncome - totalExpense).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lançamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="transfer">Transferências</SelectItem>
            <SelectItem value="adjustment">Ajustes</SelectItem>
            <SelectItem value="investment">Investimentos</SelectItem>
            <SelectItem value="debt_payment">Dívidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={memberFilter} onValueChange={(v) => v && setMemberFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {memberOptions.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button onClick={() => toggleSort("date")} className="flex items-center gap-1">
                  Data
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggleSort("amount")} className="flex items-center gap-1 ml-auto">
                  Valor
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const config = typeConfig[t.type];
                const Icon = config.icon;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1 font-normal", config.color)}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <span className="flex items-center gap-1">
                        {t.description}
                        {t.sourceType === "fixed_income" && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 font-normal text-green-600 border-green-200 cursor-pointer" onClick={() => router.push("/receitas-fixas")}>
                            <Repeat className="h-2.5 w-2.5" />Fixa
                          </Badge>
                        )}
                        {t.sourceType === "recurring_bill" && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 font-normal text-orange-600 border-orange-200 cursor-pointer" onClick={() => router.push("/contas-recorrentes")}>
                            <Repeat className="h-2.5 w-2.5" />Recorrente
                          </Badge>
                        )}
                        {t.sourceType === "invoice" && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 font-normal text-blue-600 border-blue-200 cursor-pointer" onClick={() => router.push("/faturas")}>
                            <ExternalLink className="h-2.5 w-2.5" />Fatura
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.account}</TableCell>
                    <TableCell className="text-muted-foreground">{t.member}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        t.type === "income" && "text-green-600",
                        t.type === "expense" && "text-red-600"
                      )}
                    >
                      {t.type === "expense" || t.type === "debt_payment" ? "-" : "+"}R${" "}
                      {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "confirmed"
                            ? "default"
                            : t.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {t.status === "confirmed" ? "Confirmado" : t.status === "pending" ? "Pendente" : "Cancelado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-xs">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {transactions.length} lançamentos
      </p>
    </div>
  );
}
