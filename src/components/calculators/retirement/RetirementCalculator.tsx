'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ResultCard } from '@/components/calculators/shared/ResultCard';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { RetirementInput, VADisabilityRatingOption, ActionStep } from '@/types/calculator';
import {
  calculateRetirement,
  buildPensionChartData,
  LIFE_EXPECTANCY,
  ANNUAL_COLA_PCT,
  TSP_SWR_PCT,
} from '@/lib/calculations/retirement';
import { DATA_YEAR } from '@/data/pay-tables/2026';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import { parseGrade, gradeToParam } from '@/lib/urlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';

// ─── Constants ───────────────────────────────────────────────────────────────

const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officer', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officer', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
];

const VA_RATING_OPTIONS: { value: string; label: string }[] = [
  { value: '0', label: 'None / Not rated' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
];

const TSP_RETURN_OPTIONS = [
  { value: '5', label: '5% (Conservative)' },
  { value: '6', label: '6% (Moderate-Conservative)' },
  { value: '7', label: '7% (Moderate — default)' },
  { value: '8', label: '8% (Moderate-Aggressive)' },
  { value: '10', label: '10% (Aggressive)' },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtM(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}

/** Multiplier percent: "50.0%" for whole tenths, "51.25%" when months add hundredths. */
function fmtPct(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Math.abs(r * 10 - Math.round(r * 10)) < 1e-9 ? `${r.toFixed(1)}%` : `${r.toFixed(2)}%`;
}

/** "20 years" or "20 years 6 months". */
function fmtService(years: number, months: number): string {
  const y = `${years} year${years !== 1 ? 's' : ''}`;
  return months > 0 ? `${y} ${months} month${months !== 1 ? 's' : ''}` : y;
}

const RETURN_VALUES = TSP_RETURN_OPTIONS.map((o) => Number(o.value));
const MAX_TSP_BALANCE = 10_000_000;

/** Parse an integer URL param and clamp it to [min, max]; null when absent or not a number. */
function intParam(value: string | null, min: number, max: number): number | null {
  if (value === null) return null;
  const n = parseInt(value, 10);
  if (isNaN(n)) return null;
  return Math.min(max, Math.max(min, n));
}

// ─── Action Step Builder ──────────────────────────────────────────────────────

function buildActionSteps(input: RetirementInput, output: ReturnType<typeof calculateRetirement>): ActionStep[] {
  const steps: ActionStep[] = [];

  if (input.currentYOS < 20) {
    steps.push({
      label: `${output.yearsFromVesting} year${output.yearsFromVesting !== 1 ? 's' : ''} from your pension`,
      description: `Staying to 20 years vests a lifetime pension worth approximately ${fmtM(output.lifetimeValueOfStaying)}. That's the floor — every additional year adds more.`,
      priority: 'high',
    });
  } else {
    steps.push({
      label: `Each additional year adds ${fmt(output.marginalYearValue * 12)}/yr`,
      description: `At ${fmtService(input.retirementYOS, output.retirementMonths)} your multiplier is ${fmtPct(output.pensionMultiplierPct)}. One more year increases your pension by ${fmt(output.marginalYearValue)}/month — forever.`,
      priority: 'high',
    });
  }

  if (input.retirementSystem === 'brs' && input.tspContributionPct < 5) {
    steps.push({
      label: 'Contribute at least 5% to capture the full BRS match',
      description: `At ${input.tspContributionPct}% you're leaving government match money on the table. Raise to 5% to capture the full DoD contribution (1% auto + up to 4% match).`,
      priority: 'high',
    });
  }

  if (input.retirementSystem === 'brs') {
    steps.push({
      label: 'Compare BRS vs. High-3 in your situation',
      description: `Under High-3 your pension would be ${fmt(output.high3MonthlyPension)}/mo. Under BRS it's ${fmt(output.monthlyPension)}/mo — but your projected TSP adds ${fmt(output.tspMonthlyIncome)}/mo for a total of ${fmt(output.totalBRSMonthlyIncome)}/mo.`,
      href: '/blog/brs-vs-high-3-retirement',
      priority: 'medium',
    });
  }

  if (output.crdpEligible) {
    steps.push({
      label: 'You may qualify for CRDP — receive both pension and VA pay',
      description: `With ${input.vaRating}% VA disability and ${input.retirementYOS}+ years of service, Concurrent Retirement and Disability Pay (CRDP) lets you collect both your full military pension and VA compensation simultaneously.`,
      priority: 'medium',
    });
  } else if (output.waiverApplied) {
    steps.push({
      label: 'VA disability offsets pension until rating reaches 50%',
      description: `At a ${input.vaRating}% VA rating, your retired pay is reduced by ${fmt(output.vaTaxFree)}/mo of VA compensation (the VA waiver), so your total stays ${fmt(output.totalMonthlyIncome)}/mo. At 50%+ with 20+ years, CRDP eliminates the offset and you receive both in full.`,
      priority: 'medium',
    });
  }

  if (input.vaRating === 0 && input.currentYOS >= 15) {
    steps.push({
      label: 'File for VA disability before you separate',
      description: `If you have service-connected conditions, filing before separation through the BDD program typically produces better outcomes and faster ratings.`,
      href: '/blog/file-va-disability-before-separation',
      priority: 'low',
    });
  }

  steps.push({
    label: 'VA home loan benefit never expires after service',
    description: `Veterans retain full VA loan eligibility — $0 down and no PMI — for life. This is one of the most valuable benefits that carries into retirement.`,
    priority: 'low',
  });

  return steps.slice(0, 4);
}

// ─── Tooltip for Recharts ─────────────────────────────────────────────────────

function PensionTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 mb-2">Age {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {fmt(p.value)}/mo
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RetirementCalculator() {
  // Section 1 — Service info
  const [retirementSystem, setRetirementSystem] = useState<'high3' | 'brs'>('brs');
  const [currentGrade, setCurrentGrade] = useState<PayGrade>('E-7');
  const [currentYOS, setCurrentYOS] = useState(10);
  const [retirementYOS, setRetirementYOS] = useState(20);
  const [retirementMonths, setRetirementMonths] = useState(0);
  const [retirementGrade, setRetirementGrade] = useState<PayGrade>('E-7');

  // Section 2 — TSP (BRS only)
  const [tspContributionPct, setTspContributionPct] = useState(5);
  const [tspCurrentBalance, setTspCurrentBalance] = useState(0);
  const [tspAnnualReturnPct, setTspAnnualReturnPct] = useState(7);

  // Section 3 — Optional
  const [vaRating, setVaRating] = useState<VADisabilityRatingOption>(0);

  // UI state
  const [showComparison, setShowComparison] = useState(false);

  // Derived
  const input: RetirementInput = useMemo(() => ({
    retirementSystem,
    currentGrade,
    currentYOS: Math.min(currentYOS, retirementYOS),
    retirementYOS,
    retirementMonths: retirementYOS >= 40 ? 0 : retirementMonths,
    retirementGrade,
    tspContributionPct,
    tspCurrentBalance,
    tspAnnualReturnPct,
    vaRating,
  }), [retirementSystem, currentGrade, currentYOS, retirementYOS, retirementMonths, retirementGrade,
       tspContributionPct, tspCurrentBalance, tspAnnualReturnPct, vaRating]);

  const output = useMemo(() => calculateRetirement(input), [input]);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const _gaMountedRef = useRef(false);
  useEffect(() => {
    if (!_gaMountedRef.current) { _gaMountedRef.current = true; return; }
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('retirement'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [output]);

  const chartData = useMemo(
    () => buildPensionChartData(
      output.monthlyPension,
      output.estimatedRetirementAge,
      retirementSystem === 'brs' ? output.tspMonthlyIncome : 0,
      // Include High-3 comparison series in the same dataset when BRS + comparison toggled
      retirementSystem === 'brs' && showComparison ? output.high3MonthlyPension : 0
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [output.monthlyPension, output.estimatedRetirementAge, output.tspMonthlyIncome,
     output.high3MonthlyPension, retirementSystem, showComparison]
  );

  const actionSteps = useMemo(() => buildActionSteps(input, output), [input, output]);

  // ── URL params ────────────────────────────────────────────────────────

  // Share-link params. `rank` and `yos` keep their original meaning (retirement grade and
  // retirement years) so older links still load; every other input has its own param.
  // Each value is validated and clamped: an unknown grade keeps the default, numbers are
  // clamped to the input's range, and an unlisted return keeps the default.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const retGrade = parseGrade(params.get('rank'));
    const curGrade = parseGrade(params.get('currank'));
    const yos = intParam(params.get('yos'), 0, 40);
    const curYos = intParam(params.get('curyos'), 0, 39);
    const months = intParam(params.get('months'), 0, 11);
    const tsp = intParam(params.get('tsp'), 0, 50);
    const balParam = params.get('bal');
    const ret = intParam(params.get('ret'), 0, 100);
    const sys = params.get('system');
    const va = intParam(params.get('varating'), 0, 100);

    if (retGrade) setRetirementGrade(retGrade);
    if (curGrade) setCurrentGrade(curGrade);
    else if (retGrade) setCurrentGrade(retGrade); // older links: one rank for both

    let retYos = 20;
    if (curYos !== null) {
      // Current links: both years are explicit
      retYos = Math.max(20, curYos, yos ?? 20);
      setCurrentYOS(curYos);
      setRetirementYOS(retYos);
    } else if (yos !== null) {
      // Older links carried only the retirement years
      setCurrentYOS(Math.min(yos, 20));
      if (yos >= 20) { retYos = yos; setRetirementYOS(yos); }
    }
    if (months !== null) setRetirementMonths(retYos >= 40 ? 0 : months);
    if (tsp !== null) setTspContributionPct(tsp);
    if (balParam !== null) {
      const n = parseFloat(balParam);
      if (!isNaN(n)) setTspCurrentBalance(Math.min(MAX_TSP_BALANCE, Math.max(0, Math.round(n))));
    }
    if (ret !== null && RETURN_VALUES.includes(ret)) setTspAnnualReturnPct(ret);
    if (sys === 'high3') setRetirementSystem('high3');
    else if (sys === 'brs') setRetirementSystem('brs');
    if (va !== null && [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].includes(va)) {
      setVaRating(va as typeof vaRating);
    }
  }, []);

  function getShareUrl(): string {
    const params = new URLSearchParams();
    params.set('system', retirementSystem);
    params.set('rank', gradeToParam(retirementGrade));
    params.set('yos', String(retirementYOS));
    params.set('months', String(input.retirementMonths ?? 0));
    params.set('currank', gradeToParam(currentGrade));
    params.set('curyos', String(input.currentYOS));
    params.set('tsp', String(tspContributionPct));
    params.set('bal', String(Math.round(tspCurrentBalance)));
    params.set('ret', String(tspAnnualReturnPct));
    params.set('varating', String(vaRating));
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  // Clamp retirement YOS when current YOS changes
  function handleCurrentYOSChange(val: number) {
    setCurrentYOS(val);
    if (retirementYOS < val) setRetirementYOS(Math.max(20, val));
  }

  const retirementLabel = fmtService(retirementYOS, output.retirementMonths);
  const marginalPct = Math.round(output.civilianMarginalRatePct);
  // First published pay column for the retirement grade (shown in the RET-04 note)
  const firstPublishedYears = output.high3Breakdown.find((g) => g.firstPublishedColumn)?.column.replace('Over ', '') ?? '';
  const serviceYearsText = output.retirementMonths > 0
    ? `${retirementYOS} yrs ${output.retirementMonths} mo`
    : `${retirementYOS} yrs`;

  return (
    <div className="space-y-5">
      {/* ── Inputs ── */}
      <Card variant="bordered" className="p-5 space-y-5">
        <h2 className="font-semibold text-zinc-900 text-lg">Your Service Information</h2>

        {/* Retirement system */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Retirement System
          </label>
          <div className="flex gap-3 flex-wrap">
            {(['high3', 'brs'] as const).map((sys) => (
              <button
                key={sys}
                onClick={() => setRetirementSystem(sys)}
                className={[
                  'px-4 py-2 rounded-md text-sm font-semibold border transition-colors',
                  retirementSystem === sys
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400',
                ].join(' ')}
              >
                {sys === 'high3' ? 'High-3 (Legacy)' : 'BRS (Blended)'}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            High-3 applies if you entered service before Jan 1, 2018 and did <strong>not</strong> opt into BRS.
            BRS applies if you entered on or after Jan 1, 2018, or opted in during the 2018 window.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Current grade */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Current Rank</label>
            <select
              value={currentGrade}
              onChange={(e) => setCurrentGrade(e.target.value as PayGrade)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {GRADE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Current YOS */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Current Years of Service: <span className="text-red-700 font-bold">{currentYOS}</span>
            </label>
            <input
              type="range"
              min={0}
              max={39}
              value={currentYOS}
              onChange={(e) => handleCurrentYOSChange(Number(e.target.value))}
              className="w-full accent-red-700"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-0.5">
              <span>0</span><span>20</span><span>40</span>
            </div>
          </div>

          {/* Retirement grade */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Expected Rank at Retirement</label>
            <select
              value={retirementGrade}
              onChange={(e) => setRetirementGrade(e.target.value as PayGrade)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {GRADE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Retirement YOS */}
          <div>
            <label htmlFor="retirement-years" className="block text-sm font-medium text-zinc-700 mb-1">
              Planned Retirement at: <span className="text-red-700 font-bold">{retirementLabel}</span>
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <input
                  id="retirement-years"
                  type="range"
                  min={Math.max(20, currentYOS)}
                  max={40}
                  value={retirementYOS}
                  onChange={(e) => setRetirementYOS(Number(e.target.value))}
                  className="w-full accent-red-700"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-0.5">
                  <span>20</span><span>30</span><span>40</span>
                </div>
              </div>
              <div className="flex-none">
                <label htmlFor="retirement-months" className="sr-only">Additional months of service</label>
                <select
                  id="retirement-months"
                  data-testid="retirement-months"
                  value={String(input.retirementMonths ?? 0)}
                  onChange={(e) => setRetirementMonths(Number(e.target.value))}
                  disabled={retirementYOS >= 40}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-zinc-50 disabled:text-zinc-400"
                >
                  {Array.from({ length: 12 }, (_, m) => (
                    <option key={m} value={String(m)}>+{m} mo</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Each full month of service counts as 1/12 of a year.
            </p>
          </div>
        </div>

        {/* TSP section — BRS only */}
        {retirementSystem === 'brs' && (
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <h3 className="font-semibold text-zinc-800 text-base">TSP Contributions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Contribution % */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Monthly TSP Contribution: <span className="text-red-700 font-bold">{tspContributionPct}%</span>
                  {tspContributionPct < 5 && (
                    <span className="ml-2 text-zinc-500 text-xs font-medium">↑ Raise to 5% for full match</span>
                  )}
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={tspContributionPct}
                  onChange={(e) => setTspContributionPct(Number(e.target.value))}
                  className="w-full accent-red-700"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-0.5">
                  <span>0%</span><span>5% (full match)</span><span>50%</span>
                </div>
              </div>

              {/* Current balance */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Current TSP Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={tspCurrentBalance}
                    onChange={(e) => setTspCurrentBalance(Number(e.target.value))}
                    className="w-full rounded-md border border-zinc-300 bg-white pl-7 pr-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Expected return */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Expected Annual Return</label>
                <select
                  value={String(tspAnnualReturnPct)}
                  onChange={(e) => setTspAnnualReturnPct(Number(e.target.value))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {TSP_RETURN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Optional section */}
        <div className="pt-2 border-t border-zinc-100 space-y-3">
          <h3 className="font-semibold text-zinc-800 text-base">Optional: VA Disability</h3>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              VA Disability Rating (combined)
            </label>
            <select
              value={String(vaRating)}
              onChange={(e) => setVaRating(Number(e.target.value) as VADisabilityRatingOption)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {VA_RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {vaRating >= 50 && retirementYOS >= 20 && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              <strong>CRDP eligible:</strong> With {vaRating}% VA rating and {retirementYOS}+ years of service,
              you can receive <strong>both</strong> your full military pension and VA disability compensation
              simultaneously — no offset.
            </div>
          )}
        </div>
      </Card>

      {/* ── Primary result banner ── */}
      <div className="rounded-lg bg-red-700 text-white px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-red-200 text-sm font-medium mb-1">
              Estimated Monthly Pension · {retirementLabel} · {retirementSystem === 'brs' ? 'BRS' : 'High-3'}
            </p>
            <p className="text-4xl font-black tabular-nums">{fmt(output.monthlyPension)}<span className="text-xl font-semibold text-red-200">/mo</span></p>
            <p className="text-red-200 text-sm mt-1">{fmt(output.annualPension)}/year · {fmtPct(output.pensionMultiplierPct)} multiplier</p>
          </div>
          {output.monthlyVA > 0 && (
            <div className="sm:text-right" data-testid="va-banner">
              <p className="text-red-200 text-sm font-medium mb-1">
                {output.waiverApplied
                  ? `Total with VA (${vaRating}%) after VA waiver`
                  : `Combined with VA (${vaRating}%) — concurrent receipt`}
              </p>
              <p className="text-2xl font-bold tabular-nums">{fmt(output.totalMonthlyIncome)}/mo</p>
              {output.crdpEligible && (
                <p className="text-green-300 text-xs mt-1 font-semibold">CRDP eligible — both paid in full</p>
              )}
              {output.waiverApplied && (
                <p className="text-red-200 text-xs mt-1">
                  {fmt(output.vaTaxFree)}/mo of it is VA compensation, excluded from federal taxable income
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <SaveOrShareResults
        pageName="retirement"
        headline="Save or share your retirement estimate"
        supportingText="Useful for retirement planning, comparing BRS vs. High-3 scenarios, or reviewing your projected pension with family."
        usefulFor={['Retirement planning', 'BRS vs. High-3', 'Pension review']}
        getUrl={getShareUrl}
        shareTitle="My military retirement estimate"
        shareText="Here's my military retirement estimate from MilPayTools."
      />

      {/* ── Result cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pension detail */}
        <ResultCard
          title="Pension Breakdown"
          dataYear={DATA_YEAR}
          rows={[
            { label: `High-3 Avg Base Pay (${retirementGrade})`, value: `${fmt(output.high3Average)}/mo` },
            { label: `Multiplier (${retirementSystem === 'brs' ? '2.0' : '2.5'}% × ${serviceYearsText})`, value: fmtPct(output.pensionMultiplierPct) },
            {
              label: `Formula: ${fmtPct(output.pensionMultiplierPct)} × ${fmt(output.high3Average)}`,
              value: `= ${fmt(output.monthlyPension)}/mo`,
            },
            { label: 'Monthly Pension', value: `${fmt(output.monthlyPension)}/mo`, highlight: true },
            ...(retirementSystem === 'brs' ? [{
              label: `High-3 equivalent would be ${fmt(output.high3MonthlyPension)}/mo`,
              value: 'BRS = 80% of High-3',
            }] : []),
          ]}
        />

        {/* Lifetime value */}
        <ResultCard
          title="Lifetime Pension Value"
          rows={[
            { label: 'Estimated retirement age', value: `~${output.estimatedRetirementAge} (based on ~${output.estimatedRetirementAge - retirementYOS} yr entry age)` },
            { label: 'Life expectancy assumption', value: `${LIFE_EXPECTANCY} years` },
            { label: 'Years collecting pension', value: `~${Math.round(output.yearsOfCollection)} years` },
            { label: `COLA assumption`, value: `${ANNUAL_COLA_PCT}%/yr (historical avg)` },
            { label: 'Lifetime value (nominal, no discounting)', value: fmtM(output.lifetimeValue), highlight: true },
          ]}
        />

        {/* TSP (BRS only) */}
        {retirementSystem === 'brs' && (
          <div data-testid="tsp-card" className="flex flex-col gap-2">
            <ResultCard
              title="TSP Projection (BRS)"
              rows={[
                { label: `Assumed annual return`, value: `${tspAnnualReturnPct}% (adjustable above)` },
                {
                  label: 'Government contributions',
                  value: input.currentYOS >= 26
                    ? 'Ended (26+ years of service)'
                    : input.currentYOS >= 2
                    ? 'Automatic 1% + match, through 26 years'
                    : 'Automatic 1% now; match from month 25',
                },
                { label: 'Projected balance at retirement', value: fmtM(output.tspProjectedBalance) },
                { label: `Monthly TSP income (${TSP_SWR_PCT}% withdrawal rule ÷ 12)`, value: `${fmt(output.tspMonthlyIncome)}/mo` },
                { label: 'Total BRS monthly income', value: `${fmt(output.totalBRSMonthlyIncome)}/mo`, highlight: true },
              ]}
            />
            {output.tspPayUnavailable && (
              <p data-testid="tsp-pay-unavailable" className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 leading-relaxed">
                The {DATA_YEAR} pay table has no basic pay rate for {RANK_DISPLAY[currentGrade] ?? currentGrade} at {input.currentYOS} years of service, so new TSP contributions can&apos;t be estimated. The projection shows only the current balance growing. Choose a rank and years of service with a published rate to include contributions.
              </p>
            )}
            {output.tspMemberCapped && (
              <p data-testid="tsp-capped" className="text-xs text-zinc-500 leading-relaxed px-1">
                Your contributions are capped at the {DATA_YEAR} elective deferral limit ({fmt(TSP_CONSTANTS_2026.electiveDeferralLimit)}/year). Once you reach it, matching stops for the rest of that year; the automatic 1% continues.
              </p>
            )}
            <p className="text-xs text-zinc-500 leading-relaxed px-1">
              Holds pay flat at your current rank and years of service for the whole projection. Government contributions (automatic 1% after 60 days, match after 2 years) end after 26 years of service; your own contributions continue.
            </p>
          </div>
        )}

        {/* VA disability */}
        {vaRating > 0 && output.waiverApplied && (
          <div data-testid="va-waiver-card">
            <ResultCard
              title="VA Disability — VA Waiver"
              rows={[
                { label: 'Retired pay (before VA waiver)', value: `${fmt(output.monthlyPension)}/mo` },
                { label: `VA compensation (${vaRating}%, veteran alone; excluded from federal taxable income)`, value: `${fmt(output.vaTaxFree)}/mo` },
                { label: 'Retired pay after VA waiver', value: `${fmt(output.taxableRetiredPay)}/mo` },
                ...(retirementSystem === 'brs'
                  ? [{ label: `TSP income (${TSP_SWR_PCT}% withdrawal rule)`, value: `${fmt(output.tspMonthlyIncome)}/mo` }]
                  : []),
                {
                  label: 'Total monthly income',
                  value: `${fmt(output.totalMonthlyIncome)}/mo`,
                  highlight: true,
                  note: `Below a 50% VA rating, retired pay is reduced by the amount of VA compensation (the VA waiver). Your total stays the same, but ${fmt(output.vaTaxFree)}/mo of it is excluded from federal taxable income. At 50% or higher, concurrent receipt (CRDP) lets you receive both.`,
                },
              ]}
            />
          </div>
        )}
        {vaRating > 0 && !output.waiverApplied && (
          <div data-testid="va-crdp-card">
            <ResultCard
              title="VA Disability — Concurrent Receipt (CRDP)"
              rows={[
                { label: 'Retired pay', value: `${fmt(output.monthlyPension)}/mo` },
                { label: `VA compensation (${vaRating}%, veteran alone; excluded from federal taxable income)`, value: `${fmt(output.vaTaxFree)}/mo` },
                ...(retirementSystem === 'brs'
                  ? [{ label: `TSP income (${TSP_SWR_PCT}% withdrawal rule)`, value: `${fmt(output.tspMonthlyIncome)}/mo` }]
                  : []),
                { label: 'Combined monthly income (concurrent receipt)', value: `${fmt(output.totalMonthlyIncome)}/mo`, highlight: true },
              ]}
            />
          </div>
        )}

        {/* Civilian equivalent */}
        <div className="flex flex-col gap-2">
          <ResultCard
            title="Civilian Salary Equivalent"
            rows={[
              output.waiverApplied
                ? { label: 'Retired pay after VA waiver (annual)', value: fmt(output.taxableRetiredPay * 12) }
                : { label: 'Pension (annual)', value: fmt(output.annualPension) },
              ...(output.monthlyVA > 0 ? [{ label: 'VA compensation (annual, excluded from federal taxable income)', value: fmt(output.vaTaxFree * 12) }] : []),
              { label: 'Method', value: `Federal only, single filer, ${marginalPct}% marginal bracket` },
              { label: 'Civilian wage equivalent (estimate)', value: `~${fmtM(output.civilianEquivalent)}/yr`, highlight: true },
            ]}
          />
          <p data-testid="civilian-method" className="text-xs text-zinc-500 leading-relaxed px-1">
            Retired pay and wages owe the same federal income tax, but wages also owe 7.65% for Social Security and Medicare, which retired pay does not.
            {output.vaTaxFree > 0
              ? ' VA compensation is excluded from federal taxable income, so the wage equivalent of each VA dollar also covers income tax at your marginal bracket.'
              : ''}
            {' '}Federal only, single filer, at a {marginalPct}% marginal bracket. State taxes vary.
          </p>
        </div>

        {/* High-3 breakdown (last 36 months) */}
        <div data-testid="high3-card" className="flex flex-col gap-2">
          <ResultCard
            title="High-3 Calculation Detail"
            dataYear={DATA_YEAR}
            rows={[
              ...output.high3Breakdown.map((g) => ({
                label: `${g.column} pay column${g.firstPublishedColumn ? ' (first published rate)' : ''} × ${g.months} month${g.months !== 1 ? 's' : ''} (${retirementGrade})`,
                value: `${fmt(g.monthlyPay)}/mo`,
              })),
              { label: 'High-3 average (36 months ÷ 36)', value: fmt(output.high3Average), highlight: true },
            ]}
          />
          {output.high3UsedFirstPublishedColumn && (
            <p data-testid="high3-first-column-note" className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 leading-relaxed">
              No published {retirementGrade} rate below {firstPublishedYears} years; the first published rate is used for earlier months.
            </p>
          )}
          <p className="text-xs text-zinc-500 leading-relaxed px-1">
            Your last 36 months of service, each at the pay column for the years completed that month, all at your retirement rank. Uses today&apos;s {DATA_YEAR} pay table for every month. Real High-3 uses the pay you actually received, which is lower by the raises since then, so this estimate runs a little high.
          </p>
        </div>
      </div>

      {/* ── Interpretation callout ── */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-6 py-5 space-y-2">
        <p className="text-sm font-semibold text-blue-900">What these numbers mean</p>
        <p className="text-sm text-blue-800" data-testid="civilian-callout">
          A civilian would need wages of about{' '}
          <strong>{fmtM(output.civilianEquivalent)}/year</strong> to match your{' '}
          {output.vaTaxFree > 0 ? 'retired pay and VA compensation' : 'retired pay'}. Retired pay owes the
          same federal income tax as wages but no Social Security or Medicare tax
          {output.vaTaxFree > 0 ? ', and VA compensation is excluded from federal taxable income' : ''}.
          Federal only, single filer, at a {marginalPct}% marginal bracket. State taxes vary. The{' '}
          <strong>lifetime pension value of {fmtM(output.lifetimeValue)}</strong> is the compounding
          effect of COLA over roughly {Math.round(output.yearsOfCollection)} years of collection.
        </p>
        {input.currentYOS < 20 && (
          <p className="text-sm text-blue-800">
            You are <strong>{output.yearsFromVesting} year{output.yearsFromVesting !== 1 ? 's' : ''}</strong> from
            vesting your pension. The lifetime value of staying to 20 is approximately{' '}
            <strong>{fmtM(output.lifetimeValueOfStaying)}</strong>.
          </p>
        )}
        {input.currentYOS >= 20 && (
          <p className="text-sm text-blue-800">
            You&apos;ve vested your pension. Each additional year of service adds approximately{' '}
            <strong>{fmt(output.marginalYearValue)}/month</strong> ({fmt(output.marginalYearValue * 12)}/year) to your
            pension — permanently and for life.
          </p>
        )}
      </div>

      {/* ── BRS vs High-3 comparison ── */}
      {retirementSystem === 'brs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 text-base">BRS vs. High-3 Comparison</h3>
            <button
              onClick={() => setShowComparison((v) => !v)}
              className="text-sm text-red-700 font-medium hover:text-red-800"
            >
              {showComparison ? 'Hide ▲' : 'Show ▼'}
            </button>
          </div>
          {showComparison && (
            <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-zinc-200">
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    BRS (your system)
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-zinc-900">
                    {fmt(output.totalBRSMonthlyIncome)}<span className="text-sm text-zinc-500">/mo</span>
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">Pension + TSP income</p>
                  <div className="mt-3 space-y-1 text-sm text-zinc-600">
                    <div className="flex justify-between">
                      <span>Pension ({fmtPct(output.pensionMultiplierPct)})</span>
                      <span className="tabular-nums font-medium">{fmt(output.monthlyPension)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TSP income (4%)</span>
                      <span className="tabular-nums font-medium">{fmt(output.tspMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>TSP balance</span>
                      <span className="tabular-nums">{fmtM(output.tspProjectedBalance)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-zinc-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    High-3 (legacy)
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-zinc-900">
                    {fmt(output.high3MonthlyPension)}<span className="text-sm text-zinc-500">/mo</span>
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">Pension only (no TSP match)</p>
                  <div className="mt-3 space-y-1 text-sm text-zinc-600">
                    <div className="flex justify-between">
                      <span>Pension ({fmtPct(output.pensionMultiplierPct / 0.8)})</span>
                      <span className="tabular-nums font-medium">{fmt(output.high3MonthlyPension)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Difference</span>
                      <span className={['tabular-nums font-semibold', output.totalBRSMonthlyIncome >= output.high3MonthlyPension ? 'text-green-700' : 'text-red-700'].join(' ')}>
                        {output.totalBRSMonthlyIncome >= output.high3MonthlyPension ? '+' : ''}{fmt(output.totalBRSMonthlyIncome - output.high3MonthlyPension)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Pension Chart ── */}
      <div>
        <h3 className="font-semibold text-zinc-900 text-base mb-3">
          Projected Monthly Income Over Time
          <span className="ml-2 text-xs font-normal text-zinc-400">(with 2.5% annual COLA)</span>
        </h3>
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={retirementSystem === 'brs' ? chartData : chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="pensionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tspGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis
                dataKey="age"
                label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 12 }}
                tick={{ fontSize: 11 }}
                height={36}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11 }}
                width={52}
              />
              <Tooltip content={<PensionTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                verticalAlign="top"
              />
              <Area
                type="monotone"
                dataKey="pension"
                name="Pension"
                stroke="#B91C1C"
                strokeWidth={2}
                fill="url(#pensionGrad)"
                dot={false}
              />
              {retirementSystem === 'brs' && output.tspMonthlyIncome > 0 && (
                <Area
                  type="monotone"
                  dataKey="tsp"
                  name="TSP Income"
                  stroke="#1D4ED8"
                  strokeWidth={2}
                  fill="url(#tspGrad)"
                  dot={false}
                />
              )}
              {retirementSystem === 'brs' && showComparison && (
                <Area
                  type="monotone"
                  dataKey="high3"
                  name="High-3 (comparison)"
                  stroke="#52525B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Action steps ── */}
      <ActSteps steps={actionSteps} title="Your retirement action plan" />
    </div>
  );
}
