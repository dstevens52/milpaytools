/**
 * /pay/[rank] <title> text. Pure functions so the title-year modes can be
 * tested with fixtures (tests/e2e/pay-raise-2027.spec.ts).
 */
import { formatCurrency } from '@/lib/utils';
import { PAY_RAISE_2027, type PayRaiseConfig } from '@/data/pay-raise/2027';
import { RANK_TITLE_YEARS, type RankTitleYears } from '@/data/pay-pages/titleMode';
import type { PayTable } from '@/data/types';
import type { PayGrade } from '@/types/military';

/** "$3,343–$4,422", or "$2,407" for a flat grade. Shared by the title and the branch FAQ. */
export function payRange(minPay: number, maxPay: number): string {
  return minPay === maxPay ? formatCurrency(minPay) : `${formatCurrency(minPay)}–${formatCurrency(maxPay)}`;
}

/** First and last published rate for a grade (same logic as the rank page's resolveFigures). */
export function gradeMinMax(table: PayTable, grade: PayGrade): [number, number] {
  const entry = table[grade] as Record<number, number | undefined>;
  const keys = Object.keys(entry)
    .map(Number)
    .filter((k) => entry[k] !== undefined)
    .sort((a, b) => a - b);
  return [entry[keys[0]] as number, entry[keys[keys.length - 1]] as number];
}

function withBranches(base: string): string {
  const full = `${base}, All Branches`;
  return full.length <= 60 ? full : base;
}

/**
 * The page title. minPay/maxPay are the 2026 range (the page's figures).
 * Mode '2027' reads the range from the DFAS 2027 table and throws until it exists.
 */
export function rankTitle(
  rank: { title: string; grade: PayGrade },
  minPay: number,
  maxPay: number,
  mode: RankTitleYears = RANK_TITLE_YEARS,
  config: PayRaiseConfig = PAY_RAISE_2027,
): string {
  if (mode === '2027') {
    if (config.status !== 'official-table' || !config.officialTable) {
      throw new Error('rankTitle: not ready: needs the DFAS 2027 table');
    }
    const [mn, mx] = gradeMinMax(config.officialTable, rank.grade);
    return withBranches(`${rank.title} Pay 2027: ${payRange(mn, mx)}/Month`);
  }
  const years = mode === '2026-2027' ? '2026 & 2027' : '2026';
  return withBranches(`${rank.title} Pay ${years}: ${payRange(minPay, maxPay)}/Month`);
}
