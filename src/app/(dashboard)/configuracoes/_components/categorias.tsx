"use client";

import { useState } from "react";
import { useApi } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
}

export function Categorias() {
  const { data: categories, loading, error, create, update, remove } = useApi<Category>('/api/categories');
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;

    if (editingId) {
      await update(editingId, { name: editName.trim(), icon: 'folder', type: editType });
    } else {
      await create({ name: editName.trim(), icon: 'folder', type: editType });
    }
    resetForm();
  }

  function handleEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditType(cat.type);
    setOpen(true);
  }

  function handleDelete(id: string) {
    remove(id);
  }

  function resetForm() {
    setEditingId(null);
    setEditName("");
    setEditType("expense");
    setOpen(false);
  }

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie as categorias de receitas e despesas.
        </p>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                  id="cat-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Alimentação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-type">Tipo</Label>
                <Select
                  value={editType}
                  onValueChange={(v) => v && setEditType(v as "income" | "expense")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma categoria de receita.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma categoria de despesa.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
