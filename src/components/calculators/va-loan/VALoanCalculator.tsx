'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import { useUserInputGate } from '@/components/calculators/shared/useUserInputGate';
import { usePreHydrationSync } from '@/components/calculators/shared/usePreHydrationSync';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { useCombinedBahLookup, rateFor } from '@/components/calculators/shared/useBahLookup';
import { combinedPayBahYear, pendingBahLabel } from '@/lib/combinedPayYear';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';
import { readUrlParams } from '@/data/calculatorUrlParams';
import {
  FEE_STATUSES,
  FUNDING_FEE_RATES_EFFECTIVE,
  bandDownPct,
  fundingFeeAmount as feeAmount,
  getFundingFeeRate,
  isFeeExempt,
  parseFeeStatus,
  type FeeStatus,
} from '@/lib/calculations/vaLoanFees';
import { calcVaLoan } from '@/lib/calculations/vaLoan';
import { RankHelper } from '@/components/ui/RankHelper';

// ─── Funding fee table (Purchase), statuses and payment math: ───────────────
// src/lib/calculations/vaLoanFees.ts and src/lib/calculations/vaLoan.ts

function getFundingFeeTierLabel(downPct: number): string {
  if (downPct < 5) return 'Less than 5% down';
  if (downPct < 10) return '5% to 9.99% down';
  return '10% or more down';
}

// ─── Loan term options ─────────────────────────────────────────────────────
const TERM_OPTIONS = [
  { value: '30', label: '30-year fixed' },
  { value: '20', label: '20-year fixed' },
  { value: '15', label: '15-year fixed' },
  { value: 'arm5', label: '5/1 ARM' },
];

const pct2 = (rate: number) => `${(rate * 100).toFixed(2)}%`;

function termYearsFromType(termType: string): number {
  return termType === 'arm5' ? 30 : parseInt(termType, 10);
}

// ─── Grade options ─────────────────────────────────────────────────────────
const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officers', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officers', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officers (Prior Enlisted)', options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
];

// ─── Shared input class ────────────────────────────────────────────────────
const INPUT_CLS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';

// ─── Comma-formatted dollar helpers ───────────────────────────────────────
function fmtDollar(n: number): string {
  return n.toLocaleString('en-US');
}

function parseDollar(s: string): number {
  const stripped = s.replace(/[^0-9]/g, '');
  return parseInt(stripped, 10) || 0;
}

// ─── Toggle button helpers ─────────────────────────────────────────────────
function btnCls(active: boolean) {
  return [
    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors text-center',
    active
      ? 'bg-red-700 border-red-700 text-white'
      : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
  ].join(' ');
}

// ─── Action steps ──────────────────────────────────────────────────────────
function buildActionSteps(
  feeStatus: FeeStatus,
  fundingFee: number,
  standardFee: number,
  baseLoan: number,
  firstUse: boolean,
  bandPct: number,
  bahActive: boolean,
): ActionStep[] {
  const steps: ActionStep[] = [];
  const exempt = isFeeExempt(feeStatus);

  if (!exempt) {
    steps.push({
      label: 'Check your VA disability rating',
      description: `VA's funding fee exemption depends on receiving VA disability compensation (or being eligible for it while receiving retirement or active-duty pay instead), not on a rating number. On this loan the fee is ${formatCurrency(fundingFee)}. See how your ratings combine and the compensation that goes with the result.`,
      priority: 'high',
      href: '/calculators/va-disability',
    });
  } else {
    steps.push({
      label: 'Your lender confirms the exemption',
      description: `VA's rule: no funding fee for the status you picked. On this loan that's ${formatCurrency(standardFee)} you don't pay. The lender confirms the exemption from your Certificate of Eligibility.`,
      priority: 'medium',
    });
  }

  if (!firstUse && !exempt) {
    const subRate = getFundingFeeRate(false, bandPct);
    const firstRate = getFundingFeeRate(true, bandPct);
    const diff = feeAmount(baseLoan, subRate) - feeAmount(baseLoan, firstRate);
    steps.push(
      diff > 0
        ? {
            label: 'Subsequent-use funding fee is higher',
            description: `At this down payment the subsequent-use rate is ${pct2(subRate)}, against ${pct2(firstRate)} for first use: ${formatCurrency(diff)} more on this loan. At 5% down or more, the two rates are the same.`,
            priority: 'medium',
          }
        : {
            label: 'Subsequent-use rate matches first use here',
            description: `At this down payment the subsequent-use and first-use rates are the same (${pct2(subRate)}), so subsequent use adds nothing to the fee on this loan.`,
            priority: 'medium',
          },
    );
  }

  if (!bahActive) {
    steps.push({
      label: 'See how this compares to your BAH',
      description: 'Toggle "Yes" on the BAH comparison section to see whether this estimated payment is above or below your housing allowance.',
      priority: 'low',
    });
  }

  return steps.slice(0, 3);
}

// ─── Main component ────────────────────────────────────────────────────────

export function VALoanCalculator() {
  // Loan details
  const [homePrice, setHomePrice] = useState(350000);
  const [downDollar, setDownDollar] = useState(0);
  const [downPercent, setDownPercent] = useState(0);
  const [downType, setDownType] = useState<'dollar' | 'percent'>('dollar');
  const [rate, setRate] = useState(6.0);
  const [termType, setTermType] = useState('30');
  const [annualTax, setAnnualTax] = useState(4200);
  const [annualIns, setAnnualIns] = useState(1400);

  // VA loan details
  const [firstUse, setFirstUse] = useState(true);
  const [feeStatus, setFeeStatus] = useState<FeeStatus>('none');
  const [financeFee, setFinanceFee] = useState(true);

  // BAH comparison
  const [bahActive, setBahActive] = useState(false);
  const [bahZip, setBahZip] = useState('');
  const [bahGrade, setBahGrade] = useState<PayGrade>('E-5');
  const [bahDependents, setBahDependents] = useState(false);

  // ─── Down payment helpers ────────────────────────────────────────────────
  function handleDownDollarChange(val: number) {
    const capped = Math.max(0, Math.min(val, homePrice));
    setDownDollar(capped);
    if (homePrice > 0) setDownPercent(parseFloat(((capped / homePrice) * 100).toFixed(2)));
  }

  function handleDownPercentChange(val: number) {
    const capped = Math.max(0, Math.min(val, 100));
    setDownPercent(capped);
    setDownDollar(Math.round(homePrice * capped / 100));
  }

  function switchDownType(type: 'dollar' | 'percent') {
    if (type === downType) return;
    setDownType(type);
  }

  function handleHomePriceChange(val: number) {
    const p = Math.max(0, val);
    setHomePrice(p);
    if (downType === 'percent') {
      setDownDollar(Math.round(p * downPercent / 100));
    } else {
      if (p > 0) setDownPercent(parseFloat(((downDollar / p) * 100).toFixed(2)));
      else setDownPercent(0);
    }
  }

  // downDollar is the canonical dollar value, kept in sync whether user types $ or %
  const effectiveDownDollar = downDollar;

  // ─── URL pre-population ───────────────────────────────────────────────────
  useEffect(() => {
    const params = readUrlParams('va-loan', window.location.search);
    const priceRaw = params.get('price');
    const downRaw = params.get('down');
    const downTypeRaw = params.get('downType');
    const rateRaw = params.get('rate');
    const termRaw = params.get('term');
    const taxRaw = params.get('tax');
    const insRaw = params.get('ins');
    const firstUseRaw = parseBool(params.get('firstUse'));
    const feeRaw = params.get('fee');
    const exemptRaw = params.get('exempt');
    const financeRaw = parseBool(params.get('financeFee'));
    const zipRaw = parseZip(params.get('zip'));
    const gradeRaw = parseGrade(params.get('rank'));
    const depRaw = parseBool(params.get('dep'));
    const bahRaw = parseBool(params.get('bah'));

    if (priceRaw) {
      const p = parseInt(priceRaw, 10);
      if (!isNaN(p) && p > 0) setHomePrice(p);
    }
    const dt = downTypeRaw === 'percent' ? 'percent' : 'dollar';
    if (downTypeRaw) setDownType(dt);
    if (downRaw) {
      const d = parseFloat(downRaw);
      if (!isNaN(d)) {
        if (dt === 'percent') {
          setDownPercent(d);
          const price = priceRaw ? parseInt(priceRaw, 10) : 350000;
          setDownDollar(Math.round(price * d / 100));
        } else {
          setDownDollar(Math.round(d));
          const price = priceRaw ? parseInt(priceRaw, 10) : 350000;
          if (price > 0) setDownPercent(parseFloat(((d / price) * 100).toFixed(2)));
        }
      }
    }
    if (rateRaw) {
      const r = parseFloat(rateRaw);
      if (!isNaN(r) && r > 0 && r < 30) setRate(r);
    }
    if (termRaw && ['30', '20', '15', 'arm5'].includes(termRaw)) setTermType(termRaw);
    if (taxRaw) {
      const t = parseInt(taxRaw, 10);
      if (!isNaN(t) && t >= 0) setAnnualTax(t);
    }
    if (insRaw) {
      const i = parseInt(insRaw, 10);
      if (!isNaN(i) && i >= 0) setAnnualIns(i);
    }
    if (firstUseRaw !== null) setFirstUse(firstUseRaw);
    if (feeRaw !== null || exemptRaw !== null) setFeeStatus(parseFeeStatus(feeRaw, exemptRaw));
    if (financeRaw !== null) setFinanceFee(financeRaw);
    if (zipRaw) setBahZip(zipRaw);
    if (gradeRaw) setBahGrade(gradeRaw);
    if (depRaw !== null) setBahDependents(depRaw);
    if (bahRaw !== null) setBahActive(bahRaw);
    else if (zipRaw) setBahActive(true);
  }, []);

  // ─── Shareable URL ─────────────────────────────────────────────────────────
  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('price', String(homePrice));
    p.set('down', String(downType === 'dollar' ? effectiveDownDollar : downPercent));
    p.set('downType', downType);
    p.set('rate', String(rate));
    p.set('term', termType);
    p.set('tax', String(annualTax));
    p.set('ins', String(annualIns));
    p.set('firstUse', firstUse ? 'yes' : 'no');
    p.set('fee', feeStatus);
    p.set('financeFee', financeFee ? 'yes' : 'no');
    p.set('bah', bahActive ? 'yes' : 'no');
    if (bahActive && bahZip) {
      p.set('zip', bahZip);
      p.set('rank', gradeToParam(bahGrade));
      p.set('dep', bahDependents ? 'yes' : 'no');
    }
    return `${window.location.origin}/calculators/va-loan?${p.toString()}`;
  }

  // ─── Derived term values ──────────────────────────────────────────────────
  const termYears = termYearsFromType(termType);
  const isArm = termType === 'arm5';

  // ─── Calculations ─────────────────────────────────────────────────────────
  const exempt = isFeeExempt(feeStatus);
  const calc = useMemo(() => {
    const downDollars = effectiveDownDollar;
    const downPct = homePrice > 0 ? (downDollars / homePrice) * 100 : 0;
    // Fee band: the typed percentage in percent mode (VAL-02), else dollars ÷ price.
    const bandPct = bandDownPct(downType, downPercent, downDollars, homePrice);
    const r = calcVaLoan({
      homePrice, downDollars, bandPct, rate, termYears, annualTax, annualIns, firstUse, feeStatus, financeFee,
    });
    return { ...r, downDollars, downPct, bandPct, feeTier: getFundingFeeTierLabel(bandPct) };
  }, [homePrice, effectiveDownDollar, downType, downPercent, rate, termYears, annualTax, annualIns, firstUse, feeStatus, financeFee]);

  // ─── BAH lookup (server-side via cached route) ──────────────────────────────
  // One-year rule (src/lib/combinedPayYear.ts), as in the other calculators: BAH for
  // the year in use, plus a separate "(from Jan. 1)" line while a newer year waits.
  const bahYear = combinedPayBahYear();
  const { data: bahData, pendingYear, pendingData } = useCombinedBahLookup(bahActive ? bahZip : '');
  const bahResult = useMemo(() => {
    if (!bahActive) return null;
    const monthlyRate = rateFor(bahData, bahGrade, bahDependents);
    if (monthlyRate === null) return null;
    return { monthlyRate, locationName: bahData?.locationName ?? '' };
  }, [bahActive, bahData, bahGrade, bahDependents]);
  const pendingBah = bahActive && pendingYear ? rateFor(pendingData, bahGrade, bahDependents) : null;

  // ─── Analytics ────────────────────────────────────────────────────────────
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { attach: gaAttach, hasInteracted: gaInteracted, root: gaRoot } = useUserInputGate();
  useEffect(() => {
    if (!gaInteracted()) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('va-loan'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [calc, gaInteracted]);

  // ─── Action steps ─────────────────────────────────────────────────────────
  const actionSteps = useMemo(
    () => buildActionSteps(feeStatus, calc.fundingFeeAmount, calc.standardFeeAmount, calc.baseLoan, firstUse, calc.bandPct, bahActive),
    [feeStatus, calc.fundingFeeAmount, calc.standardFeeAmount, calc.baseLoan, firstUse, calc.bandPct, bahActive],
  );

  const hasBahResult = bahActive && !!bahResult;

  // BAH coverage derived values (computed only when result is available)
  const bahCoveragePct = hasBahResult && bahResult && calc.totalPITI > 0
    ? Math.round((bahResult.monthlyRate / calc.totalPITI) * 100)
    : 0;
  const bahSurplus = hasBahResult && bahResult
    ? Math.max(0, bahResult.monthlyRate - calc.totalPITI)
    : 0;
  const bahRemaining = hasBahResult && bahResult
    ? Math.max(0, calc.totalPITI - bahResult.monthlyRate)
    : 0;
  const bahFullyCovered = hasBahResult && !!bahResult && bahResult.monthlyRate >= calc.totalPITI;
  const bahNearlyCovered = !bahFullyCovered && bahCoveragePct >= 90;

  // After the URL effect: input made before hydration wins over URL params (build 1c).
  const hydrated = usePreHydrationSync(gaRoot, { calculator: 'va-loan', shareUrl: getShareUrl });
  const inert = hydrated ? undefined : true;

  return (
    <div ref={gaAttach} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Section 1: Loan Details ─────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Loan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Home price */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Home price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(homePrice)}
                onChange={(e) => handleHomePriceChange(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6'}
              />
            </div>
          </div>

          {/* Down payment */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Down payment</label>
            <div className="flex gap-2">
              <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[38px] flex-none">
                <button
                  type="button"
                  aria-disabled={inert}
                  onClick={() => switchDownType('dollar')}
                  className={[
                    'px-3 text-sm font-medium transition-colors',
                    downType === 'dollar' ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >$</button>
                <button
                  type="button"
                  aria-disabled={inert}
                  onClick={() => switchDownType('percent')}
                  className={[
                    'px-3 text-sm font-medium transition-colors border-l border-zinc-300',
                    downType === 'percent' ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >%</button>
              </div>
              {downType === 'dollar' ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={fmtDollar(downDollar)}
                  onChange={(e) => handleDownDollarChange(parseDollar(e.target.value))}
                  className={INPUT_CLS + ' flex-1'}
                />
              ) : (
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  max={100}
                  value={downPercent}
                  onChange={(e) => handleDownPercentChange(Number(e.target.value))}
                  className={INPUT_CLS + ' flex-1'}
                />
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {downType === 'dollar'
                ? `${homePrice > 0 ? calc.downPct.toFixed(1) : '0.0'}% of home price · VA loans allow $0 down for eligible borrowers`
                : `${formatCurrency(effectiveDownDollar)} · VA loans allow $0 down for eligible borrowers`}
            </p>
          </div>

          {/* Interest rate */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Interest rate</label>
            <div className="relative">
              <input
                type="number"
                min={0.125}
                max={25}
                step={0.125}
                value={rate}
                onChange={(e) => setRate(Math.max(0.125, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            <p className="text-xs text-zinc-500">Enter the rate you&apos;ve been quoted or a current market estimate. This calculator does not provide rate quotes.</p>
          </div>

          {/* Loan term */}
          <div className="flex flex-col gap-1">
            <Select
              label="Loan term"
              options={TERM_OPTIONS}
              value={termType}
              onChange={(e) => setTermType(e.target.value)}
            />
            {isArm && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Rate shown applies to the initial 5-year fixed period. Rate adjusts annually after year 5.
              </p>
            )}
          </div>

          {/* Annual property taxes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Annual property taxes</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(annualTax)}
                onChange={(e) => setAnnualTax(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6 pr-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">/yr</span>
            </div>
            <p className="text-xs text-zinc-500">{formatCurrency(annualTax / 12)}/mo · Varies by location — check your county assessor.</p>
          </div>

          {/* Annual homeowner's insurance */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Annual homeowner&apos;s insurance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(annualIns)}
                onChange={(e) => setAnnualIns(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6 pr-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">/yr</span>
            </div>
            <p className="text-xs text-zinc-500">{formatCurrency(annualIns / 12)}/mo</p>
          </div>

        </div>
      </Card>

      {/* ── Section 2: BAH Comparison ──────────────────────────────────── */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="vl-bah-label" className="text-lg font-semibold text-zinc-900">Are you currently receiving BAH?</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Compare your housing allowance to this estimated payment</p>
          </div>
          <div className="flex gap-3 flex-none ml-4" role="group" aria-labelledby="vl-bah-label">
            <button type="button" aria-disabled={inert} onClick={() => setBahActive(false)} className={btnCls(!bahActive)}>No</button>
            <button type="button" aria-disabled={inert} onClick={() => setBahActive(true)} className={btnCls(bahActive)}>Yes</button>
          </div>
        </div>

        {bahActive && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
            <div>
              <BaseSearchInput
                label="Duty Station"
                value={bahZip}
                onZipChange={setBahZip}
                placeholder="Try 'Fort Bragg' or '28310'"
                hint="We'll match your ZIP or installation to the correct BAH area."
              />
            </div>
            <div>
              <Select
                label="Pay Grade"
                groups={GRADE_GROUPS}
                value={bahGrade}
                onChange={(e) => setBahGrade(e.target.value as PayGrade)}
                after={<RankHelper grade={bahGrade} />}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Dependency Status</span>
              <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px] mt-1">
                <button
                  type="button"
                  aria-disabled={inert}
                  onClick={() => setBahDependents(false)}
                  className={['flex-1 text-sm font-medium transition-colors', !bahDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'].join(' ')}
                >Without</button>
                <button
                  type="button"
                  aria-disabled={inert}
                  onClick={() => setBahDependents(true)}
                  className={['flex-1 text-sm font-medium transition-colors border-l border-zinc-300', bahDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'].join(' ')}
                >With Dependents</button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Section 3: VA Loan Details ──────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">VA Loan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Row 1 col 1: VA loan use — always visible */}
          <div className="flex flex-col gap-1">
            <span id="vl-use-label" className="text-sm font-medium text-zinc-700">VA loan use</span>
            <div className="flex gap-3 mt-1" role="group" aria-labelledby="vl-use-label">
              <button type="button" aria-disabled={inert} onClick={() => setFirstUse(true)} className={btnCls(firstUse)}>First use</button>
              <button type="button" aria-disabled={inert} onClick={() => setFirstUse(false)} className={btnCls(!firstUse)}>Subsequent use</button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              First use = you&apos;ve never used a VA loan for a standard home purchase, or your entitlement has been fully restored. Subsequent use = you&apos;ve previously used a VA loan benefit for a home purchase.
            </p>
          </div>

          {/* Row 1 col 2: down payment tier — hidden when exempt */}
          {!exempt && (
            <div className="flex flex-col gap-1 justify-center">
              <span className="text-sm font-medium text-zinc-700">Down payment tier</span>
              <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-800">{calc.feeTier}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Funding fee rate: <span className="font-semibold text-zinc-700">{pct2(calc.fundingFeeRate)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Row 2 (full width): funding fee status — VA's exemption list */}
          <fieldset className="sm:col-span-2 flex flex-col gap-1" data-testid="vl-fee-status">
            <legend className="text-sm font-medium text-zinc-700">Do you have to pay the VA funding fee?</legend>
            <p className="text-xs text-zinc-500">
              VA&apos;s exemption list. Your lender confirms it from your Certificate of Eligibility.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {FEE_STATUSES.map((s) => (
                <label
                  key={s.value}
                  className={[
                    'flex items-start gap-2.5 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors',
                    feeStatus === s.value ? 'border-red-700 bg-red-50 text-zinc-900' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="vl-fee-status"
                    value={s.value}
                    checked={feeStatus === s.value}
                    onChange={() => setFeeStatus(s.value)}
                    className="mt-0.5 accent-red-700"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
            {exempt && (
              <p
                className="mt-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800"
                data-testid="vl-exempt-result"
              >
                <span className="font-semibold">No funding fee.</span>{' '}
                On a {formatCurrency(calc.baseLoan)} {firstUse ? 'first-use' : 'subsequent-use'} loan with{' '}
                {calc.downDollars > 0 ? `${formatCurrency(calc.downDollars)} down` : 'no down payment'}, that&apos;s{' '}
                <span className="font-bold">{formatCurrency(calc.standardFeeAmount)}</span>{' '}you don&apos;t pay.
              </p>
            )}
            {feeStatus === 'pending' && (
              <p
                className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900"
                data-testid="vl-pending-note"
              >
                With a claim still pending, the fee is due at closing. VA&apos;s rule: if VA later awards you
                compensation with an effective date before your closing date, you may be eligible for a refund.
                A proposed or memorandum rating received after closing doesn&apos;t qualify for a refund.
              </p>
            )}
          </fieldset>

          {!exempt && (
            <div className="flex flex-col gap-1">
              <span id="vl-finance-label" className="text-sm font-medium text-zinc-700">Finance funding fee</span>
              <div className="flex gap-3 mt-1" role="group" aria-labelledby="vl-finance-label">
                <button type="button" aria-disabled={inert} onClick={() => setFinanceFee(true)} className={btnCls(financeFee)}>Yes (roll in)</button>
                <button type="button" aria-disabled={inert} onClick={() => setFinanceFee(false)} className={btnCls(!financeFee)}>No (pay at closing)</button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {financeFee
                  ? `Rolling the fee into your loan adds ${formatCurrency(calc.fundingFeeAmount)} to your balance and ~${formatCurrency(calc.feeFinancedExtra)}/mo to your payment.`
                  : `Paying at closing keeps your loan amount lower but adds ${formatCurrency(calc.fundingFeeAmount)} to cash due at signing.`}
              </p>
            </div>
          )}

        </div>
      </Card>

      {/* ── Results ─────────────────────────────────────────────────────── */}

      {/* Primary output card */}
      <div className="bg-red-700 rounded-lg p-6 text-white">
        <p className="text-red-200 text-sm font-medium uppercase tracking-wider mb-1">
          Estimated Monthly Payment (PITI)
        </p>
        <p className="text-4xl font-bold tabular-nums tracking-tight">
          {formatCurrency(calc.totalPITI)}
        </p>
        <p className="text-red-200 text-sm mt-1">
          {formatCurrency(calc.totalPITI * 12)}/year · VA funding fee rates effective {FUNDING_FEE_RATES_EFFECTIVE}
        </p>
        <div className="mt-4 pt-4 border-t border-red-600 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-red-200 text-xs uppercase tracking-wide">Funding Fee</p>
            <p className="text-white text-base font-semibold mt-0.5" data-testid="vl-funding-fee">
              {exempt ? '$0 — Waived' : formatCurrency(calc.fundingFeeAmount)}
            </p>
            {exempt
              ? <p className="text-green-300 text-xs mt-0.5">VA exemption</p>
              : <p className="text-red-200 text-xs mt-0.5">{financeFee ? 'Rolled into loan' : 'Due at closing'}</p>
            }
          </div>
          <div>
            <p className="text-red-200 text-xs uppercase tracking-wide">Loan Amount</p>
            <p className="text-white text-base font-semibold mt-0.5">{formatCurrency(calc.financedLoan)}</p>
            <p className="text-red-200 text-xs mt-0.5">
              {financeFee && !exempt ? 'Incl. funded fee' : `${formatCurrency(homePrice)} − ${formatCurrency(calc.downDollars)}`}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-red-200 text-xs uppercase tracking-wide">Monthly P&amp;I</p>
            <p className="text-white text-base font-semibold mt-0.5">{formatCurrency(calc.monthlyPI)}</p>
            <p className="text-red-200 text-xs mt-0.5">
              {isArm ? `5/1 ARM · first 5 years · ${rate}%` : `${termType}-yr fixed · ${rate}%`}
            </p>
          </div>
        </div>
      </div>

      {/* BAH comparison — prominent when active and populated */}
      {hasBahResult && bahResult && (
        <div className={[
          'rounded-lg border-2 p-5',
          bahFullyCovered ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-zinc-50',
        ].join(' ')}>
          <p className={['text-sm font-bold uppercase tracking-wide mb-4', bahFullyCovered ? 'text-green-800' : 'text-zinc-600'].join(' ')}>
            BAH vs. Estimated Payment · {bahResult.locationName}
          </p>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Your {bahYear} BAH</p>
              <p className="text-3xl font-bold tabular-nums text-zinc-900">{formatCurrency(bahResult.monthlyRate)}</p>
              <p className="text-xs text-zinc-500 mt-1">/month</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Est. Payment</p>
              <p className="text-3xl font-bold tabular-nums text-zinc-900">{formatCurrency(calc.totalPITI)}</p>
              <p className="text-xs text-zinc-500 mt-1">/month</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">BAH Covers</p>
              <p className={['text-3xl font-bold tabular-nums', bahFullyCovered ? 'text-green-700' : 'text-zinc-900'].join(' ')}>
                {bahCoveragePct}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">of payment</p>
            </div>
          </div>
          <p className={['text-sm leading-relaxed', bahFullyCovered ? 'text-green-800' : 'text-zinc-700'].join(' ')}>
            {bahFullyCovered
              ? `Your BAH fully covers this estimated payment — with ${formatCurrency(bahSurplus)}/month to spare. Your housing allowance exceeds this estimated payment, which can help build savings or cover other housing costs.`
              : bahNearlyCovered
              ? `Your BAH covers nearly all of this estimated payment (${bahCoveragePct}%). The remaining ${formatCurrency(bahRemaining)}/month would come from other income or savings.`
              : `Your BAH covers ${bahCoveragePct}% of this estimated payment. The remaining ${formatCurrency(bahRemaining)}/month would come from other income or savings.`}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            BAH is excluded from federal taxable income but is counted as income for VA loan qualification purposes. BAH shown: {bahYear} rates.
          </p>
          {pendingYear && pendingBah !== null && (
            <p className="text-xs text-zinc-500 mt-1" data-testid="vl-pending-bah">
              {pendingBahLabel(pendingYear)}: {formatCurrency(pendingBah)}/month — not in this comparison.
            </p>
          )}
        </div>
      )}

      <SaveOrShareResults
        pageName="va-loan"
        headline="Save or share your VA loan estimate"
        supportingText="Useful for comparing lender quotes, talking with a spouse, or reviewing your payment estimate before house hunting."
        usefulFor={['Lender comparison', 'House hunting budget', 'Spouse or family']}
        getUrl={getShareUrl}
        shareTitle="VA loan payment estimate"
        shareText="Here's my VA loan estimate from MilPayTools."
      />

      {/* Payment breakdown */}
      <Card variant="bordered">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Payment Breakdown</h3>
        <div className="space-y-2">
          {[
            { label: 'Principal & Interest', value: calc.monthlyPI },
            { label: 'Property Tax', value: calc.monthlyTax },
            { label: "Homeowner's Insurance", value: calc.monthlyIns },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
              <span className="text-sm text-zinc-600">{label}</span>
              <span className="text-sm font-medium text-zinc-800 tabular-nums">{formatCurrency(value)}/mo</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-zinc-900">Total (PITI)</span>
            <span className="text-base font-bold text-zinc-900 tabular-nums">{formatCurrency(calc.totalPITI)}/mo</span>
          </div>
        </div>
      </Card>

      {/* Funding fee detail card */}
      <Card variant="bordered">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Funding Fee Detail</h3>
        {exempt ? (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-semibold text-green-800">
              Funding Fee Waived — VA Exemption
            </p>
            <p className="text-sm text-green-700 mt-1">
              The fee you would otherwise pay: {pct2(calc.standardFeeRate)} of {formatCurrency(calc.baseLoan)} ={' '}
              <span className="font-bold">{formatCurrency(calc.standardFeeAmount)}</span>.
            </p>
            <p className="text-xs text-green-600 mt-2">
              Paid the fee on an earlier VA loan? VA&apos;s rule: you may be eligible for a refund if you&apos;re later
              awarded VA compensation with an effective date before that loan&apos;s closing date. A proposed or
              memorandum rating received after closing doesn&apos;t qualify.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-2xl font-bold tabular-nums text-zinc-900">
                  {(calc.fundingFeeRate * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-zinc-500 mt-1">Fee rate</p>
                <p className="text-xs text-zinc-400 mt-0.5">{firstUse ? 'First use' : 'Subsequent use'} · {calc.feeTier}</p>
              </div>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-2xl font-bold tabular-nums text-zinc-900">
                  {formatCurrency(calc.fundingFeeAmount)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Fee amount</p>
                <p className="text-xs text-zinc-400 mt-0.5">{financeFee ? 'Rolled into loan' : 'Due at closing'}</p>
              </div>
              {financeFee && (
                <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3 col-span-2 sm:col-span-1">
                  <p className="text-2xl font-bold tabular-nums text-zinc-900">
                    +{formatCurrency(calc.feeFinancedExtra)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Added to monthly payment</p>
                  <p className="text-xs text-zinc-400 mt-0.5">From financing the fee</p>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              The VA funding fee is paid directly to the VA to sustain the loan program — not to the lender.
              It is not an insurance premium and does not accrue interest on its own (though financing it adds to your loan balance).
            </p>
            <p className="text-sm text-zinc-600">
              <a href="/calculators/va-disability" className="text-blue-700 hover:text-blue-800 underline">
                Not sure about your rating? Calculate your combined VA disability rating →
              </a>
            </p>
          </div>
        )}
      </Card>

      {/* Action steps */}
      <ActSteps steps={actionSteps} title="Your Next Steps" />

    </div>
  );
}
