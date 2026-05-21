/**
 * FY2026 VA Disability Compensation Rates (monthly)
 *
 * Source: https://www.va.gov/disability/compensation-rates/veteran-rates/
 * Effective: December 1, 2025 (paid starting January 2026)
 * COLA: 2.8% increase over FY2025
 *
 * Official VA.gov 2026 rates:
 *   - veteranAlone: all ratings — official VA.gov 2026
 *   - withSpouse: all ratings — official VA.gov 2026
 *   - withSpouseAA: computed as withSpouse + A&A addition from VA.gov "Added amounts" table
 *   - additionalChild: official VA.gov 2026 "Added amounts" table (30%–100%)
 *   - additionalSchoolChild: official VA.gov 2026 "Added amounts" table (30%–100%)
 *   - additionalParent: derived from VA.gov "with 1 parent, no spouse" row minus veteranAlone
 *     (30%–60%); equals VA.gov stated amount at 70%–100% where parent adds same rate regardless
 *     of spouse presence
 *   - withOneChild, withSpouseAndOneChild (30%–60%): official VA.gov 2026 row values
 *   - withTwoChildren, withThreeChildren (30%–60%): withOneChild + N×additionalChild
 *   - withSpouseAndTwoChildren, withSpouseAndThreeChildren (30%–60%): withSpouseAndOneChild + N×additionalChild
 *   - 70%–100% child-combination rows: needs verification from VA.gov 70-100% veteran with
 *     children table — values below are retained from prior estimates, do NOT rely on them
 *
 * additionalSchoolChild: per-child monthly addition for children ages 18-23
 * enrolled in an approved school program (38 CFR § 3.667). Always higher
 * than the under-18 additionalChild rate.
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
    additionalSchoolChild: 0,
    additionalParent: 0,
  },
  10: {
    // No dependent additions at 10% — all columns flat (VA.gov confirmed)
    veteranAlone: 180.42,
    withSpouse: 180.42,
    withSpouseAA: 180.42,
    withSpouseAndOneChild: 180.42,
    withSpouseAndTwoChildren: 180.42,
    withSpouseAndThreeChildren: 180.42,
    withOneChild: 180.42,
    withTwoChildren: 180.42,
    withThreeChildren: 180.42,
    additionalChild: 0,
    additionalSchoolChild: 0,
    additionalParent: 0,
  },
  20: {
    // No dependent additions at 20% — all columns flat (VA.gov confirmed)
    veteranAlone: 356.66,
    withSpouse: 356.66,
    withSpouseAA: 356.66,
    withSpouseAndOneChild: 356.66,
    withSpouseAndTwoChildren: 356.66,
    withSpouseAndThreeChildren: 356.66,
    withOneChild: 356.66,
    withTwoChildren: 356.66,
    withThreeChildren: 356.66,
    additionalChild: 0,
    additionalSchoolChild: 0,
    additionalParent: 0,
  },
  30: {
    veteranAlone: 552.47,              // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 617.47,                // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 678.47,              // withSpouse + $61.00 A&A addition (VA.gov "Added amounts")
    withSpouseAndOneChild: 666.47,     // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAndTwoChildren: 698.47,  // withSpouseAndOneChild + 1×additionalChild ($32)
    withSpouseAndThreeChildren: 730.47, // withSpouseAndOneChild + 2×additionalChild ($64)
    withOneChild: 596.47,              // Official VA.gov 2026 rates, effective December 1, 2025
    withTwoChildren: 628.47,           // withOneChild + 1×additionalChild ($32)
    withThreeChildren: 660.47,         // withOneChild + 2×additionalChild ($64)
    additionalChild: 32.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 105.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 47.00,           // VA.gov "with 1 parent, no spouse" ($599.47) − veteranAlone ($552.47)
  },
  40: {
    veteranAlone: 795.84,              // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 882.84,                // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 963.84,              // withSpouse + $81.00 A&A addition (VA.gov "Added amounts")
    withSpouseAndOneChild: 947.84,     // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAndTwoChildren: 990.84,  // withSpouseAndOneChild + 1×additionalChild ($43)
    withSpouseAndThreeChildren: 1033.84, // withSpouseAndOneChild + 2×additionalChild ($86)
    withOneChild: 853.84,              // Official VA.gov 2026 rates, effective December 1, 2025
    withTwoChildren: 896.84,           // withOneChild + 1×additionalChild ($43)
    withThreeChildren: 939.84,         // withOneChild + 2×additionalChild ($86)
    additionalChild: 43.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 140.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 54.00,           // VA.gov "with 1 parent, no spouse" ($849.84) − veteranAlone ($795.84)
  },
  50: {
    veteranAlone: 1132.90,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 1241.90,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 1342.90,             // withSpouse + $101.00 A&A addition (VA.gov "Added amounts")
    withSpouseAndOneChild: 1322.90,    // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAndTwoChildren: 1376.90, // withSpouseAndOneChild + 1×additionalChild ($54)
    withSpouseAndThreeChildren: 1430.90, // withSpouseAndOneChild + 2×additionalChild ($108)
    withOneChild: 1205.90,             // Official VA.gov 2026 rates, effective December 1, 2025
    withTwoChildren: 1259.90,          // withOneChild + 1×additionalChild ($54)
    withThreeChildren: 1313.90,        // withOneChild + 2×additionalChild ($108)
    additionalChild: 54.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 176.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 73.00,           // VA.gov "with 1 parent, no spouse" ($1,205.90) − veteranAlone ($1,132.90)
  },
  60: {
    veteranAlone: 1435.02,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 1566.02,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 1687.02,             // withSpouse + $121.00 A&A addition (VA.gov "Added amounts")
    withSpouseAndOneChild: 1663.02,    // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAndTwoChildren: 1728.02, // withSpouseAndOneChild + 1×additionalChild ($65)
    withSpouseAndThreeChildren: 1793.02, // withSpouseAndOneChild + 2×additionalChild ($130)
    withOneChild: 1523.02,             // Official VA.gov 2026 rates, effective December 1, 2025
    withTwoChildren: 1588.02,          // withOneChild + 1×additionalChild ($65)
    withThreeChildren: 1653.02,        // withOneChild + 2×additionalChild ($130)
    additionalChild: 65.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 211.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 92.00,           // VA.gov "with 1 parent, no spouse" ($1,527.02) − veteranAlone ($1,435.02)
  },
  70: {
    veteranAlone: 1808.45,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 1961.45,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 2102.45,             // withSpouse + $141.00 A&A addition (VA.gov "Added amounts")
    // Child-combination rows below: needs verification from VA.gov 70-100% veteran with children table
    withSpouseAndOneChild: 2009.74,
    withSpouseAndTwoChildren: 2084.78,
    withSpouseAndThreeChildren: 2159.83,
    withOneChild: 1883.30,
    withTwoChildren: 1958.34,
    withThreeChildren: 2033.38,
    additionalChild: 76.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 246.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 123.00,          // Official VA.gov 2026 rates, effective December 1, 2025
  },
  80: {
    veteranAlone: 2102.15,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 2277.15,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 2438.15,             // withSpouse + $161.00 A&A addition (VA.gov "Added amounts")
    // Child-combination rows below: needs verification from VA.gov 70-100% veteran with children table
    withSpouseAndOneChild: 2325.34,
    withSpouseAndTwoChildren: 2409.63,
    withSpouseAndThreeChildren: 2492.90,
    withOneChild: 2184.50,
    withTwoChildren: 2268.80,
    withThreeChildren: 2352.06,
    additionalChild: 87.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 281.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 140.00,          // Official VA.gov 2026 rates, effective December 1, 2025
  },
  90: {
    veteranAlone: 2362.30,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 2559.30,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 2740.30,             // withSpouse + $181.00 A&A addition (VA.gov "Added amounts")
    // Child-combination rows below: needs verification from VA.gov 70-100% veteran with children table
    withSpouseAndOneChild: 2609.06,
    withSpouseAndTwoChildren: 2701.58,
    withSpouseAndThreeChildren: 2794.10,
    withOneChild: 2453.84,
    withTwoChildren: 2546.36,
    withThreeChildren: 2638.88,
    additionalChild: 98.00,            // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 317.00,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 158.00,          // Official VA.gov 2026 rates, effective December 1, 2025
  },
  100: {
    veteranAlone: 3938.58,             // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouse: 4158.17,               // Official VA.gov 2026 rates, effective December 1, 2025
    withSpouseAA: 4359.58,             // withSpouse + $201.41 A&A addition (VA.gov "Added amounts")
    // Child-combination rows below: needs verification from VA.gov 70-100% veteran with children table
    withSpouseAndOneChild: 4240.50,
    withSpouseAndTwoChildren: 4346.38,
    withSpouseAndThreeChildren: 4452.27,
    withOneChild: 4047.24,
    withTwoChildren: 4153.12,
    withThreeChildren: 4259.00,
    additionalChild: 109.11,           // Official VA.gov 2026 rates, effective December 1, 2025
    additionalSchoolChild: 352.45,     // Official VA.gov 2026 rates, effective December 1, 2025
    additionalParent: 176.24,          // Official VA.gov 2026 rates, effective December 1, 2025
  },
};
