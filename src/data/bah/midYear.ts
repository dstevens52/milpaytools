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
}

export type BahMidYearChanges = Readonly<Record<string, BahMidYearChange>>;

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
