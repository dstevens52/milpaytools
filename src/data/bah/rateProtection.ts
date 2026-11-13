/**
 * BAH rate-protection wording: one source for every page that states the rule.
 *
 * Rule (DTMO FAQ, travel.dod.mil "BAH Rate Changes / Rate Protection"): a member
 * is protected at the previous rate if it is higher "as long as he/she does not
 * have a reduction in pay grade or change in dependency status". A promotion does
 * NOT end protection. Temporary increases are not covered (DTMO 2022 notice; DoD
 * 2021). Source record: docs/sources/bah-release-history.md ("Rate protection").
 * Text approved by Claude Chat, Nov 13, 2026. tests/e2e/bah-rate-protection.spec.ts
 * fails if the old wording ("same pay grade", "promotion or demotion", …) returns.
 *
 * Client-safe: no imports (the ZIP and dual-military calculators use it).
 */

/** Station FAQ sentence; the /bah section, dual page and guides adapt it. */
export const RATE_PROTECTION_RULE =
  'Rate protection means a member already receiving BAH at a location keeps the higher prior rate if the published rate falls, as long as they have no reduction in pay grade and no change in dependency status.';

/** Second sentence wherever the rule is explained in full. */
export const RATE_PROTECTION_PROMOTION = "A promotion doesn't end the protection.";

/** Ending of the calculator step (ZIP and dual-military calculators). */
export const RATE_PROTECTION_CALC_TAIL =
  'you keep your current rate as long as you stay at this duty station with no reduction in pay grade and no change in dependency status.';

/** Station-page paragraph where any pay grade decreased year over year. */
export function rateProtectionDecreaseText(stationName: string, year: string, priorYear: string): string {
  return `Some pay grades at ${stationName} decreased for ${year} compared with ${priorYear}. Under individual rate protection, a member already receiving BAH here keeps the higher ${priorYear} rate as long as they don't have a reduction in pay grade or a change in dependency status; a promotion doesn't end the protection. The lower ${year} rate applies to members who arrive here, or whose pay grade is reduced or dependency status changes.`;
}

/** DoD's own wording (2024 BAH release). */
export const DOD_RATE_PROTECTION_QUOTE =
  'No matter what happens to measured housing costs – including the out-of-pocket expense adjustment – an individual member who maintains uninterrupted Basic Allowance for Housing eligibility in a given location will not see his/her Basic Allowance for Housing rate decrease.';
export const DOD_RATE_PROTECTION_QUOTE_SOURCE = {
  label: 'DoD release, December 14, 2023',
  url: 'https://www.myairforcebenefits.us.af.mil/News/DOD-Releases-2024-Basic-Allowance-for-Housing-Rates',
};

/** Temporary increases are not covered by rate protection (DoD 2021, DTMO 2022). */
export const TEMPORARY_INCREASE_EXCEPTION =
  "Rate protection doesn't cover temporary increases: in DoD's 2021 and 2022 temporary increases, DoD said individual rate protection did not apply to the temporary amounts, so when a temporary increase ends, the regular rate replaces it.";
export const TEMPORARY_INCREASE_SOURCES = [
  {
    label: 'DTMO: DoD Authorizes an Automatic Increase to 2022 BAH Rates for Certain Locations',
    url: 'https://www.travel.dod.mil/About/News/Article/Article/3167951/dod-authorizes-an-automatic-increase-to-2022-bah-rates-for-certain-locations',
  },
  {
    label: 'DoD, 2021 temporary BAH increase (33rd Fighter Wing repost)',
    url: 'https://www.33fw.af.mil/News/Article/2792602/',
  },
] as const;
