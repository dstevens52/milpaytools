'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { lookupBAH, isTerritory, isZipInDataset } from '@/lib/calculations/bah';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';

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

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function zipError(zip: string): string | undefined {
  if (zip.length < 5) return undefined;
  if (!/^\d{5}$/.test(zip)) return 'Enter a valid 5-digit ZIP code';
  if (isTerritory(zip)) return 'U.S. territory — BAH does not apply (OHA area)';
  if (!isZipInDataset(zip)) return 'ZIP code not found in BAH dataset';
  return undefined;
}

function isZipReady(zip: string): boolean {
  return (
    zip.length === 5 &&
    /^\d{5}$/.test(zip) &&
    !isTerritory(zip) &&
    isZipInDataset(zip)
  );
}

// ── Result types ──────────────────────────────────────────────────────────────

interface DualResultsNoDeps {
  hasDependents: false;
  m1: number;
  m2: number;
  total: number;
  loc1: string;
  loc2: string;
  dataYear: string;
  scenarioA: null;
  scenarioB: null;
  // 'member1'|'member2' = same-station with different grades, one is clearly higher
  // 'tied'             = same-station, same grade (totals are equal)
  // null               = different stations (policy-based assignment, not a financial choice)
  optimal: null;
  optimalGain: null;
}

interface DualResultsWithDeps {
  hasDependents: true;
  m1: number;
  m2: number;
  total: number;
  loc1: string;
  loc2: string;
  dataYear: string;
  scenarioA: { m1: number; m2: number; total: number };
  scenarioB: { m1: number; m2: number; total: number };
  optimal: 'member1' | 'member2' | 'tied' | null;
  optimalGain: number;
}

type Results = DualResultsNoDeps | DualResultsWithDeps;

// ── Component ─────────────────────────────────────────────────────────────────

export function DualMilitaryBAHCalculator() {
  const [grade1, setGrade1] = useState<PayGrade>('O-3');
  const [grade2, setGrade2] = useState<PayGrade>('E-5');
  const [sameStation, setSameStation] = useState(true);
  const [zip1, setZip1] = useState('');
  const [zip2, setZip2] = useState('');
  const [hasDependents, setHasDependents] = useState(true);
  const [whoClaimsDeps, setWhoClaimsDeps] = useState<'member1' | 'member2'>('member1');

  const zip2Effective = sameStation ? zip1 : zip2;

  const results = useMemo((): Results | null => {
    if (!isZipReady(zip1) || !isZipReady(zip2Effective)) return null;

    if (!hasDependents) {
      // No dependents — both members always receive the without-dependents rate.
      // No claiming decision exists, no comparison needed.
      const r1 = lookupBAH({ zipCode: zip1, payGrade: grade1, hasDependents: false });
      const r2 = lookupBAH({ zipCode: zip2Effective, payGrade: grade2, hasDependents: false });
      if (!r1 || !r2) return null;
      return {
        hasDependents: false,
        m1: r1.monthlyRate,
        m2: r2.monthlyRate,
        total: r1.monthlyRate + r2.monthlyRate,
        loc1: r1.locationName,
        loc2: r2.locationName,
        dataYear: r1.dataYear,
        scenarioA: null,
        scenarioB: null,
        optimal: null,
        optimalGain: null,
      };
    }

    // With dependents — compute both scenarios.
    // Scenario A: member 1 claims (with-deps rate); member 2 does not (without-deps rate).
    const r1A = lookupBAH({ zipCode: zip1, payGrade: grade1, hasDependents: true });
    const r2A = lookupBAH({ zipCode: zip2Effective, payGrade: grade2, hasDependents: false });
    // Scenario B: member 2 claims (with-deps rate); member 1 does not (without-deps rate).
    const r1B = lookupBAH({ zipCode: zip1, payGrade: grade1, hasDependents: false });
    const r2B = lookupBAH({ zipCode: zip2Effective, payGrade: grade2, hasDependents: true });

    if (!r1A || !r2A || !r1B || !r2B) return null;

    const totalA = r1A.monthlyRate + r2A.monthlyRate;
    const totalB = r1B.monthlyRate + r2B.monthlyRate;

    // Optimal configuration is only a financial recommendation for co-located couples.
    // When stationed separately, dependents must be assigned to the member they reside with —
    // this is a policy determination, not a financial optimization choice.
    let optimal: DualResultsWithDeps['optimal'];
    let optimalGain: number;

    if (!sameStation) {
      optimal = null;
      optimalGain = 0;
    } else if (totalA === totalB) {
      // Same grade at the same station — with-dependents premium is identical, totals tie.
      optimal = 'tied';
      optimalGain = 0;
    } else {
      optimal = totalA > totalB ? 'member1' : 'member2';
      optimalGain = Math.abs(totalA - totalB);
    }

    const current =
      whoClaimsDeps === 'member1'
        ? { m1: r1A.monthlyRate, m2: r2A.monthlyRate, total: totalA }
        : { m1: r1B.monthlyRate, m2: r2B.monthlyRate, total: totalB };

    return {
      hasDependents: true,
      m1: current.m1,
      m2: current.m2,
      total: current.total,
      loc1: r1A.locationName,
      loc2: r2A.locationName,
      dataYear: r1A.dataYear,
      scenarioA: { m1: r1A.monthlyRate, m2: r2A.monthlyRate, total: totalA },
      scenarioB: { m1: r1B.monthlyRate, m2: r2B.monthlyRate, total: totalB },
      optimal,
      optimalGain,
    };
  }, [grade1, grade2, zip1, zip2Effective, hasDependents, whoClaimsDeps, sameStation]);

  const actionSteps = useMemo((): ActionStep[] => {
    if (!results) return [];
    const steps: ActionStep[] = [];

    if (results.hasDependents) {
      if (
        results.optimal !== null &&
        results.optimal !== 'tied' &&
        results.optimal !== whoClaimsDeps &&
        results.optimalGain > 0
      ) {
        // Same-station couple with a sub-optimal claiming choice
        steps.push({
          label: 'Consider switching who claims dependents for a higher total household BAH',
          description: `Having ${results.optimal === 'member1' ? 'Member 1' : 'Member 2'} claim the dependents results in ${fmt(results.optimalGain)}/month more (${fmt(results.optimalGain * 12)}/year). The rate gap between the with-dependents and without-dependents rates is larger at higher pay grades, so assigning dependents to the higher-ranking member produces the higher total.`,
          priority: 'high',
        });
      } else if (results.optimal === null) {
        // Different stations — flag that this is a policy question, not a financial one
        steps.push({
          label: 'Confirm your dependent BAH assignment with your finance office',
          description:
            "When stationed separately, dependents are assigned to the member they physically reside with for BAH purposes. This is a policy determination, not a financial optimization choice. Contact your unit's finance office or S1/J1 to verify your current dependent assignment.",
          priority: 'high',
        });
      }
    }

    steps.push({
      label: 'Both spouses may have independent VA home loan eligibility',
      description: `Dual military couples can often each use a VA loan. See how your combined ${fmt(results.total)}/month BAH supports a home purchase at VARefinance.com — $0 down, no PMI.`,
      href: 'https://www.varefinance.com',
      priority: 'high',
    });

    steps.push({
      label: 'Submit a joint-spouse assignment request (JSAR) before your next PCS',
      description:
        'A JSAR filed early in the cycle significantly improves co-location odds. Read the PCS guide for timing, documentation, and what to do when requests are denied.',
      href: '/guides/pcs',
      priority: 'medium',
    });

    steps.push({
      label: 'Understand rate protection for dual military',
      description:
        "If one member's BAH rate decreases in a future year, that member keeps their current rate as long as their pay grade, duty station, and dependency status don't change. Rate protection applies independently to each member.",
      priority: 'low',
    });

    return steps;
  }, [results, whoClaimsDeps]);

  // ── Empty state ───────────────────────────────────────────────────────────
  function emptyStateMessage() {
    if (zip1.length === 0) return 'Enter a duty station ZIP code to see results';
    if (zip1.length < 5)
      return `${5 - zip1.length} more digit${5 - zip1.length !== 1 ? 's' : ''}…`;
    if (!sameStation) {
      if (zip2.length === 0) return 'Enter Member 2 duty station ZIP to see results';
      if (zip2.length < 5)
        return `${5 - zip2.length} more digit${5 - zip2.length !== 1 ? 's' : ''}…`;
    }
    return 'Enter valid ZIP codes to see results';
  }

  const m1DepLabel =
    hasDependents && whoClaimsDeps === 'member1' ? 'with dependents' : 'without dependents';
  const m2DepLabel =
    hasDependents && whoClaimsDeps === 'member2' ? 'with dependents' : 'without dependents';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Inputs ────────────────────────────────────────────────────── */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Member 1
            </p>
            <Select
              label="Pay Grade"
              groups={GRADE_GROUPS}
              value={grade1}
              onChange={(e) => setGrade1(e.target.value as PayGrade)}
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Member 2
            </p>
            <Select
              label="Pay Grade"
              groups={GRADE_GROUPS}
              value={grade2}
              onChange={(e) => setGrade2(e.target.value as PayGrade)}
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-100 space-y-5">
          {/* Station mode */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Duty Station
            </label>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px] max-w-xs">
              <button
                type="button"
                onClick={() => setSameStation(true)}
                className={[
                  'flex-1 text-sm font-medium transition-colors',
                  sameStation
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Same Station
              </button>
              <button
                type="button"
                onClick={() => setSameStation(false)}
                className={[
                  'flex-1 text-sm font-medium transition-colors border-l border-zinc-300',
                  !sameStation
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Different Stations
              </button>
            </div>
          </div>

          {/* ZIP inputs */}
          {sameStation ? (
            <div className="max-w-xs">
              <Input
                label="Shared Duty Station ZIP Code"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 92134"
                value={zip1}
                onChange={(e) => setZip1(e.target.value.replace(/\D/g, '').slice(0, 5))}
                error={zip1.length === 5 ? zipError(zip1) : undefined}
                hint="ZIP code for your shared installation"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Member 1 Duty Station ZIP"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 92134"
                value={zip1}
                onChange={(e) => setZip1(e.target.value.replace(/\D/g, '').slice(0, 5))}
                error={zip1.length === 5 ? zipError(zip1) : undefined}
              />
              <Input
                label="Member 2 Duty Station ZIP"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 20742"
                value={zip2}
                onChange={(e) => setZip2(e.target.value.replace(/\D/g, '').slice(0, 5))}
                error={zip2.length === 5 ? zipError(zip2) : undefined}
              />
            </div>
          )}

          {/* Dependents toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Do you have dependents (children)?
            </label>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px] max-w-xs">
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
                No Dependents
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
                Have Dependents
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Spouse counts as a dependent for BAH purposes even if both members are active duty.
            </p>
          </div>

          {/* Who claims — only shown when hasDependents */}
          {hasDependents && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Who claims the dependents?
              </label>
              <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px] max-w-xs">
                <button
                  type="button"
                  onClick={() => setWhoClaimsDeps('member1')}
                  className={[
                    'flex-1 text-sm font-medium transition-colors',
                    whoClaimsDeps === 'member1'
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  Member 1
                </button>
                <button
                  type="button"
                  onClick={() => setWhoClaimsDeps('member2')}
                  className={[
                    'flex-1 text-sm font-medium transition-colors border-l border-zinc-300',
                    whoClaimsDeps === 'member2'
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  Member 2
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Only one member can claim dependents. The other receives the without-dependents rate.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Results ───────────────────────────────────────────────────── */}
      {!results ? (
        <Card variant="result">
          <div className="flex items-center justify-center h-24 text-zinc-400 text-sm text-center px-4">
            {emptyStateMessage()}
          </div>
        </Card>
      ) : (
        <>
          {/* ── Household total ──────────────────────────────────────── */}
          <Card variant="result">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                  Total Household BAH
                </p>
                <p className="text-4xl font-bold text-zinc-900 tabular-nums leading-none">
                  {fmt(results.total)}
                  <span className="text-base font-normal text-zinc-500 ml-1">/mo</span>
                </p>
                <p className="text-sm text-zinc-500 mt-1 tabular-nums">
                  {fmt(results.total * 12)}/year combined
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Rates from official {results.dataYear} DTMO tables · Both amounts are tax-free
                </p>
              </div>

              {/* Status badge — only for co-located couples with dependents */}
              {results.hasDependents && (
                <>
                  {results.optimal === 'tied' && (
                    <div className="flex-none text-sm rounded-lg px-4 py-3 border bg-zinc-50 border-zinc-200 text-zinc-700 leading-snug">
                      <span className="font-semibold">Same rank</span>
                      <br />
                      <span className="text-xs">Total is identical either way</span>
                    </div>
                  )}
                  {(results.optimal === 'member1' || results.optimal === 'member2') && (
                    <div
                      className={[
                        'flex-none text-sm rounded-lg px-4 py-3 border leading-snug',
                        results.optimal === whoClaimsDeps
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800',
                      ].join(' ')}
                    >
                      {results.optimal === whoClaimsDeps ? (
                        <span className="font-semibold">✓ Highest total configuration</span>
                      ) : (
                        <>
                          <span className="font-semibold">⚠ Not the highest total</span>
                          <br />
                          <span className="text-xs">
                            Switch to gain {fmt(results.optimalGain)}/mo
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {/* No badge for different stations — a note appears in the comparison table */}
                </>
              )}
            </div>
          </Card>

          {/* ── Per-member breakdown ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                Member 1 · {grade1}
              </p>
              <p className="text-xs text-zinc-400 mb-2">{results.loc1}</p>
              <p className="text-3xl font-bold text-zinc-900 tabular-nums leading-none">
                {fmt(results.m1)}
                <span className="text-sm font-normal text-zinc-500 ml-1">/mo</span>
              </p>
              <p className="text-xs text-zinc-400 mt-2 capitalize">{m1DepLabel} rate</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                Member 2 · {grade2}
              </p>
              <p className="text-xs text-zinc-400 mb-2">
                {sameStation ? results.loc1 : results.loc2}
              </p>
              <p className="text-3xl font-bold text-zinc-900 tabular-nums leading-none">
                {fmt(results.m2)}
                <span className="text-sm font-normal text-zinc-500 ml-1">/mo</span>
              </p>
              <p className="text-xs text-zinc-400 mt-2 capitalize">{m2DepLabel} rate</p>
            </Card>
          </div>

          {/* ── Dependent-claiming comparison table ──────────────────── */}
          {results.hasDependents && results.scenarioA && results.scenarioB && (
            <Card>
              <h3 className="font-semibold text-zinc-900 text-base mb-1">
                {sameStation
                  ? 'Which configuration results in the highest total household BAH?'
                  : 'Both configurations shown'}
              </h3>

              {/* Different-stations policy notice */}
              {!sameStation && (
                <div className="mb-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 leading-relaxed">
                  When stationed separately, dependents are assigned to the member the dependents
                  physically reside with — this is not a financial optimization choice. Contact your
                  finance office to confirm your dependent BAH assignment.
                </div>
              )}

              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left px-3 py-2 font-medium text-zinc-600">
                        Who claims dependents
                      </th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Member 1</th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Member 2</th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        {
                          claimant: 'member1' as const,
                          label: 'Member 1 claims',
                          scenario: results.scenarioA,
                        },
                        {
                          claimant: 'member2' as const,
                          label: 'Member 2 claims',
                          scenario: results.scenarioB,
                        },
                      ] as const
                    ).map(({ claimant, label, scenario }) => {
                      // "optimal" badges are only shown for same-station couples with different grades
                      const isOptimal =
                        sameStation &&
                        results.optimal !== 'tied' &&
                        results.optimal !== null &&
                        results.optimal === claimant;
                      const isCurrent = whoClaimsDeps === claimant;
                      return (
                        <tr
                          key={claimant}
                          className={[
                            'border-t border-zinc-100',
                            isOptimal ? 'bg-green-50' : isCurrent ? 'bg-red-50' : '',
                          ].join(' ')}
                        >
                          <td className="px-3 py-2 text-zinc-700">
                            {label}
                            {isOptimal && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                highest total
                              </span>
                            )}
                            {isCurrent && (
                              <span
                                className={[
                                  'ml-2 text-xs px-1.5 py-0.5 rounded font-medium',
                                  isOptimal
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700',
                                ].join(' ')}
                              >
                                current
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-zinc-800">
                            {fmt(scenario.m1)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-zinc-800">
                            {fmt(scenario.m2)}
                          </td>
                          <td
                            className={[
                              'px-3 py-2 text-right tabular-nums font-semibold',
                              isOptimal ? 'text-green-700' : 'text-zinc-800',
                            ].join(' ')}
                          >
                            {fmt(scenario.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer note */}
              <div className="mt-2 space-y-1.5">
                {sameStation && results.optimal === 'tied' && (
                  <p className="text-xs text-zinc-500">
                    Same rank means the total household BAH is identical regardless of who claims
                    dependents — the with-dependents premium is the same for both members.
                  </p>
                )}
                {sameStation &&
                  results.optimal !== null &&
                  results.optimal !== 'tied' &&
                  results.optimalGain > 0 && (
                    <p className="text-xs text-zinc-500">
                      The configuration that results in the highest total household BAH based on
                      current rates: the rate gap between the with-dependents and without-dependents
                      rates is larger at higher pay grades, so assigning dependents to the
                      higher-ranking member produces the higher total.{' '}
                      <span className="font-medium">
                        Difference: {fmt(results.optimalGain)}/mo ({fmt(results.optimalGain * 12)}
                        /yr).
                      </span>
                    </p>
                  )}
                <p className="text-xs text-zinc-400">
                  The government does not pay two with-dependents BAH rates for the same household
                  — only one member receives the with-dependents rate.
                </p>
              </div>
            </Card>
          )}

          {/* ── Step-by-step math ────────────────────────────────────── */}
          <Card>
            <h3 className="font-semibold text-zinc-900 text-base mb-4">
              Step-by-step: how the total is calculated
            </h3>
            <div className="space-y-0 text-sm">
              <div className="flex items-start justify-between py-2.5 border-b border-zinc-100">
                <div>
                  <span className="font-medium text-zinc-800">Member 1 ({grade1})</span>
                  <span className="text-zinc-500 ml-2 capitalize">
                    — {m1DepLabel} rate
                    {!sameStation && ` at ${results.loc1}`}
                  </span>
                </div>
                <span className="tabular-nums font-semibold text-zinc-900 ml-4 flex-none">
                  {fmt(results.m1)}/mo
                </span>
              </div>
              <div className="flex items-start justify-between py-2.5 border-b border-zinc-100">
                <div>
                  <span className="font-medium text-zinc-800">Member 2 ({grade2})</span>
                  <span className="text-zinc-500 ml-2 capitalize">
                    — {m2DepLabel} rate
                    {!sameStation && ` at ${results.loc2}`}
                  </span>
                </div>
                <span className="tabular-nums font-semibold text-zinc-900 ml-4 flex-none">
                  {fmt(results.m2)}/mo
                </span>
              </div>
              <div className="flex items-center justify-between py-3 bg-zinc-50 rounded-md px-3 mt-1">
                <span className="font-bold text-zinc-900">Total household BAH</span>
                <span className="tabular-nums font-bold text-zinc-900 text-lg">
                  {fmt(results.total)}/mo
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3">
                <span className="text-zinc-500">Annual total (× 12)</span>
                <span className="tabular-nums text-zinc-700 font-medium">
                  {fmt(results.total * 12)}/year
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rates from official {results.dataYear} DTMO tables. Each member receives their BAH
                independently on their own LES — the amounts are never split, combined, or averaged.
                Both are excluded from federal income tax under 26 U.S.C. § 134.
              </p>
              {results.hasDependents && (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The government does not pay two with-dependents BAH rates for the same household
                  — only one member receives the with-dependents rate, regardless of how many
                  dependents there are.
                </p>
              )}
            </div>
          </Card>

          {/* ── Action steps ─────────────────────────────────────────── */}
          {actionSteps.length > 0 && (
            <Card>
              <ActSteps steps={actionSteps} title="What to do with this information" />
            </Card>
          )}

          {/* ── VARefinance callout ──────────────────────────────────── */}
          <a
            href="https://www.varefinance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
          >
            <div className="flex-none w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-xl">
              🏡
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors">
                Dual military couples can each use a VA home loan
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Both spouses typically have independent VA loan eligibility. See how your combined
                BAH supports a home purchase with $0 down and no PMI at VARefinance.com →
              </p>
            </div>
          </a>
        </>
      )}
    </div>
  );
}
