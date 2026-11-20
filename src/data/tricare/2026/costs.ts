/**
 * TRICARE costs, calendar year 2026 (effective Jan. 1, 2026).
 *
 * Every value is copied from docs/sources/tricare-costs-2027.md (2026 columns),
 * whose source for CY2026 is the TRICARE Newsroom article "Learn your 2026
 * TRICARE health plan costs" (NR26; matches Federal Register 2025-19819,
 * 90 FR 50745). Don't edit figures here without updating that source doc.
 */

import type { TricareCosts } from '../types';

export const TRICARE_COSTS_2026: TricareCosts = {
  year: 2026,
  effective: '2026-01-01',
  sources: [
    {
      key: 'NR26',
      title: 'TRICARE Newsroom, "Learn your 2026 TRICARE health plan costs" (Nov. 7, 2025)',
      url: 'https://newsroom.tricare.mil/News/TRICARE-News/Article/4328806/learn-your-2026-tricare-health-plan-costs',
    },
    {
      key: 'PH',
      title: 'TRICARE Newsroom, "Preview your 2026 TRICARE pharmacy costs" (Nov. 13, 2025)',
      url: 'https://newsroom.tricare.mil/News/TRICARE-News/Article/4329992/preview-your-2026-tricare-pharmacy-costs',
    },
  ],

  retiree: {
    primeA: {
      enrollmentFee: { individual: 381.96, family: 765.0 },
      deductible: { individual: 0, family: 0 },
      catastrophicCap: 3000,
      copays: { primary: 26, specialty: 39, er: 79, urgent: 39, preventive: 0 },
    },
    primeB: {
      enrollmentFee: { individual: 462.96, family: 927.0 },
      deductible: { individual: 0, family: 0 },
      catastrophicCap: 4635,
      copays: { primary: 26, specialty: 39, er: 79, urgent: 39, preventive: 0 },
    },
    selectA: {
      enrollmentFee: { individual: 186.96, family: 375.0 },
      deductible: { individual: 150, family: 300 },
      catastrophicCap: 4381,
      copays: { primary: 38, specialty: 52, er: 138, urgent: 38, preventive: 0 },
    },
    selectB: {
      enrollmentFee: { individual: 594.96, family: 1191.0 },
      deductible: { individual: 198, family: 397 },
      nonNetworkDeductible: { individual: 397, family: 794 },
      catastrophicCap: 4635,
      copays: { primary: 33, specialty: 52, er: 105, urgent: 52, preventive: 0 },
    },
    selectNonNetworkCostSharePct: 25,
    selectACapSurvivorsMedicallyRetired: 3000,
  },

  adfm: {
    primeA: { enrollmentFee: 0, deductible: 0, copay: 0, catastrophicCap: 1000 },
    primeB: { enrollmentFee: 0, deductible: 0, copay: 0, catastrophicCap: 1324 },
    selectA: {
      enrollmentFee: 0,
      deductible: { e1ToE4: { individual: 50, family: 100 }, e5AndAbove: { individual: 150, family: 300 } },
      catastrophicCap: 1000,
      copays: { primary: 28, specialty: 39, er: 103, urgent: 28 },
    },
    selectB: {
      enrollmentFee: 0,
      deductible: { e1ToE4: { individual: 66, family: 132 }, e5AndAbove: { individual: 198, family: 397 } },
      catastrophicCap: 1324,
      copays: { primary: 19, specialty: 33, er: 52, urgent: 26 },
    },
    selectNonNetworkCostSharePct: 20,
  },

  premiumPlans: {
    trsMember: 57.88,
    trsFamily: 286.66,
    trrMember: 645.9,
    trrFamily: 1548.3,
    tyaPrime: 794.0,
    tyaSelect: 363.0,
  },

  notes: [
    'The TRICARE Select Group A catastrophic cap is lower for survivors of active duty deceased sponsors and for medically retired members and their dependents.',
  ],
};
