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

/** Last day of TAMP: the separation date is day 1 of 180. */
export function tampEndDate(separationDate: Date): Date {
  return addDays(separationDate, TAMP_DAYS - 1);
}

/** Last day to apply for VGLI: one calendar year, then 120 days (not a fixed 485 days). */
export function vgliDeadline(separationDate: Date): Date {
  return addDays(addYears(separationDate, VGLI_DEADLINE.years), VGLI_DEADLINE.days);
}

/** Last day to apply for VGLI without proof of good health. */
export function vgliNoHealthReviewEnd(separationDate: Date): Date {
  return addDays(separationDate, VGLI_NO_HEALTH_REVIEW_DAYS);
}

/** Latest date preseparation counseling can start. */
export function preseparationCounselingStart(separationDate: Date): Date {
  return addDays(separationDate, -PRESEPARATION_COUNSELING_DAYS);
}
