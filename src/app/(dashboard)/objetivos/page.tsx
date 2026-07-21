"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  member: string;
}

const members = ["Carlos", "Maria", "João"];

export default function ObjetivosPage() {
  const { data: goals, loading, error, create, update, remove } = useApi<Goal>('/api/goals');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", target: "", saved: "0", deadline: "", member: members[0] });

  const totalSaved = goals.reduce((a, b) => a + b.saved, 0);
  const totalTarget = goals.reduce((a, b) => a + b.target, 0);

  function resetForm() {
    setForm({ name: "", target: "", saved: "0", deadline: "", member: members[0] });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(goal: Goal) {
    setEditingId(goal.id);
    setForm({ name: goal.name, target: String(goal.target), saved: String(goal.saved), deadline: goal.deadline, member: goal.member });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.target) return;
    const payload = {
      name: form.name,
      target: Number(form.target),
      saved: Number(form.saved) || 0,
      deadline: form.deadline,
      memberId: form.member,
    };
    if (editingId) update(editingId, payload);
    else create(payload);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
          <p className="text-muted-foreground">Defina metas financeiras e acompanhe seu progresso.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo objetivo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} objetivo</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Viagem" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor desejado (R$)</Label>
                  <Input type="number" step="0.01" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Já guardado (R$)</Label>
                  <Input type="number" step="0.01" value={form.saved} onChange={(e) => setForm({ ...form, saved: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.member} onValueChange={(v) => v && setForm({ ...form, member: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total guardado</span>
            <p className="mt-1 text-2xl font-bold text-green-600">R$ {totalSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Total desejado</span>
            <p className="mt-1 text-2xl font-bold">R$ {totalTarget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Progresso geral</span>
            <p className="mt-1 text-2xl font-bold">
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
          const remaining = goal.target - goal.saved;
          const monthsLeft = goal.deadline
            ? Math.max(1, Math.round((new Date(goal.deadline).getTime() - Date.now()) / (30 * 86400000)))
            : 0;
          const monthlyRecommend = monthsLeft > 0 ? remaining / monthsLeft : 0;
          return (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">Responsável: {goal.member}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(goal)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(goal.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>R$ {goal.saved.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                    <span className="text-muted-foreground">R$ {goal.target.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{pct}% concluído</Badge>
                  {goal.deadline && (
                    <span>
                      {monthsLeft} meses • R$ {monthlyRecommend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
