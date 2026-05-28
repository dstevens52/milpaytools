'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { parseBool } from '@/lib/urlParams';
import type { ActionStep } from '@/types/calculator';

// ─── Mortgage math ─────────────────────────────────────────────────────────────
function calcMonthlyPI(loanAmount: number, annualRatePct: number, termYears: number): number {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const TERM_OPTIONS = [
  { value: '30', label: '30-year fixed' },
  { value: '25', label: '25-year fixed' },
  { value: '20', label: '20-year fixed' },
  { value: '15', label: '15-year fixed' },
];

const INPUT_CLS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';

function fmtDollar(n: number): string {
  return n.toLocaleString('en-US');
}

function parseDollar(s: string): number {
  const stripped = s.replace(/[^0-9]/g, '');
  return parseInt(stripped, 10) || 0;
}

function btnCls(active: boolean) {
  return [
    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors text-center',
    active
      ? 'bg-red-700 border-red-700 text-white'
      : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
  ].join(' ');
}

type RefType = 'irrrl' | 'cashout';

// ─── VA requirement check indicator ───────────────────────────────────────────
function CheckIndicator({ pass, label, detail }: { pass: boolean; label: string; detail: string }) {
  return (
    <div className={[
      'rounded-lg border p-4 flex gap-3',
      pass ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50',
    ].join(' ')}>
      <span className={[
        'flex-none w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
        pass ? 'bg-green-500' : 'bg-amber-400',
      ].join(' ')}>
        {pass ? (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 4v3M6 9v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div>
        <p className={['text-sm font-semibold', pass ? 'text-green-800' : 'text-amber-800'].join(' ')}>
          {label}
        </p>
        <p className={['text-sm mt-0.5 leading-relaxed', pass ? 'text-green-700' : 'text-amber-700'].join(' ')}>
          {detail}
        </p>
      </div>
    </div>
  );
}

// ─── Neutral check indicator (not calculated) ──────────────────────────────────
function NeutralIndicator({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex gap-3">
      <span className="flex-none w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-zinc-300">
        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 4v3M6 9v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-600">{label}</p>
        <p className="text-sm mt-0.5 leading-relaxed text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function VARefinanceCalculator() {
  const [refType, setRefType] = useState<RefType>('irrrl');

  // Current loan
  const [currentBalance, setCurrentBalance] = useState(300000);
  const [currentRate, setCurrentRate] = useState(7.0);
  const [yearsRemaining, setYearsRemaining] = useState(25);

  // New loan
  const [newRate, setNewRate] = useState(6.0);
  const [newTerm, setNewTerm] = useState(30);

  // Costs & fees
  const [closingCosts, setClosingCosts] = useState(2500);
  const [lenderCredits, setLenderCredits] = useState(0);
  const [exempt, setExempt] = useState(false);
  const [firstUse, setFirstUse] = useState(true);

  // Seasoning (IRRRL only, optional)
  const [firstPaymentDate, setFirstPaymentDate] = useState('');

  // ─── URL pre-population ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeRaw = params.get('type');
    const balanceRaw = params.get('balance');
    const currRateRaw = params.get('currRate');
    const yearsRemRaw = params.get('yearsRem');
    const newRateRaw = params.get('newRate');
    const newTermRaw = params.get('newTerm');
    const closingRaw = params.get('closing');
    const creditsRaw = params.get('credits');
    const exemptRaw = parseBool(params.get('exempt'));
    const firstUseRaw = parseBool(params.get('firstUse'));
    const firstPmtRaw = params.get('firstPmt');

    if (typeRaw === 'cashout') setRefType('cashout');
    if (balanceRaw) {
      const b = parseInt(balanceRaw, 10);
      if (!isNaN(b) && b > 0) setCurrentBalance(b);
    }
    if (currRateRaw) {
      const r = parseFloat(currRateRaw);
      if (!isNaN(r) && r > 0 && r < 30) setCurrentRate(r);
    }
    if (yearsRemRaw) {
      const t = parseInt(yearsRemRaw, 10);
      if (!isNaN(t) && t > 0 && t <= 50) setYearsRemaining(t);
    }
    if (newRateRaw) {
      const r = parseFloat(newRateRaw);
      if (!isNaN(r) && r > 0 && r < 30) setNewRate(r);
    }
    if (newTermRaw) {
      const t = parseInt(newTermRaw, 10);
      if ([15, 20, 25, 30].includes(t)) setNewTerm(t);
    }
    if (closingRaw) {
      const c = parseInt(closingRaw, 10);
      if (!isNaN(c) && c >= 0) setClosingCosts(c);
    }
    if (creditsRaw) {
      const c = parseInt(creditsRaw, 10);
      if (!isNaN(c) && c >= 0) setLenderCredits(c);
    }
    if (exemptRaw !== null) setExempt(exemptRaw);
    if (firstUseRaw !== null) setFirstUse(firstUseRaw);
    if (firstPmtRaw) setFirstPaymentDate(firstPmtRaw);
  }, []);

  // ─── Share URL ────────────────────────────────────────────────────────────────
  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('type', refType);
    p.set('balance', String(currentBalance));
    p.set('currRate', String(currentRate));
    p.set('yearsRem', String(yearsRemaining));
    p.set('newRate', String(newRate));
    p.set('newTerm', String(newTerm));
    p.set('closing', String(closingCosts));
    if (lenderCredits > 0) p.set('credits', String(lenderCredits));
    p.set('exempt', exempt ? 'yes' : 'no');
    if (refType === 'cashout') p.set('firstUse', firstUse ? 'yes' : 'no');
    if (firstPaymentDate) p.set('firstPmt', firstPaymentDate);
    return `${window.location.origin}/calculators/va-refinance?${p.toString()}`;
  }

  // ─── Seasoning calculation ─────────────────────────────────────────────────
  const seasoningCheck = useMemo(() => {
    if (!firstPaymentDate || refType !== 'irrrl') return null;
    const firstPmt = new Date(firstPaymentDate);
    if (isNaN(firstPmt.getTime())) return null;
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - firstPmt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 0) return null;
    const days210Pass = daysSince >= 210;
    const paymentsLikelyMade = Math.floor(daysSince / 30);
    const sixPaymentsPass = paymentsLikelyMade >= 6;
    const seasoningPass = days210Pass && sixPaymentsPass;
    return { daysSince, days210Pass, sixPaymentsPass, paymentsLikelyMade, seasoningPass };
  }, [firstPaymentDate, refType]);

  // ─── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const currentPayment = calcMonthlyPI(currentBalance, currentRate, yearsRemaining);

    let fundingFeeRate = 0;
    if (!exempt) {
      fundingFeeRate = refType === 'irrrl' ? 0.005 : (firstUse ? 0.0215 : 0.033);
    }
    const fundingFeeAmount = Math.round(currentBalance * fundingFeeRate);
    const newLoanBalance = currentBalance + fundingFeeAmount;
    const newPayment = calcMonthlyPI(newLoanBalance, newRate, newTerm);
    const monthlySavings = currentPayment - newPayment;

    // Net closing costs after lender credits (floor at 0)
    const netClosingCosts = Math.max(0, closingCosts - lenderCredits);
    // Consumer break-even: all costs including funding fee
    const totalConsumerCosts = fundingFeeAmount + netClosingCosts;
    const consumerBreakEvenMonths = monthlySavings > 0
      ? Math.ceil(totalConsumerCosts / monthlySavings)
      : Infinity;
    // VA statutory recoupment: closing costs only, excluding funding fee
    const vaRecoupmentMonths = monthlySavings > 0
      ? (netClosingCosts > 0 ? Math.ceil(netClosingCosts / monthlySavings) : 0)
      : Infinity;

    const rateReduction = currentRate - newRate;
    const netTangibleBenefitPass = rateReduction >= 0.5;
    // VA recoupment check uses closing costs only (VA statutory definition)
    const recoupmentPass = isFinite(vaRecoupmentMonths) && vaRecoupmentMonths <= 36;

    const standardFeeAmount = Math.round(currentBalance * (refType === 'irrrl' ? 0.005 : (firstUse ? 0.0215 : 0.033)));

    return {
      currentPayment,
      fundingFeeRate,
      fundingFeeAmount,
      newLoanBalance,
      newPayment,
      monthlySavings,
      netClosingCosts,
      totalConsumerCosts,
      consumerBreakEvenMonths,
      vaRecoupmentMonths,
      rateReduction,
      netTangibleBenefitPass,
      recoupmentPass,
      standardFeeAmount,
    };
  }, [refType, currentBalance, currentRate, yearsRemaining, newRate, newTerm, closingCosts, lenderCredits, exempt, firstUse]);

  // ─── Analytics ────────────────────────────────────────────────────────────────
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const _gaMountedRef = useRef(false);
  useEffect(() => {
    if (!_gaMountedRef.current) { _gaMountedRef.current = true; return; }
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('va-refinance'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [calc]);

  // ─── Action steps ─────────────────────────────────────────────────────────────
  const actionSteps = useMemo((): ActionStep[] => {
    const steps: ActionStep[] = [];

    if (!exempt) {
      steps.push({
        label: 'Check your VA disability rating',
        description: `A service-connected rating of 10%+ waives the VA funding fee on refinances too — saving you ${formatCurrency(calc.standardFeeAmount)} on this loan.`,
        priority: 'high',
        href: '/calculators/va-disability',
      });
    } else {
      steps.push({
        label: 'Your exemption applies to refinances',
        description: `Your disability rating waives the ${refType === 'irrrl' ? '0.5%' : (firstUse ? '2.15%' : '3.30%')} funding fee — saving you ${formatCurrency(calc.standardFeeAmount)} on this refinance.`,
        priority: 'medium',
      });
    }

    if (refType === 'irrrl' && !calc.netTangibleBenefitPass) {
      steps.push({
        label: 'Rate reduction may not meet VA requirement',
        description: `A fixed-to-fixed IRRRL requires at least a 0.5% rate reduction. Your rate drops ${calc.rateReduction.toFixed(3)}%. Discuss documentation of net tangible benefit with your lender.`,
        priority: 'high',
      });
    }

    if (refType === 'irrrl' && !calc.recoupmentPass && isFinite(calc.vaRecoupmentMonths)) {
      steps.push({
        label: 'VA recoupment estimate exceeds 36-month guideline',
        description: `VA recoupment is ${calc.vaRecoupmentMonths} months (closing costs ÷ savings, excluding funding fee). The VA guideline is 36 months. This doesn't automatically disqualify the IRRRL, but lenders must document the benefit.`,
        priority: 'medium',
      });
    }

    if (calc.monthlySavings <= 0 && steps.length < 3) {
      steps.push({
        label: 'Review your inputs',
        description: 'The new loan terms result in a higher or equal monthly payment. Consider adjusting the rate or term.',
        priority: 'high',
      });
    }

    return steps.slice(0, 3);
  }, [exempt, calc, refType, firstUse]);

  // ─── Bottom line ─────────────────────────────────────────────────────────────
  const bottomLine = useMemo((): string => {
    if (refType === 'cashout') {
      if (calc.monthlySavings > 0) {
        const beFmt = isFinite(calc.consumerBreakEvenMonths) ? `${calc.consumerBreakEvenMonths} months` : 'a very long time';
        return `Based on these inputs, the refinance appears financially favorable if you keep the loan past the ${beFmt} break-even. A cash-out refinance also replaces your existing loan — compare quotes from multiple VA-approved lenders before proceeding.`;
      }
      return `A cash-out refinance typically increases your monthly payment when you're borrowing more or extending to a longer term. Whether it makes sense depends on what you're doing with the equity and your long-term plan.`;
    }

    const { netTangibleBenefitPass, recoupmentPass, monthlySavings, rateReduction, vaRecoupmentMonths } = calc;

    if (monthlySavings <= 0) {
      return `Based on these inputs, this refinance may not recover its costs within a reasonable timeframe. The new loan terms result in no monthly savings. Consider whether rates need to drop further or closing costs can be reduced.`;
    }
    if (netTangibleBenefitPass && recoupmentPass) {
      return `Based on these inputs, the refinance appears financially favorable if you keep the loan past the break-even point. These are estimates — your actual rate, fees, and savings depend on your lender, credit profile, and current market conditions.`;
    }
    if (netTangibleBenefitPass && !recoupmentPass) {
      const vaFmt = isFinite(vaRecoupmentMonths) ? `${vaRecoupmentMonths} months` : 'very long';
      return `The numbers are mixed — your rate drops ${rateReduction.toFixed(2)}%, which meets the VA net tangible benefit requirement. But VA recoupment is ${vaFmt} — above the 36-month guideline. Compare actual lender quotes to see if the refinance works for your situation.`;
    }
    if (!netTangibleBenefitPass && recoupmentPass) {
      return `The numbers are mixed — VA recoupment is within 36 months. But your rate reduction of ${rateReduction.toFixed(2)}% may not meet the VA's 0.5% minimum for a fixed-to-fixed IRRRL. Compare actual lender quotes to see if the refinance works for your situation.`;
    }
    return `Based on these inputs, this refinance may not recover its costs within a reasonable timeframe. Consider whether rates need to drop further or closing costs can be reduced.`;
  }, [calc, refType]);

  const feeLabel = refType === 'irrrl' ? '0.5%' : (firstUse ? '2.15%' : '3.30%');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Refinance type ─────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Refinance Type</h2>
        <div className="flex gap-3">
          <button type="button" onClick={() => setRefType('irrrl')} className={btnCls(refType === 'irrrl')}>
            VA Streamline (IRRRL)
          </button>
          <button type="button" onClick={() => setRefType('cashout')} className={btnCls(refType === 'cashout')}>
            VA Cash-Out Refinance
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          {refType === 'irrrl'
            ? 'IRRRL: Only for existing VA loans. No appraisal or income verification in most cases. Funding fee is 0.5%. Must result in lower rate or switch from ARM to fixed.'
            : 'Cash-Out: Replaces any mortgage with a new VA loan. Can access equity. Requires full underwriting — appraisal, income, credit. Funding fee is higher (2.15% first use / 3.30% subsequent use).'}
        </p>
      </Card>

      {/* ── Current loan ───────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Your Current Loan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Current loan balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(currentBalance)}
                onChange={(e) => setCurrentBalance(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6'}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Current interest rate</label>
            <div className="relative">
              <input
                type="number"
                min={0.125}
                max={25}
                step={0.125}
                value={currentRate}
                onChange={(e) => setCurrentRate(Math.max(0.125, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Years remaining on current loan</label>
            <input
              type="number"
              min={1}
              max={50}
              step={1}
              value={yearsRemaining}
              onChange={(e) => {
                const v = Math.round(Number(e.target.value));
                if (!isNaN(v) && v > 0 && v <= 50) setYearsRemaining(v);
              }}
              className={INPUT_CLS}
            />
            <p className="text-xs text-zinc-500">Approximate years left on your current mortgage</p>
          </div>

        </div>
      </Card>

      {/* ── New loan ────────────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">New Loan Terms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">New interest rate</label>
            <div className="relative">
              <input
                type="number"
                min={0.125}
                max={25}
                step={0.125}
                value={newRate}
                onChange={(e) => setNewRate(Math.max(0.125, Number(e.target.value)))}
                className={INPUT_CLS + ' pr-6'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            <p className="text-xs text-zinc-500">Enter the rate you&apos;ve been quoted. This calculator does not provide rate quotes.</p>
          </div>

          <div className="flex flex-col gap-1">
            <Select
              label="New loan term"
              options={TERM_OPTIONS}
              value={String(newTerm)}
              onChange={(e) => setNewTerm(parseInt(e.target.value, 10))}
            />
          </div>

        </div>
      </Card>

      {/* ── Costs & fees ───────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Costs &amp; Fees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Estimated closing costs</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(closingCosts)}
                onChange={(e) => setClosingCosts(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6'}
              />
            </div>
            <p className="text-xs text-zinc-500">Lender fees, title insurance, etc. (typical range: $2,000–$5,000). If your quoted rate includes discount points, include the point cost here — a lower rate bought with high points may look good monthly but take longer to recoup.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Lender credits</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtDollar(lenderCredits)}
                onChange={(e) => setLenderCredits(parseDollar(e.target.value))}
                className={INPUT_CLS + ' pl-6'}
              />
            </div>
            <p className="text-xs text-zinc-500">Credits the lender offers toward your closing costs. Found on lender quotes / Loan Estimates.</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">VA Funding Fee exemption</span>
            <label className="flex items-start gap-3 mt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exempt}
                onChange={(e) => setExempt(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-red-700 focus:ring-red-500 cursor-pointer"
              />
              <div>
                <span className="text-sm text-zinc-700 font-medium">I&apos;m exempt from the VA Funding Fee</span>
                <p className="text-xs text-zinc-500 mt-0.5">You may be exempt if you receive or are eligible to receive VA disability compensation, have certain pre-discharge ratings, are an active-duty Purple Heart recipient, or are an eligible surviving spouse. Confirm exemption status on your COE.</p>
              </div>
            </label>
            {exempt && (
              <div className="mt-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                <p className="text-xs text-green-800 font-medium">
                  Exemption applies — {formatCurrency(calc.standardFeeAmount)} funding fee waived.
                </p>
              </div>
            )}
          </div>

          {refType === 'cashout' && !exempt && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">VA loan use</span>
              <div className="flex gap-3 mt-1 max-w-xs">
                <button type="button" onClick={() => setFirstUse(true)} className={btnCls(firstUse)}>First use</button>
                <button type="button" onClick={() => setFirstUse(false)} className={btnCls(!firstUse)}>Subsequent use</button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Cash-out funding fee: 2.15% first use · 3.30% subsequent use</p>
            </div>
          )}

        </div>
      </Card>

      {/* ── IRRRL Loan Seasoning (optional) ─────────────────────────────────── */}
      {refType === 'irrrl' && (
        <Card variant="default">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Loan Seasoning{' '}
            <span className="text-zinc-400 font-normal text-sm">(optional)</span>
          </h2>
          <p className="text-xs text-zinc-500 mb-5">VA generally requires 210+ days from the first payment due date and six consecutive monthly payments before an IRRRL can close.</p>
          <div className="max-w-xs">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">First payment due date on your current VA loan</label>
              <input
                type="date"
                value={firstPaymentDate}
                onChange={(e) => setFirstPaymentDate(e.target.value)}
                className={INPUT_CLS}
              />
              <p className="text-xs text-zinc-500">Found on your first mortgage statement or closing documents.</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Primary result cards ────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 gap-4 ${refType === 'irrrl' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>

        <div className="bg-red-700 rounded-lg p-5 text-white">
          <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-2">Monthly Savings</p>
          <p className="text-3xl font-bold tabular-nums">
            {calc.monthlySavings >= 0
              ? `+${formatCurrency(Math.round(calc.monthlySavings))}`
              : `−${formatCurrency(Math.abs(Math.round(calc.monthlySavings)))}`}
          </p>
          <p className="text-red-200 text-xs mt-2">
            {formatCurrency(Math.round(calc.currentPayment))} → {formatCurrency(Math.round(calc.newPayment))}
          </p>
          <p className="text-red-100 text-xs mt-1">per month (P&amp;I)</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 text-white">
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Your Break-Even</p>
          <p className="text-3xl font-bold tabular-nums">
            {isFinite(calc.consumerBreakEvenMonths) ? `${calc.consumerBreakEvenMonths} mo` : '—'}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            {isFinite(calc.consumerBreakEvenMonths)
              ? `${Math.floor(calc.consumerBreakEvenMonths / 12)} yr ${calc.consumerBreakEvenMonths % 12} mo to recoup all costs`
              : calc.monthlySavings <= 0 ? 'No monthly savings' : 'Cannot calculate'}
          </p>
          <p className="text-slate-400 text-xs mt-1">{formatCurrency(calc.totalConsumerCosts)} total costs (fee + closing)</p>
        </div>

        {refType === 'irrrl' && (
          <div className="bg-zinc-700 rounded-lg p-5 text-white">
            <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">VA Recoupment Estimate</p>
            <p className="text-3xl font-bold tabular-nums">
              {isFinite(calc.vaRecoupmentMonths) ? `${calc.vaRecoupmentMonths} mo` : '—'}
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              {isFinite(calc.vaRecoupmentMonths)
                ? 'Closing costs ÷ savings (excl. funding fee)'
                : calc.monthlySavings <= 0 ? 'No monthly savings' : 'Cannot calculate'}
            </p>
            <p className={`text-xs mt-1 font-medium ${isFinite(calc.vaRecoupmentMonths) ? (calc.vaRecoupmentMonths <= 36 ? 'text-green-400' : 'text-amber-400') : 'text-zinc-400'}`}>
              {isFinite(calc.vaRecoupmentMonths)
                ? (calc.vaRecoupmentMonths <= 36 ? '✓ Within VA 36-month guideline' : '✗ Exceeds VA 36-month guideline')
                : ''}
            </p>
          </div>
        )}

      </div>

      {/* ── Break-even explanation (IRRRL only) ────────────────────────────── */}
      {refType === 'irrrl' && (
        <p className="text-xs text-zinc-500 leading-relaxed -mt-4">
          <strong className="text-zinc-600">Your break-even</strong> includes all costs (closing costs + funding fee). The <strong className="text-zinc-600">VA recoupment estimate</strong> excludes the funding fee, as VA&apos;s 36-month IRRRL guideline uses a narrower cost definition.
        </p>
      )}

      {/* ── The Bottom Line ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">The Bottom Line</p>
        <p className="text-base text-zinc-800 leading-relaxed">{bottomLine}</p>
        {refType === 'irrrl' && !(calc.netTangibleBenefitPass && calc.recoupmentPass && calc.monthlySavings > 0) && (
          <p className="text-sm text-zinc-500 leading-relaxed mt-3 italic">
            These are estimates — your actual rate, fees, and savings depend on your lender, credit profile, and current market conditions.
          </p>
        )}
      </div>

      {/* ── VA Requirement Checks (IRRRL only) ──────────────────────────────── */}
      {refType === 'irrrl' && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-zinc-900">VA Requirement Checks</h3>
          <CheckIndicator
            pass={calc.netTangibleBenefitPass}
            label="Net Tangible Benefit"
            detail={
              calc.netTangibleBenefitPass
                ? `Your rate drops ${calc.rateReduction.toFixed(2)}% — meets the VA's 0.5% minimum reduction requirement for a fixed-to-fixed IRRRL.`
                : `Your rate drops only ${calc.rateReduction.toFixed(2)}% — may not meet the VA's 0.5% minimum reduction for a fixed-to-fixed IRRRL.`
            }
          />
          <CheckIndicator
            pass={calc.recoupmentPass}
            label="36-Month VA Recoupment"
            detail={
              !isFinite(calc.vaRecoupmentMonths)
                ? 'Cannot calculate — no monthly savings.'
                : calc.vaRecoupmentMonths === 0
                ? 'Lender credits cover all closing costs — VA recoupment is immediate.'
                : calc.recoupmentPass
                ? `VA recoupment estimate is ${calc.vaRecoupmentMonths} months — within the VA's 36-month guideline. Closing costs ÷ monthly savings, excluding the funding fee.`
                : `VA recoupment estimate is ${calc.vaRecoupmentMonths} months — above the VA's 36-month guideline. Closing costs ÷ monthly savings, excluding the funding fee.`
            }
          />
          <CheckIndicator
            pass={calc.monthlySavings > 0}
            label="Monthly Payment"
            detail={
              calc.monthlySavings > 0
                ? `Your payment drops by ${formatCurrency(Math.round(calc.monthlySavings))}/month — that's ${formatCurrency(Math.round(calc.monthlySavings * 12))}/year.`
                : calc.monthlySavings === 0
                ? 'Your payment would not change with this refinance.'
                : `Your payment would increase by ${formatCurrency(Math.abs(Math.round(calc.monthlySavings)))}/month.`
            }
          />
          {seasoningCheck !== null ? (
            <CheckIndicator
              pass={seasoningCheck.seasoningPass}
              label="Loan Seasoning"
              detail={
                seasoningCheck.seasoningPass
                  ? `Your loan appears seasoned — ${seasoningCheck.daysSince} days since first payment due date (210+ required) and approximately ${seasoningCheck.paymentsLikelyMade} payments made (6 required).`
                  : [
                      seasoningCheck.days210Pass
                        ? `${seasoningCheck.daysSince} days have passed (210+ ✓).`
                        : `Only ${seasoningCheck.daysSince} days have passed — 210 required.`,
                      seasoningCheck.sixPaymentsPass
                        ? `Approximately ${seasoningCheck.paymentsLikelyMade} payments likely made (6 ✓).`
                        : `Only approximately ${seasoningCheck.paymentsLikelyMade} payment(s) likely made — 6 required.`,
                      'VA generally requires 210+ days from the first payment due date and six consecutive payments before an IRRRL can close.',
                    ].join(' ')
              }
            />
          ) : (
            <NeutralIndicator
              label="Loan Seasoning"
              detail="Not calculated — enter your first payment due date above to check VA's 210-day / 6-payment seasoning requirement."
            />
          )}
        </div>
      )}

      {/* ── Cost breakdown ──────────────────────────────────────────────────── */}
      <Card variant="bordered">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Cost Breakdown</h3>
        <div className="divide-y divide-zinc-100">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">VA Funding Fee ({feeLabel})</span>
            <span className="text-sm font-medium tabular-nums">
              {exempt
                ? <span className="text-green-700 font-semibold">$0 — Waived (disability exemption)</span>
                : formatCurrency(calc.fundingFeeAmount)
              }
            </span>
          </div>
          {exempt && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-500">Amount saved (exemption)</span>
              <span className="text-sm font-medium text-green-700 tabular-nums">
                {formatCurrency(calc.standardFeeAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">Closing Costs</span>
            <span className="text-sm font-medium text-zinc-800 tabular-nums">{formatCurrency(closingCosts)}</span>
          </div>
          {lenderCredits > 0 && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-600">Lender Credits</span>
              <span className="text-sm font-medium text-green-700 tabular-nums">
                −{formatCurrency(Math.min(lenderCredits, closingCosts))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm font-semibold text-zinc-900">Total Consumer Costs</span>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">{formatCurrency(calc.totalConsumerCosts)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">New Loan Amount (balance + fee)</span>
            <span className="text-sm font-medium text-zinc-800 tabular-nums">{formatCurrency(calc.newLoanBalance)}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          VA funding fee assumed rolled into new loan balance. Closing costs are separate and typically due at closing.
        </p>
      </Card>

      {/* ── Share ──────────────────────────────────────────────────────────── */}
      <SaveOrShareResults
        pageName="va-refinance"
        headline="Save or share your refinance estimate"
        supportingText="Useful for comparing lender quotes or reviewing the numbers with a spouse or financial advisor."
        usefulFor={['Lender comparison', 'Rate shopping', 'Spouse or advisor']}
        getUrl={getShareUrl}
        shareTitle="VA refinance estimate"
        shareText="Here's my VA refinance estimate from MilPayTools."
      />

      {/* ── Action steps ───────────────────────────────────────────────────── */}
      <ActSteps steps={actionSteps} title="Your Next Steps" />

    </div>
  );
}
