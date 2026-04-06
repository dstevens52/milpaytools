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
        highlight ? 'border-t-2 border-navy mt-1 pt-3' : 'border-t border-slate-100',
      ].join(' ')}
    >
      <span
        className={['text-sm', highlight ? 'font-semibold text-navy text-base' : 'text-slate-600'].join(
          ' '
        )}
      >
        {label}
      </span>
      <span
        className={[
          'font-mono tabular-nums text-right',
          highlight ? 'font-bold text-navy text-lg' : 'text-slate-800',
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
    <Card variant="gold-accent" className={className}>
      <h3 className="font-semibold text-navy text-lg mb-1">{title}</h3>
      {dataYear && <p className="text-xs text-slate-400 mb-3">Based on {dataYear} rates</p>}
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <ResultRow key={i} {...row} />
        ))}
      </div>
    </Card>
  );
}
