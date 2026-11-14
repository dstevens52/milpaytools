/**
 * 2027 military pay calendar — key dates (/pay/raise, /pay, rank pages, /bah, homepage).
 *
 * Source record: docs/sources/calendar-2027.md (verified 2026-11-13). Statuses:
 *   official — fixed by law, regulation or an official announcement
 *   expected — a pattern from past years, never a promise (always worded that way)
 *   pending  — waiting on an action; no date or number shown
 *
 * Import-order safety: this file imports the pay-raise lib, and the lib imports
 * this file (FAQ dates). Top-level values here are literals only; everything that
 * reads another module runs inside a function, so any load order works.
 *
 * Annual update: each October, create calendar-{next year}.ts from this template
 * (docs/ANNUAL_DATA_UPDATE.md). Release-day flips: docs/RELEASE_DAY_2027_PAY.md.
 */

import { PAY_RAISE_2027, type PayRaiseConfig } from '@/data/pay-raise/2027';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { BAH_2027_STATUS } from '@/data/bah/2027-status';
import { DATA_LAST_CHECKED } from '@/data/watch';
import { formatIsoDate, formatPercent, raiseCalendarEntry, retireeColaTiming } from '@/lib/calculations/payRaise';
import { TSP_CONSTANTS_2027, TSP_LIMITS_2027_ANNOUNCED, TSP_LIMITS_2027_NOTICE } from '@/data/tsp/2027/constants';

/** "$25,500" — whole dollars, for the one calendar entry that states official limits. */
function dollars(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export type CalendarStatus = 'official' | 'expected' | 'pending';

export interface CalendarSource {
  name: string;
  url: string;
}

export interface CalendarEntry {
  id: string;
  dateLabel: string;
  /** ISO date when the date itself is fixed; null while pending or only expected. */
  isoDate: string | null;
  title: string;
  body: string;
  status: CalendarStatus;
  source: CalendarSource;
  link?: { href: string; label: string };
}

/** Sources, as listed in docs/sources/calendar-2027.md. */
export const CALENDAR_SOURCES = {
  ssaCola: { name: 'SSA: Latest Cost-of-Living Adjustment', url: 'https://www.ssa.gov/oact/cola/latestCOLA.html' },
  usc1401a: { name: '10 U.S.C. 1401a', url: 'https://www.law.cornell.edu/uscode/text/10/1401a' },
  s4487: {
    name: "S. 4487, Veterans' Compensation Cost-of-Living Adjustment Act of 2026",
    url: 'https://www.congress.gov/bill/119th-congress/senate-bill/4487',
  },
  irs202567: { name: 'IRS Notice 2025-67 (2026 limits, the precedent)', url: 'https://www.irs.gov/pub/irs-drop/n-25-67.pdf' },
  irs202666: { name: 'IRS Notice 2026-66 (2027 limits, announced Nov 12, 2026)', url: 'https://www.irs.gov/pub/irs-drop/n-26-66.pdf' },
  bah2026Release: {
    name: 'Department of War releases 2026 basic allowance for housing rates (AETC, Dec 11, 2025)',
    url: 'https://www.aetc.af.mil/News/Article-Display/Article/4359784/department-of-war-releases-2026-basic-allowance-for-housing-rates/',
  },
  fmr7a1: {
    name: 'DoD FMR Vol. 7A, ch. 1 (paydays)',
    url: 'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_01.pdf',
  },
  dfasPaydays: {
    name: 'DFAS active duty paydays (2026 schedule; 2027 not yet posted)',
    url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/2026ACPayDay/',
  },
  plan: {
    name: 'H. Doc. 119-189, alternative pay plan (Aug 26, 2026)',
    url: 'https://www.govinfo.gov/content/pkg/CDOC-119hdoc189/html/CDOC-119hdoc189.htm',
  },
  dfasBas: { name: 'DFAS: Basic Allowance for Subsistence', url: 'https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/bas/' },
} as const;

/** Fixed calendar dates (literals). */
export const KEY_DATES_2027 = {
  /** Jan 1, 2027 is New Year's Day, so the Jan 1 payday moves to the earlier workday. */
  lastPayday2026: '2026-12-31',
  /** Pay period the Dec 31 payday covers (still at 2026 rates). */
  lastPayday2026Covers: 'December 16–31',
  ratesEffective: '2027-01-01',
  /** Mid-month payday, covers Jan 1–15 — the first pay at 2027 rates. */
  firstPayday2027: '2027-01-15',
  firstPayday2027Covers: 'January 1–15',
} as const;

/** Link target for the /pay/raise calculator section. */
export const RAISE_CALCULATOR_HREF = '/pay/raise#your-2027-base-pay';
/** Link target for the full calendar on /pay/raise. */
export const KEY_DATES_HREF = '/pay/raise#key-dates';
/** Every 2027 payday (active duty, retired, VA). */
export const PAY_DATES_HREF = '/pay/dates';
export const PAY_DATES_LINK_LABEL = 'See all 2027 paydays →';

/** The four rows the compact variant shows. */
export const COMPACT_IDS = ['final-raise', 'bah', 'rates-effective', 'first-payday'] as const;

/** "Friday, January 15, 2027" — UTC, so no timezone day shift. */
export function weekdayDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** BAH expectation for 2027, from the shared BAH status (released → official). */
export function bah2027Calendar(): {
  status: CalendarStatus;
  isoDate: string | null;
  priorReleaseIso: string;
  priorRatesYear: number;
} {
  const prior = BAH_2027_STATUS.pastReleases[0];
  if (BAH_2027_STATUS.status === 'released' && BAH_2027_STATUS.releasedDate) {
    return { status: 'official', isoDate: BAH_2027_STATUS.releasedDate, priorReleaseIso: prior.releasedDate, priorRatesYear: prior.ratesYear };
  }
  return { status: 'expected', isoDate: null, priorReleaseIso: prior.releasedDate, priorRatesYear: prior.ratesYear };
}

/** "Last checked" date shown under the calendar (shared watch date). */
export function calendarLastChecked(): string {
  return DATA_LAST_CHECKED;
}

/** The nine 2027 key dates, in date order. */
export function getCalendar2027(config: PayRaiseConfig = PAY_RAISE_2027): CalendarEntry[] {
  const cola = RETIREE_COLA_2027;
  const colaPct = formatPercent(cola.percent);
  const raise = raiseCalendarEntry(config);
  const bah = bah2027Calendar();

  return [
    {
      id: 'final-raise',
      title: 'Final 2027 pay raise',
      ...raise,
      link: { href: '/pay/raise', label: 'See your 2027 base pay →' },
    },
    {
      id: 'retiree-cola',
      dateLabel: `${weekdayDate(cola.effectiveDate)} (first in the ${formatIsoDate(cola.firstRetiredPayDate)} retired pay)`,
      isoDate: cola.effectiveDate,
      title: `Military retiree COLA: ${colaPct}`,
      body: `Military retired pay rises ${colaPct}, the same CPI-W increase Social Security announced on ${formatIsoDate(cola.announcedDate)}. ${retireeColaTiming(cola)}`,
      status: 'official',
      source: CALENDAR_SOURCES.ssaCola,
      link: { href: '/calculators/retirement', label: 'Retirement calculator →' },
    },
    {
      id: 'va-cola',
      dateLabel: `${formatIsoDate(cola.effectiveDate)}, once the law passes`,
      isoDate: null,
      title: 'VA disability COLA',
      body: `VA rates rise by the Social Security COLA (${colaPct}) once Congress passes the annual VA COLA law; VA then publishes the 2027 rate tables.`,
      status: 'pending',
      source: CALENDAR_SOURCES.s4487,
      link: { href: '/calculators/va-disability', label: 'VA disability calculator →' },
    },
    {
      // Deliberate exception to "no $ in calendar text": the official 2027 limits
      // (docs/sources/calendar-2027.md; pay-raise-2027.spec.ts exempts this id only).
      id: 'tsp-limits',
      dateLabel: formatIsoDate(TSP_LIMITS_2027_ANNOUNCED),
      isoDate: TSP_LIMITS_2027_ANNOUNCED,
      title: '2027 TSP contribution limits',
      body: `The IRS announced the 2027 limits on ${formatIsoDate(TSP_LIMITS_2027_ANNOUNCED)} (${TSP_LIMITS_2027_NOTICE}): ${dollars(TSP_CONSTANTS_2027.electiveDeferralLimit)} elective deferral limit, ${dollars(TSP_CONSTANTS_2027.catchUpLimit)} catch-up at age 50 and older, and ${dollars(TSP_CONSTANTS_2027.enhancedCatchUpLimit)} catch-up at ages 60–63. They take effect January 1, 2027.`,
      status: 'official',
      source: CALENDAR_SOURCES.irs202666,
      link: { href: '/calculators/tsp', label: 'TSP calculator →' },
    },
    {
      id: 'bah',
      dateLabel: bah.isoDate ? formatIsoDate(bah.isoDate) : 'Mid-December 2026 (expected)',
      isoDate: bah.isoDate,
      title: '2027 BAH rates',
      body: bah.isoDate
        ? `DoD published 2027 BAH rates on ${formatIsoDate(bah.isoDate)}, effective January 1, 2027.`
        : `Expected mid-December; the ${bah.priorRatesYear} rates were released ${formatIsoDate(bah.priorReleaseIso)}.`,
      status: bah.status,
      source: CALENDAR_SOURCES.bah2026Release,
      link: { href: '/bah', label: 'BAH calculator →' },
    },
    {
      id: 'dec31-payday',
      dateLabel: weekdayDate(KEY_DATES_2027.lastPayday2026),
      isoDate: KEY_DATES_2027.lastPayday2026,
      title: 'Last payday at 2026 rates',
      body: `The January 1 payday moves up because ${formatIsoDate(KEY_DATES_2027.ratesEffective)} is New Year's Day. It covers ${KEY_DATES_2027.lastPayday2026Covers} at 2026 rates.`,
      status: 'official',
      source: CALENDAR_SOURCES.fmr7a1,
      link: { href: PAY_DATES_HREF, label: PAY_DATES_LINK_LABEL },
    },
    {
      id: 'rates-effective',
      dateLabel: weekdayDate(KEY_DATES_2027.ratesEffective),
      isoDate: KEY_DATES_2027.ratesEffective,
      title: '2027 pay rates take effect',
      body: '2027 basic pay, BAH and BAS rates take effect January 1.',
      status: 'official',
      source: CALENDAR_SOURCES.plan,
      link: { href: RAISE_CALCULATOR_HREF, label: 'See your 2027 base pay →' },
    },
    {
      id: 'first-payday',
      dateLabel: weekdayDate(KEY_DATES_2027.firstPayday2027),
      isoDate: KEY_DATES_2027.firstPayday2027,
      title: 'First payday at 2027 rates',
      body: `The mid-month payday covers ${KEY_DATES_2027.firstPayday2027Covers}, the first pay at 2027 rates.`,
      status: 'official',
      source: CALENDAR_SOURCES.dfasPaydays,
      link: { href: PAY_DATES_HREF, label: PAY_DATES_LINK_LABEL },
    },
    {
      id: 'bas',
      dateLabel: `Before ${formatIsoDate(KEY_DATES_2027.ratesEffective)}`,
      isoDate: null,
      title: '2027 BAS rates',
      body: 'DFAS publishes 2027 BAS rates before January 1.',
      status: 'pending',
      source: CALENDAR_SOURCES.dfasBas,
    },
  ];
}

/** One line for the /pay/[rank] "2027 pay raise" section (the page adds the calendar link). */
export function rankKeyDatesLine(): string {
  const bah = bah2027Calendar();
  const bahPart = bah.isoDate
    ? `2027 BAH rates were published ${formatIsoDate(bah.isoDate)}.`
    : '2027 BAH is expected in mid-December.';
  return `Key dates: the raise takes effect ${formatIsoDate(KEY_DATES_2027.ratesEffective)}, and the first payday at 2027 rates is ${weekdayDate(KEY_DATES_2027.firstPayday2027)}. ${bahPart}`;
}

/** Unique sources across the calendar, for the "Sources" line (plus 10 U.S.C. 1401a for the COLA). */
export function calendarSources(entries: CalendarEntry[] = getCalendar2027()): CalendarSource[] {
  const all = [...entries.map((e) => e.source), CALENDAR_SOURCES.usc1401a];
  return all.filter((s, i) => all.findIndex((x) => x.url === s.url) === i);
}
