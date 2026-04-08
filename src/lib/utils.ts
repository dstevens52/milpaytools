/**
 * Shared formatting and math utilities.
 * All functions are pure — no React, no side effects.
 */

// ─── Currency ──────────────────────────────────────────────────────────────

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdFormatterCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, showCents = false): string {
  return showCents ? usdFormatterCents.format(amount) : usdFormatter.format(amount);
}

export function formatMonthlyAnnual(monthly: number): string {
  return `${formatCurrency(monthly)}/mo (${formatCurrency(monthly * 12)}/yr)`;
}

// ─── Percentage ────────────────────────────────────────────────────────────

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── Rounding ──────────────────────────────────────────────────────────────

/** Round to nearest N (e.g. round to nearest 10 for VA ratings) */
export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

/** Round down to nearest N */
export function floorToNearest(value: number, nearest: number): number {
  return Math.floor(value / nearest) * nearest;
}

// ─── ZIP Code ──────────────────────────────────────────────────────────────

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function normalizeZip(zip: string): string {
  return zip.replace(/\D/g, '').slice(0, 5);
}

// ─── Years of Service ──────────────────────────────────────────────────────

/**
 * Given actual years of service, return the DoD pay table YOS bracket key.
 *
 * DFAS columns are labeled "2 or less", "Over 2", "Over 3", "Over 4", "Over 6", etc.
 * "Over N" means the member has COMPLETED more than N years — i.e., YOS > N.
 * Therefore a member with exactly 6 years falls in "Over 4" (YOS > 4), NOT "Over 6".
 * "Over 6" requires YOS > 6 (i.e., 7+ years).
 */
export function getYOSBracket(yearsOfService: number): number {
  const breakpoints = [40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 0];
  return breakpoints.find((bp) => yearsOfService > bp) ?? 0;
}

// ─── Federal Tax Estimation ────────────────────────────────────────────────

import { FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';

/**
 * Rough marginal tax rate estimate for a given annual taxable income.
 * Used to show the tax-advantage value of BAH/BAS.
 */
export function estimateMarginalRate(annualTaxableIncome: number): number {
  const taxable = Math.max(0, annualTaxableIncome - STANDARD_DEDUCTION_SINGLE);
  let prior = 0;
  for (const bracket of FED_TAX_BRACKETS_SINGLE) {
    if (taxable <= bracket.upTo) return bracket.rate;
    prior = bracket.upTo;
  }
  return 0.37;
}

export function estimateTaxAdvantage(
  annualBasePay: number,
  annualBAH: number,
  annualBAS: number
): number {
  const taxable = annualBasePay;
  const marginalRate = estimateMarginalRate(taxable);
  // BAH and BAS are excluded from federal income tax
  return (annualBAH + annualBAS) * marginalRate;
}

// ─── TSP Projection ────────────────────────────────────────────────────────

export function projectTSPBalance(
  currentBalance: number,
  monthlyContribution: number,
  annualReturnPct: number,
  years: number
): number {
  const monthlyRate = annualReturnPct / 100 / 12;
  const months = years * 12;
  // Future value of existing balance
  const fvBalance = currentBalance * Math.pow(1 + monthlyRate, months);
  // Future value of monthly contributions (annuity)
  const fvContributions =
    monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return fvBalance + fvContributions;
}
