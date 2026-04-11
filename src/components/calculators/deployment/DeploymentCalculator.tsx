'use client';

import { useState, useMemo } from 'react';
import { calculateDeployment } from '@/lib/calculations/deployment';
import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';

// ─── Pay grade options ────────────────────────────────────────────────────────

const PAY_GRADES: { group: string; grades: PayGrade[] }[] = [
  { group: 'Enlisted', grades: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'] },
  { group: 'Warrant Officer', grades: ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'] },
  { group: 'Officer', grades: ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'] },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtDec(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function fmtSign(n: number): string {
  const abs = fmt(Math.abs(n));
  return n >= 0 ? `+${abs}` : `-${abs.slice(1)}`;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700">
        {children}
      </label>
      {hint && <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{hint}</p>}
    </div>
  );
}

function Toggle({
  value,
  onChange,
  labelOn,
  labelOff,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[36px] text-sm">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={[
          'flex-1 font-medium transition-colors px-3',
          !value ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
        ].join(' ')}
      >
        {labelOff}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={[
          'flex-1 font-medium border-l border-zinc-300 transition-colors px-3',
          value ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
        ].join(' ')}
      >
        {labelOn}
      </button>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{children}</p>
  );
}

// ─── Pay row component ────────────────────────────────────────────────────────

function PayRow({
  label,
  value,
  sub,
  highlight,
  dimmed,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  dimmed?: boolean;
  positive?: boolean;
}) {
  return (
    <div className={['flex items-start justify-between py-2 border-b border-zinc-100 last:border-0', dimmed ? 'opacity-50' : ''].join(' ')}>
      <div className="flex-1 min-w-0 pr-2">
        <p className={['text-sm', highlight ? 'font-semibold text-zinc-900' : 'text-zinc-600'].join(' ')}>
          {label}
        </p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      <p className={[
        'text-sm font-semibold tabular-nums flex-none',
        highlight ? 'text-zinc-900' : '',
        positive ? 'text-green-700' : '',
      ].join(' ')}>
        {value}
      </p>
    </div>
  );
}

// ─── Phase card ───────────────────────────────────────────────────────────────

function PhaseCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: 'zinc' | 'green' | 'blue';
  children: React.ReactNode;
}) {
  const headerStyles = {
    zinc: 'bg-zinc-50 border-b border-zinc-200',
    green: 'bg-green-50 border-b border-green-200',
    blue: 'bg-blue-50 border-b border-blue-200',
  };
  const titleStyles = {
    zinc: 'text-zinc-700',
    green: 'text-green-800',
    blue: 'text-blue-800',
  };
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className={['px-4 py-3', headerStyles[accent]].join(' ')}>
        <p className={['text-xs font-bold uppercase tracking-widest', titleStyles[accent]].join(' ')}>
          {title}
        </p>
      </div>
      <div className="p-4 space-y-0">{children}</div>
    </div>
  );
}

// ─── Build action steps ───────────────────────────────────────────────────────

function buildActionSteps(
  isCombatZone: boolean,
  isOfficer: boolean,
  usingSDP: boolean,
  tspPct: number,
  tourBenefit: number,
): ActionStep[] {
  const steps: ActionStep[] = [];

  if (isCombatZone && tspPct < 20) {
    steps.push({
      label: 'Maximize Roth TSP — your pay is already tax-free',
      description: `In a combat zone, Roth TSP contributions come from CZTE-excluded pay, meaning no taxes now, no taxes on growth, no taxes at withdrawal. The ${DEPLOYMENT_RATES_2026.tspCombatZoneLimit.toLocaleString()} annual limit applies during deployment. Consider raising your contribution percentage before you deploy.`,
      priority: 'high',
      href: '/calculators/tsp',
    });
  }

  if (isCombatZone && !usingSDP) {
    steps.push({
      label: 'Deposit $10,000 in the Savings Deposit Program',
      description: `SDP pays a guaranteed 10% annual return on up to $10,000 — one of the best risk-free rates available anywhere. Enroll through your finance office immediately upon arrival in theater. Interest continues for 90 days after you return.`,
      priority: 'high',
    });
  }

  steps.push({
    label: 'Your BAH continues — save the difference if housing costs are lower',
    description: `Your housing allowance continues at your home station rate during deployment. If your family's housing costs are below your BAH rate, those savings accumulate tax-free.`,
    priority: 'medium',
  });

  if (isOfficer && isCombatZone) {
    steps.push({
      label: 'Verify your officer CZTE cap with your finance office',
      description: `Officers' CZTE is capped at the highest enlisted rate plus HFP/IDP (~${fmt(DEPLOYMENT_RATES_2026.officerCZTECap)}/month). Pay above that cap remains taxable. Your finance office can give you the exact figures for your grade.`,
      priority: 'medium',
    });
  }

  steps.push({
    label: 'Read the full deployment financial planning guide',
    description: `Detailed walkthrough of CZTE, SDP, Roth TSP strategy, and how to structure your finances before, during, and after the deployment window.`,
    priority: 'low',
    href: '/blog/deployment-financial-planning',
  });

  return steps.slice(0, 4);
}

// ─── Main calculator component ────────────────────────────────────────────────

export function DeploymentCalculator() {
  // ── Inputs: Section 1 — Service Member Info ──
  const [payGrade, setPayGrade] = useState<PayGrade>('E-6');
  const [yos, setYos] = useState(10);
  const [hasDependents, setHasDependents] = useState(true);
  const [zip, setZip] = useState('28310'); // Fort Liberty, NC

  // ── Inputs: Section 2 — Deployment Details ──
  const [deployMonths, setDeployMonths] = useState(9);
  const [isCombatZone, setIsCombatZone] = useState(true);
  const [receivingHFP, setReceivingHFP] = useState(true);
  const [hdpLevel, setHdpLevel] = useState<0 | 50 | 100 | 150>(100);
  const [hasFSA, setHasFSA] = useState(true);

  // ── Inputs: Section 3 — Savings Opportunities ──
  const [tspPct, setTspPct] = useState(10);
  const [usingSDP, setUsingSDP] = useState(true);
  const [sdpDeposit, setSdpDeposit] = useState(10000);

  const zipDigits = zip.replace(/\D/g, '').slice(0, 5);
  const isValidZip = zipDigits.length === 5;

  const result = useMemo(() => {
    if (!isValidZip) return null;
    return calculateDeployment({
      payGrade,
      yearsOfService: yos,
      hasDependents,
      zipCode: zipDigits,
      deploymentMonths: deployMonths,
      isCombatZone,
      receivingHFP,
      hdpLevel,
      hasFSA,
      tspContributionPct: tspPct,
      usingSDP,
      sdpDeposit,
    });
  }, [payGrade, yos, hasDependents, zipDigits, isValidZip, deployMonths, isCombatZone, receivingHFP, hdpLevel, hasFSA, tspPct, usingSDP, sdpDeposit]);

  const actionSteps = useMemo(() => {
    if (!result) return [];
    return buildActionSteps(isCombatZone, result.isOfficer, usingSDP, tspPct, result.tour.totalTourBenefit);
  }, [result, isCombatZone, usingSDP, tspPct]);

  // Effective HDP (capped if receiving HFP)
  const effectiveHDP = receivingHFP ? Math.min(hdpLevel, DEPLOYMENT_RATES_2026.hdpCapWithHFP) : hdpLevel;

  return (
    <div className="space-y-6">

      {/* ── Input Panel ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">Deployment Details</h2>
        </div>

        <div className="p-5 space-y-6">
          {/* Section 1: Service Member */}
          <div>
            <SectionHeading>Service member info</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="pay-grade">Pay grade</Label>
                <select
                  id="pay-grade"
                  value={payGrade}
                  onChange={(e) => setPayGrade(e.target.value as PayGrade)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  {PAY_GRADES.map(({ group, grades }) => (
                    <optgroup key={group} label={group}>
                      {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="yos">Years of service</Label>
                <input
                  id="yos"
                  type="number"
                  min={0}
                  max={40}
                  value={yos}
                  onChange={(e) => setYos(Math.max(0, Math.min(40, parseInt(e.target.value) || 0)))}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="zip">Home station ZIP</Label>
                <input
                  id="zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 28310"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <Label>Dependency status</Label>
                <Toggle
                  value={hasDependents}
                  onChange={setHasDependents}
                  labelOn="With deps"
                  labelOff="Without"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Deployment */}
          <div>
            <SectionHeading>Deployment details</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="deploy-months"
                  hint="1–18 months"
                >
                  Deployment length
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="deploy-months"
                    type="range"
                    min={1}
                    max={18}
                    value={deployMonths}
                    onChange={(e) => setDeployMonths(parseInt(e.target.value))}
                    className="flex-1 accent-red-700"
                  />
                  <span className="text-sm font-semibold text-zinc-900 w-16 text-right">
                    {deployMonths} mo.
                  </span>
                </div>
              </div>

              <div>
                <Label hint="Combat zones designated by Executive Order — your orders will specify if CZTE applies">
                  Combat zone?
                </Label>
                <Toggle
                  value={isCombatZone}
                  onChange={(v) => {
                    setIsCombatZone(v);
                    if (!v) setUsingSDP(false);
                  }}
                  labelOn="Yes — CZTE"
                  labelOff="No"
                />
              </div>

              <div>
                <Label hint={receivingHFP && hdpLevel > 100 ? 'Capped at $100 because you are receiving HFP/IDP' : undefined}>
                  Hostile Fire / IDP?
                </Label>
                <Toggle
                  value={receivingHFP}
                  onChange={setReceivingHFP}
                  labelOn="Yes — $225/mo"
                  labelOff="No"
                />
              </div>

              <div>
                <Label htmlFor="hdp" hint="HDP capped at $100/month if also receiving HFP/IDP">
                  Hardship Duty Pay
                </Label>
                <select
                  id="hdp"
                  value={hdpLevel}
                  onChange={(e) => setHdpLevel(parseInt(e.target.value) as 0 | 50 | 100 | 150)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value={0}>None</option>
                  <option value={50}>$50/month</option>
                  <option value={100}>$100/month</option>
                  <option value={150}>$150/month</option>
                </select>
                {receivingHFP && hdpLevel > 100 && (
                  <p className="text-xs text-amber-600 mt-1">Capped at $100 with HFP/IDP</p>
                )}
              </div>

              <div>
                <Label hint="$300/month — requires separation from dependents for 30+ days. Non-taxable.">
                  Family Separation Allowance?
                </Label>
                <Toggle
                  value={hasFSA}
                  onChange={setHasFSA}
                  labelOn="Yes — $300/mo"
                  labelOff="No"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Savings */}
          <div>
            <SectionHeading>Savings opportunities</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="tsp-pct"
                  hint={isCombatZone
                    ? `Combat zone limit: $${DEPLOYMENT_RATES_2026.tspCombatZoneLimit.toLocaleString()}/yr`
                    : `Normal limit: $${DEPLOYMENT_RATES_2026.tspNormalLimit.toLocaleString()}/yr`}
                >
                  TSP contribution
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="tsp-pct"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={tspPct}
                    onChange={(e) => setTspPct(parseInt(e.target.value))}
                    className="flex-1 accent-red-700"
                  />
                  <span className="text-sm font-semibold text-zinc-900 w-12 text-right">
                    {tspPct}%
                  </span>
                </div>
              </div>

              <div>
                <Label hint={isCombatZone ? 'Available after 30+ days in combat zone' : 'SDP requires combat zone designation'}>
                  Savings Deposit Program?
                </Label>
                <Toggle
                  value={usingSDP && isCombatZone}
                  onChange={(v) => setUsingSDP(v && isCombatZone)}
                  labelOn="Yes — 10% return"
                  labelOff="No"
                />
              </div>

              {usingSDP && isCombatZone && (
                <div>
                  <Label
                    htmlFor="sdp-deposit"
                    hint={`Maximum deposit: $${DEPLOYMENT_RATES_2026.sdpMaxDeposit.toLocaleString()}`}
                  >
                    SDP deposit amount
                  </Label>
                  <input
                    id="sdp-deposit"
                    type="number"
                    min={0}
                    max={DEPLOYMENT_RATES_2026.sdpMaxDeposit}
                    step={500}
                    value={sdpDeposit}
                    onChange={(e) =>
                      setSdpDeposit(
                        Math.max(0, Math.min(DEPLOYMENT_RATES_2026.sdpMaxDeposit, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Validation message ──────────────────────────────────────────── */}
      {!isValidZip && (
        <p className="text-sm text-zinc-500 text-center py-4">
          Enter a 5-digit home station ZIP code to calculate deployment pay.
        </p>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && (
        <>
          {/* BAH notice if not found */}
          {!result.pre.bahFound && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              BAH data not found for ZIP {zipDigits} — BAH shown as $0. Enter your home station ZIP for an accurate housing allowance figure.
            </div>
          )}

          {/* Three-phase comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Phase 1: Before */}
            <PhaseCard title="Before Deployment" accent="zinc">
              <PayRow label="Base pay" value={fmt(result.pre.monthlyBasePay)} />
              <PayRow label="BAH" value={fmt(result.pre.monthlyBAH)} sub={result.pre.bahFound ? undefined : 'ZIP not found'} />
              <PayRow label="BAS" value={fmt(result.pre.monthlyBAS)} />
              <PayRow label="Gross monthly" value={fmt(result.pre.grossMonthly)} highlight />
              <PayRow label="Est. federal tax" value={`−${fmt(result.pre.monthlyFederalTax)}`} sub="On base pay only" />
              <div className="pt-2 mt-2 border-t border-zinc-200">
                <PayRow label="Est. take-home" value={fmt(result.pre.monthlyTakeHome)} highlight />
              </div>
            </PhaseCard>

            {/* Phase 2: During */}
            <PhaseCard title="During Deployment" accent="green">
              <PayRow label="Base pay" value={fmt(result.during.monthlyBasePay)} sub={isCombatZone ? 'Tax-free (CZTE)' : undefined} />
              <PayRow label="BAH" value={fmt(result.during.monthlyBAH)} sub="Continues at home rate" />
              <PayRow label="BAS" value={fmt(result.during.monthlyBAS)} />
              {result.during.monthlyHFP > 0 && (
                <PayRow label="HFP / IDP" value={`+${fmt(result.during.monthlyHFP)}`} positive />
              )}
              {result.during.monthlyHDP > 0 && (
                <PayRow
                  label="Hardship Duty Pay"
                  value={`+${fmt(result.during.monthlyHDP)}`}
                  sub={effectiveHDP < hdpLevel ? `Capped (was ${fmt(hdpLevel)})` : undefined}
                  positive
                />
              )}
              {result.during.monthlyFSA > 0 && (
                <PayRow label="Family Separation" value={`+${fmt(result.during.monthlyFSA)}`} sub="Non-taxable" positive />
              )}
              <PayRow label="Gross monthly" value={fmt(result.during.grossMonthly)} highlight />
              {isCombatZone ? (
                <PayRow
                  label="CZTE tax savings"
                  value={`+${fmt(result.during.czteMonthlySavings)}`}
                  sub={result.isOfficer ? 'Officer CZTE cap applied' : 'All pay excluded'}
                  positive
                />
              ) : (
                <PayRow label="Est. federal tax" value={`−${fmt(result.during.monthlyFederalTax)}`} />
              )}
              <div className="pt-2 mt-2 border-t border-green-200">
                <div className="flex items-start justify-between py-1">
                  <div>
                    <p className="text-sm font-bold text-green-800">Est. take-home</p>
                    <p className="text-xs text-green-600">
                      {fmtSign(result.during.monthlyIncrease)}/mo vs. before
                      {result.during.percentIncrease > 0 && ` (+${result.during.percentIncrease.toFixed(0)}%)`}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-700 tabular-nums">
                    {fmt(result.during.monthlyTakeHome)}
                  </p>
                </div>
              </div>
            </PhaseCard>

            {/* Phase 3: Tour Total */}
            <PhaseCard title={`${deployMonths}-Month Tour Total`} accent="blue">
              <PayRow
                label="Additional pay (HFP + HDP + FSA)"
                value={fmt(result.tour.totalAdditionalAllowancePay)}
                sub={`${fmt(result.during.monthlyHFP + result.during.monthlyHDP + result.during.monthlyFSA)}/mo × ${deployMonths} mo`}
                positive
              />
              {isCombatZone && (
                <PayRow
                  label="CZTE tax savings"
                  value={fmt(result.tour.totalCZTESavings)}
                  sub={`${fmt(result.during.czteMonthlySavings)}/mo × ${deployMonths} mo`}
                  positive
                />
              )}
              {result.tour.sdpInterestEarned > 0 && (
                <PayRow
                  label="SDP interest earned"
                  value={fmtDec(result.tour.sdpInterestEarned)}
                  sub={`$${sdpDeposit.toLocaleString()} × 10% × ${deployMonths}/12 mo`}
                  positive
                />
              )}
              {tspPct > 0 && (
                <PayRow
                  label="TSP contributed"
                  value={fmt(result.tour.tspContributedTotal)}
                  sub={`${tspPct}% of base pay — ${isCombatZone ? 'Roth eligible (CZTE)' : 'Traditional or Roth'}`}
                />
              )}

              <div className="pt-3 mt-2 border-t border-blue-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">
                  Total deployment financial benefit
                </p>
                <p className="text-3xl font-bold text-blue-700 tabular-nums">
                  {fmt(result.tour.totalTourBenefit)}
                </p>
                <p className="text-xs text-blue-600 mt-1 leading-snug">
                  Additional pay + tax savings{result.tour.sdpInterestEarned > 0 ? ' + SDP interest' : ''}
                  {' '}over {deployMonths} months
                </p>
              </div>

              {/* Visual compare bar */}
              <div className="mt-4 pt-3 border-t border-blue-100">
                <p className="text-xs font-semibold text-zinc-500 mb-2">Monthly take-home comparison</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-16 flex-none">Before</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full"
                        style={{ width: `${Math.min(100, (result.pre.monthlyTakeHome / result.during.monthlyTakeHome) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 w-20 text-right flex-none">{fmt(result.pre.monthlyTakeHome)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-16 flex-none">During</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-green-700 w-20 text-right flex-none">{fmt(result.during.monthlyTakeHome)}</span>
                  </div>
                </div>
              </div>
            </PhaseCard>
          </div>

          {/* ── CZTE notice for officers ──────────────────────────────── */}
          {result.isOfficer && isCombatZone && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">Officer CZTE note: </span>
              Officers&apos; tax exclusion is capped at approximately{' '}
              {fmt(DEPLOYMENT_RATES_2026.officerCZTECap)}/month (highest enlisted rate + HFP/IDP). Base pay above that cap remains taxable. Verify exact figures with your finance office.
            </div>
          )}

          {/* ── Act steps ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-5">
            <ActSteps steps={actionSteps} title="Maximize your deployment window" />
          </div>

          {/* ── Related tools ─────────────────────────────────────────── */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Related tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { href: '/calculators/total-compensation', icon: '💰', title: 'Total Compensation', desc: 'See your full pay picture — base, allowances, tax advantages, and civilian equivalent.' },
                { href: '/calculators/tsp', icon: '📈', title: 'TSP Growth Projector', desc: 'Model what your combat zone Roth TSP contributions grow to at retirement.' },
                { href: '/calculators/bah', icon: '🏠', title: 'BAH Calculator', desc: 'Look up your home station BAH — the rate that continues during deployment.' },
              ].map(({ href, icon, title, desc }) => (
                <a
                  key={href}
                  href={href}
                  className="flex gap-3 rounded-md bg-white border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-xl flex-none">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors">{title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Disclaimer ────────────────────────────────────────────── */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-xs text-zinc-500 leading-relaxed">
            <p className="font-semibold text-zinc-600 mb-1">Disclaimer</p>
            <p>
              This calculator estimates deployment compensation based on 2026 rates. Actual pay depends on your specific orders, designated combat zone status, and finance office processing. Combat Zone Tax Exclusion applies only in areas designated by Executive Order — verify with your orders and finance office. FICA taxes (Social Security and Medicare) still apply to all pay even in combat zones. SDP availability requires 30+ consecutive days in a combat zone while receiving HFP/IDP. TSP combat zone contribution limits are subject to IRS rules and may be affected by your BRS matching. This is not tax or financial advice — consult a tax professional for your specific situation.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
