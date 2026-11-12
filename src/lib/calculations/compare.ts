// Duty station comparison calculation logic
// Compares total compensation, BAH, and take-home pay between two CONUS duty stations.
// CONUS COLA is shown as eligibility + official 2026 index only. It is NOT added to
// gross pay, taxes, take-home or the verdict (no dollar estimate — see colaMha.ts).

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
}

export interface LocationData {
  zip: string;
  locationName: string;           // From BAH MHA data, or ZIP if not found
  state: string | null;
  stateInfo: StateTaxInfo | null;
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
  monthlyTakeHome: number;        // gross - monthly fed tax - monthly state tax
}

export interface CompareResult {
  locA: LocationData;
  locB: LocationData;
  // Shared (same for both)
  monthlyBasePay: number;
  monthlyBAS: number;
  isEnlisted: boolean;
  // Differences (B minus A — positive means B is better)
  bahDiffMonthly: number;
  grossDiffMonthly: number;
  stateTaxDiffAnnual: number;    // negative means B saves money on state tax
  federalTaxDiffAnnual: number;
  takeHomeDiffMonthly: number;
  takeHomeDiffAnnual: number;
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

/** Compute all pay components and tax estimates for one location. */
function computeLocation(
  zip: string,
  monthlyBasePay: number,
  monthlyBAS: number,
  monthlyBAH: number,
  locationName: string,
  bahFound: boolean,
  mha: string | null
): LocationData {
  // BAH — resolved via /api/bah/lookup and injected by the caller.

  // CONUS COLA — eligibility + index by MHA only; never added to pay or taxes.
  const colaArea = getColaAreaByMha(mha);
  const cola: StationCola | null = colaArea ? { dtmoName: colaArea.dtmoName, index: colaArea.index } : null;

  // State tax
  const state = getStateFromZip(zip);
  const stateInfo = state ? (STATE_TAX_DATA[state] ?? null) : null;
  const stateRate = stateInfo?.rate ?? 0;

  // Totals
  const grossMonthly = monthlyBasePay + monthlyBAH + monthlyBAS;
  // Only base pay is taxable here (BAH/BAS are tax-free; CONUS COLA is excluded from totals)
  const annualTaxableIncome = monthlyBasePay * 12;
  const annualFederalTax = calculateFederalTax(annualTaxableIncome);
  const monthlyFederalTax = annualFederalTax / 12;
  const annualStateTax = annualTaxableIncome * stateRate;
  const monthlyStateTax = annualStateTax / 12;
  const monthlyTakeHome = grossMonthly - monthlyFederalTax - monthlyStateTax;

  return {
    zip,
    locationName,
    state,
    stateInfo,
    monthlyBasePay,
    monthlyBAH,
    bahFound,
    monthlyBAS,
    cola,
    isColaArea: cola !== null,
    grossMonthly,
    annualTaxableIncome,
    annualFederalTax,
    monthlyFederalTax,
    annualStateTax,
    monthlyStateTax,
    monthlyTakeHome,
  };
}

// ─── Main comparison function ─────────────────────────────────────────────────

/**
 * Compare total compensation between two duty station ZIP codes.
 * Returns null if either ZIP is missing or not 5 digits.
 */
export function compareLocations(input: CompareInput): CompareResult | null {
  const { payGrade, yearsOfService, zipA, zipB } = input;

  if (zipA.length !== 5 || zipB.length !== 5) return null;

  const isEnlisted = ENLISTED_GRADES.includes(payGrade as (typeof ENLISTED_GRADES)[number]);
  const monthlyBasePay = lookupBasePay(payGrade, yearsOfService);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;

  const locA = computeLocation(zipA, monthlyBasePay, monthlyBAS, input.bahA.monthlyBAH, input.bahA.locationName, input.bahA.bahFound, input.bahA.mha);
  const locB = computeLocation(zipB, monthlyBasePay, monthlyBAS, input.bahB.monthlyBAH, input.bahB.locationName, input.bahB.bahFound, input.bahB.mha);

  const bahDiffMonthly = locB.monthlyBAH - locA.monthlyBAH;
  const grossDiffMonthly = locB.grossMonthly - locA.grossMonthly;
  const stateTaxDiffAnnual = locB.annualStateTax - locA.annualStateTax; // positive = B costs more tax
  const federalTaxDiffAnnual = locB.annualFederalTax - locA.annualFederalTax;
  const takeHomeDiffMonthly = locB.monthlyTakeHome - locA.monthlyTakeHome;
  const takeHomeDiffAnnual = takeHomeDiffMonthly * 12;

  const SIMILAR_THRESHOLD = 100; // < $100/month difference = "financially similar"
  const absDiff = Math.abs(takeHomeDiffMonthly);
  let verdict: CompareResult['verdict'];
  let betterLabel: string;
  if (absDiff < SIMILAR_THRESHOLD) {
    verdict = 'similar';
    betterLabel = takeHomeDiffMonthly >= 0 ? 'Location B' : 'Location A';
  } else if (takeHomeDiffMonthly > 0) {
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
    bahDiffMonthly,
    grossDiffMonthly,
    stateTaxDiffAnnual,
    federalTaxDiffAnnual,
    takeHomeDiffMonthly,
    takeHomeDiffAnnual,
    verdict,
    betterLabel,
    similarThreshold: SIMILAR_THRESHOLD,
  };
}
