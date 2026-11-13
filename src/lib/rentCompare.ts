/**
 * Neutral, factual one-liner locating a BAH amount within an area's 2-bedroom
 * HUD Fair Market Rent p25–p75 range. Comparison only — no surplus/"you keep"
 * framing, no advice. Pure (imports only formatCurrency, never the FMR dataset),
 * so the server template and the client station component share identical wording
 * with zero data-leak risk to the client bundle.
 */

import { formatCurrency } from '@/lib/utils';
import { BAH_YEAR } from '@/data/bah/current';

export interface FmrRangeLite {
  p25: number;
  median: number;
  p75: number;
}

export function bahVsRentClause(bah: number, fmr: FmrRangeLite, gradeLabel: string, year: string = BAH_YEAR): string {
  const b = formatCurrency(bah);
  if (bah >= fmr.p75) {
    return `The ${year} BAH for ${gradeLabel} (${b}) is above the area's 75th-percentile 2-bedroom rent — it covers a 2-bedroom across most of this area.`;
  }
  if (bah >= fmr.p25) {
    return `BAH for ${gradeLabel} (${b}) falls within the area's 2-bedroom rent range — it covers a 2-bedroom in lower-cost ZIPs, while pricier ZIPs run higher.`;
  }
  return `Across most of this area, 2-bedroom rent runs above the ${year} BAH for ${gradeLabel} (${b}); options nearer the lower end of the range may fit within it.`;
}
