"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Slice {
  key: string;
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: Slice[];
  height?: number;
  formatValue?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  donut?: boolean;
}

export function PieChart({
  data,
  height = 300,
  formatValue = (v) => String(v),
  innerRadius = 0,
  outerRadius = 100,
  showLegend = true,
  donut = false,
}: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? 60 : innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const entry = payload[0];
            const pct = ((entry.value as number) / total) * 100;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-xs font-medium" style={{ color: entry.color }}>
                  {entry.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatValue(entry.value as number)} ({pct.toFixed(1)}%)
                </p>
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        )}
        {donut && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-foreground">
            {formatValue(total)}
          </text>
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
