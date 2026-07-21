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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export function Subcategorias() {
  const { data: categories } = useApi<Category>('/api/categories');
  const { data: subs, loading, error, create, update, remove } = useApi<Subcategory>('/api/subcategories');
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;
    if (editingId) {
      await update(editingId, { name: editName.trim(), categoryId: editCategoryId });
    } else {
      await create({ name: editName.trim(), categoryId: editCategoryId });
    }
    resetForm();
  }

  function handleEdit(sub: Subcategory) {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditCategoryId(sub.categoryId);
    setOpen(true);
  }

  function handleDelete(id: string) {
    remove(id);
  }

  function resetForm() {
    setEditingId(null);
    setEditName("");
    setEditCategoryId(categories[0]?.id || '');
    setOpen(false);
  }

  const grouped = categories
    .map((cat) => ({
      ...cat,
      subcategories: subs.filter((s) => s.categoryId === cat.id),
    }))
    .filter((cat) => cat.subcategories.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Detalhe as categorias com subcategorias.
        </p>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova subcategoria
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} subcategoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Nome</Label>
                <Input
                  id="sub-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Mercado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-category">Categoria</Label>
                <Select value={editCategoryId} onValueChange={(v) => v && setEditCategoryId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
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

      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                {cat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(sub)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(sub.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
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
