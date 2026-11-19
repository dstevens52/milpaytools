'use client';

// The retirement "Projected Monthly Income Over Time" chart, split out of RetirementCalculator so
// recharts loads on demand (next/dynamic + WhenVisible, P1 #7). Markup and options unchanged.

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { buildPensionChartData } from '@/lib/calculations/retirement';

type PensionPoint = ReturnType<typeof buildPensionChartData>[number];

function PensionTooltip({ active, payload, label, formatValue }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
  formatValue: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 mb-2">Age {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {formatValue(p.value)}/mo
        </p>
      ))}
    </div>
  );
}

export function RetirementPensionChart({
  data,
  showTsp,
  showHigh3,
  formatValue,
}: {
  data: PensionPoint[];
  /** BRS with TSP income: draw the TSP band. */
  showTsp: boolean;
  /** BRS with the High-3 comparison on: draw the dashed High-3 line. */
  showHigh3: boolean;
  formatValue: (n: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="pensionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="tspGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis
          dataKey="age"
          label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 12 }}
          tick={{ fontSize: 11 }}
          height={36}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          tick={{ fontSize: 11 }}
          width={52}
        />
        <Tooltip content={<PensionTooltip formatValue={formatValue} />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          verticalAlign="top"
        />
        <Area
          type="monotone"
          dataKey="pension"
          name="Pension"
          stroke="#B91C1C"
          strokeWidth={2}
          fill="url(#pensionGrad)"
          dot={false}
        />
        {showTsp && (
          <Area
            type="monotone"
            dataKey="tsp"
            name="TSP Income"
            stroke="#1D4ED8"
            strokeWidth={2}
            fill="url(#tspGrad)"
            dot={false}
          />
        )}
        {showHigh3 && (
          <Area
            type="monotone"
            dataKey="high3"
            name="High-3 (comparison)"
            stroke="#52525B"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
