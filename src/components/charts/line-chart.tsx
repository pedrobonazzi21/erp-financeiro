"use client";

import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  height?: number;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function LineChart({
  data,
  series,
  xKey,
  height = 300,
  formatValue = (v) => String(v),
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
