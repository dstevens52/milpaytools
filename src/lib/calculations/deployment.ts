/**
 * Deployment Pay Calculator — calculation logic
 * Pure functions — no React, no side effects, independently testable.
 *
 * Models three phases:
 *   1. Pre-deployment: normal monthly pay
 *   2. During deployment: additional pays, CZTE-excluded pay, monthly take-home
 *   3. Tour total: aggregated financial benefit over full deployment
 *
 * Tax model (federal only):
 *   - Monthly figures (take-home before and during) annualize one month's taxable pay:
 *     tax(12 × monthly taxable pay) ÷ 12, at the chosen filing status.
 *   - Tour CZTE savings use marginal rates over one tax year: tax on the year without the
 *     exclusion minus tax on the same year with the excluded pay removed (DEP-02). Each full
 *     12 months of a longer deployment is treated as its own fully excluded year.
 *   - FICA (EMPLOYEE_FICA_RATE: 6.2% Social Security + 1.45% Medicare) is withheld on basic pay
 *     only, in and out of a combat zone (DoD FMR Vol. 7A Ch. 45). The Social Security wage base
 *     is not modeled.
 *   - Not modeled: state income tax, SGLI, the member's own TSP deduction, HFP as a choice.
 */

import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import type { HDPLevel } from '@/data/deployment/2026/constants';
import { SENIOR_ENLISTED_BASIC_PAY } from '@/data/pay-tables/2026';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { estimateAnnualFederalTax, type FilingStatus } from '@/lib/calculations/federalTax';
import { BAS_RATES, EMPLOYEE_FICA_RATE } from '@/data/constants';
import { ENLISTED_GRADES, WARRANT_GRADES } from '@/types/military';
import type { PayGrade } from '@/types/military';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeploymentInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  /** Federal filing status. Omitted → defaultDeploymentFilingStatus(hasDependents). */
  filingStatus?: FilingStatus;
  zipCode: string;
  monthlyBAH: number; // resolved via /api/bah/lookup
  bahFound: boolean;
  deploymentMonths: number;
  isCombatZone: boolean;
  receivingIDP: boolean; // full months of IDP; HFP and daily proration not modeled yet
  hdpLevel: HDPLevel;
  hasFSA: boolean; // ignored (FSA = $0) when hasDependents is false
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
  monthlyFederalTax: number; // federal income tax on basic pay
  monthlyFICA: number;       // EMPLOYEE_FICA_RATE × basic pay
  monthlyTakeHome: number;   // after federal income tax and FICA
}

export interface DeploymentPay {
  monthlyBasePay: number;
  monthlyBAH: number;
  monthlyBAS: number;
  monthlyIDP: number;
  monthlyHDP: number;
  monthlyFSA: number;
  grossMonthly: number;
  /** Basic pay + IDP + HDP-L: the pay tested under § 112 (taxable absent the exclusion). */
  monthlyMilitaryPay: number;
  /** Part of monthlyMilitaryPay excluded from federal taxable income (0 outside a combat zone). */
  monthlyExcludedPay: number;
  /** Part of monthlyMilitaryPay still in federal taxable income. */
  monthlyTaxablePay: number;
  /** Officer monthly cap applied (commissioned officers in a combat zone); null otherwise. */
  officerCZTECap: number | null;
  /**
   * Federal income tax per deployed month. In a combat zone this is deploymentFederalTax ÷ months
   * (same full-year method as the CZTE savings), so the monthly and tour figures agree; it is $0
   * whenever no pay stays taxable (enlisted, warrant, officers under the cap). Outside a combat
   * zone it is annualized like the pre-deployment figure.
   */
  monthlyFederalTax: number;
  monthlyFICA: number;
  monthlyTakeHome: number;   // after federal income tax and FICA
  monthlyIncrease: number;
  percentIncrease: number;
}

export interface TourTotal {
  totalAdditionalAllowancePay: number; // (IDP + HDP + FSA) × months
  totalCZTESavings: number;            // marginal, one tax year per 12 months (0 if non-combat)
  deploymentFederalTax: number;        // federal income tax attributable to the deployed months
  sdpInterestEarned: number;           // simple interest: deposit × 10% × (months/12)
  tspContributedTotal: number;         // monthly TSP × months (capped at annual limit)
  totalTourBenefit: number;            // additional pay + tax savings + SDP interest
  effectiveTSPLimit: number;
}

export interface DeploymentResult {
  pre: PreDeploymentPay;
  during: DeploymentPay;
  tour: TourTotal;
  isOfficer: boolean; // commissioned officer (subject to the CZTE cap); warrant officers are not
  filingStatus: FilingStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Commissioned officer: not enlisted and not a warrant officer (warrants are uncapped under § 112). */
function isOfficerGrade(payGrade: PayGrade): boolean {
  const enlistedAndWarrant = [...ENLISTED_GRADES, ...WARRANT_GRADES] as string[];
  return !enlistedAndWarrant.includes(payGrade as string);
}

/** Default filing status: with dependents → married filing jointly, without → single. */
export function defaultDeploymentFilingStatus(hasDependents: boolean): FilingStatus {
  return hasDependents ? 'mfj' : 'single';
}

/**
 * Commissioned-officer monthly CZTE cap: senior enlisted basic pay plus the HFP/IDP actually
 * payable to the officer for the month (26 U.S.C. § 112(b), (c)(5)). The calculator offers IDP
 * only, so the special-pay term is IDP or $0.
 */
export function officerCZTEMonthlyCap(receivingIDP: boolean): number {
  return SENIOR_ENLISTED_BASIC_PAY + (receivingIDP ? DEPLOYMENT_RATES_2026.idp : 0);
}

/** Monthly federal income tax on one month's taxable pay, annualized. */
function monthlyTax(monthlyTaxable: number, filingStatus: FilingStatus): number {
  return estimateAnnualFederalTax(monthlyTaxable * 12, filingStatus) / 12;
}

/**
 * CZTE savings at marginal rates (DEP-02): tax on the year without the exclusion minus tax on
 * the year with the excluded pay removed, same filing status. Months outside the deployment
 * carry basic pay only. Each full 12 months is its own fully excluded year; the remainder uses
 * the same method in one tax year.
 */
export function czteSavingsMarginal(
  monthlyBasePay: number,
  monthlyMilitaryPay: number,
  monthlyTaxablePay: number,
  deploymentMonths: number,
  filingStatus: FilingStatus,
): number {
  const months = Math.max(0, deploymentMonths);
  const fullYears = Math.floor(months / 12);
  const remainder = months - fullYears * 12;
  const tax = (income: number) => estimateAnnualFederalTax(income, filingStatus);

  let savings = fullYears * (tax(12 * monthlyMilitaryPay) - tax(12 * monthlyTaxablePay));
  if (remainder > 0) {
    const homeMonths = (12 - remainder) * monthlyBasePay;
    savings +=
      tax(homeMonths + remainder * monthlyMilitaryPay) -
      tax(homeMonths + remainder * monthlyTaxablePay);
  }
  return savings;
}

/**
 * Federal income tax attributable to the deployed months, by the same full-year method as
 * czteSavingsMarginal: each full 12 months is its own year taxed on monthlyTaxablePay; the
 * remainder is the tax on the year with the deployed months minus the tax on the home months
 * alone (basic pay). czteSavingsMarginal = this function at the full military pay − this function
 * at the taxable pay, so the monthly tax × months and the tour savings use one method.
 */
export function deploymentMonthsFederalTax(
  monthlyBasePay: number,
  monthlyTaxablePay: number,
  deploymentMonths: number,
  filingStatus: FilingStatus,
): number {
  const months = Math.max(0, deploymentMonths);
  const fullYears = Math.floor(months / 12);
  const remainder = months - fullYears * 12;
  const tax = (income: number) => estimateAnnualFederalTax(income, filingStatus);

  let total = fullYears * tax(12 * monthlyTaxablePay);
  if (remainder > 0) {
    const homeMonths = (12 - remainder) * monthlyBasePay;
    total += tax(homeMonths + remainder * monthlyTaxablePay) - tax(homeMonths);
  }
  return total;
}

// ─── Phase 1: Pre-deployment ──────────────────────────────────────────────────

function calculatePreDeployment(
  payGrade: PayGrade,
  yearsOfService: number,
  monthlyBAH: number,
  bahFound: boolean,
  filingStatus: FilingStatus,
): PreDeploymentPay {
  const monthlyBasePay = lookupBasePay(payGrade, yearsOfService);
  const isOfficer = isOfficerGrade(payGrade);
  const monthlyBAS = isOfficer ? BAS_RATES.officer : BAS_RATES.enlisted;

  const grossMonthly = monthlyBasePay + monthlyBAH + monthlyBAS;

  // Only basic pay is taxable (BAH and BAS are excluded from income) and FICA applies to basic pay only.
  const monthlyFederalTax = monthlyTax(monthlyBasePay, filingStatus);
  const monthlyFICA = monthlyBasePay * EMPLOYEE_FICA_RATE;
  const monthlyTakeHome = grossMonthly - monthlyFederalTax - monthlyFICA;

  return {
    monthlyBasePay,
    monthlyBAH,
    bahFound,
    monthlyBAS,
    grossMonthly,
    monthlyFederalTax,
    monthlyFICA,
    monthlyTakeHome,
  };
}

// ─── Phase 2: During deployment ───────────────────────────────────────────────

function calculateDuringDeployment(
  pre: PreDeploymentPay,
  isOfficer: boolean,
  isCombatZone: boolean,
  receivingIDP: boolean,
  hdpLevel: HDPLevel,
  hasDependents: boolean,
  hasFSA: boolean,
  filingStatus: FilingStatus,
  deploymentMonths: number,
): DeploymentPay {
  const { monthlyBasePay, monthlyBAH, monthlyBAS } = pre;

  // Special pays
  // IDP at the full monthly rate. HFP ($450) is not offered as a separate choice yet, and the
  // two can never be paid for the same period, so only one special pay is ever added.
  const monthlyIDP = receivingIDP ? DEPLOYMENT_RATES_2026.idp : 0;

  // Highest HDP-L tier is now $100, so the old $100 cap with HFP/IDP no longer applies
  const monthlyHDP = hdpLevel;

  // FSA is payable only to a member with dependents (37 U.S.C. § 427(a)(1)),
  // so hasFSA is ignored when hasDependents is false. FSA is not taxable.
  const monthlyFSA = hasDependents && hasFSA ? DEPLOYMENT_RATES_2026.fsa : 0;

  const grossMonthly =
    monthlyBasePay + monthlyBAH + monthlyBAS + monthlyIDP + monthlyHDP + monthlyFSA;

  // ── Federal taxable pay ───────────────────────────────────────────────────
  // IDP and HDP-L are taxable pay unless excluded under § 112 (DEP-08), so outside a combat zone
  // they join basic pay in the tax base.
  const monthlyMilitaryPay = monthlyBasePay + monthlyIDP + monthlyHDP;
  let monthlyExcludedPay = 0;
  let officerCZTECap: number | null = null;

  if (isCombatZone) {
    if (isOfficer) {
      // Commissioned officers: excluded = min(pay, cap); cap = senior enlisted + IDP if received (DEP-05/06).
      officerCZTECap = officerCZTEMonthlyCap(receivingIDP);
      monthlyExcludedPay = Math.min(monthlyMilitaryPay, officerCZTECap);
    } else {
      // Enlisted & warrant officers: all military pay for the month is excluded.
      monthlyExcludedPay = monthlyMilitaryPay;
    }
  }
  const monthlyTaxablePay = monthlyMilitaryPay - monthlyExcludedPay;

  // In a combat zone, use the full-year method of the tour total (tax on the deployed months ÷
  // months) so an officer's monthly tax matches the tour; $0 when nothing stays taxable.
  // Outside a combat zone, annualize like the pre-deployment figure (DEP-08: the difference is
  // then just the tax on IDP/HDP-L at the marginal rate).
  const monthlyFederalTax =
    isCombatZone && deploymentMonths > 0
      ? monthlyTaxablePay > 0
        ? deploymentMonthsFederalTax(monthlyBasePay, monthlyTaxablePay, deploymentMonths, filingStatus) /
          deploymentMonths
        : 0
      : monthlyTax(monthlyTaxablePay, filingStatus);
  // CZTE is an income-tax exclusion only: FICA is still withheld on basic pay (DEP-04).
  const monthlyFICA = monthlyBasePay * EMPLOYEE_FICA_RATE;

  const monthlyTakeHome = grossMonthly - monthlyFederalTax - monthlyFICA;
  const monthlyIncrease = monthlyTakeHome - pre.monthlyTakeHome;
  const percentIncrease =
    pre.monthlyTakeHome > 0 ? (monthlyIncrease / pre.monthlyTakeHome) * 100 : 0;

  return {
    monthlyBasePay,
    monthlyBAH,
    monthlyBAS,
    monthlyIDP,
    monthlyHDP,
    monthlyFSA,
    grossMonthly,
    monthlyMilitaryPay,
    monthlyExcludedPay,
    monthlyTaxablePay,
    officerCZTECap,
    monthlyFederalTax,
    monthlyFICA,
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
  filingStatus: FilingStatus,
): TourTotal {
  const additionalPerMonth = during.monthlyIDP + during.monthlyHDP + during.monthlyFSA;
  const totalAdditionalAllowancePay = additionalPerMonth * deploymentMonths;

  const totalCZTESavings = isCombatZone
    ? czteSavingsMarginal(
        during.monthlyBasePay,
        during.monthlyMilitaryPay,
        during.monthlyTaxablePay,
        deploymentMonths,
        filingStatus,
      )
    : 0;

  // SDP interest: simple interest on the full deposit from day one at 10% a year (DEP-07).
  // Real SDP interest compounds monthly and is paid quarterly (DFAS), deposits are limited by pay, and the 90 days of
  // interest after leaving the combat zone are not included. The program needs 30+ consecutive
  // days in the combat zone; the months input starts at 1, so that is shown as a note.
  const sdpInterestEarned =
    usingSDP && isCombatZone && deploymentMonths >= 1
      ? Math.min(Math.max(0, sdpDeposit), DEPLOYMENT_RATES_2026.sdpMaxDeposit) *
        DEPLOYMENT_RATES_2026.sdpInterestRate *
        (deploymentMonths / 12)
      : 0;

  // TSP contributions — limits from the TSP year file (§ 415(c) in a combat zone, § 402(g) otherwise)
  const effectiveTSPLimit = isCombatZone
    ? TSP_CONSTANTS_2026.annualAdditionsLimit
    : TSP_CONSTANTS_2026.electiveDeferralLimit;
  const monthlyTSP = during.monthlyBasePay * (tspContributionPct / 100);
  const annualTSPContributed = Math.min(monthlyTSP * 12, effectiveTSPLimit);
  // Pro-rate to deployment months
  const tspContributedTotal = (annualTSPContributed / 12) * deploymentMonths;

  const totalTourBenefit = totalAdditionalAllowancePay + totalCZTESavings + sdpInterestEarned;

  const deploymentFederalTax = during.monthlyFederalTax * deploymentMonths;

  return {
    totalAdditionalAllowancePay,
    totalCZTESavings,
    deploymentFederalTax,
    sdpInterestEarned,
    tspContributedTotal,
    totalTourBenefit,
    effectiveTSPLimit,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateDeployment(input: DeploymentInput): DeploymentResult {
  const isOfficer = isOfficerGrade(input.payGrade);
  const filingStatus = input.filingStatus ?? defaultDeploymentFilingStatus(input.hasDependents);

  const pre = calculatePreDeployment(
    input.payGrade,
    input.yearsOfService,
    input.monthlyBAH,
    input.bahFound,
    filingStatus,
  );

  const during = calculateDuringDeployment(
    pre,
    isOfficer,
    input.isCombatZone,
    input.receivingIDP,
    input.hdpLevel,
    input.hasDependents,
    input.hasFSA,
    filingStatus,
    input.deploymentMonths,
  );

  const tour = calculateTourTotal(
    during,
    input.deploymentMonths,
    input.isCombatZone,
    input.usingSDP,
    input.sdpDeposit,
    input.tspContributionPct,
    filingStatus,
  );

  return { pre, during, tour, isOfficer, filingStatus };
}
