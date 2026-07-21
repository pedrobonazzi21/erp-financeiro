"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Series {
  key: string;
  name: string;
  color: string;
  fillOpacity?: number;
}

interface AreaChartProps {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  height?: number;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function AreaChart({
  data,
  series,
  xKey,
  height = 300,
  formatValue = (v) => String(v),
  showGrid = true,
  showLegend = true,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-xs font-medium mb-1">{label}</p>
                {payload.map((entry) => (
                  <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: {formatValue(entry.value as number)}
                  </p>
                ))}
              </div>
            );
          }}
        />
        {showLegend && <Legend />}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            fillOpacity={s.fillOpacity ?? 1}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
