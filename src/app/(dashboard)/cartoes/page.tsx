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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  CreditCard,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

interface CreditCard {
  id: string;
  name: string;
  limit: number;
  used: number;
  bestDay: number;
  dueDay: number;
  closingDay: number;
  memberId: string;
  bankAccountId: string;
  currentInvoice: number;
}

interface FamilyMember {
  id: string;
  name: string;
}

interface BankAccount {
  id: string;
  bank: string;
}

export default function CartoesPage() {
  const { data: cards, loading, error, create, update, remove } = useApi<CreditCard>('/api/credit-cards');
  const { data: bankAccounts } = useApi<BankAccount>('/api/bank-accounts');
  const { data: familyMembers } = useApi<FamilyMember>('/api/family-members');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceCard, setInvoiceCard] = useState<CreditCard | null>(null);

  const [form, setForm] = useState({
    name: "",
    limit: "",
    bestDay: "1",
    dueDay: "15",
    closingDay: "1",
    memberId: "",
    bankAccountId: "",
  });

  function getBankAccountName(id: string) {
    return bankAccounts.find((b) => b.id === id)?.bank || id;
  }

  function getMemberName(id: string) {
    return familyMembers.find((m) => m.id === id)?.name || id;
  }

  function resetForm() {
    setForm({ name: "", limit: "", bestDay: "1", dueDay: "15", closingDay: "1", memberId: familyMembers[0]?.id || "", bankAccountId: bankAccounts[0]?.id || "" });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(card: CreditCard) {
    setEditingId(card.id);
    setForm({ name: card.name, limit: String(card.limit), bestDay: String(card.bestDay), dueDay: String(card.dueDay), closingDay: String(card.closingDay), memberId: card.memberId, bankAccountId: card.bankAccountId });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.limit) return;
    const payload = {
      name: form.name,
      limit: Number(form.limit),
      available: Number(form.limit),
      bestDay: Number(form.bestDay),
      dueDay: Number(form.dueDay),
      closingDay: Number(form.closingDay),
      memberId: form.memberId,
      bankAccountId: form.bankAccountId,
    };
    try {
      if (editingId) await update(editingId, payload);
      else await create(payload);
      resetForm();
    } catch {}
  }

  async function handleDelete(id: string) {
    try { await remove(id); } catch {}
  }

  return (
    <div className="space-y-6">
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Acompanhe faturas, limites e parcelamentos.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo cartão
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} cartão</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nubank" />
              </div>
              <div className="space-y-2">
                <Label>Limite (R$)</Label>
                <Input type="number" step="0.01" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Conta vinculada</Label>
                  <Select value={form.bankAccountId} onValueChange={(v) => v && setForm({ ...form, bankAccountId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label>Melhor dia</Label>
                <Select value={form.bestDay} onValueChange={(v) => v && setForm({ ...form, bestDay: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}º</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dia fechamento</Label>
                <Select value={form.closingDay} onValueChange={(v) => v && setForm({ ...form, closingDay: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}º</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Titular</Label>
                  <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const usagePercent = Math.round((card.used / card.limit) * 100);
          const available = card.limit - card.used;
          return (
            <Card key={card.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Fecha dia {card.closingDay} • Vence dia {card.dueDay}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{getMemberName(card.memberId)}</Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Limite</span>
                    <span className="font-medium">R$ {card.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilizado</span>
                    <span className="font-medium text-red-600">R$ {card.used.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Disponível</span>
                    <span className={cn("font-medium", available > 0 ? "text-green-600" : "text-red-600")}>
                      R$ {available.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", usagePercent > 80 ? "bg-red-500" : usagePercent > 60 ? "bg-yellow-500" : "bg-green-500")}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{usagePercent}% do limite</p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Fatura atual: <span className="text-red-600">R$ {card.used.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => { setInvoiceCard(card); setInvoiceOpen(true); }}>
                    <FileText className="mr-1 h-3 w-3" /> Fatura
                  </Button>
                </div>

                <div className="mt-2 flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(card)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(card.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fatura {invoiceCard?.name}</DialogTitle>
          </DialogHeader>
          {invoiceCard && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Fatura atual</span>
                <span className="font-bold text-lg text-red-600">
                  R$ {invoiceCard.used.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Vencimento</span>
                <span>Dia {invoiceCard.dueDay} de cada mês</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Limite disponível</span>
                <span className="text-green-600">
                  R$ {(invoiceCard.limit - invoiceCard.used).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>15/06</TableCell>
                    <TableCell>Netflix</TableCell>
                    <TableCell className="text-right">R$ 55,00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>20/06</TableCell>
                    <TableCell>Jantar</TableCell>
                    <TableCell className="text-right">R$ 320,00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>25/06</TableCell>
                    <TableCell>Curso online (1/6)</TableCell>
                    <TableCell className="text-right">R$ 75,00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Fechar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
