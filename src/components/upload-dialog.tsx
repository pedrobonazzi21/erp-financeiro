"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Upload, FileText, X, Check } from "lucide-react";

interface UploadFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
}

export function useUploadDialog() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}

export function UploadDialogContent({
  open,
  onOpenChange,
  onUpload,
  accept = ".pdf,.jpg,.jpeg,.png,.csv,.ofx",
  maxFiles = 10,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpload?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [docType, setDocType] = useState("boleto");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const remaining = maxFiles - files.length;
    const toAdd = selected.slice(0, remaining);
    setFiles((prev) => [
      ...prev,
      ...toAdd.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        uploading: false,
        uploaded: false,
      })),
    ]);
    if (e.target) e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleUpload() {
    if (files.length === 0) return;
    setFiles((prev) => prev.map((f) => ({ ...f, uploading: true })));
    setTimeout(() => {
      setFiles((prev) => prev.map((f) => ({ ...f, uploading: false, uploaded: true })));
      onUpload?.(files.map((f) => f.file));
      setTimeout(() => {
        setFiles([]);
        onOpenChange(false);
      }, 1000);
    }, 1500);
  }

  const fileTypeLabels: Record<string, string> = {
    boleto: "Boleto", invoice: "Nota Fiscal", irpf: "IRPF",
    statement: "Extrato", contract: "Contrato", receipt: "Comprovante",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setFiles([]); onOpenChange(false); } else onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload de documentos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tipo de documento</Label>
            <Select value={docType} onValueChange={(v) => v && setDocType(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(fileTypeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-muted/50"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Clique para selecionar arquivos</p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG, CSV, OFX — até {maxFiles} arquivos
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={handleSelect}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{files.length} arquivo(s)</p>
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{f.file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(f.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.uploading && <Badge variant="secondary" className="text-xs">Enviando...</Badge>}
                    {f.uploaded && <Check className="h-4 w-4 text-green-500" />}
                    {!f.uploading && !f.uploaded && (
                      <button onClick={() => removeFile(i)} className="p-1 hover:bg-muted rounded">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleUpload} disabled={files.length === 0}>
            {files.some((f) => f.uploading) ? "Enviando..." : `Upload (${files.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
