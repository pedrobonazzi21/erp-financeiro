"use client";

import { useState } from "react";
import { useApi } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Landmark, Pencil, Trash2 } from "lucide-react";

interface CostCenter {
  id: string;
  name: string;
  description: string;
}

export default function CentroCustosPage() {
  const { data: centers, loading, error, create, update, remove } = useApi<CostCenter>('/api/cost-centers');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  function resetForm() {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setOpen(false);
  }

  function handleEdit(cc: CostCenter) {
    setEditingId(cc.id);
    setForm({ name: cc.name, description: cc.description });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name) return;
    if (editingId) {
      await update(editingId, form);
    } else {
      await create(form);
    }
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Custos</h1>
          <p className="text-muted-foreground">Separe gastos por finalidade: casa, pessoal, filhos.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo centro de custo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar" : "Novo"} centro de custo</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Casa" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {centers.map((cc) => (
          <Card key={cc.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{cc.name}</p>
                  {cc.description && <p className="text-xs text-muted-foreground">{cc.description}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(cc)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon-xs" onClick={() => remove(cc.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
