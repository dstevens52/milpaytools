/**
 * FY2026 VA Disability Compensation Rates (monthly)
 *
 * Source: https://www.va.gov/disability/compensation-rates/veteran-rates/
 * Effective: December 1, 2025 (paid starting January 2026)
 * COLA: 2.8% increase over FY2025
 *
 * All combination rates are direct lookups from VA published tables.
 * No values are estimated or computed — every number comes from the
 * official VA.gov 2026 rate tables.
 *
 * Structure:
 *   Table A — rates WITHOUT children (veteran alone, with spouse, with parents).
 *   Table B — rates WITH exactly 1 child (various spouse/parent combos).
 *   For 2+ children: use the Table B rate as the base, then add
 *   additionalChild for each child beyond the first (or additionalSchoolChild
 *   for 18-23 school children).
 *
 * Note: 10% and 20% ratings do NOT receive dependent-based additions.
 */

import type { VADisabilityTable } from '@/data/types';

export const DATA_YEAR = '2026';

export const vaRates: VADisabilityTable = {
  0: {
    veteranAlone: 0,
    withSpouse: 0,
    withSpouseAnd1Parent: 0,
    withSpouseAnd2Parents: 0,
    with1Parent: 0,
    with2Parents: 0,
    with1Child: 0,
    withSpouseAnd1Child: 0,
    withSpouseAnd1ChildAnd1Parent: 0,
    withSpouseAnd1ChildAnd2Parents: 0,
    with1ChildAnd1Parent: 0,
    with1ChildAnd2Parents: 0,
    additionalChild: 0,
    additionalSchoolChild: 0,
    spouseAA: 0,
  },
  10: {
    // No dependent additions at 10% — all columns flat (VA.gov confirmed)
    veteranAlone: 180.42,
    withSpouse: 180.42,
    withSpouseAnd1Parent: 180.42,
    withSpouseAnd2Parents: 180.42,
    with1Parent: 180.42,
    with2Parents: 180.42,
    with1Child: 180.42,
    withSpouseAnd1Child: 180.42,
    withSpouseAnd1ChildAnd1Parent: 180.42,
    withSpouseAnd1ChildAnd2Parents: 180.42,
    with1ChildAnd1Parent: 180.42,
    with1ChildAnd2Parents: 180.42,
    additionalChild: 0,
    additionalSchoolChild: 0,
    spouseAA: 0,
  },
  20: {
    // No dependent additions at 20% — all columns flat (VA.gov confirmed)
    veteranAlone: 356.66,
    withSpouse: 356.66,
    withSpouseAnd1Parent: 356.66,
    withSpouseAnd2Parents: 356.66,
    with1Parent: 356.66,
    with2Parents: 356.66,
    with1Child: 356.66,
    withSpouseAnd1Child: 356.66,
    withSpouseAnd1ChildAnd1Parent: 356.66,
    withSpouseAnd1ChildAnd2Parents: 356.66,
    with1ChildAnd1Parent: 356.66,
    with1ChildAnd2Parents: 356.66,
    additionalChild: 0,
    additionalSchoolChild: 0,
    spouseAA: 0,
  },
  30: {
    // Table A — without children
    veteranAlone: 552.47,
    withSpouse: 617.47,
    withSpouseAnd1Parent: 669.47,
    withSpouseAnd2Parents: 721.47,
    with1Parent: 604.47,
    with2Parents: 656.47,
    // Table B — with 1 child
    with1Child: 596.47,
    withSpouseAnd1Child: 666.47,
    withSpouseAnd1ChildAnd1Parent: 718.47,
    withSpouseAnd1ChildAnd2Parents: 770.47,
    with1ChildAnd1Parent: 648.47,
    with1ChildAnd2Parents: 700.47,
    // Additional amounts
    additionalChild: 32.00,
    additionalSchoolChild: 105.00,
    spouseAA: 61.00,
  },
  40: {
    // Table A — without children
    veteranAlone: 795.84,
    withSpouse: 882.84,
    withSpouseAnd1Parent: 952.84,
    withSpouseAnd2Parents: 1022.84,
    with1Parent: 865.84,
    with2Parents: 935.84,
    // Table B — with 1 child
    with1Child: 853.84,
    withSpouseAnd1Child: 947.84,
    withSpouseAnd1ChildAnd1Parent: 1017.84,
    withSpouseAnd1ChildAnd2Parents: 1087.84,
    with1ChildAnd1Parent: 923.84,
    with1ChildAnd2Parents: 993.84,
    // Additional amounts
    additionalChild: 43.00,
    additionalSchoolChild: 140.00,
    spouseAA: 81.00,
  },
  50: {
    // Table A — without children
    veteranAlone: 1132.90,
    withSpouse: 1241.90,
    withSpouseAnd1Parent: 1329.90,
    withSpouseAnd2Parents: 1417.90,
    with1Parent: 1220.90,
    with2Parents: 1308.90,
    // Table B — with 1 child
    with1Child: 1205.90,
    withSpouseAnd1Child: 1322.90,
    withSpouseAnd1ChildAnd1Parent: 1410.90,
    withSpouseAnd1ChildAnd2Parents: 1498.90,
    with1ChildAnd1Parent: 1293.90,
    with1ChildAnd2Parents: 1381.90,
    // Additional amounts
    additionalChild: 54.00,
    additionalSchoolChild: 176.00,
    spouseAA: 101.00,
  },
  60: {
    // Table A — without children
    veteranAlone: 1435.02,
    withSpouse: 1566.02,
    withSpouseAnd1Parent: 1671.02,
    withSpouseAnd2Parents: 1776.02,
    with1Parent: 1540.02,
    with2Parents: 1645.02,
    // Table B — with 1 child
    with1Child: 1523.02,
    withSpouseAnd1Child: 1663.02,
    withSpouseAnd1ChildAnd1Parent: 1768.02,
    withSpouseAnd1ChildAnd2Parents: 1873.02,
    with1ChildAnd1Parent: 1628.02,
    with1ChildAnd2Parents: 1733.02,
    // Additional amounts
    additionalChild: 65.00,
    additionalSchoolChild: 211.00,
    spouseAA: 121.00,
  },
  70: {
    // Table A — without children
    veteranAlone: 1808.45,
    withSpouse: 1961.45,
    withSpouseAnd1Parent: 2084.45,
    withSpouseAnd2Parents: 2207.45,
    with1Parent: 1931.45,
    with2Parents: 2054.45,
    // Table B — with 1 child
    with1Child: 1910.45,
    withSpouseAnd1Child: 2074.45,
    withSpouseAnd1ChildAnd1Parent: 2197.45,
    withSpouseAnd1ChildAnd2Parents: 2320.45,
    with1ChildAnd1Parent: 2033.45,
    with1ChildAnd2Parents: 2156.45,
    // Additional amounts
    additionalChild: 76.00,
    additionalSchoolChild: 246.00,
    spouseAA: 141.00,
  },
  80: {
    // Table A — without children
    veteranAlone: 2102.15,
    withSpouse: 2277.15,
    withSpouseAnd1Parent: 2417.15,
    withSpouseAnd2Parents: 2557.15,
    with1Parent: 2242.15,
    with2Parents: 2382.15,
    // Table B — with 1 child
    with1Child: 2219.15,
    withSpouseAnd1Child: 2406.15,
    withSpouseAnd1ChildAnd1Parent: 2546.15,
    withSpouseAnd1ChildAnd2Parents: 2686.15,
    with1ChildAnd1Parent: 2359.15,
    with1ChildAnd2Parents: 2499.15,
    // Additional amounts
    additionalChild: 87.00,
    additionalSchoolChild: 281.00,
    spouseAA: 161.00,
  },
  90: {
    // Table A — without children
    veteranAlone: 2362.30,
    withSpouse: 2559.30,
    withSpouseAnd1Parent: 2717.30,
    withSpouseAnd2Parents: 2875.30,
    with1Parent: 2520.30,
    with2Parents: 2678.30,
    // Table B — with 1 child
    with1Child: 2494.30,
    withSpouseAnd1Child: 2704.30,
    withSpouseAnd1ChildAnd1Parent: 2862.30,
    withSpouseAnd1ChildAnd2Parents: 3020.30,
    with1ChildAnd1Parent: 2652.30,
    with1ChildAnd2Parents: 2810.30,
    // Additional amounts
    additionalChild: 98.00,
    additionalSchoolChild: 317.00,
    spouseAA: 181.00,
  },
  100: {
    // Table A — without children
    veteranAlone: 3938.58,
    withSpouse: 4158.17,
    withSpouseAnd1Parent: 4334.41,
    withSpouseAnd2Parents: 4510.65,
    with1Parent: 4114.82,
    with2Parents: 4291.06,
    // Table B — with 1 child
    with1Child: 4085.43,
    withSpouseAnd1Child: 4318.99,
    withSpouseAnd1ChildAnd1Parent: 4495.23,
    withSpouseAnd1ChildAnd2Parents: 4671.47,
    with1ChildAnd1Parent: 4261.67,
    with1ChildAnd2Parents: 4437.91,
    // Additional amounts
    additionalChild: 109.11,
    additionalSchoolChild: 352.45,
    spouseAA: 201.41,
  },
};
