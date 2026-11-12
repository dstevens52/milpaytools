'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { compareLocations, validStateCode } from '@/lib/calculations/compare';
import { fireCalculatorEvent } from '@/lib/analytics';
import type { CompareResult, LocationData } from '@/lib/calculations/compare';
import type { PayGrade } from '@/types/military';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { useBahLookup, rateFor } from '@/components/calculators/shared/useBahLookup';
import { StationPageCard } from '@/components/calculators/shared/StationPageCard';
import { COLA_SOURCE, DATA_YEAR as COLA_YEAR } from '@/data/cola/2026/constants';
import { STATE_TAX_DATA } from '@/data/compare/stateTax';

/** States for the legal-residence dropdown, sorted by name. */
const RESIDENCE_OPTIONS = Object.entries(STATE_TAX_DATA)
  .map(([code, info]) => ({ code, name: info.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

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
  sublabel?: React.ReactNode;
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
  const { verdict, afterTaxDiffMonthly, afterTaxDiffAnnual } = result;
  const absDiff = Math.abs(afterTaxDiffMonthly);
  const absAnnual = Math.abs(afterTaxDiffAnnual);

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
    subline = `Estimated difference after income taxes: less than ${fmt(result.similarThreshold)}/month`;
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
    subline = result.stateTaxIncluded
      ? `${fmt(absAnnual)} more per year after estimated federal and state income taxes`
      : `${fmt(absAnnual)} more per year after estimated federal income tax`;
    accentColor = 'border-green-400';
    icon = '$';
  }

  // State tax narrative (SCRA): a PCS alone doesn't change which state taxes military pay.
  const { locA, locB, stateTaxDiffAnnual } = result;
  let taxNarrative = 'Your state income tax doesn\'t change with a PCS move. Military pay is taxed by your state of legal residence (SCRA).';
  if (result.residenceChangeApplied && locB.taxStateInfo && locA.taxStateInfo) {
    const newState = locB.taxStateInfo.name;
    const oldState = locA.taxStateInfo.name;
    taxNarrative =
      Math.abs(stateTaxDiffAnnual) < 1
        ? `If you change your legal residence to ${newState}, estimated state income tax stays about the same as in ${oldState}.`
        : `If you change your legal residence to ${newState}, estimated state income tax would be ${fmt(Math.abs(stateTaxDiffAnnual))}/year ${stateTaxDiffAnnual < 0 ? 'lower' : 'higher'} than in ${oldState}.`;
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
          <p className="mt-2 text-sm text-blue-700 font-medium" data-testid="compare-tax-narrative">{taxNarrative}</p>
        </div>
      </div>
    </div>
  );
}

function stateTaxCell(loc: LocationData, included: boolean): string {
  if (!included || !loc.taxStateInfo) return '—';
  if (loc.taxStateInfo.noTax) return `No state tax (${loc.taxState})`;
  return `${fmt(loc.monthlyStateTax)}/mo (${loc.taxState} ${fmtRate(loc.taxStateInfo.rate)})`;
}

// ─── Location column header ────────────────────────────────────────────────────

function LocationHeader({ loc, label }: { loc: LocationData; label: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="font-semibold text-zinc-900 text-sm leading-tight mt-0.5">
        {loc.locationName}
      </p>
      {loc.stationState && (
        <p className="text-xs text-zinc-400">{loc.stationStateInfo?.name ?? loc.stationState}</p>
      )}
    </div>
  );
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function CompareCalculator() {
  const [payGrade, setPayGrade] = useState<PayGrade>('E-5');
  const [yos, setYos] = useState(8);
  const [hasDependents, setHasDependents] = useState(true);
  const [zipA, setZipA] = useState('28310');
  const [zipB, setZipB] = useState('98433');
  // State of legal residence (SCRA). null = "Not sure / don't include state tax".
  const [residenceState, setResidenceState] = useState<string | null>(null);
  const [changeResidence, setChangeResidence] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  // Pre-populate from URL params on mount
  // ?zip1=28310&zip2=98433&rank=E5&dependents=yes&yos=6
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const z1 = parseZip(params.get('zip1'));
    const z2 = parseZip(params.get('zip2'));
    const gr = parseGrade(params.get('rank'));
    const dep = parseBool(params.get('dependents'));
    const yosRaw = params.get('yos');
    // Optional state-tax inputs; anything unrecognized keeps the defaults.
    const residence = validStateCode(params.get('residence'));
    const change = parseBool(params.get('change'));
    if (residence) {
      setResidenceState(residence);
      setTaxOpen(true);
      if (change === true) setChangeResidence(true);
    }
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
    p.set('zip1', zipA);
    p.set('zip2', zipB);
    p.set('rank', gradeToParam(payGrade));
    p.set('dependents', hasDependents ? 'yes' : 'no');
    p.set('yos', String(yos));
    if (residenceState) {
      p.set('residence', residenceState);
      if (changeResidence) p.set('change', 'yes');
    }
    return `${window.location.origin}/calculators/compare?${p.toString()}`;
  }

  const bothReady = zipA.length === 5 && zipB.length === 5;

  // Both locations resolved server-side via the cached route (parallel fetches).
  const { data: dataA } = useBahLookup(zipA);
  const { data: dataB } = useBahLookup(zipB);
  const bahA = useMemo(() => {
    const r = rateFor(dataA, payGrade, hasDependents);
    return { monthlyBAH: r ?? 0, locationName: dataA?.locationName ?? zipA, bahFound: r !== null, mha: dataA?.mha ?? null };
  }, [dataA, payGrade, hasDependents, zipA]);
  const bahB = useMemo(() => {
    const r = rateFor(dataB, payGrade, hasDependents);
    return { monthlyBAH: r ?? 0, locationName: dataB?.locationName ?? zipB, bahFound: r !== null, mha: dataB?.mha ?? null };
  }, [dataB, payGrade, hasDependents, zipB]);

  const result = useMemo(() => {
    if (!bothReady || !dataA || !dataB) return null;
    return compareLocations({
      payGrade,
      yearsOfService: yos,
      hasDependents,
      zipA,
      zipB,
      bahA,
      bahB,
      residenceState,
      changeResidenceToB: changeResidence,
    });
  }, [payGrade, yos, hasDependents, zipA, zipB, bothReady, dataA, dataB, bahA, bahB, residenceState, changeResidence]);

  // Station pages resolved server-side (no client zipToMha).
  const stationPagesA = useMemo(
    () => (bothReady ? (dataA?.stationPages ?? []) : []),
    [dataA, bothReady]
  );
  const stationPagesB = useMemo(() => {
    if (!bothReady) return [];
    const slugsA = new Set(stationPagesA.map((p) => p.slug));
    return (dataB?.stationPages ?? []).filter((p) => !slugsA.has(p.slug));
  }, [dataB, bothReady, stationPagesA]);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!result) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('compare'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [result]);

  // Display names for each location
  const nameA = result?.locA.locationName || `ZIP ${zipA}`;
  const nameB = result?.locB.locationName || `ZIP ${zipB}`;

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

        {/* State of legal residence (optional, collapsed) */}
        <details
          className="mb-6 rounded-md border border-zinc-200 px-4 py-3"
          open={taxOpen}
          onToggle={(e) => setTaxOpen((e.currentTarget as HTMLDetailsElement).open)}
          data-testid="compare-residence"
        >
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">
            State income tax (optional)
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="residence-state" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Your state of legal residence (for taxes)
              </label>
              <select
                id="residence-state"
                value={residenceState ?? ''}
                onChange={(e) => {
                  const v = validStateCode(e.target.value);
                  setResidenceState(v);
                  if (!v) setChangeResidence(false);
                }}
                className="w-full sm:w-80 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Not sure / don&apos;t include state tax</option>
                {RESIDENCE_OPTIONS.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                Applied to base pay at both stations — a PCS move doesn&apos;t change which state taxes military pay.
              </p>
            </div>
            {residenceState && (
              <div>
                <label className="flex items-start gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    id="change-residence"
                    checked={changeResidence}
                    onChange={(e) => setChangeResidence(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I plan to change my legal residence to the new duty station&apos;s state.</span>
                </label>
                <p className="text-xs text-zinc-500 mt-1 ml-6">
                  Changing your state of legal residence is a personal legal decision with requirements; this only shows the tax effect.
                </p>
              </div>
            )}
          </div>
        </details>

        {/* Location inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Current Station */}
          <div className="rounded-md border border-zinc-200 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Current Station</p>
            <BaseSearchInput
              label="Base or duty station"
              value={zipA}
              onZipChange={setZipA}
              placeholder="Try Fort Bragg, San Diego, or 98433"
              initialText="Fort Bragg"
            />
          </div>

          {/* New Station */}
          <div className="rounded-md border border-zinc-200 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">New Station</p>
            <BaseSearchInput
              label="Base or duty station"
              value={zipB}
              onZipChange={setZipB}
              placeholder="Try JBLM, Fort Hood, or 28310"
              initialText="JBLM"
            />
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
        <div className="space-y-6" data-testid="compare-results">
          {/* Summary */}
          <SummaryCard result={result} nameA={nameA} nameB={nameB} />

          <SaveOrShareResults
            pageName="compare"
            headline="Save or share your PCS move comparison"
            supportingText="Useful for comparing your current and new station before finalizing a PCS decision, or discussing options with family."
            usefulFor={['PCS move comparison', 'PCS decision', 'Family discussion']}
            getUrl={getShareUrl}
            shareTitle="My PCS move comparison"
            shareText="Here's my PCS move pay comparison from MilPayTools."
          />

          {/* Station housing guide links */}
          {(stationPagesA.length > 0 || stationPagesB.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Full Housing Guides
              </p>
              <StationPageCard
                pages={stationPagesA}
                linkSuffix={`?rank=${payGrade}&dep=${hasDependents ? 'yes' : 'no'}`}
              />
              <StationPageCard
                pages={stationPagesB}
                linkSuffix={`?rank=${payGrade}&dep=${hasDependents ? 'yes' : 'no'}`}
              />
            </div>
          )}

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

            {/* Row: Gross Monthly (divider row) */}
            <CompareRow
              label="Gross monthly"
              sublabel="Before taxes"
              valA={`${fmt(result.locA.grossMonthly)}/mo`}
              valB={`${fmt(result.locB.grossMonthly)}/mo`}
              badge={<DiffBadge diff={result.grossDiffMonthly} />}
              highlight
            />

            {/* Row: Federal income tax (same base pay at both stations) */}
            <CompareRow
              label="Est. federal income tax"
              sublabel="Federal tax estimated as a single filer"
              valA={`${fmt(result.locA.monthlyFederalTax)}/mo`}
              valB={`${fmt(result.locB.monthlyFederalTax)}/mo`}
              badge={<DiffBadge diff={result.federalTaxDiffAnnual / 12} invert suffix="/mo" />}
            />

            {/* Row: State income tax — state of legal residence (SCRA), not the duty station */}
            <CompareRow
              label="Est. state income tax"
              sublabel={result.stateTaxIncluded ? 'State of legal residence · on base pay' : 'Not included — add your state of legal residence above'}
              valA={stateTaxCell(result.locA, result.stateTaxIncluded)}
              valB={stateTaxCell(result.locB, result.stateTaxIncluded)}
              badge={
                // Higher state tax at B = bad for B (invert)
                <DiffBadge diff={result.stateTaxDiffAnnual / 12} invert suffix="/mo" />
              }
            />
            {result.stateTaxIncluded && (
              <p className="text-xs text-zinc-400 py-1" data-testid="compare-state-exemption-note">
                Some states exempt or partly exempt military pay; this estimate uses the state&apos;s general income tax rate.
              </p>
            )}

            {/* Row: After income taxes */}
            <CompareRow
              label="After income taxes"
              sublabel="Before Social Security and Medicare"
              valA={`${fmt(result.locA.monthlyAfterIncomeTax)}/mo`}
              valB={`${fmt(result.locB.monthlyAfterIncomeTax)}/mo`}
              badge={<DiffBadge diff={result.afterTaxDiffMonthly} />}
              highlight
            />
            <p className="text-xs text-zinc-400 pt-2" data-testid="compare-fica-note">
              After-tax figures subtract estimated federal{result.stateTaxIncluded ? ' and state' : ''} income tax only — Social Security and Medicare are not deducted.
            </p>

            {/* CONUS COLA: eligibility + official index only — never in the totals above */}
            <div className="pt-4 mt-1" data-testid="compare-cola-note">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">CONUS COLA</p>
              <ul className="space-y-1.5">
                {([[nameA, result.locA], [nameB, result.locB]] as const).map(([name, loc], i) => (
                  <li key={i} className="text-sm text-zinc-600" data-testid={i === 0 ? 'compare-cola-a' : 'compare-cola-b'}>
                    <span className="font-medium text-zinc-800">{name}:</span>{' '}
                    {loc.cola ? (
                      <>
                        {COLA_YEAR} CONUS COLA area: {loc.cola.index}% index — not included in totals (
                        <a
                          href={COLA_SOURCE.rateLookupUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-blue-700 underline hover:text-blue-800"
                        >
                          DTMO rate lookup
                        </a>
                        )
                      </>
                    ) : (
                      <>Not a {COLA_YEAR} CONUS COLA area</>
                    )}
                  </li>
                ))}
              </ul>
            </div>
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
                { label: 'After-tax difference/yr', val: result.afterTaxDiffAnnual },
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
            <p className="font-semibold mb-1">How state income tax is handled</p>
            <p className="mb-2">
              Under the Servicemembers Civil Relief Act (SCRA), military pay is taxed by your
              state of legal residence, not by the state you&apos;re stationed in, so a PCS move by
              itself doesn&apos;t change your state income tax. This comparison applies the same state
              treatment at both stations: the state you choose above, or no state tax if you
              don&apos;t choose one. Station B uses its own state&apos;s rate only if you check that you
              plan to change your legal residence.
            </p>
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
                  desc: 'Estimate DLA, MALT mileage, per diem, and PPM net proceeds for your move.',
                },
                {
                  href: '/calculators/total-compensation',
                  icon: '💰',
                  title: 'Total Compensation',
                  desc: 'Full breakdown of base pay, allowances, tax advantages, and TSP.',
                },
                {
                  href: '/bah',
                  icon: '🏠',
                  title: 'BAH Calculator',
                  desc: 'Look up BAH for any ZIP code and compare stations for your PCS move.',
                },
              ].map(({ href, icon, title, desc }) => (
                <a
                  key={href}
                  href={href}
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
        </div>
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
