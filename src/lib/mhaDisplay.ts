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
