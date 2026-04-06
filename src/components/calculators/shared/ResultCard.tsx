import { Card } from '@/components/ui/Card';

interface ResultRowProps {
  label: string;
  monthly?: number;
  annual?: number;
  value?: string;
  highlight?: boolean;
}

function ResultRow({ label, monthly, annual, value, highlight }: ResultRowProps) {
  const formatted =
    value ??
    (monthly !== undefined
      ? `$${monthly.toLocaleString()}/mo · $${(monthly * 12).toLocaleString()}/yr`
      : '—');

  return (
    <div
      className={[
        'flex items-baseline justify-between gap-4 py-2',
        highlight
          ? 'border-t-2 border-red-700 mt-1 pt-3'
          : 'border-t border-zinc-100',
      ].join(' ')}
    >
      <span
        className={[
          'text-sm',
          highlight ? 'font-semibold text-red-700 text-base' : 'text-zinc-600',
        ].join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'font-mono tabular-nums text-right',
          highlight ? 'font-bold text-red-700 text-lg' : 'text-zinc-800',
        ].join(' ')}
      >
        {formatted}
      </span>
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
