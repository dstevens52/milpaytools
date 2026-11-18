/**
 * Display casing for DTMO Military Housing Area names.
 *
 * The DTMO names file title-cases abbreviations ("Davis-Monthan Afb, AZ",
 * "Jb Mcguire-Dix-Lakehurst, NJ"). This fixes them for DISPLAY ONLY. Never use
 * the result as a key, a lookup input or in a string comparison: the stored
 * names (src/data/bah/<year>/mhaNames.ts), getLocationName(), the
 * /api/bah/lookup response and every lookup stay exactly as DTMO publishes
 * them (tests/e2e/station-serp-data.spec.ts checks this).
 *
 * Plain module with no data imports, so client components can use it.
 */

/** Installation-type abbreviations DTMO writes in title case. */
const ABBREVIATIONS = /\b(Afb|Sfb|Nas|Jb|Mcas|Mcb|Nws|Mr)\b/g;

/** "Mcguire" → "McGuire". Names already cased correctly ("McChord") don't match. */
const MC_NAME = /\bMc([a-z])/g;

export function formatMhaName(name: string): string {
  return name
    .replace(ABBREVIATIONS, (abbr) => abbr.toUpperCase())
    .replace(MC_NAME, (_m, c: string) => `Mc${c.toUpperCase()}`);
}

/**
 * Display-name overrides for DTMO typos, keyed by MHA code. DISPLAY ONLY, like
 * formatMhaName: the stored name stays exactly as DTMO publishes it.
 *
 * An override applies only while the stored name still equals `dtmoName`, so a
 * corrected DTMO file stops it automatically. tests/e2e/mha-display-override.spec.ts
 * fails once DTMO fixes the name, so the entry gets removed.
 */
export const MHA_DISPLAY_OVERRIDES: Readonly<Record<string, { dtmoName: string; display: string; reason: string }>> = {
  // DTMO's names file (data/sources/dtmo/2026/mhanames26.txt, line 74) lists
  // "GA073;FORT GORDON, AL". Fort Gordon (now Fort Eisenhower) is in Augusta,
  // Georgia, and every GA073 ZIP is a Georgia or South Carolina ZIP, so the "AL"
  // is a DTMO typo. Shown as published on /bah/changes until S8 (2026-11-18).
  GA073: {
    dtmoName: 'Fort Gordon, AL',
    display: 'Fort Gordon, GA',
    reason: 'DTMO typo: state AL for an Augusta, GA housing area (mhanames26.txt line 74)',
  },
};

/**
 * The one way to show an MHA name: the documented override for that code if any,
 * otherwise formatMhaName's casing fixes. Never a key or lookup input.
 */
export function displayMhaName(code: string | null | undefined, name: string): string {
  const override = code ? MHA_DISPLAY_OVERRIDES[code] : undefined;
  if (override && name.toLowerCase() === override.dtmoName.toLowerCase()) return override.display;
  return formatMhaName(name);
}
