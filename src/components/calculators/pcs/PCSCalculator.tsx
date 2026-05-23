'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fireCalculatorEvent } from '@/lib/analytics';
import { Card } from '@/components/ui/Card';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { getStationPagesForZip } from '@/data/bah/2026/mhaToStationPage';
import { StationPageCard } from '@/components/calculators/shared/StationPageCard';
import { STATION_COORDINATES } from '@/data/duty-stations/coordinates';
import { INSTALLATIONS_LOOKUP } from '@/data/installations-lookup';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';
import { calculatePCS, getWeightAllowance } from '@/lib/calculations/pcs';
import type { PCSMoveType, PCSInput, PCSOutput } from '@/lib/calculations/pcs';
import type { SearchResult } from '@/lib/stationSearch';
import { parseBool } from '@/lib/urlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';

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
];

// ─── Move type config ─────────────────────────────────────────────────────────

const MOVE_TYPES: { value: PCSMoveType; label: string; description: string }[] = [
  {
    value: 'gov',
    label: 'Government Move',
    description: 'Government contracts a moving company. No PPM net proceeds, but no hassle.',
  },
  {
    value: 'full-ppm',
    label: 'Full PPM / DITY',
    description: 'You move everything yourself. Reimbursed at government cost estimate — net proceeds are taxable.',
  },
  {
    value: 'partial-ppm',
    label: 'Partial PPM',
    description: 'Government ships most items; you self-move a portion for additional reimbursement.',
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
  const p2 = zip.slice(0, 2);
  const p3 = zip.slice(0, 3);
  if (p3 >= '995') return 'ak-hi'; // Alaska (995–999)
  if (p3 === '967' || p3 === '968') return 'ak-hi'; // Hawaii
  if (p2 === '09') return 'oconus'; // APO AE
  if (p3 >= '962' && p3 <= '966') return 'oconus'; // APO AP
  if (p3 === '340') return 'oconus'; // APO AA
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

  if (isPPM && output.ppmAfterTaxProfit > 2000) {
    steps.push({
      label: 'PPM savings opportunity',
      description: `A ${input.moveType === 'full-ppm' ? 'full' : 'partial'} PPM move could net approximately ${fmt(output.ppmAfterTaxProfit)} after estimated expenses and taxes. Request a 60% advance (${fmt(output.ppmAdvanceAmount)}) to cover upfront costs like truck rental.`,
      priority: 'high',
    });
  } else if (isPPM && output.ppmAfterTaxProfit > 0 && output.ppmAfterTaxProfit <= 2000) {
    steps.push({
      label: 'PPM margin is slim',
      description: `After estimated expenses and taxes, the PPM move would net approximately ${fmt(output.ppmAfterTaxProfit)}. A government move may be less stressful with a similar financial outcome — weigh the effort against the gain.`,
      priority: 'medium',
    });
  } else if (isPPM && output.ppmAfterTaxProfit <= 0) {
    steps.push({
      label: 'PPM produces no savings at these inputs',
      description: `Your estimated expenses exceed the reimbursement at ${input.hhgWeight.toLocaleString()} lbs. Consider reducing expenses or using a government move for this distance.`,
      priority: 'medium',
    });
  }

  if (!isPPM) {
    steps.push({
      label: 'Consider a partial PPM',
      description: `Government moves ship most items for free — but if you move any portion yourself, you receive additional PPM reimbursement. Even a small self-moved load can put money in your pocket.`,
      priority: 'medium',
    });
  }

  steps.push({
    label: 'Check your BAH at the gaining station',
    description: `Your housing allowance changes with every PCS. Look up the E-5 with/without dependents BAH rate at your new duty station ZIP code before making housing decisions.`,
    href: '/calculators/bah',
    priority: 'high',
  });

  steps.push({
    label: 'Buying at your new duty station instead of renting?',
    description: `VA loans require $0 down payment and no PMI — your BAH can cover the mortgage while you build equity instead of paying rent.`,
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
  const [numDependents, setNumDependents] = useState(1);
  const [moveType, setMoveType] = useState<PCSMoveType>('gov');
  const [zipFrom, setZipFrom] = useState('');
  const [zipTo, setZipTo] = useState('');
  const [fromMeta, setFromMeta] = useState<{ state: string; oconus?: boolean } | null>(null);
  const [toMeta, setToMeta] = useState<{ state: string; oconus?: boolean } | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualMiles, setManualMiles] = useState(0);
  const [numPOVs, setNumPOVs] = useState<1 | 2>(1);
  const [hhgWeight, setHhgWeight] = useState(5000);
  const [tleOldDays, setTleOldDays] = useState(0);
  const [tleNewDays, setTleNewDays] = useState(0);
  const [ppmExpenses, setPpmExpenses] = useState(2000);

  const weightAllowance = useMemo(() => getWeightAllowance(rank), [rank]);

  // Station lookup via MHA — matches station ZIPs and any ZIP variant in the same housing area
  const stationPagesTo = useMemo(() => getStationPagesForZip(zipTo), [zipTo]);

  const routeType = useMemo((): RouteClass => {
    const hasFrom = zipFrom || fromMeta;
    const hasTo = zipTo || toMeta;
    if (!hasFrom || !hasTo) return 'conus';
    return getRouteType(
      classifyEndpoint(zipFrom, fromMeta),
      classifyEndpoint(zipTo, toMeta),
    );
  }, [zipFrom, zipTo, fromMeta, toMeta]);

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
    numDependents: hasDependents ? numDependents : 0,
    moveType,
    distance: Math.max(0, effectiveDistance),
    numPOVs,
    hhgWeight: Math.min(hhgWeight, weightAllowance),
    tleOldDays,
    tleNewDays,
    ppmExpenses,
  }), [rank, hasDependents, numDependents, moveType, effectiveDistance, numPOVs, hhgWeight, weightAllowance, tleOldDays, tleNewDays, ppmExpenses]);

  const output: PCSOutput = useMemo(() => calculatePCS(input), [input]);
  const actionSteps = useMemo(() => buildActionSteps(input, output), [input, output]);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const _gaMountedRef = useRef(false);
  useEffect(() => {
    if (!_gaMountedRef.current) { _gaMountedRef.current = true; return; }
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('pcs'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [output]);

  // Pre-populate from URL params on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const r = p.get('rank');
    const dep = parseBool(p.get('dep'));
    const nd = p.get('numdep');
    const mt = p.get('movetype') as PCSMoveType | null;
    const from = p.get('from');
    const to = p.get('to');
    const miles = p.get('miles');
    const povs = p.get('povs');
    const hhg = p.get('hhg');
    const tleold = p.get('tleold');
    const tlenew = p.get('tlenew');
    const ppmexp = p.get('ppmexp');

    if (r) setRank(r);
    if (dep !== null) setHasDependents(dep);
    if (nd) { const n = parseInt(nd, 10); if (!isNaN(n) && n >= 0 && n <= 10) setNumDependents(n); }
    if (mt === 'gov' || mt === 'full-ppm' || mt === 'partial-ppm') setMoveType(mt);
    if (from) setZipFrom(from);
    if (to) setZipTo(to);
    if (miles) { const n = parseInt(miles, 10); if (!isNaN(n) && n >= 0) { setManualMiles(n); setShowManualOverride(true); } }
    if (povs === '2') setNumPOVs(2);
    if (hhg) { const n = parseInt(hhg, 10); if (!isNaN(n) && n > 0) setHhgWeight(n); }
    if (tleold) { const n = parseInt(tleold, 10); if (!isNaN(n) && n >= 0 && n <= 14) setTleOldDays(n); }
    if (tlenew) { const n = parseInt(tlenew, 10); if (!isNaN(n) && n >= 0 && n <= 14) setTleNewDays(n); }
    if (ppmexp) { const n = parseInt(ppmexp, 10); if (!isNaN(n) && n >= 0) setPpmExpenses(n); }
  }, []);

  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('rank', rank);
    p.set('dep', hasDependents ? 'yes' : 'no');
    if (hasDependents) p.set('numdep', String(numDependents));
    p.set('movetype', moveType);
    if (zipFrom) p.set('from', zipFrom);
    if (zipTo) p.set('to', zipTo);
    if (showManualOverride || autoDistance === null) p.set('miles', String(manualMiles));
    p.set('povs', String(numPOVs));
    if (moveType !== 'gov') {
      p.set('hhg', String(hhgWeight));
      p.set('ppmexp', String(ppmExpenses));
    }
    if (tleOldDays > 0) p.set('tleold', String(tleOldDays));
    if (tleNewDays > 0) p.set('tlenew', String(tleNewDays));
    return `${window.location.origin}/calculators/pcs?${p.toString()}`;
  }

  const isPPM = moveType !== 'gov';
  const tleDays = Math.min(tleOldDays + tleNewDays, 21);
  const weightExceedsAllowance = hhgWeight > weightAllowance;

  const ppmProfitColor =
    output.ppmAfterTaxProfit > 2000
      ? 'bg-green-50 border-green-200'
      : output.ppmAfterTaxProfit > 0
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    <Label htmlFor="numDep">Dependents traveling with you</Label>
                    <input
                      id="numDep"
                      type="number"
                      min={0}
                      max={10}
                      value={numDependents}
                      onChange={(e) => setNumDependents(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    <p className="text-xs text-zinc-400 mt-1">Affects per diem calculation only</p>
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
                    onSelect={(r: SearchResult | null) => setToMeta(r ? { state: r.state, oconus: r.oconus } : null)}
                    excludeOconus={false}
                    placeholder="Base name or ZIP code"
                  />
                </div>

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

                {/* Distance — varies by route type */}
                {routeType === 'oconus' ? (
                  /* OCONUS: no auto estimate — manual entry only */
                  <div>
                    <div className="rounded-md bg-amber-50 border border-amber-300 px-3 py-2.5 mb-3">
                      <p className="text-sm font-semibold text-amber-800">OCONUS move — limited estimate</p>
                      <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                        Auto-distance is not available for overseas routes. Enter the mileage from your orders, or use a planning estimate. Verify all figures with your transportation or finance office.
                      </p>
                    </div>
                    <Label htmlFor="distance">PCS mileage (from your orders)</Label>
                    <input
                      id="distance"
                      type="number"
                      min={0}
                      max={20000}
                      value={manualMiles}
                      onChange={(e) => setManualMiles(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                ) : autoDistance !== null && !showManualOverride ? (
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
                      onChange={(e) => setManualMiles(Math.max(0, parseInt(e.target.value) || 0))}
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
                </div>

                {isPPM && (
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

            {/* Optional */}
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
                      max={14}
                      value={tleOldDays}
                      onChange={(e) => setTleOldDays(Math.max(0, Math.min(14, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tleNew">TLE days — new station</Label>
                    <input
                      id="tleNew"
                      type="number"
                      min={0}
                      max={14}
                      value={tleNewDays}
                      onChange={(e) => setTleNewDays(Math.max(0, Math.min(14, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                </div>
                {tleDays > 0 && (
                  <p className="text-xs text-zinc-500">
                    {tleDays} combined TLE days
                    {tleDays === 21 && ' (21-day max — CONUS-to-CONUS; verify with Finance for OCONUS moves)'}
                    {' '}— keep all lodging receipts
                  </p>
                )}

                {isPPM && (
                  <div>
                    <Label htmlFor="ppmExp">Estimated PPM expenses ($)</Label>
                    <input
                      id="ppmExp"
                      type="number"
                      min={0}
                      step={100}
                      value={ppmExpenses}
                      onChange={(e) => setPpmExpenses(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    <p className="text-xs text-zinc-400 mt-1">Truck rental, fuel, packing supplies, etc.</p>
                  </div>
                )}
              </div>
            </div>

          </Card>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Banner */}
          <div className="rounded-lg bg-red-700 p-5 text-white">
            <p className="text-sm font-medium text-red-200 mb-1">
              Total estimated PCS entitlements
            </p>
            <p className="text-4xl font-black tabular-nums">
              {fmt(isPPM ? output.ppmMoveTotal : output.govMoveTotal)}
            </p>
            <p className="text-xs text-red-300 mt-1">
              Based on 2026 rates · {output.travelDays} travel {output.travelDays === 1 ? 'day' : 'days'} · {effectiveDistance.toLocaleString()} miles
            </p>
          </div>

          <SaveOrShareResults
            headline="Save or share your PCS estimate"
            supportingText="Useful for planning a move budget, comparing entitlements, or sending to someone helping with your move."
            usefulFor={['Move planning', 'Entitlement review', 'Family budgeting']}
            getUrl={getShareUrl}
            shareTitle="My PCS move estimate"
            shareText="Here's my PCS entitlement estimate from MilPayTools."
          />

          {/* Entitlement breakdown */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Entitlement Breakdown</h3>
            <p className="text-xs text-zinc-400 mb-4">2026 DTMO rates — verify with your Finance Office</p>

            <EntitlementRow
              label="DLA (Dislocation Allowance)"
              value={fmtDecimals(output.dla)}
              sub={`${hasDependents ? 'With' : 'Without'} dependents · one-time payment`}
            />
            <EntitlementRow
              label="MALT (Mileage)"
              value={fmtDecimals(output.malt)}
              sub={
                routeType === 'oconus'
                  ? `${effectiveDistance.toLocaleString()} mi × $0.205 × ${numPOVs} POV${numPOVs > 1 ? 's' : ''} — planning estimate; verify with your orders`
                  : routeType === 'ak-hi'
                  ? `${effectiveDistance.toLocaleString()} mi × $0.205 × ${numPOVs} POV${numPOVs > 1 ? 's' : ''} — AK/HI planning estimate`
                  : `${effectiveDistance.toLocaleString()} mi × $0.205 × ${numPOVs} POV${numPOVs > 1 ? 's' : ''}`
              }
            />
            <EntitlementRow
              label="Per Diem — Member"
              value={fmtDecimals(output.perDiemMember)}
              sub={`${output.travelDays} day${output.travelDays !== 1 ? 's' : ''} · first/last day at 75% · standard CONUS rate`}
            />
            {hasDependents && numDependents > 0 && (
              <EntitlementRow
                label={`Per Diem — Dependents (${numDependents})`}
                value={fmtDecimals(output.perDiemDependents)}
                sub="75% of member rate per dependent (approx.)"
              />
            )}
            {output.tleTotal > 0 && (
              <EntitlementRow
                label={`TLE (${output.tleDays} days)`}
                value={fmtDecimals(output.tleTotal)}
                sub="Actual lodging + M&IE · keep all receipts · 14-day max"
              />
            )}
            <EntitlementRow
              label="Government move entitlements total"
              value={fmt(output.govMoveTotal)}
              highlight
            />
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              This estimate uses station coordinates for planning. Official PCS mileage is determined by DTOD and your orders. Alaska, Hawaii, overseas, ferry, port, or air-travel routes may differ significantly — verify with your transportation or finance office.
            </p>
          </div>

          {/* PPM section */}
          {isPPM && (
            <div className={`rounded-lg border p-5 ${ppmProfitColor}`}>
              <h3 className="font-semibold text-zinc-900 mb-1">
                PPM / DITY Reimbursement
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                PPM reimbursement rates vary by distance and are calculated by your Transportation Office (TMO). The estimate shown uses an approximate rate per hundredweight and may differ from your actual entitlement.
              </p>

              <EntitlementRow
                label="Weight"
                value={`${Math.min(hhgWeight, weightAllowance).toLocaleString()} lbs`}
                sub={`Allowance: ${weightAllowance.toLocaleString()} lbs`}
              />
              <EntitlementRow
                label="Gross reimbursement estimate"
                value={fmtDecimals(output.ppmGrossReimbursement)}
                sub={`${(Math.min(hhgWeight, weightAllowance) / 100).toFixed(0)} cwt × $${210}/cwt`}
              />
              <EntitlementRow
                label="Less estimated expenses"
                value={`−${fmt(ppmExpenses)}`}
                sub="Truck, fuel, packing supplies"
              />
              <EntitlementRow
                label="Gross proceeds (before tax)"
                value={fmtDecimals(output.ppmGrossProfit)}
              />
              <EntitlementRow
                label="After-tax net proceeds"
                value={fmtDecimals(output.ppmAfterTaxProfit)}
                highlight={output.ppmAfterTaxProfit > 0}
                sub="PPM proceeds above expenses are taxable income. 22% federal is an estimate — actual rate depends on your total income and filing status."
              />
              {output.ppmAfterTaxProfit > 0 && (
                <div className="mt-3 rounded-md bg-white bg-opacity-60 border border-zinc-200 px-3 py-2">
                  <p className="text-xs text-zinc-600">
                    <span className="font-semibold">60% advance available:</span>{' '}
                    {fmt(output.ppmAdvanceAmount)} — request this upfront to cover truck rental and expenses before reimbursement.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Government vs PPM comparison */}
          {isPPM && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-900 mb-4">Move Type Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Government Move</p>
                  <p className="text-2xl font-black text-zinc-900 tabular-nums">{fmt(output.govMoveTotal)}</p>
                  <p className="text-xs text-zinc-400 mt-1">DLA + MALT + Per Diem + TLE</p>
                </div>
                <div className={`rounded-md border p-4 ${output.ppmAfterTaxProfit > 0 ? 'bg-green-50 border-green-200' : 'bg-zinc-50 border-zinc-200'}`}>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">PPM Move</p>
                  <p className={`text-2xl font-black tabular-nums ${output.ppmAfterTaxProfit > 0 ? 'text-green-700' : 'text-zinc-900'}`}>
                    {fmt(output.ppmMoveTotal)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Includes after-tax net proceeds</p>
                </div>
              </div>
              {output.ppmAfterTaxProfit > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600 flex-none" />
                  <p className="text-sm text-zinc-600">
                    PPM advantage: <span className="font-semibold text-green-700">{fmt(output.ppmMoveTotal - output.govMoveTotal)}</span> more than a government move (after estimated expenses and taxes)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Weight allowance card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  HHG weight allowance — {RANK_DISPLAY[rank as PayGrade] ?? rank}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">JTR Table 5-37 · 2026</p>
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

          {/* Destination station guide — helps PCS planning with local housing context */}
          <StationPageCard
            pages={stationPagesTo}
            linkSuffix={`?rank=${rank}&dep=${hasDependents ? 'yes' : 'no'}`}
            context="pcs"
          />

          {/* Cross-links */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-semibold text-zinc-800 mb-2">PCS planning tools</p>
            <div className="flex flex-col gap-2">
              <Link href="/calculators/bah" className="text-sm text-blue-700 hover:underline font-medium">
                BAH Calculator → Look up housing allowance at your new duty station
              </Link>
              <Link href="/calculators/total-compensation" className="text-sm text-blue-700 hover:underline font-medium">
                Total Compensation Calculator → See how the move changes your full pay picture
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
