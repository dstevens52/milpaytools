'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  projectTSP,
  calcBRSMatch,
  getBasePayMonthly,
  brsMatchTable,
  rothVsTraditional,
  type FundAllocation,
  type RetirementSystem,
} from '@/lib/calculations/tspGrowth';
import { ENLISTED_GRADES, WARRANT_GRADES, OFFICER_GRADES, PRIOR_ENLISTED_OFFICER_GRADES, RANK_DISPLAY } from '@/types/military';
import { ALLOCATION_PRESETS, TSP_CONSTANTS_2026, type FundKey } from '@/data/tsp/2026/constants';
import type { PayGrade } from '@/types/military';

// ─── Grade dropdown groups ────────────────────────────────────────────────

const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officer', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officer', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officer (Prior Enlisted)', options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
];

const YOS_OPTIONS = Array.from({ length: 41 }, (_, i) => ({ value: String(i), label: `${i} year${i !== 1 ? 's' : ''}` }));

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmt(n: number, cents = false): string {
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

function fmtM(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}

const FUND_KEYS: FundKey[] = ['G', 'F', 'C', 'S', 'I'];
const FUND_LABELS: Record<FundKey, string> = {
  G: 'G Fund (Gov Securities)',
  F: 'F Fund (Bonds)',
  C: 'C Fund (S&P 500)',
  S: 'S Fund (Small Cap)',
  I: 'I Fund (International)',
};

type PresetKey = 'conservative' | 'moderate' | 'aggressive' | 'cFund100' | 'custom';
const PRESET_LABELS: Record<PresetKey, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
  cFund100: '100% C Fund',
  custom: 'Custom',
};

// ─── Chart tooltip ────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-zinc-800 mb-2">Year {label}</p>
      {[...payload].reverse().map((p) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono tabular-nums text-zinc-700">{fmt(p.value)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-zinc-100 mt-1.5 pt-1.5 font-semibold">
        <span className="text-zinc-700">Total</span>
        <span className="font-mono tabular-nums text-zinc-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function TSPCalculator() {
  // Current status
  const [startingBalance, setStartingBalance] = useState('0');
  const [currentAge, setCurrentAge] = useState('26');
  const [targetAge, setTargetAge] = useState('65');

  // Military info
  const [grade, setGrade] = useState<PayGrade>('E-5');
  const [yos, setYos] = useState('6');
  const [retirementSystem, setRetirementSystem] = useState<RetirementSystem>('brs');

  // Contributions
  const [contribMode, setContribMode] = useState<'dollar' | 'percent'>('percent');
  const [contribValue, setContribValue] = useState('5');
  const [contribType, setContribType] = useState<'traditional' | 'roth' | 'both'>('roth');

  // Allocation
  const [preset, setPreset] = useState<PresetKey>('aggressive');
  const [allocation, setAllocation] = useState<FundAllocation>({ ...ALLOCATION_PRESETS.aggressive });
  const [showCustom, setShowCustom] = useState(false);
  const [annualRaise, setAnnualRaise] = useState('3.5');

  // Roth comparison
  const [retirementTaxRate, setRetirementTaxRate] = useState('22');

  // ── Derived values ────────────────────────────────────────────────────
  const yearsToProject = Math.max(1, (parseInt(targetAge) || 65) - (parseInt(currentAge) || 26));
  const basePay = useMemo(() => getBasePayMonthly(grade, parseInt(yos) || 0), [grade, yos]);

  const monthlyContrib = useMemo(() => {
    const v = parseFloat(contribValue) || 0;
    if (contribMode === 'dollar') return v;
    return (basePay * v) / 100;
  }, [contribMode, contribValue, basePay]);

  const brs = useMemo(
    () => calcBRSMatch(basePay, monthlyContrib, retirementSystem),
    [basePay, monthlyContrib, retirementSystem]
  );

  const allocationSum = FUND_KEYS.reduce((s, k) => s + (allocation[k] || 0), 0);
  const allocationValid = Math.abs(allocationSum - 100) < 0.5;

  const projection = useMemo(() => {
    if (!allocationValid || yearsToProject < 1) return null;
    return projectTSP({
      startingBalance: parseFloat(startingBalance) || 0,
      monthlyContribution: monthlyContrib,
      retirementSystem,
      payGrade: grade,
      yearsOfService: parseInt(yos) || 0,
      allocation,
      yearsToProject,
      annualPayRaisePct: parseFloat(annualRaise) || 0,
    });
  }, [startingBalance, monthlyContrib, retirementSystem, grade, yos, allocation, yearsToProject, annualRaise, allocationValid]);

  const rothComparison = useMemo(() => {
    if (!projection) return null;
    return rothVsTraditional(
      projection.finalBalance,
      projection.totalMemberContributions,
      parseFloat(retirementTaxRate) || 22
    );
  }, [projection, retirementTaxRate]);

  const matchTableData = useMemo(() => brsMatchTable(basePay), [basePay]);

  // Chart data — thin to max 40 points
  const chartData = useMemo(() => {
    if (!projection) return [];
    const snaps = projection.snapshots;
    const step = Math.max(1, Math.ceil(snaps.length / 40));
    return snaps.filter((_, i) => i === 0 || i % step === 0 || i === snaps.length - 1).map((s) => ({
      year: s.year,
      'Your Contributions': Math.round(s.memberContributionsTotal),
      'Gov Match': Math.round(s.govContributionsTotal),
      'Investment Growth': Math.round(s.investmentGrowthTotal),
    }));
  }, [projection]);

  // ── Handlers ─────────────────────────────────────────────────────────

  function applyPreset(p: PresetKey) {
    setPreset(p);
    if (p !== 'custom') {
      setAllocation({ ...ALLOCATION_PRESETS[p as keyof typeof ALLOCATION_PRESETS] });
      setShowCustom(false);
    } else {
      setShowCustom(true);
    }
  }

  function updateAllocation(fund: FundKey, val: number) {
    setPreset('custom');
    setShowCustom(true);
    setAllocation((prev) => ({ ...prev, [fund]: val }));
  }

  const atFullMatch = monthlyContrib >= basePay * 0.05;
  const contribPct = basePay > 0 ? (monthlyContrib / basePay) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Section 1: Profile ──────────────────────────────────────── */}
      <Card>
        <h2 className="font-semibold text-zinc-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Current Age"
            type="number"
            min={18}
            max={65}
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
          />
          <Input
            label="Target Retirement Age"
            type="number"
            min={40}
            max={80}
            value={targetAge}
            onChange={(e) => setTargetAge(e.target.value)}
          />
          <Input
            label="Current TSP Balance"
            type="number"
            min={0}
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Years to Retirement</label>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-base font-semibold text-zinc-700">
              {yearsToProject} yr{yearsToProject !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Section 2: Military Info ─────────────────────────────── */}
      <Card>
        <h2 className="font-semibold text-zinc-900 mb-4">Military Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Select label="Pay Grade" groups={GRADE_GROUPS} value={grade} onChange={(e) => setGrade(e.target.value as PayGrade)} />
          <Select label="Years of Service" options={YOS_OPTIONS} value={yos} onChange={(e) => setYos(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Monthly Base Pay</label>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-base font-semibold text-zinc-700 tabular-nums">
              {fmt(basePay, false)}/mo
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Retirement System</label>
          <div className="flex flex-wrap gap-2">
            {(['brs', 'legacy', 'unknown'] as RetirementSystem[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRetirementSystem(s)}
                className={[
                  'px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                  retirementSystem === s
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50',
                ].join(' ')}
              >
                {s === 'brs' ? 'BRS (Blended Retirement)' : s === 'legacy' ? 'Legacy (High-3)' : 'Not Sure'}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            BRS applies to anyone who entered service on or after January 1, 2018, or opted in during the 2018 window. BRS members receive DoD matching contributions; Legacy members do not.
          </p>
        </div>
      </Card>

      {/* ── Section 3: Contributions ─────────────────────────────── */}
      <Card>
        <h2 className="font-semibold text-zinc-900 mb-4">Contribution Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Amount / Percent toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Monthly Contribution</label>
            <div className="flex gap-2">
              <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px]">
                {(['percent', 'dollar'] as const).map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setContribMode(m); setContribValue(m === 'percent' ? '5' : String(Math.round(monthlyContrib))); }}
                    className={[
                      'px-3 py-2 text-sm font-medium transition-colors',
                      i > 0 ? 'border-l border-zinc-300' : '',
                      contribMode === m ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                    ].join(' ')}
                  >
                    {m === 'percent' ? '% of pay' : '$ amount'}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                max={contribMode === 'percent' ? 100 : 30000}
                step={contribMode === 'percent' ? 0.5 : 50}
                value={contribValue}
                onChange={(e) => setContribValue(e.target.value)}
                className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-base text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700 tabular-nums"
              />
              <span className="self-center text-zinc-500 text-sm">
                {contribMode === 'percent' ? '%' : '/mo'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {contribMode === 'percent'
                ? `= ${fmt(monthlyContrib, false)}/mo (${(contribPct).toFixed(1)}% of base pay)`
                : `= ${contribPct.toFixed(1)}% of base pay`}
            </p>
          </div>

          {/* Contribution type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Contribution Type</label>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[42px]">
              {(['traditional', 'roth', 'both'] as const).map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setContribType(t)}
                  className={[
                    'flex-1 text-sm font-medium transition-colors',
                    i > 0 ? 'border-l border-zinc-300' : '',
                    contribType === t ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400">BRS government match always goes to Traditional, regardless of your election.</p>
          </div>
        </div>

        {/* BRS match warning / summary */}
        {retirementSystem === 'brs' && (
          <div className={[
            'rounded-lg border p-4 mt-2',
            !atFullMatch ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50',
          ].join(' ')}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={['font-semibold text-sm', !atFullMatch ? 'text-amber-800' : 'text-green-800'].join(' ')}>
                  {atFullMatch
                    ? `Full BRS match: ${fmt(brs.total, true)}/month government contribution`
                    : `Partial BRS match — contribute at least 5% to get the full match`}
                </p>
                <p className="text-xs mt-1 text-zinc-600">
                  Auto 1%: {fmt(brs.auto, true)} · Matching: {fmt(brs.match, true)} · Total gov: {fmt(brs.total, true)}/mo
                </p>
                {!atFullMatch && (
                  <p className="text-xs mt-1 font-medium text-amber-700">
                    You&apos;re leaving {fmt((basePay * 0.05) - brs.total - brs.auto > 0 ? basePay * 0.04 - brs.match : 0, true)}/month of free money on the table.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 font-medium">Annual gov contribution</p>
                <p className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(brs.total * 12)}/yr</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Annual Pay Raise Assumption"
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={annualRaise}
            onChange={(e) => setAnnualRaise(e.target.value)}
            hint="Applies annual cost-of-living and merit increases to contribution amounts"
          />
        </div>
      </Card>

      {/* ── Section 4: Fund Allocation ─────────────────────────────── */}
      <Card>
        <h2 className="font-semibold text-zinc-900 mb-4">Fund Allocation</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(PRESET_LABELS) as PresetKey[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPreset(p)}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                preset === p
                  ? 'bg-red-700 text-white border-red-700'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50',
              ].join(' ')}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {FUND_KEYS.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="w-36 text-sm text-zinc-700 shrink-0">{FUND_LABELS[f]}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={allocation[f]}
                onChange={(e) => updateAllocation(f, Number(e.target.value))}
                className="flex-1 accent-red-700"
              />
              <span className="w-12 text-sm font-mono tabular-nums text-right text-zinc-700">
                {allocation[f]}%
              </span>
              <span className="w-20 text-xs text-zinc-400 text-right">
                {(TSP_CONSTANTS_2026.defaultFundReturns[f] * 100).toFixed(1)}% est.
              </span>
            </div>
          ))}
        </div>

        <div className={['mt-3 text-sm font-medium', !allocationValid ? 'text-red-600' : 'text-zinc-500'].join(' ')}>
          Total: {allocationSum}%{!allocationValid && ' — must equal 100%'}
        </div>

        {projection && (
          <p className="text-xs text-zinc-400 mt-1">
            Blended annual return: {(projection.blendedAnnualReturn * 100).toFixed(2)}%
          </p>
        )}
      </Card>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {projection && (
        <>
          {/* Primary result */}
          <Card variant="result">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Projected Balance</p>
                <p className="text-4xl font-black text-red-700 tabular-nums leading-none">{fmtM(projection.finalBalance)}</p>
                <p className="text-sm text-zinc-500 mt-1">at age {targetAge} ({yearsToProject} years)</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Monthly Retirement Income</p>
                <p className="text-3xl font-bold text-zinc-900 tabular-nums leading-none">{fmt(projection.monthlyRetirementIncome4pct)}</p>
                <p className="text-xs text-zinc-400 mt-1">4% rule · {fmt(projection.monthlyRetirementIncome4pct * 12)}/yr</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Balance Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Your contributions</span>
                    <span className="font-mono tabular-nums text-zinc-800">{fmt(projection.totalMemberContributions)}</span>
                  </div>
                  {projection.totalGovContributions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Gov match (BRS)</span>
                      <span className="font-mono tabular-nums text-green-700">{fmt(projection.totalGovContributions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Investment growth</span>
                    <span className="font-mono tabular-nums text-blue-700">{fmt(projection.totalInvestmentGrowth)}</span>
                  </div>
                  <div className="flex justify-between border-t border-red-200 pt-1 font-semibold">
                    <span className="text-zinc-800">Total</span>
                    <span className="font-mono tabular-nums text-red-700">{fmt(projection.finalBalance)}</span>
                  </div>
                </div>
              </div>
            </div>
            {projection.isMaxContribLimit && (
              <p className="text-xs text-amber-700 mt-4 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Your contributions hit the {fmt(TSP_CONSTANTS_2026.electiveDeferralLimit)}/year IRS elective deferral limit in some years.
              </p>
            )}
          </Card>

          {/* Growth chart */}
          <Card>
            <h3 className="font-semibold text-zinc-900 mb-4">Balance Growth Over Time</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(v) => `Yr ${v}`}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(v) => fmtM(v)}
                    width={60}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="Your Contributions"
                    stackId="1"
                    stroke="#6b7280"
                    fill="url(#colorContrib)"
                    strokeWidth={1.5}
                  />
                  {retirementSystem === 'brs' && (
                    <Area
                      type="monotone"
                      dataKey="Gov Match"
                      stackId="1"
                      stroke="#15803d"
                      fill="url(#colorGov)"
                      strokeWidth={1.5}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="Investment Growth"
                    stackId="1"
                    stroke="#1d4ed8"
                    fill="url(#colorGrowth)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Roth vs Traditional */}
          {rothComparison && (
            <Card>
              <h3 className="font-semibold text-zinc-900 mb-1">Roth vs. Traditional TSP</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-zinc-600">Assumed retirement tax rate:</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={retirementTaxRate}
                  onChange={(e) => setRetirementTaxRate(e.target.value)}
                  className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700 tabular-nums text-center"
                />
                <span className="text-sm text-zinc-500">%</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Traditional TSP</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">{fmt(rothComparison.traditionalAfterTax)}/mo</p>
                  <p className="text-xs text-zinc-500 mt-1">after {retirementTaxRate}% tax · {fmt(rothComparison.annualTraditional)}/yr</p>
                  <p className="text-xs text-zinc-400 mt-2">Pre-tax contributions. Entire balance taxed on withdrawal.</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Roth TSP</p>
                  <p className="text-2xl font-bold text-red-700 tabular-nums">{fmt(rothComparison.rothAfterTax)}/mo</p>
                  <p className="text-xs text-zinc-500 mt-1">100% tax-free · {fmt(rothComparison.annualRoth)}/yr</p>
                  <p className="text-xs text-zinc-400 mt-2">After-tax contributions. Qualified withdrawals are tax-free.</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                If your tax rate in retirement is lower than it is now, Traditional may come out ahead. If it stays the same or rises, Roth wins.
                Combat zone contributions to Roth TSP are a <strong>triple tax advantage</strong>: no tax going in (combat pay exclusion), no tax on growth, no tax on withdrawal.
                Note: BRS government matching contributions always go to Traditional TSP regardless of your election.
              </p>
            </Card>
          )}

          {/* BRS match table */}
          {retirementSystem === 'brs' && (
            <Card>
              <h3 className="font-semibold text-zinc-900 mb-1">BRS Match at Different Contribution Levels</h3>
              <p className="text-xs text-zinc-500 mb-3">
                Based on {RANK_DISPLAY[grade]} at {yos} years of service ({fmt(basePay, false)}/mo base pay)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left px-3 py-2 font-medium text-zinc-600">You contribute</th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Your $/mo</th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Gov match $/mo</th>
                      <th className="text-right px-3 py-2 font-medium text-zinc-600">Total $/mo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchTableData.map((row) => {
                      const isCurrentPct = Math.abs(row.pct - contribPct) < 0.5;
                      return (
                        <tr
                          key={row.pct}
                          className={[
                            'border-t border-zinc-100',
                            isCurrentPct ? 'bg-red-50' : 'hover:bg-zinc-50',
                            row.pct === 5 ? 'font-semibold' : '',
                          ].join(' ')}
                        >
                          <td className={['px-3 py-1.5', isCurrentPct ? 'text-red-700' : 'text-zinc-700'].join(' ')}>
                            {row.pct}%{isCurrentPct && ' ← you'}{row.pct === 5 && !isCurrentPct && ' (max match)'}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums text-zinc-700">{fmt(row.memberMonthly, true)}</td>
                          <td className={['px-3 py-1.5 text-right tabular-nums', row.govMonthly > 0 ? 'text-green-700' : 'text-zinc-400'].join(' ')}>
                            {fmt(row.govMonthly, true)}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-medium text-zinc-800">{fmt(row.totalMonthly, true)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Contributing at least 5% of base pay unlocks the full government match of {fmt(brsMatchTable(basePay).find((r) => r.pct === 5)?.govMonthly ?? 0, true)}/mo ({fmt((brsMatchTable(basePay).find((r) => r.pct === 5)?.govMonthly ?? 0) * 12)}/yr).
              </p>
            </Card>
          )}
        </>
      )}

      {/* Deployment cross-link */}
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
        <span className="font-semibold text-zinc-800">Deploying to a combat zone?</span>{' '}
        The{' '}
        <a href="/calculators/deployment" className="text-blue-700 hover:underline font-medium">
          Deployment Pay Calculator
        </a>{' '}
        models the full picture — CZTE tax savings, the jump from $24,500 to $72,000 in TSP
        contribution room, SDP interest, and total tour financial benefit.
      </div>
    </div>
  );
}
