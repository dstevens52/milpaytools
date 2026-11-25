'use client';

import { memo } from 'react';
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
 * "E-6 (SSG · SSgt · PO1 · TSgt · TSgt)" (RANK_DISPLAY, from src/data/ranks/rankTitles.ts):
 * on phones, the grade on line 1 and the service abbreviations below in small muted
 * text. Lines break only between services (and before "— prior enlisted"), never
 * inside an abbreviation such as "2d Lt". From `sm` up, inline after the grade.
 * The cell's text is the label exactly: the spans add no characters.
 */
function GradeLabel({ label }: { label: string }) {
  const i = label.indexOf(' (');
  if (i === -1) return <>{label}</>;
  const slots = label.slice(i + 1).split(' · ');
  return (
    <>
      {label.slice(0, i)}{' '}
      <span className="block sm:inline lg:whitespace-nowrap text-xs sm:text-sm font-normal sm:font-medium text-zinc-500 sm:text-zinc-700">
        {slots.map((slot, k) => {
          const [abbr, suffix] = slot.split(' — ');
          const last = k === slots.length - 1;
          // One unbreakable run per abbreviation; a slot with two ("MGySgt/SgtMaj") may
          // break after the slash. The separator stays with the abbreviation before it,
          // so no line starts with "·".
          const parts = abbr.split('/');
          return (
            <span key={k}>
              {parts.map((p, j) => {
                const lastPart = j === parts.length - 1;
                return (
                  <span key={j}>
                    <span className="whitespace-nowrap">
                      {lastPart ? (last ? p : `${p} ·`) : `${p}/`}
                    </span>
                    {!lastPart && <wbr />}
                  </span>
                );
              })}
              {suffix !== undefined && <> — {suffix}</>}
              {!last && ' '}
            </span>
          );
        })}
      </span>
    </>
  );
}

/** One grade's row. Same markup as before; memoized so unchanged rows skip re-rendering. */
const RateRow = memo(function RateRow({
  grade, w, wo, prevW, prevWO, showYoYW, showYoYWO, isSelected, boldW, boldWO, currentYear, priorYear,
}: {
  grade: string;
  w: number | undefined;
  wo: number | undefined;
  prevW: number | undefined;
  prevWO: number | undefined;
  showYoYW: boolean;
  showYoYWO: boolean;
  isSelected: boolean;
  boldW: boolean;
  boldWO: boolean;
  currentYear: string;
  priorYear: string;
}) {
  return (
    <tr
      data-grade={grade}
      aria-current={isSelected ? 'true' : undefined}
      className={`transition-colors ${isSelected ? 'bg-red-50' : 'hover:bg-zinc-50'}`}
    >
      <td className="px-2.5 sm:px-4 py-2.5 text-zinc-700 font-medium align-top">
        <GradeLabel label={RANK_DISPLAY[grade as keyof typeof RANK_DISPLAY]} />
      </td>
      <td className={`px-2.5 sm:px-4 py-2.5 text-right tabular-nums align-top ${boldW ? 'font-bold' : ''}`}>
        <span className="block text-zinc-900 font-semibold">{w !== undefined ? fmt(w) : '—'}</span>
        {w !== undefined && showYoYW && (
          <YoYDelta curr={w} prev={prevW} currentYear={currentYear} priorYear={priorYear} compact className="block text-[11px] font-normal mt-0.5" />
        )}
      </td>
      <td className={`px-2.5 sm:px-4 py-2.5 text-right tabular-nums align-top ${boldWO ? 'font-bold' : ''}`}>
        <span className="block text-zinc-600">{wo !== undefined ? fmt(wo) : '—'}</span>
        {wo !== undefined && showYoYWO && (
          <YoYDelta curr={wo} prev={prevWO} currentYear={currentYear} priorYear={priorYear} compact className="block text-[11px] font-normal mt-0.5" />
        )}
      </td>
    </tr>
  );
});

/**
 * The station page's full BAH rate table: every pay grade, with and without
 * dependents. Open by default since Build 04 (no preview line, no expander), so
 * all rows are visible in the server HTML. The selected grade's row is tinted.
 * Heading text and cell markup are read by tests/e2e/station-serp.spec.ts.
 */
export function CollapsibleRateTable({ locationName, ratesW, ratesWO, selectedGrade, selectedHasDependents, ratesWPrev, ratesWOPrev, currentYear = BAH_YEAR, priorYear = BAH_PRIOR_YEAR, hasDecrease = false, effectiveLabel = BAH_EFFECTIVE_DATE_LABEL }: Props) {
  const hasPrevW = !!ratesWPrev && Object.keys(ratesWPrev).length > 0;
  const hasPrevWO = !!ratesWOPrev && Object.keys(ratesWOPrev).length > 0;

  // Each row is a memoized RateRow with primitive props: a rank change re-renders only the rows
  // whose highlight changes (P1 #8, docs/perf/p1-step1-report.md).
  function renderRow(grade: string) {
    const w = ratesW[grade];
    const wo = ratesWO[grade];
    if (w === undefined && wo === undefined) return null;
    const isSelected = selectedGrade === grade;
    return (
      <RateRow
        key={grade}
        grade={grade}
        w={w}
        wo={wo}
        prevW={hasPrevW ? ratesWPrev![grade] : undefined}
        prevWO={hasPrevWO ? ratesWOPrev![grade] : undefined}
        showYoYW={hasPrevW}
        showYoYWO={hasPrevWO}
        isSelected={isSelected}
        boldW={isSelected && selectedHasDependents === true}
        boldWO={isSelected && selectedHasDependents === false}
        currentYear={currentYear}
        priorYear={priorYear}
      />
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
