"use client";

import { useMemo } from "react";

interface DayData {
  date: string; // "YYYY-MM-DD"
  value: number;
  dayOfWeek: number; // 0=seg, 6=dom
  weekIndex: number;
}

interface CalendarHeatmapProps {
  data: Record<string, number>; // { "2026-07-13": 320, ... }
  year?: number;
  month?: number;
  formatValue?: (value: number) => string;
  height?: number;
}

const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getIntensity(value: number, max: number): string {
  if (value === 0) return "bg-muted";
  const ratio = value / max;
  if (ratio > 0.75) return "bg-red-500";
  if (ratio > 0.5) return "bg-orange-500";
  if (ratio > 0.25) return "bg-yellow-500";
  return "bg-green-500";
}

export function CalendarHeatmap({
  data,
  year: selectedYear,
  month: selectedMonth,
  formatValue = (v) => `R$ ${v.toFixed(2)}`,
  height = 220,
}: CalendarHeatmapProps) {
  const now = new Date();
  const year = selectedYear ?? now.getFullYear();
  const month = selectedMonth ?? now.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Adjust so Monday = 0
    const startDow = (firstDay.getDay() + 6) % 7;
    const result: (DayData | null)[] = [];

    // Pad empty cells for days before month start
    for (let i = 0; i < startDow; i++) {
      result.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        date: dateStr,
        value: data[dateStr] || 0,
        dayOfWeek: (new Date(year, month, d).getDay() + 6) % 7,
        weekIndex: 0,
      });
    }
    return result;
  }, [data, year, month]);

  const maxValue = Math.max(...days.filter(Boolean).map((d) => d!.value), 1);

  // Group into weeks
  const weeks: (DayData | null)[][] = [];
  let currentWeek: (DayData | null)[] = [];
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    // Pad last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const monthName = new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div style={{ height }}>
      <p className="text-sm font-medium capitalize mb-2">{monthName}</p>
      <div className="flex gap-1">
        <div className="space-y-1 pr-1">
          {weekLabels.map((label) => (
            <div key={label} className="h-[18px] text-[10px] leading-[18px] text-muted-foreground text-right w-6">
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="space-y-1">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day.date}
                    title={`${day.date}: ${formatValue(day.value)}`}
                    className={`h-[18px] w-[18px] rounded-sm ${getIntensity(day.value, maxValue)}`}
                  />
                ) : (
                  <div key={`empty-${wi}-${di}`} className="h-[18px] w-[18px]" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-green-500" />
        <div className="h-3 w-3 rounded-sm bg-yellow-500" />
        <div className="h-3 w-3 rounded-sm bg-orange-500" />
        <div className="h-3 w-3 rounded-sm bg-red-500" />
        <span>Mais</span>
      </div>
    </div>
  );
}
