'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { lookupBAH } from '@/lib/calculations/bah';
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

// ─── Funding fee table (Purchase, effective through Nov 14, 2031) ─────────
const FUNDING_FEE = {
  first:      { lt5: 0.0215, gte5lt10: 0.015, gte10: 0.0125 },
  subsequent: { lt5: 0.0330, gte5lt10: 0.015, gte10: 0.0125 },
};

function getFundingFeeRate(firstUse: boolean, downPct: number): number {
  const tier = firstUse ? FUNDING_FEE.first : FUNDING_FEE.subsequent;
  if (downPct < 5) return tier.lt5;
  if (downPct < 10) return tier.gte5lt10;
  return tier.gte10;
}

function getFundingFeeTierLabel(downPct: number): string {
  if (downPct < 5) return 'Less than 5% down';
  if (downPct < 10) return '5% to 9.99% down';
  return '10% or more down';
}

// ─── Mortgage math ────────────────────────────────────────────────────────
function calcMonthlyPI(loanAmount: number, annualRatePct: number, termYears: number): number {
  if (loanAmount <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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
  disabilityExempt: boolean,
  fundingFeeAmount: number,
  firstUse: boolean,
  bahExpanded: boolean,
): ActionStep[] {
  const steps: ActionStep[] = [];

  if (!disabilityExempt) {
    steps.push({
      label: 'Check your VA disability rating',
      description: `A service-connected rating of 10% or higher waives the VA funding fee entirely — saving you ${formatCurrency(fundingFeeAmount)} on this purchase. Calculate your combined rating to see if you qualify.`,
      priority: 'high',
      href: '/calculators/va-disability',
    });
  } else {
    steps.push({
      label: 'Your disability exemption saves you real money',
      description: `Your service-connected disability rating waives the ${formatCurrency(fundingFeeAmount)} funding fee. This exemption applies every time you use the VA loan benefit.`,
      priority: 'medium',
    });
  }

  if (!firstUse) {
    steps.push({
      label: 'Subsequent-use funding fee is higher',
      description: 'Your 3.30% subsequent-use fee is $500–$5,000+ more than the first-use fee on the same home. If putting 5%+ down, the rate equalizes at 1.50%. A disability rating of 10%+ waives it entirely.',
      priority: 'medium',
    });
  }

  if (!bahExpanded) {
    steps.push({
      label: 'See how this compares to your BAH',
      description: 'Expand the BAH comparison section to see whether this estimated payment is above or below your housing allowance.',
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
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState<30 | 15>(30);
  const [taxRate, setTaxRate] = useState(1.2);
  const [insuranceRate, setInsuranceRate] = useState(0.35);
  const [hoa, setHoa] = useState(0);

  // VA loan details
  const [firstUse, setFirstUse] = useState(true);
  const [disabilityExempt, setDisabilityExempt] = useState(false);
  const [financeFee, setFinanceFee] = useState(true);

  // BAH comparison
  const [bahExpanded, setBahExpanded] = useState(false);
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
    // Values already synced
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
    const params = new URLSearchParams(window.location.search);
    const priceRaw = params.get('price');
    const downRaw = params.get('down');
    const downTypeRaw = params.get('downType');
    const rateRaw = params.get('rate');
    const termRaw = params.get('term');
    const taxRaw = params.get('tax');
    const insRaw = params.get('ins');
    const hoaRaw = params.get('hoa');
    const firstUseRaw = parseBool(params.get('firstUse'));
    const exemptRaw = parseBool(params.get('exempt'));
    const financeRaw = parseBool(params.get('financeFee'));
    const zipRaw = parseZip(params.get('zip'));
    const gradeRaw = parseGrade(params.get('rank'));
    const depRaw = parseBool(params.get('dep'));

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
    if (termRaw === '15') setTerm(15);
    if (taxRaw) {
      const t = parseFloat(taxRaw);
      if (!isNaN(t) && t >= 0 && t <= 5) setTaxRate(t);
    }
    if (insRaw) {
      const i = parseFloat(insRaw);
      if (!isNaN(i) && i >= 0 && i <= 3) setInsuranceRate(i);
    }
    if (hoaRaw) {
      const h = parseInt(hoaRaw, 10);
      if (!isNaN(h) && h >= 0) setHoa(h);
    }
    if (firstUseRaw !== null) setFirstUse(firstUseRaw);
    if (exemptRaw !== null) setDisabilityExempt(exemptRaw);
    if (financeRaw !== null) setFinanceFee(financeRaw);
    if (zipRaw) setBahZip(zipRaw);
    if (gradeRaw) setBahGrade(gradeRaw);
    if (depRaw !== null) setBahDependents(depRaw);
    if (zipRaw) setBahExpanded(true);
  }, []);

  // ─── Shareable URL ─────────────────────────────────────────────────────────
  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('price', String(homePrice));
    p.set('down', String(downType === 'dollar' ? effectiveDownDollar : downPercent));
    p.set('downType', downType);
    p.set('rate', String(rate));
    p.set('term', String(term));
    p.set('tax', String(taxRate));
    p.set('ins', String(insuranceRate));
    if (hoa > 0) p.set('hoa', String(hoa));
    p.set('firstUse', firstUse ? 'yes' : 'no');
    p.set('exempt', disabilityExempt ? 'yes' : 'no');
    p.set('financeFee', financeFee ? 'yes' : 'no');
    if (bahExpanded && bahZip) {
      p.set('zip', bahZip);
      p.set('rank', gradeToParam(bahGrade));
      p.set('dep', bahDependents ? 'yes' : 'no');
    }
    return `${window.location.origin}/calculators/va-loan?${p.toString()}`;
  }

  // ─── Calculations ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const downDollars = effectiveDownDollar;
    const downPct = homePrice > 0 ? (downDollars / homePrice) * 100 : 0;
    const baseLoan = Math.max(0, homePrice - downDollars);

    const fundingFeeRate = disabilityExempt ? 0 : getFundingFeeRate(firstUse, downPct);
    const fundingFeeAmount = Math.round(baseLoan * fundingFeeRate);
    const financedLoan = financeFee ? baseLoan + fundingFeeAmount : baseLoan;

    // VA monthly P&I
    const monthlyPI = calcMonthlyPI(financedLoan, rate, term);
    const monthlyTax = homePrice * taxRate / 100 / 12;
    const monthlyIns = homePrice * insuranceRate / 100 / 12;
    const totalPITI = monthlyPI + monthlyTax + monthlyIns + hoa;

    // Conventional comparison (same down payment, no funding fee, PMI if <20%)
    const convPI = calcMonthlyPI(baseLoan, rate, term);
    const convPMIMonthly = downPct < 20 ? baseLoan * 0.005 / 12 : 0;
    const convTotal = convPI + monthlyTax + monthlyIns + hoa + convPMIMonthly;

    // Savings comparison (VA vs Conventional)
    const monthlyDiff = convTotal - totalPITI;
    const n = term * 12;

    // Fee tier label
    const feeTier = getFundingFeeTierLabel(downPct);

    // Cash to close estimates
    const vaClosingCash = downDollars + (financeFee ? 0 : fundingFeeAmount);
    const convClosingCash = downDollars;

    // If financed: monthly cost of the funding fee itself
    const feeFinancedExtra = financeFee && !disabilityExempt
      ? calcMonthlyPI(fundingFeeAmount, rate, term)
      : 0;

    // Conventional PMI: months until 20% equity (rough estimate)
    const convPmiMonths = (downPct < 20 && baseLoan > 0)
      ? Math.ceil(baseLoan * (1 - 0.8) / (convPI - (baseLoan * (rate / 100 / 12))))
      : 0;

    return {
      downDollars, downPct, baseLoan,
      fundingFeeRate, fundingFeeAmount, financedLoan,
      monthlyPI, monthlyTax, monthlyIns, totalPITI,
      convPI, convPMIMonthly, convTotal,
      monthlyDiff,
      fiveYearDiff: monthlyDiff * 60,
      termDiff: monthlyDiff * n,
      feeTier,
      vaClosingCash, convClosingCash,
      feeFinancedExtra,
      convPmiMonths,
    };
  }, [homePrice, effectiveDownDollar, rate, term, taxRate, insuranceRate, hoa, firstUse, disabilityExempt, financeFee]);

  // ─── BAH lookup ───────────────────────────────────────────────────────────
  const bahResult = useMemo(() => {
    if (!bahExpanded || bahZip.length !== 5) return null;
    return lookupBAH({ zipCode: bahZip, payGrade: bahGrade, hasDependents: bahDependents });
  }, [bahExpanded, bahZip, bahGrade, bahDependents]);

  // ─── Analytics ────────────────────────────────────────────────────────────
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const _gaMountedRef = useRef(false);
  useEffect(() => {
    if (!_gaMountedRef.current) { _gaMountedRef.current = true; return; }
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('va-loan'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [calc]);

  // ─── Action steps ─────────────────────────────────────────────────────────
  const actionSteps = useMemo(
    () => buildActionSteps(disabilityExempt, calc.fundingFeeAmount, firstUse, bahExpanded),
    [disabilityExempt, calc.fundingFeeAmount, firstUse, bahExpanded],
  );

  const hasBahComparison = bahExpanded && !!bahResult;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

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
                type="number"
                min={0}
                step={1000}
                value={homePrice}
                onChange={(e) => handleHomePriceChange(Number(e.target.value))}
                className={INPUT_CLS + ' pl-6'}
              />
            </div>
          </div>

          {/* Down payment */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Down payment</label>
            <div className="flex gap-2">
              {/* Type toggle */}
              <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[38px] flex-none">
                <button
                  type="button"
                  onClick={() => switchDownType('dollar')}
                  className={[
                    'px-3 text-sm font-medium transition-colors',
                    downType === 'dollar' ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >$</button>
                <button
                  type="button"
                  onClick={() => switchDownType('percent')}
                  className={[
                    'px-3 text-sm font-medium transition-colors border-l border-zinc-300',
                    downType === 'percent' ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >%</button>
              </div>
              {/* Input */}
              <input
                type="number"
                min={0}
                step={downType === 'dollar' ? 500 : 0.5}
                max={downType === 'dollar' ? homePrice : 100}
                value={downType === 'dollar' ? downDollar : downPercent}
                onChange={(e) => {
                  if (downType === 'dollar') handleDownDollarChange(Number(e.target.value));
                  else handleDownPercentChange(Number(e.target.value));
                }}
                className={INPUT_CLS + ' flex-1'}
              />
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
                min={0.1}
                max={25}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            <p className="text-xs text-zinc-500">Enter the rate you&apos;ve been quoted or a current market estimate. This calculator does not provide rate quotes.</p>
          </div>

          {/* Loan term */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Loan term</span>
            <div className="flex gap-3 mt-1">
              {([30, 15] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={btnCls(term === t)}
                >
                  {t} years
                </button>
              ))}
            </div>
          </div>

          {/* Property tax rate */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Property tax rate</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={5}
                step={0.05}
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            <p className="text-xs text-zinc-500">Annual rate applied to home value. Varies by location — check your county assessor.</p>
          </div>

          {/* Homeowner's insurance */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Homeowner&apos;s insurance</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={3}
                step={0.05}
                value={insuranceRate}
                onChange={(e) => setInsuranceRate(Math.max(0, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            <p className="text-xs text-zinc-500">Annual rate applied to home value.</p>
          </div>

          {/* HOA */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">HOA (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="number"
                min={0}
                step={25}
                value={hoa}
                onChange={(e) => setHoa(Math.max(0, Number(e.target.value)))}
                className={INPUT_CLS + ' pl-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">/mo</span>
            </div>
          </div>

        </div>
      </Card>

      {/* ── Section 2: VA Loan Details ──────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">VA Loan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* First / subsequent use */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">VA loan use</span>
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setFirstUse(true)} className={btnCls(firstUse)}>First use</button>
              <button type="button" onClick={() => setFirstUse(false)} className={btnCls(!firstUse)}>Subsequent use</button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              First use = you&apos;ve never used a VA loan for a standard home purchase, or your entitlement has been fully restored. Subsequent use = you&apos;ve previously used a VA loan benefit for a home purchase.
            </p>
          </div>

          {/* Funding fee tier (auto-calculated) */}
          <div className="flex flex-col gap-1 justify-center">
            <span className="text-sm font-medium text-zinc-700">Down payment tier</span>
            <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-800">{calc.feeTier}</p>
              {!disabilityExempt && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Funding fee rate: <span className="font-semibold text-zinc-700">{(calc.fundingFeeRate * 100).toFixed(2)}%</span>
                </p>
              )}
            </div>
          </div>

          {/* VA disability */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">VA disability rating</span>
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setDisabilityExempt(false)} className={btnCls(!disabilityExempt)}>None</button>
              <button type="button" onClick={() => setDisabilityExempt(true)} className={btnCls(disabilityExempt)}>10%+ (exempt)</button>
            </div>
            {disabilityExempt ? (
              <div className="mt-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                <p className="text-xs text-green-800 font-medium">
                  Your service-connected disability rating exempts you from the VA funding fee.
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Amount saved: <span className="font-bold">{formatCurrency(Math.round(calc.baseLoan * getFundingFeeRate(firstUse, calc.downPct)))}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">Also exempt: Purple Heart recipients (active duty), surviving spouses receiving DIC.</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mt-1">10% or higher service-connected disability rating waives the funding fee entirely.</p>
            )}
          </div>

          {/* Finance funding fee */}
          {!disabilityExempt && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Finance funding fee</span>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setFinanceFee(true)} className={btnCls(financeFee)}>Yes (roll in)</button>
                <button type="button" onClick={() => setFinanceFee(false)} className={btnCls(!financeFee)}>No (pay at closing)</button>
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

      {/* ── Section 3: BAH Comparison (collapsible) ─────────────────────── */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setBahExpanded(!bahExpanded)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 transition-colors"
        >
          <div>
            <p className="text-base font-semibold text-zinc-900">Currently receiving BAH?</p>
            <p className="text-sm text-zinc-500 mt-0.5">Compare to your housing allowance</p>
          </div>
          <svg
            className={['w-4 h-4 text-zinc-400 transition-transform flex-none ml-3', bahExpanded ? 'rotate-180' : ''].join(' ')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {bahExpanded && (
          <div className="border-t border-zinc-100 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-700">Dependency Status</span>
                <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px] mt-1">
                  <button
                    type="button"
                    onClick={() => setBahDependents(false)}
                    className={['flex-1 text-sm font-medium transition-colors', !bahDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'].join(' ')}
                  >Without</button>
                  <button
                    type="button"
                    onClick={() => setBahDependents(true)}
                    className={['flex-1 text-sm font-medium transition-colors border-l border-zinc-300', bahDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'].join(' ')}
                  >With Dependents</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
          {formatCurrency(calc.totalPITI * 12)}/year · Based on 2026 rates
        </p>
        <div className="mt-4 pt-4 border-t border-red-600 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-red-200 text-xs uppercase tracking-wide">Funding Fee</p>
            <p className="text-white text-base font-semibold mt-0.5">
              {disabilityExempt ? '$0 — Waived' : formatCurrency(calc.fundingFeeAmount)}
            </p>
            {disabilityExempt && (
              <p className="text-green-300 text-xs mt-0.5">Disability exemption</p>
            )}
            {!disabilityExempt && (
              <p className="text-red-200 text-xs mt-0.5">{financeFee ? 'Rolled into loan' : 'Due at closing'}</p>
            )}
          </div>
          <div>
            <p className="text-red-200 text-xs uppercase tracking-wide">Loan Amount</p>
            <p className="text-white text-base font-semibold mt-0.5">{formatCurrency(calc.financedLoan)}</p>
            <p className="text-red-200 text-xs mt-0.5">
              {financeFee && !disabilityExempt ? 'Incl. funded fee' : `${formatCurrency(homePrice)} − ${formatCurrency(calc.downDollars)}`}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-red-200 text-xs uppercase tracking-wide">Monthly P&amp;I</p>
            <p className="text-white text-base font-semibold mt-0.5">{formatCurrency(calc.monthlyPI)}</p>
            <p className="text-red-200 text-xs mt-0.5">{term}-year · {rate}% rate</p>
          </div>
        </div>
      </div>

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
            ...(hoa > 0 ? [{ label: 'HOA', value: hoa }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
              <span className="text-sm text-zinc-600">{label}</span>
              <span className="text-sm font-medium text-zinc-800 tabular-nums">{formatCurrency(value)}/mo</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-zinc-900">Total</span>
            <span className="text-base font-bold text-zinc-900 tabular-nums">{formatCurrency(calc.totalPITI)}/mo</span>
          </div>
        </div>
      </Card>

      {/* Funding fee detail card */}
      <Card variant="bordered">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Funding Fee Detail</h3>
        {disabilityExempt ? (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-semibold text-green-800">
              Funding Fee Waived — Disability Exemption
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your service-connected disability rating saves you{' '}
              <span className="font-bold">{formatCurrency(Math.round(calc.baseLoan * getFundingFeeRate(firstUse, calc.downPct)))}</span>{' '}
              on this purchase.
            </p>
            <p className="text-xs text-green-600 mt-2">
              This exemption applies every time you use your VA loan benefit. If you received your rating after closing on a previous VA loan, contact VA — you may be eligible for a refund.
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

      {/* VA vs Conventional comparison */}
      <div>
        <h3 className="text-base font-semibold text-zinc-900 mb-3">VA vs. Conventional Comparison</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* VA column */}
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5">
            <p className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">VA Loan</p>
            <div className="space-y-2">
              {[
                { label: 'Down payment', value: `${formatCurrency(calc.downDollars)} (${calc.downPct.toFixed(1)}%)` },
                { label: 'Funding fee', value: disabilityExempt ? '$0 (exempt)' : formatCurrency(calc.fundingFeeAmount) },
                { label: 'Monthly PMI', value: '$0 — VA never charges PMI', highlight: true },
                { label: 'Monthly PITI', value: `${formatCurrency(calc.totalPITI)}/mo`, highlight: true },
                { label: 'Cash to close (est.)', value: formatCurrency(calc.vaClosingCash) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={['text-sm', highlight ? 'font-semibold text-red-900' : 'text-red-700'].join(' ')}>{label}</span>
                  <span className={['text-sm tabular-nums', highlight ? 'font-bold text-red-900' : 'text-red-800'].join(' ')}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conventional column */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-bold text-zinc-600 mb-3 uppercase tracking-wide">Conventional</p>
            <div className="space-y-2">
              {[
                { label: 'Down payment', value: `${formatCurrency(calc.downDollars)} (${calc.downPct.toFixed(1)}%)` },
                { label: 'Funding fee', value: '$0' },
                { label: 'Monthly PMI', value: calc.convPMIMonthly > 0 ? `${formatCurrency(calc.convPMIMonthly)}/mo` : '$0 (20%+ down)' },
                { label: 'Monthly PITI + PMI', value: `${formatCurrency(calc.convTotal)}/mo`, highlight: true },
                { label: 'Cash to close (est.)', value: formatCurrency(calc.convClosingCash) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={['text-sm', highlight ? 'font-semibold text-zinc-900' : 'text-zinc-600'].join(' ')}>{label}</span>
                  <span className={['text-sm tabular-nums', highlight ? 'font-bold text-zinc-900' : 'text-zinc-700'].join(' ')}>{value}</span>
                </div>
              ))}
            </div>
            {calc.convPMIMonthly > 0 && (
              <p className="text-xs text-zinc-400 mt-3">PMI required until 20% equity is reached. Rate varies by credit score and LTV. Estimate uses 0.5% of loan amount annually.</p>
            )}
          </div>
        </div>

        {/* Comparison summary */}
        <div className={[
          'mt-4 rounded-lg border p-4',
          calc.monthlyDiff > 0 ? 'bg-green-50 border-green-200' : calc.monthlyDiff < 0 ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200',
        ].join(' ')}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className={['text-sm font-semibold', calc.monthlyDiff > 0 ? 'text-green-800' : calc.monthlyDiff < 0 ? 'text-amber-800' : 'text-zinc-700'].join(' ')}>
                {calc.monthlyDiff > 0
                  ? `VA loan saves you ${formatCurrency(calc.monthlyDiff)}/month`
                  : calc.monthlyDiff < 0
                  ? `Conventional is ${formatCurrency(Math.abs(calc.monthlyDiff))}/month lower`
                  : 'Similar estimated monthly cost'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Over 5 years: {formatCurrency(Math.abs(calc.fiveYearDiff))} {calc.monthlyDiff >= 0 ? 'saved with VA' : 'lower with conventional'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Over loan term</p>
              <p className={['text-xl font-bold tabular-nums', calc.monthlyDiff > 0 ? 'text-green-700' : calc.monthlyDiff < 0 ? 'text-amber-700' : 'text-zinc-600'].join(' ')}>
                {formatCurrency(Math.abs(calc.termDiff))}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-md bg-zinc-50 border border-zinc-200 p-3">
          <p className="text-xs text-zinc-500">
            <strong>Comparison note:</strong> This comparison uses simplified estimates. Conventional loan terms, PMI rates, and closing costs vary by lender, credit score, and location. Get quotes from multiple lenders to compare actual offers.
          </p>
        </div>
      </div>

      {/* BAH comparison (only if expanded and populated) */}
      {hasBahComparison && bahResult && (
        <Card variant="bordered">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">BAH vs. Estimated Payment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Your BAH</p>
              <p className="text-3xl font-bold tabular-nums text-zinc-900">{formatCurrency(bahResult.monthlyRate)}</p>
              <p className="text-xs text-zinc-500 mt-1">/month · {bahResult.locationName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Est. Payment (PITI)</p>
              <p className="text-3xl font-bold tabular-nums text-zinc-900">{formatCurrency(calc.totalPITI)}</p>
              <p className="text-xs text-zinc-500 mt-1">/month</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                {bahResult.monthlyRate >= calc.totalPITI ? 'Surplus' : 'Deficit'}
              </p>
              <p className={['text-3xl font-bold tabular-nums', bahResult.monthlyRate >= calc.totalPITI ? 'text-green-700' : 'text-red-700'].join(' ')}>
                {bahResult.monthlyRate >= calc.totalPITI ? '+' : '-'}{formatCurrency(Math.abs(bahResult.monthlyRate - calc.totalPITI))}
              </p>
              <p className="text-xs text-zinc-500 mt-1">/month</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600">
            {bahResult.monthlyRate >= calc.totalPITI
              ? `Your BAH of ${formatCurrency(bahResult.monthlyRate)}/month exceeds this estimated payment by ${formatCurrency(bahResult.monthlyRate - calc.totalPITI)}/month — that surplus stays in your pocket.`
              : `This estimated payment exceeds your BAH of ${formatCurrency(bahResult.monthlyRate)}/month by ${formatCurrency(calc.totalPITI - bahResult.monthlyRate)}/month. The difference would come from other income.`}
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            BAH is excluded from federal taxable income but is counted as income for VA loan qualification purposes. Rates shown are 2026 rates.
          </p>
        </Card>
      )}

      {/* Action steps */}
      <ActSteps steps={actionSteps} title="Your Next Steps" />

    </div>
  );
}
