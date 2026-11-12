// Duty station comparison calculation logic
// Compares BAH, gross pay, and pay after estimated income taxes between two CONUS
// duty stations.
//
// STATE TAX (SCRA, 50 U.S.C. § 4001): a PCS move doesn't change which state taxes
// military pay — the member's state of legal residence taxes it at both stations.
// By default, state income tax is therefore identical at both stations (or left out
// entirely when no residence is chosen). Station B uses its own state's rate only
// when the user explicitly opts in to changing legal residence to that state.
//
// CONUS COLA is shown as eligibility + official 2026 index only. It is NOT added to
// gross pay, taxes, after-tax pay or the verdict (no dollar estimate — see colaMha.ts).
//
// "After income tax" excludes Social Security and Medicare (FICA is not deducted).
// Federal tax is estimated as a single filer with the standard deduction.

import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { getColaAreaByMha } from '@/data/cola/2026/constants';
import { BAS_RATES, FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';
import { ENLISTED_GRADES } from '@/types/military';
import { getStateFromZip, STATE_TAX_DATA, StateTaxInfo } from '@/data/compare/stateTax';
import type { PayGrade } from '@/types/military';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Resolved BAH for one location (from /api/bah/lookup), injected by the caller. */
export interface LocationBah {
  monthlyBAH: number;
  locationName: string;
  bahFound: boolean;
  /** MHA code from /api/bah/lookup (null if the ZIP didn't resolve). Drives CONUS COLA eligibility. */
  mha: string | null;
}

/** 2026 CONUS COLA status for one station: eligibility + official index, no dollars. */
export interface StationCola {
  dtmoName: string;
  index: number;
}

export interface CompareInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  zipA: string;
  zipB: string;
  bahA: LocationBah;
  bahB: LocationBah;
  /**
   * State of legal residence for taxes (2-letter code in STATE_TAX_DATA), or null/omitted
   * for "Not sure / don't include state tax". Applied to base pay at BOTH stations.
   */
  residenceState?: string | null;
  /**
   * Opt-in: the member plans to change legal residence to station B's state. Only then
   * does station B use its own state's rate. Ignored unless residenceState is set.
   */
  changeResidenceToB?: boolean;
}

export interface LocationData {
  zip: string;
  locationName: string;           // From BAH MHA data, or ZIP if not found
  /** State the duty station is in (display + opt-in residence change). */
  stationState: string | null;
  stationStateInfo: StateTaxInfo | null;
  /** State whose income tax applies at this station (legal residence), or null = not included. */
  taxState: string | null;
  taxStateInfo: StateTaxInfo | null;
  // Monthly pay components
  monthlyBasePay: number;
  monthlyBAH: number;
  bahFound: boolean;
  monthlyBAS: number;
  /** 2026 CONUS COLA area info, or null. Informational only — not in any total. */
  cola: StationCola | null;
  isColaArea: boolean;
  // Totals (CONUS COLA excluded)
  grossMonthly: number;           // basePay + BAH + BAS
  annualTaxableIncome: number;    // basePay * 12 — BAH/BAS are tax-free
  annualFederalTax: number;
  monthlyFederalTax: number;
  annualStateTax: number;
  monthlyStateTax: number;
  /** gross − federal − state income tax. Before Social Security and Medicare. */
  monthlyAfterIncomeTax: number;
}

export interface CompareResult {
  locA: LocationData;
  locB: LocationData;
  // Shared (same for both)
  monthlyBasePay: number;
  monthlyBAS: number;
  isEnlisted: boolean;
  /** true when a state of legal residence was chosen (state tax included in totals). */
  stateTaxIncluded: boolean;
  /** true when station B is taxed at its own state's rate (opt-in residence change applied). */
  residenceChangeApplied: boolean;
  /** Federal tax filing-status assumption, for display. */
  federalFilingStatus: 'single';
  // Differences (B minus A — positive means B is better)
  bahDiffMonthly: number;
  grossDiffMonthly: number;
  stateTaxDiffAnnual: number;    // positive = B costs more state tax
  federalTaxDiffAnnual: number;
  afterTaxDiffMonthly: number;
  afterTaxDiffAnnual: number;
  // Summary
  verdict: 'B_better' | 'A_better' | 'similar';
  betterLabel: string;            // "Location B" or "Location A"
  similarThreshold: number;       // $100/month threshold
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Progressive federal income tax on annual taxable income (single filer, standard deduction). */
function calculateFederalTax(annualTaxableIncome: number): number {
  const taxable = Math.max(0, annualTaxableIncome - STANDARD_DEDUCTION_SINGLE);
  let tax = 0;
  let prevCeiling = 0;
  for (const bracket of FED_TAX_BRACKETS_SINGLE) {
    const bracketTop = bracket.upTo === Infinity ? taxable : bracket.upTo;
    const inBracket = Math.max(0, Math.min(taxable, bracketTop) - prevCeiling);
    tax += inBracket * bracket.rate;
    prevCeiling = bracketTop;
    if (taxable <= bracketTop) break;
  }
  return tax;
}

/** A 2-letter code that has a STATE_TAX_DATA entry, else null. */
export function validStateCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const c = code.toUpperCase();
  return Object.prototype.hasOwnProperty.call(STATE_TAX_DATA, c) ? c : null;
}

/** Compute all pay components and tax estimates for one location. */
function computeLocation(
  zip: string,
  monthlyBasePay: number,
  monthlyBAS: number,
  bah: LocationBah,
  taxState: string | null,
): LocationData {
  // CONUS COLA — eligibility + index by MHA only; never added to pay or taxes.
  const colaArea = getColaAreaByMha(bah.mha);
  const cola: StationCola | null = colaArea ? { dtmoName: colaArea.dtmoName, index: colaArea.index } : null;

  const stationState = validStateCode(getStateFromZip(zip));
  const taxStateInfo = taxState ? STATE_TAX_DATA[taxState] : null;

  // Totals
  const grossMonthly = monthlyBasePay + bah.monthlyBAH + monthlyBAS;
  // Only base pay is taxable here (BAH/BAS are tax-free; CONUS COLA is excluded from totals)
  const annualTaxableIncome = monthlyBasePay * 12;
  const annualFederalTax = calculateFederalTax(annualTaxableIncome);
  const monthlyFederalTax = annualFederalTax / 12;
  const annualStateTax = annualTaxableIncome * (taxStateInfo?.rate ?? 0);
  const monthlyStateTax = annualStateTax / 12;
  const monthlyAfterIncomeTax = grossMonthly - monthlyFederalTax - monthlyStateTax;

  return {
    zip,
    locationName: bah.locationName,
    stationState,
    stationStateInfo: stationState ? STATE_TAX_DATA[stationState] : null,
    taxState,
    taxStateInfo,
    monthlyBasePay,
    monthlyBAH: bah.monthlyBAH,
    bahFound: bah.bahFound,
    monthlyBAS,
    cola,
    isColaArea: cola !== null,
    grossMonthly,
    annualTaxableIncome,
    annualFederalTax,
    monthlyFederalTax,
    annualStateTax,
    monthlyStateTax,
    monthlyAfterIncomeTax,
  };
}

// ─── Main comparison function ─────────────────────────────────────────────────

export const SIMILAR_THRESHOLD = 100; // < $100/month difference = "financially similar"

/**
 * Compare pay between two duty station ZIP codes.
 * Returns null if either ZIP is missing or not 5 digits.
 */
export function compareLocations(input: CompareInput): CompareResult | null {
  const { payGrade, yearsOfService, zipA, zipB } = input;

  if (zipA.length !== 5 || zipB.length !== 5) return null;

  const isEnlisted = ENLISTED_GRADES.includes(payGrade as (typeof ENLISTED_GRADES)[number]);
  const monthlyBasePay = lookupBasePay(payGrade, yearsOfService);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;

  // State of legal residence applies at both stations (SCRA). Station B switches to its
  // own state only on the explicit opt-in, and only if that state is known.
  const residence = validStateCode(input.residenceState);
  const stationStateB = validStateCode(getStateFromZip(zipB));
  const residenceChangeApplied = !!(residence && input.changeResidenceToB && stationStateB);
  const taxStateA = residence;
  const taxStateB = residenceChangeApplied ? stationStateB : residence;

  const locA = computeLocation(zipA, monthlyBasePay, monthlyBAS, input.bahA, taxStateA);
  const locB = computeLocation(zipB, monthlyBasePay, monthlyBAS, input.bahB, taxStateB);

  const bahDiffMonthly = locB.monthlyBAH - locA.monthlyBAH;
  const grossDiffMonthly = locB.grossMonthly - locA.grossMonthly;
  const stateTaxDiffAnnual = locB.annualStateTax - locA.annualStateTax;
  const federalTaxDiffAnnual = locB.annualFederalTax - locA.annualFederalTax;
  const afterTaxDiffMonthly = locB.monthlyAfterIncomeTax - locA.monthlyAfterIncomeTax;
  const afterTaxDiffAnnual = afterTaxDiffMonthly * 12;

  const absDiff = Math.abs(afterTaxDiffMonthly);
  let verdict: CompareResult['verdict'];
  let betterLabel: string;
  if (absDiff < SIMILAR_THRESHOLD) {
    verdict = 'similar';
    betterLabel = afterTaxDiffMonthly >= 0 ? 'Location B' : 'Location A';
  } else if (afterTaxDiffMonthly > 0) {
    verdict = 'B_better';
    betterLabel = 'Location B';
  } else {
    verdict = 'A_better';
    betterLabel = 'Location A';
  }

  return {
    locA,
    locB,
    monthlyBasePay,
    monthlyBAS,
    isEnlisted,
    stateTaxIncluded: residence !== null,
    residenceChangeApplied,
    federalFilingStatus: 'single',
    bahDiffMonthly,
    grossDiffMonthly,
    stateTaxDiffAnnual,
    federalTaxDiffAnnual,
    afterTaxDiffMonthly,
    afterTaxDiffAnnual,
    verdict,
    betterLabel,
    similarThreshold: SIMILAR_THRESHOLD,
  };
}
