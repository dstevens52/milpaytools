'use client';

import { formatCurrency } from '@/lib/utils';
import { YoYDelta } from '@/components/calculators/bah/YoYDelta';
import { BAH_YEAR, BAH_PRIOR_YEAR, BAH_EFFECTIVE_DATE_LABEL } from '@/data/bah/current';
import {
  RANK_DISPLAY,
  ENLISTED_GRADES,
  WARRANT_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
} from '@/types/military';

interface Props {
  locationName: string;
  ratesW: Record<string, number>;
  ratesWO: Record<string, number>;
  selectedGrade?: string;
  selectedHasDependents?: boolean;
  ratesWPrev?: Record<string, number>;
  ratesWOPrev?: Record<string, number>;
  currentYear?: string;
  priorYear?: string;
  /** When true, a dedicated decrease block above supersedes the generic note. */
  hasDecrease?: boolean;
  /** Effective-date text for the footnote; defaults to the January table date. */
  effectiveLabel?: string;
}

const fmt = (n: number) => formatCurrency(n);

const OFFICER_GRADES = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const;

/**
 * The station page's full BAH rate table: every pay grade, with and without
 * dependents. Open by default since Build 04 (no preview line, no expander), so
 * all rows are visible in the server HTML. The selected grade's row is tinted.
 * Heading text and cell markup are read by tests/e2e/station-serp.spec.ts.
 */
export function CollapsibleRateTable({ locationName, ratesW, ratesWO, selectedGrade, selectedHasDependents, ratesWPrev, ratesWOPrev, currentYear = BAH_YEAR, priorYear = BAH_PRIOR_YEAR, hasDecrease = false, effectiveLabel = BAH_EFFECTIVE_DATE_LABEL }: Props) {
  const hasPrevW = !!ratesWPrev && Object.keys(ratesWPrev).length > 0;
  const hasPrevWO = !!ratesWOPrev && Object.keys(ratesWOPrev).length > 0;

  function renderRow(grade: string) {
    const w = ratesW[grade];
    const wo = ratesWO[grade];
    if (w === undefined && wo === undefined) return null;
    const isSelected = selectedGrade === grade;
    return (
      <tr
        key={grade}
        data-grade={grade}
        aria-current={isSelected ? 'true' : undefined}
        className={`transition-colors ${isSelected ? 'bg-red-50' : 'hover:bg-zinc-50'}`}
      >
        <td className="px-2.5 sm:px-4 py-2.5 text-zinc-700 font-medium align-top [overflow-wrap:anywhere]">{RANK_DISPLAY[grade as keyof typeof RANK_DISPLAY]}</td>
        <td className={`px-2.5 sm:px-4 py-2.5 text-right tabular-nums align-top ${isSelected && selectedHasDependents === true ? 'font-bold' : ''}`}>
          <span className="block text-zinc-900 font-semibold">{w !== undefined ? fmt(w) : '—'}</span>
          {w !== undefined && hasPrevW && (
            <YoYDelta curr={w} prev={ratesWPrev![grade]} currentYear={currentYear} priorYear={priorYear} compact className="block text-[11px] font-normal mt-0.5" />
          )}
        </td>
        <td className={`px-2.5 sm:px-4 py-2.5 text-right tabular-nums align-top ${isSelected && selectedHasDependents === false ? 'font-bold' : ''}`}>
          <span className="block text-zinc-600">{wo !== undefined ? fmt(wo) : '—'}</span>
          {wo !== undefined && hasPrevWO && (
            <YoYDelta curr={wo} prev={ratesWOPrev![grade]} currentYear={currentYear} priorYear={priorYear} compact className="block text-[11px] font-normal mt-0.5" />
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden" data-testid="bah-rate-table">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">
          {`${currentYear} BAH Rates — `}{locationName}
        </h2>
        <p className="text-sm text-zinc-500">
          {`Monthly rates for all pay grades. Source: DTMO ${currentYear} BAH data. BAH is not taxable income.`}
        </p>
      </div>

      <div>
        <div>
          <div className="border-t border-zinc-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-2.5 sm:px-4 py-3 font-semibold text-zinc-700 sm:w-48">Pay Grade</th>
                  <th className="text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">With Dependents</th>
                  <th className="text-right px-2.5 sm:px-4 py-3 font-semibold text-zinc-700">Without Dependents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Enlisted
                  </td>
                </tr>
                {ENLISTED_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Warrant Officer
                  </td>
                </tr>
                {WARRANT_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer (Prior Enlisted)
                  </td>
                </tr>
                {PRIOR_ENLISTED_OFFICER_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer
                  </td>
                </tr>
                {OFFICER_GRADES.map((grade) => renderRow(grade))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50">
            <p className="text-xs text-zinc-400">
              O-8, O-9, and O-10 receive the same BAH as O-7. Rates effective {effectiveLabel}.
              {(hasPrevW || hasPrevWO) && !hasDecrease && (
                <> Year-over-year change reflects published BAH table rates. Individual rate protection means your personal rate may differ if you&apos;ve maintained eligibility at this location.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
