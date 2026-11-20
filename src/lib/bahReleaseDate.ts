/**
 * The date DoD released a BAH year's rates, for data dates (sitemap <lastmod>).
 *
 * Normally the year's row in releaseHistory.ts. If DoD's release states no
 * national average percent, the runbook leaves that row out
 * (docs/RELEASE_DAY_BAH_2027.md, step 3) and the date lives only in
 * BAH_2027_STATUS.releasedDate: fall back to it, so the build doesn't fail on
 * that path (R2 rehearsal, 2026-11-20: /sitemap.xml returned 500 without the row).
 */
import { BAH_RELEASE_HISTORY, type BahRelease } from '@/data/bah/releaseHistory';
import { BAH_2027_STATUS, type Bah2027StatusConfig } from '@/data/bah/2027-status';

export function bahReleasedDateFor(
  year: string,
  history: readonly BahRelease[] = BAH_RELEASE_HISTORY,
  status2027: Bah2027StatusConfig = BAH_2027_STATUS,
): string {
  const row = history.find((r) => r.ratesYear === Number(year));
  if (row) return row.releasedDate;
  if (year === '2027' && status2027.releasedDate) return status2027.releasedDate;
  throw new Error(
    `no BAH release date recorded for ${year}: add its row to src/data/bah/releaseHistory.ts` +
      (year === '2027' ? ", or (if DoD's release states no percent) set BAH_2027_STATUS.releasedDate" : ''),
  );
}
