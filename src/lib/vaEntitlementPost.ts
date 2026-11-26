/**
 * VA entitlement figures for blog posts (build V2): every county limit, remaining
 * entitlement and lender-convention figure a post shows is computed here from the
 * FHFA summary files and the entitlement lib (src/lib/calculations/vaEntitlement.ts).
 * Nothing is typed by hand. Rendered by <VaEntitlementFigure>
 * (src/components/blog/VaEntitlementFigure.tsx).
 *
 * Inputs arrive as strings from MDX (next-mdx-remote drops JS-expression props):
 *   <VaEntitlementFigure prior="280000" show="used" />                 → $70,000
 *   <VaEntitlementFigure prior="280000" show="remaining" />            → remaining, most U.S. counties, LOAN_LIMIT_YEAR
 *   <VaEntitlementFigure prior="280000" price="650000" show="down" />  → typical down payment, whole dollars (throws if none is needed)
 *   <VaEntitlementFigure show="year" />                                → 2026
 *
 * Source: docs/sources/va-entitlement-loan-limits-2027.md. Client-safe: summary files only.
 */

import { LOAN_LIMIT_SUMMARIES, LOAN_LIMIT_YEAR } from '@/data/va-loan/loanLimitYear';
import {
  BASIC_ENTITLEMENT_MAX_LOAN,
  VA_GUARANTY_SHARE,
  calcEntitlement,
  estimatedUsedFromPriorLoan,
  usdAboutDown,
  usdExact,
} from '@/lib/calculations/vaEntitlement';

/**
 * What to show:
 * - limit: the county limit (the year's "most U.S. counties" one-unit limit unless limit= is given)
 * - vaShare: 25% of the limit
 * - used: entitlement used (used=, or 25% of prior= when the prior loan is above $144,000)
 * - remaining: VA's 25% minus used
 * - max: 4 × remaining (most lenders, $0 down)
 * - required: 25% of the loan (price − down)
 * - down: the down payment most lenders look for (throws when the loan is within the $0-down maximum)
 * - year: the loan limit year
 * - basicMax: the largest loan basic entitlement covers (VA: "$144,000 or less")
 */
export type EntitlementShow = 'limit' | 'vaShare' | 'used' | 'remaining' | 'max' | 'required' | 'down' | 'year' | 'basicMax';

export interface EntitlementFigureInput {
  show?: EntitlementShow;
  /** "current" (LOAN_LIMIT_YEAR, the default), "next" (the following year's file) or YYYY. */
  year?: string;
  /** An explicit county limit in dollars; default: the year's "most U.S. counties" limit. */
  limit?: string | number;
  used?: string | number;
  prior?: string | number;
  price?: string | number;
  down?: string | number;
}

function num(v: string | number | undefined, prop: string, min = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (v === undefined || v === '' || !Number.isFinite(n) || n < min) {
    throw new Error(`VaEntitlementFigure: bad ${prop} "${v}"`);
  }
  return n;
}

export function entitlementPostYear(year: string | undefined): number {
  if (year === undefined || year === 'current') return LOAN_LIMIT_YEAR;
  const y = year === 'next' ? LOAN_LIMIT_YEAR + 1 : num(year, 'year', 2000);
  if (!LOAN_LIMIT_SUMMARIES[y]) throw new Error(`VaEntitlementFigure: no FHFA file for ${y}`);
  return y;
}

/** The text one <VaEntitlementFigure> renders. */
export function vaEntitlementFigure(i: EntitlementFigureInput): string {
  const show = i.show ?? 'remaining';
  const year = entitlementPostYear(i.year);
  if (show === 'year') return String(year);
  if (show === 'basicMax') return usdExact(BASIC_ENTITLEMENT_MAX_LOAN);

  const limit = i.limit === undefined ? LOAN_LIMIT_SUMMARIES[year].baseline : num(i.limit, 'limit', 1);
  let used = 0;
  if (i.used !== undefined) used = num(i.used, 'used');
  else if (i.prior !== undefined) {
    const est = estimatedUsedFromPriorLoan(num(i.prior, 'prior', 1));
    if (est === null) throw new Error(`VaEntitlementFigure: prior "${i.prior}" is $144,000 or less (no estimate)`);
    used = est;
  }
  const price = i.price === undefined ? 0 : num(i.price, 'price', 1);
  const down = i.down === undefined ? 0 : num(i.down, 'down');
  const r = calcEntitlement({ countyLimit: limit, used, price, down, feeStatus: 'none' });

  switch (show) {
    case 'limit':
      return usdExact(r.countyLimit);
    case 'vaShare':
      return usdExact(r.vaShare);
    case 'used':
      return usdExact(r.used);
    case 'remaining':
      return usdExact(r.remaining);
    case 'max':
      return usdExact(r.maxZeroDown);
    case 'required':
      if (!r.hasPrice) throw new Error('VaEntitlementFigure: show="required" needs price');
      return usdExact(VA_GUARANTY_SHARE * r.loan);
    case 'down':
      if (!r.aboveMax) throw new Error(`VaEntitlementFigure: show="down" but the loan is within the $0-down maximum (${year})`);
      return usdAboutDown(r.typicalDown);
    default:
      throw new Error(`VaEntitlementFigure: bad show "${show as string}"`);
  }
}
