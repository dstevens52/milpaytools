import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/calculators/shared/InfoTip';
import { formatCurrency } from '@/lib/utils';

interface ResultRowProps {
  label: string;
  monthly?: number;
  annual?: number;
  value?: string;
  highlight?: boolean;
  tooltip?: string; // info icon next to the label
  note?: ReactNode; // small line under the row
}

function ResultRow({ label, monthly, annual, value, highlight, tooltip, note }: ResultRowProps) {
  const formatted =
    value ??
    (monthly !== undefined
      ? `${formatCurrency(monthly * 12)}/yr`
      : '—');

  const row = (
    <div
      className={[
        'flex items-baseline justify-between gap-4',
        note ? '' : 'py-2',
        highlight
          ? 'border-t-2 border-red-700 mt-1 pt-3'
          : note ? '' : 'border-t border-zinc-100',
      ].join(' ')}
    >
      <span
        className={[
          'text-sm min-w-0',
          highlight ? 'font-semibold text-red-700 text-base' : 'text-zinc-600',
        ].join(' ')}
      >
        {label}
        {tooltip && <InfoTip label="" tooltip={tooltip} className="ml-1 align-middle" />}
      </span>
      <span
        className={[
          'font-mono tabular-nums text-right whitespace-nowrap shrink-0',
          highlight ? 'font-bold text-red-700 text-lg' : 'text-zinc-800',
        ].join(' ')}
      >
        {formatted}
      </span>
    </div>
  );

  if (!note) return row;
  return (
    <div className="border-t border-zinc-100 py-2">
      {row}
      <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{note}</p>
    </div>
  );
}

interface ResultCardProps {
  title: string;
  rows: ResultRowProps[];
  dataYear?: string;
  className?: string;
}

export function ResultCard({ title, rows, dataYear, className }: ResultCardProps) {
  return (
    <Card variant="result" className={className}>
      <h3 className="font-semibold text-zinc-900 text-lg mb-1">{title}</h3>
      {dataYear && <p className="text-xs text-zinc-400 mb-3">Based on {dataYear} rates</p>}
      <div className="divide-y divide-zinc-100">
        {rows.map((row, i) => (
          <ResultRow key={i} {...row} />
        ))}
      </div>
    </Card>
  );
}
