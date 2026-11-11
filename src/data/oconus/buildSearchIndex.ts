// Derives the slim overseas search index from the v2 OCONUS registry. Used by
// scripts/gen-oconus-search-index.ts (build time) and by the drift test — never
// imported by client code, which uses searchIndex.generated.ts instead.
// Relative imports only: this runs under tsx.

import { OCONUS_V2_STATIONS } from './index';

export type OconusSearchEntry = {
  name: string;
  shortName: string;
  slug: string;
  searchAliases: string[];
};

export function buildOconusSearchIndex(): OconusSearchEntry[] {
  return OCONUS_V2_STATIONS.filter((s) => s.published).map((s) => ({
    name: s.name,
    shortName: s.shortName,
    slug: s.slug,
    searchAliases: s.searchAliases ?? [],
  }));
}
