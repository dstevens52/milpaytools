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
import {
  calculateGuardReserve,
} from '@/lib/calculations/guardReserve';
import type { GuardReserveInput, TRSPlan, GuardReserveOutput } from '@/lib/calculations/guardReserve';
import { TRICARE_RATES_2026 } from '@/data/tricare/2026/constants';

// ─── Formatters ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtD(n: number, d = 2): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ─── Grade groups ─────────────────────────────────────────────────────────────

const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officer', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officer', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
];

const MUTA_OPTIONS = [
  { value: 4, label: 'MUTA-4 (4 periods — standard)' },
  { value: 6, label: 'MUTA-6 (6 periods)' },
  { value: 8, label: 'MUTA-8 (8 periods)' },
];

// ─── Action steps ─────────────────────────────────────────────────────────────

function buildActionSteps(output: GuardReserveOutput, input: GuardReserveInput): ActionStep[] {
  const steps: ActionStep[] = [];

  steps.push({
    label: 'Check BAH rates during Annual Training',
    description: `During AT, you may be eligible for BAH at your training location. Look up the E-5 with/without dependents BAH rate for your AT duty station ZIP code.`,
    href: '/calculators/bah',
    priority: 'high',
  });

  steps.push({
    label: 'Compare to full active duty compensation',
    description: `Your ${fmt(output.totalMilitaryPay)}/year in part-time military pay is ${fmt(output.totalMilitaryPay / 12)}/month. See how that stacks up against full active duty total compensation for the same rank.`,
    href: '/calculators/total-compensation',
    priority: 'medium',
  });

  if (!input.brsEnrolled) {
    steps.push({
      label: 'Maximize TSP contributions',
      description: `You can contribute to TSP on any military pay. Under BRS, the government also adds a 1% automatic contribution plus matching up to 5% on all military pay — drill, AT, and additional duty.`,
      href: '/calculators/tsp',
      priority: 'medium',
    });
  }

  if (input.trsPlan === 'none') {
    steps.push({
      label: 'Look into Tricare Reserve Select',
      description: `TRS costs $${TRICARE_RATES_2026.reserveSelect.memberOnly}/month (member only) or $${TRICARE_RATES_2026.reserveSelect.memberAndFamily}/month (family) — a fraction of civilian health insurance. If you're not enrolled, it may be worth evaluating.`,
      priority: 'medium',
    });
  }

  return steps;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
      {children}
    </p>
  );
}

function InputLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700 mb-1">
      {children}
    </label>
  );
}

function Row({
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
      <div className="min-w-0 flex-1">
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
          'font-mono tabular-nums text-right flex-none text-sm',
          highlight ? 'font-bold text-red-700 text-base' : dim ? 'text-zinc-400' : 'text-zinc-800',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Proportion bar ───────────────────────────────────────────────────────────

function ProportionBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  if (total === 0) return null;
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden gap-px">
        {segments.map((seg) => {
          const pct = Math.max(0, (seg.value / total) * 100);
          if (pct < 0.5) return null;
          return (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${Math.round(pct)}%`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segments.map((seg) => {
          const pct = Math.max(0, (seg.value / total) * 100);
          if (pct < 0.5) return null;
          return (
            <div key={seg.label} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className={`w-2.5 h-2.5 rounded-sm flex-none ${seg.color}`} />
              {seg.label} ({Math.round(pct)}%)
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GuardReserveCalculator() {
  const [rank, setRank] = useState('E-5');
  const [yearsOfService, setYearsOfService] = useState(6);
  const [weekendsPerYear, setWeekendsPerYear] = useState(12);
  const [periodsPerWeekend, setPeriodsPerWeekend] = useState<4 | 6 | 8>(4);
  const [atDays, setAtDays] = useState(15);
  const [additionalDays, setAdditionalDays] = useState(0);
  const [trsPlan, setTrsPlan] = useState<TRSPlan>('none');
  const [brsEnrolled, setBrsEnrolled] = useState(false);
  const [tspContribPct, setTspContribPct] = useState(5);

  const input: GuardReserveInput = useMemo(() => ({
    rank,
    yearsOfService,
    weekendsPerYear: Math.max(0, weekendsPerYear),
    periodsPerWeekend,
    atDays: Math.max(0, atDays),
    additionalDays: Math.max(0, additionalDays),
    trsPlan,
    brsEnrolled,
    tspContribPct,
  }), [rank, yearsOfService, weekendsPerYear, periodsPerWeekend, atDays, additionalDays, trsPlan, brsEnrolled, tspContribPct]);

  const output: GuardReserveOutput = useMemo(() => calculateGuardReserve(input), [input]);
  const actionSteps = useMemo(() => buildActionSteps(output, input), [output, input]);

  const chartSegments = [
    { label: 'Drill pay', value: output.annualDrillPay, color: 'bg-red-700' },
    { label: 'Annual Training', value: output.atPay, color: 'bg-red-400' },
    ...(output.additionalPay > 0 ? [{ label: 'Additional duty', value: output.additionalPay, color: 'bg-red-200' }] : []),
    ...(output.trsSavings > 0 ? [{ label: 'TRS savings', value: output.trsSavings, color: 'bg-green-500' }] : []),
    ...(output.brs.totalGovContrib > 0 ? [{ label: 'TSP gov match', value: output.brs.totalGovContrib, color: 'bg-blue-400' }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Inputs ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card variant="default" className="p-5 space-y-6">

            {/* Service Member Info */}
            <div>
              <SectionLabel>Service Member</SectionLabel>
              <div className="space-y-4">

                <div>
                  <InputLabel htmlFor="gr-rank">Rank</InputLabel>
                  <select
                    id="gr-rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
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
                  <InputLabel htmlFor="gr-yos">Years of service</InputLabel>
                  <input
                    id="gr-yos"
                    type="number"
                    min={0}
                    max={40}
                    value={yearsOfService}
                    onChange={(e) => setYearsOfService(Math.max(0, Math.min(40, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>

              </div>
            </div>

            {/* Drill Schedule */}
            <div>
              <SectionLabel>Drill Schedule</SectionLabel>
              <div className="space-y-4">

                <div>
                  <InputLabel htmlFor="gr-weekends">Drill weekends per year</InputLabel>
                  <input
                    id="gr-weekends"
                    type="number"
                    min={0}
                    max={52}
                    value={weekendsPerYear}
                    onChange={(e) => setWeekendsPerYear(Math.max(0, Math.min(52, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Standard assumption: 12/year — varies by unit</p>
                </div>

                <div>
                  <InputLabel htmlFor="gr-muta">Drill periods per weekend</InputLabel>
                  <select
                    id="gr-muta"
                    value={periodsPerWeekend}
                    onChange={(e) => setPeriodsPerWeekend(Number(e.target.value) as 4 | 6 | 8)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    {MUTA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">Standard drill weekend = 4 periods. Each period = one day's base pay.</p>
                </div>

                <div>
                  <InputLabel htmlFor="gr-at">Annual Training days</InputLabel>
                  <input
                    id="gr-at"
                    type="number"
                    min={0}
                    max={365}
                    value={atDays}
                    onChange={(e) => setAtDays(Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Standard assumption: 15 days/year — varies by unit</p>
                </div>

                <div>
                  <InputLabel htmlFor="gr-addl">Additional duty days</InputLabel>
                  <input
                    id="gr-addl"
                    type="number"
                    min={0}
                    max={365}
                    value={additionalDays}
                    onChange={(e) => setAdditionalDays(Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                  <p className="text-xs text-zinc-400 mt-1">RMPs, AFTPs, schools, ADOS, etc.</p>
                </div>

              </div>
            </div>

            {/* Healthcare */}
            <div>
              <SectionLabel>Healthcare</SectionLabel>
              <div className="space-y-3">
                <InputLabel>Tricare Reserve Select</InputLabel>
                <div className="space-y-2">
                  {[
                    { val: 'none' as TRSPlan, label: 'Not enrolled' },
                    { val: 'member' as TRSPlan, label: `Member only — ${fmtD(TRICARE_RATES_2026.reserveSelect.memberOnly)}/mo` },
                    { val: 'family' as TRSPlan, label: `Member + family — ${fmtD(TRICARE_RATES_2026.reserveSelect.memberAndFamily)}/mo` },
                  ].map(({ val, label }) => (
                    <label
                      key={val}
                      className={[
                        'flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                        trsPlan === val ? 'border-red-700 bg-red-50' : 'border-zinc-200 bg-white hover:border-zinc-300',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="trs"
                        value={val}
                        checked={trsPlan === val}
                        onChange={() => setTrsPlan(val)}
                        className="accent-red-700 flex-none"
                      />
                      <span className="text-sm text-zinc-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* BRS */}
            <div>
              <SectionLabel>BRS / TSP</SectionLabel>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">BRS enrolled</span>
                  <button
                    type="button"
                    onClick={() => setBrsEnrolled(!brsEnrolled)}
                    className={[
                      'relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none',
                      brsEnrolled ? 'bg-red-700' : 'bg-zinc-300',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1',
                        brsEnrolled ? 'translate-x-6' : 'translate-x-1',
                      ].join(' ')}
                    />
                  </button>
                </div>
                {brsEnrolled && (
                  <div>
                    <InputLabel htmlFor="gr-tsp">TSP contribution %</InputLabel>
                    <div className="flex items-center gap-3">
                      <input
                        id="gr-tsp"
                        type="range"
                        min={0}
                        max={100}
                        value={tspContribPct}
                        onChange={(e) => setTspContribPct(Number(e.target.value))}
                        className="flex-1 accent-red-700"
                      />
                      <span className="text-sm font-mono tabular-nums w-10 text-right">{tspContribPct}%</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      BRS matching applies to all military pay — drill, AT, and additional duty.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </Card>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Hero banner */}
          <div className="rounded-lg bg-red-700 p-5 text-white">
            <p className="text-sm font-medium text-red-200 mb-1">Total annual Guard/Reserve value</p>
            <p className="text-4xl font-black tabular-nums">{fmt(output.totalValue)}</p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between text-red-100">
                <span>Military pay (drill + AT + duty)</span>
                <span className="font-semibold tabular-nums">{fmt(output.totalMilitaryPay)}</span>
              </div>
              {output.trsSavings > 0 && (
                <div className="flex justify-between text-red-200">
                  <span>Healthcare savings (TRS vs. civilian)</span>
                  <span className="tabular-nums">{fmt(output.trsSavings)}</span>
                </div>
              )}
              {output.brs.totalGovContrib > 0 && (
                <div className="flex justify-between text-red-200">
                  <span>Gov TSP match (BRS)</span>
                  <span className="tabular-nums">{fmt(output.brs.totalGovContrib)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-red-600 flex flex-wrap gap-4 text-xs text-red-200">
              <span>{fmt(output.perWeekendValue)} per drill weekend</span>
              {output.totalHours > 0 && (
                <span>{fmtD(output.effectiveHourlyRate)}/hr effective rate</span>
              )}
            </div>
          </div>

          {/* Proportion bar */}
          {chartSegments.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Value breakdown
              </p>
              <ProportionBar segments={chartSegments} />
            </div>
          )}

          {/* Pay rates */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Pay Rates</h3>
            <p className="text-xs text-zinc-400 mb-3">Based on 2026 DFAS pay tables</p>
            <Row
              label="Monthly base pay"
              value={fmtD(output.monthlyBasePay)}
              sub={`${RANK_DISPLAY[rank as PayGrade] ?? rank}, over ${yearsOfService} years`}
            />
            <Row
              label="Daily rate (base pay ÷ 30)"
              value={fmtD(output.dailyRate)}
            />
            <Row
              label="Per drill period"
              value={fmtD(output.dailyRate)}
              sub="One drill period = one day's base pay"
            />
          </div>

          {/* Drill pay */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Drill Pay</h3>
            <Row
              label={`Per weekend (${periodsPerWeekend} periods × ${fmtD(output.dailyRate)})`}
              value={fmtD(output.weekendPay)}
            />
            <Row
              label={`Annual drill (${weekendsPerYear} weekends × ${fmtD(output.weekendPay)})`}
              value={fmt(output.annualDrillPay)}
              highlight
            />
          </div>

          {/* AT pay */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Annual Training Pay</h3>
            <Row
              label={`${atDays} days × ${fmtD(output.dailyRate)}/day`}
              value={fmt(output.atPay)}
              highlight
            />
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              During AT, you receive full active duty pay. You may also be eligible for BAH and BAS depending on your orders.
            </p>
          </div>

          {/* Additional duty */}
          {additionalDays > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-900 mb-1">Additional Duty Pay</h3>
              <Row
                label={`${additionalDays} days × ${fmtD(output.dailyRate)}/day`}
                value={fmt(output.additionalPay)}
                highlight
              />
            </div>
          )}

          {/* Total military pay */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">Total Annual Military Pay</h3>
            <Row label="Drill pay" value={fmt(output.annualDrillPay)} />
            <Row label="Annual Training pay" value={fmt(output.atPay)} />
            {additionalDays > 0 && <Row label="Additional duty pay" value={fmt(output.additionalPay)} />}
            <Row label="Total military income" value={fmt(output.totalMilitaryPay)} highlight />
          </div>

          {/* TRS section */}
          {trsPlan !== 'none' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <h3 className="font-semibold text-zinc-900 mb-1">Tricare Reserve Select Value</h3>
              <p className="text-xs text-zinc-500 mb-3">
                TRS premiums are a fraction of civilian health insurance costs. This difference is real compensation.
              </p>
              <Row
                label="Annual TRS premium"
                value={`−${fmtD(output.trsAnnualPremium)}`}
                sub={`${fmtD(trsPlan === 'family' ? TRICARE_RATES_2026.reserveSelect.memberAndFamily : TRICARE_RATES_2026.reserveSelect.memberOnly)}/month`}
              />
              <Row
                label="Comparable civilian coverage"
                value={fmt(output.trsCivilianComparable)}
                sub="Approximate employer + employee cost (KFF 2025 survey)"
              />
              <Row
                label="Annual healthcare savings"
                value={fmt(output.trsSavings)}
                highlight
              />
            </div>
          )}

          {/* BRS/TSP section */}
          {brsEnrolled && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-semibold text-zinc-900 mb-1">BRS / TSP Government Match</h3>
              <p className="text-xs text-zinc-500 mb-3">
                BRS matching applies to all military pay — drill weekends, Annual Training, and additional duty.
              </p>
              {output.brs.totalMilitaryPay > 0 ? (
                <>
                  <Row
                    label="Total military pay (drill + AT + additional)"
                    value={fmtD(output.brs.totalMilitaryPay)}
                  />
                  <Row
                    label={`Your TSP contribution (${tspContribPct}%)`}
                    value={fmtD(output.brs.memberContrib)}
                  />
                  <Row
                    label="Government auto-contribution (1%)"
                    value={fmtD(output.brs.govAutoContrib)}
                  />
                  {output.brs.govMatchContrib > 0 && (
                    <Row
                      label="Government matching contribution"
                      value={fmtD(output.brs.govMatchContrib)}
                    />
                  )}
                  <Row
                    label="Total government TSP contribution"
                    value={fmtD(output.brs.totalGovContrib)}
                    highlight
                  />
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  No military pay entered. Add drill weekends or duty days to see BRS matching.
                </p>
              )}
            </div>
          )}

          {/* Total value summary */}
          <div className="rounded-lg bg-zinc-900 p-5 text-white">
            <h3 className="font-semibold text-zinc-300 mb-3 text-sm uppercase tracking-wide">
              Total annual value
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Military pay</span>
                <span className="font-mono tabular-nums">{fmt(output.totalMilitaryPay)}</span>
              </div>
              {output.trsSavings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Healthcare savings (TRS)</span>
                  <span className="font-mono tabular-nums text-green-400">{fmt(output.trsSavings)}</span>
                </div>
              )}
              {output.brs.totalGovContrib > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">TSP government match</span>
                  <span className="font-mono tabular-nums text-blue-400">{fmt(output.brs.totalGovContrib)}</span>
                </div>
              )}
              <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between">
                <span className="font-semibold">Total annual value</span>
                <span className="font-black text-xl tabular-nums">{fmt(output.totalValue)}</span>
              </div>
              {weekendsPerYear > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-zinc-400">Per drill weekend</span>
                  <span className="font-mono tabular-nums text-red-400 font-semibold">{fmt(output.perWeekendValue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Civilian comparison callout */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-800 mb-2">Guard/Reserve vs. civilian perspective</p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Your {weekendsPerYear} drill weekends + {atDays} days AT generates{' '}
              <span className="font-semibold text-zinc-900">{fmt(output.totalValue)}/year</span> in total
              compensation value — equivalent to{' '}
              <span className="font-semibold text-zinc-900">{fmtD(output.effectiveHourlyRate)}/hour</span>{' '}
              when spread across {output.totalHours} hours of service.
              {output.trsSavings > 0 && (
                <> Healthcare savings account for {Math.round((output.trsSavings / output.totalValue) * 100)}% of that total.</>
              )}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/calculators/total-compensation" className="text-sm text-blue-700 hover:underline font-medium">
                Total Compensation Calculator → See full active duty pay for same rank
              </Link>
              <Link href="/calculators/bah" className="text-sm text-blue-700 hover:underline font-medium">
                BAH Calculator → Look up housing allowance during Annual Training
              </Link>
            </div>
          </div>

          {/* Act steps */}
          <ActSteps steps={actionSteps} title="Next steps" />

        </div>
      </div>
    </div>
  );
}
