"use client";

import { useSettings, themePresetColors } from "@/lib/settings-context";
import type { ThemePreset, ThemeMode, InterfaceStyle, Density, FontSize, ChartStyle, SidebarMode, DateFormat, CurrencyFormat, AnimationLevel } from "@/lib/settings-context";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor, Check, Palette, Type, LayoutGrid, BarChart3, PanelLeft, Calendar, DollarSign, Sparkles, Accessibility } from "lucide-react";
import { useState } from "react";

const sections = [
  { id: "tema", icon: Sun, label: "Tema" },
  { id: "cores", icon: Palette, label: "Cores" },
  { id: "estilo", icon: LayoutGrid, label: "Estilo" },
  { id: "fonte", icon: Type, label: "Fonte" },
  { id: "graficos", icon: BarChart3, label: "Gráficos" },
  { id: "sidebar", icon: PanelLeft, label: "Sidebar" },
  { id: "data-moeda", icon: Calendar, label: "Data & Moeda" },
  { id: "animacoes", icon: Sparkles, label: "Animações" },
  { id: "acessibilidade", icon: Accessibility, label: "Acessibilidade" },
];

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];

const interfaceStyles: { value: InterfaceStyle; label: string; desc: string }[] = [
  { value: "classic", label: "Clássico", desc: "Mais espaçamento" },
  { value: "modern", label: "Moderno", desc: "Cantos arredondados e sombras" },
  { value: "minimalist", label: "Minimalista", desc: "Menos bordas e elementos" },
  { value: "compact", label: "Compacto", desc: "Máximo de informação" },
];

const densityOptions: { value: Density; label: string }[] = [
  { value: "compact", label: "Compacta" },
  { value: "normal", label: "Normal" },
  { value: "comfortable", label: "Confortável" },
];

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: "small", label: "Pequena" },
  { value: "medium", label: "Média" },
  { value: "large", label: "Grande" },
  { value: "xlarge", label: "Extra Grande" },
];

const chartStyleOptions: { value: ChartStyle; label: string }[] = [
  { value: "colorful", label: "Colorido" },
  { value: "monochrome", label: "Monocromático" },
  { value: "pastel", label: "Tons Pastéis" },
  { value: "high-contrast", label: "Alto Contraste" },
];

const sidebarOptions: { value: SidebarMode; label: string }[] = [
  { value: "expanded", label: "Expandido" },
  { value: "collapsed", label: "Recolhido" },
  { value: "auto", label: "Automático" },
];

const dateFormatOptions: { value: DateFormat; label: string }[] = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD" },
];

const currencyFormatOptions: { value: CurrencyFormat; label: string; example: string }[] = [
  { value: "BRL", label: "Real (R$)", example: "R$ 1.234,56" },
  { value: "USD", label: "Dólar (US$)", example: "US$ 1,234.56" },
  { value: "EUR", label: "Euro (€)", example: "€ 1.234,56" },
];

const animationOptions: { value: AnimationLevel; label: string }[] = [
  { value: "enabled", label: "Ativadas" },
  { value: "reduced", label: "Reduzidas" },
  { value: "disabled", label: "Desativadas" },
];

const presetOrder: ThemePreset[] = ["financeiro", "corporativo", "elegante", "oceano", "energia", "rubi", "grafite", "carbono", "neutro"];
const presetEmoji: Record<ThemePreset, string> = {
  financeiro: "💚", corporativo: "💙", elegante: "💜", oceano: "🩵", energia: "🧡",
  rubi: "❤️", grafite: "🩶", carbono: "⚫", neutro: "🤍", custom: "🎨",
};

interface SectionProps {
  title: string;
  subtitle: string;
  icon: typeof Sun;
  children: React.ReactNode;
  id?: string;
}

function Section({ title, subtitle, icon: Icon, children, id }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Aparencia() {
  const { settings, updateSettings } = useSettings();
  const [customColor, setCustomColor] = useState(settings.primaryColor);
  const [activeSection, setActiveSection] = useState("tema");

  function handlePresetChange(preset: ThemePreset) {
    updateSettings({ themePreset: preset });
    if (preset !== "custom") setCustomColor(themePresetColors[preset].light);
  }

  function handleCustomColor(color: string) {
    setCustomColor(color);
    updateSettings({ primaryColor: color, themePreset: "custom" });
  }

  const currentColors = settings.themePreset === "custom"
    ? { light: settings.primaryColor, dark: settings.primaryColor }
    : themePresetColors[settings.themePreset];

  return (
    <div className="flex gap-6">
      {/* Sidebar de navegação */}
      <nav className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-6 space-y-1">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                data-active={activeSection === s.id ? "" : undefined}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[active]:bg-accent data-[active]:text-accent-foreground data-[active]:font-medium"
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex-1 min-w-0 space-y-10">
        {/* 🌗 Tema */}
        <Section id="tema" title="Tema" subtitle="Claro, escuro ou automático" icon={Sun}>
          <RadioGroup value={settings.theme} onValueChange={(v) => updateSettings({ theme: v as ThemeMode })} className="flex flex-wrap gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <Label key={opt.value} className="cursor-pointer">
                  <RadioGroupItem value={opt.value} className="peer sr-only" />
                  <div className="flex items-center gap-2 rounded-lg border border-input px-4 py-3 transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </Section>

        <Separator />

        {/* 🎨 Cores */}
        <Section id="cores" title="Tema de Cores" subtitle="Paletas prontas ou cor personalizada" icon={Palette}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {presetOrder.map((preset) => {
              const colors = themePresetColors[preset];
              const selected = settings.themePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className="relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:border-foreground/30"
                  style={selected ? { borderColor: colors.light, boxShadow: `0 0 0 1px ${colors.light}` } : undefined}
                >
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.light }} />
                  <span className="text-xs font-medium leading-tight">{presetEmoji[preset]} {colors.label}</span>
                  {selected && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: colors.light }}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetChange("custom")}
              className="relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:border-foreground/30"
              style={settings.themePreset === "custom" ? { borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` } : undefined}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-green-400 to-blue-400 text-[10px] font-bold text-white">C</div>
              <span className="text-xs font-medium">🎨 Personalizada</span>
              {settings.themePreset === "custom" && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: customColor }}>
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          </div>

          {settings.themePreset === "custom" && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Cor:</span>
              <input type="color" value={customColor} onChange={(e) => handleCustomColor(e.target.value)} className="h-9 w-16 cursor-pointer rounded border p-0.5" />
              <input type="text" value={customColor} onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { setCustomColor(v); if (v.length === 7) updateSettings({ primaryColor: v, themePreset: "custom" }); } }} className="h-9 w-28 rounded-md border border-input bg-background px-2 text-sm font-mono" placeholder="#10b981" />
            </div>
          )}
        </Section>

        <Separator />

        {/* 🖌️ Estilo */}
        <Section id="estilo" title="Estilo da Interface" subtitle="Aparência geral do sistema" icon={LayoutGrid}>
          <RadioGroup value={settings.interfaceStyle} onValueChange={(v) => updateSettings({ interfaceStyle: v as InterfaceStyle })} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interfaceStyles.map((opt) => (
              <Label key={opt.value} className="cursor-pointer">
                <RadioGroupItem value={opt.value} className="peer sr-only" />
                <div className="rounded-lg border p-3 transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>

          {/* Densidade */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">📐 Densidade</p>
            <RadioGroup value={settings.density} onValueChange={(v) => updateSettings({ density: v as Density })} className="flex flex-wrap gap-2">
              {densityOptions.map((opt) => (
                <Label key={opt.value} className="cursor-pointer">
                  <RadioGroupItem value={opt.value} className="peer sr-only" />
                  <div className="rounded-lg border border-input px-3 py-2 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                    {opt.label}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </Section>

        <Separator />

        {/* 📝 Fonte */}
        <Section id="fonte" title="Tamanho da Fonte" subtitle="Ajuste o tamanho do texto em todo o sistema" icon={Type}>
          <RadioGroup value={settings.fontSize} onValueChange={(v) => updateSettings({ fontSize: v as FontSize })} className="flex flex-wrap gap-3">
            {fontSizeOptions.map((opt) => (
              <Label key={opt.value} className="cursor-pointer">
                <RadioGroupItem value={opt.value} className="peer sr-only" />
                <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                  {opt.label}
                </div>
              </Label>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-2">
            Preview: <span className="text-foreground">Este é um texto de exemplo no tamanho selecionado.</span>
          </p>
        </Section>

        <Separator />

        {/* 📊 Gráficos */}
        <Section id="graficos" title="Estilo dos Gráficos" subtitle="Aparência dos gráficos e relatórios" icon={BarChart3}>
          <RadioGroup value={settings.chartStyle} onValueChange={(v) => updateSettings({ chartStyle: v as ChartStyle })} className="flex flex-wrap gap-3">
            {chartStyleOptions.map((opt) => (
              <Label key={opt.value} className="cursor-pointer">
                <RadioGroupItem value={opt.value} className="peer sr-only" />
                <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                  {opt.label}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </Section>

        <Separator />

        {/* 🗂️ Sidebar */}
        <Section id="sidebar" title="Menu Lateral" subtitle="Comportamento da barra de navegação" icon={PanelLeft}>
          <RadioGroup value={settings.sidebarMode} onValueChange={(v) => updateSettings({ sidebarMode: v as SidebarMode })} className="flex flex-wrap gap-3">
            {sidebarOptions.map((opt) => (
              <Label key={opt.value} className="cursor-pointer">
                <RadioGroupItem value={opt.value} className="peer sr-only" />
                <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                  {opt.label}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </Section>

        <Separator />

        {/* 📅 Data & Moeda */}
        <Section id="data-moeda" title="Data e Moeda" subtitle="Formatos de exibição" icon={Calendar}>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">📅 Formato de Data</p>
              <RadioGroup value={settings.dateFormat} onValueChange={(v) => updateSettings({ dateFormat: v as DateFormat })} className="flex flex-wrap gap-3">
                {dateFormatOptions.map((opt) => (
                  <Label key={opt.value} className="cursor-pointer">
                    <RadioGroupItem value={opt.value} className="peer sr-only" />
                    <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                      {opt.label}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">💰 Formato Monetário</p>
              <RadioGroup value={settings.currencyFormat} onValueChange={(v) => updateSettings({ currencyFormat: v as CurrencyFormat })} className="flex flex-wrap gap-3">
                {currencyFormatOptions.map((opt) => (
                  <Label key={opt.value} className="cursor-pointer">
                    <RadioGroupItem value={opt.value} className="peer sr-only" />
                    <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                      {opt.label} <span className="text-muted-foreground">{opt.example}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Section>

        <Separator />

        {/* ✨ Animações */}
        <Section id="animacoes" title="Animações" subtitle="Controle de efeitos visuais" icon={Sparkles}>
          <RadioGroup value={settings.animations} onValueChange={(v) => updateSettings({ animations: v as AnimationLevel })} className="flex flex-wrap gap-3">
            {animationOptions.map((opt) => (
              <Label key={opt.value} className="cursor-pointer">
                <RadioGroupItem value={opt.value} className="peer sr-only" />
                <div className="rounded-lg border border-input px-4 py-3 text-sm transition-all peer-data-[state=checked]:border-[var(--theme-primary)] peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-[var(--theme-primary)] hover:border-muted-foreground/30">
                  {opt.label}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </Section>

        <Separator />

        {/* ♿ Acessibilidade */}
        <Section id="acessibilidade" title="Acessibilidade" subtitle="Recursos de usabilidade" icon={Accessibility}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "highContrast" as const, label: "Alto contraste" },
              { key: "largerFont" as const, label: "Fonte maior" },
              { key: "reducedAnimations" as const, label: "Redução de animações" },
              { key: "iconAndText" as const, label: "Ícones + texto" },
              { key: "screenReader" as const, label: "Leitor de tela" },
            ].map((item) => (
              <Label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 transition-all has-[:checked]:border-[var(--theme-primary)]">
                <input type="checkbox" className="h-4 w-4 accent-[var(--theme-primary)]" checked={settings.accessibility[item.key]}
                  onChange={(e) => updateSettings({ accessibility: { ...settings.accessibility, [item.key]: e.target.checked } })} />
                <span className="text-sm">{item.label}</span>
              </Label>
            ))}
          </div>
        </Section>

        <Separator />

        {/* Preview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <EyeIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">👁️ Preview</h3>
              <p className="text-xs text-muted-foreground">Visualização ao vivo das configurações</p>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentColors?.light }} />
                <span className="text-sm font-semibold">Resumo Financeiro</span>
                <span className="text-xs text-muted-foreground ml-auto">Hoje, {new Date().toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-base font-bold">R$ 12.450</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="text-base font-bold text-green-600">R$ 8.700</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="text-base font-bold text-red-600">R$ 5.430</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110" style={{ backgroundColor: currentColors?.light }}>
                  Nova transação
                </button>
                <button className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-all hover:bg-accent">
                  Ver relatórios
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function EyeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
