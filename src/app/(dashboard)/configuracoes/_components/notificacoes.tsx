"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff } from "lucide-react";

interface NotificationType {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const initialNotifications: NotificationType[] = [
  { id: "1", label: "Contas vencendo", description: "Alertar quando uma conta estiver próxima do vencimento", enabled: true },
  { id: "2", label: "Receitas pendentes", description: "Notificar quando uma receita esperada não for recebida", enabled: true },
  { id: "3", label: "Faturas dos cartões", description: "Avisar sobre fechamento e vencimento de faturas", enabled: true },
  { id: "4", label: "Limite do cartão", description: "Alertar quando o limite estiver próximo de estourar", enabled: false },
  { id: "5", label: "Orçamento excedido", description: "Notificar quando o orçamento ultrapassar 80%, 90% e 100%", enabled: true },
  { id: "6", label: "Metas atrasadas", description: "Alertar se uma meta estiver progredindo abaixo do esperado", enabled: false },
  { id: "7", label: "Parcelas futuras", description: "Lembrar sobre parcelas de financiamentos e compras", enabled: true },
  { id: "8", label: "Contas recorrentes", description: "Avisar quando uma conta recorrente for gerada", enabled: true },
];

export function Notificacoes() {
  const [notifications, setNotifications] = useState<NotificationType[]>(initialNotifications);

  function toggle(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure os alertas e notificações do sistema.
      </p>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{n.label}</span>
                  {n.enabled ? (
                    <Bell className="h-3 w-3 text-primary" />
                  ) : (
                    <BellOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{n.description}</p>
              </div>
              <button
                onClick={() => toggle(n.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  n.enabled ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    n.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button>Salvar configurações</Button>
      </div>
    </div>
  );
}
