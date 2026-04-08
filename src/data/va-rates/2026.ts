/**
 * FY2026 VA Disability Compensation Rates (monthly)
 *
 * Source: https://www.va.gov/disability/compensation-rates/veteran-rates/
 * Effective: December 1, 2025 (paid starting January 2026)
 * COLA: 2.8% increase over FY2025
 *
 * veteranAlone and withSpouse values are official VA.gov 2026 rates.
 * All other columns (withSpouseAA, children, parents) are estimated at
 * FY2025 rates × 1.028. Verify exact values on VA.gov before relying
 * on dependent-combination columns.
 *
 * Note: 10% and 20% ratings do NOT receive dependent-based additions.
 */

import type { VADisabilityTable } from '@/data/types';

export const DATA_YEAR = '2026';

export const vaRates: VADisabilityTable = {
  0: {
    veteranAlone: 0,
    withSpouse: 0,
    withSpouseAA: 0,
    withSpouseAndOneChild: 0,
    withSpouseAndTwoChildren: 0,
    withSpouseAndThreeChildren: 0,
    withOneChild: 0,
    withTwoChildren: 0,
    withThreeChildren: 0,
    additionalChild: 0,
    additionalParent: 0,
  },
  10: {
    // No dependent additions at 10% — all columns flat
    veteranAlone: 175.51,
    withSpouse: 175.51,
    withSpouseAA: 175.51,
    withSpouseAndOneChild: 175.51,
    withSpouseAndTwoChildren: 175.51,
    withSpouseAndThreeChildren: 175.51,
    withOneChild: 175.51,
    withTwoChildren: 175.51,
    withThreeChildren: 175.51,
    additionalChild: 0,
    additionalParent: 0,
  },
  20: {
    // No dependent additions at 20% — all columns flat
    veteranAlone: 347.83,
    withSpouse: 347.83,
    withSpouseAA: 347.83,
    withSpouseAndOneChild: 347.83,
    withSpouseAndTwoChildren: 347.83,
    withSpouseAndThreeChildren: 347.83,
    withOneChild: 347.83,
    withTwoChildren: 347.83,
    withThreeChildren: 347.83,
    additionalChild: 0,
    additionalParent: 0,
  },
  30: {
    veteranAlone: 552.47,    // official VA.gov 2026
    withSpouse: 617.47,      // official VA.gov 2026
    withSpouseAA: 685.68,    // estimated: FY2025 × 1.028
    withSpouseAndOneChild: 657.92,
    withSpouseAndTwoChildren: 698.01,
    withSpouseAndThreeChildren: 738.10,
    withOneChild: 597.27,
    withTwoChildren: 637.36,
    withThreeChildren: 677.45,
    additionalChild: 31.87,
    additionalParent: 31.87,
  },
  40: {
    veteranAlone: 795.84,    // official VA.gov 2026
    withSpouse: 882.84,      // official VA.gov 2026
    withSpouseAA: 958.10,
    withSpouseAndOneChild: 926.23,
    withSpouseAndTwoChildren: 975.57,
    withSpouseAndThreeChildren: 1024.92,
    withOneChild: 848.10,
    withTwoChildren: 897.44,
    withThreeChildren: 946.79,
    additionalChild: 43.18,
    additionalParent: 43.18,
  },
  50: {
    veteranAlone: 1132.90,   // official VA.gov 2026
    withSpouse: 1241.90,     // official VA.gov 2026
    withSpouseAA: 1324.06,
    withSpouseAndOneChild: 1287.06,
    withSpouseAndTwoChildren: 1345.65,
    withSpouseAndThreeChildren: 1404.25,
    withOneChild: 1192.48,
    withTwoChildren: 1251.08,
    withThreeChildren: 1309.67,
    additionalChild: 54.48,
    additionalParent: 54.48,
  },
  60: {
    veteranAlone: 1435.02,   // official VA.gov 2026
    withSpouse: 1566.02,     // official VA.gov 2026
    withSpouseAA: 1656.11,
    withSpouseAndOneChild: 1611.90,
    withSpouseAndTwoChildren: 1678.72,
    withSpouseAndThreeChildren: 1745.54,
    withOneChild: 1500.88,
    withTwoChildren: 1567.70,
    withThreeChildren: 1634.52,
    additionalChild: 65.79,
    additionalParent: 65.79,
  },
  70: {
    veteranAlone: 1808.45,   // official VA.gov 2026
    withSpouse: 1961.45,     // official VA.gov 2026
    withSpouseAA: 2061.14,
    withSpouseAndOneChild: 2009.74,
    withSpouseAndTwoChildren: 2084.78,
    withSpouseAndThreeChildren: 2159.83,
    withOneChild: 1883.30,
    withTwoChildren: 1958.34,
    withThreeChildren: 2033.38,
    additionalChild: 77.10,
    additionalParent: 77.10,
  },
  80: {
    veteranAlone: 2102.15,   // official VA.gov 2026
    withSpouse: 2277.15,     // official VA.gov 2026
    withSpouseAA: 2382.90,
    withSpouseAndOneChild: 2325.34,
    withSpouseAndTwoChildren: 2409.63,
    withSpouseAndThreeChildren: 2492.90,
    withOneChild: 2184.50,
    withTwoChildren: 2268.80,
    withThreeChildren: 2352.06,
    additionalChild: 88.41,
    additionalParent: 88.41,
  },
  90: {
    veteranAlone: 2362.30,   // official VA.gov 2026
    withSpouse: 2559.30,     // official VA.gov 2026
    withSpouseAA: 2673.83,
    withSpouseAndOneChild: 2609.06,
    withSpouseAndTwoChildren: 2701.58,
    withSpouseAndThreeChildren: 2794.10,
    withOneChild: 2453.84,
    withTwoChildren: 2546.36,
    withThreeChildren: 2638.88,
    additionalChild: 99.72,
    additionalParent: 99.72,
  },
  100: {
    veteranAlone: 3938.58,   // official VA.gov 2026
    withSpouse: 4158.17,     // official VA.gov 2026
    withSpouseAA: 4330.96,
    withSpouseAndOneChild: 4240.50,
    withSpouseAndTwoChildren: 4346.38,
    withSpouseAndThreeChildren: 4452.27,
    withOneChild: 4047.24,
    withTwoChildren: 4153.12,
    withThreeChildren: 4259.00,
    additionalChild: 105.88,
    additionalParent: 118.22,
  },
};
