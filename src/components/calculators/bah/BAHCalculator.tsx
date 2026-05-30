'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { fireCalculatorEvent } from '@/lib/analytics';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { useBahLookup, type BahLookupData } from '@/components/calculators/shared/useBahLookup';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { ENLISTED_GRADES, WARRANT_GRADES, OFFICER_GRADES, PRIOR_ENLISTED_OFFICER_GRADES, RANK_DISPLAY } from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';
import { StationPageCard } from '@/components/calculators/shared/StationPageCard';

// BAH data resolves via /api/bah/lookup (cached, server-side) — this calculator
// no longer ships the ~166KB dataset. Returned values are identical to the
// former client-side lookupBAH / getMHARates.
const DATA_YEAR = '2026';

// ─── Grade select options ──────────────────────────────────────────────────

const GRADE_GROUPS = [
  {
    label: 'Enlisted',
    options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Warrant Officer',
    options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Officer',
    options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Officer (Prior Enlisted)',
    options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
];

// ─── All display grades for the rate table (no O-8/9/10 duplicates) ───────

const ALL_DISPLAY_GRADES: PayGrade[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  'O-1E', 'O-2E', 'O-3E',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7',
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function diffLabel(diff: number) {
  if (diff === 0) return 'No difference';
  return (diff > 0 ? '+' : '') + fmt(diff) + '/mo';
}

/** O-8/O-9/O-10 share the O-7 BAH rate; the dataset only carries the O-7 key. */
function bahGrade(grade: PayGrade): string {
  return grade === 'O-8' || grade === 'O-9' || grade === 'O-10' ? 'O-7' : grade;
}

interface DerivedResult {
  monthlyRate: number;
  locationName: string;
  mhaCode: string;
}

/** Derive the rate for a grade + dependency status from a resolved lookup. */
function deriveResult(
  data: BahLookupData | null,
  grade: PayGrade,
  hasDependents: boolean,
): DerivedResult | null {
  if (!data || !data.valid || data.territory || !data.mha) return null;
  const rates = hasDependents ? data.ratesW : data.ratesWO;
  if (!rates) return null;
  const rate = rates[bahGrade(grade)];
  if (rate === undefined) return null;
  return { monthlyRate: rate, locationName: data.locationName ?? '', mhaCode: data.mha };
}

/** Error/feedback message for a resolved ZIP (null while still typing/loading). */
function zipErrorFor(zip: string, data: BahLookupData | null): string | undefined {
  if (zip.length < 5) return undefined; // still typing
  if (!/^\d{5}$/.test(zip)) return 'Enter a valid 5-digit ZIP code';
  if (!data) return undefined; // still loading
  if (data.territory) return 'This ZIP is a U.S. territory — BAH does not apply (OHA area)';
  if (!data.valid) return 'ZIP code not found in BAH dataset';
  return undefined;
}

// ─── Action steps logic ────────────────────────────────────────────────────

function buildActionSteps(
  monthlyRate: number,
  hasDependents: boolean,
  locationName: string,
): ActionStep[] {
  const steps: ActionStep[] = [];

  // VA loan nudge — always relevant for housing
  steps.push({
    label: 'Your BAH can qualify you for a VA home loan',
    description: `At ${fmt(monthlyRate)}/month, your BAH often covers or exceeds a mortgage payment in many markets. VA loans require $0 down payment and no PMI.`,
    priority: 'high',
  });

  // Dependent rate nudge if viewing without-dependent rate
  if (!hasDependents) {
    steps.push({
      label: 'Check the dependent rate',
      description: 'If you have dependents, your BAH rate is higher. Toggle "With Dependents" to see your actual entitlement.',
      priority: 'medium',
    });
  }

  // Rate protection note
  steps.push({
    label: 'Understand rate protection',
    description: `BAH rates in ${locationName} are protected — if the rate drops in a future year, you keep your current rate as long as your dependency status and duty station don't change.`,
    priority: 'low',
  });

  return steps;
}

// ─── Single location result panel ─────────────────────────────────────────

interface LocationResultProps {
  zip: string;
  result: DerivedResult | null;
  loading: boolean;
  errorMsg?: string;
  hasDependents: boolean;
  label?: string;
  compact?: boolean;
}

function LocationResult({ zip, result, loading, errorMsg, hasDependents, label, compact }: LocationResultProps) {
  if (zip.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
        Enter a ZIP code to see BAH rates
      </div>
    );
  }

  if (zip.length < 5) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
        {5 - zip.length} more digit{5 - zip.length !== 1 ? 's' : ''}…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-400 text-sm animate-pulse">
        Looking up rates…
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="flex items-center justify-center h-24 text-zinc-500 text-sm text-center px-4">
        {errorMsg ?? 'Rate not available for this ZIP'}
      </div>
    );
  }

  const annualRate = result.monthlyRate * 12;

  return (
    <div>
      {label && (
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{label}</p>
      )}
      <p className="text-xs text-zinc-500 mb-1">{result.locationName} ({result.mhaCode})</p>
      <p className="text-4xl font-bold text-zinc-900 tabular-nums leading-none">
        {fmt(result.monthlyRate)}
        <span className="text-base font-normal text-zinc-500 ml-1">/mo</span>
      </p>
      {!compact && (
        <p className="text-sm text-zinc-500 mt-1 tabular-nums">{fmt(annualRate)}/year</p>
      )}
      <p className="text-xs text-zinc-400 mt-1">Based on {DATA_YEAR} rates · {hasDependents ? 'With' : 'Without'} dependents</p>
    </div>
  );
}

// ─── Grade rate table ──────────────────────────────────────────────────────

interface GradeRateTableProps {
  rates: Record<string, number>;
  highlightGrade: PayGrade;
}

function GradeRateTable({ rates, highlightGrade }: GradeRateTableProps) {
  // Normalize highlight grade: O-8/9/10 → O-7
  const displayHighlight =
    highlightGrade === 'O-8' || highlightGrade === 'O-9' || highlightGrade === 'O-10'
      ? 'O-7'
      : highlightGrade;

  return (
    <div>
      <h3 className="font-semibold text-zinc-900 text-base mb-3">All rates at this location</h3>
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-3 py-2 font-medium text-zinc-600">Grade</th>
              <th className="text-right px-3 py-2 font-medium text-zinc-600">Monthly</th>
              <th className="text-right px-3 py-2 font-medium text-zinc-600">Annual</th>
            </tr>
          </thead>
          <tbody>
            {ALL_DISPLAY_GRADES.map((g) => {
              const rate = rates[g];
              if (rate === undefined) return null;
              const isHighlighted = g === displayHighlight;
              return (
                <tr
                  key={g}
                  className={[
                    'border-t border-zinc-100',
                    isHighlighted ? 'bg-red-50' : 'hover:bg-zinc-50',
                  ].join(' ')}
                >
                  <td className={['px-3 py-1.5 font-mono', isHighlighted ? 'font-bold text-red-700' : 'text-zinc-700'].join(' ')}>
                    {g}
                    {isHighlighted && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-sans font-medium">
                        you
                      </span>
                    )}
                  </td>
                  <td className={['px-3 py-1.5 text-right tabular-nums', isHighlighted ? 'font-bold text-red-700' : 'text-zinc-800'].join(' ')}>
                    {fmt(rate)}
                  </td>
                  <td className={['px-3 py-1.5 text-right tabular-nums text-zinc-500', isHighlighted ? 'font-semibold text-red-600' : ''].join(' ')}>
                    {fmt(rate * 12)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        O-8, O-9, O-10 rates are identical to O-7 per DoD policy and are not shown separately.
        Prior-enlisted officer rates (O-1E, O-2E, O-3E) reflect their distinct BAH entitlement.
      </p>
    </div>
  );
}

// ─── Main Calculator ────────────────────────────────────────────────────────

export function BAHCalculator() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [zip, setZip] = useState('');
  const [zipB, setZipB] = useState('');
  const [grade, setGrade] = useState<PayGrade>('E-5');
  const [hasDependents, setHasDependents] = useState(false);

  // Server-side resolution (cached) — one fetch per ZIP, derived per grade/dep.
  const lookupA = useBahLookup(zip);
  const lookupB = useBahLookup(zipB);

  const result = useMemo(
    () => deriveResult(lookupA.data, grade, hasDependents),
    [lookupA.data, grade, hasDependents],
  );
  const resultB = useMemo(
    () => deriveResult(lookupB.data, grade, hasDependents),
    [lookupB.data, grade, hasDependents],
  );

  const errA = zipErrorFor(zip, lookupA.data);
  const errB = zipErrorFor(zipB, lookupB.data);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!result) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('bah'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [result]);

  // Rate table (single mode) — rates already reflect dependency status.
  const mhaCode = lookupA.data?.valid && !lookupA.data.territory ? lookupA.data.mha : null;
  const rateTableRates = useMemo(() => {
    const d = lookupA.data;
    if (!d || !d.valid || d.territory) return null;
    return hasDependents ? d.ratesW : d.ratesWO;
  }, [lookupA.data, hasDependents]);

  // Station pages for guide links — resolved server-side (no client zipToMha).
  const stationPagesSingle = useMemo(() => lookupA.data?.stationPages ?? [], [lookupA.data]);
  const stationPagesB = useMemo(() => {
    const slugsA = new Set(stationPagesSingle.map((p) => p.slug));
    return (lookupB.data?.stationPages ?? []).filter((p) => !slugsA.has(p.slug));
  }, [lookupB.data, stationPagesSingle]);

  // Action steps
  const actionSteps = useMemo(() => {
    if (!result) return [];
    return buildActionSteps(result.monthlyRate, hasDependents, result.locationName);
  }, [result, hasDependents]);

  // Compare difference
  const diff = result && resultB ? result.monthlyRate - resultB.monthlyRate : null;

  // Pre-populate from URL params on mount (the hook fetches when zip is set).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gz = parseZip(params.get('zip'));
    const gzb = parseZip(params.get('zipb'));
    const gr = parseGrade(params.get('rank'));
    const dep = parseBool(params.get('dependents'));
    const m = params.get('mode');
    if (gz) setZip(gz);
    if (gzb) setZipB(gzb);
    if (gr) setGrade(gr);
    if (dep !== null) setHasDependents(dep);
    if (m === 'single' || m === 'compare') setMode(m);
  }, []);

  function getShareUrl() {
    const p = new URLSearchParams();
    if (zip) p.set('zip', zip);
    p.set('rank', gradeToParam(grade));
    p.set('dependents', hasDependents ? 'yes' : 'no');
    if (mode === 'compare') {
      p.set('mode', 'compare');
      if (zipB) p.set('zipb', zipB);
    }
    return `${window.location.origin}/calculators/bah?${p.toString()}`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Inputs ────────────────────────────────────────────────────── */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Grade */}
          <div>
            <Select
              label="Pay Grade"
              groups={GRADE_GROUPS}
              value={grade}
              onChange={(e) => setGrade(e.target.value as PayGrade)}
            />
            <p className="text-xs text-zinc-400 mt-1">O-7 through O-10 receive the same BAH rate per DoD policy.</p>
          </div>

          {/* Dependency status */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Dependency Status</label>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px]">
              <button
                type="button"
                onClick={() => setHasDependents(false)}
                className={[
                  'flex-1 text-sm font-medium transition-colors',
                  !hasDependents
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Without
              </button>
              <button
                type="button"
                onClick={() => setHasDependents(true)}
                className={[
                  'flex-1 text-sm font-medium transition-colors border-l border-zinc-300',
                  hasDependents
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                With Dependents
              </button>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Mode</label>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px]">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={[
                  'flex-1 text-sm font-medium transition-colors',
                  mode === 'single'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode('compare')}
                className={[
                  'flex-1 text-sm font-medium transition-colors border-l border-zinc-300',
                  mode === 'compare'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Compare
              </button>
            </div>
          </div>
        </div>

        {/* ZIP / base name inputs */}
        {mode === 'single' ? (
          <div className="mt-4 max-w-sm">
            <BaseSearchInput
              label="Duty Station"
              value={zip}
              onZipChange={setZip}
              placeholder="Try 'Fort Bragg', 'San Diego', or '28310'"
              hint="We'll match your ZIP or installation to the correct BAH area."
            />
            <p className="mt-1.5 text-[11px] text-zinc-400 leading-snug">
              ZIP codes map to Military Housing Areas (MHAs). Multiple ZIP codes may share the same BAH rate.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSearchInput
              label="Current / Origin"
              value={zip}
              onZipChange={setZip}
            />
            <BaseSearchInput
              label="Gaining / Destination"
              value={zipB}
              onZipChange={setZipB}
            />
          </div>
        )}
      </Card>

      {/* ── Results ───────────────────────────────────────────────────── */}
      {mode === 'single' ? (
        <>
          {/* Primary result */}
          <Card variant="result">
            <LocationResult zip={zip} result={result} loading={lookupA.loading} errorMsg={errA} hasDependents={hasDependents} />
          </Card>

          {/* Station guide link */}
          {result && (
            <StationPageCard
              pages={stationPagesSingle}
              linkSuffix={`?rank=${grade}&dep=${hasDependents ? 'yes' : 'no'}`}
            />
          )}

          {result && (
            <SaveOrShareResults
              pageName="bah"
              headline="Save or share your BAH estimate"
              supportingText="Useful for comparing housing budgets, talking with a spouse or roommate, or reviewing your expected allowance before signing a lease."
              usefulFor={['Housing budget', 'Lease planning', 'Spouse or roommate']}
              getUrl={getShareUrl}
              shareTitle="My BAH estimate"
              shareText="Here's my BAH estimate from MilPayTools."
            />
          )}

          {/* Rate table */}
          {mhaCode && rateTableRates && (
            <Card>
              <GradeRateTable rates={rateTableRates} highlightGrade={grade} />
            </Card>
          )}

          {/* Action steps */}
          {result && actionSteps.length > 0 && (
            <Card>
              <ActSteps steps={actionSteps} title="What to do with this number" />
            </Card>
          )}

        </>
      ) : (
        <>
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="result">
              <LocationResult zip={zip} result={result} loading={lookupA.loading} errorMsg={errA} hasDependents={hasDependents} label="Origin" />
            </Card>
            <Card variant="result">
              <LocationResult zip={zipB} result={resultB} loading={lookupB.loading} errorMsg={errB} hasDependents={hasDependents} label="Destination" />
            </Card>
          </div>

          {/* Difference callout */}
          {diff !== null && (
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-600 font-medium">Monthly BAH difference</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {diff > 0
                      ? 'Your BAH decreases at the destination'
                      : diff < 0
                      ? 'Your BAH increases at the destination'
                      : 'Identical BAH rates at both locations'}
                  </p>
                </div>
                <div className={[
                  'text-2xl font-bold tabular-nums',
                  diff > 0 ? 'text-red-700' : diff < 0 ? 'text-green-700' : 'text-zinc-500',
                ].join(' ')}>
                  {diffLabel(Math.abs(diff))}
                  {diff !== 0 && (
                    <span className="text-sm font-normal text-zinc-400 ml-1">
                      ({fmt(Math.abs(diff) * 12)}/yr)
                    </span>
                  )}
                </div>
              </div>
              {diff !== 0 && (
                <p className="text-xs text-zinc-500 mt-3 border-t border-zinc-100 pt-3">
                  {diff > 0
                    ? `Your BAH drops by ${fmt(diff)}/month at the destination. If you currently live below your BAH, that buffer shrinks. Factor this into your PCS housing budget.`
                    : `Your BAH increases by ${fmt(Math.abs(diff))}/month at the destination. That's an extra ${fmt(Math.abs(diff) * 12)}/year in tax-free housing allowance — a meaningful improvement in your total compensation.`}
                </p>
              )}
            </Card>
          )}

          {/* Station guide links — compare mode */}
          {(stationPagesSingle.length > 0 || stationPagesB.length > 0) && (
            <div className="space-y-2">
              <StationPageCard
                pages={stationPagesSingle}
                linkSuffix={`?rank=${grade}&dep=${hasDependents ? 'yes' : 'no'}`}
              />
              <StationPageCard
                pages={stationPagesB}
                linkSuffix={`?rank=${grade}&dep=${hasDependents ? 'yes' : 'no'}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
