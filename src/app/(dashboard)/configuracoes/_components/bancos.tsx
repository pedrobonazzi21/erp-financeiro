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
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

interface Bank {
  id: string;
  name: string;
  code: string;
}

export function Bancos() {
  const { data: banks, loading, error, create, update, remove } = useApi<Bank>('/api/banks');
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;
    if (editingId) {
      await update(editingId, { name: editName.trim(), code: editCode.trim() });
    } else {
      await create({ name: editName.trim(), code: editCode.trim() });
    }
    resetForm();
  }

  function handleEdit(bank: Bank) {
    setEditingId(bank.id);
    setEditName(bank.name);
    setEditCode(bank.code);
    setOpen(true);
  }

  function handleDelete(id: string) {
    remove(id);
  }

  function resetForm() {
    setEditingId(null);
    setEditName("");
    setEditCode("");
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Instituições financeiras utilizadas nas contas.
        </p>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo banco
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Novo"} banco</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nome</Label>
                <Input
                  id="bank-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Nubank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-code">Código</Label>
                <Input
                  id="bank-code"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="Ex: 260"
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {banks.map((bank) => (
          <Card key={bank.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{bank.name}</p>
                  <p className="text-xs text-muted-foreground">Código {bank.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(bank)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(bank.id)}>
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
