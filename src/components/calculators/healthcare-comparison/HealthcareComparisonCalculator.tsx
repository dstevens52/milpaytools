'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { fireCalculatorEvent } from '@/lib/analytics';
import { useUserInputGate } from '@/components/calculators/shared/useUserInputGate';
import { usePreHydrationSync } from '@/components/calculators/shared/usePreHydrationSync';
import {
  type PlanTier,
  type VaRating,
  type CoveragePath,
  type FamilyStatus,
  type RetireePlan,
  type RetireeGroup,
} from '@/data/healthcare/2026/constants';
import { readUrlParams } from '@/data/calculatorUrlParams';
import {
  calculateHealthcare as calculate,
  isFamily,
  parseHealthcareParams,
  tampFirstYearSplit,
  RETIREE_PLAN_LABEL,
} from '@/lib/calculations/healthcare';

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

// isFamily, calculate and the TAMP split: src/lib/calculations/healthcare.ts

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
          <dd className="font-semibold tabular-nums">{num(premium, path === 'trs' || path === 'tricare-retiree')}</dd>
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
        {!isTricare && tier && path !== 'va' && path !== 'trs' && path !== 'tricare-retiree' && path !== 'tamp' && (
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
  'va': 'VA Healthcare',
  'trs': 'TRICARE Reserve Select',
  'tricare-retiree': 'TRICARE (military retiree)',
  'tamp': 'TAMP (180-day bridge)',
};

export function HealthcareComparisonCalculator() {
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>('single');
  const [path, setPath] = useState<CoveragePath>('employer');
  const [tier, setTier] = useState<PlanTier>('silver');
  const [vaRating, setVaRating] = useState<VaRating>('50plus');
  const [retireePlan, setRetireePlan] = useState<RetireePlan>('select');
  const [retireeGroup, setRetireeGroup] = useState<RetireeGroup>('a');
  const [tampEligible, setTampEligible] = useState(false);

  const firedRef = useRef(false);

  // ── URL param hydration ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = readUrlParams('healthcare-comparison', window.location.search);
    // Only accepted values are applied; anything else keeps the default (HC-01).
    const u = parseHealthcareParams({
      family: params.get('family'),
      path: params.get('path'),
      tier: params.get('tier'),
      rating: params.get('rating'),
      plan: params.get('plan'),
      group: params.get('group'),
      tamp: params.get('tamp'),
    });
    if (u.family) setFamilyStatus(u.family);
    if (u.path) setPath(u.path);
    if (u.tier) setTier(u.tier);
    if (u.rating) setVaRating(u.rating);
    if (u.plan) setRetireePlan(u.plan);
    if (u.group) setRetireeGroup(u.group);
    if (u.tamp) setTampEligible(true);
  }, []);

  const result = useMemo(
    () => calculate(familyStatus, path, tier, vaRating, { plan: retireePlan, group: retireeGroup }),
    [familyStatus, path, tier, vaRating, retireePlan, retireeGroup],
  );

  const tampSplit = useMemo(() => tampFirstYearSplit(result), [result]);

  const annualGap = result.annualPremium + result.estimatedDeductibleUsage;

  // ── Fire analytics once: 800 ms after the first result change the person caused ──
  const { attach: gaAttach, hasInteracted: gaInteracted, root: gaRoot } = useUserInputGate();
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (firedRef.current || !gaInteracted()) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => {
      firedRef.current = true;
      fireCalculatorEvent('healthcare-comparison');
    }, 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [result, gaInteracted]);

  const showTier = path === 'employer' || path === 'aca-no-subsidy';
  const showVaRating = path === 'va';
  const showRetiree = path === 'tricare-retiree';
  // Retirement is not one of the TAMP categories (10 U.S.C. § 1145(a)(2)).
  const showTampToggle = path !== 'tamp' && path !== 'tricare-retiree';

  function getShareUrl() {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('family', familyStatus);
    url.searchParams.set('path', path);
    if (showTier) url.searchParams.set('tier', tier);
    if (showVaRating) url.searchParams.set('rating', vaRating);
    if (showRetiree) {
      url.searchParams.set('plan', retireePlan);
      url.searchParams.set('group', retireeGroup);
    }
    url.searchParams.delete('income');
    if (tampEligible && showTampToggle) url.searchParams.set('tamp', 'true');
    return url.toString();
  }

  const selectCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600';

  // After the URL effect: input made before hydration wins over URL params (build 1c).
  const hydrated = usePreHydrationSync(gaRoot, { calculator: 'healthcare-comparison', shareUrl: getShareUrl });
  const inert = hydrated ? undefined : true;

  return (
    <div ref={gaAttach} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ── Urgency stat ── */}
      <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-900 leading-relaxed">
          <span className="font-bold">Active-duty TRICARE has no premiums.</span> After you separate, premiums become a new monthly bill, before deductibles and copays. If you retire, TRICARE continues for an annual enrollment fee.
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
              <option value="va">VA Healthcare</option>
              <option value="trs">TRICARE Reserve Select</option>
              <option value="tricare-retiree">TRICARE (military retiree)</option>
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
                    aria-disabled={inert}
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
            </div>
          )}

          {/* Retiree TRICARE plan and group */}
          {showRetiree && (
            <>
              <div>
                <label htmlFor="retiree-plan-select" className="block text-sm font-medium text-zinc-700 mb-1">
                  Retiree plan
                </label>
                <select
                  id="retiree-plan-select"
                  value={retireePlan}
                  onChange={(e) => setRetireePlan(e.target.value as RetireePlan)}
                  className={selectCls}
                >
                  <option value="select">{RETIREE_PLAN_LABEL.select}</option>
                  <option value="prime">{RETIREE_PLAN_LABEL.prime}</option>
                </select>
              </div>
              <div>
                <label htmlFor="retiree-group-select" className="block text-sm font-medium text-zinc-700 mb-1">
                  Retiree group
                </label>
                <select
                  id="retiree-group-select"
                  value={retireeGroup}
                  onChange={(e) => setRetireeGroup(e.target.value as RetireeGroup)}
                  className={selectCls}
                >
                  <option value="a">Group A (entered service before Jan. 1, 2018)</option>
                  <option value="b">Group B (entered service on or after Jan. 1, 2018)</option>
                </select>
              </div>
            </>
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
              {path === 'va' && vaRating === '50plus' ? (
                <p className="text-3xl font-bold text-green-700 tabular-nums">{fmt(0)}</p>
              ) : (
                <p className="text-3xl font-bold text-red-700 tabular-nums" data-testid="hc-annual-gap">{fmt(annualGap)}</p>
              )}
              <p className="text-sm text-zinc-600 mt-1">
                {path === 'va' && vaRating === '50plus'
                  ? 'VA health care at a 50% or higher rating (Priority Group 1): no premiums, and generally no copays for care. It covers you only.'
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
                  <dt className="text-zinc-500">
                    {path === 'tricare-retiree' ? 'Annual enrollment fee' : `Annual premiums (${fmtExact(result.monthlyPremium)}/mo × 12)`}
                  </dt>
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
                          <dt className="text-zinc-500">Est. deductible usage (~45%, full year: deductibles reset each January)</dt>
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
          Employer plan estimates use national averages from the KFF Employer Health Benefits Survey. ACA estimates are list prices before any premium tax credit. TRICARE figures come from TRICARE.mil. Actual costs vary by state, employer, plan, and provider network.
        </p>

        {/* Success outcome */}
        <p className="text-sm text-zinc-500 leading-relaxed">
          Use this estimate to build healthcare into your post-separation budget — before you sign out.
        </p>
      </div>
    </div>
  );
}
