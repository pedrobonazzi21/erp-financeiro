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
  Users,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";

type Profile = "adult" | "teen" | "child";

interface Member {
  id: string;
  name: string;
  photo: string;
  profile: Profile;
  income: number;
}

const profileConfig: Record<Profile, { label: string; color: string }> = {
  adult: { label: "Adulto", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  teen: { label: "Adolescente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  child: { label: "Criança", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

export default function FamiliaPage() {
  const { data: members, loading, error, create, update, remove } = useApi<Member>('/api/family-members');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", profile: "adult" as Profile, income: "" });

  const totalIncome = members.reduce((a, b) => a + b.income, 0);

  function resetForm() {
    setForm({ name: "", profile: "adult", income: "" });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(member: Member) {
    setEditingId(member.id);
    setForm({ name: member.name, profile: member.profile, income: String(member.income) });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name) return;
    const member: Member = {
      id: editingId || crypto.randomUUID(),
      name: form.name,
      photo: "",
      profile: form.profile,
      income: Number(form.income) || 0,
    };
    if (editingId) update(editingId, member);
    else create(member);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Família</h1>
          <p className="text-muted-foreground">Gerencie os membros da família e seus perfis financeiros.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo membro
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} membro</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do membro" />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={form.profile} onValueChange={(v) => v && setForm({ ...form, profile: v as Profile })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="teen">Adolescente</SelectItem>
                    <SelectItem value="child">Criança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Renda (R$)</Label>
                <Input type="number" step="0.01" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} placeholder="0,00" />
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Membros</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Renda total</span>
            <p className="mt-1 text-2xl font-bold text-green-600">R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Renda média</span>
            <p className="mt-1 text-2xl font-bold">
              R$ {(members.length > 0 ? totalIncome / members.length : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{member.name}</p>
                    <Badge variant="outline" className={cn("text-xs mt-0.5", profileConfig[member.profile].color)}>
                      {profileConfig[member.profile].label}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(member)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => remove(member.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renda</span>
                  <span className="font-medium">R$ {member.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participação</span>
                  <span className="font-medium">{totalIncome > 0 ? Math.round((member.income / totalIncome) * 100) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
