"use client";

import { useEffect, useState } from "react";
import { useSettings, themePresetColors } from "./settings-context";

export function ThemeApplier({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark =
    settings.theme === "dark" || (settings.theme === "system" && systemPrefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  const preset = themePresetColors[settings.themePreset];
  const color = settings.themePreset === "custom" ? settings.primaryColor : (isDark ? preset?.dark : preset?.light) || settings.primaryColor;

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    for (const key of Object.keys(themePresetColors)) {
      root.classList.remove(`theme-${key}`);
    }
    root.classList.add(`theme-${settings.themePreset}`);
    root.style.setProperty("--theme-primary", color);

    // density
    root.setAttribute("data-density", settings.density);

    // font size — apply via class
    root.classList.remove("text-sm", "text-base", "text-lg", "text-xl");
    const fontClass = { small: "text-sm", medium: "text-base", large: "text-lg", xlarge: "text-xl" };
    root.classList.add(fontClass[settings.fontSize]);

    // interface style
    root.setAttribute("data-style", settings.interfaceStyle);

    // chart style
    root.setAttribute("data-chart", settings.chartStyle);

    // sidebar mode
    root.setAttribute("data-sidebar", settings.sidebarMode);

    // animations
    root.classList.remove("motion-safe", "motion-reduce");
    if (settings.animations === "disabled") {
      root.classList.add("motion-reduce");
    } else if (settings.animations === "enabled") {
      root.classList.add("motion-safe");
    }

    // accessibility
    root.classList.toggle("high-contrast", settings.accessibility.highContrast);
    root.classList.toggle("reduced-motion", settings.accessibility.reducedAnimations);

    // Set color on meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
  }, [color, settings]);

  return <>{children}</>;
}
