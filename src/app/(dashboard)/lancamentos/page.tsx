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
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  PiggyBank,
  HandCoins,
  Wallet,
  Trash2,
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
  description: string;
  account: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
  member: string;
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
  const { data: transactions, loading, error } = useApi<Transaction>('/api/transactions');
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [open, setOpen] = useState(false);

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

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  const members = [...new Set(transactions.map((t) => t.member))];

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
          <DialogTrigger render={<Button />}>
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
                <Select defaultValue="expense">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="debt_payment">Pagamento de dívida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input placeholder="Descrição do lançamento" />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button>Criar</Button>
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
            {members.map((m) => (
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
                    <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
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
