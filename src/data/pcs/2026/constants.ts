/**
 * PCS (Permanent Change of Station) Rate Constants — 2026
 *
 * Sources:
 *   - MALT rate: DTMO MAP 72-25(I), effective January 1, 2026
 *   - Per diem (CONUS): GSA standard CONUS rates, FY2026
 *     NOTE: Per diem shown at standard CONUS rates ($179/day). Actual PCS per diem may
 *     differ from TDY rates and depends on your specific orders. Verify with Finance Office.
 *   - DLA: DTMO MAP 72-25(I), effective January 1, 2026 (primary DLA rates)
 *     Source: https://www.travel.dod.mil — verify annually as rates update each January.
 *   - Weight allowances: JTR Chapter 5, Table 5-37 (2026)
 *   - PPM/CWT rate: approximate 2026 PPTAS schedule
 *     IMPORTANT: PPM reimbursement rates vary by distance and are calculated by your
 *     Transportation Office (TMO). The estimate shown uses an approximate rate per
 *     hundredweight and may differ from your actual entitlement.
 *
 * Update annually: new rates typically published November–December for next calendar year.
 */

export const PCS_RATES_2026 = {
  year: 2026,

  // MALT (Monetary Allowance in Lieu of Transportation) — PCS mileage rate
  maltPerMile: 0.205, // $0.205/mile (2026 DTMO rate)

  // Per Diem — CONUS standard rates (FY2026)
  perDiemLodging: 110, // $110/day standard CONUS lodging
  perDiemMIE: 69, // $69/day M&IE (meals & incidental expenses)
  perDiemTotal: 179, // $179/day total CONUS per diem
  perDiemFirstLastDay: 134.25, // 75% of $179 on first and last travel day

  // Travel days: 1 day for first 400 miles, then 1 day per 350 miles (≥51 mi rounds up)
  milesFirstDay: 400,
  milesPerAdditionalDay: 350,

  // DLA (Dislocation Allowance) — primary rates per DTMO MAP 72-25(I), effective January 1, 2026
  // Source: https://www.travel.dod.mil
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

  // Weight allowances (lbs) by rank — JTR Table 5-37 (2026)
  weightAllowance: {
    'E-1': 8000,
    'E-2': 8000,
    'E-3': 8000,
    'E-4': 8000,
    'E-5': 9000,
    'E-6': 11000,
    'E-7': 13000,
    'E-8': 14000,
    'E-9': 15000,
    'O-1': 10000,
    'O-2': 12500,
    'O-3': 14000,
    'O-4': 17000,
    'O-5': 17500,
    'O-6': 18000,
    'O-7': 18000,
    'O-8': 18000,
    'O-9': 18000,
    'O-10': 18000,
    'W-1': 10000,
    'W-2': 12500,
    'W-3': 14000,
    'W-4': 17000,
    'W-5': 17500,
  } as Record<string, number>,

  // PPM reimbursement rate — approximate 2026 PPTAS rate
  // IMPORTANT: Actual rates vary by distance and origin/destination. Calculated by TMO.
  ppmPerCWT: 210.0, // ~$210 per hundredweight (100 lbs)

  // TLE (Temporary Lodging Expense) — maximum combined days at old + new station
  tleMaxDays: 14,

  // PPM advance: service member may request up to 60% of reimbursement upfront
  ppmAdvancePercent: 0.60,
} as const;

export type DLATable = typeof PCS_RATES_2026.dla.withDependents;
