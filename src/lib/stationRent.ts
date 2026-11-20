/**
 * Station pages' "BAH vs. local rent": the HUD 2-bedroom FMR that pairs with the
 * BAH year the page shows (src/lib/calculations/fmr.ts), and the FAQ answer built
 * from it. Server/build only (reads the FMR dataset).
 *
 * Takes the page's BahYearConfig so tests can check the release-day state (2027
 * BAH → FY2027 rents and label) without flipping the site.
 */

import { getPairedFMR, type PairedFmr } from '@/lib/calculations/fmr';
import { bahE5RateLead, CURRENT_BAH_CONFIG, type BahYearConfig } from '@/lib/calculations/bahTransition';
import { bahVsRentClause, hudFmrSourceLabel } from '@/lib/rentCompare';
import { formatCurrency } from '@/lib/utils';

/** 2-bedroom FMR for the station's MHA, paired with the BAH year shown (null = OCONUS / no coverage). */
export function stationRent(mhaCode: string | null | undefined, cfg: BahYearConfig = CURRENT_BAH_CONFIG): PairedFmr | null {
  return mhaCode ? getPairedFMR(mhaCode, cfg.year, 2) : null;
}

/** FAQ answer for "How does BAH at {station} compare with local rent?" (E-5 with dependents). */
export function stationRentFaqAnswer(
  cfg: BahYearConfig,
  stationName: string,
  mhaLabel: string,
  e5W: number,
  rent: PairedFmr,
): string {
  const r = rent.range;
  return `${bahE5RateLead(cfg, stationName)} ${formatCurrency(e5W)}/month in BAH. Across the ${mhaLabel} area, ${hudFmrSourceLabel(rent.fmrYear)} runs about ${formatCurrency(r.p25)}–${formatCurrency(r.p75)} (median ${formatCurrency(r.median)}). ${bahVsRentClause(e5W, r, 'an E-5 with dependents', cfg.year)} BAH is designed to cover about 95% of typical local housing costs — rent plus utilities — for a member's pay grade and dependency status.`;
}
