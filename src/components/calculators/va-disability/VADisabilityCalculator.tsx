'use client';

import { useState, useMemo, useId } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import {
  calculateCombinedRating,
  getCompensation,
  whatIfAddRating,
  type DisabilityEntry,
  type DependentStatus,
  type CalculationStep,
} from '@/lib/calculations/va-disability';

// ─── Constants ─────────────────────────────────────────────────────────────

const VA_RATINGS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const BODY_LOCATIONS: Array<{
  value: string;
  label: string;
  side: 'left' | 'right' | 'none';
  pairKey: string | null;
}> = [
  { value: 'other',      label: 'Other / Non-extremity',      side: 'none',  pairKey: null  },
  { value: 'left-arm',   label: 'Left Arm / Shoulder',        side: 'left',  pairKey: 'arm' },
  { value: 'right-arm',  label: 'Right Arm / Shoulder',       side: 'right', pairKey: 'arm' },
  { value: 'left-leg',   label: 'Left Leg / Knee / Ankle',    side: 'left',  pairKey: 'leg' },
  { value: 'right-leg',  label: 'Right Leg / Knee / Ankle',   side: 'right', pairKey: 'leg' },
  { value: 'left-eye',   label: 'Left Eye',                   side: 'left',  pairKey: 'eye' },
  { value: 'right-eye',  label: 'Right Eye',                  side: 'right', pairKey: 'eye' },
];

const WHAT_IF_RATINGS = [10, 20, 30, 40, 50];

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function stepBg(type: CalculationStep['type']): string {
  if (type === 'bilateral-header') return 'bg-blue-50 border-blue-200 font-medium text-blue-900';
  if (type === 'bilateral-apply') return 'bg-blue-50/50 border-blue-100 text-blue-800';
  if (type === 'bilateral-factor') return 'bg-blue-100 border-blue-200 font-medium text-blue-900';
  if (type === 'result') return 'bg-zinc-100 border-zinc-300 font-semibold text-zinc-900';
  if (type === 'round') return 'bg-red-50 border-red-200 font-bold text-red-800';
  if (type === 'init') return 'bg-zinc-50 border-zinc-200 text-zinc-600';
  if (type === 'sort') return 'bg-zinc-50 border-zinc-200 text-zinc-600 italic';
  return 'bg-white border-zinc-200 text-zinc-700';
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepBreakdown({ steps, collapsed }: { steps: CalculationStep[]; collapsed: boolean }) {
  if (collapsed || steps.length === 0) return null;
  return (
    <div className="space-y-1.5 mt-3">
      {steps.map((s, i) => (
        <div
          key={i}
          className={['rounded border px-3 py-2 text-sm', stepBg(s.type)].join(' ')}
        >
          <span className="font-medium">{s.label}</span>
          {s.detail && s.detail !== s.label && (
            <span className="ml-2 font-normal opacity-80">{s.detail}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function VADisabilityCalculator() {
  const uid = useId();
  const [disabilities, setDisabilities] = useState<DisabilityEntry[]>([]);
  const [dependentStatus, setDependentStatus] = useState<DependentStatus>('alone');
  const [showSteps, setShowSteps] = useState(true);

  // New disability form state
  const [newRating, setNewRating] = useState<number>(10);
  const [newLocation, setNewLocation] = useState<string>('other');
  const [newLabel, setNewLabel] = useState('');

  // ── Derived calculation ────────────────────────────────────────────────
  const result = useMemo(() => calculateCombinedRating(disabilities), [disabilities]);
  const compensation = useMemo(
    () => getCompensation(result.rounded, dependentStatus),
    [result.rounded, dependentStatus]
  );

  // What-if scenarios
  const whatIfResults = useMemo(() => {
    if (disabilities.length === 0) return [];
    return WHAT_IF_RATINGS.map((r) => {
      const { newRounded } = whatIfAddRating(disabilities, r);
      const newComp = getCompensation(newRounded, dependentStatus);
      const diff = newComp.monthly - compensation.monthly;
      return { rating: r, newRounded, newMonthly: newComp.monthly, diff };
    }).filter((w) => w.newRounded !== result.rounded);
  }, [disabilities, result.rounded, dependentStatus, compensation.monthly]);

  // ── Add disability ────────────────────────────────────────────────────
  function addDisability() {
    const loc = BODY_LOCATIONS.find((l) => l.value === newLocation)!;
    setDisabilities((prev) => [
      ...prev,
      {
        id: `${uid}-${Date.now()}`,
        rating: newRating,
        label: newLabel.trim(),
        side: loc.side,
        pairKey: loc.pairKey,
      },
    ]);
    setNewLabel('');
    setNewRating(10);
    setNewLocation('other');
  }

  function removeDisability(id: string) {
    setDisabilities((prev) => prev.filter((d) => d.id !== id));
  }

  // ── TDIU threshold note ───────────────────────────────────────────────
  const hasHighSingle = disabilities.some((d) => d.rating >= 60);
  const hasMediumSingle = disabilities.some((d) => d.rating >= 40);
  const tdiuNote =
    result.rounded >= 70 && hasMediumSingle
      ? 'You may qualify for TDIU (Total Disability based on Individual Unemployability) if unable to maintain substantially gainful employment. Contact your VSO.'
      : result.rounded === 60 && hasHighSingle
      ? 'At 60% with a single 60%+ disability, you may qualify for TDIU if unable to work.'
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Input panel ──────────────────────────────────────────────── */}
      <Card>
        <h2 className="font-semibold text-zinc-900 text-base mb-4">Your Disability Ratings</h2>

        {/* Current list */}
        {disabilities.length > 0 && (
          <div className="mb-4 space-y-2">
            {disabilities.map((d) => {
              const loc = BODY_LOCATIONS.find(
                (l) => l.side === d.side && l.pairKey === d.pairKey
              ) ?? BODY_LOCATIONS[0];
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg font-bold text-red-700 tabular-nums w-12 shrink-0">
                      {d.rating}%
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {d.label || loc.label}
                      </p>
                      {d.label && (
                        <p className="text-xs text-zinc-500">{loc.label}</p>
                      )}
                    </div>
                    {d.pairKey && (
                      <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        bilateral
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDisability(d.id)}
                    className="shrink-0 text-zinc-400 hover:text-red-600 transition-colors p-1 rounded"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add form */}
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Add a disability
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Rating */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Rating</label>
              <div className="flex flex-wrap gap-1.5">
                {VA_RATINGS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRating(r)}
                    className={[
                      'px-2.5 py-1 rounded text-sm font-medium border transition-colors',
                      newRating === r
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400',
                    ].join(' ')}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Body location */}
            <Select
              label="Body Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              options={BODY_LOCATIONS.map((l) => ({ value: l.value, label: l.label }))}
            />

            {/* Label */}
            <Input
              label="Condition Label (optional)"
              placeholder="e.g. PTSD, tinnitus, knee"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addDisability(); }}
            />
          </div>
          <button
            type="button"
            onClick={addDisability}
            className="px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-md hover:bg-red-800 transition-colors"
          >
            + Add Rating
          </button>
        </div>

        {/* Dependent status */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <label className="text-sm font-medium text-zinc-700 block mb-2">
            Dependent Status <span className="font-normal text-zinc-500">(affects compensation at 30%+)</span>
          </label>
          <div className="flex rounded-md border border-zinc-300 overflow-hidden w-fit">
            {(['alone', 'with-spouse'] as DependentStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDependentStatus(s)}
                className={[
                  'px-4 py-2 text-sm font-medium transition-colors',
                  s !== 'alone' ? 'border-l border-zinc-300' : '',
                  dependentStatus === s
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                {s === 'alone' ? 'Veteran Alone' : 'With Spouse'}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            Additional dependent combinations (children, parents, spouse A&amp;A) available on{' '}
            <a href="https://www.va.gov/disability/compensation-rates/veteran-rates/" target="_blank" rel="noopener noreferrer" className="underline">VA.gov</a>.
          </p>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {disabilities.length === 0 ? (
        <Card>
          <p className="text-zinc-400 text-sm text-center py-6">
            Add at least one disability rating above to see your combined rating.
          </p>
        </Card>
      ) : (
        <>
          {/* Primary result */}
          <Card variant="result">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Combined rating */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                  Combined Rating
                </p>
                <p className="text-6xl font-black text-red-700 tabular-nums leading-none">
                  {result.rounded}
                  <span className="text-2xl font-bold ml-1">%</span>
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Exact: {result.exact.toFixed(1)}% → rounds to {result.rounded}%
                </p>
                {result.bilateralApplied && (
                  <p className="text-xs text-blue-700 mt-1 font-medium">
                    Bilateral factor applied (+
                    {result.bilateralPairs
                      .reduce((acc, p) => acc + p.factorAddition, 0)
                      .toFixed(1)}
                    %)
                  </p>
                )}
              </div>

              {/* Compensation */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                  Monthly Compensation
                </p>
                {result.rounded === 0 ? (
                  <div>
                    <p className="text-2xl font-bold text-zinc-500">$0.00</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      0% ratings establish service connection but carry no compensation.
                      They still count toward combined rating calculations.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl font-bold text-zinc-900 tabular-nums leading-none">
                      {fmt(compensation.monthly)}
                      <span className="text-base font-normal text-zinc-500 ml-1">/mo</span>
                    </p>
                    <p className="text-sm text-zinc-500 mt-1 tabular-nums">
                      {fmt(compensation.annual)}/year · 100% tax-free
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {dependentStatus === 'with-spouse' ? 'With spouse' : 'Veteran alone'} ·{' '}
                      {compensation.dataYear} VA rates
                    </p>
                  </div>
                )}

                {/* TDIU note */}
                {tdiuNote && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
                    {tdiuNote}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Step-by-step breakdown */}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-zinc-900 text-base">
                How Your Rating Was Calculated
              </h3>
              <button
                type="button"
                onClick={() => setShowSteps((v) => !v)}
                className="text-xs text-zinc-500 hover:text-zinc-700 underline"
              >
                {showSteps ? 'Hide' : 'Show'} steps
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-1">
              Per 38 CFR § 4.25 (combined ratings) and § 4.26 (bilateral factor)
            </p>
            <StepBreakdown steps={result.steps} collapsed={!showSteps} />
          </Card>

          {/* Scenario builder */}
          {whatIfResults.length > 0 && (
            <Card>
              <h3 className="font-semibold text-zinc-900 text-base mb-1">What If You Add Another Condition?</h3>
              <p className="text-xs text-zinc-500 mb-3">
                Hypothetical — assumes a non-bilateral condition added at each rating level.
              </p>
              <div className="space-y-2">
                {whatIfResults.map((w) => (
                  <div
                    key={w.rating}
                    className="flex items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-semibold text-zinc-800">
                        Add a {w.rating}% condition
                      </span>
                      <span className="text-sm text-zinc-500 ml-2">
                        → {result.rounded}% becomes <strong>{w.newRounded}%</strong>
                      </span>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-sm font-medium text-green-700">
                        +{fmt(w.diff)}/mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action steps */}
          <Card>
            <h3 className="font-semibold text-zinc-900 text-base mb-3">What This Means</h3>
            <div className="space-y-3">
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 text-sm">VA compensation is 100% tax-free</p>
                  <p className="text-sm text-zinc-600 mt-0.5">
                    {fmt(compensation.monthly)}/month in VA disability compensation is excluded from
                    federal and state income tax and FICA. A civilian earning the same amount would
                    net considerably less after taxes.
                  </p>
                </div>
              </div>

              {result.rounded >= 30 && dependentStatus === 'alone' && (
                <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 text-sm">You qualify for dependent compensation</p>
                    <p className="text-sm text-zinc-600 mt-0.5">
                      At {result.rounded}%, adding a qualifying dependent increases your monthly
                      rate. Toggle "With Spouse" above, or visit VA.gov for children and parent additions.
                    </p>
                  </div>
                </div>
              )}

              {result.rounded >= 50 && (
                <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 text-sm">Additional benefits at 50%+</p>
                    <p className="text-sm text-zinc-600 mt-0.5">
                      At 50% or higher, you may qualify for enhanced healthcare, dental and vision
                      care, and commissary/exchange access. Check your VA eligibility letter or eBenefits.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 text-sm">Verify with VA.gov</p>
                  <p className="text-sm text-zinc-600 mt-0.5">
                    This calculator provides an estimate of your combined rating. Actual ratings
                    are determined by the VA based on your medical evidence and C&P exam findings.{' '}
                    <a
                      href="https://www.va.gov/disability/compensation-rates/veteran-rates/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline"
                    >
                      See official 2026 rates on VA.gov →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
