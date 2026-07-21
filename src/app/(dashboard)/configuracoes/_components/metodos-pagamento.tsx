"use client";

import { useState } from "react";
import { useApi } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
}

export function MetodosPagamento() {
  const { data: methods, loading, error, create, update, remove } = useApi<PaymentMethod>('/api/payment-methods');
  const [editName, setEditName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;
    if (editingId) {
      await update(editingId, { name: editName.trim() });
    } else {
      await create({ name: editName.trim() });
    }
    resetForm();
  }

  function handleEdit(method: PaymentMethod) {
    setEditingId(method.id);
    setEditName(method.name);
    setOpen(true);
  }

  function handleDelete(id: string) {
    remove(id);
  }

  function resetForm() {
    setEditingId(null);
    setEditName("");
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Formas de pagamento disponíveis nos lançamentos.
        </p>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo método
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Novo"} método de pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pm-name">Nome</Label>
                <Input
                  id="pm-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: PIX"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {methods.map((method) => (
              <div
                key={method.id}
                className="group flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <span className="text-sm">{method.name}</span>
                <button
                  onClick={() => handleEdit(method)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
            {methods.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum método cadastrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
