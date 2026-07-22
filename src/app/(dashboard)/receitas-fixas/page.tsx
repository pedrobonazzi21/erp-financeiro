"use client"

import { useState, useMemo } from "react"
import { useApi } from "@/lib/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Pencil,
  Trash2,
  Repeat,
  Search,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FixedIncome {
  id: string
  name: string
  amount: number
  categoryId: string
  accountId: string
  memberId: string
  dueDay: number | null
  frequency: string
  startDate: string | null
  endDate: string | null
  description: string | null
  active: boolean
}

interface Category { id: string; name: string; type: "income" | "expense" }
interface BankAccount { id: string; bank: string }
interface FamilyMember { id: string; name: string }

export default function ReceitasFixasPage() {
  const { data: incomes, loading, error, create, update, remove } = useApi<FixedIncome>("/api/fixed-incomes")
  const { data: categories } = useApi<Category>("/api/categories")
  const { data: accounts } = useApi<BankAccount>("/api/bank-accounts")
  const { data: members } = useApi<FamilyMember>("/api/family-members")

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    name: "",
    amount: "",
    categoryId: "",
    accountId: "",
    memberId: "",
    dueDay: "",
    frequency: "monthly",
    startDate: "",
    endDate: "",
    description: "",
  })

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(categories || []).forEach((c) => { map[c.id] = c.name })
    return map
  }, [categories])

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(accounts || []).forEach((a) => { map[a.id] = a.bank })
    return map
  }, [accounts])

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(members || []).forEach((m) => { map[m.id] = m.name })
    return map
  }, [members])

  const frequencyLabels: Record<string, string> = {
    weekly: "Semanal",
    monthly: "Mensal",
    bimonthly: "Bimestral",
    quarterly: "Trimestral",
    yearly: "Anual",
  }

  const filtered = useMemo(() => {
    if (!search) return incomes
    const q = search.toLowerCase()
    return incomes.filter((i) => i.name.toLowerCase().includes(q))
  }, [incomes, search])

  const totalMonthly = incomes
    .filter((i) => i.active)
    .reduce((a, b) => a + b.amount, 0)

  function resetForm() {
    setForm({
      name: "",
      amount: "",
      categoryId: categories?.[0]?.id || "",
      accountId: accounts?.[0]?.id || "",
      memberId: members?.[0]?.id || "",
      dueDay: "",
      frequency: "monthly",
      startDate: "",
      endDate: "",
      description: "",
    })
    setEditingId(null)
    setOpen(false)
  }

  function handleEdit(inc: FixedIncome) {
    setEditingId(inc.id)
    setForm({
      name: inc.name,
      amount: String(inc.amount),
      categoryId: inc.categoryId,
      accountId: inc.accountId,
      memberId: inc.memberId,
      dueDay: inc.dueDay ? String(inc.dueDay) : "",
      frequency: inc.frequency,
      startDate: inc.startDate ? inc.startDate.slice(0, 10) : "",
      endDate: inc.endDate ? inc.endDate.slice(0, 10) : "",
      description: inc.description || "",
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.amount || !form.categoryId || !form.accountId || !form.memberId) return
    const payload: Partial<FixedIncome> = {
      name: form.name.trim(),
      amount: Number(form.amount),
      categoryId: form.categoryId,
      accountId: form.accountId,
      memberId: form.memberId,
      dueDay: form.dueDay ? Number(form.dueDay) : null,
      frequency: form.frequency,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      description: form.description || null,
      active: true,
    }
    try {
      if (editingId) await update(editingId, payload)
      else await create(payload)
      resetForm()
    } catch {}
  }

  async function handleToggleActive(inc: FixedIncome) {
    try { await update(inc.id, { active: !inc.active }) } catch {}
  }

  async function handleDelete(id: string) {
    try { await remove(id) } catch {}
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas Fixas</h1>
          <p className="text-muted-foreground">Gerencie receitas recorrentes como salário, pensão, aluguel recebido.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o) }}>
          <DialogTrigger render={<Button onClick={() => resetForm()} />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova receita fixa
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} receita fixa</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Salário" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.type === "income").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
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
                <Label>Responsável</Label>
                <Select value={form.memberId} onValueChange={(v) => v && setForm({ ...form, memberId: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dia de vencimento</Label>
                <Input type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} placeholder="Ex: 5" />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={form.frequency} onValueChange={(v) => v && setForm({ ...form, frequency: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data de fim</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Observações..." />
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
              <span className="text-sm text-muted-foreground">Total mensal</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">
              R$ {totalMonthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Receitas fixas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Ativas</span>
            <p className="mt-1 text-xl font-bold">{incomes.filter((i) => i.active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Inativas</span>
            <p className="mt-1 text-xl font-bold text-muted-foreground">{incomes.filter((i) => !i.active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total cadastradas</span>
            <p className="mt-1 text-xl font-bold">{incomes.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar receitas fixas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhuma receita fixa encontrada.</TableCell>
              </TableRow>
            ) : (
              filtered.map((inc) => (
                <TableRow key={inc.id} className={!inc.active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-1">
                      <Repeat className="h-3 w-3 text-muted-foreground" />
                      {inc.name}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant="outline">{categoryMap[inc.categoryId] || inc.categoryId}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{accountMap[inc.accountId] || inc.accountId}</TableCell>
                  <TableCell>{inc.dueDay ? `Dia ${inc.dueDay}` : "-"}</TableCell>
                  <TableCell>{frequencyLabels[inc.frequency] || inc.frequency}</TableCell>
                  <TableCell className="text-muted-foreground">{memberMap[inc.memberId] || inc.memberId}</TableCell>
                  <TableCell className={cn("text-right font-medium tabular-nums text-green-600")}>
                    +R$ {inc.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleToggleActive(inc)} className="cursor-pointer">
                      <Badge variant={inc.active ? "default" : "secondary"} className="text-xs">
                        {inc.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(inc)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(inc.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {incomes.length} receitas fixas</p>
    </div>
  )
}
