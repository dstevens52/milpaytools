/**
 * Fuzzy station search with abbreviation expansion.
 * Used by BaseSearchInput to match user queries against known military installations.
 * Searches both duty-stations/stations.ts (76 bases with /bah/ pages) and
 * installations-lookup.ts (~110 additional bases). Stations results appear first.
 */

import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { INSTALLATIONS_LOOKUP, type InstallationLookup } from '@/data/installations-lookup';

export interface SearchResult {
  name: string;
  zip: string;
  city: string;
  state: string;
  branch: string;
  formerName?: string;
  oconus?: boolean;
}

// Common military abbreviations → expanded forms
const ABBREVS: [RegExp, string][] = [
  [/\bft\.?\b/gi,   'fort'],
  [/\bafb\b/gi,     'air force base'],
  [/\bnas\b/gi,     'naval air station'],
  [/\bnab\b/gi,     'naval amphibious base'],
  [/\bnb\b/gi,      'naval base'],
  [/\bns\b/gi,      'naval station'],
  [/\bnstc\b/gi,    'naval station'],
  [/\bmcas\b/gi,    'marine corps air station'],
  [/\bmcb\b/gi,     'marine corps base'],
  [/\bmcrd\b/gi,    'marine corps recruit depot'],
  [/\bjbsa\b/gi,    'joint base san antonio'],
  [/\bjblm\b/gi,    'joint base lewis mcchord'],
  [/\bjbelm\b/gi,   'joint base elmendorf richardson'],
  [/\bjb\b/gi,      'joint base'],
  [/\bpax\b/gi,     'patuxent river'],
  [/\bpentagon\b/gi,'fort myer henderson hall'],
];

function normalize(s: string): string {
  let r = s.toLowerCase().trim();
  for (const [pat, rep] of ABBREVS) r = r.replace(pat, rep);
  return r.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function searchStations(query: string, excludeOconus = true): SearchResult[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  // --- Duty stations (stations.ts) — higher priority ---
  const stationScored: Array<[SearchResult, number]> = [];

  for (const s of DUTY_STATIONS) {
    if (excludeOconus && s.oconus) continue;

    const name   = normalize(s.name);
    const former = s.formerName ? normalize(s.formerName) : '';
    const city   = s.city.toLowerCase();
    const state  = s.state.toLowerCase();
    const sname  = s.stateName.toLowerCase();

    let score = 0;

    if (name === q)               score = 100;
    else if (name.startsWith(q))  score = 80;
    else if (name.includes(q))    score = 60;
    else if (former.includes(q))  score = 50;
    else if (city.startsWith(q))  score = 40;
    else if (city.includes(q))    score = 30;
    else if (sname.includes(q))   score = 15;
    else if (state === q)         score = 20;

    if (score > 0) {
      stationScored.push([
        {
          name: s.name,
          zip: s.zip,
          city: s.city,
          state: s.state,
          branch: s.branches.join('/'),
          formerName: s.formerName,
          oconus: s.oconus,
        },
        score,
      ]);
    }
  }

  const stationResults = stationScored
    .sort((a, b) => b[1] - a[1])
    .map(([r]) => r);

  // --- Installations lookup — additional bases ---
  const lookupScored: Array<[SearchResult, number]> = [];

  for (const inst of INSTALLATIONS_LOOKUP) {
    if (excludeOconus && inst.oconus) continue;

    const name  = normalize(inst.name);
    const city  = inst.city.toLowerCase();
    const state = inst.state.toLowerCase();

    let score = 0;

    if (name === q)               score = 100;
    else if (name.startsWith(q))  score = 80;
    else if (name.includes(q))    score = 60;
    else {
      // Check alt names
      for (const alt of inst.altNames ?? []) {
        const an = normalize(alt);
        if (an === q)              { score = 55; break; }
        if (an.startsWith(q))     { score = 45; break; }
        if (an.includes(q))       { score = 35; break; }
      }
    }

    if (score === 0) {
      if (city.startsWith(q))     score = 30;
      else if (city.includes(q))  score = 20;
      else if (state === q)       score = 15;
    }

    if (score > 0) {
      lookupScored.push([
        {
          name: inst.name,
          zip: inst.zip,
          city: inst.city,
          state: inst.state,
          branch: inst.branch,
          oconus: inst.oconus,
        },
        score,
      ]);
    }
  }

  const lookupResults = lookupScored
    .sort((a, b) => b[1] - a[1])
    .map(([r]) => r);

  return [...stationResults, ...lookupResults].slice(0, 8);
}
