'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { PayGrade } from '@/types/military';
import { fireDeepLinkEvent } from '@/lib/analytics';
import { gradeToParam } from '@/lib/urlParams';
// Type-only: the lib reads the pay table, which must not ship to the client.
import type { StationTotalPayData, StationTotalPayRow } from '@/lib/calculations/stationTotalPay';

const fmt = (n: number) => formatCurrency(n);

/** "$3,343–$4,422", or one figure when the range is a single rate. */
function range(min: number, max: number): string {
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

/** "an E-5", "an O-3", "a W-2". */
function withArticle(grade: string): string {
  return `${/^[EO]/.test(grade) ? 'an' : 'a'} ${grade}`;
}

function listToProse(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// Shared cell styles on the row (direct-child variant) keep the 24 rows' HTML small.
const ROW = '*:px-2.5 sm:*:px-4 *:py-2.5 *:align-top';
const PART = 'hidden sm:table-cell text-right tabular-nums text-zinc-700';

const GROUPS: { label: string; test: (g: string) => boolean }[] = [
  { label: 'Enlisted', test: (g) => g.startsWith('E-') },
  { label: 'Warrant Officer', test: (g) => g.startsWith('W-') },
  { label: 'Officer (Prior Enlisted)', test: (g) => /^O-\dE$/.test(g) },
  { label: 'Officer', test: (g) => /^O-\d$/.test(g) },
];

interface Props {
  data: StationTotalPayData;
  stationName: string;
  stationSlug: string;
  zip: string;
  selectedGrade: PayGrade;
  hasDependents: boolean;
}

/**
 * Build 04b: total monthly pay (basic pay + BAH + BAS) by rank at one station.
 * Rows are computed on the server (src/lib/calculations/stationTotalPay.ts);
 * this component only picks the dependency status the page's toggle selects.
 * The prerendered HTML is the with-dependents version.
 */
export function StationTotalPayTable({ data, stationName, stationSlug, zip, selectedGrade, hasDependents }: Props) {
  // One year for every figure: the pay table's year and that year's BAH (never mixed).
  const { rows, payYear, pendingYear, e1Under4Months, lateStartGrades } = data;
  const bahYear = payYear;
  const dep = (r: StationTotalPayRow) => (hasDependents ? r.w : r.wo);
  const depText = hasDependents ? 'with dependents' : 'without dependents';

  const sel = rows.find((r) => r.grade === selectedGrade);
  const selDep = sel ? dep(sel) : null;
  let lead: string | null = null;
  if (sel && selDep && selDep.totalMin !== null && selDep.totalMax !== null) {
    const who = `At ${stationName}, ${withArticle(sel.grade)} ${depText}`;
    lead =
      selDep.totalMin === selDep.totalMax
        ? `${who} earns ${fmt(selDep.totalMax)} a month in basic pay + BAH + BAS. The ${payYear} pay table has one ${sel.grade} rate at every years-of-service step.`
        : `${who} earns between ${fmt(selDep.totalMin)} and ${fmt(selDep.totalMax)} a month in basic pay + BAH + BAS, depending on years of service.`;
  }

  const hasMissingPay = rows.some((r) => r.basicMin === null);

  function renderRow(r: StationTotalPayRow) {
    const d = dep(r);
    const isSelected = r.grade === selectedGrade;
    const hasPay = r.basicMin !== null && r.basicMax !== null;
    const href = `/calculators/total-compensation?rank=${gradeToParam(r.grade)}&zip=${zip}&dependents=${hasDependents ? 'yes' : 'no'}`;
    return (
      <tr
        key={r.grade}
        data-grade={r.grade}
        aria-current={isSelected ? 'true' : undefined}
        className={`${ROW} ${isSelected ? 'bg-red-50' : 'hover:bg-zinc-50'}`}
      >
        <th scope="row" className="text-left text-zinc-700 font-medium">
          {r.grade}
        </th>
        <td data-col="basic" className={PART}>
          {hasPay ? range(r.basicMin!, r.basicMax!) : '—'}
        </td>
        <td data-col="bah" className={PART}>
          {d ? fmt(d.bah) : '—'}
        </td>
        <td data-col="bas" className={PART}>
          {fmt(r.bas)}
        </td>
        <td className="text-right tabular-nums">
          <span data-col="total" className="block sm:inline font-semibold text-zinc-900">
            {d && d.totalMin !== null && d.totalMax !== null ? range(d.totalMin, d.totalMax) : '—'}
          </span>
          {/* Phones: the parts under the total (the separate columns are hidden). */}
          <span data-col="parts" className="block sm:hidden text-[11px] leading-4 text-zinc-500 mt-0.5">
            {`Basic ${hasPay ? range(r.basicMin!, r.basicMax!) : '—'}`}
            <br />
            {`+ BAH ${d ? fmt(d.bah) : '—'} + BAS ${fmt(r.bas)}`}
          </span>
          {!hasPay && (
            <span className="block text-[11px] text-zinc-500 mt-0.5">{`No ${payYear} basic pay published`}</span>
          )}
          <Link
            href={href}
            onClick={() =>
              fireDeepLinkEvent('bah-station', 'total-compensation', {
                grade: r.grade,
                station: stationSlug,
                placement: 'station-total-table',
              })
            }
            className="inline-block mt-1 sm:mt-0 sm:ml-3 text-xs font-medium text-red-700 underline"
          >
            Your exact total →
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <section
      aria-labelledby="station-total-pay-heading"
      data-testid="station-total-pay"
      className="bg-white rounded-lg border border-zinc-200 overflow-hidden"
    >
      <div className="px-4 sm:px-6 py-5">
        <h2 id="station-total-pay-heading" className="text-lg font-semibold text-zinc-900 mb-1">
          {`Total monthly pay at ${stationName} by rank (${payYear})`}
        </h2>
        {pendingYear && (
          <p className="text-sm text-zinc-600 mb-1" data-testid="station-total-pay-pending">
            {`${pendingYear} totals appear when the ${pendingYear} pay table is published.`}
          </p>
        )}
        {lead && (
          <p className="text-sm text-zinc-600" data-testid="station-total-pay-lead">
            {lead}
          </p>
        )}
      </div>

      <div className="border-t border-zinc-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th scope="col" className="text-left px-2.5 sm:px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">Pay Grade</th>
              <th scope="col" className="hidden sm:table-cell text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">Basic Pay</th>
              <th scope="col" className="hidden sm:table-cell text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">
                BAH <span className="font-normal text-zinc-500">({hasDependents ? 'w/ dep' : 'w/o dep'})</span>
              </th>
              <th scope="col" className="hidden sm:table-cell text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">BAS</th>
              <th scope="col" className="text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">
                Total<span className="sm:hidden font-normal text-zinc-500">{` (${hasDependents ? 'w/ dep' : 'w/o dep'})`}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {GROUPS.map((g) => {
              const groupRows = rows.filter((r) => g.test(r.grade));
              if (groupRows.length === 0) return null;
              return [
                <tr key={`h-${g.label}`} className="bg-zinc-50">
                  <td colSpan={5} className="px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {g.label}
                  </td>
                </tr>,
                ...groupRows.map(renderRow),
              ];
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 space-y-1.5 text-xs text-zinc-500" data-testid="station-total-pay-footnote">
        <p>
          {`Basic pay ranges run from the lowest to the highest monthly rate in the DFAS ${payYear} basic pay table, using only the years-of-service columns DFAS publishes for each grade`}
          {lateStartGrades.length > 0 && ` (${listToProse(lateStartGrades)} start above the first column)`}
          {`. An E-1 with less than 4 months of service gets ${fmt(e1Under4Months)} basic pay. BAH is the ${bahYear} rate for this station's housing area, ${depText}. Totals are added before rounding to the nearest dollar.`}
          {hasMissingPay && ' "—" means DFAS publishes no basic pay for that grade.'}
        </p>
        <p>Not included: special pays, allowances like FSA or COLA, and taxes. Basic pay is taxable; BAH and BAS are excluded from federal taxable income. O-8 through O-10 are not shown.</p>
        <p>
          {'Sources: '}
          <a href="https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
            {`DFAS ${payYear} basic pay`}
          </a>
          {', '}
          <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
            {`DTMO ${bahYear} BAH`}
          </a>
          {', '}
          <a href="https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/bas/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
            DFAS BAS
          </a>
          .
        </p>
      </div>
    </section>
  );
}
