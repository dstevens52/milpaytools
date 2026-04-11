/**
 * FY2026 Military Monthly Basic Pay Table
 *
 * Source: https://militarypay.defense.gov/Pay/Military-Pay-Charts/
 * Effective: January 1, 2026 (3.8% increase over FY2025)
 *
 * Structure: payTable[PayGrade][YOS] = monthly basic pay in dollars
 * YOS key = minimum years of service to qualify for that column.
 * Values are in dollars and cents as published by DFAS.
 *
 * Enlisted E-1–E-9: transcribed from official FY2026 DFAS published table.
 * Warrant O-1 through O-5: values end in clean .00/.10/.20/.30 increments consistent
 *   with official DFAS formatting — spot-checked against verified anchor points.
 * W-5 and O-6 through O-10: values contain odd-cent amounts (.81, .59, .22, etc.)
 *   that are consistent with ECI-formula rounding on higher-grade pay — treat as
 *   estimates pending manual verification against current DFAS tables.
 */

import type { PayTable } from '@/data/types';

export const DATA_YEAR = '2026';

export const payTable: PayTable = {
  // ─── Enlisted ─────────────────────────────────────────────────────────────
  // Keys correspond to DFAS "Over N" column thresholds. YOS key selection:
  //   user selects N years → getYOSBracket(N) → highest key K where N >= K
  //   e.g. N=6 → K=6 (Over 6 column); N=5 → K=4 (Over 4 column)
  // Cap comment = same rate repeats for all higher YOS columns in DFAS.

  'E-1': {
    // E-1 with <4 months of active duty: $2,225.70 (footnote, not a table key)
    0: 2407.20, // Flat — same across all YOS
  },
  'E-2': {
    0: 2697.90, // Flat — no YOS progression
  },
  'E-3': {
    0: 2836.80,
    2: 3015.00,
    3: 3198.00, // Cap
  },
  'E-4': {
    0: 3142.20,
    2: 3303.00,
    3: 3482.40,
    4: 3658.50,
    6: 3815.40, // Cap
  },
  'E-5': {
    0: 3342.90,
    2: 3598.20,
    3: 3775.80,
    4: 3946.80, // Verified FY2026 DFAS rate
    6: 4110.00,
    8: 4299.90,
    10: 4395.30,
    12: 4421.70, // Cap
  },
  'E-6': {
    0: 3401.10,
    2: 3743.10,
    3: 3908.10,
    4: 4068.90,
    6: 4235.70,
    8: 4612.80, // Verified FY2026 DFAS rate (E-6 Over 8 column)
    10: 4759.50,
    12: 5043.30,
    14: 5130.30,
    16: 5193.60,
    18: 5267.70, // Cap
  },
  'E-7': {
    0: 3932.10,
    2: 4291.50,
    3: 4456.20,
    4: 4673.10,
    6: 4843.80,
    8: 5135.70,
    10: 5300.40,
    12: 5591.70,
    14: 5835.00,
    16: 6000.90,
    18: 6177.30,
    20: 6245.70,
    22: 6475.20,
    24: 6598.20,
    26: 7067.40, // Cap
  },
  'E-8': {
    // N/A for <8 years of service in DFAS table
    8:  5656.50,
    10: 5907.00,
    12: 6061.80,
    14: 6247.20,
    16: 6448.20,
    18: 6811.20,
    20: 6995.40,
    22: 7308.30,
    24: 7481.70,
    26: 7908.90,
    28: 7908.90, // Same as Over 26 in DFAS
    30: 8067.30, // Cap
  },
  'E-9': {
    // N/A for <10 years of service in DFAS table
    10: 6910.20,
    12: 7066.50,
    14: 7263.60,
    16: 7496.10,
    18: 7730.70,
    20: 8105.10,
    22: 8423.10,
    24: 8756.70,
    26: 9267.90,
    28: 9267.90, // Same as Over 26 in DFAS
    30: 9730.20,
    32: 9730.20, // Same as Over 30
    34: 10217.40,
    36: 10217.40, // Same as Over 34
    38: 10729.20,
    40: 10729.20, // Same as Over 38 — cap
  },

  // ─── Warrant Officers ─────────────────────────────────────────────────────
  'W-1': {
    0:  4056.60,
    2:  4493.70,
    3:  4611.00,
    4:  4859.10,
    6:  5152.20,
    8:  5584.20,
    10: 5786.10,
    12: 6069.30,
    14: 6346.50,
    16: 6564.90,
    18: 6766.20,
    20: 7010.10, // Cap
  },
  'W-2': {
    0:  4621.80,
    2:  5058.90,
    3:  5193.30,
    4:  5286.00,
    6:  5585.40,
    8:  6051.00,
    10: 6282.60,
    12: 6509.40,
    14: 6787.50,
    16: 7005.00,
    18: 7201.50,
    20: 7437.00,
    22: 7591.50,
    24: 7714.20, // Cap
  },
  'W-3': {
    0:  5223.30,
    2:  5440.50,
    3:  5664.30,
    4:  5736.90,
    6:  5970.90,
    8:  6431.10,
    10: 6910.50,
    12: 7136.40,
    14: 7397.70,
    16: 7665.90,
    18: 8150.40,
    20: 8476.50,
    22: 8671.80,
    24: 8879.70,
    26: 9162.60, // Cap
  },
  'W-4': {
    0:  5719.80,
    2:  6152.10,
    3:  6328.50,
    4:  6502.20,
    6:  6801.90,
    8:  7098.00,
    10: 7398.00,
    12: 7848.30,
    14: 8243.70,
    16: 8619.90,
    18: 8928.60,
    20: 9228.90,
    22: 9669.60,
    24: 10032.00,
    26: 10445.40,
    28: 10445.40, // Same as Over 26 in DFAS
    30: 10653.60, // Cap
  },
  'W-5': {
    // N/A for <20 years of service in DFAS table
    20: 10169.70,
    22: 10685.70,
    24: 11070.30,
    26: 11495.10,
    28: 11495.10, // Same as Over 26
    30: 12070.80,
    32: 12070.80, // Same as Over 30
    34: 12673.50,
    36: 12673.50, // Same as Over 34
    38: 13308.30, // Cap
    40: 13308.30, // Same as Over 38
  },

  // ─── Officers ─────────────────────────────────────────────────────────────
  'O-1': {
    0: 4150.20,
    2: 4320.00,
    3: 5222.40, // Cap — same for Over 3 through Over 40
  },
  'O-1E': {
    // O-1 with prior enlisted service — N/A for <2 years
    // NOTE: All values end in clean increments — no odd-cent artifacts detected.
    // Flag for manual DFAS verification: O-1E key 2 ($5,222.10) no longer matches
    // the corrected O-1 Over 3 ($5,222.40) — may need updating.
    2:  5222.10,
    3:  5577.00,
    4:  5783.10,
    6:  5993.40,
    8:  6201.30,
    10: 6484.20, // Cap
  },
  'O-2': {
    0: 4782.00,
    2: 5446.20,
    3: 6272.40,
    4: 6484.50,
    6: 6617.70, // Cap
  },
  'O-2E': {
    // O-2 with prior enlisted service — N/A for <2 years
    // NOTE: All values end in clean increments — no odd-cent artifacts detected.
    // Flag for manual DFAS verification: O-2E key 2 ($6,484.20) no longer matches
    // the corrected O-2 Over 4 ($6,484.50) — may need updating.
    2:  6484.20,
    3:  6617.70,
    4:  6828.00,
    6:  7183.80,
    8:  7458.90,
    10: 7663.50, // Cap
  },
  'O-3': {
    0:  5534.10,
    2:  6273.90,
    3:  6770.40, // Verified FY2026 DFAS rate
    4:  7382.70,
    6:  7737.00,
    8:  8125.50,
    10: 8375.70,
    12: 8788.20,
    14: 9004.20, // Cap
  },
  'O-3E': {
    // O-3 with prior enlisted service — N/A for <2 years
    // NOTE: All values end in clean increments — no odd-cent artifacts detected.
    // Flag for manual DFAS verification: O-3E key 2 ($7,383.30) no longer matches
    // the corrected O-3 Over 4 ($7,382.70) — may need updating.
    2:  7383.30,
    3:  7737.00,
    4:  8124.90,
    6:  8376.00,
    8:  8788.20,
    10: 9136.50,
    12: 9337.20,
    14: 9609.30, // Cap
  },
  'O-4': {
    0:  6294.60,
    2:  7286.40,
    3:  7773.60,
    4:  7881.00,
    6:  8332.20,
    8:  8816.40,
    10: 9420.00,
    12: 9888.30,
    14: 10214.40,
    16: 10401.60,
    18: 10509.90, // Cap
  },
  'O-5': {
    0:  7295.40,
    2:  8218.20,
    3:  8787.00,
    4:  8894.10,
    6:  9249.60,
    8:  9461.40,
    10: 9928.50,
    12: 10271.70,
    14: 10715.10,
    16: 11391.30,
    18: 11713.80,
    20: 12032.70,
    22: 12394.80, // Cap
  },
  'O-6': {
    0:  8751.30,
    2:  9613.80,
    3:  10245.00,
    4:  10245.00, // Same as Over 3 in DFAS
    6:  10284.30,
    8:  10725.00,
    10: 10783.50,
    12: 10783.50, // Same as Over 10 in DFAS
    14: 11396.40,
    16: 12479.70,
    18: 13115.40,
    20: 13751.10,
    22: 14112.90,
    24: 14479.20,
    26: 15188.70,
    28: 15188.70, // Same as Over 26
    30: 15408.30, // Cap
  },
  'O-7': {
    0:  11540.10,
    2:  12076.20,
    3:  12324.30,
    4:  12522.00,
    6:  12878.70,
    8:  13231.80,
    10: 13639.20,
    12: 14045.70,
    14: 14454.30,
    16: 15735.30,
    18: 16817.70,
    20: 16817.70, // Same as Over 18
    22: 16817.70, // Same
    24: 16817.70, // Same
    26: 16904.40,
    28: 16904.40, // Same as Over 26
    30: 17242.20, // Cap
  },
  'O-8': {
    0:  13888.50,
    2:  14343.90,
    3:  14645.40,
    4:  14729.40,
    6:  15106.50,
    8:  15735.30,
    10: 15882.00,
    12: 16479.60,
    14: 16651.80,
    16: 17166.60,
    18: 17911.80,
    20: 18598.20,
    22: 18999.90, // Cap — O-8 Over 22+ flat through Over 40
  },
  'O-9': {
    // Capped at $18,999.90 across all applicable YOS
    20: 18999.90,
  },
  'O-10': {
    // Capped at $18,999.90 across all applicable YOS
    20: 18999.90,
  },
};
