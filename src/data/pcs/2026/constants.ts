/**
 * PCS (Permanent Change of Station) Rate Constants — 2026
 *
 * Sources:
 *   - MALT rate: DTMO MAP 72-25(I), effective January 1, 2026
 *   - Per diem (CONUS): GSA standard CONUS rates, FY2026
 *   - DLA: DTMO MAP 72-25(I), effective January 1, 2026
 *     NOTE: DLA rates below are estimates based on 2025 published rates with 2026 COLA
 *     applied. Verify against https://www.travel.dod.mil before publishing.
 *   - Weight allowances: JTR Chapter 5, Table 5-37 (2026)
 *   - PPM/CWT rate: approximate 2026 PPTAS schedule — actual rates vary by origin/
 *     destination and are calculated by your installation's Transportation Office (TMO).
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

  // DLA (Dislocation Allowance) — 2026 rates (verify at travel.dod.mil)
  dla: {
    withDependents: {
      'E-1': 2564.51,
      'E-2': 2564.51,
      'E-3': 2564.51,
      'E-4': 2564.51,
      'E-5': 2858.78,
      'E-6': 2858.78,
      'E-7': 3157.44,
      'E-8': 3157.44,
      'E-9': 3157.44,
      'O-1': 3034.76,
      'O-2': 3034.76,
      'O-3': 3471.15,
      'O-4': 3471.15,
      'O-5': 3846.47,
      'O-6': 3846.47,
      'O-7': 3846.47,
      'O-8': 3846.47,
      'O-9': 3846.47,
      'O-10': 3846.47,
      'W-1': 3034.76,
      'W-2': 3034.76,
      'W-3': 3157.44,
      'W-4': 3471.15,
      'W-5': 3471.15,
    } as Record<string, number>,
    withoutDependents: {
      'E-1': 1002.71,
      'E-2': 1002.71,
      'E-3': 1002.71,
      'E-4': 1002.71,
      'E-5': 1156.21,
      'E-6': 1156.21,
      'E-7': 1283.64,
      'E-8': 1283.64,
      'E-9': 1283.64,
      'O-1': 1205.56,
      'O-2': 1205.56,
      'O-3': 1369.53,
      'O-4': 1369.53,
      'O-5': 1498.47,
      'O-6': 1498.47,
      'O-7': 1498.47,
      'O-8': 1498.47,
      'O-9': 1498.47,
      'O-10': 1498.47,
      'W-1': 1205.56,
      'W-2': 1205.56,
      'W-3': 1283.64,
      'W-4': 1369.53,
      'W-5': 1369.53,
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
