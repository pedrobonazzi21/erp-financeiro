"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type UsageMode = "individual" | "familiar";
type ThemeMode = "light" | "dark" | "system";
type ThemePreset = "financeiro" | "corporativo" | "elegante" | "oceano" | "energia" | "rubi" | "grafite" | "carbono" | "neutro" | "custom";
type InterfaceStyle = "classic" | "modern" | "minimalist" | "compact";
type Density = "compact" | "normal" | "comfortable";
type FontSize = "small" | "medium" | "large" | "xlarge";
type ChartStyle = "colorful" | "monochrome" | "pastel" | "high-contrast";
type SidebarMode = "expanded" | "collapsed" | "auto";
type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
type CurrencyFormat = "BRL" | "USD" | "EUR";
type AnimationLevel = "enabled" | "reduced" | "disabled";

interface Accessibility {
  highContrast: boolean;
  largerFont: boolean;
  reducedAnimations: boolean;
  iconAndText: boolean;
  screenReader: boolean;
}

interface Settings {
  mode: UsageMode;
  currency: string;
  language: string;
  theme: ThemeMode;
  themePreset: ThemePreset;
  primaryColor: string;
  interfaceStyle: InterfaceStyle;
  density: Density;
  fontSize: FontSize;
  chartStyle: ChartStyle;
  sidebarMode: SidebarMode;
  dateFormat: DateFormat;
  currencyFormat: CurrencyFormat;
  animations: AnimationLevel;
  accessibility: Accessibility;
}

interface SettingsContextType {
  settings: Settings;
  setMode: (mode: UsageMode) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  isFamiliar: boolean;
}

const defaultSettings: Settings = {
  mode: "familiar",
  currency: "BRL",
  language: "pt-BR",
  theme: "system",
  themePreset: "financeiro",
  primaryColor: "#10b981",
  interfaceStyle: "modern",
  density: "normal",
  fontSize: "medium",
  chartStyle: "colorful",
  sidebarMode: "expanded",
  dateFormat: "DD/MM/YYYY",
  currencyFormat: "BRL",
  animations: "enabled",
  accessibility: {
    highContrast: false,
    largerFont: false,
    reducedAnimations: false,
    iconAndText: false,
    screenReader: false,
  },
};

const themePresetColors: Record<ThemePreset, { light: string; dark: string; label: string }> = {
  financeiro: { light: "#10b981", dark: "#34d399", label: "Verde Esmeralda" },
  corporativo: { light: "#2563eb", dark: "#60a5fa", label: "Azul Royal" },
  elegante: { light: "#7c3aed", dark: "#a78bfa", label: "Roxo" },
  oceano: { light: "#06b6d4", dark: "#22d3ee", label: "Azul Ciano" },
  energia: { light: "#f97316", dark: "#fb923c", label: "Laranja" },
  rubi: { light: "#dc2626", dark: "#f87171", label: "Vermelho" },
  grafite: { light: "#525252", dark: "#a3a3a3", label: "Cinza Escuro" },
  carbono: { light: "#171717", dark: "#e5e5e5", label: "Preto" },
  neutro: { light: "#737373", dark: "#d4d4d4", label: "Cinza Claro" },
  custom: { light: "#10b981", dark: "#34d399", label: "Personalizada" },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("erp-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed, accessibility: { ...defaultSettings.accessibility, ...parsed.accessibility } });
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("erp-settings", JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const setMode = (mode: UsageMode) => setSettings((prev) => ({ ...prev, mode }));

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setMode, updateSettings, isFamiliar: settings.mode === "familiar" }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export type { ThemePreset, ThemeMode, InterfaceStyle, Density, FontSize, ChartStyle, SidebarMode, DateFormat, CurrencyFormat, AnimationLevel, Accessibility };
export { themePresetColors };
export type { UsageMode };
