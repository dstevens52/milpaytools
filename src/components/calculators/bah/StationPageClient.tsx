'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CollapsibleRateTable } from '@/components/calculators/bah/CollapsibleRateTable';
import {
  RANK_DISPLAY,
  ENLISTED_GRADES,
  WARRANT_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  type PayGrade,
} from '@/types/military';
import type { DutyStation } from '@/data/duty-stations/stations';
import type { StateTaxInfo } from '@/data/compare/stateTax';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NearbyStationData {
  name: string;
  slug: string;
  city: string;
  state: string;
  oconus?: true;
  e5Rate?: number;
}

export interface StationPageClientProps {
  station: DutyStation;
  ratesW: Record<string, number>;
  ratesWO: Record<string, number>;
  locationName: string;
  taxInfo: StateTaxInfo | null;
  colaArea: { name: string; tier: string } | null;
  nearbyData: NearbyStationData[];
  hasRates: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NATIONAL_AVG_E5_W = 1987;

// BAH table only goes to O-7; O-8/9/10 use O-7 rates
const BAH_OFFICER_GRADES = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const;

const BAH_GRADE_ORDER: PayGrade[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...PRIOR_ENLISTED_OFFICER_GRADES,
  ...BAH_OFFICER_GRADES,
];

const GRADE_GROUPS: { label: string; grades: PayGrade[] }[] = [
  { label: 'Enlisted', grades: [...ENLISTED_GRADES] },
  { label: 'Warrant Officer', grades: [...WARRANT_GRADES] },
  { label: 'Officer (Prior Enlisted)', grades: [...PRIOR_ENLISTED_OFFICER_GRADES] },
  { label: 'Officer', grades: [...BAH_OFFICER_GRADES] },
];

const fmt = (n: number) => formatCurrency(n);

// ─── URL param normalization helpers ─────────────────────────────────────────

function normalizeGrade(raw: string): PayGrade | null {
  const upper = raw.trim().toUpperCase().replace(/\s/g, '');
  let normalized = upper;
  if (!normalized.includes('-')) {
    // E5→E-5, O3→O-3, W2→W-2, O1E→O-1E
    normalized = normalized.replace(/^([EWO])(\d+)(E?)$/, (_, p, n, s) => `${p}-${n}${s}`);
  }
  return (BAH_GRADE_ORDER as string[]).includes(normalized) ? (normalized as PayGrade) : null;
}

function normalizeDep(raw: string): boolean | null {
  const lower = raw.toLowerCase().trim();
  if (['yes', 'true', 'with', 'w', '1'].includes(lower)) return true;
  if (['no', 'false', 'without', 'wo', '0'].includes(lower)) return false;
  return null;
}

// ─── HeroBanner sub-component ─────────────────────────────────────────────────

function HeroBanner({ station }: { station: DutyStation }) {
  const subtitle = [
    `${station.city}, ${station.stateName}`,
    station.branches.join(' / '),
    station.formerName ? `Formerly ${station.formerName}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="relative overflow-hidden h-40 sm:h-56">
      {station.heroImage ? (
        <Image
          src={station.heroImage}
          alt={station.name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-zinc-800 to-stone-700" />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />
      {/* Text overlay — bottom-left */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span className="inline-flex items-center mb-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white/90 bg-white/15 border border-white/20">
          2026 BAH Rates
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">
          {station.name}
        </h1>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
      {/* Photo credit — bottom-right, only when photo present */}
      {station.heroImage && (
        <p className="absolute bottom-2 right-3 text-xs text-white/35 select-none">
          {station.heroImageCredit ?? 'Photo: U.S. Military / DVIDS'}
        </p>
      )}
    </div>
  );
}

// ─── RankSelector sub-component ──────────────────────────────────────────────

interface RankSelectorProps {
  availableGrades: PayGrade[];
  selectedGrade: PayGrade;
  hasDependents: boolean;
  onGradeChange: (g: PayGrade) => void;
  onDepChange: (v: boolean) => void;
}

function RankSelector({ availableGrades, selectedGrade, hasDependents, onGradeChange, onDepChange }: RankSelectorProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Pay grade
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => onGradeChange(e.target.value as PayGrade)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
        >
          {GRADE_GROUPS.map(({ label, grades }) => {
            const groupGrades = grades.filter((g) => availableGrades.includes(g));
            if (groupGrades.length === 0) return null;
            return (
              <optgroup key={label} label={label}>
                {groupGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Dependents
        </label>
        <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[38px]">
          <button
            onClick={() => onDepChange(true)}
            className={[
              'px-3 text-sm font-medium transition-colors',
              hasDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            With
          </button>
          <button
            onClick={() => onDepChange(false)}
            className={[
              'px-3 text-sm font-medium border-l border-zinc-300 transition-colors',
              !hasDependents ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            Without
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MoneyStrip sub-component ─────────────────────────────────────────────────

interface MoneyStripProps {
  selectedBAH: number;
  selectedGrade: PayGrade;
  hasDependents: boolean;
  medianRent: number;
  medianRentSource: string;
}

function MoneyStrip({ selectedBAH, selectedGrade, hasDependents, medianRent, medianRentSource }: MoneyStripProps) {
  const surplus = selectedBAH - medianRent;
  const depLabel = hasDependents ? 'w/dep' : 'w/o dep';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
          {selectedGrade} {depLabel} BAH
        </p>
        <p className="text-2xl font-bold text-red-700 tabular-nums">
          {fmt(selectedBAH)}
          <span className="text-sm font-normal text-zinc-500">/mo</span>
        </p>
        <p className="text-xs text-zinc-400 mt-1">Tax-free housing allowance</p>
      </div>
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Median rent</p>
        <p className="text-2xl font-bold text-zinc-900 tabular-nums">
          {fmt(medianRent)}
          <span className="text-sm font-normal text-zinc-500">/mo</span>
        </p>
        <p className="text-xs text-zinc-400 mt-1">{medianRentSource}</p>
      </div>
      <div
        className={[
          'rounded-lg border p-4',
          surplus >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
        ].join(' ')}
      >
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Monthly surplus</p>
        <p
          className={[
            'text-2xl font-bold tabular-nums',
            surplus >= 0 ? 'text-green-700' : 'text-red-700',
          ].join(' ')}
        >
          {surplus >= 0 ? '+' : ''}
          {fmt(surplus)}
          <span className="text-sm font-normal">/mo</span>
        </p>
        <p className="text-xs text-zinc-400 mt-1">BAH minus median rent</p>
      </div>
    </div>
  );
}

// ─── Main StationPageClient component ────────────────────────────────────────

export function StationPageClient({
  station,
  ratesW,
  ratesWO,
  locationName,
  taxInfo,
  colaArea,
  nearbyData,
  hasRates,
}: StationPageClientProps) {
  const [selectedGrade, setSelectedGrade] = useState<PayGrade>('E-5');
  const [hasDependents, setHasDependents] = useState(true);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rankRaw = params.get('rank');
    const depRaw = params.get('dep');
    if (rankRaw) {
      const g = normalizeGrade(rankRaw);
      if (g) setSelectedGrade(g);
    }
    if (depRaw) {
      const d = normalizeDep(depRaw);
      if (d !== null) setHasDependents(d);
    }
  }, []);

  // Sync URL when grade/dep changes (after initial mount)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    params.set('rank', selectedGrade);
    params.set('dep', hasDependents ? 'yes' : 'no');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [selectedGrade, hasDependents, mounted]);

  // Derived values
  const selectedRates = hasDependents ? ratesW : ratesWO;
  const selectedBAH = selectedRates[selectedGrade] ?? 0;
  const e5WithDep = ratesW['E-5'] ?? 0;
  const selectedDiff = selectedBAH - NATIONAL_AVG_E5_W;
  const showNatAvgNote = selectedGrade !== 'E-5' || !hasDependents;

  const availableGrades = useMemo(
    () => BAH_GRADE_ORDER.filter((g) => ratesW[g] !== undefined || ratesWO[g] !== undefined),
    [ratesW, ratesWO]
  );

  const hasRichData = !!station.bahVsHousing;
  const depLabel = hasDependents ? 'w/dep' : 'w/o dep';

  // Suppress unused variable warning — e5WithDep kept for reference
  void e5WithDep;

  return (
    <>
      {/* Breadcrumb — above the hero */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Link href="/bah" className="hover:text-zinc-600 transition-colors">
              BAH by Station
            </Link>
            <span>›</span>
            <span className="text-zinc-600">{station.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero banner */}
      <HeroBanner station={station} />

      <div className="bg-zinc-50 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Rank selector card (always shown) */}
          <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-5">
            <RankSelector
              availableGrades={availableGrades}
              selectedGrade={selectedGrade}
              hasDependents={hasDependents}
              onGradeChange={setSelectedGrade}
              onDepChange={setHasDependents}
            />
            <p className="text-sm text-zinc-500">
              Showing{' '}
              <strong className="text-zinc-700">
                {selectedGrade} {hasDependents ? 'with dependents' : 'without dependents'}
              </strong>{' '}
              for the <strong className="text-zinc-700">{locationName}</strong> MHA.
            </p>
            {station.bahVsHousing && selectedBAH > 0 && (
              <MoneyStrip
                selectedBAH={selectedBAH}
                selectedGrade={selectedGrade}
                hasDependents={hasDependents}
                medianRent={station.bahVsHousing.medianRent}
                medianRentSource={station.bahVsHousing.medianRentSource}
              />
            )}
          </div>

          {/* Description — only for stations with rich data */}
          {hasRichData && (
            <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">{station.description}</p>
          )}

          {/* Quick Facts — for stations WITHOUT rich data */}
          {!hasRichData && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Quick Facts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-zinc-800">{station.city}, {station.state}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">Branch</p>
                  <p className="text-sm font-medium text-zinc-800">{station.branches.join(', ')}</p>
                </div>
                {locationName && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">MHA</p>
                    <p className="text-sm font-medium text-zinc-800">{locationName}</p>
                  </div>
                )}
                {selectedBAH > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">{selectedGrade} {depLabel}</p>
                    <p className="text-sm font-bold text-zinc-900">{fmt(selectedBAH)}/mo</p>
                  </div>
                )}
                {taxInfo && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">State Tax</p>
                    <p className="text-sm font-medium text-zinc-800">
                      {taxInfo.noTax ? 'No state income tax' : `${(taxInfo.rate * 100).toFixed(1)}% (${taxInfo.name})`}
                    </p>
                  </div>
                )}
                {colaArea && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">CONUS COLA</p>
                    <p className="text-sm font-medium text-green-700">Eligible ({colaArea.tier})</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OCONUS notice */}
          {station.oconus && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <p className="font-semibold text-amber-800 mb-2">OCONUS Assignment — OHA, Not BAH</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Members assigned to {station.name} receive{' '}
                <strong>Overseas Housing Allowance (OHA)</strong> instead of BAH. OHA is calculated
                differently — it is based on your actual rental cost (up to a local ceiling), plus a
                utility/recurring maintenance allowance (MIHA). BAH rates do not apply.
              </p>
              <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                Contact your gaining unit&apos;s housing office for current OHA ceilings and the DTMO OHA
                calculator at{' '}
                <a
                  href="https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  travel.dod.mil
                </a>
                .
              </p>
              <p className="text-sm text-amber-700 mt-3 leading-relaxed italic">{station.rentalNote}</p>
            </div>
          )}

          {/* BAH vs. Local Housing Costs */}
          {!station.oconus && station.bahVsHousing && selectedBAH > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">BAH vs. Local Housing Costs</h2>
              <p className="text-sm text-zinc-500 mb-5">
                Your BAH isn&apos;t just a rent check — here&apos;s how it stacks up against what housing
                actually costs in this market.
              </p>

              {/* Rent comparison row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Median rent</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.medianRent)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.medianRentSource}</p>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    {selectedGrade} {depLabel} BAH
                  </p>
                  <p className="text-2xl font-bold text-red-700 tabular-nums">
                    {fmt(selectedBAH)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Tax-free</p>
                </div>
                <div
                  className={[
                    'rounded-lg border p-4',
                    selectedBAH - station.bahVsHousing.medianRent >= 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200',
                  ].join(' ')}
                >
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Monthly surplus vs. median rent
                  </p>
                  <p
                    className={[
                      'text-2xl font-bold tabular-nums',
                      selectedBAH - station.bahVsHousing.medianRent >= 0
                        ? 'text-green-700'
                        : 'text-red-700',
                    ].join(' ')}
                  >
                    {selectedBAH - station.bahVsHousing.medianRent >= 0 ? '+' : ''}
                    {fmt(selectedBAH - station.bahVsHousing.medianRent)}
                    <span className="text-sm font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">If renting at median</p>
                </div>
              </div>

              {/* Buying comparison row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Median home price</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.medianHomePrice)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.medianHomePriceSource}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Est. monthly mortgage (PITI)
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.mortgageMin)}–{fmt(station.bahVsHousing.mortgageMax)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.mortgageAssumptions}</p>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
                <p className="text-sm text-zinc-700 leading-relaxed">
                  At {fmt(selectedBAH)}/month BAH and an estimated{' '}
                  {fmt(station.bahVsHousing.mortgageMin)}–{fmt(station.bahVsHousing.mortgageMax)}/month PITI on
                  a median-priced home,{' '}
                  {selectedBAH >= station.bahVsHousing.mortgageMin
                    ? 'BAH may cover a significant portion of a typical mortgage in this market — though actual costs vary based on rate, taxes, insurance, and individual circumstances.'
                    : 'BAH may not fully cover a typical mortgage, but it can significantly offset your monthly housing cost — though actual costs vary based on rate, taxes, insurance, and individual circumstances.'}
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Housing cost estimates are approximate and based on publicly available market data. Actual
                mortgage costs depend on interest rate, property taxes, insurance, HOA dues, maintenance,
                credit profile, and lender requirements. This is not financial advice — use these numbers
                as a starting point for your own research.
              </p>
            </div>
          )}

          {/* How This Market Compares */}
          {selectedBAH > 0 && !station.oconus && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">How This Market Compares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    {selectedGrade} {depLabel} BAH here
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(selectedBAH)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Natl avg E-5 w/dep</p>
                  <p className="text-2xl font-bold text-zinc-500 tabular-nums">
                    {fmt(NATIONAL_AVG_E5_W)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                </div>
                <div
                  className={[
                    'rounded-lg border p-4',
                    selectedDiff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
                  ].join(' ')}
                >
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">vs. natl avg (E-5)</p>
                  <p
                    className={[
                      'text-2xl font-bold tabular-nums',
                      selectedDiff >= 0 ? 'text-green-700' : 'text-red-700',
                    ].join(' ')}
                  >
                    {selectedDiff >= 0 ? '+' : ''}
                    {fmt(selectedDiff)}
                    <span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
              </div>
              {showNatAvgNote && (
                <p className="text-xs text-zinc-400 mb-3">
                  National average shown for E-5 with dependents as a market benchmark.
                </p>
              )}
              <p className="text-sm text-zinc-600 leading-relaxed">{station.rentalNote}</p>
            </div>
          )}

          {/* BAH Rate Table — collapsible */}
          {hasRates && (
            <CollapsibleRateTable
              locationName={locationName}
              ratesW={ratesW}
              ratesWO={ratesWO}
              selectedGrade={selectedGrade}
              selectedHasDependents={hasDependents}
            />
          )}

          {/* No data fallback */}
          {!station.oconus && !hasRates && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <p className="text-zinc-600 text-sm">
                BAH rate data for this ZIP code could not be loaded. Use the{' '}
                <Link href="/calculators/bah" className="text-red-700 hover:text-red-800 underline">
                  BAH calculator
                </Link>{' '}
                and enter the ZIP code manually for exact rates.
              </p>
            </div>
          )}

          {/* Local Housing Tips */}
          {station.localHousingTips && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-5">Local Housing Tips</h2>

              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-3">
                Best neighborhoods for military families
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {station.localHousingTips.neighborhoods.map((n) => (
                  <div key={n.name} className="rounded-lg border border-zinc-200 p-4">
                    <p className="font-semibold text-zinc-900 text-sm mb-1">{n.name}</p>
                    <p className="text-sm text-zinc-600 mb-2">{n.highlight}</p>
                    <p className="text-xs text-zinc-500">Commute: {n.commute}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Best for: {n.bestFor}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-400 italic mb-6">
                Neighborhood notes are general guidance based on common PCS advice. Verify school zones,
                commute times, safety, and current listings before choosing housing.
              </p>

              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-3">
                Local cost of living context
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    Overall cost of living is roughly {station.localHousingTips.coliNote}.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    Groceries run about {station.localHousingTips.groceryNote}.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">{station.localHousingTips.stateTaxNote}</p>
                </li>
              </ul>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">The mistake to avoid</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {station.localHousingTips.mistakeToAvoid}
                </p>
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Key Insights for {station.name}</h2>
            <ul className="space-y-3">
              {selectedBAH > 0 && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    An {selectedGrade} {hasDependents ? 'with dependents' : 'without dependents'} receives{' '}
                    <strong>{fmt(selectedBAH)}/month</strong> — that&apos;s{' '}
                    <strong>{fmt(selectedBAH * 12)}/year</strong> in tax-free housing money to cover costs
                    in the {locationName} market.
                  </p>
                </li>
              )}
              {taxInfo?.noTax && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    <strong>{station.stateName} has no state income tax</strong> on military pay, meaning
                    your BAH, base pay, and special pays go further here than in high-tax states.
                  </p>
                </li>
              )}
              {taxInfo && !taxInfo.noTax && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    {station.stateName} taxes military base pay at approximately{' '}
                    <strong>{(taxInfo.rate * 100).toFixed(1)}%</strong>. BAH and BAS remain tax-free at
                    the federal and state level.
                  </p>
                </li>
              )}
              {colaArea && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    Members at {station.name} are eligible for <strong>CONUS COLA</strong> — a monthly
                    supplement for high-cost areas ({colaArea.name}, {colaArea.tier} tier). Confirm your
                    exact rate with your finance office.
                  </p>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                <p className="text-sm text-zinc-600">
                  BAH is designed to cover median rental costs — not average or premium rents. Members
                  living in above-median housing pay the difference out of pocket; those in below-median
                  housing keep the surplus.
                </p>
              </li>
            </ul>
          </div>

          {/* Calculator CTAs */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-1">What to do next</h2>
            <p className="text-zinc-400 text-sm mb-5">
              BAH is the starting point. Here are the calculations that matter most for your PCS decision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/calculators/compare"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>Compare {station.name} to another duty station</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/calculators/total-compensation"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>See your total military compensation at {station.name}</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/calculators/pcs"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>Estimate your PCS move costs</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/blog/how-bah-builds-wealth"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors"
              >
                <span>How BAH can build long-term wealth</span>
                <span className="ml-3 flex-none">→</span>
              </Link>
            </div>
          </div>

          {/* Nearby Stations */}
          {nearbyData.length > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Nearby &amp; Comparable Installations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nearbyData.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/bah/${s.slug}`}
                    className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
                  >
                    <p className="font-semibold text-zinc-900 text-sm mb-1">{s.name}</p>
                    <p className="text-xs text-zinc-500 mb-2">{s.city}, {s.state}</p>
                    {s.e5Rate && (
                      <p className="text-sm font-semibold text-red-700">
                        {fmt(s.e5Rate)}/mo{' '}
                        <span className="text-xs font-normal text-zinc-400">E-5 w/dep</span>
                      </p>
                    )}
                    {s.oconus && <p className="text-xs text-amber-600">OCONUS — OHA applies</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Data source disclaimer */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600 mb-1">Data Source &amp; Disclaimer</p>
            <p>
              BAH rates are from the Defense Travel Management Office (DTMO) 2026 BAH data, effective
              January 1, 2026. Rates are set by Military Housing Area (MHA), not individual ZIP code —
              all ZIPs in the same MHA receive identical rates. This page is for informational purposes
              only and is not affiliated with DoD, DTMO, or any government agency. Verify your
              entitlement at{' '}
              <a
                href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                travel.dod.mil
              </a>
              .
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
