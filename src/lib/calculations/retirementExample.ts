/**
 * Worked retirement examples for guides and blog posts (C1, FIX_QUEUE row 6).
 *
 * Every figure is computed with the retirement calculator's own functions
 * (./retirement: calculateHigh3Average, calculatePension, calculateLifetimeValue)
 * from the DFAS pay table, so content can't drift from the calculator. Server
 * only: content renders on the server (MDX / guide pages).
 *
 * Convention, same as the calculator: today's pay table, the retirement grade for
 * all 36 months, retiring at exactly the given years of service.
 */

import {
  calculateHigh3Average,
  calculatePension,
  calculateLifetimeValue,
  ANNUAL_COLA_PCT,
} from '@/lib/calculations/retirement';
import { lookupBasePay } from '@/lib/calculations/basePay';
import { LEGACY_RETIREMENT_MULTIPLIER } from '@/data/constants';
import { DATA_YEAR as PAY_TABLE_YEAR } from '@/data/pay-tables/2026';
import { vaRates as VA_RATES_2026 } from '@/data/va-rates/2026';

const COLA = ANNUAL_COLA_PCT / 100;

export interface RetirementExample {
  grade: string;
  yos: number;
  payTableYear: string;
  /** High-3 average: the last 36 months ÷ 36. */
  high3Average: number;
  /** Months grouped by pay-table column, e.g. 12 × "Over 16", 24 × "Over 18". */
  breakdown: { column: string; months: number; monthlyPay: number }[];
  /** Basic pay in the final year of service (the column for yos − 1 completed years). */
  finalYearMonthlyPay: number;
  high3Pension: number;
  brsPension: number;
  /** One more year under High-3: 2.5% × High-3 average a month. */
  high3PerExtraYear: number;
  colaPct: number;
}

export function retirementExample(grade = 'E-7', yos = 20): RetirementExample {
  const { average, breakdown } = calculateHigh3Average(grade, yos, 0);
  return {
    grade,
    yos,
    payTableYear: PAY_TABLE_YEAR,
    high3Average: average,
    breakdown: breakdown.map((b) => ({ column: b.column, months: b.months, monthlyPay: b.monthlyPay })),
    finalYearMonthlyPay: lookupBasePay(grade, yos - 1),
    high3Pension: calculatePension('high3', yos, average),
    brsPension: calculatePension('brs', yos, average),
    high3PerExtraYear: LEGACY_RETIREMENT_MULTIPLIER * average,
    colaPct: ANNUAL_COLA_PCT,
  };
}

/** Annual pension in collection year n (year 1 = the first year), at the calculator's average COLA. */
export function annualInYear(monthlyPension: number, year: number): number {
  return monthlyPension * 12 * Math.pow(1 + COLA, year - 1);
}

/** Nominal lifetime total over `years` of collection (the calculator's calculateLifetimeValue). */
export function lifetimeNominal(monthlyPension: number, years: number): number {
  return calculateLifetimeValue(monthlyPension, years, COLA);
}

/**
 * CRDP vs CRSC worked example (crdp-vs-crsc post): a retiree whose retired pay
 * would be reduced by their full VA compensation, at 2026 VA rates (the post
 * says "2026 rates"; it reads the 2026 table, not the year registry).
 */
export function crdpCrscExample(monthlyPension: number, vaRating = 70, combatRating = 40) {
  const va = VA_RATES_2026[vaRating as keyof typeof VA_RATES_2026].veteranAlone;
  const vaCombat = VA_RATES_2026[combatRating as keyof typeof VA_RATES_2026].veteranAlone;
  const pension = cents(monthlyPension);
  const netAfterOffset = cents(pension - va);
  const gross = cents(pension + va);
  const grossFull = cents(netAfterOffset + va + va);
  const grossPartial = cents(netAfterOffset + va + vaCombat);
  // Tax is rounded to cents first and the net is gross minus that tax, so every
  // table column adds up to the cent.
  const tax = (rate: number) => ({ crdp: cents(rate * pension), crsc: cents(rate * netAfterOffset) });
  const net = (rate: number) => {
    const t = tax(rate);
    return {
      crdp: cents(gross - t.crdp),
      crscFull: cents(grossFull - t.crsc),
      crscPartial: cents(grossPartial - t.crsc),
    };
  };
  return { va, vaCombat, netAfterOffset, gross, grossFull, grossPartial, tax, net };
}

/** Round to cents, guarding against binary float (673.035 → 673.04, not 673.03). */
export function cents(n: number): number {
  return Math.round(n * 100 + 1e-7) / 100;
}
