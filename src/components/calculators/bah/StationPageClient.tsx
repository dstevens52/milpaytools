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
import { EmailSignup } from '@/components/EmailSignup';

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
  nationalAvgs: { w: Record<string, number>; wo: Record<string, number> };
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

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

// ─── Branch emblem helpers ────────────────────────────────────────────────────

const BRANCH_EMBLEM: Record<string, string> = {
  'Army': 'army',
  'Navy': 'navy',
  'Air Force': 'air-force',
  'Marine Corps': 'marines',
  'Space Force': 'space-force',
  'Coast Guard': 'coast-guard',
};

// Slug-level overrides for joint bases where the lead branch needs explicit mapping
const JOINT_BASE_EMBLEM: Record<string, string> = {
  'joint-base-lewis-mcchord': 'army',
  'joint-base-san-antonio': 'air-force',
  'joint-base-andrews': 'air-force',
  'joint-base-pearl-harbor-hickam': 'navy',
  'joint-base-elmendorf-richardson': 'air-force',
  'joint-base-charleston': 'air-force',
  'joint-base-langley-eustis': 'air-force',
  'joint-base-mcguire-dix-lakehurst': 'air-force',
};

function getBranchEmblem(station: DutyStation): string | null {
  if (JOINT_BASE_EMBLEM[station.slug]) return JOINT_BASE_EMBLEM[station.slug];
  for (const branch of station.branches) {
    if (BRANCH_EMBLEM[branch]) return BRANCH_EMBLEM[branch];
  }
  return null;
}

// ─── HeroBanner sub-component ─────────────────────────────────────────────────

const HERO_STEPS = [
  { title: 'Check your rate', sub: 'Select your rank and dependent status below' },
  { title: 'See what it buys', sub: 'Compare your BAH to local rent and mortgage costs' },
  { title: 'Plan your move', sub: 'Compare stations or estimate PCS costs' },
] as const;

function HeroBanner({ station, description }: { station: DutyStation; description?: string }) {
  const subtitle = [
    `${station.city}, ${station.stateName}`,
    station.branches.join(' / '),
    station.formerName ? `Formerly ${station.formerName}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const emblemFile = getBranchEmblem(station);

  return (
    <div className="relative overflow-hidden bg-slate-800">
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
      {/* Branch emblem watermark */}
      {emblemFile && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/branches/${emblemFile}.svg`}
          alt=""
          aria-hidden="true"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-28 sm:w-44 md:w-56 pointer-events-none select-none opacity-[0.15] sm:opacity-[0.22]"
        />
      )}
      {/* Content — relative so it paints above the absolute layers */}
      <div className="relative">
        {/* Hero text */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-5 sm:pb-6">
          <span className="inline-flex items-center mb-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white/90 bg-white/15 border border-white/20">
            2026 BAH Rates
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">
            {station.name}
          </h1>
          <p className="text-sm text-white/60">{subtitle}</p>
          {station.installationDetail && (
            <p className="text-xs text-white/45 mt-1">{station.installationDetail}</p>
          )}
          {description && station.bahVsHousing && (
            <p className="mt-3 text-sm leading-relaxed max-w-[640px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {description}
            </p>
          )}
        </div>
        {/* 3-step plan strip — inside the dark hero */}
        <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
            {HERO_STEPS.map((step, i) => (
              <div
                key={step.title}
                className={[
                  'flex items-start gap-3 flex-1',
                  i > 0 ? 'sm:pl-6 sm:border-l sm:border-white/10' : '',
                  i < HERO_STEPS.length - 1 ? 'sm:pr-6' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{step.title}</p>
                  <p className="text-xs text-white/50">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Photo credit — bottom-right, only when photo present */}
      {station.heroImage && (
        <p className="absolute bottom-2 right-3 text-xs text-white/35 select-none z-10">
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

// ─── ShareButton sub-component ───────────────────────────────────────────────

function ShareButton({ station }: { station: DutyStation }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = window.location.href;
    const title = `${station.name} BAH Rates 2026 | MilPayTools`;
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 768);
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cancelled or not supported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
        copied
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-700 text-white hover:bg-red-800',
      ].join(' ')}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Link copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share {station.name} BAH rates
        </>
      )}
    </button>
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
  nationalAvgs,
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
  const natAvg = (hasDependents ? nationalAvgs.w : nationalAvgs.wo)[selectedGrade] ?? 0;
  const selectedDiff = selectedBAH - natAvg;

  const availableGrades = useMemo(
    () => BAH_GRADE_ORDER.filter((g) => ratesW[g] !== undefined || ratesWO[g] !== undefined),
    [ratesW, ratesWO]
  );

  const hasRichData = !!station.bahVsHousing;
  const depLabel = hasDependents ? 'w/dep' : 'w/o dep';

  const surplus = station.bahVsHousing ? selectedBAH - station.bahVsHousing.medianRent : 0;
  const templateVars: Record<string, string> = {
    rank: `${selectedGrade} ${hasDependents ? 'with dependents' : 'without dependents'}`,
    grade: selectedGrade,
    bahAmount: fmt(selectedBAH),
    surplus: fmt(Math.abs(surplus)),
  };
  const heroDescription = station.description ? interpolate(station.description, templateVars) : undefined;

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
      <HeroBanner station={station} description={heroDescription} />

      {/* Share bar — after hero, before main content */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center">
          <ShareButton station={station} />
        </div>
      </div>

      <div className="bg-zinc-50 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Quick Reference accordion */}
          {hasRates && (
            <details className="rounded-lg border border-zinc-200 bg-white overflow-hidden group">
              <summary className="px-4 py-2.5 text-xs font-medium text-zinc-500 cursor-pointer select-none flex items-center justify-between hover:bg-zinc-50 transition-colors [&::-webkit-details-marker]:hidden">
                <span>Quick reference: 2026 BAH rates at {station.name}</span>
                <svg className="w-3.5 h-3.5 text-zinc-400 flex-none transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-3 pt-2 border-t border-zinc-100">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  For 2026, BAH rates at {station.name} ({locationName} MHA) are:{' '}
                  E-4 with dependents: <strong>{fmt(ratesW['E-4'] ?? 0)}/mo</strong>{' '}
                  &middot; E-5 without dependents: <strong>{fmt(ratesWO['E-5'] ?? 0)}/mo</strong>{' '}
                  &middot; E-5 with dependents: <strong>{fmt(ratesW['E-5'] ?? 0)}/mo</strong>{' '}
                  &middot; E-6 with dependents: <strong>{fmt(ratesW['E-6'] ?? 0)}/mo</strong>{' '}
                  &middot; E-7 with dependents: <strong>{fmt(ratesW['E-7'] ?? 0)}/mo</strong>{' '}
                  &middot; O-3 with dependents: <strong>{fmt(ratesW['O-3'] ?? 0)}/mo</strong>.{' '}
                  BAH is excluded from federal taxable income. Full rates for all pay grades are in the table below.
                </p>
              </div>
            </details>
          )}

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

          {/* OCONUS notice — OHA explanation */}
          {station.oconus && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <p className="font-semibold text-amber-800 mb-3">OCONUS Assignment — OHA, Not BAH</p>
              <p className="text-sm text-amber-700 leading-relaxed mb-3">
                Members assigned to {station.name} receive{' '}
                <strong>Overseas Housing Allowance (OHA)</strong> instead of BAH. OHA works
                differently from BAH in several important ways:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <strong>OHA covers actual rent</strong> up to a location-specific ceiling — not a flat rate like BAH. You receive your actual rent amount, up to the authorized maximum.
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    A separate <strong>Utility/Recurring Maintenance Allowance (URMA)</strong> is paid on top of OHA to help offset overseas utility costs.
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <strong>Move-In Housing Allowance (MIHA)</strong> is available to help cover security deposits, real estate agent fees, and certain one-time move-in costs unique to overseas markets.
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    OHA rates are set by location and <strong>updated more frequently than BAH</strong> — often quarterly — to account for exchange rate changes and local market shifts.
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    If living in <strong>government or on-base housing</strong>, OHA is forfeited — the same rule that applies to BAH.
                  </p>
                </li>
              </ul>
              <p className="text-sm text-amber-700 leading-relaxed mb-2">
                Use the{' '}
                <a
                  href="https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  DTMO OHA calculator at travel.dod.mil
                </a>{' '}
                for your specific OHA ceiling. Contact your gaining unit&apos;s housing office for current local rates and MIHA entitlements.
              </p>
              <p className="text-sm text-amber-700 italic">{station.rentalNote}</p>
            </div>
          )}

          {/* OCONUS COLA */}
          {station.oconus && station.oconusContent && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-base font-semibold text-zinc-900 mb-3">OCONUS COLA</h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                {station.oconusContent.colaNote}
              </p>
              <Link
                href="/calculators/cola"
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                View CONUS COLA calculator → (OCONUS uses a separate calculation method)
              </Link>
            </div>
          )}

          {/* Location-specific financial context */}
          {station.oconus && station.oconusContent && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Financial context for {station.name}
              </h2>
              <ul className="space-y-3">
                {station.oconusContent.financialContext.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                    <p className="text-sm text-zinc-600 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to know before you move — OCONUS */}
          {station.oconus && station.oconusContent && (
            <div className="rounded-lg bg-sky-50 border border-sky-200 p-5">
              <p className="text-sm font-semibold text-sky-900 mb-3">
                What to know before you move to {station.name}
              </p>
              <ul className="space-y-3">
                {station.oconusContent.whatToKnow.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-none mt-1.5" />
                    <p className="text-sm text-sky-800 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What Your BAH Buys Here */}
          {!station.oconus && station.bahVsHousing && selectedBAH > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">What Your BAH Buys Here</h2>
              <p className="text-sm text-zinc-500 mb-5">
                {selectedBAH - station.bahVsHousing.medianRent >= 0
                  ? `If you rent at median, you keep about ${fmt(selectedBAH - station.bahVsHousing.medianRent)}/month. But what about buying?`
                  : `At median rent, BAH runs short by about ${fmt(station.bahVsHousing.medianRent - selectedBAH)}/month. Here's how buying compares:`
                }
              </p>

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
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">How This Market Compares</h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                {station.rentalContext
                  ? `${station.name} BAH for ${selectedGrade} ${hasDependents ? 'with dependents' : 'without dependents'} is ${fmt(Math.abs(selectedDiff))}/mo ${selectedDiff >= 0 ? 'above' : 'below'} the national average — ${selectedDiff >= 0 ? 'and' : 'but'} ${station.rentalContext}`
                  : station.rentalNote}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
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
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Natl median {selectedGrade} {depLabel}
                  </p>
                  <p className="text-2xl font-bold text-zinc-500 tabular-nums">
                    {fmt(natAvg)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                </div>
                <div
                  className={[
                    'rounded-lg border p-4',
                    selectedDiff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
                  ].join(' ')}
                >
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">vs. natl avg</p>
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

          {/* Mid-page CTA — catches users at peak engagement after looking up their rate */}
          {hasRates && (
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <span className="absolute inset-y-0 left-0 w-1 bg-red-600" />
              <div className="p-6 pl-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">
                  Calculator
                </p>
                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  BAH is just one piece of your pay
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                  See your full compensation at {station.name} — including base pay, BAS, tax
                  advantages, and what a civilian would need to earn to match it.
                </p>
                <Link
                  href={`/calculators/total-compensation?rank=${selectedGrade}&zip=${station.zip}&dependents=${hasDependents ? 'yes' : 'no'}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
                >
                  Calculate your total compensation →
                </Link>
              </div>
            </div>
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
                {station.localHousingTips.groceryNote && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    Groceries run about {station.localHousingTips.groceryNote}.
                  </p>
                </li>
                )}
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">{station.localHousingTips.stateTaxNote}</p>
                </li>
              </ul>

              <div className="rounded-lg bg-sky-50 border border-sky-200 p-4">
                <p className="text-sm font-semibold text-sky-900 mb-1">What to know before you move</p>
                <p className="text-sm text-sky-700 leading-relaxed">
                  {interpolate(station.localHousingTips.mistakeToAvoid, templateVars)}
                </p>
              </div>
            </div>
          )}

          {/* Key Insights — only for basic pages without full StoryBrand sections */}
          {!hasRichData && (
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
          )}

          {/* Housing data master disclaimer */}
          {station.bahVsHousing && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Housing data is approximate and provided for informational and educational purposes only. Median rents and home prices reflect market estimates at time of publication and may not reflect current conditions. School ratings are sourced from third-party services and reflect their methodology. MilPayTools does not endorse specific neighborhoods, properties, landlords, or housing decisions. Always verify figures independently and consult with a qualified professional before making financial commitments.
              </p>
            </div>
          )}

          {/* FAQ section */}
          {hasRates && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                    What is the 2026 BAH rate at {station.name}?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    BAH at {station.name} depends on pay grade and dependent status. For 2026, {locationName} MHA rates include:{' '}
                    E-5 with dependents <strong>{fmt(ratesW['E-5'] ?? 0)}/mo</strong>,{' '}
                    E-6 with dependents <strong>{fmt(ratesW['E-6'] ?? 0)}/mo</strong>,{' '}
                    E-7 with dependents <strong>{fmt(ratesW['E-7'] ?? 0)}/mo</strong>,{' '}
                    and O-3 with dependents <strong>{fmt(ratesW['O-3'] ?? 0)}/mo</strong>.{' '}
                    E-5 without dependents is <strong>{fmt(ratesWO['E-5'] ?? 0)}/mo</strong>.{' '}
                    BAH is excluded from federal taxable income.
                  </p>
                </div>
                <div className="border-t border-zinc-100 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                    Is BAH at {station.name} taxable income?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    No. BAH is excluded from federal taxable income under the Military Pay Tax Exclusion. Most states also exempt BAH and BAS from state income tax, though treatment varies by state. Service members keep the full dollar value of their housing allowance — a significant financial advantage over taxable income of the same amount.
                  </p>
                </div>
                <div className="border-t border-zinc-100 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                    What Military Housing Area (MHA) does {station.name} use for BAH?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {station.name} is assigned to the {locationName} Military Housing Area (MHA). All service members stationed at {station.name} receive BAH rates set for this MHA, regardless of their exact address within the area. Rates are published annually by the Defense Travel Management Office (DTMO) and take effect January 1 each year.
                  </p>
                </div>
                <div className="border-t border-zinc-100 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                    Can I afford to buy a home near {station.name} using BAH?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {station.bahVsHousing
                      ? <>
                          Local median home prices run approximately <strong>{fmt(station.bahVsHousing.medianHomePrice)}</strong>, with estimated monthly mortgage payments (PITI) of <strong>{fmt(station.bahVsHousing.mortgageMin)}–{fmt(station.bahVsHousing.mortgageMax)}</strong>. An E-6 with dependents receives <strong>{fmt(ratesW['E-6'] ?? 0)}/mo</strong> in BAH. E-5s with dependents at <strong>{fmt(ratesW['E-5'] ?? 0)}/mo</strong> can cover a significant portion of a median mortgage, particularly with a VA loan eliminating the down payment requirement.
                        </>
                      : <>
                          BAH is designed to cover local housing costs at approximately the 25th percentile of the local rental market. Whether BAH covers a mortgage depends on local home prices, interest rates, and your pay grade. VA loans — which require no down payment — can make homeownership viable on BAH alone in many markets. An E-5 with dependents receives <strong>{fmt(ratesW['E-5'] ?? 0)}/mo</strong> and an E-6 with dependents receives <strong>{fmt(ratesW['E-6'] ?? 0)}/mo</strong> in the {locationName} MHA.
                        </>
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Calculator CTAs */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-1">What to do next</h2>
            <p className="text-zinc-400 text-sm mb-5">
              BAH is the starting point. Here are the calculations that matter most for your PCS decision.
            </p>
            {/* Primary CTA */}
            <Link
              href="/calculators/compare"
              className="flex items-center justify-between px-5 py-3.5 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors mb-4"
            >
              <span>Compare {station.name} to another duty station</span>
              <span className="ml-3 flex-none">→</span>
            </Link>
            {/* Secondary CTAs */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/calculators/total-compensation"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                See your total military compensation at {station.name} →
              </Link>
              <Link
                href="/calculators/pcs"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Estimate your PCS move costs →
              </Link>
              {station.oconus && (
                <Link
                  href="/calculators/deployment"
                  className="text-sm text-zinc-300 hover:text-white transition-colors"
                >
                  Calculate deployment pay for overseas assignments →
                </Link>
              )}
              <Link
                href="/blog/how-bah-builds-wealth"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                How BAH can build long-term wealth →
              </Link>
              <Link
                href="/blog/how-much-does-an-e5-really-make-2026"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                How much does an E-5 really make in 2026? →
              </Link>
            </div>
            {/* Email signup */}
            <div className="border-t border-white/10 mt-5 pt-5">
              <EmailSignup
                variant="inline"
                darkBg
                stationName={station.name}
                source={`bah-${station.slug}`}
                subtext="Updates when rates change. No spam."
              />
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
