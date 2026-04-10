// Duty station comparison calculation logic
// Compares total compensation, BAH, CONUS COLA, and take-home pay between two CONUS duty stations.

import { lookupBAH, getLocationName } from '@/lib/calculations/bah';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { lookupColaArea, getGradeGroup, getApproxMonthlyRate } from '@/lib/calculations/cola';
import { BAS_RATES, FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';
import { ENLISTED_GRADES } from '@/types/military';
import { getStateFromZip, STATE_TAX_DATA, StateTaxInfo } from '@/data/compare/stateTax';
import type { PayGrade } from '@/types/military';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompareInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  zipA: string;
  zipB: string;
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
  monthlyCOLA: number;
  colaAreaName: string | null;
  isColaArea: boolean;
  // Totals
  grossMonthly: number;           // basePay + BAH + BAS + COLA
  annualTaxableIncome: number;    // (basePay + COLA) * 12 — BAH/BAS are tax-free
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
  colaDiffMonthly: number;
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
  payGrade: PayGrade,
  yearsOfService: number,
  hasDependents: boolean,
  monthlyBasePay: number,
  monthlyBAS: number
): LocationData {
  // BAH
  const bahResult = lookupBAH({ payGrade, zipCode: zip, hasDependents });
  const monthlyBAH = bahResult?.monthlyRate ?? 0;
  const bahFound = bahResult !== null;
  const locationName = bahResult?.locationName ?? getLocationName(zip) ?? zip;

  // CONUS COLA
  const colaArea = lookupColaArea(zip);
  let monthlyCOLA = 0;
  let colaAreaName: string | null = null;
  if (colaArea) {
    const gradeGroup = getGradeGroup(payGrade);
    monthlyCOLA = getApproxMonthlyRate(colaArea.tier, gradeGroup, hasDependents);
    colaAreaName = colaArea.name;
  }

  // State tax
  const state = getStateFromZip(zip);
  const stateInfo = state ? (STATE_TAX_DATA[state] ?? null) : null;
  const stateRate = stateInfo?.rate ?? 0;

  // Totals
  const grossMonthly = monthlyBasePay + monthlyBAH + monthlyBAS + monthlyCOLA;
  // Only base pay and CONUS COLA are taxable
  const annualTaxableIncome = (monthlyBasePay + monthlyCOLA) * 12;
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
    monthlyCOLA,
    colaAreaName,
    isColaArea: colaArea !== null,
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
  const { payGrade, yearsOfService, hasDependents, zipA, zipB } = input;

  if (zipA.length !== 5 || zipB.length !== 5) return null;

  const isEnlisted = ENLISTED_GRADES.includes(payGrade as (typeof ENLISTED_GRADES)[number]);
  const monthlyBasePay = lookupBasePay(payGrade, yearsOfService);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;

  const locA = computeLocation(zipA, payGrade, yearsOfService, hasDependents, monthlyBasePay, monthlyBAS);
  const locB = computeLocation(zipB, payGrade, yearsOfService, hasDependents, monthlyBasePay, monthlyBAS);

  const bahDiffMonthly = locB.monthlyBAH - locA.monthlyBAH;
  const colaDiffMonthly = locB.monthlyCOLA - locA.monthlyCOLA;
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
    colaDiffMonthly,
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
