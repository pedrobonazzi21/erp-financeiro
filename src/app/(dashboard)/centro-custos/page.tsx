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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Landmark, Pencil, Trash2, AlertCircle, Home } from "lucide-react";

interface CostCenter {
  id: string;
  name: string;
  description: string;
  familyId: string;
}

interface Family {
  id: string;
  name: string;
}

export default function CentroCustosPage() {
  const { data: centers, loading, error, create, update, remove } = useApi<CostCenter>('/api/cost-centers');
  const { data: families, loading: loadingFamilies, create: createFamily } = useApi<Family>('/api/families');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const currentFamily = families[0];

  const familyCenters = centers.filter((c) => c.familyId === currentFamily?.id);

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
    if (!currentFamily) {
      alert("Crie uma família primeiro em Família > Nova Família");
      return;
    }

    const payload = {
      ...form,
      familyId: currentFamily.id,
    };

    try {
      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      resetForm();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (!loadingFamilies && families.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Custos</h1>
          <p className="text-muted-foreground">Separe gastos por finalidade: casa, pessoal, filhos.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <Home className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Nenhuma família encontrada</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Crie uma família primeiro na página Família para poder criar centros de custo.
            </p>
            <a href="/familia" className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Ir para Família
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Custos</h1>
          <p className="text-muted-foreground">
            {currentFamily && `Família ${currentFamily.name} — `}Separe gastos por finalidade.
          </p>
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
        {familyCenters.map((cc) => (
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
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          Carregando...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
