'use client';

import { useState, useMemo } from 'react';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { isZipInDataset, getLocationName } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';
import { ResultCard } from '@/components/calculators/shared/ResultCard';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DATA_YEAR } from '@/data/pay-tables/2026';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { TotalCompensationInput, ActionStep } from '@/types/calculator';
import type { PayGrade } from '@/types/military';

// ─── Grade options grouped for the dropdown ────────────────────────────────

const GRADE_GROUPS = [
  {
    label: 'Enlisted',
    options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Warrant Officers',
    options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Officers',
    options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
  {
    label: 'Officers (Prior Enlisted)',
    options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })),
  },
];

// ─── Years of service options ─────────────────────────────────────────────

const YOS_OPTIONS = Array.from({ length: 41 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? 'Less than 1 year' : i === 1 ? '1 year' : `${i} years`,
}));

// ─── Helper: generate action steps based on calc output ───────────────────

function buildActionSteps(
  output: ReturnType<typeof calculateTotalCompensation>,
  input: TotalCompensationInput
): ActionStep[] {
  const steps: ActionStep[] = [];

  // TSP / BRS step
  if (input.retirementSystem === 'brs' && input.tspContributionPct < 5) {
    const gapPct = 5 - input.tspContributionPct;
    const annualMatch = output.tspAgencyContribution;
    steps.push({
      label: 'Capture your full TSP match',
      description: `You're leaving ${formatCurrency(annualMatch * (gapPct / 5))}/year of DoD matching on the table. Contribute at least 5% of basic pay to get the full BRS match — that's free retirement money.`,
      priority: 'high',
    });
  } else if (input.retirementSystem === 'brs' && input.tspContributionPct >= 5) {
    steps.push({
      label: "You're capturing the full BRS match",
      description: `At ${input.tspContributionPct}% contribution, you're receiving the full DoD match. Consider increasing contributions to the IRS limit ($23,500 in 2026) to maximize tax-advantaged growth.`,
      priority: 'medium',
    });
  }

  // BAH / housing step
  if (output.monthlyBAH > 0) {
    const surplus = output.monthlyBAH - 2000; // rough comparison
    if (surplus > 300) {
      steps.push({
        label: 'Your BAH exceeds typical rent — consider building equity',
        description: `Your BAH is ${formatCurrency(output.monthlyBAH)}/month. If you buy instead of renting, any amount under your BAH builds equity rather than going to a landlord. VA loans require $0 down and no PMI.`,
        priority: 'medium',
        href: 'https://www.varefinance.com',
      });
    } else {
      steps.push({
        label: 'Understand your housing options',
        description: `Your BAH of ${formatCurrency(output.monthlyBAH)}/month is designed to cover median local rental costs. If you choose to live on post, you forfeit BAH but your housing is covered. Off-post, any amount below your BAH stays in your pocket.`,
        priority: 'low',
      });
    }
  } else {
    steps.push({
      label: 'Enter your installation ZIP code for BAH',
      description:
        'BAH is one of the largest components of your compensation. Enter your duty station ZIP code above to see your exact tax-free housing allowance.',
      priority: 'high',
    });
  }

  // Tax advantage step
  if (output.taxAdvantageValue > 1000) {
    steps.push({
      label: `You have a hidden ${formatCurrency(output.taxAdvantageValue)}/year tax advantage`,
      description: `Your BAH and BAS are federal income tax-free. A civilian earning the same total would pay roughly ${formatCurrency(output.taxAdvantageValue)} more in taxes per year. This is a real economic advantage — factor it in when comparing civilian job offers.`,
      priority: 'low',
    });
  }

  // Legacy retirement reminder
  if (input.retirementSystem === 'legacy' && input.yearsOfService < 16) {
    steps.push({
      label: 'Revisit your retirement system decision',
      description:
        'Under the Legacy system, you only receive retirement pay if you serve exactly 20 years — there is no benefit for leaving at 18 or 19. Under BRS, you build TSP savings from day one. If you haven\'t locked in Legacy, speak with a financial counselor.',
      priority: 'medium',
    });
  }

  return steps.slice(0, 3); // cap at 3 action steps
}

// ─── Main Component ───────────────────────────────────────────────────────

export function TotalCompensationCalculator() {
  const [grade, setGrade] = useState<PayGrade>('E-5');
  const [yos, setYos] = useState(6);
  const [zipCode, setZipCode] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [hasDependents, setHasDependents] = useState(false);
  const [retirementSystem, setRetirementSystem] = useState<'legacy' | 'brs'>('brs');
  const [tspPct, setTspPct] = useState(5);

  const input: TotalCompensationInput = {
    payGrade: grade,
    yearsOfService: yos,
    zipCode,
    hasDependents,
    retirementSystem,
    tspContributionPct: tspPct,
  };

  const result = useMemo(() => calculateTotalCompensation(input), [
    grade, yos, zipCode, hasDependents, retirementSystem, tspPct,
  ]);

  const actionSteps = useMemo(() => buildActionSteps(result, input), [
    result, grade, yos, zipCode, hasDependents, retirementSystem, tspPct,
  ]);

  const locationName = useMemo(
    () => (zipCode.length === 5 ? getLocationName(zipCode) : null),
    [zipCode]
  );

  const zipNotFound = zipCode.length === 5 && !isZipInDataset(zipCode);

  function handleZipChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 5);
    setZipInput(digits);
    if (digits.length === 5) setZipCode(digits);
    else setZipCode('');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Inputs ─────────────────────────────────────────────────────── */}
      <Card variant="default">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">Your Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <Select
            label="Rank / Pay Grade"
            groups={GRADE_GROUPS}
            value={grade}
            onChange={(e) => setGrade(e.target.value as PayGrade)}
          />

          <Select
            label="Years of Service"
            options={YOS_OPTIONS}
            value={String(yos)}
            onChange={(e) => setYos(Number(e.target.value))}
          />

          <Input
            label="Duty Station ZIP Code"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 28307"
            value={zipInput}
            maxLength={5}
            onChange={(e) => handleZipChange(e.target.value)}
            hint={
              locationName
                ? `📍 ${locationName}`
                : zipNotFound
                ? 'ZIP not in current dataset — BAH will show as $0'
                : 'Enter your duty station ZIP for BAH'
            }
            error={zipNotFound ? undefined : undefined}
          />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Dependent Status</span>
            <div className="flex gap-3 mt-1">
              {[
                { label: 'No dependents', value: false },
                { label: 'With dependents', value: true },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setHasDependents(value)}
                  className={[
                    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors text-center',
                    hasDependents === value
                      ? 'bg-red-700 border-red-700 text-white'
                      : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Retirement System</span>
            <div className="flex gap-3 mt-1">
              {[
                { label: 'BRS', value: 'brs' as const },
                { label: 'Legacy (High-3)', value: 'legacy' as const },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRetirementSystem(value)}
                  className={[
                    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors text-center',
                    retirementSystem === value
                      ? 'bg-red-700 border-red-700 text-white'
                      : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {retirementSystem === 'brs'
                ? 'Blended Retirement System — DoD matches TSP contributions up to 5%'
                : 'Legacy — 2.5% × years × final base pay, cliff vests at 20 years'}
            </p>
          </div>

          {retirementSystem === 'brs' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                TSP Contribution: <span className="text-red-700 font-semibold">{tspPct}%</span>
                {tspPct < 5 && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">
                    — increase to 5% for full match
                  </span>
                )}
              </label>
              <input
                type="range"
                min={0}
                max={92}
                step={1}
                value={tspPct}
                onChange={(e) => setTspPct(Number(e.target.value))}
                className="w-full accent-red-700 mt-1"
              />
              <div className="flex justify-between text-xs text-zinc-400">
                <span>0%</span>
                <span className="text-red-600 font-medium">5% = full match</span>
                <span>92%</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Headline total */}
        <div className="bg-red-700 rounded-lg p-6 text-white">
          <p className="text-red-200 text-sm font-medium uppercase tracking-wider mb-1">
            Total Monthly Compensation
          </p>
          <p className="text-4xl font-bold tabular-nums tracking-tight">
            {formatCurrency(result.totalMonthly)}
          </p>
          <p className="text-red-200 text-sm mt-1">
            {formatCurrency(result.totalAnnual)}/year &nbsp;·&nbsp; Based on {DATA_YEAR} rates
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ResultCard
            title="Pay & Allowances Breakdown"
            dataYear={DATA_YEAR}
            rows={[
              { label: 'Basic Pay (taxable)', monthly: result.monthlyBasePay },
              { label: 'BAH — Housing (tax-free)', monthly: result.monthlyBAH > 0 ? result.monthlyBAH : undefined, value: result.monthlyBAH === 0 ? 'Enter ZIP code' : undefined },
              { label: 'BAS — Subsistence (tax-free)', monthly: result.monthlyBAS },
              {
                label: 'Total Cash Compensation',
                monthly: result.totalMonthly,
                highlight: true,
              },
            ]}
          />

          <ResultCard
            title="Full Economic Value"
            dataYear={DATA_YEAR}
            rows={[
              { label: 'Cash compensation (monthly)', monthly: result.totalMonthly },
              {
                label: 'Tax advantage on BAH + BAS (est.)',
                value: `+${formatCurrency(result.taxAdvantageValue)}/yr`,
              },
              ...(retirementSystem === 'brs'
                ? [{ label: 'DoD TSP agency match', value: `+${formatCurrency(result.tspAgencyContribution)}/yr` }]
                : []),
              {
                label: 'Civilian salary equivalent',
                value: formatCurrency(result.civilianEquivalent) + '/yr',
                highlight: true,
              },
            ]}
          />
        </div>

        {/* Civilian comparison callout */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            What this means for you
          </p>
          <p className="text-sm text-blue-700 leading-relaxed">
            A civilian would need to earn approximately{' '}
            <span className="font-bold">{formatCurrency(result.civilianEquivalent)}/year</span> before
            taxes to match your total economic compensation — because your BAH (
            {formatCurrency(result.monthlyBAH)}/mo) and BAS ({formatCurrency(result.monthlyBAS)}/mo)
            are completely federal income tax-free
            {retirementSystem === 'brs'
              ? `, and your employer contributes ${formatCurrency(result.tspAgencyContribution)}/year to your retirement`
              : ''}
            . When evaluating a civilian job offer, compare against this number — not just your base pay.
          </p>
        </div>

        {/* Tax-free breakdown */}
        <Card variant="bordered">
          <h3 className="text-base font-semibold text-zinc-900 mb-3">
            Tax-Free Compensation Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold tabular-nums text-zinc-900">
                {formatCurrency(result.monthlyBAH)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">BAH (monthly)</p>
              <p className="text-xs text-green-700 font-medium">100% tax-free</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-zinc-900">
                {formatCurrency(result.monthlyBAS)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">BAS (monthly)</p>
              <p className="text-xs text-green-700 font-medium">100% tax-free</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-zinc-900">
                {formatCurrency(result.taxAdvantageValue)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Tax savings (annual)</p>
              <p className="text-xs text-green-700 font-medium">vs. civilian equivalent</p>
            </div>
          </div>
        </Card>

        {/* BRS Match detail (if applicable) */}
        {retirementSystem === 'brs' && (
          <Card variant="bordered">
            <h3 className="text-base font-semibold text-zinc-900 mb-3">TSP / BRS Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xl font-bold tabular-nums text-zinc-900">{tspPct}%</p>
                <p className="text-xs text-zinc-500 mt-1">Your contribution</p>
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums text-zinc-900">
                  {formatCurrency((result.monthlyBasePay * tspPct) / 100)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Your monthly TSP</p>
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums text-red-700">
                  {formatCurrency(result.tspAgencyContribution / 12)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">DoD monthly match</p>
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums text-zinc-900">
                  {formatCurrency(result.tspAgencyContribution)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Annual match total</p>
              </div>
            </div>
            {tspPct < 5 && (
              <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <span className="font-semibold">Tip:</span> Increase your TSP contribution to 5% to
                capture the full DoD match. At your current base pay, that's{' '}
                {formatCurrency(
                  result.monthlyBasePay * 0.05 * 12 - (result.monthlyBasePay * tspPct / 100 * 12)
                )}{' '}
                more contributed annually — all matched by DoD.
              </div>
            )}
          </Card>
        )}

        {/* Act steps */}
        <ActSteps steps={actionSteps} title="Your Next Steps" />
      </div>
    </div>
  );
}
