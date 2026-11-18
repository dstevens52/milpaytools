/**
 * 2027 VA disability compensation rates — release status.
 *
 * One field drives every status-dependent sentence about the 2027 rates (the
 * dated notice on /calculators/va-disability, and later /va-disability-rates):
 *
 *   'law-pending' → Congress hasn't finished the annual veterans' COLA law
 *                   (passed but unsigned counts as pending).
 *   'law-enacted' → the COLA is law (fill `lawCitation`); VA hasn't published
 *                   its 2027 rate tables yet.
 *   'published'   → VA.gov shows the 2027 tables, copied cell by cell into
 *                   src/data/va-rates/2027.ts.
 *
 * Publish day is a DATA-ONLY change: fill src/data/va-rates/2027.ts from VA.gov,
 * set status to 'published' here and update `checkedDate`. No component edits.
 * The calculator, retirement and transition readiness switch to the 2027 table
 * through src/data/va-rates/registry.ts once it is published AND its effective
 * date (December 1, 2026) has been reached at build time.
 *
 * Never put a 2027 dollar figure anywhere until it is copied from VA's own
 * published table. No projections (2026 × COLA), not even as an estimate.
 *
 * Facts checked Nov 18, 2026 (Claude Chat):
 *   - H.R. 8552 (Veterans' Compensation Cost-of-Living Adjustment Act of 2026;
 *     Senate companion S. 4487) passed the House and the Senate (~Nov 11, 2026)
 *     and awaits the President's signature. It ties the increase to the Social
 *     Security COLA, effective December 1, 2026.
 *   - VA.gov's rate tables still read "Effective December 1, 2025"; no 2027
 *     table is published.
 * Source record: docs/sources/calendar-2027.md (VA disability COLA row).
 */

export type VaRates2027Status = 'law-pending' | 'law-enacted' | 'published';

export interface VaRates2027StatusConfig {
  status: VaRates2027Status;
  /** ISO date the status was last checked. Shown on pages as "checked {date}". */
  checkedDate: string;
  /** The bill while the law is pending, e.g. 'H.R. 8552'. */
  billCitation: string;
  billUrl: string;
  /** Where the bill stands while 'law-pending', completing "The bill … ". Plain text. */
  pendingDetail: string;
  /** Public Law number once signed, e.g. 'Pub. L. 119-xx'; null until then. */
  lawCitation: string | null;
  /** VA's compensation rate tables (the source for src/data/va-rates/2027.ts). */
  vaTableUrl: string;
}

export const VA_RATES_2027_STATUS: VaRates2027StatusConfig = {
  status: 'law-pending',
  checkedDate: '2026-11-18',
  billCitation: 'H.R. 8552',
  billUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/8552',
  pendingDetail: "has passed the House and the Senate and is awaiting the President's signature",
  lawCitation: null,
  vaTableUrl: 'https://www.va.gov/disability/compensation-rates/veteran-rates/',
};
