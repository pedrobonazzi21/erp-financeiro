"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Plus,
  Building2,
  PiggyBank,
  Landmark,
  Pencil,
  Trash2,
  Upload,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

type AccountType = "checking" | "savings" | "investment";

interface BankAccount {
  id: string;
  bank: string;
  agency: string | null;
  account: string | null;
  type: AccountType;
  balance: number;
  overdraftLimit: number | null;
  pixKey: string | null;
  memberId: string;
  joint: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
}

interface Bank {
  id: string;
  name: string;
  code: string;
}

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Building2 }> = {
  checking: { label: "Corrente", icon: Building2 },
  savings: { label: "Poupança", icon: PiggyBank },
  investment: { label: "Investimento", icon: Landmark },
};

export default function ContasPage() {
  const { data: accounts, loading, error, create, update, remove } = useApi<BankAccount>('/api/bank-accounts');
  const { data: familyMembers } = useApi<FamilyMember>('/api/family-members');
  const { data: banks } = useApi<Bank>('/api/banks');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    bank: "",
    customBank: "",
    agency: "",
    account: "",
    type: "checking" as AccountType,
    balance: "",
    overdraftLimit: "",
    pix: "",
    memberId: "",
    joint: false,
  });

  const [importOpen, setImportOpen] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);

  const bankNames = banks.map((b) => b.name);
  const isCustomBank = form.bank === "__other__";

  useEffect(() => {
    if (banks.length > 0 && !form.bank) {
      setForm((prev) => ({ ...prev, bank: banks[0].name }));
    }
  }, [banks]);

  const totalBalance = accounts.reduce((a, b) => a + b.balance, 0);

  function getMemberName(id: string) {
    return familyMembers.find((m) => m.id === id)?.name || id;
  }

  function resetForm() {
    setForm({ bank: banks[0]?.name || "", customBank: "", agency: "", account: "", type: "checking", balance: "", overdraftLimit: "", pix: "", memberId: familyMembers[0]?.id || "", joint: false });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(acc: BankAccount) {
    const known = banks.find((b) => b.name === acc.bank);
    setEditingId(acc.id);
    setForm({
      bank: known ? acc.bank : "__other__",
      customBank: known ? "" : acc.bank,
      agency: acc.agency || "",
      account: acc.account || "",
      type: acc.type,
      balance: String(acc.balance),
      overdraftLimit: acc.overdraftLimit ? String(acc.overdraftLimit) : "",
      pix: acc.pixKey || "",
      memberId: acc.memberId,
      joint: acc.joint,
    });
    setOpen(true);
  }

  async function handleSave() {
    const resolvedBank = isCustomBank ? form.customBank.trim() : form.bank;
    if (!resolvedBank) return;
    const payload = {
      bank: resolvedBank,
      agency: form.agency || null,
      account: form.account || null,
      type: form.type,
      balance: Number(form.balance) || 0,
      overdraftLimit: form.overdraftLimit ? Number(form.overdraftLimit) : null,
      pixKey: form.pix || null,
      memberId: form.memberId,
      joint: form.joint,
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

  const byType = (type: AccountType) => accounts.filter((a) => a.type === type);

  return (
    <div className="space-y-6">
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas Bancárias</h1>
          <p className="text-muted-foreground">Gerencie suas contas e saldos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" /> Importar OFX</Button>
          <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Nova conta
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editingId ? "Editar" : "Nova"} conta bancária</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select value={form.bank} onValueChange={(v) => v && setForm({ ...form, bank: v })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione um banco" /></SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => <SelectItem key={b.id} value={b.name}>{b.name} {b.code ? `(${b.code})` : ""}</SelectItem>)}
                      <SelectItem value="__other__">Outro (digitar nome)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as AccountType })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isCustomBank && (
                  <div className="space-y-2 col-span-2">
                    <Label>Nome do banco</Label>
                    <Input value={form.customBank} onChange={(e) => setForm({ ...form, customBank: e.target.value })} placeholder="Digite o nome do banco" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Agência <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} placeholder="0000" />
                </div>
                <div className="space-y-2">
                  <Label>Conta <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} placeholder="00000-0" />
                </div>
                <div className="space-y-2">
                  <Label>Saldo inicial (R$)</Label>
                  <Input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Limite (R$) <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input type="number" step="0.01" value={form.overdraftLimit} onChange={(e) => setForm({ ...form, overdraftLimit: e.target.value })} placeholder="0,00" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Chave PIX <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input value={form.pix} onChange={(e) => setForm({ ...form, pix: e.target.value })} placeholder="CPF, e-mail, telefone ou chave aleatória" />
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.joint} onChange={(e) => setForm({ ...form, joint: e.target.checked })} className="h-4 w-4 rounded border-input" />
                    Conta conjunta
                  </label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo total</span>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Corrente</span>
            <p className="mt-1 text-xl font-bold">{byType("checking").length} contas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Poupança</span>
            <p className="mt-1 text-xl font-bold">{byType("savings").length} contas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Investimento</span>
            <p className="mt-1 text-xl font-bold">{byType("investment").length} contas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const TypeIcon = accountTypeConfig[acc.type].icon;
          return (
            <Card key={acc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{acc.bank}</p>
                      <p className="text-xs text-muted-foreground">
                        {accountTypeConfig[acc.type].label}
                        {acc.agency ? ` • Ag ${acc.agency}` : ""}
                        {acc.account ? ` • C/c ${acc.account}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{getMemberName(acc.memberId)}</Badge>
                </div>
                <p className={cn("mt-3 text-2xl font-bold", acc.balance >= 0 ? "text-green-600" : "text-red-600")}>
                  R$ {acc.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{acc.pixKey ? "PIX ✓" : "Sem PIX"}</span>
                  <div className="flex items-center gap-1">
                    {acc.joint && <Badge variant="secondary" className="text-[10px] px-1 py-0">Conjunta</Badge>}
                    {acc.overdraftLimit ? <span>Limite: R$ {Number(acc.overdraftLimit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> : null}
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  <Button variant="ghost" size="sm" className="flex-1"><Eye className="mr-1 h-3 w-3" />Extrato</Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(acc)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(acc.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar extrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Conta destino</Label>
              <Select defaultValue={accounts[0]?.id}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.bank}{a.account ? ` - ${a.account}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              onClick={() => document.getElementById("import-file-input")?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Selecione o arquivo OFX ou CSV</p>
              <p className="text-xs text-muted-foreground">Formatos aceitos: .ofx, .csv, .xlsx</p>
              <input
                id="import-file-input"
                type="file"
                accept=".ofx,.csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImportFiles([f]);
                }}
              />
            </div>
            {importFiles.length > 0 && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">{importFiles[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {(importFiles[0].size / 1024).toFixed(0)} KB — Pronto para importar
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Transações encontradas: <span className="font-medium text-foreground">12</span></p>
                  <p>Período: <span className="font-medium text-foreground">01/06/2026 a 30/06/2026</span></p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button disabled={importFiles.length === 0}>
              <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
