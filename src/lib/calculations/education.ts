/**
 * Education Benefits Comparison Calculator — calculation logic
 * Pure functions: no React, no side effects, independently testable.
 *
 * Compares Post-9/11 GI Bill (Ch. 33), VR&E (Ch. 31), Tuition Assistance (TA),
 * and Montgomery GI Bill (Ch. 30) for a given service member or veteran.
 */

import { EDUCATION_RATES, GI_BILL_TIERS } from '@/data/education/2026/constants';
import { lookupBAH, getLocationName } from '@/lib/calculations/bah';

// ─── Public Types ──────────────────────────────────────────────────────────

export type ServiceStatus = 'active-duty' | 'veteran' | 'guard-reserve';
export type ServiceTier = keyof typeof GI_BILL_TIERS;
export type SchoolType = 'public' | 'private' | 'online';
export type EnrollmentStatus = 'full' | 'three-quarter' | 'half';

export interface EducationInput {
  status: ServiceStatus;
  serviceTier: ServiceTier;
  vaRating: number;          // 0, 10, 20, ..., 100
  schoolType: SchoolType;
  schoolZip: string;
  annualTuition: number;
  programYears: number;      // 2 or 4
  enrollment: EnrollmentStatus;
}

export interface BenefitResult {
  id: 'gi-bill' | 'vre' | 'ta' | 'mgib';
  name: string;
  shortName: string;
  eligible: boolean;
  ineligibleReason?: string;
  // Annual figures
  annualTuitionCoverage: number;
  monthlyMHA: number;
  annualMHA: number;         // monthlyMHA × mhaMonthsPerYear
  annualBooks: number;
  totalAnnualValue: number;
  totalProgramValue: number;
  // Meta
  entitlementMonths: number;
  transferable: boolean;
  notes: string[];
}

export interface EducationComparisonResult {
  benefits: BenefitResult[];
  bestBenefitId: string | null;
  mhaMonthly: number | null;       // E-5 w/dep BAH at school ZIP (null if ZIP not found)
  locationName: string | null;
  insights: string[];
}

// ─── Enrollment Factor ─────────────────────────────────────────────────────

function enrollmentFactor(enrollment: EnrollmentStatus): number {
  if (enrollment === 'full') return 1.0;
  if (enrollment === 'three-quarter') return 0.75;
  return 0.5; // half
}

// ─── MHA Lookup ────────────────────────────────────────────────────────────

/**
 * Look up the monthly housing allowance for the GI Bill and VR&E.
 * GI Bill MHA = E-5 with-dependents BAH at the school's ZIP code.
 * Online-only programs: half the national average ($1,261/month for 2026–2027).
 */
export function calculateMHA(
  schoolZip: string,
  schoolType: SchoolType,
  enrollment: EnrollmentStatus,
  isActiveDuty: boolean
): number {
  if (isActiveDuty) return 0; // Active duty members receive BAH separately — no GI Bill MHA

  const factor = enrollmentFactor(enrollment);

  if (schoolType === 'online') {
    return EDUCATION_RATES.giBill.onlineMHAMonthly * factor;
  }

  const bahResult = lookupBAH({
    zipCode: schoolZip,
    payGrade: 'E-5',
    hasDependents: true,
  });

  return bahResult ? bahResult.monthlyRate * factor : 0;
}

// ─── Post-9/11 GI Bill (Chapter 33) ───────────────────────────────────────

export function calculatePostGIBill(input: EducationInput): BenefitResult {
  const { status, serviceTier, schoolType, schoolZip, annualTuition, programYears, enrollment } = input;
  const tierPct = GI_BILL_TIERS[serviceTier] ?? 0;
  const isActiveDuty = status === 'active-duty';
  const factor = enrollmentFactor(enrollment);
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  const eligible = tierPct > 0;
  const ineligibleReason = !eligible ? 'Requires at least 90 days active duty after Sep 10, 2001' : undefined;

  if (!eligible) {
    return {
      id: 'gi-bill',
      name: 'Post-9/11 GI Bill',
      shortName: 'Ch. 33',
      eligible: false,
      ineligibleReason,
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      entitlementMonths: EDUCATION_RATES.giBill.entitlementMonths,
      transferable: true,
      notes: [],
    };
  }

  // Tuition coverage
  let annualTuitionCoverage: number;
  if (schoolType === 'public') {
    // In-state public: covers 100% of tuition, adjusted for tier
    annualTuitionCoverage = annualTuition * (tierPct / 100);
  } else {
    // Private or online: capped at $30,908.34/year, adjusted for tier
    annualTuitionCoverage = Math.min(annualTuition, EDUCATION_RATES.giBill.privateCapAnnual) * (tierPct / 100);
  }

  // Monthly housing allowance
  const monthlyMHA = calculateMHA(schoolZip, schoolType, enrollment, isActiveDuty);
  const annualMHA = monthlyMHA * mhaMonthsPerYear;

  // Books
  const annualBooks = EDUCATION_RATES.giBill.bookStipendAnnualMax * (tierPct / 100) * factor;

  const totalAnnualValue = annualTuitionCoverage + annualMHA + annualBooks;
  const totalProgramValue = totalAnnualValue * programYears;

  const notes: string[] = [];
  if (tierPct < 100) {
    notes.push(`Eligibility tier: ${tierPct}% — all benefits prorated`);
  }
  if (isActiveDuty) {
    notes.push('No MHA on active duty — you receive BAH separately');
  }
  if (schoolType === 'private' && annualTuition > EDUCATION_RATES.giBill.privateCapAnnual) {
    const gap = annualTuition - EDUCATION_RATES.giBill.privateCapAnnual * (tierPct / 100);
    notes.push(`Tuition gap: ~$${Math.round(gap).toLocaleString()}/year not covered — check Yellow Ribbon`);
  }
  if (schoolType === 'online') {
    notes.push('Online MHA: $1,261/month (half national average per VA policy)');
  }

  return {
    id: 'gi-bill',
    name: 'Post-9/11 GI Bill',
    shortName: 'Ch. 33',
    eligible: true,
    annualTuitionCoverage,
    monthlyMHA,
    annualMHA,
    annualBooks,
    totalAnnualValue,
    totalProgramValue,
    entitlementMonths: EDUCATION_RATES.giBill.entitlementMonths,
    transferable: true,
    notes,
  };
}

// ─── VR&E — Vocational Rehab & Employment (Chapter 31) ────────────────────

export function calculateVRE(input: EducationInput): BenefitResult {
  const { status, vaRating, schoolType, schoolZip, annualTuition, programYears, enrollment } = input;
  const isActiveDuty = status === 'active-duty';
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  const eligible = vaRating >= 10;
  const ineligibleReason = !eligible
    ? 'Requires 10%+ VA disability rating and employment barrier determination by VR&E counselor'
    : undefined;

  if (!eligible) {
    return {
      id: 'vre',
      name: 'VR&E',
      shortName: 'Ch. 31',
      eligible: false,
      ineligibleReason,
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      entitlementMonths: EDUCATION_RATES.vre.entitlementMonths,
      transferable: false,
      notes: [],
    };
  }

  // VR&E covers full tuition — no cap
  const annualTuitionCoverage = annualTuition;

  // MHA: same Post-9/11 rate if veteran elects the Post-9/11 subsistence allowance
  const monthlyMHA = calculateMHA(schoolZip, schoolType, enrollment, isActiveDuty);
  const annualMHA = monthlyMHA * mhaMonthsPerYear;

  // Books: all required books and supplies covered (estimate for comparison)
  const annualBooks = EDUCATION_RATES.vre.booksAnnualEstimate;

  const totalAnnualValue = annualTuitionCoverage + annualMHA + annualBooks;
  const totalProgramValue = totalAnnualValue * programYears;

  const notes: string[] = [
    'No tuition cap — covers full tuition at any approved school',
    'Requires VR&E counselor approval and Individual Rehabilitation Plan',
    'Does not consume GI Bill entitlement months',
  ];
  if (isActiveDuty) {
    notes.push('Available to active duty with 10%+ disability rating');
  }

  return {
    id: 'vre',
    name: 'VR&E',
    shortName: 'Ch. 31',
    eligible: true,
    annualTuitionCoverage,
    monthlyMHA,
    annualMHA,
    annualBooks,
    totalAnnualValue,
    totalProgramValue,
    entitlementMonths: EDUCATION_RATES.vre.entitlementMonths,
    transferable: false,
    notes,
  };
}

// ─── Tuition Assistance ────────────────────────────────────────────────────

export function calculateTA(input: EducationInput): BenefitResult {
  const { status, annualTuition, programYears } = input;

  const eligible = status === 'active-duty';
  const ineligibleReason = !eligible ? 'Tuition Assistance is available to active duty service members only' : undefined;

  if (!eligible) {
    return {
      id: 'ta',
      name: 'Tuition Assistance',
      shortName: 'TA',
      eligible: false,
      ineligibleReason,
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      entitlementMonths: 0, // annual renewable
      transferable: false,
      notes: [],
    };
  }

  const annualTuitionCoverage = Math.min(annualTuition, EDUCATION_RATES.ta.annualCap);
  const totalAnnualValue = annualTuitionCoverage;
  const totalProgramValue = totalAnnualValue * programYears;

  return {
    id: 'ta',
    name: 'Tuition Assistance',
    shortName: 'TA',
    eligible: true,
    annualTuitionCoverage,
    monthlyMHA: 0,
    annualMHA: 0,
    annualBooks: 0,
    totalAnnualValue,
    totalProgramValue,
    entitlementMonths: 0,
    transferable: false,
    notes: [
      '$250/credit hour, $4,500/year maximum',
      'Does not consume GI Bill months — use both strategically',
      'No housing allowance — you receive BAH on active duty',
      'Renews annually while you remain on active duty',
    ],
  };
}

// ─── Montgomery GI Bill (Chapter 30) ──────────────────────────────────────

export function calculateMGIB(input: EducationInput): BenefitResult {
  const { enrollment, annualTuition, programYears } = input;
  const factor = enrollmentFactor(enrollment);
  const monthlyStipend = EDUCATION_RATES.mgib.fullTimeMonthly * factor;
  const annualStipend = monthlyStipend * EDUCATION_RATES.mgib.monthsPerYear;

  // MGIB is a fixed monthly payment — tuition comes out of this payment.
  // We represent this as: annualMHA = full stipend (all-in-one), tuition coverage = $0 (paid from stipend)
  const annualTuitionCoverage = 0; // user pays tuition from the stipend
  const monthlyMHA = monthlyStipend;
  const annualMHA = annualStipend;
  const annualBooks = 0; // included in stipend

  // Net value after paying tuition (can be negative for expensive schools)
  const annualNetAfterTuition = annualStipend - annualTuition;

  const totalAnnualValue = annualStipend;
  const totalProgramValue = annualStipend * programYears;

  const notes: string[] = [
    'Fixed monthly stipend — tuition is paid from this amount',
    `After paying tuition: ~$${Math.max(0, Math.round(annualNetAfterTuition / EDUCATION_RATES.mgib.monthsPerYear)).toLocaleString()}/month remaining for living expenses`,
    'Requires $1,200 buy-in and service before Jan 1, 2018',
    'Often less total value than Post-9/11 for in-person students, but can be better for online programs with low tuition',
  ];

  if (annualNetAfterTuition < 0) {
    notes.unshift(`Caution: tuition ($${Math.round(annualTuition / EDUCATION_RATES.mgib.monthsPerYear).toLocaleString()}/mo) exceeds monthly stipend ($${monthlyStipend.toLocaleString()}/mo)`);
  }

  return {
    id: 'mgib',
    name: 'Montgomery GI Bill',
    shortName: 'Ch. 30',
    eligible: true, // Simplified — actual eligibility requires $1,200 buy-in and service requirement
    annualTuitionCoverage,
    monthlyMHA,
    annualMHA,
    annualBooks,
    totalAnnualValue,
    totalProgramValue,
    entitlementMonths: EDUCATION_RATES.mgib.entitlementMonths,
    transferable: false,
    notes,
  };
}

// ─── Insights Generator ────────────────────────────────────────────────────

function generateInsights(
  input: EducationInput,
  benefits: BenefitResult[],
  mhaMonthly: number | null
): string[] {
  const insights: string[] = [];
  const giBill = benefits.find((b) => b.id === 'gi-bill')!;
  const vre = benefits.find((b) => b.id === 'vre')!;
  const ta = benefits.find((b) => b.id === 'ta')!;
  const mgib = benefits.find((b) => b.id === 'mgib')!;
  const tierPct = GI_BILL_TIERS[input.serviceTier] ?? 0;
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  // Active duty: recommend TA + save GI Bill
  if (input.status === 'active-duty' && ta.eligible && tierPct > 0) {
    const giBillMHAValue = (mhaMonthly ?? 0) * mhaMonthsPerYear * input.programYears;
    const taTotal = EDUCATION_RATES.ta.annualCap * input.programYears;
    insights.push(
      `Strategy: Use TA ($4,500/year) while on active duty and save your GI Bill for after separation. ` +
      `Post-separation, GI Bill MHA could add ${mhaMonthly ? `~$${Math.round(mhaMonthly).toLocaleString()}/month ` : ''}in housing allowance — ` +
      `worth ~$${Math.round(giBillMHAValue).toLocaleString()} over ${input.programYears} years that you'd forfeit by using GI Bill while serving.`
    );
  }

  // Private school with high tuition + disability: flag VR&E advantage
  if (vre.eligible && input.schoolType === 'private' && giBill.eligible) {
    const giBillCap = EDUCATION_RATES.giBill.privateCapAnnual * (tierPct / 100);
    if (input.annualTuition > giBillCap) {
      const vreSavings = (input.annualTuition - giBillCap) * input.programYears;
      insights.push(
        `VR&E advantage: Your tuition ($${Math.round(input.annualTuition).toLocaleString()}/year) exceeds the GI Bill's ` +
        `private school cap ($${Math.round(giBillCap).toLocaleString()}/year at your tier). ` +
        `VR&E covers full tuition with no cap — saving approximately $${Math.round(vreSavings).toLocaleString()} over ${input.programYears} years compared to GI Bill.`
      );
    }
  }

  // Online program: flag MGIB comparison
  if (input.schoolType === 'online' && giBill.eligible) {
    const mgibMonthly = EDUCATION_RATES.mgib.fullTimeMonthly * enrollmentFactor(input.enrollment);
    const giBillMonthly = EDUCATION_RATES.giBill.onlineMHAMonthly * enrollmentFactor(input.enrollment);
    const mgibNetMonthly = mgibMonthly - (input.annualTuition / mhaMonthsPerYear);
    const giBillNetMonthly = giBillMonthly; // tuition is separately covered
    if (mgibNetMonthly > giBillNetMonthly && input.annualTuition < EDUCATION_RATES.mgib.fullTimeMonthly * mhaMonthsPerYear) {
      insights.push(
        `Online program comparison: MGIB pays $${Math.round(mgibMonthly).toLocaleString()}/month (fixed). ` +
        `Post-9/11 GI Bill pays $${Math.round(giBillMonthly).toLocaleString()}/month MHA plus tuition separately. ` +
        `If your tuition is low, MGIB may leave more monthly cash — but Post-9/11 covers tuition separately, making it higher total value as tuition rises.`
      );
    }
  }

  // Veteran at public in-state school: affirm GI Bill value
  if (input.status !== 'active-duty' && input.schoolType === 'public' && giBill.eligible && mhaMonthly) {
    insights.push(
      `Post-9/11 GI Bill covers 100%${tierPct < 100 ? ` × ${tierPct}% tier` : ''} of your in-state tuition ` +
      `plus $${Math.round(giBill.monthlyMHA).toLocaleString()}/month housing allowance for 9 months each academic year. ` +
      `Total ${input.programYears}-year estimated value: $${Math.round(giBill.totalProgramValue).toLocaleString()}.`
    );
  }

  return insights.slice(0, 2); // Cap at 2 insights
}

// ─── Master Comparison Function ────────────────────────────────────────────

export function compareAllBenefits(input: EducationInput): EducationComparisonResult {
  const benefits: BenefitResult[] = [
    calculatePostGIBill(input),
    calculateVRE(input),
    calculateTA(input),
    calculateMGIB(input),
  ];

  // Look up location name for display
  const locationName =
    input.schoolType !== 'online'
      ? getLocationName(input.schoolZip)
      : null;

  // Get MHA for reference display (null if online or ZIP not found)
  const mhaMonthly =
    input.schoolType !== 'online' && input.status !== 'active-duty'
      ? lookupBAH({ zipCode: input.schoolZip, payGrade: 'E-5', hasDependents: true })?.monthlyRate ?? null
      : null;

  // Find best eligible benefit by total program value
  const eligible = benefits.filter((b) => b.eligible);
  const bestBenefit = eligible.length > 0
    ? eligible.reduce((best, b) => b.totalProgramValue > best.totalProgramValue ? b : best)
    : null;

  const insights = generateInsights(input, benefits, mhaMonthly);

  return {
    benefits,
    bestBenefitId: bestBenefit?.id ?? null,
    mhaMonthly,
    locationName,
    insights,
  };
}
