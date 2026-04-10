'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ActSteps } from '@/components/calculators/shared/ActStep';
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
    description: 'Government contracts a moving company. No PPM profit, but no hassle.',
  },
  {
    value: 'full-ppm',
    label: 'Full PPM / DITY',
    description: 'You move everything yourself. Reimbursed at government cost estimate — profit is taxable.',
  },
  {
    value: 'partial-ppm',
    label: 'Partial PPM',
    description: 'Government ships most items; you self-move a portion for additional reimbursement.',
  },
];

// ─── Action step builder ──────────────────────────────────────────────────────

function buildActionSteps(input: PCSInput, output: PCSOutput): ActionStep[] {
  const steps: ActionStep[] = [];
  const isPPM = input.moveType !== 'gov';

  if (isPPM && output.ppmAfterTaxProfit > 2000) {
    steps.push({
      label: 'PPM profit opportunity',
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
      label: 'PPM not profitable at these inputs',
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
    description: `VA loans require $0 down payment and no PMI — your BAH can cover the mortgage while you build equity instead of paying rent. See how VA loans work at VARefinance.com.`,
    href: 'https://www.varefinance.com',
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
  const [distance, setDistance] = useState(500);
  const [numPOVs, setNumPOVs] = useState<1 | 2>(1);
  const [hhgWeight, setHhgWeight] = useState(5000);
  const [tleOldDays, setTleOldDays] = useState(0);
  const [tleNewDays, setTleNewDays] = useState(0);
  const [ppmExpenses, setPpmExpenses] = useState(2000);

  const weightAllowance = useMemo(() => getWeightAllowance(rank), [rank]);

  const input: PCSInput = useMemo(() => ({
    rank,
    hasDependents,
    numDependents: hasDependents ? numDependents : 0,
    moveType,
    distance: Math.max(0, distance),
    numPOVs,
    hhgWeight: Math.min(hhgWeight, weightAllowance),
    tleOldDays,
    tleNewDays,
    ppmExpenses,
  }), [rank, hasDependents, numDependents, moveType, distance, numPOVs, hhgWeight, weightAllowance, tleOldDays, tleNewDays, ppmExpenses]);

  const output: PCSOutput = useMemo(() => calculatePCS(input), [input]);
  const actionSteps = useMemo(() => buildActionSteps(input, output), [input, output]);

  const isPPM = moveType !== 'gov';
  const tleDays = Math.min(tleOldDays + tleNewDays, 14);
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

                <div>
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <input
                    id="distance"
                    type="number"
                    min={0}
                    max={5000}
                    value={distance}
                    onChange={(e) => setDistance(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    Use the official{' '}
                    <a
                      href="https://www.dtod.sddc.army.mil"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      DTOD calculator
                    </a>{' '}
                    for the authorized distance on your orders.
                  </p>
                </div>

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
                      max={10}
                      value={tleOldDays}
                      onChange={(e) => setTleOldDays(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tleNew">TLE days — new station</Label>
                    <input
                      id="tleNew"
                      type="number"
                      min={0}
                      max={10}
                      value={tleNewDays}
                      onChange={(e) => setTleNewDays(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                </div>
                {tleDays > 0 && (
                  <p className="text-xs text-zinc-500">
                    {tleDays} combined TLE days
                    {tleDays === 14 && ' (14-day maximum)'}
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
              Based on 2026 rates · {output.travelDays} travel {output.travelDays === 1 ? 'day' : 'days'} · {distance.toLocaleString()} miles
            </p>
          </div>

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
              sub={`${distance.toLocaleString()} mi × $0.205 × ${numPOVs} POV${numPOVs > 1 ? 's' : ''}`}
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
              Per diem shown at standard CONUS rates. Actual PCS per diem depends on your orders and may vary — verify with your Finance Office.
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
                label="Gross profit (before tax)"
                value={fmtDecimals(output.ppmGrossProfit)}
              />
              <EntitlementRow
                label="After-tax profit (≈22% federal)"
                value={fmtDecimals(output.ppmAfterTaxProfit)}
                highlight={output.ppmAfterTaxProfit > 0}
                sub="PPM profit above expenses is taxable income"
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
                  <p className="text-xs text-zinc-400 mt-1">Includes after-tax profit</p>
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
