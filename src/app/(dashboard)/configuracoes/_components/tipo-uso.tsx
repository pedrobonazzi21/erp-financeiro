"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings-context";

export function TipoUso() {
  const { settings, setMode } = useSettings();
  const mode = settings.mode;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modo de Uso</CardTitle>
          <CardDescription>
            Defina como o sistema será utilizado. É possível alterar depois sem perda de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setMode("individual")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all hover:border-primary",
                mode === "individual"
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              )}
            >
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Individual</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Apenas você. Módulo Família fica oculto.
                </p>
              </div>
              {mode === "individual" && <Badge>Ativo</Badge>}
            </button>

            <button
              onClick={() => setMode("familiar")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all hover:border-primary",
                mode === "familiar"
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              )}
            >
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Familiar</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Família com membros, contas e relatórios compartilhados.
                </p>
              </div>
              {mode === "familiar" && <Badge>Ativo</Badge>}
            </button>
          </div>
        </CardContent>
      </Card>

      {mode === "familiar" && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos Familiares Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">✓ Cadastro de múltiplos membros</li>
              <li className="flex items-center gap-2">✓ Contas e cartões compartilhados</li>
              <li className="flex items-center gap-2">✓ Relatórios por membro</li>
              <li className="flex items-center gap-2">✓ Centros de custo familiares</li>
              <li className="flex items-center gap-2">✓ Controle de permissões</li>
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button>Salvar</Button>
      </div>
    </div>
  );
}
