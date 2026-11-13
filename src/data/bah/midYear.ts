/**
 * Year-agnostic shape + formatting for DTMO mid-year BAH changes. Each year's
 * records live in src/data/bah/{YYYY}/midYearChanges.ts and are registered by
 * year in src/data/bah/registry.ts. Read the current year's change through
 * getBahMidYearChange() in src/lib/calculations/bah.ts.
 */

export interface BahMidYearChange {
  mhaCode: string;
  /** Area name for copy, e.g. "Abilene/Dyess AFB". */
  areaName: string;
  /** ISO effective date of the change. */
  effective: string;
  /** Label as shown in DTMO's BAH year selector. */
  dtmoLabel: string;
  /** Repo path of the official source record. */
  sourceDoc: string;
  /**
   * Set when the change is a temporary increase (e.g. TX270, 2026). Rate
   * protection doesn't apply to temporary increases (DoD 2021, DTMO 2022), so
   * when the next year's rates load, pages say the temporary rates ended instead
   * of showing the rate-protection paragraph. scripts/bah-import.mjs reads
   * `expires` to list these MHAs in their own report section.
   */
  temporary?: {
    /** ISO date the temporary rates expire. */
    expires: string;
    /** DTMO's notice announcing the temporary rates. */
    noticeTitle: string;
    noticeDate: string;
    noticeUrl: string;
  };
}

export type BahMidYearChanges = Readonly<Record<string, BahMidYearChange>>;

/**
 * Pending notice (before the next year's rates load) for a temporary increase.
 * Text approved by Claude Chat, Nov 13, 2026 (docs/sources/bah-2026-abilene-temporary-increase.md).
 */
export function temporaryIncreasePendingText(change: BahMidYearChange): string | null {
  if (!change.temporary) return null;
  const nextYear = Number(change.temporary.expires.slice(0, 4)) + 1;
  return `These temporary rates expire ${formatBahDate(change.temporary.expires)}, and DTMO says ${nextYear} rates may be different. In DoD's 2021 and 2022 temporary increases, DoD said individual rate protection did not apply to the temporary amounts, so don't assume the temporary rate continues into ${nextYear}.`;
}

/**
 * Replaces the rate-protection decrease paragraph once the next year's rates
 * load, for an MHA whose prior-year rates were a temporary increase.
 */
export function temporaryIncreaseEndingText(change: BahMidYearChange, year: string): string | null {
  if (!change.temporary) return null;
  const priorYear = change.temporary.expires.slice(0, 4);
  return `The temporary ${priorYear} rates for ${change.areaName} (effective ${formatBahDate(change.effective)}) expire ${formatBahDate(change.temporary.expires)}. DoD has said rate protection doesn't apply to temporary increases, so the ${year} rate replaces them for pay grades where it's lower.`;
}

/** "May 16, 2026" from an ISO date, without timezone drift. */
export function formatBahDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
