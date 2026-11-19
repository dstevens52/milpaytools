'use client';

import { Fragment, memo, useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  formatChangeDollars,
  formatChangePct,
  formatRate,
  type BahChangeTableRow,
} from '@/lib/calculations/bahChanges';

/**
 * /bah/changes full table. Server-rendered in full, in the default order
 * (% change, descending), so every row is in the HTML. Sorting is a client
 * enhancement: real <button>s in the headers, aria-sort on the active header.
 * Receives only the slim rows (no rate tables).
 *
 * Sorting speed (P1 #4, docs/perf/p1-step1-report.md): each row is a memoized <Row> whose props
 * (the row object from `rows`) never change, so a sort only moves rows and re-renders none; and
 * the row order follows a deferred copy of the sort state, so the click paints the new header
 * state (aria-sort, arrow) at once and the 338-row reorder commits right after, outside the
 * interaction's frame.
 */

/** Area name with a line-break opportunity after each "/" (e.g. "Shreveport/Barksdale AFB"). */
function breakable(name: string) {
  return name.split('/').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <>/<wbr /></>}
      {part}
    </Fragment>
  ));
}

type SortKey = 'pct' | 'abs' | 'name';
type Dir = 'ascending' | 'descending';

const DEFAULT_DIR: Record<SortKey, Dir> = { pct: 'descending', abs: 'descending', name: 'ascending' };

function cmp(key: SortKey, a: BahChangeTableRow, b: BahChangeTableRow): number {
  if (key === 'name') return a.name.localeCompare(b.name);
  const av = a[key];
  const bv = b[key];
  if (av === null || bv === null) return av === bv ? a.name.localeCompare(b.name) : av === null ? 1 : -1;
  // Ties: the other measure, then name (matches the server order for % desc).
  const other = key === 'pct' ? 'abs' : 'pct';
  return av - bv || (a[other] ?? 0) - (b[other] ?? 0) || b.name.localeCompare(a.name);
}

/** One table row. Memoized: the row objects come from the server props and never change. */
const Row = memo(function Row({ r }: { r: BahChangeTableRow }) {
  return (
    <tr id={`mha-${r.mha}`} className="border-b border-zinc-100 last:border-0 target:bg-amber-50" data-mha={r.mha}>
      <th scope="row" className="px-1.5 sm:px-3 py-2 text-left font-normal text-zinc-800">
        {r.href ? (
          <Link href={r.href} className="text-blue-700 underline hover:text-blue-800">
            {breakable(r.name)}
          </Link>
        ) : (
          breakable(r.name)
        )}
        {r.marked && <sup className="text-amber-700 ml-0.5">†</sup>}
      </th>
      <td className="px-1.5 sm:px-3 py-2 text-right tabular-nums text-zinc-600 whitespace-nowrap">
        {r.prior === null ? '—' : formatRate(r.prior)}
      </td>
      <td className="px-1.5 sm:px-3 py-2 text-right tabular-nums text-zinc-900 whitespace-nowrap">{formatRate(r.current)}</td>
      <td
        className={`px-1.5 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap ${
          r.abs === null ? 'text-zinc-500' : r.abs > 0 ? 'text-green-700' : r.abs < 0 ? 'text-red-700' : 'text-zinc-500'
        }`}
      >
        {r.abs === null ? 'new' : formatChangeDollars(r.abs)}
      </td>
      <td
        className={`px-1.5 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap ${
          r.pct === null ? 'text-zinc-500' : r.pct > 0 ? 'text-green-700' : r.pct < 0 ? 'text-red-700' : 'text-zinc-500'
        }`}
      >
        {r.pct === null ? '—' : formatChangePct(r.pct)}
      </td>
    </tr>
  );
});

export function BahChangesTable({
  rows,
  year,
  priorYear,
}: {
  rows: BahChangeTableRow[];
  year: string;
  priorYear: string;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({ key: 'pct', dir: 'descending' });

  // Headers follow `sort` immediately; the rows follow this deferred copy (see the note above).
  const rowSort = useDeferredValue(sort);

  const sorted = useMemo(() => {
    // The server order is the default; keep it untouched until the user sorts.
    if (rowSort.key === 'pct' && rowSort.dir === 'descending') return rows;
    const out = [...rows].sort((a, b) => cmp(rowSort.key, a, b));
    if (rowSort.dir === 'descending') out.reverse();
    // Rows without a prior rate stay last either way.
    return rowSort.key === 'name' ? out : [...out.filter((r) => r.pct !== null), ...out.filter((r) => r.pct === null)];
  }, [rows, rowSort]);

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'ascending' ? 'descending' : 'ascending' }
        : { key, dir: DEFAULT_DIR[key] },
    );

  const ariaSort = (key: SortKey) => (sort.key === key ? sort.dir : 'none');
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 'ascending' ? ' ▲' : ' ▼') : '');

  const sortButton = (k: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => onSort(k)}
      className="font-semibold text-zinc-700 hover:text-red-700 underline decoration-dotted underline-offset-2 sm:whitespace-nowrap"
      data-testid={`bah-changes-sort-${k}`}
    >
      {label}
      <span aria-hidden="true">{arrow(k)}</span>
    </button>
  );

  return (
    <div
      className="overflow-auto max-h-[70vh] md:max-h-none rounded-lg border border-zinc-200"
      data-testid="bah-changes-scroll"
    >
      <table className="w-full text-[13px] sm:text-sm" data-testid="bah-changes-table">
        <caption className="sr-only">
          {`BAH for an E-5 with dependents in every Military Housing Area, ${priorYear} and ${year}, with the change. Use the column buttons to sort.`}
        </caption>
        <thead className="sticky top-0 z-10 bg-zinc-50">
          <tr className="border-b border-zinc-200 text-left">
            <th scope="col" aria-sort={ariaSort('name')} className="px-1.5 sm:px-3 py-2.5">
              {sortButton('name', 'Area (A–Z)')}
            </th>
            <th scope="col" className="px-1.5 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right">{priorYear}</th>
            <th scope="col" className="px-1.5 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right">{year}</th>
            <th scope="col" aria-sort={ariaSort('abs')} className="px-1.5 sm:px-3 py-2.5 text-right">
              {sortButton('abs', '$ change')}
            </th>
            <th scope="col" aria-sort={ariaSort('pct')} className="px-1.5 sm:px-3 py-2.5 text-right">
              {sortButton('pct', '% change')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <Row key={r.mha} r={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
