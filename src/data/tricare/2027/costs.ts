/**
 * TRICARE costs, calendar year 2027 (effective Jan. 1, 2027).
 *
 * Every value is copied from docs/sources/tricare-costs-2027.md (2027 columns):
 *   - FR27: Federal Register 2026-23035 (91 FR 72859–72861), Prime/Select fees,
 *     deductibles, caps and copays; "effective January 1, 2027"; retiree COLA 3.6%.
 *   - TM27: tricare.mil/comparecosts, the same Prime/Select figures plus the
 *     premium-based plans (TRS, TRR, TYA).
 *   - PH: pharmacy copays unchanged through Dec. 31, 2027.
 * Don't edit figures here without updating that source doc.
 *
 * Calculators read the current year through src/data/tricare/current.ts
 * (TRICARE_COST_YEAR); this file is used directly only by the TRICARE costs
 * post and the "2027 premiums" note until that switch flips on Jan. 1, 2027.
 */

import type { TricareCosts } from '../types';

export const TRICARE_COSTS_2027: TricareCosts & {
  /** CY2027 retiree COLA, percent (FR27: "The CY 2027 retiree COLA increase is 3.6%."). */
  retireeColaPct: number;
  /** ISO date the current pharmacy copays stay in effect through (PH). */
  pharmacyCopaysUnchangedThrough: string;
} = {
  year: 2027,
  effective: '2027-01-01',
  sources: [
    {
      key: 'FR27',
      title:
        'Federal Register 2026-23035, "TRICARE; Calendar Year (CY) 2027 TRICARE Prime and TRICARE Select Out-of-Pocket Expenses" (Nov. 12, 2026)',
      url: 'https://www.federalregister.gov/d/2026-23035',
    },
    { key: 'TM27', title: 'TRICARE, Health Plan Costs (calendar year 2027)', url: 'https://tricare.mil/comparecosts' },
    {
      key: 'PH',
      title: 'TRICARE Newsroom, "Preview your 2026 TRICARE pharmacy costs" (Nov. 13, 2025)',
      url: 'https://newsroom.tricare.mil/News/TRICARE-News/Article/4329992/preview-your-2026-tricare-pharmacy-costs',
    },
  ],
  retireeColaPct: 3.6,
  pharmacyCopaysUnchangedThrough: '2027-12-31',

  retiree: {
    primeA: {
      enrollmentFee: { individual: 396.0, family: 792.96 },
      deductible: { individual: 0, family: 0 },
      catastrophicCap: 3000,
      copays: { primary: 27, specialty: 41, er: 82, urgent: 41, preventive: 0 },
    },
    primeB: {
      enrollmentFee: { individual: 480.0, family: 960.0 },
      deductible: { individual: 0, family: 0 },
      catastrophicCap: 4802,
      copays: { primary: 27, specialty: 41, er: 82, urgent: 41, preventive: 0 },
    },
    selectA: {
      enrollmentFee: { individual: 193.92, family: 388.92 },
      deductible: { individual: 150, family: 300 },
      catastrophicCap: 4538,
      copays: { primary: 40, specialty: 52, er: 143, urgent: 40, preventive: 0 },
    },
    selectB: {
      enrollmentFee: { individual: 616.92, family: 1233.96 },
      deductible: { individual: 205, family: 411 },
      nonNetworkDeductible: { individual: 411, family: 823 },
      catastrophicCap: 4802,
      copays: { primary: 34, specialty: 54, er: 109, urgent: 54, preventive: 0 },
    },
    selectNonNetworkCostSharePct: 25,
    selectACapSurvivorsMedicallyRetired: 3000,
  },

  adfm: {
    primeA: { enrollmentFee: 0, deductible: 0, copay: 0, catastrophicCap: 1000 },
    primeB: { enrollmentFee: 0, deductible: 0, copay: 0, catastrophicCap: 1372 },
    selectA: {
      enrollmentFee: 0,
      deductible: { e1ToE4: { individual: 50, family: 100 }, e5AndAbove: { individual: 150, family: 300 } },
      catastrophicCap: 1000,
      copays: { primary: 30, specialty: 39, er: 107, urgent: 30 },
    },
    selectB: {
      enrollmentFee: 0,
      deductible: { e1ToE4: { individual: 68, family: 137 }, e5AndAbove: { individual: 205, family: 411 } },
      catastrophicCap: 1372,
      copays: { primary: 20, specialty: 34, er: 54, urgent: 27 },
    },
    selectNonNetworkCostSharePct: 20,
  },

  premiumPlans: {
    trsMember: 60.54,
    trsFamily: 307.48,
    trrMember: 707.59,
    trrFamily: 1697.7,
    tyaPrime: 893.0,
    tyaSelect: 394.0,
  },

  notes: [
    'The TRICARE Prime Group A enrollment fee is waived for retirees under 65 who have Medicare Part A and Part B.',
    'TRICARE Select Group A has no enrollment fee for medically retired sponsors, their family members and survivors.',
    'The TRICARE Select Group A catastrophic cap is lower for survivors of active duty deceased sponsors and for medically retired members and their dependents.',
  ],
};
