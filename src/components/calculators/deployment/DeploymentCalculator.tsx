'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { calculateDeployment, defaultDeploymentFilingStatus } from '@/lib/calculations/deployment';
import { FILING_STATUSES, FILING_STATUS_LABEL, isFilingStatus, type FilingStatus } from '@/lib/calculations/federalTax';
import { useBahLookup, rateFor } from '@/components/calculators/shared/useBahLookup';
import { fireCalculatorEvent } from '@/lib/analytics';
import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import type { HDPLevel } from '@/data/deployment/2026/constants';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import { SENIOR_ENLISTED_BASIC_PAY } from '@/data/pay-tables/2026';
import { EMPLOYEE_FICA_RATE } from '@/data/constants';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import type { PayGrade } from '@/types/military';
import type { ActionStep } from '@/types/calculator';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';

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

// EMPLOYEE_FICA_RATE (6.2% Social Security + 1.45% Medicare) as a percent label.
const FICA_PCT = `${Number((EMPLOYEE_FICA_RATE * 100).toFixed(2))}%`;

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
  disabled = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
  disabled?: boolean;
}) {
  return (
    <div className={['flex rounded-md border border-zinc-300 overflow-hidden h-[36px] text-xs sm:text-sm', disabled ? 'opacity-50' : ''].join(' ')}>
      <button
        type="button"
        onClick={() => onChange(false)}
        disabled={disabled}
        className={[
          'flex-1 font-medium transition-colors whitespace-nowrap px-2 sm:px-3 disabled:cursor-not-allowed',
          !value ? 'bg-red-700 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50',
        ].join(' ')}
      >
        {labelOff}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        disabled={disabled}
        className={[
          'flex-1 font-medium border-l border-zinc-300 transition-colors whitespace-nowrap px-2 sm:px-3 disabled:cursor-not-allowed',
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
  officerCap: number | null,
  officerTaxablePay: number,
): ActionStep[] {
  const steps: ActionStep[] = [];

  if (isCombatZone && tspPct < 20) {
    steps.push({
      label: 'Consider Roth TSP while your pay is excluded from federal taxable income',
      description: `In a combat zone, Roth TSP contributions come from pay excluded from federal taxable income, and qualified Roth withdrawals, earnings included, are not taxed. In a combat zone, contributions from that pay don't count toward the ${fmt(TSP_CONSTANTS_2026.electiveDeferralLimit)} elective deferral limit for 2026 (IRC § 402(g)), so total contributions can go up to the ${fmt(TSP_CONSTANTS_2026.annualAdditionsLimit)} annual additions limit (IRC § 415(c)). Roth contributions are still capped at the elective deferral limit; anything above it goes into the traditional tax-exempt portion of TSP, not Roth. Consider raising your contribution percentage before you deploy.`,
      priority: 'high',
      href: '/calculators/tsp',
    });
  }

  if (isCombatZone && !usingSDP) {
    steps.push({
      label: 'Deposit $10,000 in the Savings Deposit Program',
      description: `SDP pays a 10% annual return on up to $10,000 — one of the highest fixed returns available anywhere. Enroll through your finance office immediately upon arrival in theater. Interest continues for 90 days after you return.`,
      priority: 'high',
    });
  }

  steps.push({
    label: 'Your BAH continues — save the difference if housing costs are lower',
    description: `Your housing allowance continues at your home station rate during deployment, and BAH is not taxable income. If your family's housing costs are below your BAH rate, the difference is yours to save.`,
    priority: 'medium',
  });

  if (isOfficer && isCombatZone && officerCap !== null) {
    steps.push({
      label: 'Check your officer CZTE cap on your LES',
      description: `As a commissioned officer, up to ${fmtDec(officerCap)} a month is excluded from federal taxable income (the senior enlisted basic pay plus any HFP or IDP you receive). ${officerTaxablePay > 0 ? `About ${fmt(officerTaxablePay)} a month of your pay stays in federal taxable income.` : 'Your modeled pay is below the cap.'} Your finance office can confirm the figures for your grade.`,
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

// FSA requires dependents (37 U.S.C. § 427(a)(1)), so the FSA default always follows
// the dependents value: on with dependents, off (and locked) without.
const DEFAULT_HAS_DEPENDENTS = true;

export function DeploymentCalculator() {
  // ── Inputs: Section 1 — Service Member Info ──
  const [payGrade, setPayGrade] = useState<PayGrade>('E-6');
  const [yos, setYos] = useState(10);
  const [hasDependents, setHasDependents] = useState(DEFAULT_HAS_DEPENDENTS);
  const [zip, setZip] = useState('28310'); // Fort Bragg, NC

  // ── Inputs: Section 2 — Deployment Details ──
  const [deployMonths, setDeployMonths] = useState(9);
  const [isCombatZone, setIsCombatZone] = useState(true);
  const [receivingIDP, setReceivingIDP] = useState(true);
  const [hdpLevel, setHdpLevel] = useState<HDPLevel>(100);
  const [hasFSA, setHasFSA] = useState(DEFAULT_HAS_DEPENDENTS);
  // Effective FSA: never on without dependents, whatever the toggle state.
  const fsaOn = hasDependents && hasFSA;

  // Changing dependents resets FSA to its default for that status (Yes → on, No → off).
  function handleDependentsChange(v: boolean) {
    setHasDependents(v);
    setHasFSA(v);
  }

  // Filing status: defaults from dependents (with → married filing jointly, without → single)
  // until the user picks one.
  const [filingStatusOverride, setFilingStatusOverride] = useState<FilingStatus | null>(null);
  const filingStatus = filingStatusOverride ?? defaultDeploymentFilingStatus(hasDependents);
  const filingLabel = FILING_STATUS_LABEL[filingStatus];

  // ── Inputs: Section 3 — Savings Opportunities ──
  const [tspPct, setTspPct] = useState(10);
  const [usingSDP, setUsingSDP] = useState(true);
  const [sdpDeposit, setSdpDeposit] = useState(10000);

  // ── URL params ────────────────────────────────────────────────────────
  // Every input round-trips. Bad values are ignored (or clamped where a range applies), and
  // params missing from older links keep their defaults.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const int = (key: string): number | null => {
      const raw = params.get(key);
      if (raw === null || !/^-?\d+$/.test(raw.trim())) return null;
      return parseInt(raw, 10);
    };
    const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

    const pg = parseGrade(params.get('rank'));
    const yosN = int('yos');
    const gz = parseZip(params.get('zip'));
    const deps = parseBool(params.get('dependents'));
    const fsa = parseBool(params.get('fsa'));
    const fs = params.get('fs');
    const monthsN = int('months');
    const cz = parseBool(params.get('cz'));
    const idp = parseBool(params.get('idp'));
    const hdpN = int('hdp');
    const tspN = int('tsp');
    const sdp = parseBool(params.get('sdp'));
    const sdpDepN = int('sdpDeposit');

    if (pg) setPayGrade(pg);
    if (yosN !== null) setYos(clamp(yosN, 0, 40));
    if (gz) setZip(gz);
    // FSA follows dependents on load, then an explicit fsa param can turn it off (or on, only
    // with dependents) — so dependents=no never loads with FSA on, and dependents=yes&fsa=no
    // loads with FSA off.
    const depsOn = deps ?? DEFAULT_HAS_DEPENDENTS;
    if (deps !== null) setHasDependents(deps);
    setHasFSA(depsOn && (fsa ?? depsOn));
    if (isFilingStatus(fs)) setFilingStatusOverride(fs);
    if (monthsN !== null) setDeployMonths(clamp(monthsN, 1, 18));
    const czOn = cz ?? true;
    if (cz !== null) setIsCombatZone(cz);
    if (idp !== null) setReceivingIDP(idp);
    if (hdpN !== null && (DEPLOYMENT_RATES_2026.hdpLevels as readonly number[]).includes(hdpN)) {
      setHdpLevel(hdpN as HDPLevel);
    }
    if (tspN !== null) setTspPct(clamp(tspN, 0, 100));
    // SDP requires a combat zone.
    if (sdp !== null || !czOn) setUsingSDP((sdp ?? true) && czOn);
    if (sdpDepN !== null) setSdpDeposit(clamp(sdpDepN, 0, DEPLOYMENT_RATES_2026.sdpMaxDeposit));
  }, []);

  function getShareUrl(): string {
    const params = new URLSearchParams();
    params.set('rank', gradeToParam(payGrade));
    params.set('yos', String(yos));
    params.set('zip', zip.replace(/\D/g, '').slice(0, 5) || zip);
    params.set('dependents', hasDependents ? 'yes' : 'no');
    params.set('fsa', fsaOn ? 'yes' : 'no');
    params.set('fs', filingStatus);
    params.set('months', String(deployMonths));
    params.set('cz', isCombatZone ? 'yes' : 'no');
    params.set('idp', receivingIDP ? 'yes' : 'no');
    params.set('hdp', String(hdpLevel));
    params.set('tsp', String(tspPct));
    params.set('sdp', usingSDP && isCombatZone ? 'yes' : 'no');
    params.set('sdpDeposit', String(sdpDeposit));
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  const zipDigits = zip.replace(/\D/g, '').slice(0, 5);
  const isValidZip = zipDigits.length === 5;

  // BAH resolved via the cached route.
  const { data: bahData, loading: bahLoading } = useBahLookup(zipDigits);
  const bahRate = rateFor(bahData, payGrade, hasDependents);
  const monthlyBAH = bahRate ?? 0;
  const bahFound = bahRate !== null;

  const result = useMemo(() => {
    if (!isValidZip || !bahData) return null;
    return calculateDeployment({
      payGrade,
      yearsOfService: yos,
      hasDependents,
      filingStatus,
      zipCode: zipDigits,
      monthlyBAH,
      bahFound,
      deploymentMonths: deployMonths,
      isCombatZone,
      receivingIDP,
      hdpLevel,
      hasFSA: fsaOn,
      tspContributionPct: tspPct,
      usingSDP,
      sdpDeposit,
    });
  }, [payGrade, yos, hasDependents, filingStatus, zipDigits, isValidZip, bahData, monthlyBAH, bahFound, deployMonths, isCombatZone, receivingIDP, hdpLevel, fsaOn, tspPct, usingSDP, sdpDeposit]);

  const actionSteps = useMemo(() => {
    if (!result) return [];
    return buildActionSteps(isCombatZone, result.isOfficer, usingSDP, tspPct, result.during.officerCZTECap, result.during.monthlyTaxablePay);
  }, [result, isCombatZone, usingSDP, tspPct]);

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!result) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('deployment'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [result]);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  onChange={handleDependentsChange}
                  labelOn="With deps"
                  labelOff="Without"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="filing-status"
                  hint={filingStatusOverride ? 'Used for the federal income tax estimate.' : 'Set from dependents — change it if it’s wrong.'}
                >
                  Tax filing status
                </Label>
                <select
                  id="filing-status"
                  value={filingStatus}
                  onChange={(e) => setFilingStatusOverride(e.target.value as FilingStatus)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  {FILING_STATUSES.map((s) => (
                    <option key={s} value={s}>{FILING_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Deployment */}
          <div>
            <SectionHeading>Deployment details</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Label hint={`Prorates at ${fmtDec(DEPLOYMENT_RATES_2026.idpDaily)}/day; this calculator assumes full months. Hostile Fire Pay (${fmt(DEPLOYMENT_RATES_2026.hfp)}/mo) is paid instead of IDP, never with it, and isn't modeled here yet.`}>
                  Imminent Danger Pay?
                </Label>
                <Toggle
                  value={receivingIDP}
                  onChange={setReceivingIDP}
                  labelOn={`Yes — ${fmt(DEPLOYMENT_RATES_2026.idp)}/mo`}
                  labelOff="No"
                />
              </div>

              <div>
                <Label htmlFor="hdp" hint={`Set by your location's designation. Rates effective ${DEPLOYMENT_RATES_2026.ratesEffectiveDate}.`}>
                  Hardship Duty Pay
                </Label>
                <select
                  id="hdp"
                  value={hdpLevel}
                  onChange={(e) => setHdpLevel(parseInt(e.target.value) as HDPLevel)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  {DEPLOYMENT_RATES_2026.hdpLevels.map((level) => (
                    <option key={level} value={level}>{level === 0 ? 'None' : `${fmt(level)}/month`}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label hint={`${fmt(DEPLOYMENT_RATES_2026.fsa)}/month — requires separation from dependents for 30+ days. Non-taxable.`}>
                  Family Separation Allowance?
                </Label>
                <Toggle
                  value={fsaOn}
                  onChange={setHasFSA}
                  labelOn={`Yes — ${fmt(DEPLOYMENT_RATES_2026.fsa)}/mo`}
                  labelOff="No"
                  disabled={!hasDependents}
                />
                {!hasDependents && (
                  <p className="text-xs text-zinc-500 mt-1" data-testid="fsa-requires-dependents">
                    FSA requires dependents.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Savings */}
          <div>
            <SectionHeading>Savings opportunities</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="tsp-pct"
                  hint={isCombatZone
                    ? `Combat zone: up to the 2026 annual additions limit, ${fmt(TSP_CONSTANTS_2026.annualAdditionsLimit)}/yr (Roth capped at ${fmt(TSP_CONSTANTS_2026.electiveDeferralLimit)} — excess goes traditional)`
                    : `2026 elective deferral limit: ${fmt(TSP_CONSTANTS_2026.electiveDeferralLimit)}/yr`}
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
      {isValidZip && bahLoading && !result && (
        <p className="text-sm text-zinc-400 text-center py-4 animate-pulse">
          Looking up BAH for ZIP {zipDigits}…
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="deployment-results">

            {/* Phase 1: Before */}
            <PhaseCard title="Before Deployment" accent="zinc">
              <PayRow label="Base pay" value={fmt(result.pre.monthlyBasePay)} />
              <PayRow label="BAH" value={fmt(result.pre.monthlyBAH)} sub={result.pre.bahFound ? undefined : 'ZIP not found'} />
              <PayRow label="BAS" value={fmt(result.pre.monthlyBAS)} />
              <PayRow label="Gross monthly" value={fmt(result.pre.grossMonthly)} highlight />
              <PayRow label="Est. federal income tax" value={`−${fmt(result.pre.monthlyFederalTax)}`} sub={`On base pay only · ${filingLabel}`} />
              <PayRow label="FICA (Social Security + Medicare)" value={`−${fmt(result.pre.monthlyFICA)}`} sub={`${FICA_PCT} of base pay`} />
              <div className="pt-2 mt-2 border-t border-zinc-200">
                <PayRow
                  label="Est. take-home after federal income tax and FICA"
                  value={fmt(result.pre.monthlyTakeHome)}
                  sub={filingLabel}
                  highlight
                />
              </div>
            </PhaseCard>

            {/* Phase 2: During */}
            <PhaseCard title="During Deployment" accent="green">
              <PayRow
                label="Base pay"
                value={fmt(result.during.monthlyBasePay)}
                sub={
                  !isCombatZone
                    ? undefined
                    : result.during.monthlyTaxablePay > 0
                      ? 'Excluded from federal taxable income up to the officer cap (CZTE)'
                      : 'Excluded from federal taxable income (CZTE)'
                }
              />
              <PayRow label="BAH" value={fmt(result.during.monthlyBAH)} sub="Continues at home rate" />
              <PayRow label="BAS" value={fmt(result.during.monthlyBAS)} />
              {result.during.monthlyIDP > 0 && (
                <PayRow label="Imminent Danger Pay" value={`+${fmt(result.during.monthlyIDP)}`} positive />
              )}
              {result.during.monthlyHDP > 0 && (
                <PayRow
                  label="Hardship Duty Pay"
                  value={`+${fmt(result.during.monthlyHDP)}`}
                  positive
                />
              )}
              {result.during.monthlyFSA > 0 && (
                <PayRow label="Family Separation" value={`+${fmt(result.during.monthlyFSA)}`} sub="Non-taxable" positive />
              )}
              <PayRow label="Gross monthly" value={fmt(result.during.grossMonthly)} highlight />
              <PayRow
                label="Est. federal income tax"
                value={`−${fmt(result.during.monthlyFederalTax)}`}
                sub={
                  !isCombatZone
                    ? `Base pay, IDP and HDP-L are taxable outside a combat zone · ${filingLabel}`
                    : result.during.officerCZTECap !== null
                      ? `Officer cap: ${fmtDec(result.during.officerCZTECap)}/mo excluded; ${fmt(result.during.monthlyTaxablePay)}/mo taxable · ${filingLabel}`
                      : 'All military pay excluded (CZTE)'
                }
              />
              <PayRow
                label="FICA (Social Security + Medicare)"
                value={`−${fmt(result.during.monthlyFICA)}`}
                sub={isCombatZone ? 'Still withheld on base pay in a combat zone' : `${FICA_PCT} of base pay`}
              />
              <div className="pt-2 mt-2 border-t border-green-200">
                <div className="flex items-start justify-between py-1">
                  <div>
                    <p className="text-sm font-bold text-green-800">Est. take-home after federal income tax and FICA</p>
                    <p className="text-xs text-green-600">
                      {fmtSign(result.during.monthlyIncrease)}/mo vs. before
                      {result.during.percentIncrease > 0 && ` (+${result.during.percentIncrease.toFixed(0)}%)`}
                      {` · ${filingLabel}`}
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
                label="Additional pay (IDP + HDP + FSA)"
                value={fmt(result.tour.totalAdditionalAllowancePay)}
                sub={`${fmt(result.during.monthlyIDP + result.during.monthlyHDP + result.during.monthlyFSA)}/mo × ${deployMonths} mo`}
                positive
              />
              {isCombatZone && (
                <PayRow
                  label="CZTE tax savings"
                  value={fmt(result.tour.totalCZTESavings)}
                  sub={`${deployMonths > 12 ? 'Each full 12 months counted as its own tax year; the rest assumes one tax year' : 'Assumes the deployment falls in one tax year'} · ${filingLabel}`}
                  positive
                />
              )}
              {result.tour.sdpInterestEarned > 0 && (
                <PayRow
                  label="SDP interest earned"
                  value={fmtDec(result.tour.sdpInterestEarned)}
                  sub="Simple-interest estimate: full deposit from day one, 10% a year. Real SDP interest compounds monthly and is paid quarterly, deposits are limited by pay, and the 90 days of interest after you leave aren't included."
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
                {isCombatZone && (
                  <p className="text-xs text-blue-600 mt-1 leading-snug" data-testid="czte-savings-note">
                    Tax savings is larger than the monthly tax difference × months because the excluded pay comes off the top of your tax brackets.
                  </p>
                )}
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
          <SaveOrShareResults
            pageName="deployment"
            headline="Save or share your deployment pay estimate"
            supportingText="Useful for planning deployment finances, tracking hazard pay entitlements, or reviewing your numbers with family."
            usefulFor={['Deployment planning', 'Hazard pay', 'SDP decision']}
            getUrl={getShareUrl}
            shareTitle="My deployment pay estimate"
            shareText="Here's my deployment pay estimate from MilPayTools."
          />

          {/* ── CZTE notice for officers ──────────────────────────────── */}
          {result.isOfficer && isCombatZone && result.during.officerCZTECap !== null && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed" data-testid="officer-czte-note">
              <span className="font-semibold">Officer CZTE cap: </span>
              For commissioned officers, the monthly exclusion is capped at the senior enlisted basic pay ({fmtDec(SENIOR_ENLISTED_BASIC_PAY)} in 2026)
              {receivingIDP ? ` plus the Imminent Danger Pay you receive (${fmt(DEPLOYMENT_RATES_2026.idp)})` : ''}: {fmtDec(result.during.officerCZTECap)} a month.
              {' '}Your modeled pay (base pay{receivingIDP ? ' + IDP' : ''}{hdpLevel > 0 ? ' + HDP-L' : ''}) is {fmtDec(result.during.monthlyMilitaryPay)} a month, so{' '}
              {result.during.monthlyTaxablePay > 0
                ? `${fmtDec(result.during.monthlyTaxablePay)} a month stays in federal taxable income.`
                : 'all of it is excluded.'}
              {' '}Warrant officers are not capped. Source: 26 U.S.C. § 112(b), (c)(5); DFAS 2026 basic pay tables (officer Note 2, enlisted Note 3).
            </div>
          )}

          {/* ── Assumptions ───────────────────────────────────────────── */}
          <div className="rounded-lg bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-500 leading-relaxed" data-testid="deployment-assumptions">
            <p className="font-semibold text-zinc-600 mb-1">How these estimates work</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Federal income tax uses 2026 brackets and the standard deduction for {filingLabel.toLowerCase()}. Monthly tax before deployment (and outside a combat zone) annualizes that month&apos;s taxable pay. In a combat zone, monthly tax is the tax on the deployed months, figured the same way as the CZTE savings, divided by the months.</li>
              <li>CZTE savings compare the federal tax on the year without the exclusion to the same year with the excluded pay removed, and assume the deployment falls in one tax year (each full 12 months counts as its own year).</li>
              <li>FICA ({FICA_PCT}: Social Security and Medicare) is taken from base pay only, before and during deployment. CZTE excludes pay from federal income tax, not FICA.</li>
              <li>Not modeled: state income tax, SGLI, your own TSP contribution, and the Social Security wage base.</li>
              <li>SDP: simple interest on the full deposit from day one; the program requires 30+ consecutive days in the combat zone.</li>
            </ul>
          </div>

          {/* ── Act steps ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-5">
            <ActSteps steps={actionSteps} title="Make the most of your deployment window" />
          </div>

          {/* ── Related tools ─────────────────────────────────────────── */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Related tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { href: '/calculators/total-compensation', icon: '💰', title: 'Total Compensation', desc: 'See your full pay picture — base, allowances, tax advantages, and civilian equivalent.' },
                { href: '/calculators/tsp', icon: '📈', title: 'TSP Growth Projector', desc: 'Model what your combat zone Roth TSP contributions grow to at retirement.' },
                { href: '/bah', icon: '🏠', title: 'BAH Calculator', desc: 'Look up your home station BAH — the rate that continues during deployment.' },
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
              This calculator estimates deployment compensation based on 2026 rates. Imminent Danger Pay and Hardship Duty Pay rates are those effective {DEPLOYMENT_RATES_2026.ratesEffectiveDate}; earlier periods used the prior rates. Actual pay depends on your specific orders, designated combat zone status, and finance office processing. Combat Zone Tax Exclusion applies only in areas designated by Executive Order — verify with your orders and finance office. FICA (Social Security and Medicare) is still withheld from base pay in a combat zone; CZTE excludes pay from federal income tax only. SDP availability requires 30+ consecutive days in a combat zone while receiving HFP/IDP. TSP combat zone contribution limits are subject to IRS rules and may be affected by your BRS matching. This is not tax or financial advice — consult a tax professional for your specific situation.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
