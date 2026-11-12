/**
 * 2027 pay raise math and wording — pure functions, no React.
 *
 * Every function takes the PayRaiseConfig explicitly (defaulting to the live
 * PAY_RAISE_2027) so tests can pass fixtures for the 'enacted' and
 * 'official-table' modes. All page wording that depends on the law's status
 * comes from here, so release day is a one-file edit in src/data/pay-raise/2027.ts.
 */

import {
  PAY_RAISE_2027,
  GRADE_TIERS,
  ASSUMED_TIER_GRADES,
  LEVEL_II_GRADES,
  type PayRaiseConfig,
  type PercentByTier,
  type PayCaps,
} from '@/data/pay-raise/2027';
import type { PayTable } from '@/data/types';
import { payTable as payTable2026 } from '@/data/pay-tables/2026';
import { ALL_PAY_GRADES, YOS_BREAKPOINTS, type PayGrade } from '@/types/military';
import { lookupBasePay } from '@/lib/calculations/basePay';
import { getYOSBracket } from '@/lib/utils';

// ─── Lookups ────────────────────────────────────────────────────────────────

/** Value from a pay table at a YOS: highest key ≤ getYOSBracket(yos), else null. */
export function tableValue(table: PayTable, grade: PayGrade, yos: number): number | null {
  const entry = table[grade] as Record<number, number | undefined> | undefined;
  if (!entry) return null;
  const bracket = getYOSBracket(yos);
  const keys = Object.keys(entry)
    .map(Number)
    .filter((k) => k <= bracket && entry[k] !== undefined)
    .sort((a, b) => b - a);
  return keys.length ? (entry[keys[0]] as number) : null;
}

/**
 * Official 2026 basic pay, or null when DFAS publishes no rate for that
 * grade/YOS (e.g. E-9 under 10 years). Uses the calculators' lookupBasePay;
 * the applicability check stops its 0 fallback from ever surfacing as $0.
 */
export function pay2026(grade: PayGrade, yos: number): number | null {
  if (tableValue(payTable2026, grade, yos) === null) return null;
  const v = lookupBasePay(grade, yos);
  return v > 0 ? v : null;
}

export function capFor(grade: PayGrade, caps: PayCaps): number {
  return LEVEL_II_GRADES.includes(grade) ? caps.levelII : caps.levelV;
}

export function tierPercent(grade: PayGrade, percentByTier: PercentByTier): number {
  return percentByTier[GRADE_TIERS[grade]];
}

export function isAssumedTier(grade: PayGrade): boolean {
  return ASSUMED_TIER_GRADES.includes(grade);
}

// ─── Projection ─────────────────────────────────────────────────────────────

export type RaiseResult =
  | { applicable: false }
  | {
      applicable: true;
      pay2026: number;
      projected: number;
      capped: boolean;
      uncappedAmount: number;
      monthlyIncrease: number;
      annualIncrease: number;
      /** Raise percent applied (null for official DFAS table values). */
      percent: number | null;
      /** True when the figure is computed (not read from a DFAS table). */
      estimate: boolean;
    };

/**
 * Projected 2027 pay = 2026 pay × (1 + tier %), rounded to the nearest $0.10
 * (DFAS tables are in dimes), then held at the grade's cap. Integer math in
 * cents so the result is exact.
 */
export function projectRaise(
  grade: PayGrade,
  yos: number,
  percentByTier: PercentByTier,
  caps: PayCaps,
): RaiseResult {
  const base = pay2026(grade, yos);
  if (base === null) return { applicable: false };
  const percent = tierPercent(grade, percentByTier);
  const baseCents = Math.round(base * 100);
  const bp = Math.round(percent * 100); // basis points
  const dimes = Math.round((baseCents * (10000 + bp)) / 100000);
  const uncappedCents = dimes * 10;
  const capCents = Math.round(capFor(grade, caps) * 100);
  const capped = uncappedCents > capCents;
  const projectedCents = capped ? capCents : uncappedCents;
  return {
    applicable: true,
    pay2026: baseCents / 100,
    projected: projectedCents / 100,
    capped,
    uncappedAmount: uncappedCents / 100,
    monthlyIncrease: (projectedCents - baseCents) / 100,
    annualIncrease: ((projectedCents - baseCents) * 12) / 100,
    percent,
    estimate: true,
  };
}

/** 2027 pay read from the official DFAS 2027 table (official-table mode). */
export function officialResult(table: PayTable, grade: PayGrade, yos: number): RaiseResult {
  const base = pay2026(grade, yos);
  const v = tableValue(table, grade, yos);
  if (base === null || v === null) return { applicable: false };
  const baseCents = Math.round(base * 100);
  const vCents = Math.round(v * 100);
  return {
    applicable: true,
    pay2026: baseCents / 100,
    projected: vCents / 100,
    capped: false,
    uncappedAmount: vCents / 100,
    monthlyIncrease: (vCents - baseCents) / 100,
    annualIncrease: ((vCents - baseCents) * 12) / 100,
    percent: null,
    estimate: false,
  };
}

// ─── Columns (what the page shows side by side) ─────────────────────────────

export interface RaiseColumn {
  id: string;
  /** Column header, e.g. "Current plan (7-6-5)", "Official raise (7-6-5)". */
  label: string;
  kind: 'scenario' | 'enacted' | 'official-table';
  percentByTier: PercentByTier | null;
  sourceName: string;
  sourceUrl: string;
}

export function getColumns(config: PayRaiseConfig = PAY_RAISE_2027): RaiseColumn[] {
  if (config.status === 'official-table') {
    if (!config.officialTable) {
      throw new Error("pay-raise: status 'official-table' requires officialTable (src/data/pay-tables/2027.ts)");
    }
    return [
      {
        id: 'official-table',
        label: 'Official DFAS 2027 rates',
        kind: 'official-table',
        percentByTier: null,
        sourceName: 'DFAS 2027 basic pay tables',
        sourceUrl: 'https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/',
      },
    ];
  }
  if (config.status === 'enacted') {
    if (!config.enacted) throw new Error("pay-raise: status 'enacted' requires enacted");
    return [
      {
        id: 'enacted',
        label: `Official raise (${shortPercentLabel(config.enacted.percentByTier)})`,
        kind: 'enacted',
        percentByTier: config.enacted.percentByTier,
        sourceName: config.enacted.lawName,
        sourceUrl: config.enacted.sourceUrl,
      },
    ];
  }
  return config.scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    kind: 'scenario' as const,
    percentByTier: s.percentByTier,
    sourceName: s.sourceName,
    sourceUrl: s.sourceUrl,
  }));
}

export function resultFor(
  column: RaiseColumn,
  grade: PayGrade,
  yos: number,
  config: PayRaiseConfig = PAY_RAISE_2027,
): RaiseResult {
  if (column.kind === 'official-table') {
    return officialResult(config.officialTable as PayTable, grade, yos);
  }
  return projectRaise(grade, yos, column.percentByTier as PercentByTier, config.caps);
}

/** Per-result heading: "Current plan (7-6-5)", "Official: 6%", "Official DFAS 2027 rates". */
export function resultLabel(column: RaiseColumn, grade: PayGrade): string {
  if (column.kind === 'enacted') {
    return `Official: ${formatPercent(tierPercent(grade, column.percentByTier as PercentByTier))}`;
  }
  return column.label;
}

/** Count of grade × DFAS-column amounts held at the cap under a percent set. */
export function countCapped(percentByTier: PercentByTier, caps: PayCaps): number {
  let n = 0;
  for (const grade of ALL_PAY_GRADES) {
    for (const yos of YOS_BREAKPOINTS) {
      const r = projectRaise(grade, yos, percentByTier, caps);
      if (r.applicable && r.capped) n++;
    }
  }
  return n;
}

// ─── Wording ────────────────────────────────────────────────────────────────

export function formatPercent(p: number): string {
  return `${Number(p.toFixed(2))}%`;
}

function isFlat(pbt: PercentByTier): boolean {
  return pbt['E1-E5'] === pbt['E6-O3'] && pbt['E6-O3'] === pbt['O4-up'];
}

/** "7-6-5" for a tiered raise, "3.6%" for a flat one. */
export function shortPercentLabel(pbt: PercentByTier): string {
  if (isFlat(pbt)) return formatPercent(pbt['E1-E5']);
  return [pbt['E1-E5'], pbt['E6-O3'], pbt['O4-up']].map((p) => Number(p.toFixed(2))).join('-');
}

/** "7% E-1 to E-5, 6% E-6 to O-3, 5% O-4 and above" or "3.6% for all grades". */
export function describePercents(pbt: PercentByTier): string {
  if (isFlat(pbt)) return `${formatPercent(pbt['E1-E5'])} for all grades`;
  return `${formatPercent(pbt['E1-E5'])} E-1 to E-5, ${formatPercent(pbt['E6-O3'])} E-6 to O-3, ${formatPercent(pbt['O4-up'])} O-4 and above`;
}

/** ISO date → "November 11, 2026" (UTC, so no timezone day shift). */
export function formatIsoDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function planScenario(config: PayRaiseConfig) {
  return config.scenarios.find((s) => s.id === 'current-plan') ?? config.scenarios[0];
}
function senateScenario(config: PayRaiseConfig) {
  return config.scenarios.find((s) => s.id === 'senate-3-6') ?? config.scenarios[1];
}

/** Short status badge: "Not final", "Official: 7-6-5", "Official DFAS 2027 rates". */
export function statusLabel(config: PayRaiseConfig = PAY_RAISE_2027): string {
  if (config.status === 'official-table') return 'Official DFAS 2027 rates';
  if (config.status === 'enacted' && config.enacted) {
    return `Official: ${shortPercentLabel(config.enacted.percentByTier)}`;
  }
  return 'Not final';
}

/**
 * The dated status sentence — shared verbatim by the status box, the summary
 * block, the /pay hub FAQ and the page FAQ, so the wording can never diverge.
 */
export function statusText(config: PayRaiseConfig = PAY_RAISE_2027): string {
  const checked = formatIsoDate(config.lastChecked);
  if (config.status === 'official-table') {
    const law = config.enacted
      ? ` The raise was set by the ${config.enacted.lawName}, signed ${formatIsoDate(config.enacted.signedDate)} (${describePercents(config.enacted.percentByTier)}).`
      : '';
    return `Official DFAS 2027 rates, effective January 1, 2027.${law} Last checked ${checked}.`;
  }
  if (config.status === 'enacted' && config.enacted) {
    return `Final as of ${checked}. The ${config.enacted.lawName}, signed ${formatIsoDate(config.enacted.signedDate)}, sets the 2027 raise at ${describePercents(config.enacted.percentByTier)}, effective January 1, 2027. Figures are calculated from the law until DFAS publishes the 2027 table.`;
  }
  const plan = planScenario(config);
  const senate = senateScenario(config);
  const senatePart = senate
    ? ` The Senate's version would set ${isFlat(senate.percentByTier) ? `${formatPercent(senate.percentByTier['E1-E5'])} for everyone` : describePercents(senate.percentByTier)}.`
    : '';
  return `Not final as of ${checked}. The current plan (${describePercents(plan.percentByTier)}) takes effect January 1, 2027 unless Congress enacts a different raise.${senatePart}`;
}

export function pageTitle(config: PayRaiseConfig = PAY_RAISE_2027): string {
  if (config.status === 'official-table') return '2027 Military Pay Raise Calculator: Official DFAS 2027 Rates';
  if (config.status === 'enacted' && config.enacted) {
    return `2027 Military Pay Raise Calculator: Official ${shortPercentLabel(config.enacted.percentByTier)} Raise`;
  }
  const plan = planScenario(config);
  const senate = senateScenario(config);
  return `2027 Military Pay Raise Calculator: ${shortPercentLabel(plan.percentByTier)} Plan vs ${shortPercentLabel(senate.percentByTier)}`;
}

export function pageDescription(config: PayRaiseConfig = PAY_RAISE_2027): string {
  if (config.status === 'official-table') {
    return 'Official 2027 DFAS basic pay by grade and years of service, next to your 2026 pay, with the monthly and annual increase.';
  }
  if (config.status === 'enacted' && config.enacted) {
    return `See your 2027 base pay under the official ${shortPercentLabel(config.enacted.percentByTier)} raise, by grade and years of service, next to your 2026 pay. Calculated from the law until DFAS publishes the 2027 table.`;
  }
  const plan = planScenario(config);
  const senate = senateScenario(config);
  return `See your 2027 base pay under the current ${shortPercentLabel(plan.percentByTier)} plan and the Senate's ${shortPercentLabel(senate.percentByTier)} version, by grade and years of service. Not final yet; updated as Congress acts.`;
}

/** One-line link text used on /pay/[rank] pages and the homepage. */
export function rankPageLinkText(config: PayRaiseConfig = PAY_RAISE_2027): string {
  if (config.status === 'pending') return "2027 raise: see what you'd make under each plan →";
  return '2027 raise: see your official 2027 pay →';
}

/** Default text for the blog CalculatorCallout. */
export function calloutText(config: PayRaiseConfig = PAY_RAISE_2027): string {
  if (config.status === 'pending') {
    const plan = planScenario(config);
    const senate = senateScenario(config);
    return `The 2027 raise isn't final yet. See your 2027 base pay under the current ${shortPercentLabel(plan.percentByTier)} plan and the Senate's ${shortPercentLabel(senate.percentByTier)} version, next to your official 2026 pay.`;
  }
  return 'See your official 2027 base pay by grade and years of service, next to your 2026 pay.';
}

export const CAP_NOTE_PENDING = 'May be limited by the pay cap; 2027 cap not yet published.';
export const ESTIMATE_NOTE = "Estimate; DFAS's official table may differ by a few cents.";

/**
 * Which grades hit the cap under a percent set, in words:
 * "O-6 at over 26 years and up, O-8 at over 20 years and up, O-9 and O-10 at every year".
 */
export function cappedGradesSummary(percentByTier: PercentByTier, caps: PayCaps): string {
  const always: PayGrade[] = [];
  const partial: string[] = [];
  for (const grade of ALL_PAY_GRADES) {
    const cells = YOS_BREAKPOINTS.map((y) => ({ y, r: projectRaise(grade, y, percentByTier, caps) })).filter(
      (c) => c.r.applicable,
    );
    const capped = cells.filter((c) => c.r.applicable && c.r.capped);
    if (capped.length === 0) continue;
    if (capped.length === cells.length) always.push(grade);
    else partial.push(`${grade} at over ${capped[0].y} years and up`);
  }
  const parts = [...partial];
  if (always.length) {
    const names = always.length === 1 ? always[0] : `${always.slice(0, -1).join(', ')} and ${always[always.length - 1]}`;
    parts.push(`${names} at every year of service`);
  }
  return parts.join(', ');
}

/**
 * Quotable plain-text summary for search engines and AI answers. Pending mode
 * carries the legislative background; the other modes lead with the status.
 */
export function summaryText(config: PayRaiseConfig = PAY_RAISE_2027): string {
  const checked = formatIsoDate(config.lastChecked);
  if (config.status !== 'pending') {
    return `${statusText(config)} Sources: ${getColumns(config).map((c) => c.sourceName).join('; ')}; DFAS 2026 basic pay tables.`;
  }
  const plan = planScenario(config);
  const senate = senateScenario(config);
  return `2027 military pay raise, last checked ${checked}: On August 26, 2026, the President sent Congress an alternative pay plan under 37 U.S.C. 1009(e) (House Document 119-189) that sets the 2027 basic pay raise at ${describePercents(plan.percentByTier)}, subject to the pay caps in 37 U.S.C. 203, effective January 1, 2027. It takes effect unless Congress enacts a different raise. The Senate Armed Services Committee's FY2027 NDAA sets ${shortPercentLabel(senate.percentByTier)} for all grades, the statutory Employment Cost Index figure under 37 U.S.C. 1009(c); the House committee version supports ${shortPercentLabel(plan.percentByTier)}. The final FY2027 NDAA has not been enacted, so neither figure is final; 2026 pay is the only official figure. Sources: H. Doc. 119-189; CRS Insight IN12706 (July 14, 2026); DFAS 2026 basic pay tables.`;
}

/** FAQ for /pay/raise — one source for the visible list and the FAQPage schema. */
export function raiseFaqs(config: PayRaiseConfig = PAY_RAISE_2027): { question: string; answer: string }[] {
  const caps = config.caps;
  const capYearNote = caps.pending
    ? ` The ${caps.capYear + 1} Executive Schedule rates are not yet published, so this page uses the ${caps.capYear} caps.`
    : '';
  const capLine = `Basic pay is capped by 37 U.S.C. 203: O-7 to O-10 at Executive Schedule Level II, every other grade at Level V. In ${caps.capYear} those caps are $${caps.levelII.toLocaleString('en-US', { minimumFractionDigits: 2 })} and $${caps.levelV.toLocaleString('en-US', { minimumFractionDigits: 2 })} a month.${capYearNote}`;

  if (config.status === 'pending') {
    const plan = planScenario(config);
    const senate = senateScenario(config);
    const n = countCapped(plan.percentByTier, caps);
    return [
      {
        question: 'When will the 2027 raise be final?',
        answer: `The raise becomes final when Congress enacts the FY2027 National Defense Authorization Act (NDAA) with a pay raise in it, or on January 1, 2027, when the current plan takes effect if Congress has not enacted a different raise. ${statusText(config)}`,
      },
      {
        question: 'Why is the raise different by rank?',
        answer: `The President's alternative pay plan under 37 U.S.C. 1009(e) sets different percentages by grade: ${describePercents(plan.percentByTier)}. The Senate version uses one rate, ${shortPercentLabel(senate.percentByTier)}, for every grade, which is the statutory Employment Cost Index figure under 37 U.S.C. 1009(c).`,
      },
      {
        question: 'Do warrant officers get 6%?',
        answer: `${TIER_NOTE_FOR_FAQ} O-1E to O-3E are handled the same way. Under the Senate version, every grade, including warrant officers, would get ${shortPercentLabel(senate.percentByTier)}.`,
      },
      {
        question: 'Why might senior officers see a smaller raise?',
        answer: `Two reasons. The current plan gives O-4 and above ${formatPercent(plan.percentByTier['O4-up'])}, the lowest tier. And ${capLine.charAt(0).toLowerCase()}${capLine.slice(1)} Under the current plan, ${n} grade and years-of-service amounts would be held at those caps: ${cappedGradesSummary(plan.percentByTier, caps)}. Those figures may be limited by the pay cap; ${caps.capYear + 1} cap not yet published.`,
      },
      BAH_FAQ,
    ];
  }

  const enacted = config.enacted;
  return [
    { question: 'When will the 2027 raise be final?', answer: statusText(config) },
    {
      question: 'Why is the raise different by rank?',
      answer: enacted
        ? isFlat(enacted.percentByTier)
          ? `It isn't. The ${enacted.lawName} sets ${formatPercent(enacted.percentByTier['E1-E5'])} for every grade; dollar increases differ only because base pay differs by grade and years of service.`
          : `The ${enacted.lawName} sets different percentages by grade: ${describePercents(enacted.percentByTier)}.`
        : 'Dollar increases differ by grade and years of service because base pay does.',
    },
    {
      question: 'Do warrant officers get 6%?',
      answer:
        config.status === 'official-table'
          ? 'The DFAS 2027 warrant officer pay table shows the official rates; this page reads them directly.'
          : `This page applies the E-6 to O-3 rate${enacted ? ` (${formatPercent(enacted.percentByTier['E6-O3'])})` : ''} to warrant officers and O-1E to O-3E until DFAS publishes the 2027 tables.`,
    },
    { question: 'Why might senior officers see a smaller raise?', answer: capLine },
    BAH_FAQ,
  ];
}

const TIER_NOTE_FOR_FAQ =
  'The plan names grades E-6 to O-3 and does not list warrant officer grades, so this page assumes warrant officers fall in the 6% tier.';

const BAH_FAQ = {
  question: 'Does the raise affect BAH?',
  answer:
    'No. BAH is set separately from basic pay, based on local housing costs, grade and dependency status. 2027 BAH rates are usually announced in December.',
};
