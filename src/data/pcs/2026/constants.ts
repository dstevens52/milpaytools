/**
 * PCS (Permanent Change of Station) Rate Constants — 2026
 *
 * Rules and provenance for everything below: docs/sources/pcs-rules-2026.md
 * (Claude Chat's JTR check, 2026-11-18). Per diem rates live in ../conusPerDiem.ts.
 *
 * Sources:
 *   - MALT rate: DTMO MAP 72-25(I), effective January 1, 2026
 *   - DLA: DTMO MAP 72-25(I), effective January 1, 2026 (primary DLA rates)
 *     Source: https://www.travel.dod.mil — verify annually as rates update each January.
 *   - Travel days: JTR par. 050205 (rules note §1)
 *   - TLE: JTR par. 050601, Tables 5-13 and 5-17; $290 daily cap (rules note §4)
 *   - Weight allowances: JTR par. 051401, Table 5-37, edition dated Oct 1, 2024 (rules note §5)
 *   - Second-POV MALT: JTR par. 050203, Table 5-1 (rules note §5b)
 *   - PPM: the incentive is 100% of the Government Constructed Cost (GCC), computed per
 *     move by the move system / transportation office. DoD publishes no $/cwt rate, so the
 *     estimator shows no PPM dollar figure (rules note §6).
 *
 * Update annually: new rates typically published November–December for next calendar year.
 */

export const PCS_RATES_2026 = {
  year: 2026,

  // MALT (Monetary Allowance in Lieu of Transportation) — PCS mileage rate
  maltPerMile: 0.205, // $0.205/mile (2026 DTMO rate)
  // Two POVs at most, and the second only when a dependent travels (JTR 050203, Table 5-1).
  maltMaxPOVs: 2,

  // POV travel days (JTR 050205): 400 miles or less = 1 day; otherwise distance ÷ 350,
  // rounded down, plus 1 day when the remainder is 51 miles or more.
  milesOneDayMax: 400,
  milesPerTravelDay: 350,
  milesRemainderForExtraDay: 51,

  // En route per diem by POV = MALT Plus: the full standard CONUS rate (lodging + M&IE) for
  // each authorized travel day — no 75% day (JTR Table 5-4 row 1). Dependents traveling with
  // the member get a share of the member's rate.
  dependentPerDiemShare: {
    age12OrOlder: 0.75,
    under12: 0.5,
  },

  // TLE (Temporary Lodging Expense) — JTR par. 050601, Tables 5-13 and 5-17.
  tle: {
    // Total days across the old and new locations (not per location).
    maxDaysConus: 21, // new PDS in CONUS (MAP 66-24(R), effective Nov 27, 2024)
    maxDaysConusToOconus: 7, // CONUS → OCONUS move
    dailyCap: 290, // includes lodging taxes and mandatory fees (MAP 55-24(I))
    // Percentage of the locality lodging + M&IE rate (Table 5-17).
    percent: {
      onePerson: 0.65, // member alone, or one dependent alone
      twoPeople: 1.0, // member + 1 dependent, or 2 dependents
      eachAdditional12OrOlder: 0.35,
      eachAdditionalUnder12: 0.25,
    },
    extensionsUrl: 'https://www.travel.dod.mil/Portals/119/Documents/JTR/Supplements/Locations_with_Approved_TLE_Extensions.pdf',
  },

  // DLA (Dislocation Allowance) — primary rates, effective January 1, 2026.
  // Source: PDTATAC, "UTD for MAP 72-25(I), CY2026 Dislocation Allowance (DLA) Rates"
  //   https://media.defense.gov/2025/Dec/31/2003850077/-1/-1/0/UTD_FOR_MAP_72-25(I)_CY2026_DISLOCATION_ALLOWANCE_(DLA)_RATES.PDF
  // Rate lookup: https://www.travel.dod.mil/Travel-Transportation-Rates/Dislocation-Allowance/
  // Both URLs are in PCS_DLA_SOURCE_URLS below (monthly link check).
  // Checked cell by cell against the official table by tests/e2e/pcs-dla-unit.spec.ts.
  dla: {
    withDependents: {
      'E-1': 3548.02,
      'E-2': 3548.02,
      'E-3': 3548.02,
      'E-4': 3548.02,
      'E-5': 3548.02,
      'E-6': 3548.02,
      'E-7': 3551.31,
      'E-8': 3824.94,
      'E-9': 4149.51,
      'W-1': 3151.31,
      'W-2': 3643.75,
      'W-3': 3960.78,
      'W-4': 4323.11,
      'W-5': 4715.58,
      'O-1E': 3621.10,
      'O-2E': 3919.27,
      'O-3E': 4343.80,
      'O-1': 3085.23,
      'O-2': 3451.28,
      'O-3': 4041.88,
      'O-4': 4885.43,
      'O-5': 5542.06,
      'O-6': 5749.63,
      'O-7': 6385.58,
      'O-8': 6385.58,
      'O-9': 6385.58,
      'O-10': 6385.58,
    } as Record<string, number>,
    withoutDependents: {
      'E-1': 1870.58,
      'E-2': 2025.26,
      'E-3': 2355.48,
      'E-4': 2389.42,
      'E-5': 2389.42,
      'E-6': 2389.42,
      'E-7': 2468.19,
      'E-8': 2888.97,
      'E-9': 3147.54,
      'W-1': 2394.55,
      'W-2': 2860.70,
      'W-3': 3221.08,
      'W-4': 3832.45,
      'W-5': 4315.51,
      'O-1E': 2687.09,
      'O-2E': 3124.87,
      'O-3E': 3675.83,
      'O-1': 2273.82,
      'O-2': 2700.31,
      'O-3': 3404.11,
      'O-4': 4247.61,
      'O-5': 4583.51,
      'O-6': 4758.96,
      'O-7': 5187.33,
      'O-8': 5187.33,
      'O-9': 5187.33,
      'O-10': 5187.33,
    } as Record<string, number>,
  },

  // HHG weight allowances (lbs) — JTR Table 5-37, "PCS and NTS Weight Allowances (Pounds)",
  // edition dated Oct 1, 2024 (pp. 5C-8, 5C-9). "With dependents" = a dependent eligible to
  // travel at government expense on the PCS. The table has no O-1E–O-3E rows: prior-enlisted
  // officers use the O-1/O-2/O-3 rows. Pro-gear (PBP&E) doesn't count against the allowance.
  weightAllowance: {
    withDependents: {
      'E-1': 8000,
      'E-2': 8000,
      'E-3': 8000,
      'E-4': 8000,
      'E-5': 9000,
      'E-6': 11000,
      'E-7': 13000,
      'E-8': 14000,
      'E-9': 15000,
      'W-1': 12000,
      'W-2': 13500,
      'W-3': 14500,
      'W-4': 17000,
      'W-5': 17500,
      'O-1': 12000,
      'O-2': 13500,
      'O-3': 14500,
      'O-4': 17000,
      'O-5': 17500,
      'O-6': 18000,
      'O-7': 18000,
      'O-8': 18000,
      'O-9': 18000,
      'O-10': 18000,
    } as Record<string, number>,
    withoutDependents: {
      'E-1': 5000,
      'E-2': 5000,
      'E-3': 5000,
      'E-4': 7000,
      'E-5': 7000,
      'E-6': 8000,
      'E-7': 11000,
      'E-8': 12000,
      'E-9': 13000,
      'W-1': 10000,
      'W-2': 12500,
      'W-3': 13000,
      'W-4': 14000,
      'W-5': 16000,
      'O-1': 10000,
      'O-2': 12500,
      'O-3': 13000,
      'O-4': 14000,
      'O-5': 16000,
      'O-6': 18000,
      'O-7': 18000,
      'O-8': 18000,
      'O-9': 18000,
      'O-10': 18000,
    } as Record<string, number>,
    /** Grades without their own Table 5-37 row → the row they use. */
    rowFor: { 'O-1E': 'O-1', 'O-2E': 'O-2', 'O-3E': 'O-3' } as Record<string, string>,
  },

  // PPM: the incentive is 100% of the Government Constructed Cost (PPA, "Personally Procured
  // Moves"; Military OneSource, "Preparing to Move or PCS": "the government will pay you 100% of
  // the government's constructed 'best value' cost"; the temporary 130% of MAP 42-25(R) ended
  // Sep 30, 2025). Taxable, less eligible operating expenses (USMC LOGCOM PPM checklist).
  // Sources: docs/sources/pcs-rules-2026.md §6–7.
  ppmIncentivePercentOfGcc: 1.0,
  // PPM advance: up to 60% of the incentive value (same Military OneSource page).
  ppmAdvancePercent: 0.60,
} as const;

export type DLATable = typeof PCS_RATES_2026.dla.withDependents;

/** DLA source document and rate lookup page — checked monthly by scripts/check-oconus-links.ts. */
export const PCS_DLA_SOURCE_URLS: { label: string; url: string }[] = [
  {
    label: 'PDTATAC — UTD for MAP 72-25(I), CY2026 DLA Rates',
    url: 'https://media.defense.gov/2025/Dec/31/2003850077/-1/-1/0/UTD_FOR_MAP_72-25(I)_CY2026_DISLOCATION_ALLOWANCE_(DLA)_RATES.PDF',
  },
  { label: 'DTMO — Dislocation Allowance', url: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Dislocation-Allowance/' },
];

/** Where the PPM explanation and official estimate links point. */
export const PCS_PPM_SOURCE_URL = 'https://www.militaryonesource.mil/resources/millife-guides/preparing-to-move-or-pcs/';
