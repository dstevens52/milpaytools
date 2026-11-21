/**
 * Separation rules: TAMP, VGLI and preseparation counseling (build 10a).
 *
 * Source: docs/sources/separation-rules-2026.md (Claude Chat, verified 2026-11-20,
 * quoted from 10 U.S.C. § 1145, 10 U.S.C. § 1142 and VA.gov). Every page that lists
 * who qualifies for TAMP reads TAMP_ELIGIBILITY: the healthcare comparison page and
 * its data notes, transition readiness, the separation timeline, and the TAMP post
 * (through the <TampEligibilityList /> MDX component).
 *
 * Client-safe: no imports.
 */

export const SEPARATION_RULE_SOURCES = {
  tamp: 'https://www.law.cornell.edu/uscode/text/10/1145',
  vgli: 'https://www.va.gov/life-insurance/options-eligibility/vgli/',
  preseparation: 'https://www.law.cornell.edu/uscode/text/10/1142',
  retireeEnrollment: 'https://tricare.mil/retire',
  retireeRetroactive: 'https://tricare.mil/retiring',
} as const;

/**
 * Who qualifies for TAMP, in plain words (10 U.S.C. § 1145(a)(2)(A)–(G)), in the
 * statute's order. Each entry completes the sentence "You may qualify for TAMP after…"
 * only loosely, so render it as a list item, capitalized.
 */
export const TAMP_ELIGIBILITY: readonly string[] = [
  'Involuntary separation',
  'Reserve members coming off more than 30 days of active duty in support of a contingency (or similar orders)',
  'Members held on active duty under stop-loss',
  'Members who volunteered to stay less than a year for a contingency operation',
  'Sole survivorship discharge',
  'Members who join the Selected Reserve when they separate',
  'National Guard members coming off more than 30 days of federally funded full-time duty for a declared national emergency',
];

/** The voluntary-separation sentence that goes with the list. */
export const TAMP_VOLUNTARY_NOTE =
  'A voluntary separation at the end of an enlistment does not qualify on its own; it does if you join the Selected Reserve.';

/** TAMP length (§ 1145(a)(4)): 180 days beginning on the separation date, so the separation date is day 1. */
export const TAMP_DAYS = 180;

/** VGLI: apply within 1 year and 120 days of leaving the military (VA.gov). */
export const VGLI_DEADLINE = { years: 1, days: 120 } as const;

/** VGLI: within this many days no proof of good health is needed (VA.gov). */
export const VGLI_NO_HEALTH_REVIEW_DAYS = 240;

/** Preseparation counseling starts no later than this many days before separation or retirement (§ 1142). */
export const PRESEPARATION_COUNSELING_DAYS = 365;

/** Retiree TRICARE: enroll in Prime or Select within this many days after the retirement date (tricare.mil/retire). */
export const RETIREE_TRICARE_ENROLLMENT_DAYS = 90;

/** Retiree TRICARE: a retroactive enrollment may be requested up to this many months from the retirement date (tricare.mil/retiring). */
export const RETIREE_TRICARE_RETROACTIVE_MONTHS = 12;

// ─── Date arithmetic (local calendar dates, no time of day) ──────────────────

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * The same calendar date `years` later. A Feb 29 date lands on Feb 28 in a non-leap
 * year (the earlier day; VA doesn't specify, so the conservative reading). addYears
 * would roll it to Mar 1.
 */
export function anniversary(date: Date, years: number): Date {
  const y = date.getFullYear() + years;
  const lastDay = new Date(y, date.getMonth() + 1, 0).getDate();
  return new Date(y, date.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Last day of TAMP: the separation date is day 1 of 180. */
export function tampEndDate(separationDate: Date): Date {
  return addDays(separationDate, TAMP_DAYS - 1);
}

/**
 * Last day to apply for VGLI: one calendar year, then 120 days (not a fixed 485 days).
 * From a Feb 29 separation the anniversary is Feb 28 (e.g. Feb 29, 2028 → Jun 28, 2029).
 */
export function vgliDeadline(separationDate: Date): Date {
  return addDays(anniversary(separationDate, VGLI_DEADLINE.years), VGLI_DEADLINE.days);
}

/** Last day to apply for VGLI without proof of good health. */
export function vgliNoHealthReviewEnd(separationDate: Date): Date {
  return addDays(separationDate, VGLI_NO_HEALTH_REVIEW_DAYS);
}

/** Last day to enroll in retiree TRICARE Prime or Select without a retroactive request: retirement date + 90 days. */
export function retireeTricareEnrollmentDeadline(retirementDate: Date): Date {
  return addDays(retirementDate, RETIREE_TRICARE_ENROLLMENT_DAYS);
}

/** Latest date preseparation counseling can start. */
export function preseparationCounselingStart(separationDate: Date): Date {
  return addDays(separationDate, -PRESEPARATION_COUNSELING_DAYS);
}
