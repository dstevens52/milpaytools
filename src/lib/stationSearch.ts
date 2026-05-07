/**
 * Fuzzy station search with abbreviation expansion.
 * Used by BaseSearchInput to match user queries against known military installations.
 */

import { DUTY_STATIONS, type DutyStation } from '@/data/duty-stations/stations';

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
  // strip punctuation, collapse whitespace
  return r.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function searchStations(query: string, excludeOconus = true): DutyStation[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const scored: Array<[DutyStation, number]> = [];

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

    if (score > 0) scored.push([s, score]);
  }

  return scored
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([s]) => s);
}
