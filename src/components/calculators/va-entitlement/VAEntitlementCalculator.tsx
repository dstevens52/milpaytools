'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fireCalculatorEvent, fireDeepLinkEvent } from '@/lib/analytics';
import { useUserInputGate } from '@/components/calculators/shared/useUserInputGate';
import { usePreHydrationSync } from '@/components/calculators/shared/usePreHydrationSync';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { Card } from '@/components/ui/Card';
import { readUrlParams } from '@/data/calculatorUrlParams';
import {
  LOAN_LIMIT_SUMMARIES,
  LOAN_LIMIT_YEAR,
  loadLoanLimits,
  loanLimitYearLabel,
  loanLimitYearsShown,
} from '@/data/va-loan/loanLimitYear';
import { LOAN_LIMIT_STATE_NAMES } from '@/data/va-loan/stateNames';
import type { CountyLoanLimitRow } from '@/data/va-loan/types';
import {
  BASIC_ENTITLEMENT_MAX_LOAN,
  calcEntitlement,
  countyDisplayName,
  estimatedUsedFromPriorLoan,
  usdExact,
  type EntitlementResult,
} from '@/lib/calculations/vaEntitlement';
import { FEE_STATUSES, feeRateLabel, parseFeeStatus, type FeeStatus } from '@/lib/calculations/vaLoanFees';

/** VA.gov's "How to request a COE" page (docs/sources/va-irrrl-coe-2026.md). */
const COE_URL = 'https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/';

type FullAnswer = 'yes' | 'no' | 'unsure';

const INPUT_CLS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';
const SELECT_CLS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:bg-zinc-50 disabled:text-zinc-400';

/** Digits only; '' when nothing typed. */
function digits(s: string): string {
  return s.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '').slice(0, 10);
}
function fmtTyped(s: string): string {
  return s === '' ? '' : Number(s).toLocaleString('en-US');
}
function btnCls(active: boolean) {
  return [
    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors text-center',
    active ? 'bg-red-700 border-red-700 text-white' : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
  ].join(' ');
}
function parseFull(raw: string | null): FullAnswer | null {
  if (raw === null) return null;
  const v = raw.trim().toLowerCase();
  if (v === 'yes' || v === '1' || v === 'true') return 'yes';
  if (v === 'no' || v === '0' || v === 'false') return 'no';
  if (v === 'unsure' || v === 'notsure' || v === 'not-sure') return 'unsure';
  return null;
}
function parseDollarParam(raw: string | null): string {
  if (raw === null) return '';
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? String(n) : '';
}
function feeBandLabel(downPct: number): string {
  if (downPct < 5) return 'less than 5% down';
  if (downPct < 10) return '5% to 9.99% down';
  return '10% or more down';
}

const STATE_OPTIONS = Object.entries(LOAN_LIMIT_STATE_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function VAEntitlementCalculator() {
  const years = useMemo(() => loanLimitYearsShown(), []);

  const [full, setFull] = useState<FullAnswer>('no');
  const [used, setUsed] = useState('');
  const [prior, setPrior] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [fips, setFips] = useState('');
  const [price, setPrice] = useState('');
  const [down, setDown] = useState('');
  const [feeStatus, setFeeStatus] = useState<FeeStatus>('none');

  // County lists, one per year shown, loaded on demand.
  const [lists, setLists] = useState<Record<number, ReadonlyMap<string, CountyLoanLimitRow>> | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all(years.map((y) => loadLoanLimits(y)))
      .then((rows) => {
        if (!live) return;
        const out: Record<number, ReadonlyMap<string, CountyLoanLimitRow>> = {};
        years.forEach((y, i) => {
          out[y] = new Map(rows[i].map((r) => [r[0], r]));
        });
        setLists(out);
      })
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, [years]);

  // ─── URL pre-population ───────────────────────────────────────────────────
  // The URL is read once on mount (window.location isn't available during the
  // server render), as every calculator does; usePreHydrationSync runs after it.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time URL prefill on mount */
  useEffect(() => {
    const p = readUrlParams('va-entitlement', window.location.search);
    const f = parseFull(p.get('full'));
    if (f) setFull(f);
    setUsed(parseDollarParam(p.get('used')));
    setPrior(parseDollarParam(p.get('prior')));
    const fipsRaw = (p.get('fips') ?? '').trim();
    if (/^\d{5}$/.test(fipsRaw)) setFips(fipsRaw);
    setPrice(parseDollarParam(p.get('price')));
    setDown(parseDollarParam(p.get('down')));
    const feeRaw = p.get('fee');
    if (feeRaw !== null) setFeeStatus(parseFeeStatus(feeRaw, null));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentList = lists?.[years[0]] ?? null;
  // A county from the URL sets the state once the list is in.
  const fipsRow = fips && currentList ? currentList.get(fips) ?? null : null;
  const effectiveState = stateCode || fipsRow?.[1] || '';
  const countiesInState =
    !currentList || !effectiveState
      ? []
      : [...currentList.values()]
          .filter((r) => r[1] === effectiveState)
          .map((r) => ({ fips: r[0], name: countyDisplayName(r[2]) }))
          .sort((a, b) => a.name.localeCompare(b.name));

  // ─── Entitlement used ─────────────────────────────────────────────────────
  const usedTyped = used !== '';
  const priorNum = prior === '' ? 0 : Number(prior);
  const priorEstimate = !usedTyped && prior !== '' ? estimatedUsedFromPriorLoan(priorNum) : null;
  const priorNeedsCoe = !usedTyped && prior !== '' && priorEstimate === null;
  const usedValue: number | null = usedTyped ? Number(used) : priorEstimate;

  const priceNum = price === '' ? 0 : Number(price);
  const downNum = down === '' ? 0 : Number(down);
  const countyChosen = fips !== '';
  const countyPending = countyChosen && !lists && !loadError;
  const countyMissing = countyChosen && !!lists && !fipsRow;

  // ─── Results, one per year shown ──────────────────────────────────────────
  const results = useMemo(() => {
    if (full === 'yes' || usedValue === null || countyPending) return null;
    return years.map((year) => {
      const row = countyChosen ? lists?.[year]?.get(fips) ?? null : null;
      const countyLimit = row ? row[3] : LOAN_LIMIT_SUMMARIES[year].baseline;
      const r = calcEntitlement({ countyLimit, used: usedValue, price: priceNum, down: downNum, feeStatus });
      return { year, row, r };
    });
  }, [full, usedValue, countyPending, years, countyChosen, lists, fips, priceNum, downNum, feeStatus]);

  const countyLabel = fipsRow ? `${countyDisplayName(fipsRow[2])}, ${fipsRow[1]}` : null;

  // ─── Links ────────────────────────────────────────────────────────────────
  function getShareUrl() {
    const q = new URLSearchParams();
    q.set('full', full);
    if (used !== '') q.set('used', used);
    else if (prior !== '') q.set('prior', prior);
    if (fips) q.set('fips', fips);
    if (price !== '') q.set('price', price);
    if (down !== '') q.set('down', down);
    q.set('fee', feeStatus);
    return `${window.location.origin}/calculators/va-entitlement?${q.toString()}`;
  }

  /** The VA loan calculator with this purchase, subsequent use, same fee status. */
  function vaLoanHref(r: EntitlementResult | null): string {
    const q = new URLSearchParams();
    const p = priceNum > 0 ? priceNum : r && r.maxZeroDown > 0 ? r.maxZeroDown : 0;
    if (p > 0) q.set('price', String(Math.round(p)));
    q.set('down', String(priceNum > 0 ? Math.min(downNum, priceNum) : 0));
    q.set('firstUse', 'no');
    q.set('fee', feeStatus);
    return `/calculators/va-loan?${q.toString()}`;
  }

  // ─── Analytics ────────────────────────────────────────────────────────────
  const gaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { attach: gaAttach, hasInteracted: gaInteracted, root: gaRoot } = useUserInputGate();
  useEffect(() => {
    if (!gaInteracted()) return;
    clearTimeout(gaTimer.current);
    gaTimer.current = setTimeout(() => fireCalculatorEvent('va-entitlement'), 800);
    return () => clearTimeout(gaTimer.current);
  }, [results, full, gaInteracted]);

  // After the URL effect: input made before hydration wins over URL params (build 1c).
  const hydrated = usePreHydrationSync(gaRoot, { calculator: 'va-entitlement', shareUrl: getShareUrl });
  const inert = hydrated ? undefined : true;

  const first = results?.[0]?.r ?? null;

  return (
    <div ref={gaAttach} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Section 1: entitlement ───────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Your VA entitlement</h2>

        <div className="flex flex-col gap-1">
          <span id="ve-full-label" className="text-sm font-medium text-zinc-700">
            Do you have full VA entitlement?
          </span>
          <div className="flex gap-3 mt-1 max-w-md" role="group" aria-labelledby="ve-full-label">
            <button type="button" aria-disabled={inert} aria-pressed={full === 'yes'} onClick={() => setFull('yes')} className={btnCls(full === 'yes')}>Yes</button>
            <button type="button" aria-disabled={inert} aria-pressed={full === 'no'} onClick={() => setFull('no')} className={btnCls(full === 'no')}>No</button>
            <button type="button" aria-disabled={inert} aria-pressed={full === 'unsure'} onClick={() => setFull('unsure')} className={btnCls(full === 'unsure')}>Not sure</button>
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            You have it back if the home you bought with your prior VA loan was sold and the loan paid in full, or a
            qualified Veteran assumed the loan and substituted their entitlement. There&apos;s also a one-time
            restoration if you repaid the prior loan in full but kept the home. Your COE shows your status.
          </p>
        </div>

        {full === 'yes' ? (
          <div className="mt-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-900" data-testid="ve-full-note">
            <p>
              <span className="font-semibold">No county loan limit applies with full entitlement.</span>{' '}
              Your lender still approves the loan amount.
            </p>
            <a
              href={vaLoanHref(null)}
              onClick={() => fireDeepLinkEvent('va-entitlement-calculator', 'va-loan', { placement: 'result-card' })}
              className="mt-2 inline-block font-semibold text-red-700 hover:text-red-800 underline"
              data-testid="ve-full-cta"
            >
              Estimate your payment with the VA loan calculator →
            </a>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="ve-used" className="text-sm font-medium text-zinc-700">Entitlement already used</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  id="ve-used"
                  type="text"
                  inputMode="numeric"
                  placeholder="From your COE"
                  value={fmtTyped(used)}
                  onChange={(e) => setUsed(digits(e.target.value))}
                  className={INPUT_CLS + ' pl-6'}
                />
              </div>
              <p className="text-xs text-zinc-500">
                On your COE, in the table &ldquo;Prior Loans charged to entitlement&rdquo;.{' '}
                <a href={COE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-800">
                  How to request a COE (VA.gov)
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ve-prior" className="text-sm font-medium text-zinc-700">
                Don&apos;t have your COE handy? Enter your current VA loan&apos;s original amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  id="ve-prior"
                  type="text"
                  inputMode="numeric"
                  placeholder="Original loan amount"
                  value={fmtTyped(prior)}
                  onChange={(e) => setPrior(digits(e.target.value))}
                  className={INPUT_CLS + ' pl-6'}
                />
              </div>
              {usedTyped && prior !== '' && (
                <p className="text-xs text-zinc-500">Using the amount from your COE (left).</p>
              )}
              {priorEstimate !== null && (
                <p className="text-xs text-amber-800" data-testid="ve-prior-estimate">
                  Entitlement used: about {usdExact(priorEstimate)} (25% of the loan). Estimate. Your COE shows the exact amount.
                </p>
              )}
              {priorNeedsCoe && (
                <p className="text-xs text-amber-800" data-testid="ve-prior-coe">
                  For a loan of {usdExact(BASIC_ENTITLEMENT_MAX_LOAN)} or less, basic entitlement applies: check your COE for the amount used.
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {full !== 'yes' && (
        <>
          {/* ── Section 2: where and what ──────────────────────────────── */}
          <Card variant="default">
            <h2 className="text-lg font-semibold text-zinc-900 mb-5">Where are you buying?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="ve-state" className="text-sm font-medium text-zinc-700">State or territory</label>
                <select
                  id="ve-state"
                  value={effectiveState}
                  onChange={(e) => {
                    setStateCode(e.target.value);
                    setFips('');
                  }}
                  className={SELECT_CLS}
                >
                  <option value="">Choose a state</option>
                  {STATE_OPTIONS.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="ve-county" className="text-sm font-medium text-zinc-700">County</label>
                <select
                  id="ve-county"
                  value={fipsRow ? fips : ''}
                  onChange={(e) => setFips(e.target.value)}
                  disabled={!currentList || !effectiveState}
                  className={SELECT_CLS}
                  data-testid="ve-county"
                >
                  <option value="">
                    {!currentList ? (loadError ? 'County list didn’t load' : 'Loading counties…') : effectiveState ? 'Choose a county' : 'Choose a state first'}
                  </option>
                  {countiesInState.map((c) => (
                    <option key={c.fips} value={c.fips}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500">Type the first letters to jump to a county.</p>
              </div>
            </div>
            {!countyChosen && (
              <p className="mt-3 text-xs text-zinc-500" data-testid="ve-baseline-note">
                No county chosen: the results use the limit for most U.S. counties.
              </p>
            )}
            {countyMissing && (
              <p className="mt-3 text-xs text-amber-800">That county code isn&apos;t in FHFA&apos;s file. Choose a county above.</p>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="ve-price" className="text-sm font-medium text-zinc-700">Home price (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    id="ve-price"
                    type="text"
                    inputMode="numeric"
                    value={fmtTyped(price)}
                    onChange={(e) => setPrice(digits(e.target.value))}
                    className={INPUT_CLS + ' pl-6'}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="ve-down" className="text-sm font-medium text-zinc-700">Down payment (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    id="ve-down"
                    type="text"
                    inputMode="numeric"
                    value={fmtTyped(down)}
                    onChange={(e) => setDown(digits(e.target.value))}
                    className={INPUT_CLS + ' pl-6'}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  {priceNum > 0 && downNum > 0
                    ? `${((Math.min(downNum, priceNum) / priceNum) * 100).toFixed(1)}% of the home price`
                    : 'VA loans allow $0 down for eligible borrowers'}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Section 3: funding fee status ─────────────────────────── */}
          <Card variant="default">
            <fieldset className="flex flex-col gap-1" data-testid="ve-fee-status">
              <legend className="text-lg font-semibold text-zinc-900 mb-1">Do you have to pay the VA funding fee?</legend>
              <p className="text-xs text-zinc-500">
                VA&apos;s exemption list. A second VA loan pays the subsequent-use rate unless you&apos;re exempt. Your lender
                confirms it from your Certificate of Eligibility.
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
                      name="ve-fee-status"
                      value={s.value}
                      checked={feeStatus === s.value}
                      onChange={() => setFeeStatus(s.value)}
                      className="mt-0.5 accent-red-700"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>

          {/* ── Results ───────────────────────────────────────────────── */}
          <section aria-label="Your remaining entitlement" data-testid="ve-results">
            {usedValue === null ? (
              <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600" data-testid="ve-prompt">
                {priorNeedsCoe
                  ? 'Enter the entitlement already used from your COE to see your remaining entitlement.'
                  : 'Enter the entitlement already used (from your COE), or your current VA loan’s original amount, to see your remaining entitlement.'}
              </div>
            ) : countyPending ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">Loading the county loan limit…</div>
            ) : results ? (
              <div className={['grid gap-4', results.length > 1 ? 'md:grid-cols-2' : ''].join(' ')}>
                {results.map(({ year, r }, idx) => (
                  <div
                    key={year}
                    className={['rounded-lg p-5', idx === 0 ? 'bg-red-700 text-white' : 'bg-white border-2 border-zinc-200 text-zinc-900'].join(' ')}
                    data-testid={`ve-result-${year}`}
                  >
                    <p className={['text-sm font-semibold uppercase tracking-wider mb-3', idx === 0 ? 'text-red-100' : 'text-zinc-500'].join(' ')}>
                      {loanLimitYearLabel(year, LOAN_LIMIT_YEAR)}
                    </p>
                    <p className={['text-sm', idx === 0 ? 'text-red-50' : 'text-zinc-700'].join(' ')} data-testid={`ve-county-limit-${year}`}>
                      {countyLabel ? `${countyLabel} limit (one unit):` : 'Limit in most U.S. counties (one unit):'}{' '}
                      <span className="font-semibold">{usdExact(r.countyLimit)}</span>
                    </p>
                    <p className={['text-sm mt-2', idx === 0 ? 'text-red-50' : 'text-zinc-700'].join(' ')} data-testid={`ve-remaining-${year}`}>
                      VA&apos;s 25%: {usdExact(r.vaShare)} − entitlement used {usdExact(r.used)} = remaining entitlement{' '}
                      <span className="font-bold">{usdExact(r.remaining)}</span>
                    </p>
                    {r.remaining > 0 ? (
                      <p className="mt-3 text-base" data-testid="ve-max-loan" data-year={year}>
                        Most lenders lend up to 4 × your remaining entitlement with no down payment: up to{' '}
                        <span className="text-2xl font-extrabold tabular-nums">{usdExact(r.maxZeroDown)}</span>.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm" data-testid={`ve-zero-${year}`}>
                        No remaining entitlement in this county. Restoring entitlement (sell and pay off, assumption with
                        substitution, or the one-time restoration) would change this.
                      </p>
                    )}
                    {r.aboveMax && (
                      <p className={['mt-3 text-sm', idx === 0 ? 'text-red-50' : 'text-zinc-700'].join(' ')} data-testid={`ve-down-${year}`}>
                        Most lenders want your remaining entitlement and a down payment together to cover at least 25% of the
                        loan: about <span className="font-bold">{usdExact(r.typicalDown)}</span> down.
                      </p>
                    )}
                    {(r.hasPrice || r.remaining > 0) && (
                      <p className={['mt-3 pt-3 text-sm border-t', idx === 0 ? 'border-red-600 text-red-50' : 'border-zinc-200 text-zinc-700'].join(' ')} data-testid={`ve-fee-${year}`}>
                        {r.exempt
                          ? `Funding fee: $0. You picked one of VA’s exemptions.`
                          : `Funding fee on a ${usdExact(r.loan)} loan at the subsequent-use rate (${feeRateLabel(r.feeRate)}, ${feeBandLabel(r.downPct)}): ${usdExact(r.feeAmount)}.`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {feeStatus === 'pending' && results && (
              <p className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
                With a claim still pending, the fee is due at closing. VA&apos;s rule: if VA later awards you compensation with
                an effective date before your closing date, you may be eligible for a refund.
              </p>
            )}

            {results && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href={vaLoanHref(first)}
                  onClick={() => fireDeepLinkEvent('va-entitlement-calculator', 'va-loan', { placement: 'result-card' })}
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                  data-testid="ve-cta"
                >
                  Estimate the full payment →
                </a>
                <p className="text-xs text-zinc-500">
                  Opens the VA loan calculator at subsequent use, with this price, down payment and funding fee status.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      <SaveOrShareResults
        pageName="va-entitlement"
        headline="Save or share your entitlement estimate"
        supportingText="Useful when you talk with a lender about a second VA loan, or compare counties at your next duty station."
        usefulFor={['Lender conversation', 'Next duty station', 'Spouse or family']}
        getUrl={getShareUrl}
        shareTitle="VA loan entitlement estimate"
        shareText="Here's my VA entitlement estimate from MilPayTools."
      />
    </div>
  );
}
