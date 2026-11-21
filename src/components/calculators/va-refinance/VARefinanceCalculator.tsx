'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import { useUserInputGate } from '@/components/calculators/shared/useUserInputGate';
import { usePreHydrationSync } from '@/components/calculators/shared/usePreHydrationSync';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { parseBool } from '@/lib/urlParams';
import { readUrlParams } from '@/data/calculatorUrlParams';
import {
  FEE_STATUSES,
  VA_CASH_OUT_FUNDING_FEE,
  VA_IRRRL_FUNDING_FEE,
  feeRateLabel,
  isFeeExempt,
  parseFeeStatus,
  type FeeStatus,
} from '@/lib/calculations/vaLoanFees';
import {
  IRRRL_MIN_RATE_DROP_BPS,
  VA_RECOUPMENT_LIMIT_MONTHS,
  VA_REFINANCE_DEFAULTS as D,
  bottomLineSentences,
  bpsLabel,
  calcSeasoning,
  calcVaRefinance,
  formatLongDate,
  localToday,
  type RefinanceType,
  type SeasoningResult,
  type VaRefinanceResult,
} from '@/lib/calculations/vaRefinance';
import type { ActionStep } from '@/types/calculator';

// Math lives in src/lib/calculations/vaRefinance.ts (build 10b); this file is UI only.

// ─── Constants ─────────────────────────────────────────────────────────────────
const TERM_OPTIONS = [
  { value: '30', label: '30-year fixed' },
  { value: '25', label: '25-year fixed' },
  { value: '20', label: '20-year fixed' },
  { value: '15', label: '15-year fixed' },
];

const INPUT_CLS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';

const usd = (n: number) => formatCurrency(n);

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

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ─── VA requirement check indicator ───────────────────────────────────────────
function CheckIndicator({ pass, label, detail, testId }: { pass: boolean; label: string; detail: string; testId?: string }) {
  return (
    <div
      data-testid={testId}
      className={[
        'rounded-lg border p-4 flex gap-3',
        pass ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50',
      ].join(' ')}
    >
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

// ─── Copy built from the numbers ───────────────────────────────────────────────
const SEASONING_RULE =
  "VA's rule: the later of 210 days after the first payment due date and the sixth consecutive monthly payment on the current loan. With on-time payments, the sixth comes before day 210, so the 210-day date is the later one.";

function seasoningStatus(s: SeasoningResult): string {
  if (s.status === 'past') return 'That date has passed.';
  if (s.status === 'today') return 'That date is today.';
  return 'That date is still ahead.';
}

function rateDropText(bps: number): string {
  if (bps > 0) return `Your rate drops ${bpsLabel(bps)}.`;
  if (bps < 0) return `Your rate rises ${bpsLabel(bps)}.`;
  return 'Your rate stays the same.';
}

function buildActionSteps(feeStatus: FeeStatus, r: VaRefinanceResult): ActionStep[] {
  const steps: ActionStep[] = [];

  if (!isFeeExempt(feeStatus)) {
    steps.push({
      label: 'Check your VA disability rating',
      description: `VA's funding fee exemption depends on receiving VA disability compensation (or being eligible for it while receiving retirement or active-duty pay instead), not on a rating number. On this refinance the fee is ${usd(r.fundingFeeAmount)}. See how your ratings combine and the compensation that goes with the result.`,
      priority: 'high',
      href: '/calculators/va-disability',
    });
  } else {
    steps.push({
      label: 'Your lender confirms the exemption',
      description: `VA's rule: no funding fee for the status you picked. On this refinance that's ${usd(r.standardFeeAmount)} you don't pay. The lender confirms the exemption from your Certificate of Eligibility.`,
      priority: 'medium',
    });
  }

  if (r.type === 'irrrl' && !r.ratePass) {
    steps.push({
      label: `Rate drop is under VA's ${IRRRL_MIN_RATE_DROP_BPS}-basis-point test`,
      description: `VA's rule for a fixed-to-fixed IRRRL: the new rate is at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower (38 U.S.C. § 3709(b)). ${rateDropText(r.rateDropBps)}`,
      priority: 'high',
    });
  }

  if (r.type === 'irrrl' && r.monthsToRecover !== null && !r.recoupmentPass) {
    steps.push({
      label: `Closing costs take more than ${VA_RECOUPMENT_LIMIT_MONTHS} months to recover`,
      description: `${plural(r.monthsToRecover, 'month')} to recover ${usd(r.netClosingCosts)} in net closing costs. VA's rule: the lender certifies the costs are recovered within ${VA_RECOUPMENT_LIMIT_MONTHS} months through the lower payment, with the funding fee left out (38 U.S.C. § 3709(a)).`,
      priority: 'medium',
    });
  }

  if (!r.isCashOut && r.monthlySavings <= 0 && steps.length < 3) {
    steps.push({
      label: 'Review your inputs',
      description: "At these inputs the new loan's monthly payment is the same as or higher than your current payment.",
      priority: 'high',
    });
  }

  return steps.slice(0, 3);
}

// ─── Main component ────────────────────────────────────────────────────────────
export function VARefinanceCalculator() {
  const [refType, setRefType] = useState<RefinanceType>(D.type);

  // Current loan
  const [currentBalance, setCurrentBalance] = useState<number>(D.balance);
  const [currentRate, setCurrentRate] = useState<number>(D.currentRate);
  const [yearsRemaining, setYearsRemaining] = useState<number>(D.yearsRemaining);

  // New loan
  const [newRate, setNewRate] = useState<number>(D.newRate);
  const [newTerm, setNewTerm] = useState<number>(D.newTermYears);
  const [cashOut, setCashOut] = useState<number>(D.cashOut);

  // Costs & fees
  const [closingCosts, setClosingCosts] = useState<number>(D.closingCosts);
  const [lenderCredits, setLenderCredits] = useState<number>(D.lenderCredits);
  const [feeStatus, setFeeStatus] = useState<FeeStatus>(D.feeStatus);
  const [firstUse, setFirstUse] = useState<boolean>(D.firstUse);

  // Seasoning (optional)
  const [firstPaymentDate, setFirstPaymentDate] = useState('');

  // ─── URL pre-population ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = readUrlParams('va-refinance', window.location.search);
    const typeRaw = params.get('type');
    const balanceRaw = params.get('balance');
    const currRateRaw = params.get('currRate');
    const yearsRemRaw = params.get('yearsRem');
    const newRateRaw = params.get('newRate');
    const newTermRaw = params.get('newTerm');
    const closingRaw = params.get('closing');
    const creditsRaw = params.get('credits');
    const cashRaw = params.get('cash');
    const feeRaw = params.get('fee');
    const exemptRaw = params.get('exempt');
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
    if (cashRaw) {
      const c = parseInt(cashRaw, 10);
      if (!isNaN(c) && c >= 0) setCashOut(c);
    }
    // fee=<status> wins; the older exempt=yes|no is read only when fee is absent.
    if (feeRaw !== null || exemptRaw !== null) setFeeStatus(parseFeeStatus(feeRaw, exemptRaw));
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
    p.set('fee', feeStatus);
    if (refType === 'cashout') {
      p.set('cash', String(cashOut));
      p.set('firstUse', firstUse ? 'yes' : 'no');
    }
    if (firstPaymentDate) p.set('firstPmt', firstPaymentDate);
    return `${window.location.origin}/calculators/va-refinance?${p.toString()}`;
  }

  // ─── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(
    () =>
      calcVaRefinance({
        type: refType,
        balance: currentBalance,
        currentRate,
        yearsRemaining,
        newRate,
        newTermYears: newTerm,
        closingCosts,
        lenderCredits,
        feeStatus,
        firstUse,
        cashOut,
        financeFee: true,
      }),
    [refType, currentBalance, currentRate, yearsRemaining, newRate, newTerm, closingCosts, lenderCredits, feeStatus, firstUse, cashOut],
  );

  // Calendar dates on the viewer's clock; empty until a date is entered (so SSR = client).
  const seasoning = useMemo(
    () => (firstPaymentDate ? calcSeasoning(firstPaymentDate, localToday()) : null),
    [firstPaymentDate],
  );

  const exempt = isFeeExempt(feeStatus);

  // ─── Analytics ────────────────────────────────────────────────────────────────
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { attach: gaAttach, hasInteracted: gaInteracted, root: gaRoot } = useUserInputGate();
  useEffect(() => {
    if (!gaInteracted()) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('va-refinance'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [calc, gaInteracted]);

  const actionSteps = useMemo(() => buildActionSteps(feeStatus, calc), [feeStatus, calc]);
  const bottomLine = useMemo(() => bottomLineSentences(calc).join(' '), [calc]);

  const typeLabel = refType === 'irrrl' ? 'IRRRL' : 'cash-out refinance';
  const showMonths = !calc.isCashOut;

  // After the URL effect: input made before hydration wins over URL params (build 1c).
  const hydrated = usePreHydrationSync(gaRoot, { calculator: 'va-refinance', shareUrl: getShareUrl });
  const inert = hydrated ? undefined : true;

  const paymentChange = Math.round(calc.newPayment) - Math.round(calc.currentPayment);
  const savingsRounded = Math.round(calc.monthlySavings);

  return (
    <div ref={gaAttach} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Refinance type ─────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 id="rf-type-label" className="text-lg font-semibold text-zinc-900 mb-4">Refinance Type</h2>
        <div className="flex gap-3" role="group" aria-labelledby="rf-type-label">
          <button type="button" aria-disabled={inert} onClick={() => setRefType('irrrl')} className={btnCls(refType === 'irrrl')}>
            VA Streamline (IRRRL)
          </button>
          <button type="button" aria-disabled={inert} onClick={() => setRefType('cashout')} className={btnCls(refType === 'cashout')}>
            VA Cash-Out Refinance
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          {refType === 'irrrl'
            ? `IRRRL: Only for existing VA loans. No appraisal or income verification in most cases. Funding fee is ${feeRateLabel(VA_IRRRL_FUNDING_FEE)}. Must result in a lower rate (fixed to fixed: at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower) or a switch from an adjustable to a fixed rate.`
            : `Cash-Out: Replaces any mortgage with a new VA loan. Can access equity. Requires full underwriting — appraisal, income, credit. Funding fee is higher (${feeRateLabel(VA_CASH_OUT_FUNDING_FEE.first)} first use / ${feeRateLabel(VA_CASH_OUT_FUNDING_FEE.subsequent)} after first use).`}
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

          {refType === 'cashout' && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="vr-cash-out" className="text-sm font-medium text-zinc-700">Cash out</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  id="vr-cash-out"
                  type="text"
                  inputMode="numeric"
                  value={fmtDollar(cashOut)}
                  onChange={(e) => setCashOut(parseDollar(e.target.value))}
                  className={INPUT_CLS + ' pl-6'}
                />
              </div>
              <p className="text-xs text-zinc-500">
                VA limits the new loan, including a financed funding fee, to 100% of the home&apos;s VA-appraised value.
              </p>
            </div>
          )}

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
            <p className="text-xs text-zinc-500">Lender fees, title insurance, etc. If your quoted rate includes discount points, include the point cost here — a lower rate bought with high points may look good monthly but take longer to recoup.</p>
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

          {/* Funding fee status — VA's exemption list (same as the VA loan calculator, V1) */}
          <fieldset className="sm:col-span-2 flex flex-col gap-1" data-testid="vr-fee-status">
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
                    name="vr-fee-status"
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
                data-testid="vr-exempt-result"
              >
                <span className="font-semibold">No funding fee.</span>{' '}
                On this {typeLabel}, that&apos;s{' '}
                <span className="font-bold">{usd(calc.standardFeeAmount)}</span>{' '}you don&apos;t pay.
              </p>
            )}
            {feeStatus === 'pending' && (
              <p
                className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900"
                data-testid="vr-pending-note"
              >
                With a claim still pending, the fee is due at closing. VA&apos;s rule: if VA later awards you
                compensation with an effective date before your closing date, you may be eligible for a refund.
                A proposed or memorandum rating received after closing doesn&apos;t qualify for a refund.
              </p>
            )}
          </fieldset>

          {refType === 'cashout' && !exempt && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <span id="rf-use-label" className="text-sm font-medium text-zinc-700">VA loan use</span>
              <div className="flex gap-3 mt-1 max-w-xs" role="group" aria-labelledby="rf-use-label">
                <button type="button" aria-disabled={inert} onClick={() => setFirstUse(true)} className={btnCls(firstUse)}>First use</button>
                <button type="button" aria-disabled={inert} onClick={() => setFirstUse(false)} className={btnCls(!firstUse)}>Subsequent use</button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Cash-out funding fee: {feeRateLabel(VA_CASH_OUT_FUNDING_FEE.first)} first use · {feeRateLabel(VA_CASH_OUT_FUNDING_FEE.subsequent)} after first use
              </p>
            </div>
          )}

        </div>
      </Card>

      {/* ── Loan seasoning (optional) ───────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">
          Loan Seasoning{' '}
          <span className="text-zinc-400 font-normal text-sm">(optional)</span>
        </h2>
        <p className="text-xs text-zinc-500 mb-5">
          {refType === 'irrrl'
            ? 'VA requires the later of 210 days after the first payment due date and six consecutive monthly payments before an IRRRL can close.'
            : 'When your current loan is a VA loan, the same seasoning rule applies to a cash-out refinance: the later of 210 days after the first payment due date and six consecutive monthly payments.'}
        </p>
        <div className="max-w-xs">
          <div className="flex flex-col gap-1">
            <label htmlFor="vr-first-pmt" className="text-sm font-medium text-zinc-700">
              {refType === 'irrrl' ? 'First payment due date on your current VA loan' : 'First payment due date on your current loan'}
            </label>
            <input
              id="vr-first-pmt"
              type="date"
              value={firstPaymentDate}
              onChange={(e) => setFirstPaymentDate(e.target.value)}
              className={INPUT_CLS}
            />
            <p className="text-xs text-zinc-500">Found on your first mortgage statement or closing documents.</p>
          </div>
        </div>
      </Card>

      {/* ── Primary result cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="bg-red-700 rounded-lg p-5 text-white" data-testid="vr-payment-card">
          {calc.isCashOut ? (
            <>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-2">Payment change</p>
              <p className="text-3xl font-bold tabular-nums">
                {paymentChange > 0 ? `+${usd(paymentChange)}` : paymentChange < 0 ? `−${usd(-paymentChange)}` : usd(0)}
              </p>
            </>
          ) : (
            <>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-2">Monthly Savings</p>
              <p className="text-3xl font-bold tabular-nums">
                {savingsRounded >= 0 ? `+${usd(savingsRounded)}` : `−${usd(-savingsRounded)}`}
              </p>
            </>
          )}
          <p className="text-red-200 text-xs mt-2">
            {usd(Math.round(calc.currentPayment))} → {usd(Math.round(calc.newPayment))}
          </p>
          <p className="text-red-100 text-xs mt-1">per month (P&amp;I)</p>
        </div>

        {showMonths ? (
          <div className="bg-slate-800 rounded-lg p-5 text-white" data-testid="vr-months-to-recover">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Months to recover closing costs</p>
            <p className="text-3xl font-bold tabular-nums">
              {calc.monthsToRecover !== null ? `${calc.monthsToRecover} mo` : '—'}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {calc.monthsToRecover === null
                ? 'No monthly savings'
                : calc.netClosingCosts === 0
                ? 'No net closing costs to recover'
                : `${usd(calc.netClosingCosts)} net closing costs ÷ ${usd(savingsRounded)} monthly savings`}
            </p>
            {refType === 'irrrl' && calc.monthsToRecover !== null && (
              <p className={`text-xs mt-1 font-medium ${calc.recoupmentPass ? 'text-green-400' : 'text-amber-400'}`}>
                {calc.recoupmentPass
                  ? `✓ Within VA's ${VA_RECOUPMENT_LIMIT_MONTHS}-month limit`
                  : `✗ Over VA's ${VA_RECOUPMENT_LIMIT_MONTHS}-month limit`}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-5 text-white" data-testid="vr-new-loan-card">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">New loan amount</p>
            <p className="text-3xl font-bold tabular-nums">{usd(calc.newLoan)}</p>
            <p className="text-slate-400 text-xs mt-2">
              {usd(currentBalance)} balance + {usd(calc.cashOut)} cash out + {usd(calc.fundingFeeAmount)} funding fee
            </p>
          </div>
        )}

      </div>

      {/* ── Months-to-recover method (VRF-06) ──────────────────────────────── */}
      {showMonths && (
        <p className="text-xs text-zinc-500 leading-relaxed -mt-4" data-testid="vr-recover-note">
          VA&apos;s 36-month test uses this method: the funding fee is left out of the costs (38 U.S.C. § 3709(a)). If you finance the fee, it&apos;s already in your new payment.
        </p>
      )}

      {/* ── Over the full term (VRF-03) ─────────────────────────────────────── */}
      <Card variant="bordered">
        <div data-testid="vr-full-term">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Over the full term</h3>
          <div className="divide-y divide-zinc-100">
            <div className="flex items-start justify-between gap-4 py-2.5">
              <span className="text-sm text-zinc-600">
                Remaining payments on your current loan ({usd(Math.round(calc.currentPayment))} × {yearsRemaining * 12} months)
              </span>
              <span className="text-sm font-medium text-zinc-800 tabular-nums" data-testid="vr-current-total">
                {usd(calc.currentRemainingTotal)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <span className="text-sm text-zinc-600">
                New loan: payments ({usd(Math.round(calc.newPayment))} × {newTerm * 12} months) plus {usd(calc.netClosingCosts)} net closing costs
              </span>
              <span className="text-sm font-medium text-zinc-800 tabular-nums" data-testid="vr-new-total">
                {usd(calc.newLoanTotal)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <span className="text-sm font-semibold text-zinc-900">Difference</span>
              <span className="text-sm font-bold text-zinc-900 tabular-nums" data-testid="vr-full-term-diff">
                {calc.fullTermDifference === 0
                  ? 'The same'
                  : `${usd(Math.abs(calc.fullTermDifference))} ${calc.fullTermDifference > 0 ? 'more' : 'less'}`}
              </span>
            </div>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed mt-3" data-testid="vr-same-term">
            Saving at the same remaining term: paid off over {plural(yearsRemaining, 'year')}, the new loan&apos;s payment would be{' '}
            {usd(Math.round(calc.sameTermPayment))} a month,{' '}
            {Math.round(calc.sameTermSavings) === 0
              ? 'the same as your current payment.'
              : `${usd(Math.abs(Math.round(calc.sameTermSavings)))} ${calc.sameTermSavings > 0 ? 'less' : 'more'} than your current payment.`}
          </p>
          {calc.extraYears > 0 && (
            <p className="text-sm text-zinc-600 leading-relaxed mt-2" data-testid="vr-longer-term">
              Part of the lower payment comes from the longer term: {plural(calc.extraYears, 'more year')} of payments.
            </p>
          )}
          {calc.isCashOut && (
            <p className="text-sm text-zinc-600 leading-relaxed mt-2">
              The new loan&apos;s total includes repaying the {usd(calc.cashOut)} cash out.
            </p>
          )}
        </div>
      </Card>

      {/* ── The Bottom Line ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">The Bottom Line</p>
        <p className="text-base text-zinc-800 leading-relaxed" data-testid="vr-bottom-line">{bottomLine}</p>
      </div>

      {/* ── VA Requirement Checks (IRRRL only) ──────────────────────────────── */}
      {refType === 'irrrl' && (
        <div className="space-y-3" data-testid="vr-va-checks">
          <h3 className="text-base font-semibold text-zinc-900">VA Requirement Checks</h3>
          <CheckIndicator
            pass={calc.ratePass}
            label="Net Tangible Benefit"
            detail={`${rateDropText(calc.rateDropBps)} VA's rule for a fixed-to-fixed IRRRL: the new rate is at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower (38 U.S.C. § 3709(b)).`}
          />
          <CheckIndicator
            pass={calc.recoupmentPass}
            label="36-Month VA Recoupment"
            detail={
              calc.monthsToRecover === null
                ? "Not met: the payment doesn't drop, so the closing costs aren't recovered through it."
                : calc.netClosingCosts === 0
                ? 'No net closing costs to recover.'
                : `${plural(calc.monthsToRecover, 'month')} to recover ${usd(calc.netClosingCosts)} in net closing costs. VA's rule: ${VA_RECOUPMENT_LIMIT_MONTHS} months or fewer, with the funding fee left out (38 U.S.C. § 3709(a)).`
            }
          />
          <CheckIndicator
            pass={calc.monthlySavings > 0}
            label="Monthly Payment"
            detail={
              savingsRounded > 0
                ? `Your payment drops by ${usd(savingsRounded)}/month, ${usd(savingsRounded * 12)}/year.`
                : savingsRounded === 0
                ? 'Your payment would not change with this refinance.'
                : `Your payment would increase by ${usd(-savingsRounded)}/month.`
            }
          />
          {seasoning !== null ? (
            <CheckIndicator
              testId="vr-seasoning"
              pass={seasoning.status !== 'ahead'}
              label="Loan Seasoning"
              detail={`Earliest IRRRL closing date: ${formatLongDate(seasoning.earliestClosing)}. ${seasoningStatus(seasoning)} ${SEASONING_RULE}`}
            />
          ) : (
            <NeutralIndicator
              label="Loan Seasoning"
              detail="Not calculated. Enter your first payment due date above to see the earliest IRRRL closing date (210 days and six payments)."
            />
          )}
        </div>
      )}

      {/* ── Seasoning (cash-out, when a date is entered) ───────────────────── */}
      {refType === 'cashout' && seasoning !== null && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" data-testid="vr-seasoning">
          <p className="text-sm font-semibold text-zinc-800">
            Earliest closing date: {formatLongDate(seasoning.earliestClosing)}
          </p>
          <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
            {seasoningStatus(seasoning)} This applies when your current loan is a VA loan (38 CFR § 36.4306(c)(2)). {SEASONING_RULE}
          </p>
        </div>
      )}

      {/* ── Cost breakdown ──────────────────────────────────────────────────── */}
      <Card variant="bordered">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Cost Breakdown</h3>
        <div className="divide-y divide-zinc-100">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">
              VA Funding Fee ({feeRateLabel(calc.standardFeeRate)} of {usd(calc.feeBase)})
            </span>
            <span className="text-sm font-medium tabular-nums" data-testid="vr-funding-fee">
              {exempt
                ? <span className="text-green-700 font-semibold">$0 — Waived</span>
                : usd(calc.fundingFeeAmount)
              }
            </span>
          </div>
          {exempt && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-500">Amount saved (exemption)</span>
              <span className="text-sm font-medium text-green-700 tabular-nums">
                {usd(calc.standardFeeAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">Closing Costs</span>
            <span className="text-sm font-medium text-zinc-800 tabular-nums">{usd(closingCosts)}</span>
          </div>
          {lenderCredits > 0 && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-600">Lender Credits</span>
              <span className="text-sm font-medium text-green-700 tabular-nums">
                −{usd(Math.min(lenderCredits, closingCosts))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm font-semibold text-zinc-900">Net Closing Costs</span>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">{usd(calc.netClosingCosts)}</span>
          </div>
          {calc.isCashOut && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-600">Cash Out</span>
              <span className="text-sm font-medium text-zinc-800 tabular-nums">{usd(calc.cashOut)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">
              New Loan Amount ({calc.isCashOut ? 'balance + cash out + fee' : 'balance + fee'})
            </span>
            <span className="text-sm font-medium text-zinc-800 tabular-nums" data-testid="vr-new-loan">{usd(calc.newLoan)}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          VA funding fee assumed rolled into the new loan balance. Closing costs are separate and typically due at closing.
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
