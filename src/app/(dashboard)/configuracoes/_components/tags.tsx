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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

const colors = [
  { value: "bg-red-500", label: "Vermelho" },
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-yellow-500", label: "Amarelo" },
  { value: "bg-purple-500", label: "Roxo" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-orange-500", label: "Laranja" },
  { value: "bg-teal-500", label: "Teal" },
];

export function TagsManager() {
  const { data: tags, loading, error, create, update, remove } = useApi<Tag>('/api/tags');
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(colors[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;
    if (editingId) {
      await update(editingId, { name: editName.trim(), color: editColor });
    } else {
      await create({ name: editName.trim(), color: editColor });
    }
    resetForm();
  }

  function handleEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setOpen(true);
  }

  function handleDelete(id: string) {
    remove(id);
  }

  function resetForm() {
    setEditingId(null);
    setEditName("");
    setEditColor(colors[0].value);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Etiquetas personalizadas para facilitar pesquisas e relatórios.
        </p>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova tag
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Nome</Label>
                <Input
                  id="tag-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Férias"
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditColor(c.value)}
                      className={`h-8 w-8 rounded-full ${c.value} ${
                        editColor === c.value ? "ring-2 ring-offset-2 ring-ring" : ""
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
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
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="group flex items-center gap-1">
                <Badge
                  className={`${tag.color} text-white flex items-center gap-2 px-3 py-1.5`}
                >
                  {tag.name}
                  <button
                    onClick={() => handleEdit(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tag cadastrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
