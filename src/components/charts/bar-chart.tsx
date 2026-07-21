"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
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
}

interface BarChartProps {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  height?: number;
  formatValue?: (value: number) => string;
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  barSize?: number;
}

export function BarChart({
  data,
  series,
  xKey,
  height = 300,
  formatValue = (v) => String(v),
  stacked = false,
  horizontal = false,
  showGrid = true,
  showLegend = true,
  barSize = 24,
}: BarChartProps) {
  const Chart = horizontal ? (
    <RechartsBarChart
      data={data}
      layout="vertical"
      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      barSize={barSize}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />}
      <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={formatValue} />
      <YAxis type="category" dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} width={90} />
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
        <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} stackId={stacked ? "stack" : undefined} radius={[4, 4, 0, 0]} />
      ))}
    </RechartsBarChart>
  ) : (
    <RechartsBarChart
      data={data}
      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      barSize={barSize}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
      <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={formatValue} />
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
        <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} stackId={stacked ? "stack" : undefined} radius={[4, 4, 0, 0]} />
      ))}
    </RechartsBarChart>
  );

  return <ResponsiveContainer width="100%" height={height}>{Chart}</ResponsiveContainer>;
}
