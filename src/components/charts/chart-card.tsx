"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";

interface PeriodOption {
  value: string;
  label: string;
}

export function ChartCard({
  title,
  icon,
  action,
  children,
  periods,
  defaultPeriod,
  onPeriodChange,
  className,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  periods?: PeriodOption[];
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
}) {
  const [period, setPeriod] = useState(defaultPeriod || periods?.[0]?.value || "");

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {periods && (
            <div className="flex gap-1">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setPeriod(p.value); onPeriodChange?.(p.value); }}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    period === p.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
