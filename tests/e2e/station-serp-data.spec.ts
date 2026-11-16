/**
 * Station search-result test (Build 03) — no browser or server. Run with:
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/station-serp-data.spec.ts --project=chromium
 *
 * - Arm lists (src/data/bah/serpTest.ts) and the flag: 'split', 'all-a', 'all-b'.
 * - Variant A equals the main snapshot byte-for-byte; variant B meets the limits.
 * - formatMhaName is display-only: stored DTMO names, ZIP and code lookups, the
 *   station-page map and COLA all still use the original names.
 * The served pages are checked in station-serp.spec.ts.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DUTY_STATIONS, type DutyStation } from '../../src/data/duty-stations/stations';
import { SERP_TEST_B_SLUGS, SERP_TEST_B_EXCLUDED_SLUGS, SERP_TEST_MODE, stationSerpArm } from '../../src/data/bah/serpTest';
import { stationSerpMeta, stationRateRange, stationTitleB, TITLE_MAX, DESCRIPTION_MAX } from '../../src/lib/stationSerp';
import { formatMhaName } from '../../src/lib/mhaDisplay';
import { currentMhaNames, getLocationName, getMHACode } from '../../src/lib/calculations/bah';
import { MHA_TO_STATION_PAGES } from '../../src/data/bah/mhaToStationPage';
import { lookupCola } from '../../src/lib/calculations/cola';
import { formatCurrency } from '../../src/lib/utils';

type Snap = { title: string; description: string; ogTitle: string; ogDescription: string; twitterTitle: string; twitterDescription: string };
const SNAPSHOT: Record<string, Snap> = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures', 'station-serp-main-snapshot.json'), 'utf8'),
).pages;

const CONUS: DutyStation[] = DUTY_STATIONS.filter((s) => !s.oconus);
const SUFFIX = ' | MilPayTools';

/** A's meta, rendered as the page renders it (A's title goes through the layout template). */
function renderedA(s: DutyStation, mode: 'split' | 'all-a') {
  const m = stationSerpMeta(s, mode);
  return {
    title: m.absolute ? m.title : `${m.title}${SUFFIX}`,
    description: m.description,
    ogTitle: m.socialTitle,
    ogDescription: m.description,
    twitterTitle: m.socialTitle,
    twitterDescription: m.description,
  };
}

function expectB(s: DutyStation, mode: 'split' | 'all-b') {
  const m = stationSerpMeta(s, mode);
  expect(m.arm, s.slug).toBe('B');
  expect(m.absolute, s.slug).toBe(true);
  expect(m.title.length, `${s.slug} title: ${m.title}`).toBeLessThanOrEqual(TITLE_MAX);
  expect(m.title, s.slug).not.toContain('MilPayTools');
  expect(m.title, s.slug).toContain(s.searchName ?? s.name);
  expect(m.socialTitle, s.slug).toBe(`${m.title}${SUFFIX}`);
  expect(m.description.length, `${s.slug} description: ${m.description}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
  const r = stationRateRange(s)!;
  expect(r.count, s.slug).toBe(24);
  expect(m.description, s.slug).toContain(`${formatCurrency(r.min)}–${formatCurrency(r.max)}/mo across 24 pay grades.`);
  expect(m.description, s.slug).toContain(`BAH at ${s.name}`);
}

test.describe('station SERP test: arms and flag', () => {
  test('the flag ships in split mode', () => {
    expect(SERP_TEST_MODE).toBe('split');
  });

  test('arm lists: 68 + 5 B pages, all CONUS stations, no duplicates; the rest are A', () => {
    const conusSlugs = new Set(CONUS.map((s) => s.slug));
    const b = [...SERP_TEST_B_SLUGS, ...SERP_TEST_B_EXCLUDED_SLUGS];
    expect(CONUS).toHaveLength(142);
    expect(SERP_TEST_B_SLUGS).toHaveLength(68);
    expect([...SERP_TEST_B_EXCLUDED_SLUGS].sort()).toEqual(['camp-pendleton', 'fort-irwin', 'marine-corps-base-quantico', 'minot-afb', 'schriever-sfb']);
    expect(new Set(b).size).toBe(b.length);
    for (const slug of b) expect(conusSlugs.has(slug), slug).toBe(true);
    expect(CONUS.filter((s) => stationSerpArm(s.slug) === 'A')).toHaveLength(69);
    // Snapshot covers exactly the CONUS pages.
    expect(Object.keys(SNAPSHOT).sort()).toEqual([...conusSlugs].sort());
  });

  test('split: A pages are byte-identical to main; B pages meet the limits', () => {
    for (const s of CONUS) {
      if (stationSerpArm(s.slug, 'split') === 'A') expect(renderedA(s, 'split'), s.slug).toEqual(SNAPSHOT[s.slug]);
      else expectB(s, 'split');
    }
  });

  test("'all-a' puts every page back on main's output", () => {
    for (const s of CONUS) expect(renderedA(s, 'all-a'), s.slug).toEqual(SNAPSHOT[s.slug]);
  });

  test("'all-b' puts every page on variant B, and every page fits (release-day rollout)", () => {
    for (const s of CONUS) expectB(s, 'all-b');
  });

  test('B titles: short names where approved, former names never in the title', () => {
    const SEARCH_NAMES: Record<string, string> = {
      'naval-station-norfolk': 'Norfolk',
      'camp-lejeune': 'Camp Lejeune',
      'naval-air-station-whidbey-island': 'Whidbey Island',
      'naval-base-kitsap': 'Bremerton (Naval Base Kitsap)',
      'fort-meade': 'Fort Meade',
      'davis-monthan-afb': 'Davis-Monthan AFB (Tucson)',
      'peterson-sfb': 'Peterson SFB (Colorado Springs)',
      'macdill-afb': 'MacDill AFB (Tampa)',
      'marine-corps-air-ground-combat-center': '29 Palms (Twentynine Palms)',
      'joint-base-pearl-harbor-hickam': 'Pearl Harbor-Hickam (Honolulu)',
      'joint-base-langley-eustis': 'Langley AFB & Fort Eustis',
      'us-naval-academy': 'Annapolis (U.S. Naval Academy)',
      'walter-reed-nmmc': 'Walter Reed (Bethesda)',
      'naval-air-station-oceana': 'NAS Oceana (Virginia Beach)',
    };
    const withSearchName = Object.fromEntries(CONUS.filter((s) => s.searchName).map((s) => [s.slug, s.searchName]));
    expect(withSearchName).toEqual(SEARCH_NAMES);
    const bySlug = Object.fromEntries(CONUS.map((s) => [s.slug, s]));
    expect(stationTitleB(bySlug['fort-bragg'])).toBe('Fort Bragg BAH 2026: E-1 to O-7, With & Without Dependents');
    expect(stationTitleB(bySlug['naval-station-norfolk'])).toBe('Norfolk BAH 2026: E-1 to O-7, With & Without Dependents');
    expect(stationTitleB(bySlug['naval-air-station-whidbey-island'])).toBe('Whidbey Island BAH 2026 by Rank, With/Without Dependents');
    for (const s of CONUS.filter((x) => x.formerName)) {
      expect(stationTitleB(s), s.slug).not.toContain(s.formerName!.split(' (')[0]);
    }
  });

  test('B descriptions: the brief\'s examples and the fallbacks', () => {
    const bySlug = Object.fromEntries(CONUS.map((s) => [s.slug, s]));
    const d = (slug: string) => stationSerpMeta(bySlug[slug], 'all-b').description;
    expect(d('fort-bragg')).toBe('2026 BAH at Fort Bragg, NC (Fayetteville): $1,341–$2,646/mo across 24 pay grades. Pick your rank to see your rate, the change from 2025 and local rent.');
    expect(d('naval-station-norfolk')).toBe('2026 BAH at Naval Station Norfolk, VA: $1,707–$3,366/mo across 24 pay grades. Pick your rank to see your rate, the change from 2025 and local rent.');
    // "and local rent" dropped.
    expect(d('naval-air-station-whidbey-island')).toBe('2026 BAH at Naval Air Station Whidbey Island, WA (Oak Harbor): $1,839–$3,453/mo across 24 pay grades. Pick your rank to see your rate and the change from 2025.');
    // City dropped too (decision N).
    expect(d('fort-irwin')).toBe('2026 BAH at Fort Irwin (National Training Center), CA: $1,557–$3,189/mo across 24 pay grades. Pick your rank to see your rate and the change from 2025.');
    expect(d('joint-base-little-creek-fort-story')).not.toContain('(Virginia Beach)');
    expect(d('walter-reed-nmmc')).not.toContain('(Bethesda)');
  });
});

test.describe('MHA name casing: display only', () => {
  const RAW = currentMhaNames();

  test('formatMhaName fixes abbreviations and Mc- names', () => {
    expect(formatMhaName('Davis-Monthan Afb, AZ')).toBe('Davis-Monthan AFB, AZ');
    expect(formatMhaName('Vandenberg Sfb, CA')).toBe('Vandenberg SFB, CA');
    expect(formatMhaName('Lemoore Nas, CA')).toBe('Lemoore NAS, CA');
    expect(formatMhaName('Jb Mcguire-Dix-Lakehurst, NJ')).toBe('JB McGuire-Dix-Lakehurst, NJ');
    expect(formatMhaName('Morehead/Cherry Pt Mcas, NC')).toBe('Morehead/Cherry Pt MCAS, NC');
    expect(formatMhaName('Twenty Nine Palms Mcb, CA')).toBe('Twenty Nine Palms MCB, CA');
    expect(formatMhaName('Fort Monmouth/Earle Nws, NJ')).toBe('Fort Monmouth/Earle NWS, NJ');
    expect(formatMhaName('White Sands Mr/Las Cruces, NM')).toBe('White Sands MR/Las Cruces, NM');
    expect(formatMhaName('Wichita/Mcconnell Afb, KS')).toBe('Wichita/McConnell AFB, KS');
    expect(formatMhaName('Sparta/Fort Mccoy, WI')).toBe('Sparta/Fort McCoy, WI');
    expect(formatMhaName('Anniston/Fort Mcclellan, AL')).toBe('Anniston/Fort McClellan, AL');
    // Words that only start like an abbreviation are left alone.
    expect(formatMhaName('Nashville, TN')).toBe('Nashville, TN');
    expect(formatMhaName('Fort Lewis/McChord, WA')).toBe('Fort Lewis/McChord, WA');
  });

  test('every changed 2026 name changes only in casing, and formatting twice changes nothing', () => {
    const changed = Object.entries(RAW).filter(([, n]) => formatMhaName(n) !== n);
    expect(changed.length).toBeGreaterThanOrEqual(40);
    for (const [code, n] of Object.entries(RAW)) {
      const f = formatMhaName(n);
      expect(f.toLowerCase(), code).toBe(n.toLowerCase());
      expect(formatMhaName(f), code).toBe(f);
    }
  });

  test('stored names, ZIP and code lookups, station map and COLA still use the original DTMO names', () => {
    // Stored data is unchanged.
    expect(RAW['AZ015']).toBe('Davis-Monthan Afb, AZ');
    expect(RAW['NJ204']).toBe('Jb Mcguire-Dix-Lakehurst, NJ');
    // A lookup by the original DTMO name still resolves, for every name the display changes.
    const byName = new Map(Object.entries(RAW).map(([code, n]) => [n, code]));
    for (const [code, n] of Object.entries(RAW)) {
      if (formatMhaName(n) === n) continue;
      expect(byName.get(n), n).toBe(code);
      expect(byName.has(formatMhaName(n)), `display form "${formatMhaName(n)}" must not be a stored name`).toBe(false);
    }
    // ZIP → name returns the raw name; ZIP → code and code → station pages are unchanged.
    const dm = CONUS.find((s) => s.slug === 'davis-monthan-afb')!;
    expect(getMHACode(dm.zip)).toBe('AZ015');
    expect(getLocationName(dm.zip)).toBe('Davis-Monthan Afb, AZ');
    expect(MHA_TO_STATION_PAGES['AZ015'].map((p) => p.slug)).toContain('davis-monthan-afb');
    // COLA resolves by code and reports the raw DTMO name.
    const cola = lookupCola(dm.zip);
    expect(cola.status).not.toBe('not-found');
    if ('mhaName' in cola) expect(cola.mhaName).toBe('Davis-Monthan Afb, AZ');
  });
});
