"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Trash2, Download, Eye, Upload } from "lucide-react";
import { UploadDialogContent, useUploadDialog } from "@/components/upload-dialog";
import { useApi } from "@/lib/use-api";

type DocType = "boleto" | "invoice" | "irpf" | "statement" | "contract" | "receipt";

interface Document {
  id: string;
  type: DocType;
  name: string;
  date: string;
  member: string;
}

const typeLabels: Record<DocType, string> = {
  boleto: "Boleto", invoice: "Nota Fiscal", irpf: "IRPF",
  statement: "Extrato", contract: "Contrato", receipt: "Comprovante",
};

export default function DocumentosPage() {
  const { data: docs, loading, error, remove } = useApi<Document>('/api/documents');
  const [typeFilter, setTypeFilter] = useState("all");
  const upload = useUploadDialog();

  const filtered = typeFilter === "all" ? docs : docs.filter((d) => d.type === typeFilter);

  return (
    <div className="space-y-6">
      <UploadDialogContent open={upload.open} onOpenChange={upload.setOpen} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos Financeiros</h1>
          <p className="text-muted-foreground">Armazene boletos, notas fiscais, extratos e contratos.</p>
        </div>
        <Button onClick={() => upload.setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload documento
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} documentos</span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {doc.name}
                </TableCell>
                <TableCell><Badge variant="outline">{typeLabels[doc.type]}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{new Date(doc.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-muted-foreground">{doc.member}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs"><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs"><Download className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(doc.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
