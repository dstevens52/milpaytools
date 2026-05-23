'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { calculateTransitionReadiness } from '@/lib/calculations/transition-readiness';
import { fireCalculatorEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { ResultCard } from '@/components/calculators/shared/ResultCard';
import { ActSteps } from '@/components/calculators/shared/ActStep';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { Card } from '@/components/ui/Card';
import { ShareBar } from '@/components/calculators/shared/ShareButton';
import { DATA_YEAR } from '@/data/pay-tables/2026';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  RANK_DISPLAY,
} from '@/types/military';
import type { TransitionReadinessInput } from '@/types/calculator';
import type { PayGrade } from '@/types/military';
import { parseGrade, gradeToParam, parseBool, parseZip } from '@/lib/urlParams';

// ─── Dropdown options ─────────────────────────────────────────────────────

const GRADE_GROUPS = [
  { label: 'Enlisted', options: ENLISTED_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Warrant Officers', options: WARRANT_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officers', options: OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
  { label: 'Officers (Prior Enlisted)', options: PRIOR_ENLISTED_OFFICER_GRADES.map((g) => ({ value: g, label: RANK_DISPLAY[g] })) },
];

const YOS_OPTIONS = Array.from({ length: 41 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? 'Less than 1 year' : i === 1 ? '1 year' : `${i} years`,
}));

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SEP_MONTH_OPTIONS = MONTH_NAMES.map((m, i) => ({ value: String(i), label: m }));

const VA_RATING_OPTIONS = [
  { value: '-1', label: "Haven't filed yet" },
  { value: '0', label: '0% (filed, no rating)' },
  ...Array.from({ length: 10 }, (_, i) => {
    const pct = (i + 1) * 10;
    return { value: String(pct), label: `${pct}%${pct === 100 ? ' (Total & Permanent)' : ''}` };
  }),
];

const HEALTHCARE_ASSUMPTION_OPTIONS = [
  { value: 'marketplace', label: 'Marketplace plan (conservative estimate)' },
  { value: 'employer', label: 'Employer-sponsored plan' },
  { value: 'va', label: 'VA healthcare (50%+ disability rating)' },
  { value: 'not-sure', label: 'Not sure (use conservative estimate)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function getInitialSepDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 14);
  return { month: d.getMonth(), year: d.getFullYear() };
}

function getSepYearOptions() {
  const base = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => ({
    value: String(base + i),
    label: String(base + i),
  }));
}

function parseCurrency(raw: string): number {
  const n = Number(raw.replace(/[^\d]/g, ''));
  return isNaN(n) ? 0 : n;
}

// ─── Verdict UI config ────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  ready: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    titleColor: 'text-green-800',
    icon: '✓',
    iconBg: 'bg-green-700',
    title: 'Ready to Transition',
    summary: 'Your income, savings, and timeline support a successful separation.',
  },
  almost: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    titleColor: 'text-amber-800',
    icon: '!',
    iconBg: 'bg-amber-500',
    title: 'Almost Ready — Close the Gaps',
    summary: 'A few gaps to address before you separate. You have the time — start now.',
  },
  'not-yet': {
    bg: 'bg-red-50',
    border: 'border-red-300',
    titleColor: 'text-red-800',
    icon: '✗',
    iconBg: 'bg-red-700',
    title: "Not Yet — Here's Your Plan",
    summary: 'Significant gaps need to be addressed before this transition is financially safe.',
  },
};

const STATUS_COLORS = {
  green: { dot: 'bg-green-500', text: 'text-green-700', badge: 'bg-green-50 text-green-700 border-green-200' },
  yellow: { dot: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  red: { dot: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-50 text-red-700 border-red-200' },
  na: { dot: 'bg-zinc-400', text: 'text-zinc-500', badge: 'bg-zinc-50 text-zinc-500 border-zinc-200' },
};

// ─── Main Component ───────────────────────────────────────────────────────

export function TransitionReadinessCalculator() {
  const init = getInitialSepDate();

  // Section 1: Military status
  const [grade, setGrade] = useState<PayGrade>('E-6');
  const [yos, setYos] = useState(10);
  const [zipCode, setZipCode] = useState('');
  const [hasDependents, setHasDependents] = useState(true);
  const [sepMonth, setSepMonth] = useState(init.month);
  const [sepYear, setSepYear] = useState(init.year);
  const [retirementSystem, setRetirementSystem] = useState<'legacy' | 'brs'>('legacy');

  // Section 2: Post-military income
  const [civilianSalary, setCivilianSalary] = useState(0);
  const [spouseIncome, setSpouseIncome] = useState(0);
  const [vaRating, setVaRating] = useState(30);
  const [healthcareAssumption, setHealthcareAssumption] = useState<'marketplace' | 'employer' | 'va' | 'not-sure'>('marketplace');

  // Section 3: Expenses
  const [expenseMode, setExpenseMode] = useState<'quick' | 'detailed'>('quick');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expHousing, setExpHousing] = useState(0);
  const [expCar, setExpCar] = useState(0);
  const [expInsurance, setExpInsurance] = useState(0);
  const [expGroceries, setExpGroceries] = useState(0);
  const [expDebt, setExpDebt] = useState(0);
  const [expChildcare, setExpChildcare] = useState(0);
  const [expUtilities, setExpUtilities] = useState(0);
  const [expOther, setExpOther] = useState(0);

  // Section 4: Reserves
  const [emergencyFund, setEmergencyFund] = useState(25000);
  const [tspBalance, setTspBalance] = useState(45000);
  const [otherSavings, setOtherSavings] = useState(0);

  // UI state
  const [focusMode, setFocusMode] = useState(false);

  // Focus mode: toggle data attribute on <html> so CSS can hide page chrome
  useEffect(() => {
    if (focusMode) {
      document.documentElement.setAttribute('data-focus-mode', '');
    } else {
      document.documentElement.removeAttribute('data-focus-mode');
    }
    return () => { document.documentElement.removeAttribute('data-focus-mode'); };
  }, [focusMode]);

  // Escape key exits focus mode
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFocusMode(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Pre-populate from URL params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const gr = parseGrade(p.get('rank'));
    const yosRaw = p.get('yos');
    const gz = parseZip(p.get('zip'));
    const dep = parseBool(p.get('dep'));
    const smRaw = p.get('sm');
    const syRaw = p.get('sy');
    const rsRaw = p.get('rs');
    const salRaw = p.get('sal');
    const spRaw = p.get('sp');
    const vaRaw = p.get('va');
    const modeRaw = p.get('mode');
    const expRaw = p.get('exp');
    const efRaw = p.get('ef');
    const tspRaw = p.get('tsp');
    const savRaw = p.get('sav');
    const hcaRaw = p.get('hca');

    if (gr) setGrade(gr);
    if (yosRaw) { const n = parseInt(yosRaw, 10); if (!isNaN(n) && n >= 0 && n <= 40) setYos(n); }
    if (gz) setZipCode(gz);
    if (dep !== null) setHasDependents(dep);
    if (smRaw) { const n = parseInt(smRaw, 10); if (!isNaN(n) && n >= 0 && n <= 11) setSepMonth(n); }
    if (syRaw) { const n = parseInt(syRaw, 10); if (!isNaN(n) && n >= 2024 && n <= 2035) setSepYear(n); }
    if (rsRaw === 'brs' || rsRaw === 'legacy') setRetirementSystem(rsRaw);
    if (salRaw) { const n = parseInt(salRaw, 10); if (!isNaN(n) && n >= 0) setCivilianSalary(n); }
    if (spRaw) { const n = parseInt(spRaw, 10); if (!isNaN(n) && n >= 0) setSpouseIncome(n); }
    if (vaRaw) { const n = parseInt(vaRaw, 10); if (!isNaN(n) && n >= -1 && n <= 100) setVaRating(n); }
    if (modeRaw === 'quick' || modeRaw === 'detailed') setExpenseMode(modeRaw);
    if (expRaw) { const n = parseInt(expRaw, 10); if (!isNaN(n) && n >= 0) setTotalExpenses(n); }
    if (efRaw) { const n = parseInt(efRaw, 10); if (!isNaN(n) && n >= 0) setEmergencyFund(n); }
    if (tspRaw) { const n = parseInt(tspRaw, 10); if (!isNaN(n) && n >= 0) setTspBalance(n); }
    if (savRaw) { const n = parseInt(savRaw, 10); if (!isNaN(n) && n >= 0) setOtherSavings(n); }
    if (hcaRaw === 'marketplace' || hcaRaw === 'employer' || hcaRaw === 'va') {
      setHealthcareAssumption(hcaRaw as 'marketplace' | 'employer' | 'va');
    } else if (hcaRaw === 'ns') {
      setHealthcareAssumption('not-sure');
    }
  }, []);

  // Derived: months until separation
  const separationMonths = useMemo(() => {
    const now = new Date();
    const delta = (sepYear * 12 + sepMonth) - (now.getFullYear() * 12 + now.getMonth());
    return Math.max(0, delta);
  }, [sepMonth, sepYear]);

  function getShareUrl() {
    const p = new URLSearchParams();
    p.set('rank', gradeToParam(grade));
    p.set('yos', String(yos));
    if (zipCode) p.set('zip', zipCode);
    p.set('dep', hasDependents ? 'yes' : 'no');
    p.set('sm', String(sepMonth));
    p.set('sy', String(sepYear));
    p.set('rs', retirementSystem);
    p.set('sal', String(civilianSalary));
    p.set('sp', String(spouseIncome));
    p.set('va', String(vaRating));
    p.set('mode', expenseMode);
    if (expenseMode === 'quick') {
      p.set('exp', String(totalExpenses));
    }
    p.set('ef', String(emergencyFund));
    p.set('tsp', String(tspBalance));
    p.set('sav', String(otherSavings));
    p.set('hca', healthcareAssumption === 'not-sure' ? 'ns' : healthcareAssumption);
    return `${window.location.origin}/calculators/transition-readiness?${p.toString()}`;
  }

  const input: TransitionReadinessInput = {
    payGrade: grade,
    yearsOfService: yos,
    zipCode,
    hasDependents,
    separationMonths,
    retirementSystem,
    targetCivilianSalary: civilianSalary,
    spouseIncome,
    vaRating,
    healthcareAssumption,
    expenseMode,
    totalMonthlyExpenses: totalExpenses,
    expenseHousing: expHousing,
    expenseCar: expCar,
    expenseInsurance: expInsurance,
    expenseGroceries: expGroceries,
    expenseDebt: expDebt,
    expenseChildcare: expChildcare,
    expenseUtilities: expUtilities,
    expenseOther: expOther,
    emergencyFund,
    tspBalance,
    otherSavings,
  };

  const result = useMemo(
    () => calculateTransitionReadiness(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      grade, yos, zipCode, hasDependents, separationMonths, retirementSystem,
      civilianSalary, spouseIncome, vaRating, healthcareAssumption,
      expenseMode, totalExpenses, expHousing, expCar, expInsurance,
      expGroceries, expDebt, expChildcare, expUtilities, expOther,
      emergencyFund, tspBalance, otherSavings,
    ]
  );

  const hasEngaged = civilianSalary > 0 && result.rawMonthlyExpenses > 0;

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!hasEngaged) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('transition-readiness'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [hasEngaged]);

  const vc = VERDICT_CONFIG[result.verdict];
  const efBarPct = Math.min(100, (result.emergencyFundMonths / 12) * 100);
  const sepYearOptions = useMemo(() => getSepYearOptions(), []);

  // VA healthcare warning — shown below the healthcare dropdown
  const vaHealthcareWarning = healthcareAssumption === 'va' && vaRating < 50;

  // Print date (client-only, safe in 'use client' component)
  const printDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Focus mode fixed top bar ────────────────────────────────────── */}
      {focusMode && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2.5 bg-white border-b border-zinc-200 shadow-sm print:hidden">
          <span className="text-sm font-semibold text-zinc-900">MilPayTools</span>
          <button
            type="button"
            onClick={() => setFocusMode(false)}
            className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
          >
            ✕ Exit Focus Mode
          </button>
        </div>
      )}

      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6${focusMode ? ' pt-16 pb-8' : ' py-8'}`}>

        {/* ── Input sections (hidden in print) ─────────────────────────── */}
        <div className="space-y-6 print:hidden">

          {/* Focus mode toggle */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setFocusMode((v) => !v)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-md px-3 py-1.5 bg-white transition-colors"
            >
              {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </div>

          {/* ── Section 1: Military Status ────────────────────────────── */}
          <Card variant="default">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">
              1. Current Military Status
            </h2>
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

              <BaseSearchInput
                label="Duty Station"
                value={zipCode}
                onZipChange={setZipCode}
                placeholder="Try Fort Bragg, San Diego, or 78234"
                hint="Enter your duty station name or ZIP for BAH (optional)"
              />

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-700">Dependent Status</span>
                <div className="flex gap-3 mt-1">
                  {([{ label: 'No dependents', value: false }, { label: 'With dependents', value: true }] as const).map(
                    ({ label, value }) => (
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
                    )
                  )}
                </div>
              </div>

              {/* Separation date pickers */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-sm font-medium text-zinc-700">Planned Separation Date</span>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select
                      label=""
                      id="sep-month"
                      options={SEP_MONTH_OPTIONS}
                      value={String(sepMonth)}
                      onChange={(e) => setSepMonth(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      label=""
                      id="sep-year"
                      options={sepYearOptions}
                      value={String(sepYear)}
                      onChange={(e) => setSepYear(Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  {separationMonths === 0
                    ? 'Separation date is today or in the past'
                    : `${separationMonths} month${separationMonths === 1 ? '' : 's'} until separation`}
                  {separationMonths < 6 && separationMonths > 0 && (
                    <span className="ml-1 text-zinc-500 font-medium">— very short timeline</span>
                  )}
                  {separationMonths >= 6 && separationMonths < 12 && (
                    <span className="ml-1 text-zinc-500 font-medium">— start now</span>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-700">Retirement System</span>
                <div className="flex gap-3 mt-1">
                  {([{ label: 'Legacy (High-3)', value: 'legacy' as const }, { label: 'BRS', value: 'brs' as const }]).map(
                    ({ label, value }) => (
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
                    )
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {result.isRetirementEligible
                    ? `You'll reach ${Math.floor(result.separationYOS)} years at separation — pension included`
                    : `${Math.floor(result.separationYOS)} years at separation — not retirement-eligible (need 20)`}
                </p>
              </div>

            </div>
          </Card>

          {/* ── Section 2: Post-Military Income ──────────────────────── */}
          <Card variant="default">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">
              2. Expected Post-Military Income
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Input
                label="Target Civilian Salary (annual gross)"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 75000"
                value={civilianSalary === 0 ? '' : String(civilianSalary)}
                onChange={(e) => setCivilianSalary(parseCurrency(e.target.value))}
                hint="Not sure? E-5–E-7 separatees: $45K–$65K median. Officers: $70K–$110K."
              />

              <Input
                label="Spouse / Partner Income (annual gross)"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 48000 (or 0)"
                value={spouseIncome === 0 ? '' : String(spouseIncome)}
                onChange={(e) => setSpouseIncome(parseCurrency(e.target.value))}
                hint="Leave blank or enter 0 if not applicable"
              />

              <div className="sm:col-span-2">
                <Select
                  label="Expected VA Disability Rating"
                  options={VA_RATING_OPTIONS}
                  value={String(vaRating)}
                  onChange={(e) => setVaRating(Number(e.target.value))}
                  hint={
                    vaRating === -1
                      ? '⚠ Filing before separation is strongly recommended — see action steps below'
                      : vaRating > 0
                      ? `${formatCurrency(result.vaCompMonthly)}/month tax-free compensation included`
                      : '0% rating adds no monthly compensation but preserves VA healthcare eligibility'
                  }
                />
                <p className="text-xs text-zinc-500 mt-1.5">
                  Estimate assumes veteran with spouse. Actual VA compensation varies by number of children, dependent parents, and Aid &amp; Attendance eligibility.
                </p>
              </div>

              {/* Healthcare assumption selector */}
              <div className="sm:col-span-2">
                <Select
                  label="Expected Healthcare Coverage"
                  options={HEALTHCARE_ASSUMPTION_OPTIONS}
                  value={healthcareAssumption}
                  onChange={(e) => setHealthcareAssumption(e.target.value as 'marketplace' | 'employer' | 'va' | 'not-sure')}
                  hint="Healthcare replacement cost varies significantly. Employer coverage, marketplace plans, VA care, and TRICARE retiree coverage produce very different monthly costs."
                />
                {vaHealthcareWarning && (
                  <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                    VA healthcare enrollment priority depends on disability rating. Veterans with ratings below 50% may face copays or limited enrollment. Consider selecting a backup option.
                  </div>
                )}
              </div>

            </div>
          </Card>

          {/* ── Section 3: Monthly Expenses ───────────────────────────── */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">3. Monthly Expenses</h2>
              <div className="flex gap-2">
                {(['quick', 'detailed'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExpenseMode(mode)}
                    className={[
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      expenseMode === mode
                        ? 'bg-red-700 border-red-700 text-white'
                        : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400',
                    ].join(' ')}
                  >
                    {mode === 'quick' ? 'Quick' : 'Detailed'}
                  </button>
                ))}
              </div>
            </div>

            {expenseMode === 'quick' ? (
              <Input
                label="Total Monthly Expenses"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 4200"
                value={totalExpenses === 0 ? '' : String(totalExpenses)}
                onChange={(e) => setTotalExpenses(parseCurrency(e.target.value))}
                hint="Include rent/mortgage, car payments, insurance, groceries, debt payments, and regular spending. Do not include healthcare — the calculator adds that for you."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Housing (rent/mortgage)', state: expHousing, setter: setExpHousing },
                  { label: 'Car Payment(s)', state: expCar, setter: setExpCar },
                  { label: 'Insurance (auto, renters/home)', state: expInsurance, setter: setExpInsurance },
                  { label: 'Groceries & Food', state: expGroceries, setter: setExpGroceries },
                  { label: 'Debt Payments (credit cards, loans)', state: expDebt, setter: setExpDebt },
                  { label: 'Childcare', state: expChildcare, setter: setExpChildcare },
                  { label: 'Utilities', state: expUtilities, setter: setExpUtilities },
                  { label: 'Other Monthly Expenses', state: expOther, setter: setExpOther },
                ].map(({ label, state, setter }) => (
                  <Input
                    key={label}
                    label={label}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={state === 0 ? '' : String(state)}
                    onChange={(e) => setter(parseCurrency(e.target.value))}
                  />
                ))}
                <div className="sm:col-span-2 rounded-md bg-zinc-50 border border-zinc-200 px-4 py-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600">Total monthly expenses</span>
                    <span className="font-bold text-zinc-900 tabular-nums">
                      {formatCurrency(result.rawMonthlyExpenses)}/mo
                    </span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-zinc-400 mt-3">
              Healthcare is NOT included above — the calculator adds the estimated replacement cost for you.
            </p>
          </Card>

          {/* ── Section 4: Financial Reserves ─────────────────────────── */}
          <Card variant="default">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold text-zinc-900">4. Financial Reserves</h2>
              <p className="text-xs text-zinc-400 text-right leading-relaxed">Estimates are fine — use rounded numbers if you&apos;re using this in a classroom or group setting.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                label="Emergency Fund Balance"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 25000"
                value={emergencyFund === 0 ? '' : String(emergencyFund)}
                onChange={(e) => setEmergencyFund(parseCurrency(e.target.value))}
                hint="Savings earmarked for emergencies (not TSP)"
              />
              <Input
                label="TSP Balance"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 45000"
                value={tspBalance === 0 ? '' : String(tspBalance)}
                onChange={(e) => setTspBalance(parseCurrency(e.target.value))}
                hint="Retirement account — not used for emergency runway"
              />
              <Input
                label="Other Savings / Investments"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 10000"
                value={otherSavings === 0 ? '' : String(otherSavings)}
                onChange={(e) => setOtherSavings(parseCurrency(e.target.value))}
                hint="Non-TSP savings and brokerage accounts"
              />
            </div>
          </Card>

        </div>{/* end print:hidden input sections */}

        {/* ── Results ────────────────────────────────────────────────────── */}
        {!hasEngaged ? (
          <div className="rounded-xl border-2 border-zinc-200 bg-zinc-50 p-8 text-center">
            <p className="text-zinc-500 text-base">
              {civilianSalary > 0 && result.rawMonthlyExpenses === 0
                ? 'Enter your monthly expenses above to see your readiness assessment.'
                : result.rawMonthlyExpenses > 0 && civilianSalary === 0
                ? 'Enter your target civilian salary above to see your readiness assessment.'
                : 'Enter your target salary and monthly expenses above to see your readiness assessment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Share + Print buttons — hidden in print */}
            <div className="flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Save as PDF
              </button>
            </div>
            {/* Print-only header */}
            <div className="hidden print:block pb-4 mb-2 border-b border-zinc-200">
              <h1 className="text-2xl font-bold text-zinc-900">
                Transition Readiness Assessment — {printDate}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Generated from MilPayTools.com · Data current as of January 1, 2026
              </p>
            </div>

            {/* Verdict banner */}
            <div className={`rounded-xl border-2 ${vc.border} ${vc.bg} p-6`}>
              <div className="flex items-center gap-4">
                <div className={`flex-none w-12 h-12 rounded-full ${vc.iconBg} text-white font-black text-2xl flex items-center justify-center`}>
                  {vc.icon}
                </div>
                <div>
                  <p className={`text-xl font-extrabold ${vc.titleColor}`}>{vc.title}</p>
                  <p className={`text-sm mt-0.5 ${vc.titleColor} opacity-80`}>{vc.summary}</p>
                </div>
              </div>

              {/* Factor indicators */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Income surplus',
                    status: result.surplusStatus,
                    detail:
                      result.surplusStatus === 'green'
                        ? `+${formatCurrency(result.monthlyGapOrSurplus)}/mo`
                        : result.surplusStatus === 'yellow'
                        ? `+${formatCurrency(result.monthlyGapOrSurplus)}/mo`
                        : `${formatCurrency(result.monthlyGapOrSurplus)}/mo`,
                  },
                  {
                    label: 'Emergency fund',
                    status: result.emergencyFundStatus,
                    detail: `${result.emergencyFundMonths.toFixed(1)} months`,
                  },
                  {
                    label: 'VA claim',
                    status: result.vaClaimStatus,
                    detail:
                      result.vaClaimStatus === 'na'
                        ? 'TRICARE retiree'
                        : result.vaClaimStatus === 'green'
                        ? 'Filed'
                        : 'Not yet filed',
                  },
                  {
                    label: 'Timeline',
                    status: result.timelineStatus,
                    detail: `${separationMonths} months out`,
                  },
                ].map(({ label, status, detail }) => {
                  const sc = STATUS_COLORS[status];
                  return (
                    <div key={label} className={`rounded-lg border px-3 py-2.5 ${sc.badge}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full flex-none ${sc.dot}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${sc.text}`}>
                          {label}
                        </span>
                      </div>
                      <p className={`text-sm font-bold tabular-nums ${sc.text}`}>{detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <ShareBar getUrl={getShareUrl} className="print:hidden" />

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResultCard
                title="Current Military Compensation"
                dataYear={DATA_YEAR}
                rows={[
                  { label: 'Basic Pay (taxable)', monthly: result.militaryMonthlyBasePay },
                  {
                    label: 'BAH — Housing (tax-free)',
                    monthly: result.militaryMonthlyBAH > 0 ? result.militaryMonthlyBAH : undefined,
                    value: result.militaryMonthlyBAH === 0 ? 'Enter ZIP code' : undefined,
                  },
                  { label: 'BAS — Subsistence (tax-free)', monthly: result.militaryMonthlyBAS },
                  { label: 'Total Military Comp', monthly: result.militaryTotalMonthly, highlight: true },
                ]}
              />

              <ResultCard
                title="Projected Civilian Income"
                dataYear={DATA_YEAR}
                rows={[
                  { label: `Net salary (${formatCurrency(civilianSalary)}/yr gross)`, monthly: result.netCivilianSalaryMonthly },
                  ...(result.pensionMonthly > 0
                    ? [{ label: 'Retirement pension (tax-free)', monthly: result.pensionMonthly }]
                    : []),
                  ...(result.vaCompMonthly > 0
                    ? [{ label: `VA disability ${vaRating}% (tax-free)`, monthly: result.vaCompMonthly }]
                    : vaRating === -1
                    ? [{ label: 'VA disability', value: 'Not yet filed — $0' }]
                    : []),
                  ...(result.netSpouseMonthly > 0
                    ? [{ label: 'Net spouse income', monthly: result.netSpouseMonthly }]
                    : []),
                  { label: 'Total Projected Income', monthly: result.projectedCivilianMonthly, highlight: true },
                ]}
              />
            </div>

            {/* Income delta callout */}
            <div className={`rounded-lg border p-5 ${result.monthlyGapOrSurplus >= 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
              <p className={`text-sm font-semibold mb-1 ${result.monthlyGapOrSurplus >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                Military vs. civilian income comparison
              </p>
              <p className={`text-sm leading-relaxed ${result.monthlyGapOrSurplus >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                Your projected civilian income is{' '}
                <span className="font-bold">
                  {result.projectedCivilianMonthly >= result.militaryTotalMonthly
                    ? `${formatCurrency(result.projectedCivilianMonthly - result.militaryTotalMonthly)}/month more`
                    : `${formatCurrency(result.militaryTotalMonthly - result.projectedCivilianMonthly)}/month less`}
                </span>{' '}
                than your current military comp. This comparison excludes healthcare costs — see below.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Civilian income estimated at 65.35% take-home (22% federal + 7.65% FICA + 5% state). Actual varies by state and filing status.
              </p>
            </div>

            {/* Healthcare Reality Check */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700 mb-2">The Healthcare Reality Check</p>
              {result.hasRetireeTricare ? (
                <p className="text-sm text-red-700 leading-relaxed">
                  <span className="font-semibold">Good news:</span> At 20+ years you keep TRICARE retiree coverage at minimal cost. This is worth thousands per year — it&apos;s a major financial advantage of retirement-eligible separation.
                </p>
              ) : (
                <>
                  <p className="text-sm text-red-700 leading-relaxed">
                    <span className="font-semibold">TAMP covers your first 180 days</span> — no healthcare premium for the first 6 months after separation.
                    {result.healthcareCostMonthly > 0 ? (
                      <> After that, estimated <span className="font-bold">{result.healthcareAssumptionLabel.toLowerCase()}</span> cost is <span className="font-bold">{formatCurrency(result.healthcareCostMonthly)}/month</span> — plan for it before your TAMP window expires.</>
                    ) : (
                      <> After that, <span className="font-bold">{result.healthcareAssumptionLabel}</span> applies.</>
                    )}
                  </p>
                  <p className="text-xs text-red-600 mt-2 pt-2 border-t border-red-200">
                    The budget analysis uses the ongoing post-TAMP monthly cost. Confirm TAMP eligibility with your unit S1 before separation.
                  </p>
                </>
              )}
              <Link
                href="/calculators/healthcare-comparison"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors"
              >
                Compare healthcare options in detail →
              </Link>
            </div>

            {/* Budget Gap Analysis */}
            <Card variant="bordered">
              <h3 className="text-base font-semibold text-zinc-900 mb-4">Budget Gap Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Your expenses</span>
                  <span className="font-mono tabular-nums text-zinc-800">{formatCurrency(result.rawMonthlyExpenses)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">
                    Healthcare — {result.hasRetireeTricare ? 'TRICARE retiree' : result.healthcareAssumptionLabel.toLowerCase()}
                  </span>
                  <span className={`font-mono tabular-nums ${result.hasRetireeTricare || result.healthcareCostMonthly === 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {result.hasRetireeTricare
                      ? '~$0/mo (retiree)'
                      : result.healthcareCostMonthly === 0
                      ? '$0/mo'
                      : `+${formatCurrency(result.healthcareCostMonthly)}/mo`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-zinc-300">
                  <span className="text-sm font-semibold text-zinc-700">Total adjusted expenses</span>
                  <span className="font-mono tabular-nums font-bold text-zinc-900">{formatCurrency(result.adjustedMonthlyExpenses)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Projected civilian income</span>
                  <span className="font-mono tabular-nums text-zinc-800">{formatCurrency(result.projectedCivilianMonthly)}/mo</span>
                </div>
                <div className={`flex justify-between items-center py-3 rounded-lg px-3 ${result.monthlyGapOrSurplus >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className={`text-sm font-bold ${result.monthlyGapOrSurplus >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Monthly {result.monthlyGapOrSurplus >= 0 ? 'surplus' : 'shortfall'}
                  </span>
                  <span className={`font-mono tabular-nums font-extrabold text-lg ${result.monthlyGapOrSurplus >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {result.monthlyGapOrSurplus >= 0 ? '+' : ''}{formatCurrency(result.monthlyGapOrSurplus)}/mo
                  </span>
                </div>
              </div>
            </Card>

            {/* Emergency Fund Runway */}
            <Card variant="bordered">
              <h3 className="text-base font-semibold text-zinc-900 mb-1">Emergency Fund Runway</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Liquid savings only — TSP is excluded (retirement money, not emergency fund)
              </p>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold tabular-nums text-zinc-900">
                  {result.emergencyFundMonths.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-500">months of post-transition expenses covered</span>
              </div>

              <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden mb-3">
                <div
                  style={{ width: `${efBarPct}%` }}
                  className={[
                    'h-full rounded-full transition-all duration-300',
                    result.emergencyFundStatus === 'green'
                      ? 'bg-green-500'
                      : result.emergencyFundStatus === 'yellow'
                      ? 'bg-amber-500'
                      : 'bg-red-500',
                  ].join(' ')}
                />
                <div className="absolute top-0 bottom-0 w-px bg-zinc-400" style={{ left: '50%' }} />
              </div>

              <div className="flex justify-between text-xs text-zinc-400 mb-4">
                <span>0 months</span>
                <span className="text-zinc-500 font-medium">6 months (target)</span>
                <span>12 months</span>
              </div>

              <div className="rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-600">Liquid savings (EF + other)</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(result.totalLiquidSavings)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-600">TSP balance (retirement — not counted)</span>
                  <span className="font-semibold tabular-nums text-zinc-400">{formatCurrency(tspBalance)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-200">
                  <span className="text-zinc-600">6-month target</span>
                  <span className="font-bold tabular-nums">{formatCurrency(6 * result.adjustedMonthlyExpenses)}</span>
                </div>
              </div>

              {result.emergencyFundMonths < 6 && (
                <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Many transition planners use 6 months of expenses as a conservative target, with 12 months offering more cushion for job search delays, VA claim processing, relocation costs, or healthcare gaps.
                  You need {formatCurrency(Math.max(0, 6 * result.adjustedMonthlyExpenses - result.totalLiquidSavings))} more
                  to reach the 6-month threshold.
                </p>
              )}
            </Card>

            {/* Action steps */}
            {result.actionSteps.length > 0 && (
              <ActSteps steps={result.actionSteps} title="What to do next" />
            )}

            {/* Transition roadmap CTA */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 print:hidden">
              <p className="text-sm text-zinc-700">
                <span className="font-semibold">Need the full timeline?</span>{' '}
                <a href="/transition" className="text-red-700 hover:text-red-800 font-medium underline underline-offset-2 transition-colors">
                  Use the Transition Financial Roadmap
                </a>{' '}
                to see what to do at each phase before and after separation.
              </p>
            </div>

            {/* Cross-links — hidden in print */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
              <a
                href="/calculators/va-disability"
                className="group flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="flex-none w-8 h-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-base">
                  🎖️
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors">
                    VA Disability Rating Calculator
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Calculate your combined rating and monthly compensation →</p>
                </div>
              </a>
              <a
                href="/transition"
                className="group flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="flex-none w-8 h-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-base">
                  🗺️
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors">
                    Military Transition Financial Roadmap
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Phase-by-phase financial checklist — 12 months out through day 1 →</p>
                </div>
              </a>
            </div>

            {/* Print-only disclaimer */}
            <div className="hidden print:block mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-1">
              <p>This is an estimate for planning purposes only. Not financial, tax, or legal advice. Verify all figures with official DoD and VA sources.</p>
              <p>MilPayTools.com — Data current as of January 1, 2026</p>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
