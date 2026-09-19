/**
 * The LES comparison — Your LES / Should be / Difference, one row per line.
 *
 * Presentational only (no hooks), so the server-rendered worked example and the
 * live widget render the exact same markup.
 *
 * Each row stacks as a card on phones (no horizontal scroll) and reads as a
 * table row from `sm` up.
 */

import { formatCurrency } from '@/lib/utils';
import { LES_LINE_LABELS, type LesRow } from '@/lib/calculations/lesCheck';

/** 'pending' = partial-month question not yet answered; 'partial' = user said the month was partial. */
export type MismatchMode = 'pending' | 'confirmed' | 'partial';

function money(n: number | null): string {
  return n === null ? '—' : formatCurrency(n, true);
}

function signedMoney(n: number): string {
  if (n === 0) return formatCurrency(0, true);
  return `${n < 0 ? '−' : '+'}${formatCurrency(Math.abs(n), true)}`;
}

function badge(row: LesRow, mode: MismatchMode): { text: string; cls: string } {
  switch (row.status) {
    case 'match':
      return { text: '✓ Matches', cls: 'bg-green-100 text-green-800' };
    case 'mismatch':
      if (mode === 'partial') return { text: 'Partial month', cls: 'bg-zinc-200 text-zinc-700' };
      if (mode === 'pending') return { text: 'Differs — see question', cls: 'bg-amber-100 text-amber-800' };
      return { text: '✕ Doesn’t match', cls: 'bg-red-100 text-red-800' };
    case 'notEntered':
      return { text: 'Not entered', cls: 'bg-zinc-100 text-zinc-500' };
    case 'oconus':
      return { text: 'Can’t check — OHA area', cls: 'bg-zinc-100 text-zinc-600' };
    case 'pending':
      return { text: 'Can’t check — verification pending', cls: 'bg-zinc-100 text-zinc-600' };
    case 'loading':
      return { text: 'Looking up…', cls: 'bg-zinc-100 text-zinc-500' };
    default:
      return { text: 'Can’t check', cls: 'bg-zinc-100 text-zinc-600' };
  }
}

export function LesComparisonTable({
  rows,
  mode,
  caption,
}: {
  rows: LesRow[];
  mode: MismatchMode;
  caption?: string;
}) {
  return (
    <div data-testid="les-comparison" className="rounded-xl border-2 border-zinc-900 bg-white overflow-hidden">
      {caption && (
        <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{caption}</p>
      )}
      <div className="hidden sm:grid sm:grid-cols-[1.1fr_1fr_1fr_1fr] gap-3 px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 border-b border-zinc-200">
        <span>LES line</span>
        <span className="text-right">Your LES</span>
        <span className="text-right">Should be</span>
        <span className="text-right">Difference</span>
      </div>
      <div className="divide-y divide-zinc-200">
        {rows.map((row) => {
          const b = badge(row, mode);
          const isMismatch = row.status === 'mismatch';
          const showGap = isMismatch && mode === 'confirmed';
          return (
            <div
              key={row.line}
              data-testid={`les-row-${row.line}`}
              data-status={row.status}
              className={[
                'px-4 py-3 sm:grid sm:grid-cols-[1.1fr_1fr_1fr_1fr] sm:gap-3 sm:items-start',
                showGap ? 'bg-red-50' : row.status === 'match' ? 'bg-green-50/40' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2 sm:block">
                <p className="text-base font-bold text-zinc-900">{LES_LINE_LABELS[row.line]}</p>
                <span
                  data-testid={`les-status-${row.line}`}
                  className={`inline-block mt-0 sm:mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.cls}`}
                >
                  {b.text}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 sm:contents">
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500 sm:hidden">Your LES</p>
                  <p data-testid={`les-entered-${row.line}`} className="text-sm sm:text-base font-medium text-zinc-800 tabular-nums">
                    {money(row.entered)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500 sm:hidden">Should be</p>
                  <p data-testid={`les-expected-${row.line}`} className="text-sm sm:text-base font-semibold text-zinc-900 tabular-nums">
                    {row.status === 'oconus' ? 'OHA' : row.status === 'pending' ? '—' : row.status === 'loading' ? '…' : money(row.expected)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500 sm:hidden">Difference</p>
                  <p
                    data-testid={`les-diff-${row.line}`}
                    className={[
                      'text-sm sm:text-base font-bold tabular-nums',
                      showGap ? 'text-red-700' : 'text-zinc-700',
                    ].join(' ')}
                  >
                    {row.diff === null ? '—' : signedMoney(row.diff)}
                  </p>
                </div>
              </div>

              {row.note && (
                <p className="mt-1.5 text-xs text-zinc-500 sm:col-span-4">{row.note}</p>
              )}
              {showGap && row.diff !== null && row.annualDiff !== null && (
                <p data-testid={`les-annual-${row.line}`} className="mt-1.5 text-sm text-red-800 sm:col-span-4">
                  Your LES shows {formatCurrency(Math.abs(row.diff), true)}/mo{' '}
                  {row.diff < 0 ? 'less' : 'more'} than the 2026 rate — {formatCurrency(Math.abs(row.annualDiff), true)} over
                  12 months.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
