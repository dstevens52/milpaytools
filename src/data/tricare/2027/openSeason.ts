/**
 * TRICARE Open Season for 2027 coverage, and TRICARE's official 2027
 * TRICARE-vs-civilian comparison table.
 *
 * Source: OS27, tricare.mil/openseason (page "Last Updated 11/19/2026"), as
 * recorded in docs/sources/tricare-costs-2027.md. The TRICARE column is
 * TRICARE Select Group B retiree family coverage and reads the 2027 cost file,
 * so it can't drift from the fee tables.
 */

import { TRICARE_COSTS_2027 } from './costs';

export const OPEN_SEASON_SOURCE = {
  key: 'OS27',
  title: 'TRICARE Open Season (tricare.mil/openseason)',
  url: 'https://tricare.mil/openseason',
} as const;

/** TRICARE Open Season for 2027 coverage. ISO dates. */
export const OPEN_SEASON_2026 = {
  start: '2026-11-09',
  end: '2026-12-08',
  /** Enrollment changes made during Open Season take effect on this date. */
  changesEffective: '2027-01-01',
  /** Federal Benefits Open Season (dental and vision, FEDVIP). */
  fedvipStart: '2026-11-09',
  fedvipEnd: '2026-12-14',
} as const;

/**
 * 'open' while Open Season runs; set to 'closed' on Dec. 9, 2026 (FIX_QUEUE
 * dated item). Drives the Open Season section and FAQ wording in the TRICARE
 * costs post.
 */
export const OPEN_SEASON_2026_STATUS: 'open' | 'closed' = 'open';

/** A number renders as dollars (cents when it has them); a string renders as written. */
export type ComparisonCell = number | string;

export interface ComparisonRow {
  label: string;
  /** TRICARE Select Group B retiree family, FEHB example, Marketplace Silver, Marketplace Gold, employer average (2026). */
  cells: [ComparisonCell, ComparisonCell, ComparisonCell, ComparisonCell, ComparisonCell];
}

const t = TRICARE_COSTS_2027.retiree.selectB;
/** Employer-sponsored average annual employee premium, family coverage (KFF 2026, via OS27). */
const EMPLOYER_AVG_EMPLOYEE_PREMIUM = 7471;
const usd0 = (n: number) => '$' + n.toLocaleString('en-US');

export const OFFICIAL_COMPARISON_2027: {
  source: typeof OPEN_SEASON_SOURCE;
  intro: string;
  columns: string[];
  rows: ComparisonRow[];
  employerAvgEmployeePremium: number;
  footnotes: string[];
} = {
  source: OPEN_SEASON_SOURCE,
  intro:
    'Unless otherwise noted, costs are for 2027 and reflect family coverage for two adults and two children.',
  columns: [
    'TRICARE Select (Group B retiree family)',
    'FEHB plan example',
    'Marketplace Silver example',
    'Marketplace Gold example',
    'Employer-sponsored average (2026)',
  ],
  rows: [
    { label: 'Annual enrollment fee / premium', cells: [t.enrollmentFee.family, 12919.4, 20833.92, 28618, EMPLOYER_AVG_EMPLOYEE_PREMIUM] },
    {
      label: 'Annual deductible',
      cells: [
        `${usd0(t.deductible.family)} network; ${usd0(t.nonNetworkDeductible.family)} non-network`,
        '$1,000 network; $1,000 non-network',
        '$10,000 network',
        '$0 network',
        '$3,320 network',
      ],
    },
    {
      label: 'Annual out-of-pocket max',
      cells: [t.catastrophicCap, '$14,000 network; $18,000 non-network', 22900, 21000, 'Not available'],
    },
    { label: 'Primary care copay', cells: [t.copays.primary, 30, 0, 20, 27] },
    { label: 'Specialty care copay', cells: [t.copays.specialty, 40, 90, 90, 46] },
    {
      label: 'Cost-share / coinsurance',
      cells: ['20–25%', '15% network; 35% non-network', '40% network', '30% network', '20–21%'],
    },
  ],
  employerAvgEmployeePremium: EMPLOYER_AVG_EMPLOYEE_PREMIUM,
  footnotes: [
    'TRICARE column: TRICARE Select Group B retiree family, which TRICARE uses "as it generally has higher enrollment fees and out-of-pockets costs than the other TRICARE plans available during TRICARE Open Season." TRICARE calls its annual out-of-pocket maximum the catastrophic cap.',
    'FEHB: a sample Federal Employees Health Benefits family plan.',
    'Marketplace: two nonsmoking adults and two children in ZIP code 80202 (Denver, Colorado), without premium tax credits or other subsidies. Actual costs vary by location, age, household, income and plan. Marketplace enrollees pay 100% of nonemergency care outside the network.',
    'Employer: nationwide averages, employee contribution only. The deductible is the average family PPO deductible (aggregate); no comparable family out-of-pocket maximum was available. Source: Kaiser Family Foundation 2026 Employer-Sponsored Health Benefits Survey.',
  ],
};
