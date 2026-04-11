'use client';

import { useState } from 'react';
import Link from 'next/link';
import { payTable } from '@/data/pay-tables/2026';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  YOS_BREAKPOINTS,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade, YearsOfService } from '@/types/military';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Given a grade and a YOS column index, return the pay amount (or null if N/A). */
function getPayAtBracket(grade: PayGrade, yosCol: number): number | null {
  const entry = payTable[grade];
  if (!entry) return null;
  const keys = Object.keys(entry)
    .map(Number)
    .sort((a, b) => a - b);
  const validKeys = keys.filter((k) => k <= yosCol);
  if (validKeys.length === 0) return null;
  const bracketKey = validKeys[validKeys.length - 1] as YearsOfService;
  return entry[bracketKey] ?? null;
}

/** Return the bracket key (pay table key) that covers the given YOS for a grade. */
function getActiveBracket(grade: PayGrade, yos: number): number | null {
  const entry = payTable[grade];
  if (!entry) return null;
  const keys = Object.keys(entry)
    .map(Number)
    .sort((a, b) => a - b);
  const validKeys = keys.filter((k) => k <= yos);
  if (validKeys.length === 0) return null;
  return validKeys[validKeys.length - 1];
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const YOS_COLS = [...YOS_BREAKPOINTS] as number[];

// Officer display order: interleave prior-enlisted grades
const OFFICER_TABLE_GRADES: PayGrade[] = [
  'O-1', 'O-1E', 'O-2', 'O-2E', 'O-3', 'O-3E',
  'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];

// All dropdown grades grouped
type GradeOption = { grade: PayGrade; label: string; group: string };
const ALL_LOOKUP_GRADES: GradeOption[] = [
  ...ENLISTED_GRADES.map((g) => ({ grade: g as PayGrade, label: g, group: 'Enlisted' })),
  ...WARRANT_GRADES.map((g) => ({ grade: g as PayGrade, label: g, group: 'Warrant Officer' })),
  ...OFFICER_GRADES.map((g) => ({ grade: g as PayGrade, label: g, group: 'Officer' })),
  ...PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({
    grade: g as PayGrade,
    label: g,
    group: 'Officer (Prior Enlisted)',
  })),
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PayTableSectionProps {
  title: string;
  grades: PayGrade[];
  showAnnual: boolean;
  selectedGrade: PayGrade;
  selectedYOS: number;
}

function PayTableSection({
  title,
  grades,
  showAnnual,
  selectedGrade,
  selectedYOS,
}: PayTableSectionProps) {
  const activeBracket = getActiveBracket(selectedGrade, selectedYOS);

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 shadow-sm">
        <table className="min-w-max w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-100 border-b border-zinc-200">
              {/* Sticky grade column header */}
              <th
                scope="col"
                className="sticky left-0 z-10 bg-zinc-100 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap border-r border-zinc-200"
              >
                Grade
              </th>
              {YOS_COLS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={[
                    'px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap',
                    // Highlight the active YOS column header for the selected grade
                    grades.includes(selectedGrade) && col === activeBracket
                      ? 'bg-red-50 text-red-700'
                      : 'text-zinc-500',
                  ].join(' ')}
                >
                  {col === 0 ? '< 2' : `${col}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, rowIdx) => {
              const isSelectedGrade = grade === selectedGrade;
              const isPriorEnlisted = PRIOR_ENLISTED_OFFICER_GRADES.includes(grade as 'O-1E' | 'O-2E' | 'O-3E');
              return (
                <tr
                  key={grade}
                  className={[
                    'border-b border-zinc-100 last:border-b-0',
                    isSelectedGrade ? 'bg-red-50/60' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40',
                  ].join(' ')}
                >
                  {/* Sticky grade label */}
                  <td
                    className={[
                      'sticky left-0 z-10 px-4 py-2 font-semibold whitespace-nowrap border-r border-zinc-200',
                      isSelectedGrade
                        ? 'bg-red-50 text-red-700'
                        : rowIdx % 2 === 0
                        ? 'bg-white text-zinc-900'
                        : 'bg-zinc-50 text-zinc-900',
                      isPriorEnlisted ? 'pl-7 text-zinc-600 font-normal text-xs' : '',
                    ].join(' ')}
                  >
                    {isPriorEnlisted ? (
                      <span>
                        <span className="text-zinc-400 mr-1">↳</span>
                        {grade}
                        <span className="ml-1 text-zinc-400 font-normal text-[10px]">prior enl.</span>
                      </span>
                    ) : (
                      grade
                    )}
                  </td>

                  {YOS_COLS.map((col) => {
                    const pay = getPayAtBracket(grade, col);
                    const amount = pay !== null ? (showAnnual ? pay * 12 : pay) : null;
                    const isHighlighted =
                      isSelectedGrade && activeBracket !== null && col === activeBracket;

                    return (
                      <td
                        key={col}
                        className={[
                          'px-3 py-2 text-right tabular-nums whitespace-nowrap',
                          isHighlighted
                            ? 'bg-red-600 text-white font-bold rounded-sm'
                            : amount !== null
                            ? 'text-zinc-700'
                            : 'text-zinc-300',
                        ].join(' ')}
                      >
                        {amount !== null ? formatMoney(amount) : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        — = not applicable for this grade at that years of service
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PayChartsClient() {
  const [selectedGrade, setSelectedGrade] = useState<PayGrade>('E-5');
  const [selectedYOS, setSelectedYOS] = useState<number>(6);
  const [showAnnual, setShowAnnual] = useState(false);

  const activePay = getPayAtBracket(selectedGrade, selectedYOS);
  const monthlyPay = activePay;
  const annualPay = activePay !== null ? activePay * 12 : null;

  const gradesByGroup = ALL_LOOKUP_GRADES.reduce<Record<string, GradeOption[]>>((acc, g) => {
    if (!acc[g.group]) acc[g.group] = [];
    acc[g.group].push(g);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* ── Quick Lookup ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-zinc-900 mb-1">Quick Lookup</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Select your rank and years of service to see your pay rate instantly.
        </p>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {/* Grade select */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Pay Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as PayGrade)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {Object.entries(gradesByGroup).map(([group, options]) => (
                  <optgroup key={group} label={group}>
                    {options.map(({ grade, label }) => (
                      <option key={grade} value={grade}>
                        {label} — {RANK_DISPLAY[grade].replace(/^[A-Z0-9-]+ /, '')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* YOS select */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Years of Service
              </label>
              <select
                value={selectedYOS}
                onChange={(e) => setSelectedYOS(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {Array.from({ length: 41 }, (_, i) => i).map((y) => (
                  <option key={y} value={y}>
                    {y === 0 ? 'Less than 2 years' : `${y} year${y !== 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {monthlyPay !== null ? (
            <div className="rounded-lg bg-red-50 border border-red-100 p-5">
              <p className="text-sm text-red-700 font-semibold mb-1">
                {selectedGrade} with {selectedYOS === 0 ? 'less than 2' : selectedYOS} year{selectedYOS !== 1 ? 's' : ''} of service
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <div>
                  <span className="text-3xl font-extrabold text-zinc-900 tabular-nums">
                    {formatMoney(monthlyPay)}
                  </span>
                  <span className="text-zinc-500 text-sm ml-1">/month</span>
                </div>
                <div className="text-zinc-500 text-sm sm:mb-0.5">
                  {annualPay !== null && (
                    <span>({formatMoney(annualPay)}/year)</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Basic pay only — does not include BAH, BAS, or other allowances.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
              <p className="text-sm text-zinc-500">
                {selectedGrade} is not applicable at {selectedYOS} years of service.
                Select a different rank or years of service.
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-sm text-zinc-600">
              Basic pay is only part of your compensation.{' '}
              <Link
                href="/calculators/total-compensation"
                className="text-blue-700 underline hover:text-blue-800"
              >
                See your full compensation including BAH, BAS, and tax advantages →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Monthly / Annual toggle ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zinc-700">Show amounts as:</span>
        <div className="inline-flex rounded-md border border-zinc-200 overflow-hidden">
          <button
            onClick={() => setShowAnnual(false)}
            className={[
              'px-4 py-1.5 text-sm font-medium transition-colors',
              !showAnnual
                ? 'bg-red-700 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            Monthly
          </button>
          <button
            onClick={() => setShowAnnual(true)}
            className={[
              'px-4 py-1.5 text-sm font-medium transition-colors border-l border-zinc-200',
              showAnnual
                ? 'bg-red-700 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            Annual
          </button>
        </div>
        <span className="text-xs text-zinc-400 hidden sm:inline">
          Your selected grade is highlighted in each table.
        </span>
      </div>

      {/* ── Enlisted Table ────────────────────────────────────────────────── */}
      <PayTableSection
        title="Enlisted Pay Chart — E-1 through E-9"
        grades={ENLISTED_GRADES}
        showAnnual={showAnnual}
        selectedGrade={selectedGrade}
        selectedYOS={selectedYOS}
      />

      {/* ── Warrant Officer Table ─────────────────────────────────────────── */}
      <PayTableSection
        title="Warrant Officer Pay Chart — W-1 through W-5"
        grades={WARRANT_GRADES}
        showAnnual={showAnnual}
        selectedGrade={selectedGrade}
        selectedYOS={selectedYOS}
      />

      {/* ── Officer Table ─────────────────────────────────────────────────── */}
      <PayTableSection
        title="Officer Pay Chart — O-1 through O-10"
        grades={OFFICER_TABLE_GRADES}
        showAnnual={showAnnual}
        selectedGrade={selectedGrade}
        selectedYOS={selectedYOS}
      />

      {/* ── Cross-links ───────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-2">
        <p className="text-sm font-semibold text-zinc-800">See also</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/calculators/total-compensation" className="text-blue-700 underline hover:text-blue-800">
              Total Compensation Calculator
            </Link>
            {' '}— add BAH, BAS, and tax-free allowances to your base pay
          </li>
          <li>
            <Link href="/calculators/bah" className="text-blue-700 underline hover:text-blue-800">
              BAH Calculator
            </Link>
            {' '}— look up housing allowance for any duty station ZIP code
          </li>
          <li>
            <Link href="/blog/how-much-does-an-e5-really-make-2026" className="text-blue-700 underline hover:text-blue-800">
              How Much Does an E-5 Really Make in 2026?
            </Link>
            {' '}— full compensation breakdown with BAH, tax savings, and civilian equivalent
          </li>
          <li>
            <Link href="/blog/military-tax-advantages" className="text-blue-700 underline hover:text-blue-800">
              Military Tax Advantages Most Service Members Miss
            </Link>
            {' '}— why your effective compensation is higher than basic pay
          </li>
        </ul>
      </div>
    </div>
  );
}
