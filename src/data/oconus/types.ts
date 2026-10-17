// OCONUS station template v2 — data model.
//
// Every location-specific fact is a SourcedFact so the build can refuse to
// publish a station until Dan has verified each one (scripts/lint-oconus.ts).
// v2 pages display no rates and no cost figures — OHA and OCONUS COLA can move
// twice a month with exchange rates, so the template explains how the
// allowances work and links to the official lookups instead.

export type SourcedFact<T = string> = {
  value: T;
  sourceUrl: string; // official source; "TODO-DAN" until verified
  verifiedOn: string | null; // ISO date Dan verified it; null until verified
};

export type OconusStation = {
  slug: string; // matches existing /bah/[station] slug
  templateVersion: 2;
  published: boolean; // build fails if published && any fact unverified
  name: string; // "Ramstein Air Base"
  shortName: string; // used in <title> to stay under 60 chars
  hostCountry: SourcedFact;
  cityRegion: SourcedFact;
  branches: SourcedFact<string[]>;
  ohaLocalityCode: SourcedFact; // from DTMO
  colaLocality: SourcedFact; // DTMO COLA locality name
  coLocated?: SourcedFact<string[]>; // e.g. KMC Army installations
  localContext: SourcedFact; // 1 short paragraph, no numbers
  leaseQuestions: SourcedFact[]; // "Questions to ask before you sign"
  beforeYouMove: SourcedFact[]; // practical checklist items
  officialLinks: { label: string; url: string }[]; // installation housing office, MOS installation page
  relatedStations: string[]; // slugs of other OCONUS stations
  lastReviewed: string; // ISO date; displayed on page
};

/** A link in the shared explainer copy — verified the same way as station facts. */
export type SharedLink = {
  label: string;
  url: string; // "TODO-DAN…" until confirmed
  verifiedOn: string | null;
};
