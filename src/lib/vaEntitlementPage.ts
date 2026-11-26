/**
 * Copy for /calculators/va-entitlement (build V2): FAQs (visible + FAQPage schema),
 * VA's worked example and the source list. Every figure is computed from the FHFA
 * summary files or the entitlement lib; the wording follows
 * docs/sources/va-entitlement-loan-limits-2027.md.
 */

import type { FaqItem } from '@/components/FaqSection';
import { LOAN_LIMIT_SUMMARIES, LOAN_LIMIT_YEAR, loanLimitYearsShown } from '@/data/va-loan/loanLimitYear';
import {
  BASIC_ENTITLEMENT_MAX_LOAN,
  calcEntitlement,
  usdExact,
} from '@/lib/calculations/vaEntitlement';

/** VA.gov's worked example ("VA home loan limits"): $900,000 county limit, $50,000 used. */
const VA_EXAMPLE_LIMIT = 900_000;
const VA_EXAMPLE_USED = 50_000;

export const VA_ENTITLEMENT_EXAMPLE = {
  countyLimit: VA_EXAMPLE_LIMIT,
  used: VA_EXAMPLE_USED,
  result: calcEntitlement({ countyLimit: VA_EXAMPLE_LIMIT, used: VA_EXAMPLE_USED, price: 0, down: 0, feeStatus: 'none' }),
};

const years = loanLimitYearsShown();
const cur = LOAN_LIMIT_SUMMARIES[LOAN_LIMIT_YEAR];
const next = years.length > 1 ? LOAN_LIMIT_SUMMARIES[years[1]] : null;

/** "$832,750 in 2026 and $855,400 in 2027" (or the one year after the flip). */
function baselineByYear(): string {
  const a = `${usdExact(cur.baseline)} in ${cur.year}`;
  return next ? `${a} and ${usdExact(next.baseline)} in ${next.year}` : a;
}
function ceilingByYear(): string {
  const a = `${usdExact(cur.ceiling)} in ${cur.year}`;
  return next ? `${a} and ${usdExact(next.ceiling)} in ${next.year}` : a;
}

const ex = VA_ENTITLEMENT_EXAMPLE;

export const VA_ENTITLEMENT_FAQS: FaqItem[] = [
  {
    question: 'What’s the difference between full and remaining entitlement?',
    answer: `With full entitlement, VA says you don't have a loan limit. Your lender still has to approve the loan (your credit, income, debts and assets), and the appraisal has to support the price. If a prior VA loan still uses part of your entitlement, what's left is your remaining entitlement: 25% of the county loan limit, minus the entitlement already used and not restored. For loans above ${usdExact(BASIC_ENTITLEMENT_MAX_LOAN)}, VA guarantees up to 25% of the loan amount. Your Certificate of Eligibility (COE) shows the entitlement already used, in the table "Prior Loans charged to entitlement".`,
  },
  {
    question: 'Why does the county matter?',
    answer: `VA's home loan limits are the same as FHFA's conforming loan limits, which are set by county. VA says to use the One-Unit limit, even if your property has more than one unit. Your remaining entitlement is 25% of that limit minus what you've used, so a county with a higher limit leaves more. The one-unit limit in most U.S. counties is ${baselineByYear()}; the highest outside Alaska, Hawaii, Guam and the U.S. Virgin Islands is ${ceilingByYear()}.`,
  },
  {
    question: 'Can I keep my current home and buy at my next duty station with a VA loan?',
    answer: `The entitlement your current VA loan uses isn't restored while you keep the loan: restoration takes a sale and payoff, an assumption by a qualified Veteran who substitutes their entitlement, or the one-time restoration after you repay the loan in full. What's left is your remaining entitlement. Most lenders lend up to 4 times your remaining entitlement with no down payment. VA's example: a ${usdExact(ex.countyLimit)} county limit × 25% = ${usdExact(ex.result.vaShare)}, minus ${usdExact(ex.used)} used = ${usdExact(ex.result.remaining)} remaining, and ${usdExact(ex.result.remaining)} × 4 = ${usdExact(ex.result.maxZeroDown)}, "the maximum loan most lenders would make without a down payment." For a larger loan, your lender may require a down payment: most lenders want your entitlement and a down payment together to cover at least 25% of the loan.`,
  },
  {
    question: 'How do I get used entitlement back?',
    answer: 'Previously used entitlement is restored when the home you bought with the prior VA loan has been sold and the loan paid in full, or when a qualified Veteran buyer assumes your VA loan and substitutes their entitlement. There is also a one-time restoration if you have repaid the prior VA loan in full, even if you haven’t sold the home.',
  },
  {
    question: 'Which year’s loan limit applies?',
    answer: next
      ? `FHFA's limits apply to loans in that calendar year: the ${cur.year} limits through Dec. 31, ${cur.year}, and the ${next.year} limits from Jan. 1, ${next.year}. Until Jan. 1 the calculator shows both, labeled by closing year.`
      : `FHFA's limits apply to loans in that calendar year. The calculator shows the ${cur.year} limits.`,
  },
];

export interface SourceLink {
  label: string;
  href: string;
  note?: string;
}

export const VA_ENTITLEMENT_SOURCES: SourceLink[] = [
  {
    label: 'VA.gov: VA home loan limits',
    href: 'https://www.va.gov/housing-assistance/home-loans/loan-limits/',
    note: 'remaining entitlement steps and the worked example',
  },
  ...years.map((y) => ({
    label: `FHFA: ${y} conforming loan limits, all counties (CSV)`,
    href: LOAN_LIMIT_SUMMARIES[y].sourceUrl,
    note: `One-Unit column, downloaded ${LOAN_LIMIT_SUMMARIES[y].downloaded}`,
  })),
  {
    label: 'FHFA: conforming loan limit values',
    href: 'https://www.fhfa.gov/data/conforming-loan-limit-cll-values',
  },
  {
    label: 'Army Benefits Center: VA Home Loans',
    href: 'https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/VA-Home-Loans?serv=128',
    note: 'remaining entitlement and restoration',
  },
  {
    label: 'VA.gov: How to request a COE',
    href: 'https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/',
  },
];
