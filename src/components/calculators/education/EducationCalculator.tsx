'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { isValidZip } from '@/lib/utils';
import {
  compareAllBenefits,
  type EducationInput,
  type BenefitResult,
  type ServiceStatus,
  type ServiceTier,
  type SchoolType,
  type EnrollmentStatus,
} from '@/lib/calculations/education';
import { SERVICE_TIER_LABELS } from '@/data/education/2026/constants';

// ─── Formatters ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
      {children}
    </p>
  );
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-700 mb-2">{label}</p>
      <div className="flex rounded-md border border-zinc-300 overflow-hidden w-fit">
        {options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              'px-3 py-2 text-sm font-medium transition-colors',
              i > 0 ? 'border-l border-zinc-300' : '',
              value === o.value
                ? 'bg-red-700 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Benefit Card ──────────────────────────────────────────────────────────

function BenefitCard({
  benefit,
  isBest,
  mhaMonthsPerYear,
}: {
  benefit: BenefitResult;
  isBest: boolean;
  mhaMonthsPerYear: number;
}) {
  const isMGIB = benefit.id === 'mgib';
  const isTA = benefit.id === 'ta';

  if (!benefit.eligible) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 flex flex-col opacity-60">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-0.5">
            {benefit.shortName}
          </p>
          <p className="font-bold text-zinc-500 text-base">{benefit.name}</p>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-red-500 text-sm">✕</span>
          <p className="text-xs text-zinc-500 leading-snug">{benefit.ineligibleReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        'rounded-lg border p-5 flex flex-col transition-all',
        isBest
          ? 'border-red-700 ring-2 ring-red-100 bg-white'
          : 'border-zinc-200 bg-white',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-0.5">
            {benefit.shortName}
          </p>
          <p className="font-bold text-zinc-900 text-base leading-tight">{benefit.name}</p>
        </div>
        {isBest && (
          <span className="shrink-0 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            Best value
          </span>
        )}
      </div>

      {/* Total program value — headline */}
      <div className="mb-4 pb-4 border-b border-zinc-100">
        <p className="text-xs text-zinc-500 mb-0.5">Total program value</p>
        <p className="text-3xl font-black tabular-nums text-zinc-900">{fmt(benefit.totalProgramValue)}</p>
        <p className="text-xs text-zinc-400">{fmt(benefit.totalAnnualValue)}/year</p>
      </div>

      {/* Breakdown rows */}
      <div className="space-y-2 flex-1">
        {/* Tuition */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-zinc-500">
            {isMGIB ? 'Monthly stipend (all-in-one)' : 'Annual tuition covered'}
          </span>
          <span className="text-sm font-semibold text-zinc-800 tabular-nums">
            {isMGIB
              ? `${fmtD(benefit.monthlyMHA)}/mo`
              : benefit.annualTuitionCoverage === 0 && !isTA
              ? '—'
              : fmt(benefit.annualTuitionCoverage)
            }
          </span>
        </div>

        {/* Housing */}
        {!isMGIB && !isTA && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-500">
              {benefit.monthlyMHA === 0 ? 'Monthly housing' : 'Monthly housing (MHA)'}
            </span>
            <span className="text-sm font-semibold tabular-nums text-zinc-800">
              {benefit.monthlyMHA === 0
                ? <span className="text-zinc-400 font-normal text-xs">BAH on active duty</span>
                : `${fmt(benefit.monthlyMHA)}/mo`
              }
            </span>
          </div>
        )}

        {!isMGIB && !isTA && benefit.monthlyMHA > 0 && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-400">Annual housing ({mhaMonthsPerYear} mo/yr)</span>
            <span className="text-sm tabular-nums text-zinc-600">{fmt(benefit.annualMHA)}</span>
          </div>
        )}

        {/* Books */}
        {!isMGIB && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-500">Annual books/supplies</span>
            <span className="text-sm font-semibold tabular-nums text-zinc-800">
              {benefit.annualBooks === 0
                ? <span className="text-zinc-400 font-normal text-xs">Not covered</span>
                : fmt(benefit.annualBooks)
              }
              {benefit.id === 'vre' && (
                <span className="text-zinc-400 font-normal text-xs ml-1">est.</span>
              )}
            </span>
          </div>
        )}

        {/* Entitlement */}
        <div className="flex items-baseline justify-between gap-2 pt-1 mt-1 border-t border-zinc-50">
          <span className="text-xs text-zinc-500">Entitlement</span>
          <span className="text-xs text-zinc-600">
            {benefit.entitlementMonths === 0
              ? 'Annual, renewable'
              : `${benefit.entitlementMonths} months`
            }
          </span>
        </div>

        {/* Transferable */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-zinc-500">Transferable</span>
          <span className={`text-xs font-medium ${benefit.transferable ? 'text-green-700' : 'text-zinc-400'}`}>
            {benefit.transferable ? '✓ Yes (6+ yr service)' : '✕ No'}
          </span>
        </div>
      </div>

      {/* Notes */}
      {benefit.notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1">
          {benefit.notes.slice(0, 3).map((note, i) => (
            <p key={i} className="text-xs text-zinc-500 leading-snug">
              · {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function EducationCalculator() {
  // ── Inputs ────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<ServiceStatus>('veteran');
  const [serviceTier, setServiceTier] = useState<ServiceTier>('36mo+');
  const [vaRating, setVaRating] = useState<number>(0);
  const [schoolType, setSchoolType] = useState<SchoolType>('public');
  const [schoolZip, setSchoolZip] = useState('92101'); // San Diego default
  const [annualTuition, setAnnualTuition] = useState(12000);
  const [programYears, setProgramYears] = useState(4);
  const [enrollment, setEnrollment] = useState<EnrollmentStatus>('full');

  const zipValid = isValidZip(schoolZip);

  const input: EducationInput = useMemo(() => ({
    status,
    serviceTier,
    vaRating,
    schoolType,
    schoolZip: schoolZip.padStart(5, '0'),
    annualTuition,
    programYears,
    enrollment,
  }), [status, serviceTier, vaRating, schoolType, schoolZip, annualTuition, programYears, enrollment]);

  const result = useMemo(() => compareAllBenefits(input), [input]);

  const mhaMonthsPerYear = 9; // display constant (matches EDUCATION_RATES.giBill.mhaMonthsPerYear)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Input panel ────────────────────────────────────────────────── */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

          {/* Left column: Your situation */}
          <div className="space-y-5">
            <SectionLabel>Your Situation</SectionLabel>

            <RadioGroup<ServiceStatus>
              label="Service status"
              options={[
                { value: 'veteran', label: 'Veteran' },
                { value: 'active-duty', label: 'Active duty' },
                { value: 'guard-reserve', label: 'Guard/Reserve' },
              ]}
              value={status}
              onChange={setStatus}
            />

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Active duty time since Sep 10, 2001
              </label>
              <select
                value={serviceTier}
                onChange={(e) => setServiceTier(e.target.value as ServiceTier)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {Object.entries(SERVICE_TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-400 mt-1">
                Determines Post-9/11 GI Bill eligibility tier (40%–100%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                VA disability rating
              </label>
              <select
                value={vaRating}
                onChange={(e) => setVaRating(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                <option value={0}>None</option>
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
              <p className="text-xs text-zinc-400 mt-1">
                10%+ may qualify for VR&E (requires employment barrier determination)
              </p>
            </div>
          </div>

          {/* Right column: School details */}
          <div className="space-y-5">
            <SectionLabel>School Details</SectionLabel>

            <RadioGroup<SchoolType>
              label="School type"
              options={[
                { value: 'public', label: 'Public (in-state)' },
                { value: 'private', label: 'Private' },
                { value: 'online', label: 'Online only' },
              ]}
              value={schoolType}
              onChange={setSchoolType}
            />

            {schoolType !== 'online' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  School ZIP code
                  <span className="font-normal text-zinc-400 ml-1">(for MHA lookup)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 92101"
                  value={schoolZip}
                  onChange={(e) => setSchoolZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className={[
                    'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2',
                    zipValid || schoolZip.length < 5
                      ? 'border-zinc-300 focus:ring-red-700'
                      : 'border-amber-400 focus:ring-amber-400',
                  ].join(' ')}
                />
                {result.locationName && (
                  <p className="text-xs text-green-700 mt-1">
                    {result.locationName} — E-5 w/dep BAH:{' '}
                    {result.mhaMonthly ? `${fmt(result.mhaMonthly)}/mo` : 'not found'}
                  </p>
                )}
                {schoolZip.length === 5 && !zipValid && (
                  <p className="text-xs text-amber-600 mt-1">ZIP code not found in BAH dataset</p>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  GI Bill MHA = E-5 with-dependents BAH at your school's ZIP code
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Annual tuition &amp; fees
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step={1000}
                  value={annualTuition}
                  onChange={(e) => setAnnualTuition(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-zinc-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Public in-state: ~$10,000–12,000/yr · Private: ~$35,000–40,000/yr
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Program length</label>
                <select
                  value={programYears}
                  onChange={(e) => setProgramYears(Number(e.target.value))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                >
                  <option value={2}>2 years (Associate/Master's)</option>
                  <option value={4}>4 years (Bachelor's)</option>
                  <option value={1}>1 year (Certificate)</option>
                  <option value={3}>3 years (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Enrollment</label>
                <select
                  value={enrollment}
                  onChange={(e) => setEnrollment(e.target.value as EnrollmentStatus)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                >
                  <option value="full">Full-time</option>
                  <option value="three-quarter">Three-quarter time</option>
                  <option value="half">Half-time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── MHA note ───────────────────────────────────────────────────── */}
      {schoolType !== 'online' && result.mhaMonthly && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 leading-relaxed">
          MHA shown using 2026 BAH rates (effective Jan 1, 2026). The current academic year
          (through Jul 31, 2026) uses 2025 BAH rates, which may differ slightly. Both GI Bill
          and VR&E housing allowances are based on E-5 with-dependents BAH at the school&apos;s ZIP code.
        </div>
      )}

      {/* ── Benefits comparison grid ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Side-by-Side Comparison
          <span className="ml-2 text-sm font-normal text-zinc-400">
            {programYears}-year program · {enrollment === 'full' ? 'Full-time' : enrollment === 'three-quarter' ? '¾ time' : '½ time'}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {result.benefits.map((b) => (
            <BenefitCard
              key={b.id}
              benefit={b}
              isBest={b.id === result.bestBenefitId}
              mhaMonthsPerYear={mhaMonthsPerYear}
            />
          ))}
        </div>
      </div>

      {/* ── Insights ───────────────────────────────────────────────────── */}
      {result.insights.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-900 text-base mb-4">What This Means for You</h3>
          <div className="space-y-3">
            {result.insights.map((insight, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-700 leading-relaxed">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Cross-links ─────────────────────────────────────────────────── */}
      <Card>
        <h3 className="font-semibold text-zinc-900 text-base mb-3">Related Tools &amp; Guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/calculators/bah"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">🏠</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">BAH Calculator</p>
              <p className="text-xs text-zinc-500 mt-0.5">Look up E-5 BAH for any school ZIP — the GI Bill MHA is this rate</p>
            </div>
          </Link>
          <Link
            href="/calculators/va-disability"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">🎖️</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">VA Disability Calculator</p>
              <p className="text-xs text-zinc-500 mt-0.5">Calculate your combined VA rating — 10%+ may open VR&E eligibility</p>
            </div>
          </Link>
          <Link
            href="/blog/gi-bill-vs-tuition-assistance"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">📖</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">GI Bill vs. Tuition Assistance</p>
              <p className="text-xs text-zinc-500 mt-0.5">Why active duty members should usually use TA first and save GI Bill</p>
            </div>
          </Link>
          <Link
            href="/blog/vre-chapter-31-vs-gi-bill"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">📖</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">VR&amp;E vs. GI Bill</p>
              <p className="text-xs text-zinc-500 mt-0.5">The benefit most veterans overlook — especially at expensive schools</p>
            </div>
          </Link>
          <Link
            href="/blog/gi-bill-housing-allowance-zip-code"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">📖</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">GI Bill Housing Allowance Guide</p>
              <p className="text-xs text-zinc-500 mt-0.5">Why your school's ZIP code matters more than tuition</p>
            </div>
          </Link>
          <Link
            href="/blog/post-911-gi-bill-explained-2026"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            <span className="text-xl flex-none">📖</span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">Post-9/11 GI Bill Explained</p>
              <p className="text-xs text-zinc-500 mt-0.5">Complete 2026 breakdown — tiers, MHA, books, transfer rules</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
        <p className="text-xs font-semibold text-zinc-600 mb-1">Important disclaimer</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          This tool compares education benefits for planning purposes only. Actual benefit amounts
          depend on VA eligibility determinations, school certifying official verification, and
          current VA payment rates. VR&amp;E eligibility requires counselor evaluation — a disability
          rating alone does not guarantee approval. Tuition Assistance policies vary by branch.
          Montgomery GI Bill eligibility requires the $1,200 buy-in and applicable service
          requirements. MHA shown using 2026 BAH data; academic year rates effective August 1, 2026.
          Verify all benefits with{' '}
          <a href="https://www.va.gov/education/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
            VA.gov
          </a>{' '}
          and your installation education office. This is not financial or legal advice.
        </p>
      </div>
    </div>
  );
}
