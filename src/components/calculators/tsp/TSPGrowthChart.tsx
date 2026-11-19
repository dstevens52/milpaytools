'use client';

// The TSP "Balance Growth Over Time" chart, split out of TSPCalculator so recharts loads on demand
// (next/dynamic + WhenVisible, P1 #7). Markup and options unchanged.

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';

export type TSPChartPoint = { year: number; 'Your Contributions': number; 'Gov Match': number; 'Investment Growth': number };

function ChartTooltip({ active, payload, label, formatValue }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
  formatValue: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-zinc-800 mb-2">Year {label}</p>
      {[...payload].reverse().map((p) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono tabular-nums text-zinc-700">{formatValue(p.value)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-zinc-100 mt-1.5 pt-1.5 font-semibold">
        <span className="text-zinc-700">Total</span>
        <span className="font-mono tabular-nums text-zinc-900">{formatValue(total)}</span>
      </div>
    </div>
  );
}

export function TSPGrowthChart({
  data,
  showGovMatch,
  separationYear,
  formatTick,
  formatValue,
}: {
  data: TSPChartPoint[];
  /** BRS: draw the government match band. */
  showGovMatch: boolean;
  /** Year of separation when growth continues after it (phase 2), else null. */
  separationYear: number | null;
  formatTick: (n: number) => string;
  formatValue: (n: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6b7280" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#15803d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#15803d" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#71717a' }}
          tickFormatter={(v) => `Yr ${v}`}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#71717a' }}
          tickFormatter={(v) => formatTick(v)}
          width={60}
        />
        <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="Your Contributions"
          stackId="1"
          stroke="#6b7280"
          fill="url(#colorContrib)"
          strokeWidth={1.5}
        />
        {showGovMatch && (
          <Area
            type="monotone"
            dataKey="Gov Match"
            stackId="1"
            stroke="#15803d"
            fill="url(#colorGov)"
            strokeWidth={1.5}
          />
        )}
        <Area
          type="monotone"
          dataKey="Investment Growth"
          stackId="1"
          stroke="#1d4ed8"
          fill="url(#colorGrowth)"
          strokeWidth={1.5}
        />
        {separationYear !== null && (
          <ReferenceLine
            x={separationYear}
            stroke="#d97706"
            strokeDasharray="4 2"
            label={{ value: 'Separation', position: 'insideTopRight', fontSize: 10, fill: '#d97706' }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
