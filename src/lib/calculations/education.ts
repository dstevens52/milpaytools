/**
 * Education Benefits Comparison Calculator — calculation logic
 * Pure functions: no React, no side effects, independently testable.
 *
 * Compares Post-9/11 GI Bill (Ch. 33), VR&E (Ch. 31), Tuition Assistance (TA),
 * and Montgomery GI Bill (Ch. 30) for a given service member or veteran.
 *
 * Rates, tiers and caps: src/data/education/2026/constants.ts, sourced from
 * docs/sources/education-rates-2026-27.md. No dollar figures are typed here.
 */

import {
  EDUCATION_RATES,
  GI_BILL_TIERS,
  SERVICE_TIER_MIN_MONTHS,
  MGIB_MIN_SERVICE_MONTHS,
} from '@/data/education/2026/constants';

// ─── Public Types ──────────────────────────────────────────────────────────

export type ServiceStatus = 'active-duty' | 'veteran' | 'guard-reserve';
export type ServiceTier = keyof typeof GI_BILL_TIERS;
export type SchoolType = 'public' | 'private' | 'online';
/** Who offers an online-only program — decides whether the private-school cap applies. */
export type OnlineInstitution = 'public' | 'private';
export type EnrollmentStatus = 'full' | 'three-quarter' | 'half';

export interface EducationInput {
  status: ServiceStatus;
  serviceTier: ServiceTier;
  vaRating: number;          // 0, 10, 20, ..., 100
  schoolType: SchoolType;
  /** Online-only programs: public or private school. Default 'private' (cap applies). */
  onlineInstitution?: OnlineInstitution;
  schoolZip: string;
  // BAH (E-5 with dependents at the school ZIP) + location name, resolved via
  // /api/bah/lookup and injected by the caller. null when unresolved/online.
  schoolBAH: number | null;
  schoolLocationName: string | null;
  annualTuition: number;
  programYears: number;      // 2 or 4
  enrollment: EnrollmentStatus;
}

/**
 * Why a benefit's monthly housing figure is what it is (drives the card copy).
 * - location / online:     Chapter 33 MHA, location-based or online-only
 * - vre-p911:              VR&E at the Post-9/11 BAH-based rate (GI Bill tier > 0)
 * - vre-standard:          VR&E standard Chapter 31 subsistence (no-dependents column)
 * - active-duty:           no Chapter 33 MHA / VR&E subsistence on active duty
 * - pursuit-too-low:       Chapter 33 rate of pursuit 50% or less → no MHA
 * - zip-needed:            location-based housing can't be estimated yet (ZIP missing/pending/not found)
 */
export type HousingBasis =
  | 'location'
  | 'online'
  | 'vre-p911'
  | 'vre-standard'
  | 'active-duty'
  | 'pursuit-too-low'
  | 'zip-needed';

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
  /** Housing explanation for GI Bill / VR&E cards. */
  housingBasis?: HousingBasis;
  /**
   * false when the value isn't modeled as a dollar total (MGIB on active duty).
   * Such a benefit never receives the "Highest est. value" badge.
   */
  valued: boolean;
  // Meta
  entitlementMonths: number;
  transferable: boolean;
  notes: string[];
}

export interface EducationComparisonResult {
  benefits: BenefitResult[];
  bestBenefitId: string | null;
  /** E-5 w/dep BAH at the school ZIP (null if online or unresolved), regardless of status. */
  mhaMonthly: number | null;
  locationName: string | null;
  /** true when location-based housing is needed but the school BAH isn't resolved. */
  housingPending: boolean;
  insights: string[];
}

// ─── Formatting (for note/insight strings) ────────────────────────────────

const usd0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const usd2 = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Rate of pursuit / training time ───────────────────────────────────────

/**
 * Chapter 33 rate of pursuit for the UI's enrollment choices. VA rounds
 * credits ÷ full-time credits to the nearest 10% (9 of 12 = 80%). The UI
 * collects full / ¾ / ½ time, not credits, so ¾ time maps to 80% (VA's
 * 9-of-12 example) and ½ time to 50%.
 */
export function chapter33RateOfPursuit(enrollment: EnrollmentStatus): number {
  if (enrollment === 'full') return 1.0;
  if (enrollment === 'three-quarter') return 0.8;
  return 0.5;
}

/** Rate of pursuit from credits: credits ÷ full-time credits, rounded to the nearest 10%. */
export function rateOfPursuitFromCredits(credits: number, fullTimeCredits: number): number {
  if (fullTimeCredits <= 0) return 0;
  return Math.min(1, Math.round((credits / fullTimeCredits) * 10) / 10);
}

/** Chapter 33 MHA multiplier: 0 at 50% or less, otherwise the rounded rate of pursuit. */
export function mhaPursuitFactor(rateOfPursuit: number): number {
  return rateOfPursuit > EDUCATION_RATES.giBill.mhaMinRateOfPursuitExclusive ? rateOfPursuit : 0;
}

/**
 * Training-time factor (full 1, ¾ 0.75, ½ 0.5). Used for VR&E subsistence at the
 * BAH-based rate (Chapter 31 pays at half time) and for books — both unchanged.
 */
function trainingTimeFactor(enrollment: EnrollmentStatus): number {
  if (enrollment === 'full') return 1.0;
  if (enrollment === 'three-quarter') return 0.75;
  return 0.5;
}

/** MGIB (Chapter 30) monthly rate for the training time, straight from the VA table. */
export function mgibMonthlyRate(enrollment: EnrollmentStatus): number {
  if (enrollment === 'full') return EDUCATION_RATES.mgib.fullTimeMonthly;
  if (enrollment === 'three-quarter') return EDUCATION_RATES.mgib.threeQuarterMonthly;
  return EDUCATION_RATES.mgib.halfTimeMonthly;
}

const tierOf = (serviceTier: ServiceTier) => GI_BILL_TIERS[serviceTier] ?? 0;

/** Private-school tuition cap applies to private schools and online programs at private schools. */
function privateCapApplies(input: EducationInput): boolean {
  if (input.schoolType === 'private') return true;
  if (input.schoolType === 'online') return (input.onlineInstitution ?? 'private') === 'private';
  return false;
}

// ─── Chapter 33 MHA ────────────────────────────────────────────────────────

/**
 * Chapter 33 monthly housing allowance = base MHA × tier % × rate-of-pursuit factor.
 * Base MHA: E-5 with-dependents BAH at the school ZIP, or the online-only rate.
 * Returns the amount and why (for the card).
 */
export function calculateChapter33MHA(
  input: Pick<EducationInput, 'status' | 'serviceTier' | 'schoolType' | 'schoolBAH' | 'enrollment'>,
): { monthly: number; basis: HousingBasis } {
  if (input.status === 'active-duty') return { monthly: 0, basis: 'active-duty' };
  const tier = tierOf(input.serviceTier) / 100;
  const pursuit = mhaPursuitFactor(chapter33RateOfPursuit(input.enrollment));
  if (input.schoolType === 'online') {
    if (pursuit === 0) return { monthly: 0, basis: 'pursuit-too-low' };
    return { monthly: EDUCATION_RATES.giBill.onlineMHAMonthly * tier * pursuit, basis: 'online' };
  }
  if (input.schoolBAH === null) return { monthly: 0, basis: 'zip-needed' };
  if (pursuit === 0) return { monthly: 0, basis: 'pursuit-too-low' };
  return { monthly: input.schoolBAH * tier * pursuit, basis: 'location' };
}

// ─── Post-9/11 GI Bill (Chapter 33) ───────────────────────────────────────

export function calculatePostGIBill(input: EducationInput): BenefitResult {
  const { serviceTier, schoolType, annualTuition, programYears, enrollment } = input;
  const tierPct = tierOf(serviceTier);
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  const eligible = tierPct > 0;
  if (!eligible) {
    return {
      id: 'gi-bill',
      name: 'Post-9/11 GI Bill',
      shortName: 'Ch. 33',
      eligible: false,
      ineligibleReason: 'Requires at least 90 days active duty after Sep 10, 2001',
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      valued: true,
      entitlementMonths: EDUCATION_RATES.giBill.entitlementMonths,
      transferable: true,
      notes: [],
    };
  }

  // Tuition: public in-state paid in full; private (and online at a private school) capped. Both × tier.
  const capped = privateCapApplies(input);
  const annualTuitionCoverage =
    (capped ? Math.min(annualTuition, EDUCATION_RATES.giBill.privateCapAnnual) : annualTuition) * (tierPct / 100);

  // Housing: base × tier × rate of pursuit
  const { monthly: monthlyMHA, basis } = calculateChapter33MHA(input);
  const annualMHA = monthlyMHA * mhaMonthsPerYear;

  // Books: tier-prorated; training-time proration unchanged from prior behavior.
  const annualBooks = EDUCATION_RATES.giBill.bookStipendAnnualMax * (tierPct / 100) * trainingTimeFactor(enrollment);

  const totalAnnualValue = annualTuitionCoverage + annualMHA + annualBooks;
  const totalProgramValue = totalAnnualValue * programYears;

  const notes: string[] = [];
  if (tierPct < 100) {
    notes.push(`Eligibility tier: ${tierPct}% — tuition, housing and books prorated`);
  }
  if (basis === 'active-duty') {
    notes.push('No MHA on active duty — you receive BAH separately');
  }
  if (basis === 'pursuit-too-low') {
    notes.push('No housing allowance at half time or less (rate of pursuit must be more than 50%)');
  }
  if (enrollment === 'three-quarter') {
    notes.push('¾ time counted as an 80% rate of pursuit (VA example: 9 of 12 credits)');
  }
  if (capped && annualTuition > EDUCATION_RATES.giBill.privateCapAnnual * (tierPct / 100)) {
    const gap = annualTuition - annualTuitionCoverage;
    notes.push(
      `Tuition gap: ~${usd0(gap)}/year not covered` + (tierPct === 100 ? ' — check Yellow Ribbon' : ''),
    );
  }
  if (schoolType === 'online') {
    notes.push(
      `Online-only MHA: up to ${usd0(EDUCATION_RATES.giBill.onlineMHAMonthly)}/month (${EDUCATION_RATES.academicYear}), prorated by tier and rate of pursuit`,
    );
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
    housingBasis: basis,
    valued: true,
    entitlementMonths: EDUCATION_RATES.giBill.entitlementMonths,
    transferable: true,
    notes,
  };
}

// ─── VR&E — Vocational Rehab & Employment (Chapter 31) ────────────────────

/**
 * VR&E monthly housing/subsistence.
 * - GI Bill tier > 0: the Post-9/11 BAH-based rate may be elected (location BAH,
 *   or the online rate), at the Chapter 31 training-time factor.
 * - Otherwise: the standard Chapter 31 subsistence table, no-dependents column
 *   (the calculator has no dependents input).
 * Chapter 31 pays at half time.
 */
export function calculateVREHousing(
  input: Pick<EducationInput, 'status' | 'serviceTier' | 'schoolType' | 'schoolBAH' | 'enrollment'>,
): { monthly: number; basis: HousingBasis } {
  if (input.status === 'active-duty') return { monthly: 0, basis: 'active-duty' };
  const factor = trainingTimeFactor(input.enrollment);
  if (tierOf(input.serviceTier) > 0) {
    if (input.schoolType === 'online') {
      return { monthly: EDUCATION_RATES.giBill.onlineMHAMonthly * factor, basis: 'vre-p911' };
    }
    if (input.schoolBAH === null) return { monthly: 0, basis: 'zip-needed' };
    return { monthly: input.schoolBAH * factor, basis: 'vre-p911' };
  }
  return {
    monthly: EDUCATION_RATES.vre.standardSubsistence[input.enrollment].noDependents,
    basis: 'vre-standard',
  };
}

export function calculateVRE(input: EducationInput): BenefitResult {
  const { status, vaRating, annualTuition, programYears } = input;
  const isActiveDuty = status === 'active-duty';
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  const eligible = vaRating >= 10;
  if (!eligible) {
    return {
      id: 'vre',
      name: 'VR&E',
      shortName: 'Ch. 31',
      eligible: false,
      ineligibleReason: 'Requires 10%+ VA disability rating and employment barrier determination by VR&E counselor',
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      valued: true,
      entitlementMonths: EDUCATION_RATES.vre.entitlementMonths,
      transferable: false,
      notes: [],
    };
  }

  // VR&E covers full tuition — no cap
  const annualTuitionCoverage = annualTuition;

  const { monthly: monthlyMHA, basis } = calculateVREHousing(input);
  const annualMHA = monthlyMHA * mhaMonthsPerYear;

  // Books: all required books and supplies covered (estimate for comparison)
  const annualBooks = EDUCATION_RATES.vre.booksAnnualEstimate;

  const totalAnnualValue = annualTuitionCoverage + annualMHA + annualBooks;
  const totalProgramValue = totalAnnualValue * programYears;

  const notes: string[] = [];
  if (basis === 'vre-standard') {
    notes.push(
      `Housing: standard Chapter 31 subsistence, no-dependents rate (FY2027) — higher with dependents. The Post-9/11 BAH-based rate requires Post-9/11 GI Bill eligibility`,
    );
  } else if (basis === 'vre-p911') {
    notes.push('Housing: Post-9/11 BAH-based subsistence rate, which GI Bill-eligible Veterans may elect');
  }
  notes.push(
    'No tuition cap — covers full tuition at any approved school',
    'Requires VR&E counselor approval and Individual Rehabilitation Plan',
    'Does not consume GI Bill entitlement months',
  );
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
    housingBasis: basis,
    valued: true,
    entitlementMonths: EDUCATION_RATES.vre.entitlementMonths,
    transferable: false,
    notes,
  };
}

// ─── Tuition Assistance ────────────────────────────────────────────────────

export function calculateTA(input: EducationInput): BenefitResult {
  const { status, annualTuition, programYears } = input;

  const eligible = status === 'active-duty';
  if (!eligible) {
    return {
      id: 'ta',
      name: 'Tuition Assistance',
      shortName: 'TA',
      eligible: false,
      ineligibleReason: 'Tuition Assistance is for active-duty members; Guard and Reserve eligibility varies by service',
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      valued: true,
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
    valued: true,
    entitlementMonths: 0,
    transferable: false,
    notes: [
      `${usd0(EDUCATION_RATES.ta.perCreditHour)}/credit hour, ${usd0(EDUCATION_RATES.ta.annualCap)}/year maximum`,
      'Does not consume GI Bill months — use both strategically',
      'No housing allowance — you receive BAH on active duty',
      'Renews annually while you remain on active duty',
    ],
  };
}

// ─── Montgomery GI Bill (Chapter 30) ──────────────────────────────────────

export function calculateMGIB(input: EducationInput): BenefitResult {
  const { status, enrollment, annualTuition, programYears } = input;
  const monthsPerYear = EDUCATION_RATES.mgib.monthsPerYear;

  // Service requirement: under 24 months of active duty → not eligible (and never badged).
  if ((SERVICE_TIER_MIN_MONTHS[input.serviceTier] ?? 0) < MGIB_MIN_SERVICE_MONTHS) {
    return {
      id: 'mgib',
      name: 'Montgomery GI Bill',
      shortName: 'Ch. 30',
      eligible: false,
      ineligibleReason: 'Not eligible based on service length',
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      valued: true,
      entitlementMonths: EDUCATION_RATES.mgib.entitlementMonths,
      transferable: false,
      notes: ['Some early separations have exceptions — check with VA.'],
    };
  }

  // On active duty, MGIB is generally limited to tuition and fees — the monthly
  // stipend isn't modeled as a dollar total and the card is excluded from the badge.
  if (status === 'active-duty') {
    return {
      id: 'mgib',
      name: 'Montgomery GI Bill',
      shortName: 'Ch. 30',
      eligible: true,
      annualTuitionCoverage: 0,
      monthlyMHA: 0,
      annualMHA: 0,
      annualBooks: 0,
      totalAnnualValue: 0,
      totalProgramValue: 0,
      valued: false,
      entitlementMonths: EDUCATION_RATES.mgib.entitlementMonths,
      transferable: false,
      notes: [
        'While on active duty, generally limited to tuition and fees',
        'Requires $1,200 buy-in',
      ],
    };
  }

  const monthlyStipend = mgibMonthlyRate(enrollment);
  const annualStipend = monthlyStipend * monthsPerYear;

  // MGIB is a fixed monthly payment — tuition comes out of this payment.
  const annualTuitionCoverage = 0; // user pays tuition from the stipend
  const annualNetAfterTuition = annualStipend - annualTuition;

  const notes: string[] = [
    'Fixed monthly stipend — tuition is paid from this amount',
    `After paying tuition: ~${usd0(Math.max(0, annualNetAfterTuition / monthsPerYear))}/month remaining for living expenses`,
    'Requires $1,200 buy-in',
    'Often less total value than Post-9/11 for in-person students, but can be better for online programs with low tuition',
  ];
  if (status === 'guard-reserve') {
    notes.unshift('Shown at the Chapter 30 active-duty rate — Selected Reserve (Chapter 1606) rates differ and aren\'t modeled');
  }
  if (annualNetAfterTuition < 0) {
    notes.unshift(
      `Caution: tuition (${usd0(annualTuition / monthsPerYear)}/mo) exceeds monthly stipend (${usd2(monthlyStipend)}/mo)`,
    );
  }

  return {
    id: 'mgib',
    name: 'Montgomery GI Bill',
    shortName: 'Ch. 30',
    eligible: true, // Simplified — actual eligibility requires the $1,200 buy-in and a service requirement
    annualTuitionCoverage,
    monthlyMHA: monthlyStipend,
    annualMHA: annualStipend,
    annualBooks: 0, // included in stipend
    totalAnnualValue: annualStipend,
    totalProgramValue: annualStipend * programYears,
    valued: true,
    entitlementMonths: EDUCATION_RATES.mgib.entitlementMonths,
    transferable: false,
    notes,
  };
}

// ─── Insights Generator ────────────────────────────────────────────────────

function generateInsights(input: EducationInput, benefits: BenefitResult[]): string[] {
  const insights: string[] = [];
  const giBill = benefits.find((b) => b.id === 'gi-bill')!;
  const vre = benefits.find((b) => b.id === 'vre')!;
  const ta = benefits.find((b) => b.id === 'ta')!;
  const tierPct = tierOf(input.serviceTier);
  const mhaMonthsPerYear = EDUCATION_RATES.giBill.mhaMonthsPerYear;

  // Active duty: compare TA now vs GI Bill later. The forfeited figure is what the
  // same school would pay as a veteran (school BAH × tier × rate of pursuit).
  if (input.status === 'active-duty' && ta.eligible && tierPct > 0) {
    const postSeparation = calculateChapter33MHA({ ...input, status: 'veteran' });
    const monthly = postSeparation.monthly;
    const total = monthly * mhaMonthsPerYear * input.programYears;
    const cap = usd0(EDUCATION_RATES.ta.annualCap);
    insights.push(
      monthly > 0
        ? `Strategy: Consider TA (${cap}/year) while on active duty and saving your GI Bill for after separation. ` +
            `Post-separation, GI Bill MHA at this school could add ~${usd0(monthly)}/month in housing allowance — ` +
            `worth ~${usd0(total)} over ${input.programYears} years that you'd forfeit by using GI Bill while serving.`
        : `Strategy: Consider TA (${cap}/year) while on active duty and saving your GI Bill for after separation, ` +
            `when it can include a housing allowance.`,
    );
  }

  // Private school with high tuition + disability: flag VR&E advantage
  if (vre.eligible && input.schoolType === 'private' && giBill.eligible) {
    const giBillCap = EDUCATION_RATES.giBill.privateCapAnnual * (tierPct / 100);
    if (input.annualTuition > giBillCap) {
      const vreSavings = (input.annualTuition - giBillCap) * input.programYears;
      insights.push(
        `VR&E advantage: Your tuition (${usd0(input.annualTuition)}/year) exceeds the GI Bill's ` +
        `private school cap (${usd0(giBillCap)}/year at your tier). ` +
        `VR&E covers full tuition with no cap — saving approximately ${usd0(vreSavings)} over ${input.programYears} years compared to GI Bill.`,
      );
    }
  }

  // Online program (not on active duty): MGIB vs Post-9/11 monthly cash
  if (input.schoolType === 'online' && giBill.eligible && input.status !== 'active-duty') {
    const mgibMonthly = mgibMonthlyRate(input.enrollment);
    const giBillMonthly = giBill.monthlyMHA; // tier × rate of pursuit already applied
    const mgibNetMonthly = mgibMonthly - input.annualTuition / mhaMonthsPerYear;
    if (mgibNetMonthly > giBillMonthly && input.annualTuition < mgibMonthly * mhaMonthsPerYear) {
      insights.push(
        `Online program comparison: MGIB pays ${usd0(mgibMonthly)}/month (fixed). ` +
        `Post-9/11 GI Bill pays ${usd0(giBillMonthly)}/month MHA plus tuition separately. ` +
        `If your tuition is low, MGIB may leave more monthly cash — but Post-9/11 covers tuition separately, making it higher total value as tuition rises.`,
      );
    }
  }

  // Veteran at public in-state school: affirm GI Bill value
  if (input.status !== 'active-duty' && input.schoolType === 'public' && giBill.eligible && giBill.monthlyMHA > 0) {
    insights.push(
      `Post-9/11 GI Bill covers 100%${tierPct < 100 ? ` × ${tierPct}% tier` : ''} of your in-state tuition ` +
      `plus ${usd0(giBill.monthlyMHA)}/month housing allowance for ${mhaMonthsPerYear} months each academic year. ` +
      `Total ${input.programYears}-year estimated value: ${usd0(giBill.totalProgramValue)}.`,
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

  const isOnline = input.schoolType === 'online';
  const locationName = !isOnline ? input.schoolLocationName : null;
  // School BAH reference (E-5 w/dep at the school ZIP), shown for every status.
  const mhaMonthly = !isOnline ? input.schoolBAH : null;

  // Housing that depends on the school ZIP but couldn't be estimated yet.
  const housingPending = benefits.some((b) => b.eligible && b.housingBasis === 'zip-needed');

  // Best eligible, valued benefit by total program value — withheld while housing
  // is pending, so a $0 placeholder never moves the badge.
  const candidates = benefits.filter((b) => b.eligible && b.valued);
  const bestBenefit =
    !housingPending && candidates.length > 0
      ? candidates.reduce((best, b) => (b.totalProgramValue > best.totalProgramValue ? b : best))
      : null;

  return {
    benefits,
    bestBenefitId: bestBenefit?.id ?? null,
    mhaMonthly,
    locationName,
    housingPending,
    insights: generateInsights(input, benefits),
  };
}
