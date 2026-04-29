'use client';

import { useState, useMemo, useEffect } from 'react';
import { compareLocations } from '@/lib/calculations/compare';
import type { CompareResult, LocationData } from '@/lib/calculations/compare';
import type { PayGrade } from '@/types/military';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';
import { ShareButton } from '@/components/calculators/shared/ShareButton';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAY_GRADES: { group: string; grades: PayGrade[] }[] = [
  { group: 'Enlisted',       grades: ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'] },
  { group: 'Warrant Officer', grades: ['W-1','W-2','W-3','W-4','W-5'] },
  { group: 'Officer',        grades: ['O-1','O-2','O-3','O-4','O-5','O-6','O-7','O-8','O-9','O-10'] },
];

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtRate(rate: number): string {
  return (rate * 100).toFixed(1) + '%';
}

function diffSign(n: number): string {
  return n >= 0 ? '+' : '';
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{children}</p>
  );
}

interface DiffBadgeProps {
  diff: number;
  suffix?: string;
  invert?: boolean; // for taxes: higher tax is bad even though the number is positive
  neutral?: boolean;
}
function DiffBadge({ diff, suffix = '/mo', invert = false, neutral = false }: DiffBadgeProps) {
  if (neutral || Math.abs(diff) < 1) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500">
        Same
      </span>
    );
  }
  const isPositive = invert ? diff < 0 : diff > 0;
  const label = `${diffSign(diff)}${fmt(Math.abs(diff))}${suffix}`;
  return (
    <span
      className={[
        'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
        isPositive
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200',
      ].join(' ')}
    >
      {isPositive ? '▲' : '▼'} {label}
    </span>
  );
}

// ─── Comparison row ────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  sublabel?: string;
  valA: string;
  valB: string;
  badge: React.ReactNode;
  highlight?: boolean;
}
function CompareRow({ label, sublabel, valA, valB, badge, highlight }: RowProps) {
  return (
    <div
      className={[
        'grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[180px_1fr_1fr_140px] gap-x-4 gap-y-1 py-3 border-b border-zinc-100 items-center',
        highlight ? 'bg-zinc-50 -mx-6 px-6 rounded' : '',
      ].join(' ')}
    >
      <div>
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {sublabel && <p className="text-xs text-zinc-400 mt-0.5">{sublabel}</p>}
      </div>
      <p className="text-sm font-semibold text-zinc-900 tabular-nums text-right sm:text-left">{valA}</p>
      <p className="text-sm font-semibold text-zinc-900 tabular-nums text-right sm:text-left">{valB}</p>
      <div className="flex justify-end sm:justify-start">{badge}</div>
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ result, nameA, nameB }: { result: CompareResult; nameA: string; nameB: string }) {
  const { verdict, takeHomeDiffMonthly, takeHomeDiffAnnual } = result;
  const absDiff = Math.abs(takeHomeDiffMonthly);
  const absAnnual = Math.abs(takeHomeDiffAnnual);

  let headline: React.ReactNode;
  let subline: string;
  let accentColor: string;
  let icon: string;

  if (verdict === 'similar') {
    headline = (
      <>
        {nameA} and {nameB} are <span className="text-zinc-700">financially similar</span>
      </>
    );
    subline = `Estimated take-home difference: less than ${fmt(result.similarThreshold)}/month`;
    accentColor = 'border-zinc-300';
    icon = '≈';
  } else {
    const betterName = verdict === 'B_better' ? nameB : nameA;
    headline = (
      <>
        <span className="text-green-700">{betterName}</span> pays{' '}
        <span className="text-green-700">{fmt(absDiff)} more per month</span>
      </>
    );
    subline = `${fmt(absAnnual)} more per year after estimated federal and state taxes`;
    accentColor = 'border-green-400';
    icon = '$';
  }

  // State tax narrative
  const { locA, locB, stateTaxDiffAnnual } = result;
  const showTaxNarrative =
    (locA.stateInfo?.noTax !== locB.stateInfo?.noTax) && Math.abs(stateTaxDiffAnnual) > 200;
  let taxNarrative = '';
  if (showTaxNarrative) {
    const noTaxSide = locA.stateInfo?.noTax ? nameA : nameB;
    const taxSide = locA.stateInfo?.noTax ? nameB : nameA;
    const saved = fmt(Math.abs(stateTaxDiffAnnual));
    taxNarrative = `${noTaxSide} has no state income tax — that saves approximately ${saved}/year vs. ${taxSide}.`;
  }

  return (
    <div className={['rounded-lg border-2 bg-white p-6', accentColor].join(' ')}>
      <div className="flex items-start gap-4">
        <div className="flex-none w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-black text-zinc-500 select-none">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 leading-snug mb-1">{headline}</h2>
          <p className="text-sm text-zinc-500">{subline}</p>
          {taxNarrative && (
            <p className="mt-2 text-sm text-blue-700 font-medium">{taxNarrative}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Location column header ────────────────────────────────────────────────────

function LocationHeader({ loc, label }: { loc: LocationData; label: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="font-semibold text-zinc-900 text-sm leading-tight mt-0.5">
        {loc.locationName}
      </p>
      {loc.state && (
        <p className="text-xs text-zinc-400">
          {loc.stateInfo?.name ?? loc.state}
          {loc.stateInfo?.noTax ? ' · No state income tax' : loc.stateInfo ? ` · ~${fmtRate(loc.stateInfo.rate)} est. state tax` : ''}
        </p>
      )}
    </div>
  );
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function CompareCalculator() {
  const [payGrade, setPayGrade] = useState<PayGrade>('E-5');
  const [yos, setYos] = useState(6);
  const [hasDependents, setHasDependents] = useState(true);
  const [zipA, setZipA] = useState('28310');
  const [zipB, setZipB] = useState('98433');
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');

  // Pre-populate from URL params on mount
  // ?zip1=28310&zip2=98433&rank=E5&dependents=yes&yos=6
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const z1 = parseZip(params.get('zip1'));
    const z2 = parseZip(params.get('zip2'));
    const gr = parseGrade(params.get('rank'));
    const dep = parseBool(params.get('dependents'));
    const yosRaw = params.get('yos');
    if (z1) setZipA(z1);
    if (z2) setZipB(z2);
    if (gr) setPayGrade(gr);
    if (dep !== null) setHasDependents(dep);
    if (yosRaw) {
      const n = parseInt(yosRaw, 10);
      if (!isNaN(n) && n >= 0 && n <= 40) setYos(n);
    }
  }, []);

  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('zip1', zipA.replace(/\D/g, '').slice(0, 5) || zipA);
    p.set('zip2', zipB.replace(/\D/g, '').slice(0, 5) || zipB);
    p.set('rank', gradeToParam(payGrade));
    p.set('dependents', hasDependents ? 'yes' : 'no');
    p.set('yos', String(yos));
    return `${window.location.origin}/calculators/compare?${p.toString()}`;
  }

  const zipAClean = zipA.replace(/\D/g, '').slice(0, 5);
  const zipBClean = zipB.replace(/\D/g, '').slice(0, 5);
  const bothReady = zipAClean.length === 5 && zipBClean.length === 5;

  const result = useMemo(() => {
    if (!bothReady) return null;
    return compareLocations({
      payGrade,
      yearsOfService: yos,
      hasDependents,
      zipA: zipAClean,
      zipB: zipBClean,
    });
  }, [payGrade, yos, hasDependents, zipAClean, zipBClean, bothReady]);

  // Display names for each location
  const nameA = labelA.trim() || result?.locA.locationName || `ZIP ${zipAClean}`;
  const nameB = labelB.trim() || result?.locB.locationName || `ZIP ${zipBClean}`;

  const showCOLA = result && (result.locA.isColaArea || result.locB.isColaArea);

  return (
    <div className="space-y-6">
      {/* ── Inputs ── */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Your Situation</h2>

        {/* Service member info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Pay grade</label>
            <select
              value={payGrade}
              onChange={(e) => setPayGrade(e.target.value as PayGrade)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              {PAY_GRADES.map(({ group, grades }) => (
                <optgroup key={group} label={group}>
                  {grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Years of service
            </label>
            <input
              type="number"
              min={0}
              max={40}
              value={yos}
              onChange={(e) => setYos(Math.max(0, Math.min(40, Number(e.target.value))))}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-zinc-700 mb-1.5">Dependents</span>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[38px]">
              <button
                onClick={() => setHasDependents(true)}
                className={[
                  'flex-1 text-sm font-medium transition-colors',
                  hasDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                With deps
              </button>
              <button
                onClick={() => setHasDependents(false)}
                className={[
                  'flex-1 text-sm font-medium border-l border-zinc-300 transition-colors',
                  !hasDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Without
              </button>
            </div>
          </div>
        </div>

        {/* Location inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Location A */}
          <div className="rounded-md border border-zinc-200 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Location A</p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">ZIP code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipA}
                onChange={(e) => setZipA(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 28310"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
              {result && (
                <p className="text-xs text-zinc-400 mt-1">{result.locA.locationName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Label <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                placeholder={result?.locA.locationName || 'e.g. Fort Liberty, NC'}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location B */}
          <div className="rounded-md border border-zinc-200 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Location B</p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">ZIP code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipB}
                onChange={(e) => setZipB(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 98433"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
              {result && (
                <p className="text-xs text-zinc-400 mt-1">{result.locB.locationName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Label <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                placeholder={result?.locB.locationName || 'e.g. JBLM, WA'}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Waiting state ── */}
      {!bothReady && (
        <div className="text-center py-8 text-zinc-400 text-sm">
          Enter 5-digit ZIP codes for both locations to see the comparison.
        </div>
      )}

      {/* ── Results ── */}
      {bothReady && result && (
        <>
          {/* Summary */}
          <SummaryCard result={result} nameA={nameA} nameB={nameB} />

          <div className="flex justify-end">
            <ShareButton getUrl={getShareUrl} />
          </div>

          {/* Detailed comparison */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[180px_1fr_1fr_140px] gap-x-4 pb-3 border-b-2 border-zinc-200 mb-1">
              <div />
              <LocationHeader loc={result.locA} label={nameA} />
              <LocationHeader loc={result.locB} label={nameB} />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 self-end hidden sm:block">
                Difference
              </p>
            </div>

            {/* Row: Base Pay */}
            <CompareRow
              label="Base pay"
              sublabel={`${payGrade} · ${yos} YOS`}
              valA={`${fmt(result.monthlyBasePay)}/mo`}
              valB={`${fmt(result.monthlyBasePay)}/mo`}
              badge={<DiffBadge diff={0} neutral />}
            />

            {/* Row: BAH */}
            <CompareRow
              label="BAH"
              sublabel={hasDependents ? 'With dependents' : 'Without dependents'}
              valA={result.locA.bahFound ? `${fmt(result.locA.monthlyBAH)}/mo` : 'Not found'}
              valB={result.locB.bahFound ? `${fmt(result.locB.monthlyBAH)}/mo` : 'Not found'}
              badge={<DiffBadge diff={result.bahDiffMonthly} />}
            />

            {/* Row: BAS */}
            <CompareRow
              label="BAS"
              sublabel={result.isEnlisted ? 'Enlisted rate' : 'Officer rate'}
              valA={`${fmt(result.monthlyBAS)}/mo`}
              valB={`${fmt(result.monthlyBAS)}/mo`}
              badge={<DiffBadge diff={0} neutral />}
            />

            {/* Row: CONUS COLA (only if at least one location qualifies) */}
            {showCOLA && (
              <CompareRow
                label="CONUS COLA"
                sublabel="Taxable · approx."
                valA={result.locA.isColaArea
                  ? `${fmt(result.locA.monthlyCOLA)}/mo`
                  : 'Not eligible'}
                valB={result.locB.isColaArea
                  ? `${fmt(result.locB.monthlyCOLA)}/mo`
                  : 'Not eligible'}
                badge={<DiffBadge diff={result.colaDiffMonthly} />}
              />
            )}

            {/* Row: Gross Monthly (divider row) */}
            <CompareRow
              label="Gross monthly"
              sublabel="Before taxes"
              valA={`${fmt(result.locA.grossMonthly)}/mo`}
              valB={`${fmt(result.locB.grossMonthly)}/mo`}
              badge={<DiffBadge diff={result.grossDiffMonthly} />}
              highlight
            />

            {/* Row: State Tax */}
            <CompareRow
              label="Est. state income tax"
              sublabel="On base pay + COLA only · many states exempt military pay"
              valA={result.locA.stateInfo?.noTax
                ? 'No state tax'
                : result.locA.stateInfo
                  ? `${fmt(result.locA.monthlyStateTax)}/mo (${fmtRate(result.locA.stateInfo.rate)})`
                  : `${fmt(result.locA.monthlyStateTax)}/mo`}
              valB={result.locB.stateInfo?.noTax
                ? 'No state tax'
                : result.locB.stateInfo
                  ? `${fmt(result.locB.monthlyStateTax)}/mo (${fmtRate(result.locB.stateInfo.rate)})`
                  : `${fmt(result.locB.monthlyStateTax)}/mo`}
              badge={
                // Higher state tax at B = bad for B (invert)
                <DiffBadge diff={result.stateTaxDiffAnnual / 12} invert suffix="/mo" />
              }
            />

            {/* Row: Estimated Take-Home */}
            <CompareRow
              label="Est. take-home"
              sublabel="After fed + state taxes"
              valA={`${fmt(result.locA.monthlyTakeHome)}/mo`}
              valB={`${fmt(result.locB.monthlyTakeHome)}/mo`}
              badge={<DiffBadge diff={result.takeHomeDiffMonthly} />}
              highlight
            />
          </div>

          {/* Annual summary strip */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Annual summary
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'BAH difference/yr', val: result.bahDiffMonthly * 12 },
                { label: 'State tax difference/yr', val: -result.stateTaxDiffAnnual, invert: false },
                { label: 'Take-home difference/yr', val: result.takeHomeDiffAnnual },
              ].map(({ label, val }) => {
                const isPos = val >= 0;
                return (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 mb-1">{label}</p>
                    <p className={['text-lg font-bold tabular-nums', Math.abs(val) < 50 ? 'text-zinc-400' : isPos ? 'text-green-700' : 'text-red-700'].join(' ')}>
                      {val >= 0 ? '+' : ''}{fmt(val)}
                    </p>
                    <p className="text-xs text-zinc-400">{isPos ? `more at ${nameB}` : `more at ${nameA}`}</p>
                  </div>
                );
              })}
              <div>
                <p className="text-xs text-zinc-500 mb-1">Comparison period</p>
                <p className="text-lg font-bold text-zinc-900">1 year</p>
                <p className="text-xs text-zinc-400">Multiply for longer tours</p>
              </div>
            </div>
          </div>

          {/* State tax notice */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 leading-relaxed">
            <p className="font-semibold mb-1">State tax estimates are approximate</p>
            <p className="mb-2">
              Many states offer partial or full exemptions for active-duty military pay. For
              example, some states exempt pay earned while stationed outside the state, while
              others exempt all active duty pay regardless of duty station. The rates shown here
              are simplified effective rates that do not account for these exemptions, deductions,
              or your filing status.
            </p>
            <p>
              Check with your state tax authority or a tax professional for your specific
              situation. Your installation&apos;s{' '}
              <span className="font-semibold">Legal Assistance office</span> provides free tax
              guidance and can clarify which exemptions apply to your duty station. Federal
              estimates use 2026 brackets with the standard deduction for a single filer.{' '}
              <span className="font-semibold">This is not tax advice.</span>
            </p>
          </div>

          {/* Act steps */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Related tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  href: '/calculators/pcs',
                  icon: '📦',
                  title: 'PCS Cost Estimator',
                  desc: 'Estimate DLA, MALT mileage, per diem, and PPM profit for your move.',
                },
                {
                  href: '/calculators/total-compensation',
                  icon: '💰',
                  title: 'Total Compensation',
                  desc: 'Full breakdown of base pay, allowances, tax advantages, and TSP.',
                },
                {
                  href: '/calculators/bah',
                  icon: '🏠',
                  title: 'BAH Calculator',
                  desc: 'Look up BAH for any ZIP code and compare two duty stations.',
                },
                {
                  href: 'https://www.varefinance.com',
                  icon: '🏡',
                  title: 'VA Home Loan — VARefinance.com',
                  desc: '$0 down, no PMI. See how your BAH supports a mortgage payment at your new duty station.',
                  external: true,
                },
              ].map(({ href, icon, title, desc, external }) => (
                <a
                  key={href}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex gap-3 rounded-md bg-white border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-xl flex-none">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors">
                      {title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* No BAH data warning */}
      {bothReady && result && (!result.locA.bahFound || !result.locB.bahFound) && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <span className="font-semibold">BAH data not found</span> for one or both ZIP codes.
          OCONUS duty stations, military APO/FPO addresses, and some territories are not in the BAH
          dataset. This calculator is designed for CONUS duty stations only.
        </div>
      )}
    </div>
  );
}
