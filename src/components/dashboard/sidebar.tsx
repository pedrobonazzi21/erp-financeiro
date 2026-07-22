"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Users,
  Target,
  BarChart3,
  PiggyBank,
  HandCoins,
  FileText,
  Landmark,
  Repeat,
  Wallet,
  ArrowLeftRight,
  LineChart,
  Settings,
  ListOrdered,
  CalendarCheck,
  Tags,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSettings } from "@/lib/settings-context";

interface SidebarRoute {
  label?: string;
  icon?: typeof LayoutDashboard;
  href?: string;
  section?: true;
  family?: true;
}

const routes: SidebarRoute[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { section: true },
  { label: "Lançamentos", icon: ListOrdered, href: "/lancamentos" },
  { label: "Receitas", icon: TrendingUp, href: "/receitas" },
  { label: "Receitas Fixas", icon: CalendarCheck, href: "/receitas-fixas" },
  { label: "Despesas", icon: TrendingDown, href: "/despesas" },
  { label: "Contas Recorrentes", icon: Repeat, href: "/contas-recorrentes" },
  { label: "Fluxo de Caixa", icon: BarChart3, href: "/fluxo-caixa" },
  { section: true },
  { label: "Contas Bancárias", icon: Building2, href: "/contas" },
  { label: "Cartões", icon: CreditCard, href: "/cartoes" },
  { label: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { section: true },
  { label: "Orçamento", icon: Wallet, href: "/orcamento" },
  { label: "Objetivos", icon: Target, href: "/objetivos" },
  { label: "Dívidas", icon: HandCoins, href: "/dividas" },
  { label: "Investimentos", icon: PiggyBank, href: "/investimentos" },
  { label: "Projeção Financeira", icon: LineChart, href: "/projecao-financeira" },
  { section: true },
  { label: "Família", icon: Users, href: "/familia", family: true },
  { label: "Centro de Custos", icon: Landmark, href: "/centro-custos", family: true },
  { label: "Documentos", icon: FileText, href: "/documentos" },
  { label: "Relatórios", icon: FileText, href: "/relatorios" },
  { section: true },
  { label: "Categorias", icon: Tags, href: "/configuracoes?tab=categorias" },
  { label: "Configurações", icon: Settings, href: "/configuracoes" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isFamiliar } = useSettings();

  const visibleRoutes = routes.filter((r) => !("family" in r) || isFamiliar);

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4 font-semibold">
        <Link href="/" className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          ERP Financeiro
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {visibleRoutes.map((route, index) => {
            if ("section" in route) {
              return <Separator key={`sep-${index}`} className="my-2" />;
            }
            const Icon = route.icon!;
            const href = route.href!;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start gap-3",
                  isActive && "bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4 text-xs text-muted-foreground">
        ERP Financeiro v0.1.0
        {!isFamiliar && <span className="ml-2 text-[10px]">(Individual)</span>}
      </div>
    </aside>
  );
}
