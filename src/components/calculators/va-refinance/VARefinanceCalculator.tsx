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

// ─── Main component ────────────────────────────────────────────────────────────
export function VARefinanceCalculator() {
  const [refType, setRefType] = useState<RefType>('irrrl');

  // Current loan
  const [currentBalance, setCurrentBalance] = useState(300000);
  const [currentRate, setCurrentRate] = useState(7.0);
  const [originalTerm, setOriginalTerm] = useState(30);

  // New loan
  const [newRate, setNewRate] = useState(6.0);
  const [newTerm, setNewTerm] = useState(30);

  // Costs & fees
  const [closingCosts, setClosingCosts] = useState(2500);
  const [exempt, setExempt] = useState(false);
  const [firstUse, setFirstUse] = useState(true); // cash-out only

  // ─── URL pre-population ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeRaw = params.get('type');
    const balanceRaw = params.get('balance');
    const currRateRaw = params.get('currRate');
    const origTermRaw = params.get('origTerm');
    const newRateRaw = params.get('newRate');
    const newTermRaw = params.get('newTerm');
    const closingRaw = params.get('closing');
    const exemptRaw = parseBool(params.get('exempt'));
    const firstUseRaw = parseBool(params.get('firstUse'));

    if (typeRaw === 'cashout') setRefType('cashout');
    if (balanceRaw) {
      const b = parseInt(balanceRaw, 10);
      if (!isNaN(b) && b > 0) setCurrentBalance(b);
    }
    if (currRateRaw) {
      const r = parseFloat(currRateRaw);
      if (!isNaN(r) && r > 0 && r < 30) setCurrentRate(r);
    }
    if (origTermRaw) {
      const t = parseInt(origTermRaw, 10);
      if ([15, 20, 25, 30].includes(t)) setOriginalTerm(t);
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
    if (exemptRaw !== null) setExempt(exemptRaw);
    if (firstUseRaw !== null) setFirstUse(firstUseRaw);
  }, []);

  // ─── Share URL ────────────────────────────────────────────────────────────────
  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('type', refType);
    p.set('balance', String(currentBalance));
    p.set('currRate', String(currentRate));
    p.set('origTerm', String(originalTerm));
    p.set('newRate', String(newRate));
    p.set('newTerm', String(newTerm));
    p.set('closing', String(closingCosts));
    p.set('exempt', exempt ? 'yes' : 'no');
    if (refType === 'cashout') p.set('firstUse', firstUse ? 'yes' : 'no');
    return `${window.location.origin}/calculators/va-refinance?${p.toString()}`;
  }

  // ─── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const currentPayment = calcMonthlyPI(currentBalance, currentRate, originalTerm);

    let fundingFeeRate = 0;
    if (!exempt) {
      fundingFeeRate = refType === 'irrrl' ? 0.005 : (firstUse ? 0.0215 : 0.033);
    }
    const fundingFeeAmount = Math.round(currentBalance * fundingFeeRate);
    const newLoanBalance = currentBalance + fundingFeeAmount;
    const newPayment = calcMonthlyPI(newLoanBalance, newRate, newTerm);
    const monthlySavings = currentPayment - newPayment;
    const totalCosts = fundingFeeAmount + closingCosts;

    const breakEvenMonths = monthlySavings > 0
      ? Math.ceil(totalCosts / monthlySavings)
      : Infinity;

    const rateReduction = currentRate - newRate;
    const netTangibleBenefitPass = rateReduction >= 0.5;
    const recoupmentPass = isFinite(breakEvenMonths) && breakEvenMonths <= 36;

    // Standard fee at current balance (for exemption savings display)
    const standardFeeAmount = Math.round(currentBalance * (refType === 'irrrl' ? 0.005 : (firstUse ? 0.0215 : 0.033)));

    return {
      currentPayment,
      fundingFeeRate,
      fundingFeeAmount,
      newLoanBalance,
      newPayment,
      monthlySavings,
      totalCosts,
      breakEvenMonths,
      rateReduction,
      netTangibleBenefitPass,
      recoupmentPass,
      standardFeeAmount,
    };
  }, [refType, currentBalance, currentRate, originalTerm, newRate, newTerm, closingCosts, exempt, firstUse]);

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

    if (refType === 'irrrl' && !calc.recoupmentPass && isFinite(calc.breakEvenMonths)) {
      steps.push({
        label: "Break-even exceeds the 36-month guideline",
        description: `Your break-even is ${calc.breakEvenMonths} months. The VA guideline is 36 months. This doesn't automatically disqualify the IRRRL, but lenders must document the benefit.`,
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
    const savingsFmt = formatCurrency(Math.round(Math.abs(calc.monthlySavings)));
    const beFmt = isFinite(calc.breakEvenMonths) ? `${calc.breakEvenMonths} months` : 'a very long time';
    if (refType === 'cashout') {
      if (calc.monthlySavings > 0) {
        return `Based on these numbers, you'd save ${savingsFmt}/month and recoup total costs in ${beFmt}. A cash-out refinance also replaces your existing loan — compare quotes from multiple VA-approved lenders before proceeding.`;
      }
      return `A cash-out refinance typically increases your monthly payment when you're borrowing more or extending to a longer term. Whether it makes sense depends on what you're doing with the equity and your long-term plan.`;
    }

    const { netTangibleBenefitPass, recoupmentPass } = calc;

    if (netTangibleBenefitPass && recoupmentPass) {
      return `Based on these numbers, refinancing looks like a strong move. You'd save ${savingsFmt}/month and recoup your costs in ${beFmt}.`;
    }
    if (netTangibleBenefitPass && !recoupmentPass) {
      return `The numbers are mixed — your rate drops ${calc.rateReduction.toFixed(2)}%, which meets the VA net tangible benefit requirement. But break-even is ${beFmt}, which exceeds the VA's 36-month recoupment guideline. Verify with your lender.`;
    }
    if (!netTangibleBenefitPass && recoupmentPass) {
      return `The numbers are mixed — your break-even is within 36 months. But your rate reduction of ${calc.rateReduction.toFixed(2)}% may not meet the VA's 0.5% minimum for a fixed-to-fixed IRRRL. Discuss this with a VA-approved lender.`;
    }
    return `Based on these numbers, this refinance may not make sense right now. The rate reduction is ${calc.rateReduction.toFixed(2)}% — below the VA's 0.5% threshold — and break-even would take ${beFmt}.`;
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
            <Select
              label="Original loan term"
              options={TERM_OPTIONS}
              value={String(originalTerm)}
              onChange={(e) => setOriginalTerm(parseInt(e.target.value, 10))}
            />
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
            <p className="text-xs text-zinc-500">Lender fees, title insurance, etc. (typical range: $2,000–$5,000)</p>
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
                <p className="text-xs text-zinc-500 mt-0.5">(Service-connected disability, Purple Heart, surviving spouse)</p>
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

      {/* ── Primary result cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Break-Even Point</p>
          <p className="text-3xl font-bold tabular-nums">
            {isFinite(calc.breakEvenMonths) ? `${calc.breakEvenMonths} mo` : '—'}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            {isFinite(calc.breakEvenMonths)
              ? `${Math.floor(calc.breakEvenMonths / 12)} yr ${calc.breakEvenMonths % 12} mo to recoup`
              : calc.monthlySavings <= 0 ? 'No monthly savings' : 'Cannot calculate'}
          </p>
          <p className="text-slate-400 text-xs mt-1">{formatCurrency(calc.totalCosts)} total costs</p>
        </div>


      </div>

      {/* ── The Bottom Line ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">The Bottom Line</p>
        <p className="text-base text-zinc-800 leading-relaxed">{bottomLine}</p>
        <p className="text-sm text-zinc-500 leading-relaxed mt-3 italic">
          These are estimates — your actual rate, fees, and savings will depend on your lender, credit profile, and current market conditions.
        </p>
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
            label="36-Month Recoupment"
            detail={
              !isFinite(calc.breakEvenMonths)
                ? 'Cannot calculate — no monthly savings to recoup against.'
                : calc.recoupmentPass
                ? `You'll recoup closing costs in ${calc.breakEvenMonths} months — within the VA's 36-month guideline.`
                : `Break-even is ${calc.breakEvenMonths} months — exceeds the VA's 36-month recoupment guideline.`
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
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm font-semibold text-zinc-900">Total Costs</span>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">{formatCurrency(calc.totalCosts)}</span>
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
