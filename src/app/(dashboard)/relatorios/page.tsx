"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PiggyBank,
  HandCoins,
  Target,
  Download,
  FileSpreadsheet,
  Eye,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
}

const reports: Report[] = [
  { id: "1", title: "Receitas por Período", description: "Total de receitas agrupadas por mês", icon: TrendingUp },
  { id: "2", title: "Despesas por Categoria", description: "Gastos detalhados por categoria", icon: TrendingDown },
  { id: "3", title: "Fluxo de Caixa", description: "Entradas e saídas ao longo do tempo", icon: BarChart3 },
  { id: "4", title: "Evolução Patrimonial", description: "Variação do patrimônio líquido", icon: PiggyBank },
  { id: "5", title: "Investimentos", description: "Rentabilidade e distribuição da carteira", icon: PiggyBank },
  { id: "6", title: "Dívidas", description: "Saldo devedor e parcelas restantes", icon: HandCoins },
  { id: "7", title: "Objetivos", description: "Progresso das metas financeiras", icon: Target },
  { id: "8", title: "Orçamento Previsto × Realizado", description: "Comparativo de limites vs gastos", icon: FileText },
  { id: "9", title: "Gastos por Centro de Custo", description: "Despesas agrupadas por centro de custo", icon: FileText },
  { id: "10", title: "Gastos por Membro", description: "Despesas por membro da família", icon: FileText },
  { id: "11", title: "Competência × Caixa", description: "Comparação entre regime de competência e caixa", icon: FileText },
  { id: "12", title: "Comparativo Mensal", description: "Comparação entre meses consecutivos", icon: BarChart3 },
  { id: "13", title: "Comparativo Anual", description: "Comparação entre anos", icon: BarChart3 },
];

function generateCSV(report: Report, period: string): string {
  const headers = "Categoria;Janeiro;Fevereiro;Março;Abril;Maio;Junho";
  const mockData: Record<string, string[]> = {
    "1": ["Salário;8000;8000;8500;8000;8200;8000", "Freelance;1500;2000;1800;2200;1700;1900"],
    "2": ["Moradia;1500;1500;1500;1500;1500;1500", "Alimentação;800;950;900;850;920;880", "Transporte;400;450;380;420;390;410"],
    "3": ["Entradas;9500;10000;10300;10200;9900;9900", "Saídas;5200;5400;5300;5600;5500;5400"],
    "4": ["Patrimônio;85000;92000;98000;105000;112000;120000"],
    "5": ["Ações;15000;16200;17500;16800;18000;19200", "FIIs;8000;8400;8200;8600;8800;9100", "Tesouro;12000;12100;12200;12300;12400;12500"],
    "6": ["Cartão;2500;2200;1800;1400;900;0", "Empréstimo;5000;4500;4000;3500;3000;2500"],
    "7": ["Viagem;15;20;25;30;35;40", "Reserva;40;45;50;55;60;65"],
    "8": ["Previsto;6000;6000;6000;6000;6000;6000", "Realizado;5200;5400;5300;5600;5500;5400"],
    "9": ["Administrativo;800;750;820;780;790;810", "Operacional;1200;1250;1180;1220;1210;1190"],
    "10": ["Carlos;3200;3400;3300;3500;3400;3300", "Maria;2000;2000;2000;2100;2100;2100"],
    "11": ["Competência;5200;5400;5300;5600;5500;5400", "Caixa;5100;5300;5200;5500;5400;5300"],
    "12": ["Diferença;-200;+100;+300;-100;+200;0"],
    "13": ["2024;60000;0;0;0;0;0", "2025;65000;0;0;0;0;0", "2026;34000;0;0;0;0;0"],
  };

  const data = mockData[report.id] || ["Dado;0;0;0;0;0;0"];
  return `${report.title}\nPeríodo: ${period}\n\n${headers}\n${data.join("\n")}`;
}

function downloadCSV(report: Report, period: string) {
  const csv = generateCSV(report, period);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/\s+/g, "_")}_${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAllCSV(period: string) {
  const all = reports.map((r) => generateCSV(r, period)).join("\n\n---\n\n");
  const blob = new Blob([all], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorios_completos_${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState("2026");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Gere relatórios detalhados de suas finanças.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => alert("Exportação PDF em breve!")}>
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => downloadAllCSV(period)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="transition-all hover:border-primary hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert("Visualização em breve!")}>
                    <Eye className="mr-1 h-3 w-3" /> Visualizar
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => downloadCSV(report, period)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
