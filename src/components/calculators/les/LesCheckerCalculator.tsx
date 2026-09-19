'use client';

/**
 * LES Pay Checker widget.
 *
 * Privacy: the LES dollar figures typed here never leave the browser — they are
 * only compared in memory. The one network request is the shared, CDN-cached
 * BAH lookup for the duty-station ZIP (same as every BAH tool on the site).
 * Analytics fire the calculator name only, never a value, and the whole widget
 * is masked from Clarity session replay (data-clarity-mask).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { fireCalculatorEvent } from '@/lib/analytics';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { useBahLookup, rateFor } from '@/components/calculators/shared/useBahLookup';
import type { SearchResult } from '@/lib/stationSearch';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import {
  yosOptionsFor,
  expectedBasePay,
  expectedBAS,
  isMilitaryMailZip,
  parseLesAmount,
  compareLine,
  bahMatchesOtherDependencyRate,
  isPendingVerificationGrade,
  PENDING_VERIFICATION_NOTE,
  type LesRow,
} from '@/lib/calculations/lesCheck';
import { formatCurrency } from '@/lib/utils';
import { LesComparisonTable, type MismatchMode } from './LesComparisonTable';

// Grades whose pay row is pending verification are left out of the picker —
// the checker gives no base-pay verdict on an unverified figure.
const GRADE_GROUPS: { label: string; grades: PayGrade[] }[] = [
  { label: 'Enlisted', grades: ENLISTED_GRADES },
  { label: 'Warrant Officer', grades: WARRANT_GRADES },
  { label: 'Officer', grades: OFFICER_GRADES },
  { label: 'Officer (Prior Enlisted)', grades: PRIOR_ENLISTED_OFFICER_GRADES },
].map((g) => ({ ...g, grades: g.grades.filter((gr) => !isPendingVerificationGrade(gr)) }));

const SELECT_CLS = [
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900',
  'focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent',
].join(' ');

type PartialAnswer = 'unanswered' | 'yes' | 'no';

function MoneyInput({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const invalid = value.trim() !== '' && parseLesAmount(value) === null;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1">
        {label} <span className="font-normal text-zinc-400">(optional)</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-zinc-400">$</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Amount"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          className={[
            'w-full rounded-md border bg-white py-3 pl-7 pr-3 text-base text-zinc-900 tabular-nums',
            'focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent',
            invalid ? 'border-red-400' : 'border-zinc-300',
          ].join(' ')}
        />
      </div>
      <p id={`${id}-hint`} className={`text-xs mt-1 ${invalid ? 'text-red-600' : 'text-zinc-500'}`}>
        {invalid ? 'Enter dollars and cents only — digits and one decimal point' : hint}
      </p>
    </div>
  );
}

export function LesCheckerCalculator() {
  const [grade, setGrade] = useState<PayGrade | ''>('');
  const [yosRaw, setYos] = useState('');
  const [zip, setZip] = useState('');
  const [station, setStation] = useState<SearchResult | null>(null);
  const [deps, setDeps] = useState<'' | 'with' | 'without'>('');
  const [lesBase, setLesBase] = useState('');
  const [lesBah, setLesBah] = useState('');
  const [lesBas, setLesBas] = useState('');
  // The partial-month answer belongs to one specific set of mismatched lines;
  // a new mismatch re-asks the question.
  const [partialAnswer, setPartialAnswer] = useState<{ key: string; answer: PartialAnswer }>({ key: '', answer: 'unanswered' });

  const yosOptions = useMemo(() => (grade ? yosOptionsFor(grade) : []), [grade]);
  // A grade change can drop the selected column (e.g. E-7 over 2 → E-8); treat it as unselected.
  const yos = yosOptions.some((o) => o.value === yosRaw) ? yosRaw : '';

  const { data: bah, loading: bahLoading } = useBahLookup(zip);

  // Hydration marker for E2E: inputs made before hydration are discarded by React.
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    sectionRef.current?.setAttribute('data-hydrated', 'true');
  }, []);

  const enteredBase = parseLesAmount(lesBase);
  const enteredBah = parseLesAmount(lesBah);
  const enteredBas = parseLesAmount(lesBas);

  const stationOconus =
    station?.oconus === true || isMilitaryMailZip(zip) || (bah?.territory ?? false);

  const rows: LesRow[] | null = useMemo(() => {
    if (!grade) return null;

    // Defensive: the picker omits these grades, so this only fires if one
    // reaches the widget another way.
    const base = isPendingVerificationGrade(grade)
      ? {
          line: 'basePay' as const, status: 'pending' as const, entered: enteredBase,
          expected: null, diff: null, annualDiff: null, note: PENDING_VERIFICATION_NOTE,
        }
      : compareLine(
          'basePay',
          enteredBase,
          yos ? expectedBasePay(grade, yos) : null,
          yos ? 'This grade has no pay-table column at that years-of-service step.' : 'Choose your years of service to check base pay.',
        );

    let bahRow: LesRow;
    if (enteredBah === null) {
      bahRow = compareLine('bah', null, null);
    } else if (stationOconus) {
      bahRow = {
        line: 'bah', status: 'oconus', entered: enteredBah, expected: null, diff: null, annualDiff: null,
        note: 'Overseas and U.S. territory stations pay Overseas Housing Allowance (OHA), not BAH. This tool can’t check OHA.',
      };
    } else if (!zip) {
      bahRow = compareLine('bah', enteredBah, null, 'Add your duty station to check BAH.');
    } else if (!deps) {
      bahRow = compareLine('bah', enteredBah, null, 'Choose your dependency status to check BAH.');
    } else if (bahLoading || !bah) {
      bahRow = { line: 'bah', status: 'loading', entered: enteredBah, expected: null, diff: null, annualDiff: null };
    } else {
      bahRow = compareLine('bah', enteredBah, rateFor(bah, grade, deps === 'with'), 'That ZIP isn’t in the 2026 DTMO BAH file.');
    }

    const bas = compareLine('bas', enteredBas, expectedBAS(grade));
    return [base, bahRow, bas];
  }, [grade, yos, zip, deps, bah, bahLoading, stationOconus, enteredBase, enteredBah, enteredBas]);

  const anyMismatch = rows?.some((r) => r.status === 'mismatch') ?? false;
  const checked = rows?.filter((r) => r.status === 'match' || r.status === 'mismatch') ?? [];
  const allMatch = checked.length > 0 && checked.every((r) => r.status === 'match');
  const bahRow = rows?.find((r) => r.line === 'bah');
  const baseRow = rows?.find((r) => r.line === 'basePay');
  const basRow = rows?.find((r) => r.line === 'bas');

  const mismatchKey = rows?.filter((r) => r.status === 'mismatch').map((r) => r.line).join(',') ?? '';
  const partial: PartialAnswer = partialAnswer.key === mismatchKey ? partialAnswer.answer : 'unanswered';
  const setPartial = (answer: PartialAnswer) => setPartialAnswer({ key: mismatchKey, answer });

  const mode: MismatchMode = partial === 'yes' ? 'partial' : partial === 'no' ? 'confirmed' : 'pending';
  const confirmedMismatch = anyMismatch && partial === 'no';

  // Analytics: calculator name only, once the first comparison lands.
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current && checked.length > 0) {
      fired.current = true;
      fireCalculatorEvent('les');
    }
  }, [checked.length]);

  const otherDepRate = grade && bah && deps ? rateFor(bah, grade, deps !== 'with') : null;
  const bahIsOtherDepRate =
    bahRow?.status === 'mismatch' && bahMatchesOtherDependencyRate(enteredBah, otherDepRate);

  return (
    // data-clarity-mask: keeps typed LES figures and the comparison out of Clarity session replays.
    <section ref={sectionRef} data-testid="les-checker" data-clarity-mask="True" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ── Step 1 ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white align-middle">1</span>
          Your service
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="les-grade" className="block text-sm font-medium text-zinc-700 mb-1">Pay grade</label>
            <select id="les-grade" value={grade} onChange={(e) => setGrade(e.target.value as PayGrade | '')} className={SELECT_CLS}>
              <option value="">Select your pay grade</option>
              {GRADE_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.grades.map((gr) => (
                    <option key={gr} value={gr}>{RANK_DISPLAY[gr]}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p data-testid="les-pending-grades" className="text-xs text-zinc-500 mt-1">
              {PENDING_VERIFICATION_NOTE}
            </p>
          </div>
          <div>
            <label htmlFor="les-yos" className="block text-sm font-medium text-zinc-700 mb-1">Years of service (for pay)</label>
            <select id="les-yos" value={yos} onChange={(e) => setYos(e.target.value)} disabled={!grade} className={`${SELECT_CLS} disabled:bg-zinc-50 disabled:text-zinc-400`}>
              <option value="">{grade ? 'Select years of service' : 'Choose a pay grade first'}</option>
              {yosOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">Counted from your Pay Entry Base Date (PEBD), shown on your LES.</p>
          </div>
          <BaseSearchInput
            id="les-station"
            label="Duty station"
            value={zip}
            onZipChange={setZip}
            onSelect={setStation}
            excludeOconus={false}
            placeholder="Base name or ZIP code"
            hint="Your duty station, not your home address — BAH follows the duty station."
            className="[&_input]:py-3 [&_input]:text-base"
          />
          <div>
            <label htmlFor="les-deps" className="block text-sm font-medium text-zinc-700 mb-1">Dependents</label>
            <select id="les-deps" value={deps} onChange={(e) => setDeps(e.target.value as '' | 'with' | 'without')} className={SELECT_CLS}>
              <option value="">Select dependency status</option>
              <option value="with">With dependents</option>
              <option value="without">Without dependents</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Married to another service member?{' '}
              <Link href="/calculators/dual-military-bah" className="text-red-700 underline">Dual military rules differ</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Step 2 ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-1">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white align-middle">2</span>
          What your LES shows
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Copy the monthly amounts from the Entitlements column. Leave any line blank to skip it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MoneyInput id="les-base" label="Base pay" hint="The BASE PAY line" value={lesBase} onChange={setLesBase} />
          <MoneyInput id="les-bah" label="BAH" hint="Blank if you live in barracks or government housing" value={lesBah} onChange={setLesBah} />
          <MoneyInput id="les-bas" label="BAS" hint="The BAS line" value={lesBas} onChange={setLesBas} />
        </div>
        <p data-testid="les-privacy" className="mt-4 flex items-start gap-2 text-xs text-zinc-600">
          <span aria-hidden="true">🔒</span>
          <span>
            The dollar figures you type never leave this page — the check runs in your browser and nothing is stored.
            Only your duty station is looked up against the 2026 BAH table.
          </span>
        </p>
      </div>

      {/* ── Comparison ─────────────────────────────────────────── */}
      <div aria-live="polite" className="space-y-4">
        {!rows ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500 text-center">
            Choose your pay grade to see what your LES should show.
          </p>
        ) : (
          <>
            {anyMismatch && partial === 'unanswered' && (
              <div data-testid="les-partial-question" className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-900">
                  Before calling this a mismatch: did anything change partway through this pay period?
                </p>
                <p className="text-sm text-amber-900 mt-1">
                  A mid-month PCS, promotion, arrival, or separation prorates your pay, so none of the lines will match a full-month rate.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => setPartial('no')} className="min-h-[44px] rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800">
                    No — it was a full month
                  </button>
                  <button type="button" onClick={() => setPartial('yes')} className="min-h-[44px] rounded-md border border-amber-400 bg-white px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100">
                    Yes — something changed mid-month
                  </button>
                </div>
              </div>
            )}

            {anyMismatch && partial === 'yes' && (
              <div data-testid="les-partial-notice" className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-900">Partial months won’t match a monthly rate.</p>
                <p className="mt-1">
                  Pay for a partial month is prorated by the days at each grade or station, so this check can’t confirm it.
                  Consider comparing next month’s LES — the first full month at the new rate — instead.{' '}
                  <button type="button" onClick={() => setPartial('no')} className="text-red-700 underline">
                    It was a full month after all
                  </button>
                </p>
              </div>
            )}

            <LesComparisonTable rows={rows} mode={mode} />

            {/* BAH mismatch — the legitimate reasons, surfaced not buried */}
            {bahRow?.status === 'mismatch' && (
              <div data-testid="les-bah-notices" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-bold mb-2">Common reasons BAH differs that aren’t errors</p>
                {bahIsOtherDepRate && (
                  <p data-testid="les-bah-other-dep" className="mb-2 rounded-md bg-white border border-blue-200 p-2.5">
                    Your LES BAH matches the <strong>{deps === 'with' ? 'without' : 'with'}-dependents</strong> rate here
                    ({formatCurrency(otherDepRate ?? 0, true)}). The dependency status in your pay record may not match what you
                    selected — a common gap after a marriage, divorce, or new child.
                  </p>
                )}
                <ul className="space-y-1.5 list-disc pl-5">
                  <li data-testid="les-rate-protection">
                    <strong>BAH rate protection.</strong> If your area’s rate went down on January 1, you keep the higher prior
                    rate as long as your grade, duty station, and dependency status stay the same. An LES higher than the 2026 rate
                    is often exactly this.
                  </li>
                  <li><strong>Partial month.</strong> A mid-month move, promotion, or status change prorates BAH.</li>
                  <li>
                    <strong>Government housing or barracks.</strong> Members in government quarters generally don’t draw full BAH;
                    some single members in barracks see a small partial-rate BAH line instead.
                  </li>
                  <li>
                    <strong>Dual military.</strong> Only one member can draw the with-dependents rate.{' '}
                    <Link href="/calculators/dual-military-bah" className="text-red-700 underline">Check dual military BAH</Link>.
                  </li>
                  <li><strong>Wrong duty station on file.</strong> BAH follows the duty station in your orders, not where you live.</li>
                </ul>
              </div>
            )}

            {baseRow?.status === 'mismatch' && partial !== 'yes' && (
              <div data-testid="les-base-notices" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-bold mb-2">Before assuming base pay is wrong</p>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>Base pay steps up on the anniversary of your Pay Entry Base Date (PEBD). If you just crossed a step, the new rate starts that day — check the PEBD on your LES against the years you selected.</li>
                  <li>A promotion pays from its effective date, which can differ from the day it was pinned on.</li>
                </ul>
              </div>
            )}

            {basRow?.status === 'mismatch' && partial !== 'yes' && (
              <div data-testid="les-bas-notices" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-bold mb-2">Before assuming BAS is wrong</p>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>BAS can stop or change during field duty, deployment, or when government meals are provided.</li>
                  <li>Some members see full BAS alongside a separate meal deduction — compare the BAS entitlement line, not your net.</li>
                </ul>
              </div>
            )}

            {/* ── Act ───────────────────────────────────────────── */}
            {allMatch && !anyMismatch && (
              <div data-testid="les-all-match" className="rounded-xl border-2 border-green-300 bg-green-50 p-4 sm:p-5">
                <p className="text-base font-bold text-green-900">
                  {checked.length === 3
                    ? 'All three lines match the 2026 rates.'
                    : `The ${checked.length === 1 ? 'line' : 'lines'} you entered ${checked.length === 1 ? 'matches' : 'match'} the 2026 rates.`}
                </p>
                <p className="text-sm text-green-900 mt-1">
                  Next: see what the full package is actually worth — including the tax advantage of BAH and BAS, TRICARE,
                  and the TSP match that never appear as a single number on your LES.
                </p>
                <Link href="/calculators/total-compensation" className="mt-3 inline-flex min-h-[44px] items-center rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800">
                  See your total compensation →
                </Link>
              </div>
            )}

            {confirmedMismatch && (
              <div data-testid="les-next-steps" className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 mb-3">What to do about a mismatch</h3>
                <ol className="space-y-3 text-sm text-zinc-700">
                  <li>
                    <strong className="text-zinc-900">1. Pay lines → your servicing Finance Office.</strong> Base pay, BAH, BAS,
                    and other entitlements and deductions are Finance questions. You can also consider filing a pay inquiry through myPay.
                  </li>
                  <li>
                    <strong className="text-zinc-900">2. Record errors → MPF or S1/G1.</strong> If the cause is your PEBD, DIEMS,
                    dependency status, or promotion date, your personnel office fixes the record — and the pay follows the record.
                  </li>
                  <li>
                    <strong className="text-zinc-900">3. Bring the specifics.</strong> The LES line item, the amount it shows, and the
                    rate you’re citing — {rows.filter((r) => r.status === 'mismatch').map((r) => `2026 ${r.line === 'basePay' ? 'basic pay' : r.line.toUpperCase()} ${formatCurrency(r.expected ?? 0, true)}/mo`).join('; ')} —
                    with its source (DFAS pay table, DTMO BAH rates, or the DFAS BAS rate).
                  </li>
                  <li>
                    <strong className="text-zinc-900">4. Older errors may still count.</strong> Claims for underpaid military pay are
                    generally subject to a six-year limit under 31 U.S.C. § 3702, so a discrepancy from a prior year may still be
                    claimable. This is general information, not legal advice.
                  </li>
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
