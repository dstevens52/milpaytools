/**
 * Station page "Total monthly pay by rank" rows (Build 04b): basic pay range +
 * the station's BAH + BAS, per pay grade, for both dependency statuses.
 *
 * Server/build only: it reads the full pay table. The station page computes the
 * rows here and passes them to the client as small resolved props (24 rows), so
 * the pay table never ships to the browser.
 *
 * Every figure comes from data:
 * - basic pay: `payTable` (DFAS), lowest to highest of the grade's PUBLISHED
 *   years-of-service columns. The table holds only published columns (E-8 starts
 *   at Over 8, W-5 at Over 20, …), so no column is assumed. No "typical years of
 *   service" anywhere.
 * - BAS: `BAS_RATES` (enlisted for E-grades, officer for W- and O-grades, the
 *   same rule as the total compensation calculator).
 * - BAH: the station's MHA rates, passed in by the caller.
 *
 * Pure functions. No React, no BAH dataset import.
 */

import { payTable, DATA_YEAR as PAY_TABLE_YEAR, E1_UNDER_4_MONTHS } from '@/data/pay-tables/2026';
import { BAS_RATES } from '@/data/constants';
import { combinedPayBahYear, pendingBahYear } from '@/lib/combinedPayYear';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  type PayGrade,
} from '@/types/military';

/** The station rate table's 24 grades, in its order. O-8 and above are not shown. */
export const STATION_TOTAL_PAY_GRADES: readonly PayGrade[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...PRIOR_ENLISTED_OFFICER_GRADES,
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7',
];

/** One dependency status: BAH and the total range (basic min/max + BAH + BAS). */
export interface StationTotalPayDep {
  bah: number;
  /** null when the grade has no published basic pay. */
  totalMin: number | null;
  totalMax: number | null;
}

export interface StationTotalPayRow {
  grade: PayGrade;
  /** Lowest / highest published monthly basic pay; null when none is published. */
  basicMin: number | null;
  basicMax: number | null;
  bas: number;
  /** null when the station has no BAH for this grade and status. */
  w: StationTotalPayDep | null;
  wo: StationTotalPayDep | null;
}

export interface StationTotalPayData {
  rows: StationTotalPayRow[];
  /**
   * The one year every figure in the section belongs to: the basic pay table's
   * year (BAS follows it), with that same year's BAH. Never mixed.
   */
  payYear: string;
  /**
   * A newer BAH year that is already loaded while its pay table isn't (BAH
   * release day to the January pay flip), or null. The section stays on
   * `payYear` and says when the newer totals appear.
   */
  pendingYear: string | null;
  /** DFAS footnote rate for an E-1 with less than 4 months of service. */
  e1Under4Months: number;
  /** Grades whose first published column is above "2 or less" (e.g. E-8 starts at Over 8). */
  lateStartGrades: PayGrade[];
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Published basic pay values for a grade (empty when none). */
export function publishedBasicPay(grade: PayGrade): number[] {
  const t = (payTable as Record<string, Record<string, number> | undefined>)[grade];
  if (!t) return [];
  return Object.values(t).filter((v): v is number => typeof v === 'number' && v > 0);
}

export function basForGrade(grade: PayGrade): number {
  return (ENLISTED_GRADES as readonly string[]).includes(grade) ? BAS_RATES.enlisted : BAS_RATES.officer;
}

function depTotals(bah: number | undefined, min: number | null, max: number | null, bas: number): StationTotalPayDep | null {
  if (bah === undefined || !(bah > 0)) return null;
  return {
    bah,
    totalMin: min === null ? null : cents(min + bah + bas),
    totalMax: max === null ? null : cents(max + bah + bas),
  };
}

/** The 24 rows for one station, from its with/without-dependents BAH rates. */
export function stationTotalPay(
  ratesW: Record<string, number>,
  ratesWO: Record<string, number>,
): StationTotalPayData {
  const rows = STATION_TOTAL_PAY_GRADES.map((grade): StationTotalPayRow => {
    const pay = publishedBasicPay(grade);
    const basicMin = pay.length ? Math.min(...pay) : null;
    const basicMax = pay.length ? Math.max(...pay) : null;
    const bas = basForGrade(grade);
    return {
      grade,
      basicMin,
      basicMax,
      bas,
      w: depTotals(ratesW[grade], basicMin, basicMax, bas),
      wo: depTotals(ratesWO[grade], basicMin, basicMax, bas),
    };
  });

  const lateStartGrades = STATION_TOTAL_PAY_GRADES.filter((grade) => {
    const t = (payTable as Record<string, Record<string, number> | undefined>)[grade];
    if (!t) return false;
    const keys = Object.keys(t).map(Number);
    return keys.length > 0 && Math.min(...keys) > 0;
  });

  return { rows, payYear: PAY_TABLE_YEAR, pendingYear: null, e1Under4Months: E1_UNDER_4_MONTHS, lateStartGrades };
}

/** With/without-dependents BAH for one MHA in one year, or null when that year isn't loaded. */
export type BahRatesForYear = (year: string) => { w: Record<string, number>; wo: Record<string, number> } | null;

/**
 * The section for one station, never mixing years. Its year is the pay table's
 * year, with BAH for that same year (from the registry, via `ratesForYear`):
 * - BAH year = pay year: both current.
 * - BAH year newer (2027 BAH loaded, 2027 pay table not yet): stays on the pay
 *   year's BAH and sets `pendingYear` to the newer year.
 * - No BAH loaded for the pay year: null (the section is not shown).
 * When both newer tables are loaded, it switches to the newer year by itself.
 */
export function stationTotalPayForYears(
  ratesForYear: BahRatesForYear,
  bahYear: string,
  payYear: string = PAY_TABLE_YEAR,
): StationTotalPayData | null {
  if (payYear !== PAY_TABLE_YEAR) throw new Error(`stationTotalPay: pay table ${PAY_TABLE_YEAR} is loaded, not ${payYear}`);
  // The one-year rule, shared with every calculator that adds pay to BAH.
  const years = { payYear, bahYear };
  const rates = ratesForYear(combinedPayBahYear(years));
  if (!rates) return null;
  const data = stationTotalPay(rates.w, rates.wo);
  return { ...data, pendingYear: pendingBahYear(years) };
}
