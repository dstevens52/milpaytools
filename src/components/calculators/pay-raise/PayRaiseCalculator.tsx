'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
  type PayGrade,
} from '@/types/military';
import { PAY_RAISE_2027, TIER_ASSUMPTION_NOTE } from '@/data/pay-raise/2027';
import {
  getColumns,
  resultFor,
  resultLabel,
  pay2026,
  isAssumedTier,
  CAP_NOTE_PENDING,
  ESTIMATE_NOTE,
} from '@/lib/calculations/payRaise';
import { parseGrade } from '@/lib/urlParams';
import { formatCurrency } from '@/lib/utils';
import { fireCalculatorEvent } from '@/lib/analytics';

const GRADE_GROUPS: { label: string; grades: readonly PayGrade[] }[] = [
  { label: 'Enlisted', grades: ENLISTED_GRADES },
  { label: 'Warrant Officer', grades: WARRANT_GRADES },
  { label: 'Officer', grades: OFFICER_GRADES },
  { label: 'Officer (Prior Enlisted)', grades: PRIOR_ENLISTED_OFFICER_GRADES },
];

const money = (n: number) => formatCurrency(n, true);

/** Accepts both "E-5" and "e5" (rank-page links use the short form). */
function parseGradeParam(raw: string | null): PayGrade | null {
  return parseGrade(raw ? raw.replace(/-/g, '') : null);
}

function yosText(y: number) {
  return y === 0 ? 'less than 2 years' : `${y} year${y === 1 ? '' : 's'}`;
}

const noopSubscribe = () => () => {};

function parsePrefill(search: string): { grade: PayGrade | null; yos: number | null } {
  const params = new URLSearchParams(search);
  const n = parseInt(params.get('yos') ?? '', 10);
  return {
    grade: parseGradeParam(params.get('grade')),
    yos: !isNaN(n) && n >= 0 && n <= 40 ? n : null,
  };
}

export function PayRaiseCalculator() {
  // Prefill from ?grade= and ?yos=. The server snapshot is '' (static page), so
  // hydration renders the defaults and React then re-renders with the URL values.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => '');
  const prefill = useMemo(() => parsePrefill(search), [search]);
  const [userGrade, setUserGrade] = useState<PayGrade | null>(null);
  const [userYos, setUserYos] = useState<number | null>(null);
  const grade = userGrade ?? prefill.grade ?? 'E-5';
  const yos = userYos ?? prefill.yos ?? 6;

  // Analytics: user changes only (not the URL prefill), debounced.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const trackChange = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fireCalculatorEvent('pay-raise'), 800);
  };
  const setGrade = (g: PayGrade) => {
    setUserGrade(g);
    trackChange();
  };
  const setYos = (y: number) => {
    setUserYos(y);
    trackChange();
  };

  const config = PAY_RAISE_2027;
  const columns = getColumns(config);
  const base = pay2026(grade, yos);
  const showTierNote = isAssumedTier(grade) && config.status !== 'official-table';

  const selectClass =
    'w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500';

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6" data-testid="raise-calculator">
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1">
          <label htmlFor="raise-grade" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Pay Grade
          </label>
          <select id="raise-grade" value={grade} onChange={(e) => setGrade(e.target.value as PayGrade)} className={selectClass}>
            {GRADE_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.grades.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr} — {RANK_DISPLAY[gr].replace(/^[A-Z0-9-]+ /, '')}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="raise-yos" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Years of Service
          </label>
          <select id="raise-yos" value={yos} onChange={(e) => setYos(Number(e.target.value))} className={selectClass}>
            {Array.from({ length: 41 }, (_, i) => i).map((y) => (
              <option key={y} value={y}>
                {y === 0 ? 'Less than 2 years' : `${y} year${y !== 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-400 mt-1">
            Pay tables use &ldquo;over X years&rdquo; brackets — select your completed years.
          </p>
        </div>
      </div>

      {base === null ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5" data-testid="raise-not-applicable">
          <p className="text-sm font-semibold text-zinc-800 mb-1">Not applicable</p>
          <p className="text-sm text-zinc-600">
            {`DFAS publishes no ${grade} basic pay rate at ${yosText(yos)} of service, so there is no 2026 or 2027 figure to show. Try more years of service.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" data-testid="raise-2026">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
              {`2026 official pay — ${grade}, ${yosText(yos)}`}
            </p>
            <p className="text-2xl font-extrabold text-zinc-900 tabular-nums">
              {money(base)}
              <span className="text-sm font-normal text-zinc-500 ml-1">/month</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">DFAS 2026 basic pay table. The only guaranteed figure.</p>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${columns.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {columns.map((col) => {
              const r = resultFor(col, grade, yos, config);
              return (
                <div key={col.id} className="rounded-lg border border-zinc-300 bg-white p-4" data-testid={`raise-col-${col.id}`}>
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1">
                    {resultLabel(col, grade)}
                  </p>
                  {r.applicable ? (
                    <>
                      <p className="text-2xl font-extrabold text-zinc-900 tabular-nums">
                        {money(r.projected)}
                        <span className="text-sm font-normal text-zinc-500 ml-1">/month in 2027</span>
                      </p>
                      <p className="text-sm text-zinc-700 mt-1 tabular-nums">
                        {`+${money(r.monthlyIncrease)}/month · +${money(r.annualIncrease)}/year`}
                        {r.capped && config.caps.pending && ` at the ${config.caps.capYear} cap`}
                      </p>
                      {r.capped && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2" data-testid="raise-cap-note">
                          {`${config.caps.pending ? CAP_NOTE_PENDING : 'Held at the 2027 pay cap.'} Without the cap: ${money(r.uncappedAmount)}.`}
                        </p>
                      )}
                      {r.estimate && <p className="text-xs text-zinc-500 mt-2">{ESTIMATE_NOTE}</p>}
                      {col.kind === 'enacted' && (
                        <p className="text-xs text-zinc-500 mt-1">Calculated from the law until DFAS publishes the 2027 table.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-zinc-600">Not applicable</p>
                  )}
                </div>
              );
            })}
          </div>

          {showTierNote && (
            <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded px-3 py-2" data-testid="raise-tier-note">
              {TIER_ASSUMPTION_NOTE}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            Basic pay only. BAH and BAS are set separately and are excluded from federal taxable income.
          </p>
        </div>
      )}
    </div>
  );
}
