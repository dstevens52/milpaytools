/**
 * Base-pay lookup — extracted from total-compensation.ts so that pay-table-only
 * consumers (retirement, guard/reserve) don't transitively import the BAH dataset.
 *
 * This module imports ONLY pay-table data (+ a leaf YOS-bracket util). It must
 * never import bah.ts or any BAH dataset, so calculators that need pay math
 * without BAH stay off the ~166KB BAH client chunk.
 *
 * Pure functions — no React, no side effects.
 */

import { payTable } from '@/data/pay-tables/2026';
import { getYOSBracket } from '@/lib/utils';

/**
 * Look up monthly basic pay for a grade + YOS combination.
 * Returns 0 if data is missing.
 */
export function lookupBasePay(payGrade: string, yearsOfService: number): number {
  const gradeTable = payTable[payGrade as keyof typeof payTable];
  if (!gradeTable) return 0;

  const yosBracket = getYOSBracket(yearsOfService);
  // Walk down from the actual bracket to find the nearest available entry
  const breakpoints = [40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 0];
  for (const bp of breakpoints) {
    if (bp <= yosBracket && gradeTable[bp as keyof typeof gradeTable] !== undefined) {
      return gradeTable[bp as keyof typeof gradeTable] as number;
    }
  }
  return (gradeTable[0] as number) ?? 0;
}
