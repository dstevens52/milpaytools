// OCONUS station pilot gating — shared by the server page (src/app/bah/[slug]/page.tsx)
// and the client template (StationPageClient.tsx) so there's a single source of truth.
//
// The OCONUS hero + below-the-fold treatment is built to key off `station.oconus`,
// but activation is gated to this slug allowlist for the pilot. To roll out to all
// OCONUS stations, drop OCONUS_HERO_SLUGS and gate on `station.oconus` directly,
// then add each station's verified DoD locality code below.
export const OCONUS_HERO_SLUGS = new Set<string>([
  'ramstein-air-base',
  'yokota-air-base',
  'kadena-air-base',
  'camp-humphreys',
]);

// Verified DoD locality codes, keyed by slug. Only add a station once its code is
// confirmed — absence renders no locality clause (never guess a code).
export const OCONUS_LOCALITY_CODE: Record<string, string> = {
  'ramstein-air-base': 'DE700',
};
