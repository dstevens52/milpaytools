/**
 * Shared federal income tax estimate — one bracket walk for every calculator that
 * offers a filing status (transition readiness, deployment).
 *
 * Brackets and standard deductions: src/data/constants.ts (IRS Rev. Proc. 2025-32,
 * 2026 inflation adjustments). Pure functions, no React, safe for client bundles.
 */

import type { FilingStatus } from '@/types/calculator';
import {
  FED_TAX_BRACKETS_SINGLE,
  STANDARD_DEDUCTION_SINGLE,
  FED_TAX_BRACKETS_MFJ,
  STANDARD_DEDUCTION_MFJ,
  FED_TAX_BRACKETS_HOH,
  STANDARD_DEDUCTION_HOH,
} from '@/data/constants';

export type { FilingStatus };

const FEDERAL_TAX_TABLES: Record<FilingStatus, { brackets: readonly { upTo: number; rate: number }[]; deduction: number }> = {
  single: { brackets: FED_TAX_BRACKETS_SINGLE, deduction: STANDARD_DEDUCTION_SINGLE },
  mfj: { brackets: FED_TAX_BRACKETS_MFJ, deduction: STANDARD_DEDUCTION_MFJ },
  hoh: { brackets: FED_TAX_BRACKETS_HOH, deduction: STANDARD_DEDUCTION_HOH },
};

export const FILING_STATUS_LABEL: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married filing jointly',
  hoh: 'Head of household',
};

export const FILING_STATUSES: readonly FilingStatus[] = ['single', 'mfj', 'hoh'];

export function isFilingStatus(raw: unknown): raw is FilingStatus {
  return raw === 'single' || raw === 'mfj' || raw === 'hoh';
}

/** Annual federal income tax on `annualIncome` (gross income subject to tax, before the standard deduction). */
export function estimateAnnualFederalTax(annualIncome: number, filingStatus: FilingStatus): number {
  const { brackets, deduction } = FEDERAL_TAX_TABLES[filingStatus];
  const taxable = Math.max(0, annualIncome - deduction);
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (taxable <= bracket.upTo) {
      tax += (taxable - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return tax;
}
