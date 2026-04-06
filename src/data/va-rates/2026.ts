/**
 * FY2026 VA Disability Compensation Rates (monthly)
 *
 * Source: https://www.benefits.va.gov/compensation/resources_comp01.asp
 * TODO: Verify all values against official VA FY2026 rates.
 *       Values are approximate (FY2025 + COLA adjustment).
 *
 * Structure: vaRates[disabilityPct] = VADependentRates (monthly $)
 * Percentages: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
 *
 * Note: At 10% and 20%, dependent-based additions do NOT apply.
 *       At 30% and above, dependent additions apply.
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
    veteranAlone: 175,
    withSpouse: 175,       // no dependent addition at 10%
    withSpouseAA: 175,
    withSpouseAndOneChild: 175,
    withSpouseAndTwoChildren: 175,
    withSpouseAndThreeChildren: 175,
    withOneChild: 175,
    withTwoChildren: 175,
    withThreeChildren: 175,
    additionalChild: 0,
    additionalParent: 0,
  },
  20: {
    veteranAlone: 346,
    withSpouse: 346,       // no dependent addition at 20%
    withSpouseAA: 346,
    withSpouseAndOneChild: 346,
    withSpouseAndTwoChildren: 346,
    withSpouseAndThreeChildren: 346,
    withOneChild: 346,
    withTwoChildren: 346,
    withThreeChildren: 346,
    additionalChild: 0,
    additionalParent: 0,
  },
  30: {
    veteranAlone: 537,
    withSpouse: 601,
    withSpouseAA: 667,
    withSpouseAndOneChild: 640,
    withSpouseAndTwoChildren: 679,
    withSpouseAndThreeChildren: 718,
    withOneChild: 581,
    withTwoChildren: 620,
    withThreeChildren: 659,
    additionalChild: 31,
    additionalParent: 31,
  },
  40: {
    veteranAlone: 774,
    withSpouse: 853,
    withSpouseAA: 932,
    withSpouseAndOneChild: 901,
    withSpouseAndTwoChildren: 949,
    withSpouseAndThreeChildren: 997,
    withOneChild: 825,
    withTwoChildren: 873,
    withThreeChildren: 921,
    additionalChild: 42,
    additionalParent: 42,
  },
  50: {
    veteranAlone: 1102,
    withSpouse: 1195,
    withSpouseAA: 1288,
    withSpouseAndOneChild: 1252,
    withSpouseAndTwoChildren: 1309,
    withSpouseAndThreeChildren: 1366,
    withOneChild: 1160,
    withTwoChildren: 1217,
    withThreeChildren: 1274,
    additionalChild: 53,
    additionalParent: 53,
  },
  60: {
    veteranAlone: 1395,
    withSpouse: 1503,
    withSpouseAA: 1611,
    withSpouseAndOneChild: 1568,
    withSpouseAndTwoChildren: 1633,
    withSpouseAndThreeChildren: 1698,
    withOneChild: 1460,
    withTwoChildren: 1525,
    withThreeChildren: 1590,
    additionalChild: 64,
    additionalParent: 64,
  },
  70: {
    veteranAlone: 1759,
    withSpouse: 1882,
    withSpouseAA: 2005,
    withSpouseAndOneChild: 1955,
    withSpouseAndTwoChildren: 2028,
    withSpouseAndThreeChildren: 2101,
    withOneChild: 1832,
    withTwoChildren: 1905,
    withThreeChildren: 1978,
    additionalChild: 75,
    additionalParent: 75,
  },
  80: {
    veteranAlone: 2044,
    withSpouse: 2181,
    withSpouseAA: 2318,
    withSpouseAndOneChild: 2262,
    withSpouseAndTwoChildren: 2344,
    withSpouseAndThreeChildren: 2425,
    withOneChild: 2125,
    withTwoChildren: 2207,
    withThreeChildren: 2288,
    additionalChild: 86,
    additionalParent: 86,
  },
  90: {
    veteranAlone: 2297,
    withSpouse: 2449,
    withSpouseAA: 2601,
    withSpouseAndOneChild: 2538,
    withSpouseAndTwoChildren: 2628,
    withSpouseAndThreeChildren: 2718,
    withOneChild: 2387,
    withTwoChildren: 2477,
    withThreeChildren: 2567,
    additionalChild: 97,
    additionalParent: 97,
  },
  100: {
    veteranAlone: 3831,
    withSpouse: 4022,
    withSpouseAA: 4213,
    withSpouseAndOneChild: 4125,
    withSpouseAndTwoChildren: 4228,
    withSpouseAndThreeChildren: 4331,
    withOneChild: 3937,
    withTwoChildren: 4040,
    withThreeChildren: 4143,
    additionalChild: 103,
    additionalParent: 115,
  },
};
