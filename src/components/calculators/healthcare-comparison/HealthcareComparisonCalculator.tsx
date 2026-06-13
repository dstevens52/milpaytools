'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { fireCalculatorEvent } from '@/lib/analytics';
import {
  HEALTHCARE_2026,
  type PlanTier,
  type VaRating,
  type CoveragePath,
  type FamilyStatus,
} from '@/data/healthcare/2026/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtExact(n: number): string {
  const cents = n % 1;
  return cents === 0
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getHouseholdSize(fs: FamilyStatus): number {
  switch (fs) {
    case 'single': return 1;
    case 'married-no-kids': return 2;
    case 'married-1-child': return 3;
    case 'married-2-children': return 4;
    case 'married-3plus': return 5;
    case 'single-parent': return 2;
  }
}

function getFPL(size: number): number {
  return HEALTHCARE_2026.fpl.base1 + (size - 1) * HEALTHCARE_2026.fpl.increment;
}

function getSubsidyRate(income: number, fpl: number): number {
  const pct = (income / fpl) * 100;
  for (const band of HEALTHCARE_2026.acaSubsidyBands) {
    if (pct < band.maxPct) return band.subsidyRate;
  }
  return 0;
}

function isFamily(fs: FamilyStatus): boolean {
  return fs !== 'single';
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalcResult {
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  oopMax: number;
  estimatedDeductibleUsage: number;
  firstYearTotal: number;
  notes: string[];
  vaRatingLabel?: string;
  subsidyRate?: number;
  coversFamily: boolean;
  isTamp: boolean;
}

// ─── Calculation logic ────────────────────────────────────────────────────────

function calculate(
  familyStatus: FamilyStatus,
  path: CoveragePath,
  tier: PlanTier,
  vaRating: VaRating,
  annualIncome: number,
): CalcResult {
  const family = isFamily(familyStatus);
  const coverage = family ? 'family' : 'single';

  switch (path) {
    case 'employer': {
      const p = HEALTHCARE_2026.employer[coverage][tier];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: p.oopMax,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: [],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'aca-no-subsidy': {
      const p = HEALTHCARE_2026.acaNoSubsidy[coverage][tier];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: 0,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: [],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'aca-subsidy': {
      const base = HEALTHCARE_2026.acaNoSubsidy[coverage][tier];
      const fpl = getFPL(getHouseholdSize(familyStatus));
      const rate = annualIncome > 0 ? getSubsidyRate(annualIncome, fpl) : 0;
      const subsidizedMonthly = Math.max(0, Math.round(base.premium * (1 - rate)));
      const dedUsage = Math.round(base.deductible * 0.45);
      const notes: string[] = [];
      if (annualIncome > 0) {
        notes.push(`Estimated ~${Math.round(rate * 100)}% subsidy applied. Actual subsidy depends on age, location, and benchmark plan — verify at Healthcare.gov.`);
      } else {
        notes.push('Enter annual household income for an approximate subsidy estimate.');
      }
      return {
        monthlyPremium: subsidizedMonthly,
        annualPremium: subsidizedMonthly * 12,
        deductible: base.deductible,
        oopMax: 0,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: subsidizedMonthly * 12 + dedUsage,
        notes,
        subsidyRate: rate,
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'va': {
      const va = HEALTHCARE_2026.va[vaRating];
      const annualCopayEst = va.monthlyCopayEst * 12;
      return {
        monthlyPremium: 0,
        annualPremium: 0,
        deductible: 0,
        oopMax: 0,
        estimatedDeductibleUsage: annualCopayEst,
        firstYearTotal: annualCopayEst,
        notes: [va.note],
        vaRatingLabel: va.label,
        coversFamily: false,
        isTamp: false,
      };
    }

    case 'trs': {
      const p = HEALTHCARE_2026.tricareReserveSelect[coverage];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: p.oopMax,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: ['Must have qualifying Reserve/Guard service and a drilling unit assignment.'],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'tamp': {
      return {
        monthlyPremium: 0,
        annualPremium: 0,
        deductible: 0,
        oopMax: 0,
        estimatedDeductibleUsage: 0,
        firstYearTotal: 0,
        notes: [HEALTHCARE_2026.tamp.note],
        coversFamily: family,
        isTamp: true,
      };
    }
  }
}

// ─── TAMP Split ────────────────────────────────────────────────────────────────

interface TampSplit {
  firstSixMonthsCost: number;
  lastSixMonthsPremiums: number;
  lastSixMonthsDeductible: number;
  totalFirstYear: number;
}

function calcTampSplit(result: CalcResult): TampSplit {
  const lastSixPremiums = result.monthlyPremium * 6;
  const lastSixDed = Math.round(result.estimatedDeductibleUsage * 0.5);
  return {
    firstSixMonthsCost: 0,
    lastSixMonthsPremiums: lastSixPremiums,
    lastSixMonthsDeductible: lastSixDed,
    totalFirstYear: lastSixPremiums + lastSixDed,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CoverageColumn({
  title,
  badge,
  premium,
  deductible,
  oopMax,
  notes,
  isTricare,
  vaRatingLabel,
  path,
  tier,
}: {
  title: string;
  badge?: string;
  premium: number;
  deductible: number;
  oopMax: number;
  notes: string[];
  isTricare: boolean;
  vaRatingLabel?: string;
  path?: CoveragePath;
  tier?: PlanTier;
}) {
  const green = 'text-green-700 font-semibold';
  const num = (n: number, exact = false) =>
    n === 0
      ? <span className={green}>{fmt(n)}</span>
      : <span>{exact ? fmtExact(n) : fmt(n)}</span>;

  return (
    <div
      className={[
        'rounded-lg border p-4 flex flex-col gap-3',
        isTricare ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-white',
      ].join(' ')}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">{title}</p>
        {badge && (
          <span
            className={[
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
              isTricare ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600',
            ].join(' ')}
          >
            {badge}
          </span>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500">Monthly premium</dt>
          <dd className="font-semibold tabular-nums">{num(premium, path === 'trs')}</dd>
        </div>
        {path !== 'va' && (
          <>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Annual deductible</dt>
              <dd className="font-semibold tabular-nums">{num(deductible)}</dd>
            </div>
            {oopMax > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-zinc-500">OOP max</dt>
                <dd className="font-semibold tabular-nums">{fmt(oopMax)}</dd>
              </div>
            )}
          </>
        )}
        {path === 'va' && vaRatingLabel && (
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">Rating tier</dt>
            <dd className="font-semibold text-right text-xs leading-tight max-w-[160px]">{vaRatingLabel}</dd>
          </div>
        )}
        {!isTricare && tier && path !== 'va' && path !== 'trs' && path !== 'tamp' && (
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">Plan tier</dt>
            <dd className="font-semibold capitalize">{tier}</dd>
          </div>
        )}
      </dl>

      {notes.length > 0 && (
        <div className="border-t border-zinc-100 pt-2 space-y-1">
          {notes.map((n, i) => (
            <p key={i} className="text-xs text-zinc-500 leading-relaxed">{n}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PATH_LABELS: Record<CoveragePath, string> = {
  'employer': 'Employer-Sponsored Insurance',
  'aca-no-subsidy': 'ACA Marketplace (no subsidy)',
  'aca-subsidy': 'ACA Marketplace (with subsidy)',
  'va': 'VA Healthcare',
  'trs': 'TRICARE Reserve Select',
  'tamp': 'TAMP (180-day bridge)',
};

export function HealthcareComparisonCalculator() {
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>('single');
  const [path, setPath] = useState<CoveragePath>('employer');
  const [tier, setTier] = useState<PlanTier>('silver');
  const [vaRating, setVaRating] = useState<VaRating>('50plus');
  const [incomeStr, setIncomeStr] = useState('');
  const [tampEligible, setTampEligible] = useState(false);

  const firedRef = useRef(false);

  // ── URL param hydration ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const p = params.get('path') as CoveragePath | null;
    const fs = params.get('family') as FamilyStatus | null;
    const t = params.get('tier') as PlanTier | null;
    const vr = params.get('rating') as VaRating | null;
    const inc = params.get('income');
    const tamp = params.get('tamp');
    if (fs) setFamilyStatus(fs);
    if (p) setPath(p);
    if (t) setTier(t);
    if (vr) setVaRating(vr);
    if (inc) setIncomeStr(inc);
    if (tamp === 'true') setTampEligible(true);
  }, []);

  const annualIncome = useMemo(() => {
    const n = parseInt(incomeStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }, [incomeStr]);

  const result = useMemo(() => calculate(familyStatus, path, tier, vaRating, annualIncome), [
    familyStatus, path, tier, vaRating, annualIncome,
  ]);

  const tampSplit = useMemo(() => calcTampSplit(result), [result]);

  const annualGap = result.annualPremium + result.estimatedDeductibleUsage;

  // ── Fire analytics once results are visible ──
  useEffect(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      fireCalculatorEvent('healthcare-comparison');
    }
  }, [result]);

  const showTier = path === 'employer' || path === 'aca-no-subsidy' || path === 'aca-subsidy';
  const showVaRating = path === 'va';
  const showIncome = path === 'aca-subsidy';
  const showTampToggle = path !== 'tamp';

  function getShareUrl() {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('family', familyStatus);
    url.searchParams.set('path', path);
    if (showTier) url.searchParams.set('tier', tier);
    if (showVaRating) url.searchParams.set('rating', vaRating);
    if (showIncome && incomeStr) url.searchParams.set('income', incomeStr);
    if (tampEligible) url.searchParams.set('tamp', 'true');
    return url.toString();
  }

  const selectCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ── Urgency stat ── */}
      <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-900 leading-relaxed">
          <span className="font-bold">The average military family pays $0 for healthcare.</span> After separation, premiums alone can run $7,000–$12,000 per year — before deductibles and copays.
        </p>
      </div>

      {/* ── Inputs ── */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Your situation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Family status */}
          <div>
            <label htmlFor="family-select" className="block text-sm font-medium text-zinc-700 mb-1">
              Family status
            </label>
            <select
              id="family-select"
              value={familyStatus}
              onChange={(e) => setFamilyStatus(e.target.value as FamilyStatus)}
              className={selectCls}
            >
              <option value="single">Single (no dependents)</option>
              <option value="married-no-kids">Married, no children</option>
              <option value="married-1-child">Married + 1 child</option>
              <option value="married-2-children">Married + 2 children</option>
              <option value="married-3plus">Married + 3 or more children</option>
              <option value="single-parent">Single parent + child(ren)</option>
            </select>
          </div>

          {/* Coverage path */}
          <div>
            <label htmlFor="path-select" className="block text-sm font-medium text-zinc-700 mb-1">
              Post-separation coverage
            </label>
            <select
              id="path-select"
              value={path}
              onChange={(e) => setPath(e.target.value as CoveragePath)}
              className={selectCls}
            >
              <option value="employer">Employer-sponsored insurance</option>
              <option value="aca-no-subsidy">ACA Marketplace (no subsidy)</option>
              <option value="aca-subsidy">ACA Marketplace (with subsidy)</option>
              <option value="va">VA Healthcare</option>
              <option value="trs">TRICARE Reserve Select</option>
              <option value="tamp">TAMP (180-day bridge)</option>
            </select>
          </div>

          {/* Plan tier */}
          {showTier && (
            <div>
              <span className="block text-sm font-medium text-zinc-700 mb-1">Plan tier</span>
              <div className="flex gap-2">
                {(['bronze', 'silver', 'gold'] as PlanTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={[
                      'flex-1 py-2 text-sm font-medium rounded-md border transition-colors capitalize',
                      tier === t
                        ? 'border-red-700 bg-red-50 text-red-700'
                        : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Bronze = lower monthly cost, higher bills when you use care. Gold = higher monthly cost, lower bills when you use care. Silver is the middle ground and most common choice.
              </p>
            </div>
          )}

          {/* VA rating */}
          {showVaRating && (
            <div>
              <label htmlFor="va-rating-select" className="block text-sm font-medium text-zinc-700 mb-1">
                VA disability rating
              </label>
              <select
                id="va-rating-select"
                value={vaRating}
                onChange={(e) => setVaRating(e.target.value as VaRating)}
                className={selectCls}
              >
                <option value="50plus">50% or higher</option>
                <option value="30to40">30–40%</option>
                <option value="10to20">10–20%</option>
                <option value="0sc">0% (service-connected)</option>
              </select>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Your rating changes the coverage details shown in the comparison below. The modeled cost stays $0 — service-connected care has no premium at any rating.
              </p>
            </div>
          )}

          {/* Annual income for ACA subsidy */}
          {showIncome && (
            <div>
              <label htmlFor="income-input" className="block text-sm font-medium text-zinc-700 mb-1">
                Annual household income
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  id="income-input"
                  type="text"
                  inputMode="numeric"
                  value={incomeStr}
                  onChange={(e) => setIncomeStr(e.target.value)}
                  placeholder="55,000"
                  className="w-full rounded-md border border-zinc-300 bg-white pl-7 pr-3 py-2 text-sm text-zinc-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              {annualIncome > 0 && (() => {
                const size = getHouseholdSize(familyStatus);
                const fpl = getFPL(size);
                const pct = Math.round((annualIncome / fpl) * 100);
                return (
                  <p className="mt-1 text-xs text-zinc-500">
                    {pct}% of 2025 FPL used for 2026 coverage (household of {size}). Verify at Healthcare.gov.
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="space-y-4">

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CoverageColumn
            title="Active-Duty TRICARE"
            badge="What you had"
            premium={0}
            deductible={0}
            oopMax={0}
            notes={['No premiums, no deductible, no copays for most care.']}
            isTricare
          />
          <CoverageColumn
            title={PATH_LABELS[path]}
            badge="Post-separation"
            premium={result.monthlyPremium}
            deductible={result.deductible}
            oopMax={result.oopMax}
            notes={result.notes}
            isTricare={false}
            vaRatingLabel={result.vaRatingLabel}
            path={path}
            tier={showTier ? tier : undefined}
          />
        </div>

        {/* VA family coverage warning */}
        {path === 'va' && isFamily(familyStatus) && (
          <div className="rounded-md bg-amber-50 border-2 border-amber-300 px-4 py-3 text-sm text-amber-900">
            <span className="font-bold">⚠️ VA healthcare covers you only.</span> Your spouse and children will need separate coverage through an employer plan, ACA marketplace, or other source.
          </div>
        )}

        {/* TAMP-primary view */}
        {path === 'tamp' ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-3">TAMP coverage period</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">Days 1–180</p>
                <p className="text-xl font-bold text-green-700">$0</p>
                <p className="text-xs text-zinc-500">TAMP</p>
              </div>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">Day 181+</p>
                <p className="text-xl font-bold text-zinc-700">TBD</p>
                <p className="text-xs text-zinc-500">Need a plan</p>
              </div>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">6-month total</p>
                <p className="text-xl font-bold text-zinc-900">$0</p>
                <p className="text-xs text-zinc-500">TAMP period</p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Use another option in this calculator to estimate what coverage will cost after your TAMP window closes on day 181.
            </p>
          </div>
        ) : (
          <>
            {/* Annual gap callout */}
            <div
              aria-label="Annual healthcare gap"
              className="rounded-lg border-2 border-red-200 bg-red-50 p-5"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Annual healthcare cost gap</p>
              {path === 'va' ? (
                <p className="text-3xl font-bold text-green-700 tabular-nums">{fmt(0)}</p>
              ) : (
                <p className="text-3xl font-bold text-red-700 tabular-nums">{fmt(annualGap)}</p>
              )}
              <p className="text-sm text-zinc-600 mt-1">
                {path === 'va'
                  ? 'VA healthcare is modeled at $0 — service-connected care has no premium at any disability rating. Copays for non-service-connected care vary by priority group.'
                  : 'This estimate shows the added healthcare cost under your selected coverage assumptions.'}
              </p>
            </div>

            {/* Family callout — only shown for single with no dependents */}
            {familyStatus === 'single' && (
              <p className="text-xs text-zinc-500 leading-relaxed">
                Planning for a family? Switch to a family scenario above — the gap is often 3–4x larger.
              </p>
            )}

            {/* First-year breakdown */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-900 mb-3">
                First-year cost estimate
              </h3>
              <dl className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Annual premiums ({fmtExact(result.monthlyPremium)}/mo × 12)</dt>
                  <dd className="font-semibold tabular-nums">{fmt(result.annualPremium)}</dd>
                </div>
                {path === 'va' ? (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Estimated annual copays</dt>
                    <dd className="font-semibold tabular-nums">{fmt(result.estimatedDeductibleUsage)}</dd>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Est. deductible usage (~45%)</dt>
                    <dd className="font-semibold tabular-nums">{fmt(result.estimatedDeductibleUsage)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <dt className="font-semibold text-zinc-900">Estimated Year 1 total</dt>
                  <dd className="font-bold text-zinc-900 tabular-nums">{fmt(result.firstYearTotal)}</dd>
                </div>
              </dl>

              {/* TAMP eligible toggle */}
              {showTampToggle && (
                <div className="border-t border-zinc-100 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={tampEligible}
                      onChange={(e) => setTampEligible(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-red-700 focus:ring-red-600"
                      aria-label="I qualify for TAMP — show first-year split"
                    />
                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900">
                      I qualify for TAMP — show first-year with 180-day bridge
                    </span>
                  </label>

                  {tampEligible && (
                    <div
                      data-testid="tamp-split"
                      className="mt-3 rounded-md bg-zinc-50 border border-zinc-200 p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">First year with TAMP</p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-zinc-500">Months 1–6 (TAMP, free)</dt>
                          <dd className="font-semibold text-green-700 tabular-nums">{fmt(0)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-zinc-500">Months 7–12 premiums ({fmtExact(result.monthlyPremium)}/mo × 6)</dt>
                          <dd className="font-semibold tabular-nums">{fmt(tampSplit.lastSixMonthsPremiums)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-zinc-500">Est. deductible usage (6 mo)</dt>
                          <dd className="font-semibold tabular-nums">{fmt(tampSplit.lastSixMonthsDeductible)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-zinc-100 pt-2">
                          <dt className="font-semibold text-zinc-900">Year 1 total with TAMP</dt>
                          <dd className="font-bold text-zinc-900 tabular-nums">{fmt(tampSplit.totalFirstYear)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-zinc-500">Savings vs. no TAMP</dt>
                          <dd className="font-semibold text-green-700 tabular-nums">−{fmt(result.firstYearTotal - tampSplit.totalFirstYear)}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <SaveOrShareResults
          pageName="healthcare-comparison"
          headline="Save or share your healthcare comparison"
          supportingText="Useful for comparing TRICARE options, reviewing costs before a PCS or separation, or discussing coverage with family."
          usefulFor={['TRICARE comparison', 'Separation planning', 'Coverage review']}
          getUrl={getShareUrl}
          shareTitle="My healthcare comparison"
          shareText="Here's my TRICARE healthcare comparison from MilPayTools."
        />

        {/* Methodology note */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          Employer plan estimates use national averages from the KFF Employer Health Benefits Survey. ACA estimates use Healthcare.gov benchmark pricing. Actual costs vary by state, employer, plan, and provider network.
        </p>

        {/* Tax-treatment disclosure */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          Premiums are compared as listed, before any tax adjustment. Employer premiums are often paid pre-tax, which lowers their real cost, while ACA and TRICARE Reserve Select premiums are typically paid with after-tax dollars. This tool does not adjust for that difference — weigh it yourself when comparing options.
        </p>

        {/* Success outcome */}
        <p className="text-sm text-zinc-500 leading-relaxed">
          Use this estimate to build healthcare into your post-separation budget — before you sign out.
        </p>
      </div>
    </div>
  );
}
