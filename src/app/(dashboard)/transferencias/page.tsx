"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, ArrowLeftRight, Trash2 } from "lucide-react";
import { useApi } from "@/lib/use-api";

interface Transfer {
  id: string;
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  memberId: string;
}

interface BankAccount {
  id: string;
  bank: string;
}

interface FamilyMember {
  id: string;
  name: string;
}

export default function TransferenciasPage() {
  const { data: transfers, loading, error, create, remove } = useApi<Transfer>('/api/transfers');
  const { data: accounts } = useApi<BankAccount>('/api/bank-accounts');
  const { data: familyMembers } = useApi<FamilyMember>('/api/family-members');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], fromAccountId: accounts[0]?.id || "", toAccountId: accounts[1]?.id || "", amount: "", description: "", memberId: "" });

  const totalTransferred = transfers.reduce((a, b) => a + b.amount, 0);

  function getAccountName(id: string) {
    return accounts.find((a) => a.id === id)?.bank || id;
  }

  function getMemberName(id: string) {
    return familyMembers.find((m) => m.id === id)?.name || id;
  }

  function handleSave() {
    if (!form.amount || form.fromAccountId === form.toAccountId) return;
    create({ ...form, amount: Number(form.amount) });
    setForm({ date: new Date().toISOString().split("T")[0], fromAccountId: accounts[0]?.id || "", toAccountId: accounts[1]?.id || "", amount: "", description: "", memberId: familyMembers[0]?.id || "" });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transferências</h1>
          <p className="text-muted-foreground">Movimentações entre contas bancárias.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Nova transferência
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova transferência</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Da conta</Label>
                  <Select value={form.fromAccountId} onValueChange={(v) => v && setForm({ ...form, fromAccountId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Para conta</Label>
                  <Select value={form.toAccountId} onValueChange={(v) => v && setForm({ ...form, toAccountId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.filter((a) => a.id !== form.fromAccountId).map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Motivo da transferência" />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
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
              <Button onClick={handleSave}>Transferir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total transferido</span>
            <p className="mt-1 text-xl font-bold">R$ {totalTransferred.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Transferências</span>
            <p className="mt-1 text-xl font-bold">{transfers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Média por transferência</span>
            <p className="mt-1 text-xl font-bold">
              R$ {transfers.length > 0 ? (totalTransferred / transfers.length).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{getAccountName(t.fromAccountId)}</TableCell>
                <TableCell>{getAccountName(t.toAccountId)}</TableCell>
                <TableCell className="text-muted-foreground">{t.description}</TableCell>
                <TableCell className="text-muted-foreground">{getMemberName(t.memberId)}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-blue-600">
                  R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-xs" onClick={() => { try { remove(t.id); } catch {} }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
