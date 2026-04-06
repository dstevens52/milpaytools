/**
 * FY2026 Basic Allowance for Housing (BAH) Rates (monthly, tax-free)
 *
 * Source: https://www.defensetravel.dod.mil/site/bahCalc.cfm
 * Full dataset: https://www.defensetravel.dod.mil/Docs/perdiem/download/BAH-Primer.pdf
 *
 * NOTE: This file contains a representative sample of major military
 * installations. The full BAH dataset contains thousands of ZIP codes.
 * Import the complete DoD BAH rate data to replace this stub.
 *
 * TODO: Replace this sample with full FY2026 DoD BAH rate export.
 *
 * ZIP codes are 5-digit strings (preserving leading zeros).
 * Rates are monthly dollar amounts.
 */

import type { BAHTable } from '@/data/types';

export const DATA_YEAR = '2026';

export const bahTable: BAHTable = {
  // ─── Washington D.C. Metro ─────────────────────────────────────────────
  '20001': {
    mhaName: 'Washington DC',
    mhaCode: 'DC-DC001',
    rates: {
      'E-1': { withDependents: 2268, withoutDependents: 1872 },
      'E-2': { withDependents: 2268, withoutDependents: 1872 },
      'E-3': { withDependents: 2268, withoutDependents: 1872 },
      'E-4': { withDependents: 2268, withoutDependents: 1872 },
      'E-5': { withDependents: 2826, withoutDependents: 2340 },
      'E-6': { withDependents: 2826, withoutDependents: 2340 },
      'E-7': { withDependents: 3294, withoutDependents: 2826 },
      'E-8': { withDependents: 3294, withoutDependents: 2826 },
      'E-9': { withDependents: 3654, withoutDependents: 3114 },
      'W-1': { withDependents: 2916, withoutDependents: 2484 },
      'W-2': { withDependents: 3294, withoutDependents: 2826 },
      'W-3': { withDependents: 3564, withoutDependents: 3042 },
      'W-4': { withDependents: 3654, withoutDependents: 3114 },
      'W-5': { withDependents: 3744, withoutDependents: 3204 },
      'O-1': { withDependents: 2916, withoutDependents: 2484 },
      'O-2': { withDependents: 3204, withoutDependents: 2736 },
      'O-3': { withDependents: 3564, withoutDependents: 3042 },
      'O-4': { withDependents: 3744, withoutDependents: 3204 },
      'O-5': { withDependents: 4104, withoutDependents: 3492 },
      'O-6': { withDependents: 4554, withoutDependents: 3888 },
      'O-7': { withDependents: 4914, withoutDependents: 4194 },
    },
  },
  // ─── San Diego, CA ─────────────────────────────────────────────────────
  '92101': {
    mhaName: 'San Diego CA',
    mhaCode: 'CA-SD001',
    rates: {
      'E-1': { withDependents: 2790, withoutDependents: 2268 },
      'E-2': { withDependents: 2790, withoutDependents: 2268 },
      'E-3': { withDependents: 2790, withoutDependents: 2268 },
      'E-4': { withDependents: 2790, withoutDependents: 2268 },
      'E-5': { withDependents: 3312, withoutDependents: 2700 },
      'E-6': { withDependents: 3312, withoutDependents: 2700 },
      'E-7': { withDependents: 3798, withoutDependents: 3114 },
      'E-8': { withDependents: 3798, withoutDependents: 3114 },
      'E-9': { withDependents: 4284, withoutDependents: 3492 },
      'W-1': { withDependents: 3420, withoutDependents: 2790 },
      'W-2': { withDependents: 3798, withoutDependents: 3114 },
      'W-3': { withDependents: 4014, withoutDependents: 3294 },
      'W-4': { withDependents: 4284, withoutDependents: 3492 },
      'W-5': { withDependents: 4554, withoutDependents: 3744 },
      'O-1': { withDependents: 3420, withoutDependents: 2790 },
      'O-2': { withDependents: 3798, withoutDependents: 3114 },
      'O-3': { withDependents: 4014, withoutDependents: 3294 },
      'O-4': { withDependents: 4554, withoutDependents: 3744 },
      'O-5': { withDependents: 4860, withoutDependents: 4014 },
      'O-6': { withDependents: 5238, withoutDependents: 4338 },
      'O-7': { withDependents: 5580, withoutDependents: 4626 },
    },
  },
  // ─── Joint Base Lewis-McChord, WA ──────────────────────────────────────
  '98433': {
    mhaName: 'Tacoma WA',
    mhaCode: 'WA-TA001',
    rates: {
      'E-1': { withDependents: 1980, withoutDependents: 1638 },
      'E-4': { withDependents: 1980, withoutDependents: 1638 },
      'E-5': { withDependents: 2412, withoutDependents: 2016 },
      'E-7': { withDependents: 2790, withoutDependents: 2340 },
      'O-1': { withDependents: 2430, withoutDependents: 2016 },
      'O-3': { withDependents: 2916, withoutDependents: 2430 },
      'O-5': { withDependents: 3456, withoutDependents: 2916 },
      'O-6': { withDependents: 3906, withoutDependents: 3312 },
    },
  },
  // ─── Fort Liberty (Bragg), NC ─────────────────────────────────────────
  '28307': {
    mhaName: 'Fayetteville NC',
    mhaCode: 'NC-FA001',
    rates: {
      'E-1': { withDependents: 1314, withoutDependents: 1044 },
      'E-4': { withDependents: 1314, withoutDependents: 1044 },
      'E-5': { withDependents: 1530, withoutDependents: 1224 },
      'E-7': { withDependents: 1872, withoutDependents: 1530 },
      'O-1': { withDependents: 1584, withoutDependents: 1278 },
      'O-3': { withDependents: 1872, withoutDependents: 1530 },
      'O-5': { withDependents: 2178, withoutDependents: 1782 },
      'O-6': { withDependents: 2430, withoutDependents: 2016 },
    },
  },
  // ─── Honolulu / Pearl Harbor, HI ──────────────────────────────────────
  '96860': {
    mhaName: 'Honolulu HI',
    mhaCode: 'HI-HO001',
    rates: {
      'E-1': { withDependents: 3078, withoutDependents: 2538 },
      'E-4': { withDependents: 3078, withoutDependents: 2538 },
      'E-5': { withDependents: 3726, withoutDependents: 3060 },
      'E-7': { withDependents: 4446, withoutDependents: 3672 },
      'O-1': { withDependents: 3834, withoutDependents: 3168 },
      'O-3': { withDependents: 4554, withoutDependents: 3762 },
      'O-5': { withDependents: 5346, withoutDependents: 4428 },
      'O-6': { withDependents: 5994, withoutDependents: 4968 },
    },
  },
  // ─── Colorado Springs / Fort Carson, CO ───────────────────────────────
  '80913': {
    mhaName: 'Colorado Springs CO',
    mhaCode: 'CO-CS001',
    rates: {
      'E-1': { withDependents: 1620, withoutDependents: 1332 },
      'E-4': { withDependents: 1620, withoutDependents: 1332 },
      'E-5': { withDependents: 1980, withoutDependents: 1638 },
      'E-7': { withDependents: 2412, withoutDependents: 2016 },
      'O-1': { withDependents: 2034, withoutDependents: 1692 },
      'O-3': { withDependents: 2448, withoutDependents: 2034 },
      'O-5': { withDependents: 2844, withoutDependents: 2376 },
      'O-6': { withDependents: 3168, withoutDependents: 2664 },
    },
  },
  // ─── Norfolk / Naval Station Norfolk, VA ─────────────────────────────
  '23511': {
    mhaName: 'Norfolk VA',
    mhaCode: 'VA-NO001',
    rates: {
      'E-1': { withDependents: 1512, withoutDependents: 1242 },
      'E-4': { withDependents: 1512, withoutDependents: 1242 },
      'E-5': { withDependents: 1872, withoutDependents: 1548 },
      'E-7': { withDependents: 2250, withoutDependents: 1872 },
      'O-1': { withDependents: 1944, withoutDependents: 1620 },
      'O-3': { withDependents: 2322, withoutDependents: 1944 },
      'O-5': { withDependents: 2664, withoutDependents: 2232 },
      'O-6': { withDependents: 2988, withoutDependents: 2502 },
    },
  },
};
