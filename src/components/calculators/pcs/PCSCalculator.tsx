'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fireCalculatorEvent } from '@/lib/analytics';
import { useUserInputGate } from '@/components/calculators/shared/useUserInputGate';
import { Card } from '@/components/ui/Card';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { useBahLookup } from '@/components/calculators/shared/useBahLookup';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { StationPageCard } from '@/components/calculators/shared/StationPageCard';
import { STATION_COORDINATES } from '@/data/duty-stations/coordinates';
import { INSTALLATIONS_LOOKUP } from '@/data/installations-lookup';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';
import { calculatePCS, getWeightAllowance } from '@/lib/calculations/pcs';
import type { PCSMoveType, PCSInput, PCSOutput, TLERoute } from '@/lib/calculations/pcs';
import { PCS_RATES_2026, PCS_PPM_SOURCE_URL } from '@/data/pcs/2026/constants';
import { PCS_PER_DIEM_RATE } from '@/data/pcs/conusPerDiem';
import type { SearchResult } from '@/lib/stationSearch';
import { parseBool, parseGrade, gradeToParam } from '@/lib/urlParams';
import { readUrlParams } from '@/data/calculatorUrlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { publishedOconusV2ForName } from '@/data/oconus';
import { isMilitaryMailZip } from '@/lib/militaryMailZip';
import {
  PCS_OVERSEAS_DLA_LABEL,
  PCS_OVERSEAS_DLA_NOTE,
  PCS_OVERSEAS_HEADING,
  PCS_OVERSEAS_INTRO,
  PCS_OVERSEAS_POINTS,
  PCS_OVERSEAS_RESOURCES_HEADING,
  PCS_OVERSEAS_LINKS,
  PCS_OVERSEAS_GUIDE_LINK,
} from '@/data/pcs/oconusPanel';

// ─── Formatters ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtDecimals(n: number, decimals = 2): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Grade groups for select ──────────────────────────────────────────────────

const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officer', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officer', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  {
    label: 'Officer (prior enlisted)',
    options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
];

/** Every grade the rank select offers — ?rank= must be one of these. */
const PCS_GRADES: ReadonlySet<string> = new Set(GRADE_GROUPS.flatMap((g) => g.options.map((o) => o.value)));

const R = PCS_RATES_2026;
const PER_DIEM_DAILY = PCS_PER_DIEM_RATE.lodging + PCS_PER_DIEM_RATE.mie;
const PER_DIEM_LABEL = `${PCS_PER_DIEM_RATE.fiscalYear} standard CONUS rate`;
const MAX_DEPS = 10;
const NEEDS_INPUT_TEXT = 'Enter your old and new duty stations to see your estimate';

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// ─── Move type config ─────────────────────────────────────────────────────────

const MOVE_TYPES: { value: PCSMoveType; label: string; description: string }[] = [
  {
    value: 'gov',
    label: 'Government Move',
    description: 'Government contracts a moving company. No PPM incentive, but no hassle.',
  },
  {
    value: 'full-ppm',
    label: 'Full PPM / DITY',
    description: `You move everything yourself. The incentive is ${pct(R.ppmIncentivePercentOfGcc)} of what the government would have paid to move the same weight the same distance.`,
  },
  {
    value: 'partial-ppm',
    label: 'Partial PPM',
    description: 'Government ships most items; you self-move a portion and get a PPM incentive for that weight.',
  },
];

// ─── Distance helpers ─────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Returns coordinates for a ZIP by checking DUTY_STATIONS (slug-keyed) then INSTALLATIONS_LOOKUP (lat/lon inline).
function getCoordinatesForZip(zip: string): { lat: number; lon: number } | null {
  if (!zip) return null;
  const station = DUTY_STATIONS.find((s) => s.zip === zip);
  if (station) {
    const coords = STATION_COORDINATES[station.slug];
    if (coords) return coords;
  }
  const inst = INSTALLATIONS_LOOKUP.find((i) => i.zip === zip);
  if (inst && inst.lat !== undefined && inst.lon !== undefined) {
    return { lat: inst.lat, lon: inst.lon };
  }
  return null;
}

// ─── Route classification ─────────────────────────────────────────────────────

type RouteClass = 'conus' | 'ak-hi' | 'oconus';

function classifyZip(zip: string): RouteClass {
  if (!zip || zip.length < 3) return 'conus';
  const p3 = zip.slice(0, 3);
  if (p3 >= '995') return 'ak-hi'; // Alaska (995–999)
  if (p3 === '967' || p3 === '968') return 'ak-hi'; // Hawaii
  if (isMilitaryMailZip(zip)) return 'oconus'; // APO AE (09), AP (962–966), AA (340)
  return 'conus';
}

function classifyEndpoint(
  zip: string,
  meta: { state: string; oconus?: boolean } | null,
): RouteClass {
  if (meta) {
    if (meta.oconus) return 'oconus';
    if (meta.state === 'AK' || meta.state === 'HI') return 'ak-hi';
    return 'conus';
  }
  const ds = zip ? DUTY_STATIONS.find((s) => s.zip === zip) : null;
  if (ds) {
    if (ds.oconus) return 'oconus';
    if (ds.state === 'AK' || ds.state === 'HI') return 'ak-hi';
    return 'conus';
  }
  const il = zip ? INSTALLATIONS_LOOKUP.find((i) => i.zip === zip && i.zip !== '') : null;
  if (il) {
    if (il.oconus) return 'oconus';
    if (il.state === 'AK' || il.state === 'HI') return 'ak-hi';
    return 'conus';
  }
  return classifyZip(zip);
}

function getRouteType(a: RouteClass, b: RouteClass): RouteClass {
  if (a === 'oconus' || b === 'oconus') return 'oconus';
  if (a === 'ak-hi' || b === 'ak-hi') return 'ak-hi';
  return 'conus';
}

// ─── Action step builder ──────────────────────────────────────────────────────

function buildActionSteps(input: PCSInput, output: PCSOutput): ActionStep[] {
  const steps: ActionStep[] = [];
  const isPPM = input.moveType !== 'gov';
  const rankLabel = RANK_DISPLAY[input.rank as PayGrade] ?? input.rank;

  if (isPPM) {
    steps.push({
      label: 'Get your official PPM estimate',
      description: `Your PPM incentive is ${pct(R.ppmIncentivePercentOfGcc)} of the Government Constructed Cost for your weight and distance, computed for your move. Get the estimate in your move system (MilMove or DPS) or from your transportation office before you rent a truck. You can request an advance of up to ${pct(R.ppmAdvancePercent)} of the incentive.`,
      priority: 'high',
    });
  }

  if (!isPPM) {
    steps.push({
      label: 'Consider a partial PPM',
      description: `Government moves ship most items for free — but if you move any portion yourself, you receive a PPM incentive for that weight. Your ${rankLabel} weight allowance is ${output.weightAllowance.toLocaleString('en-US')} lbs.`,
      priority: 'medium',
    });
  }

  steps.push({
    label: 'Check your BAH at the gaining station',
    description: `Your housing allowance changes with every PCS. Look up the ${rankLabel} ${input.hasDependents ? 'with' : 'without'} dependents BAH rate at your new duty station ZIP code before making housing decisions.`,
    href: '/bah',
    priority: 'high',
  });

  steps.push({
    label: 'Buying at your new duty station instead of renting?',
    description: `VA loans require no down payment and no PMI — your BAH can cover the mortgage while you build equity instead of paying rent.`,
    priority: 'medium',
  });

  steps.push({
    label: 'Recalculate total compensation at new duty station',
    description: `A new duty station changes your BAH, potentially your base pay (promotion timing), and your overall compensation picture. Run the full comparison before accepting off-post housing.`,
    href: '/calculators/total-compensation',
    priority: 'low',
  });

  return steps;
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700 mb-1">
      {children}
    </label>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
      {children}
    </p>
  );
}

function EntitlementRow({
  label,
  value,
  sub,
  highlight,
  dim,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={[
        'flex items-baseline justify-between gap-3 py-2',
        highlight ? 'border-t-2 border-red-700 mt-1 pt-3' : 'border-t border-zinc-100',
      ].join(' ')}
    >
      <div className="min-w-0">
        <span
          className={[
            'text-sm',
            highlight ? 'font-semibold text-red-700' : dim ? 'text-zinc-400' : 'text-zinc-700',
          ].join(' ')}
        >
          {label}
        </span>
        {sub && <p className="text-xs text-zinc-400 leading-tight mt-0.5">{sub}</p>}
      </div>
      <span
        className={[
          'font-mono tabular-nums text-right flex-none',
          highlight ? 'font-bold text-red-700 text-base' : dim ? 'text-zinc-400' : 'text-zinc-800',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PCSCalculator() {
  // Inputs
  const [rank, setRank] = useState<string>('E-5');
  const [hasDependents, setHasDependents] = useState(true);
  const [depsAge12Plus, setDepsAge12Plus] = useState(1);
  const [depsUnder12, setDepsUnder12] = useState(0);
  const [moveType, setMoveType] = useState<PCSMoveType>('gov');
  const [zipFrom, setZipFrom] = useState('');
  const [zipTo, setZipTo] = useState('');
  const [fromMeta, setFromMeta] = useState<{ state: string; oconus?: boolean } | null>(null);
  const [toMeta, setToMeta] = useState<{ state: string; oconus?: boolean; name?: string } | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  // True once a mileage has been typed or loaded from a link (0 then means a local move).
  const [milesEntered, setMilesEntered] = useState(false);
  const [manualMiles, setManualMiles] = useState(0);
  const [numPOVs, setNumPOVs] = useState<1 | 2>(1);
  const [hhgWeight, setHhgWeight] = useState(5000);
  const [tleOldDays, setTleOldDays] = useState(0);
  const [tleNewDays, setTleNewDays] = useState(0);

  const weightAllowance = useMemo(() => getWeightAllowance(rank, hasDependents), [rank, hasDependents]);

  // Station lookup via MHA — matches station ZIPs and any ZIP variant in the same housing area
  // Station-page links — resolved server-side (no client zipToMha).
  const { data: bahDataTo } = useBahLookup(zipTo);
  const stationPagesTo = bahDataTo?.stationPages ?? [];

  const routeType = useMemo((): RouteClass => {
    const fromClass = zipFrom || fromMeta ? classifyEndpoint(zipFrom, fromMeta) : null;
    const toClass = zipTo || toMeta ? classifyEndpoint(zipTo, toMeta) : null;
    // One overseas end is enough for overseas mode — stateside math is wrong
    // for an overseas move even before the other end is entered.
    if (fromClass === 'oconus' || toClass === 'oconus') return 'oconus';
    if (!fromClass || !toClass) return 'conus';
    return getRouteType(fromClass, toClass);
  }, [zipFrom, zipTo, fromMeta, toMeta]);

  // TLE: 21 days for a new PDS in CONUS; 7 days when moving from CONUS to Alaska or Hawaii
  // (OCONUS under the JTR). Overseas mode shows no TLE at all.
  const tleRoute = useMemo((): TLERoute => {
    const fromClass = zipFrom || fromMeta ? classifyEndpoint(zipFrom, fromMeta) : null;
    const toClass = zipTo || toMeta ? classifyEndpoint(zipTo, toMeta) : null;
    return toClass === 'ak-hi' && fromClass !== 'ak-hi' ? 'conus-to-oconus' : 'conus';
  }, [zipFrom, zipTo, fromMeta, toMeta]);
  const tleMaxDays = tleRoute === 'conus-to-oconus' ? R.tle.maxDaysConusToOconus : R.tle.maxDaysConus;

  // Overseas mode: show DLA only plus an explanation panel — no total.
  const isOverseas = routeType === 'oconus';
  const overseasGuide = toMeta?.name ? publishedOconusV2ForName(toMeta.name) : undefined;

  // Auto-distance via haversine × 1.25 road factor when both ZIPs resolve to coordinates.
  // Covers both DUTY_STATIONS (slug-keyed) and INSTALLATIONS_LOOKUP (inline lat/lon).
  const autoDistance = useMemo((): number | null => {
    if (!zipFrom || !zipTo) return null;
    const c1 = getCoordinatesForZip(zipFrom);
    const c2 = getCoordinatesForZip(zipTo);
    if (!c1 || !c2) return null;
    return Math.round(haversineDistance(c1.lat, c1.lon, c2.lat, c2.lon) * 1.25);
  }, [zipFrom, zipTo]);

  // Distance used in all calculations — OCONUS always uses manual entry (no auto estimate)
  const effectiveDistance = routeType === 'oconus'
    ? manualMiles
    : (showManualOverride || autoDistance === null) ? manualMiles : autoDistance;

  const input: PCSInput = useMemo(() => ({
    rank,
    hasDependents,
    depsAge12Plus: hasDependents ? depsAge12Plus : 0,
    depsUnder12: hasDependents ? depsUnder12 : 0,
    moveType,
    distance: Math.max(0, effectiveDistance),
    numPOVs,
    hhgWeight: Math.min(hhgWeight, weightAllowance),
    tleOldDays,
    tleNewDays,
    tleRoute,
  }), [rank, hasDependents, depsAge12Plus, depsUnder12, moveType, effectiveDistance, numPOVs, hhgWeight, weightAllowance, tleOldDays, tleNewDays, tleRoute]);

  const output: PCSOutput = useMemo(() => calculatePCS(input), [input]);
  const actionSteps = useMemo(() => buildActionSteps(input, output), [input, output]);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { attach: gaAttach, hasInteracted: gaInteracted } = useUserInputGate();
  useEffect(() => {
    if (!gaInteracted()) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('pcs'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [output, gaInteracted]);

  // Pre-populate from URL params on mount
  useEffect(() => {
    const p = readUrlParams('pcs', window.location.search);
    // Accepts both e5 (current share links) and E-5 (older share links); anything
    // else — including O-1E–O-3E — leaves the default rank in place.
    const r = parseGrade(p.get('rank'));
    const dep = parseBool(p.get('dep'));
    const d12 = p.get('dep12');
    const du12 = p.get('depu12');
    const nd = p.get('numdep'); // older share links: one count, read as 12 or older
    const mt = p.get('movetype') as PCSMoveType | null;
    const from = p.get('from');
    const to = p.get('to');
    const miles = p.get('miles');
    const povs = p.get('povs');
    const hhg = p.get('hhg');
    const tleold = p.get('tleold');
    const tlenew = p.get('tlenew');
    const count = (raw: string | null): number | null => {
      if (!raw) return null;
      const n = parseInt(raw, 10);
      return !isNaN(n) && n >= 0 && n <= MAX_DEPS ? n : null;
    };
    const tleDaysParam = (raw: string | null): number | null => {
      if (!raw) return null;
      const n = parseInt(raw, 10);
      return !isNaN(n) && n >= 0 && n <= R.tle.maxDaysConus ? n : null;
    };

    if (r && PCS_GRADES.has(r)) setRank(r);
    if (dep !== null) setHasDependents(dep);
    if (d12 !== null || du12 !== null) {
      setDepsAge12Plus(count(d12) ?? 0);
      setDepsUnder12(count(du12) ?? 0);
    } else {
      const n = count(nd);
      if (n !== null) setDepsAge12Plus(n);
    }
    if (mt === 'gov' || mt === 'full-ppm' || mt === 'partial-ppm') setMoveType(mt);
    if (from) setZipFrom(from);
    if (to) setZipTo(to);
    if (miles) { const n = parseInt(miles, 10); if (!isNaN(n) && n >= 0) { setManualMiles(n); setShowManualOverride(true); setMilesEntered(true); } }
    if (povs === '2') setNumPOVs(2);
    if (hhg) { const n = parseInt(hhg, 10); if (!isNaN(n) && n > 0) setHhgWeight(n); }
    const tleOld = tleDaysParam(tleold);
    if (tleOld !== null) setTleOldDays(tleOld);
    const tleNew = tleDaysParam(tlenew);
    if (tleNew !== null) setTleNewDays(tleNew);
  }, []);

  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('rank', gradeToParam(rank as PayGrade));
    p.set('dep', hasDependents ? 'yes' : 'no');
    if (hasDependents) {
      p.set('dep12', String(depsAge12Plus));
      p.set('depu12', String(depsUnder12));
    }
    p.set('movetype', moveType);
    if (zipFrom) p.set('from', zipFrom);
    if (zipTo) p.set('to', zipTo);
    if (showManualOverride || autoDistance === null) p.set('miles', String(manualMiles));
    p.set('povs', String(numPOVs));
    if (moveType !== 'gov') p.set('hhg', String(hhgWeight));
    if (tleOldDays > 0) p.set('tleold', String(tleOldDays));
    if (tleNewDays > 0) p.set('tlenew', String(tleNewDays));
    return `${window.location.origin}/calculators/pcs?${p.toString()}`;
  }

  const isPPM = moveType !== 'gov';
  const tleDaysEntered = tleOldDays + tleNewDays;
  const weightExceedsAllowance = hhgWeight > weightAllowance;
  const depsTraveling = hasDependents ? depsAge12Plus + depsUnder12 : 0;
  const rankLabel = RANK_DISPLAY[rank as PayGrade] ?? rank;
  const weightRow = R.weightAllowance.rowFor[rank];
  const secondPovDropped = numPOVs === 2 && output.maltPOVs < 2;
  // No distance and no station pair with coordinates yet: show a prompt, never "$0".
  const needsInput = effectiveDistance === 0 && autoDistance === null && !milesEntered;

  return (
    <div ref={gaAttach} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card variant="default" className="p-5 space-y-6">

            {/* Service member */}
            <div>
              <SectionHeading>Service Member</SectionHeading>
              <div className="space-y-4">

                <div>
                  <Label htmlFor="rank">Rank</Label>
                  <select
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    {GRADE_GROUPS.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Dependency status</Label>
                  <div className="flex rounded-md border border-zinc-300 overflow-hidden">
                    {[
                      { val: true, label: 'With dependents' },
                      { val: false, label: 'Without dependents' },
                    ].map(({ val, label }) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setHasDependents(val)}
                        className={[
                          'flex-1 py-2 text-xs font-medium transition-colors',
                          hasDependents === val
                            ? 'bg-red-700 text-white'
                            : 'bg-white text-zinc-600 hover:bg-zinc-50',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasDependents && (
                  <div>
                    <p className="block text-sm font-medium text-zinc-700 mb-1">Dependents traveling with you</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="depsAge12Plus" className="block text-xs text-zinc-500 mb-1">Age 12 or older (incl. spouse)</label>
                        <input
                          id="depsAge12Plus"
                          type="number"
                          min={0}
                          max={MAX_DEPS}
                          value={depsAge12Plus}
                          onChange={(e) => setDepsAge12Plus(Math.max(0, Math.min(MAX_DEPS, parseInt(e.target.value) || 0)))}
                          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="depsUnder12" className="block text-xs text-zinc-500 mb-1">Under 12</label>
                        <input
                          id="depsUnder12"
                          type="number"
                          min={0}
                          max={MAX_DEPS}
                          value={depsUnder12}
                          onChange={(e) => setDepsUnder12(Math.max(0, Math.min(MAX_DEPS, parseInt(e.target.value) || 0)))}
                          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Sets per diem, TLE and second-vehicle mileage</p>
                  </div>
                )}
              </div>
            </div>

            {/* Move details */}
            <div>
              <SectionHeading>Move Details</SectionHeading>
              <div className="space-y-4">

                {/* Origin / Destination — optional, enables auto-distance */}
                <div className="space-y-3">
                  <BaseSearchInput
                    label="Moving from (optional)"
                    value={zipFrom}
                    onZipChange={setZipFrom}
                    onSelect={(r: SearchResult | null) => setFromMeta(r ? { state: r.state, oconus: r.oconus } : null)}
                    excludeOconus={false}
                    placeholder="Base name or ZIP code"
                  />
                  <BaseSearchInput
                    label="Moving to (optional)"
                    value={zipTo}
                    onZipChange={setZipTo}
                    onSelect={(r: SearchResult | null) => setToMeta(r ? { state: r.state, oconus: r.oconus, name: r.name } : null)}
                    excludeOconus={false}
                    placeholder="Base name or ZIP code"
                  />
                </div>

                {/* Overseas mode hides every input that no longer affects a result */}
                {!isOverseas && (
                <div>
                  <Label>Move type</Label>
                  <div className="space-y-2">
                    {MOVE_TYPES.map((mt) => (
                      <label
                        key={mt.value}
                        className={[
                          'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                          moveType === mt.value
                            ? 'border-red-700 bg-red-50'
                            : 'border-zinc-200 bg-white hover:border-zinc-300',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="moveType"
                          value={mt.value}
                          checked={moveType === mt.value}
                          onChange={() => setMoveType(mt.value)}
                          className="mt-0.5 accent-red-700 flex-none"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{mt.label}</p>
                          <p className="text-xs text-zinc-500 leading-snug">{mt.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                )}

                {/* Distance — varies by route type. Overseas: no mileage inputs at all. */}
                {isOverseas ? null : autoDistance !== null && !showManualOverride ? (
                  /* CONUS or AK/HI: auto estimate available */
                  <div className={`rounded-md px-3 py-2.5 space-y-1.5 ${routeType === 'ak-hi' ? 'bg-amber-50 border border-amber-300' : 'bg-zinc-50 border border-zinc-200'}`}>
                    <p className="text-sm text-zinc-700">
                      {routeType === 'ak-hi' ? 'Special-route estimate' : 'Estimated driving distance'}:{' '}
                      <span className="font-semibold tabular-nums">
                        {autoDistance.toLocaleString()} miles
                      </span>
                    </p>
                    {routeType === 'ak-hi' && (
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Alaska and Hawaii routes may involve ferry, port, or air travel — this straight-line estimate may differ significantly from your DTOD mileage.
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {routeType === 'conus' ? (
                        <>Straight-line × 1.25 road factor. Official PCS mileage is determined by the{' '}
                        <a href="https://www.dtod.sddc.army.mil" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Defense Table of Official Distances (DTOD)</a>
                        {' '}— verify with your transportation office.</>
                      ) : (
                        <>Verify official mileage with DTOD and your transportation office.</>
                      )}
                    </p>
                    {routeType === 'ak-hi' ? (
                      <button
                        type="button"
                        onClick={() => setShowManualOverride(true)}
                        className="text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded px-2.5 py-1 transition-colors"
                      >
                        Have official mileage from your orders? Enter it here →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowManualOverride(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Use a different mileage →
                      </button>
                    )}
                  </div>
                ) : (
                  /* Manual entry — no auto estimate, or override active */
                  <div>
                    <Label htmlFor="distance">
                      {routeType === 'ak-hi' ? 'Estimated PCS mileage for planning' : 'Distance (miles)'}
                    </Label>
                    <input
                      id="distance"
                      type="number"
                      min={0}
                      max={5000}
                      value={manualMiles}
                      onChange={(e) => { setManualMiles(Math.max(0, parseInt(e.target.value) || 0)); setMilesEntered(true); }}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    {autoDistance !== null ? (
                      <button
                        type="button"
                        onClick={() => setShowManualOverride(false)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 block"
                      >
                        ← Use calculated distance ({autoDistance.toLocaleString()} miles)
                      </button>
                    ) : (
                      <p className="text-xs text-zinc-400 mt-1">
                        Or select stations above for an automatic estimate. Verify official mileage with{' '}
                        <a href="https://www.dtod.sddc.army.mil" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DTOD</a>.
                      </p>
                    )}
                  </div>
                )}

                {!isOverseas && (
                <div>
                  <Label htmlFor="numPOVs">Number of POVs driving</Label>
                  <select
                    id="numPOVs"
                    value={numPOVs}
                    onChange={(e) => setNumPOVs(Number(e.target.value) as 1 | 2)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    <option value={1}>1 vehicle</option>
                    <option value={2}>2 vehicles</option>
                  </select>
                  {secondPovDropped && (
                    <p className="text-xs text-amber-700 mt-1" data-testid="pcs-second-pov-note">
                      Mileage for a second vehicle needs a dependent traveling with you, so it&apos;s paid for one vehicle.
                    </p>
                  )}
                </div>
                )}

                {isPPM && !isOverseas && (
                  <div>
                    <Label htmlFor="hhgWeight">
                      HHG weight to self-move (lbs)
                    </Label>
                    <input
                      id="hhgWeight"
                      type="number"
                      min={500}
                      max={weightAllowance}
                      step={100}
                      value={hhgWeight}
                      onChange={(e) => setHhgWeight(Math.max(0, parseInt(e.target.value) || 0))}
                      className={[
                        'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700',
                        weightExceedsAllowance ? 'border-red-400 bg-red-50' : 'border-zinc-300',
                      ].join(' ')}
                    />
                    <p className={['text-xs mt-1', weightExceedsAllowance ? 'text-red-600' : 'text-zinc-400'].join(' ')}>
                      Weight allowance for {RANK_DISPLAY[rank as PayGrade] ?? rank}: {weightAllowance.toLocaleString()} lbs
                      {weightExceedsAllowance && ' — exceeds allowance'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional — TLE days; none apply in overseas mode */}
            {!isOverseas && (
            <div>
              <SectionHeading>Optional</SectionHeading>
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tleOld">TLE days — old station</Label>
                    <input
                      id="tleOld"
                      type="number"
                      min={0}
                      max={R.tle.maxDaysConus}
                      value={tleOldDays}
                      onChange={(e) => setTleOldDays(Math.max(0, Math.min(R.tle.maxDaysConus, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tleNew">TLE days — new station</Label>
                    <input
                      id="tleNew"
                      type="number"
                      min={0}
                      max={R.tle.maxDaysConus}
                      value={tleNewDays}
                      onChange={(e) => setTleNewDays(Math.max(0, Math.min(R.tle.maxDaysConus, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500" data-testid="pcs-tle-days-note">
                  {tleRoute === 'conus-to-oconus'
                    ? `Up to ${tleMaxDays} days in total for a move from CONUS to Alaska or Hawaii.`
                    : `Up to ${tleMaxDays} days in total, split across the old and new stations.`}
                  {tleDaysEntered > tleMaxDays && ` You entered ${tleDaysEntered}; the estimate counts ${tleMaxDays}.`}
                  {tleDaysEntered > 0 && ' Keep all lodging receipts.'}
                </p>
              </div>
            </div>
            )}

          </Card>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4" data-testid="pcs-results">

          {/* Banner — no total for an overseas move */}
          {!isOverseas && (
          <div className="rounded-lg bg-red-700 p-5 text-white">
            <p className="text-sm font-medium text-red-200 mb-1">
              Total estimated PCS entitlements
            </p>
            {needsInput ? (
              <p className="text-lg font-semibold leading-snug" data-testid="pcs-needs-input">
                {NEEDS_INPUT_TEXT}
              </p>
            ) : (
            <>
            <p className="text-4xl font-black tabular-nums" data-testid="pcs-total">
              {fmt(output.govMoveTotal)}
            </p>
            <p className="text-xs text-red-300 mt-1">
              {output.travelDays} travel {output.travelDays === 1 ? 'day' : 'days'} · {effectiveDistance.toLocaleString()} miles · 2026 DLA and MALT · {PER_DIEM_LABEL}
            </p>
            </>
            )}
            {!needsInput && output.tleTotal > 0 && (
              <p className="text-xs text-red-200 mt-1">Includes TLE up to {fmt(output.tleTotal)}</p>
            )}
            {isPPM && (
              <p className="text-xs text-red-200 mt-1">Plus your PPM incentive, set for your move by your transportation office</p>
            )}
          </div>
          )}

          <SaveOrShareResults
            pageName="pcs"
            headline="Save or share your PCS estimate"
            supportingText="Useful for planning a move budget, comparing entitlements, or sending to someone helping with your move."
            usefulFor={['Move planning', 'Entitlement review', 'Family budgeting']}
            getUrl={getShareUrl}
            shareTitle="My PCS move estimate"
            shareText="Here's my PCS entitlement estimate from MilPayTools."
          />

          {isOverseas ? (
            <>
              {/* Overseas: DLA is the only figure this estimator can calculate correctly */}
              <div className="rounded-lg border border-zinc-200 bg-white p-5" data-testid="pcs-overseas-dla">
                <EntitlementRow
                  label={PCS_OVERSEAS_DLA_LABEL}
                  value={fmtDecimals(output.dlaRate)}
                  sub={PCS_OVERSEAS_DLA_NOTE}
                />
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5" data-testid="pcs-overseas-panel">
                <h3 className="font-semibold text-zinc-900 mb-2">{PCS_OVERSEAS_HEADING}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-4">{PCS_OVERSEAS_INTRO}</p>
                <ul className="space-y-3 mb-5">
                  {PCS_OVERSEAS_POINTS.map((p) => (
                    <li key={p.strong} className="text-sm text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-zinc-900">{p.strong}</span> {p.body}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  {PCS_OVERSEAS_RESOURCES_HEADING}
                </p>
                <ul className="space-y-1.5">
                  {PCS_OVERSEAS_LINKS.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {overseasGuide && (
                  <Link
                    href={`/bah/${overseasGuide.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-red-700 hover:underline"
                  >
                    {PCS_OVERSEAS_GUIDE_LINK.replace('{name}', overseasGuide.name)}
                  </Link>
                )}
              </div>
            </>
          ) : (
          <>
          {/* Entitlement breakdown */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Entitlement Breakdown</h3>
            <p className="text-xs text-zinc-400 mb-4">2026 DTMO rates · {PER_DIEM_LABEL} — verify with your Finance Office</p>

            {needsInput ? (
            <>
            <p className="text-sm text-zinc-600 leading-relaxed mb-2">{NEEDS_INPUT_TEXT}</p>
            <EntitlementRow
              label="DLA rate (for reference)"
              value={fmtDecimals(output.dlaRate)}
              sub={`${hasDependents ? 'With' : 'Without'} dependents · one-time payment on a move between duty stations`}
            />
            </>
            ) : (
            <>
            {output.isLocalMove && (
              <div className="rounded-md bg-amber-50 border border-amber-300 px-3 py-2 mb-2" data-testid="pcs-local-move-note">
                <p className="text-xs text-amber-800 leading-relaxed">
                  Local move: DLA and TLE depend on the move type. A local move pays them only with a household
                  goods relocation.
                </p>
              </div>
            )}

            <EntitlementRow
              label="DLA (Dislocation Allowance)"
              value={output.isLocalMove ? 'Not counted' : fmtDecimals(output.dla)}
              dim={output.isLocalMove}
              sub={
                output.isLocalMove
                  ? `${hasDependents ? 'With' : 'Without'} dependents rate: ${fmtDecimals(output.dlaRate)} · depends on the move type`
                  : `${hasDependents ? 'With' : 'Without'} dependents · one-time payment`
              }
            />
            <EntitlementRow
              label="MALT (Mileage)"
              value={fmtDecimals(output.malt)}
              sub={
                `${effectiveDistance.toLocaleString()} mi × $${R.maltPerMile} × ${output.maltPOVs} POV${output.maltPOVs > 1 ? 's' : ''}` +
                (routeType === 'ak-hi' ? ' — AK/HI planning estimate' : '') +
                (secondPovDropped ? ' · a second POV needs a dependent traveling with you' : '')
              }
            />
            <EntitlementRow
              label="Per Diem — Member"
              value={fmtDecimals(output.perDiemMember)}
              sub={`${output.travelDays} day${output.travelDays !== 1 ? 's' : ''} × $${PER_DIEM_DAILY} (${PER_DIEM_LABEL}: $${PCS_PER_DIEM_RATE.lodging} lodging + $${PCS_PER_DIEM_RATE.mie} M&IE)`}
            />
            {depsTraveling > 0 && (
              <EntitlementRow
                label={`Per Diem — Dependents (${depsTraveling})`}
                value={fmtDecimals(output.perDiemDependents)}
                sub={[
                  depsAge12Plus > 0 ? `${depsAge12Plus} age 12+ at ${pct(R.dependentPerDiemShare.age12OrOlder)}` : null,
                  depsUnder12 > 0 ? `${depsUnder12} under 12 at ${pct(R.dependentPerDiemShare.under12)}` : null,
                ].filter(Boolean).join(' · ') + ' of the member\'s rate'}
              />
            )}
            {output.tleDays > 0 && (
              <EntitlementRow
                label={`TLE (${output.tleDays} days)`}
                value={output.isLocalMove ? 'Not counted' : `Up to ${fmtDecimals(output.tleTotal)}`}
                dim={output.isLocalMove}
                sub={`${pct(output.tlePercent)} of the ${PER_DIEM_LABEL} = up to ${fmtDecimals(output.tleDailyRate)}/day (cap $${R.tle.dailyCap}/day, lodging taxes included) · higher-cost areas have higher locality rates · keep all receipts`}
              />
            )}
            <EntitlementRow
              label="Government move entitlements total"
              value={fmt(output.govMoveTotal)}
              highlight
            />
            </>
            )}
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              Per diem for driving (MALT Plus) is the full standard CONUS rate for each authorized travel day. Days when you fly part of the way follow different rules and aren&apos;t modeled. Some housing-shortage areas allow extra TLE days; see DTMO&apos;s{' '}
              <a href={R.tle.extensionsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Locations with Approved TLE Extensions</a>.
            </p>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              This estimate uses station coordinates for planning. Official PCS mileage is determined by DTOD and your orders. Alaska, Hawaii, overseas, ferry, port, or air-travel routes may differ significantly — verify with your transportation or finance office.
            </p>
          </div>

          {/* PPM section — no dollar figure: the incentive is computed per move */}
          {isPPM && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5" data-testid="pcs-ppm-panel">
              <h3 className="font-semibold text-zinc-900 mb-2">
                How your PPM incentive is set
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                {`The PPM incentive is ${pct(R.ppmIncentivePercentOfGcc)} of the Government Constructed Cost (GCC): what it would have cost the government to move the same weight the same distance. It's computed for each move, so this estimator doesn't show a dollar figure.`}
              </p>
              <EntitlementRow
                label="Weight you plan to self-move"
                value={`${Math.min(hhgWeight, weightAllowance).toLocaleString()} lbs`}
                sub={`Your allowance: ${weightAllowance.toLocaleString()} lbs · the incentive uses the weight on your weight tickets, up to the allowance`}
              />
              <ul className="mt-3 space-y-1.5 text-sm text-zinc-600 leading-relaxed list-disc pl-5">
                <li>Get the official estimate in your move system (MilMove or DPS) or from your transportation office.</li>
                <li>You can request an advance of up to {pct(R.ppmAdvancePercent)} of the incentive.</li>
                <li>The incentive is taxable income; documented moving costs (truck rental, fuel, packing materials) reduce the taxable part. Keep every receipt and weight ticket.</li>
              </ul>
              <a href={PCS_PPM_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
                Military OneSource: preparing to move or PCS →
              </a>
            </div>
          )}

          {/* Weight allowance card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="pcs-weight-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  HHG weight allowance — {rankLabel}, {hasDependents ? 'with' : 'without'} dependents
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {`JTR Table 5-37${weightRow ? ` (${weightRow} row)` : ''} · pro-gear doesn't count against it`}
                </p>
              </div>
              <p className="text-xl font-bold text-zinc-900 tabular-nums">
                {output.weightAllowance.toLocaleString()} lbs
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${weightExceedsAllowance ? 'bg-red-500' : 'bg-red-700'}`}
                style={{ width: `${Math.min(100, (hhgWeight / output.weightAllowance) * 100)}%` }}
              />
            </div>
            {isPPM && (
              <p className="text-xs text-zinc-500 mt-2">
                {Math.min(hhgWeight, output.weightAllowance).toLocaleString()} lbs self-moving
                {' '}({Math.round((Math.min(hhgWeight, output.weightAllowance) / output.weightAllowance) * 100)}% of allowance)
              </p>
            )}
          </div>

          {/* Act steps */}
          <ActSteps steps={actionSteps} title="Before you move" />
          </>
          )}

          {/* Destination station guide — helps PCS planning with local housing context */}
          <StationPageCard
            pages={stationPagesTo}
            linkSuffix={`?rank=${rank}&dep=${hasDependents ? 'yes' : 'no'}`}
            context="pcs"
          />

          {/* Cross-links — BAH and Total Comp don't support overseas stations */}
          {!isOverseas && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4" data-testid="pcs-cross-links">
            <p className="text-sm font-semibold text-zinc-800 mb-2">PCS planning tools</p>
            <div className="flex flex-col gap-2">
              <Link href="/bah" className="text-sm text-blue-700 hover:underline font-medium">
                BAH Calculator → Look up housing allowance at your new duty station
              </Link>
              <Link href="/calculators/total-compensation" className="text-sm text-blue-700 hover:underline font-medium">
                Military Pay Calculator → See how the move changes your full pay picture
              </Link>
            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
