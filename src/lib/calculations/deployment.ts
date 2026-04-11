/**
 * Deployment Pay Calculator — calculation logic
 * Pure functions — no React, no side effects, independently testable.
 *
 * Models three phases:
 *   1. Pre-deployment: normal monthly pay
 *   2. During deployment: additional pays + CZTE tax savings
 *   3. Tour total: aggregated financial benefit over full deployment
 */

import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import { lookupBAH } from '@/lib/calculations/bah';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { BAS_RATES, FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';
import { ENLISTED_GRADES, WARRANT_GRADES } from '@/types/military';
import type { PayGrade } from '@/types/military';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeploymentInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  zipCode: string;
  deploymentMonths: number;
  isCombatZone: boolean;
  receivingHFP: boolean;
  hdpLevel: 0 | 50 | 100 | 150;
  hasFSA: boolean;
  tspContributionPct: number; // 0–100
  usingSDP: boolean;
  sdpDeposit: number; // 0–10,000
}

export interface PreDeploymentPay {
  monthlyBasePay: number;
  monthlyBAH: number;
  bahFound: boolean;
  monthlyBAS: number;
  grossMonthly: number;
  monthlyFederalTax: number;
  monthlyTakeHome: number;
}

export interface DeploymentPay {
  monthlyBasePay: number;
  monthlyBAH: number;
  monthlyBAS: number;
  monthlyHFP: number;
  monthlyHDP: number;
  monthlyFSA: number;
  grossMonthly: number;
  czteMonthlySavings: number;
  monthlyFederalTax: number;
  monthlyTakeHome: number;
  monthlyIncrease: number;
  percentIncrease: number;
}

export interface TourTotal {
  totalAdditionalAllowancePay: number; // (HFP + HDP + FSA) × months
  totalCZTESavings: number;            // tax savings × months (0 if non-combat)
  sdpInterestEarned: number;           // deposit × rate × (months/12)
  tspContributedTotal: number;         // monthly TSP × months (capped at annual limit)
  totalTourBenefit: number;            // additional pay + tax savings + SDP interest
  effectiveTSPLimit: number;
}

export interface DeploymentResult {
  pre: PreDeploymentPay;
  during: DeploymentPay;
  tour: TourTotal;
  isOfficer: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOfficerGrade(payGrade: PayGrade): boolean {
  const enlistedAndWarrant = [...ENLISTED_GRADES, ...WARRANT_GRADES] as string[];
  return !enlistedAndWarrant.includes(payGrade as string);
}

/**
 * Compute annual federal income tax using progressive brackets.
 * Applies standard deduction before applying brackets.
 */
function calculateAnnualFederalTax(annualTaxableIncome: number): number {
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

// ─── Phase 1: Pre-deployment ──────────────────────────────────────────────────

function calculatePreDeployment(
  payGrade: PayGrade,
  yearsOfService: number,
  hasDependents: boolean,
  zipCode: string,
): PreDeploymentPay {
  const monthlyBasePay = lookupBasePay(payGrade, yearsOfService);
  const isOfficer = isOfficerGrade(payGrade);
  const monthlyBAS = isOfficer ? BAS_RATES.officer : BAS_RATES.enlisted;

  const bahResult = lookupBAH({ payGrade, zipCode, hasDependents });
  const monthlyBAH = bahResult?.monthlyRate ?? 0;
  const bahFound = !!bahResult;

  const grossMonthly = monthlyBasePay + monthlyBAH + monthlyBAS;

  // Only base pay is taxable (BAH and BAS are excluded from income)
  const annualTaxable = monthlyBasePay * 12;
  const annualFederalTax = calculateAnnualFederalTax(annualTaxable);
  const monthlyFederalTax = annualFederalTax / 12;
  const monthlyTakeHome = grossMonthly - monthlyFederalTax;

  return {
    monthlyBasePay,
    monthlyBAH,
    bahFound,
    monthlyBAS,
    grossMonthly,
    monthlyFederalTax,
    monthlyTakeHome,
  };
}

// ─── Phase 2: During deployment ───────────────────────────────────────────────

function calculateDuringDeployment(
  pre: PreDeploymentPay,
  isOfficer: boolean,
  isCombatZone: boolean,
  receivingHFP: boolean,
  hdpLevel: 0 | 50 | 100 | 150,
  hasFSA: boolean,
): DeploymentPay {
  const { monthlyBasePay, monthlyBAH, monthlyBAS, monthlyFederalTax: preTax } = pre;

  // Special pays
  const monthlyHFP = receivingHFP ? DEPLOYMENT_RATES_2026.hfpIdp : 0;

  // HDP capped at $100 if also receiving HFP/IDP
  const hdpCap = receivingHFP ? DEPLOYMENT_RATES_2026.hdpCapWithHFP : 150;
  const monthlyHDP = Math.min(hdpLevel, hdpCap);

  const monthlyFSA = hasFSA ? DEPLOYMENT_RATES_2026.fsa : 0;

  const grossMonthly =
    monthlyBasePay + monthlyBAH + monthlyBAS + monthlyHFP + monthlyHDP + monthlyFSA;

  // ── CZTE savings ──────────────────────────────────────────────────────────
  let monthlyFederalTax: number;
  let czteMonthlySavings: number;

  if (isCombatZone) {
    if (!isOfficer) {
      // Enlisted & Warrant: ALL pay is CZTE-excluded → $0 federal tax
      monthlyFederalTax = 0;
      czteMonthlySavings = preTax;
    } else {
      // Officers: CZTE capped at officerCZTECap/month
      const cap = DEPLOYMENT_RATES_2026.officerCZTECap;
      const taxableAboveCap = Math.max(0, monthlyBasePay - cap);
      const annualTaxableAboveCap = taxableAboveCap * 12;
      const taxAboveCap = calculateAnnualFederalTax(annualTaxableAboveCap) / 12;
      monthlyFederalTax = taxAboveCap;
      czteMonthlySavings = preTax - taxAboveCap;
    }
  } else {
    // No combat zone — pay taxes as normal on base pay
    monthlyFederalTax = preTax;
    czteMonthlySavings = 0;
  }

  const monthlyTakeHome = grossMonthly - monthlyFederalTax;
  const monthlyIncrease = monthlyTakeHome - pre.monthlyTakeHome;
  const percentIncrease =
    pre.monthlyTakeHome > 0 ? (monthlyIncrease / pre.monthlyTakeHome) * 100 : 0;

  return {
    monthlyBasePay,
    monthlyBAH,
    monthlyBAS,
    monthlyHFP,
    monthlyHDP,
    monthlyFSA,
    grossMonthly,
    czteMonthlySavings,
    monthlyFederalTax,
    monthlyTakeHome,
    monthlyIncrease,
    percentIncrease,
  };
}

// ─── Phase 3: Tour totals ─────────────────────────────────────────────────────

function calculateTourTotal(
  during: DeploymentPay,
  deploymentMonths: number,
  isCombatZone: boolean,
  usingSDP: boolean,
  sdpDeposit: number,
  tspContributionPct: number,
  monthlyBasePay: number,
): TourTotal {
  const additionalPerMonth = during.monthlyHFP + during.monthlyHDP + during.monthlyFSA;
  const totalAdditionalAllowancePay = additionalPerMonth * deploymentMonths;
  const totalCZTESavings = during.czteMonthlySavings * deploymentMonths;

  // SDP interest: deposit × rate × (months/12)
  // Interest continues 90 days after return but we model only the deployment window
  const sdpInterestEarned =
    usingSDP && isCombatZone
      ? Math.min(sdpDeposit, DEPLOYMENT_RATES_2026.sdpMaxDeposit) *
        DEPLOYMENT_RATES_2026.sdpInterestRate *
        (deploymentMonths / 12)
      : 0;

  // TSP contributions
  const effectiveTSPLimit = isCombatZone
    ? DEPLOYMENT_RATES_2026.tspCombatZoneLimit
    : DEPLOYMENT_RATES_2026.tspNormalLimit;
  const monthlyTSP = monthlyBasePay * (tspContributionPct / 100);
  const annualTSPContributed = Math.min(monthlyTSP * 12, effectiveTSPLimit);
  // Pro-rate to deployment months
  const tspContributedTotal = (annualTSPContributed / 12) * deploymentMonths;

  const totalTourBenefit = totalAdditionalAllowancePay + totalCZTESavings + sdpInterestEarned;

  return {
    totalAdditionalAllowancePay,
    totalCZTESavings,
    sdpInterestEarned,
    tspContributedTotal,
    totalTourBenefit,
    effectiveTSPLimit,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateDeployment(input: DeploymentInput): DeploymentResult {
  const isOfficer = isOfficerGrade(input.payGrade);

  const pre = calculatePreDeployment(
    input.payGrade,
    input.yearsOfService,
    input.hasDependents,
    input.zipCode,
  );

  const during = calculateDuringDeployment(
    pre,
    isOfficer,
    input.isCombatZone,
    input.receivingHFP,
    input.hdpLevel,
    input.hasFSA,
  );

  const tour = calculateTourTotal(
    during,
    input.deploymentMonths,
    input.isCombatZone,
    input.usingSDP,
    input.sdpDeposit,
    input.tspContributionPct,
    pre.monthlyBasePay,
  );

  return { pre, during, tour, isOfficer };
}
