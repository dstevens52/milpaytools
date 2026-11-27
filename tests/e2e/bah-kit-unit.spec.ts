/**
 * BAH kit pages (build W3): the sentence generator and the year flip. No
 * browser or server. Run with:
 *   npm run test:bah-kit
 *
 * Expected figures are read from the registered data (registry.ts, the ZIP map,
 * the mid-year records and the HUD FMR registry) on a separate path from
 * src/lib/bahKit.ts, never typed. The served pages are checked in
 * tests/e2e/bah-kit.spec.ts.
 */
import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { BAH_RATES_BY_YEAR, BAH_LOOKUP_TABLES, BAH_MID_YEAR_CHANGES_BY_YEAR } from '../../src/data/bah/registry';
import { BAH_YEAR, BAH_PRIOR_YEAR } from '../../src/data/bah/current';
import { formatBahDate } from '../../src/data/bah/midYear';
import { RATE_PROTECTION_RULE } from '../../src/data/bah/rateProtection';
import { FMR_BY_YEAR } from '../../src/lib/calculations/fmr';
import { formatCurrency } from '../../src/lib/utils';
import {
  KIT_SOURCE_DTMO,
  KIT_SOURCE_DTMO_HUD,
  LIVE_BAH_KIT_SOURCE,
  bahKitData,
  bahKitStations,
  type BahKitData,
  type BahKitSource,
} from '../../src/lib/bahKit';
import { MOCK_2027_KIT_SOURCE as MOCK, MOCK_BUMP as BUMP, mock2027 } from './helpers/bahKitMock';

type Year = keyof typeof BAH_RATES_BY_YEAR;
const CONUS = DUTY_STATIONS.filter((s) => !s.oconus);
const ZIP_TO_MHA = BAH_LOOKUP_TABLES[BAH_YEAR as Year]!.zipToMha;
const PRIOR_BY_ZIP = BAH_LOOKUP_TABLES[BAH_YEAR as Year]!.priorMhaByZip ?? {};

function station(slug: string) {
  const s = CONUS.find((x) => x.slug === slug);
  if (!s) throw new Error(`no CONUS station ${slug}`);
  return s;
}

/** The page body (BahKitView) for every CONUS station, rendered under tsx (see helpers/bahKitMock.ts). */
function renderAll(mode: 'live' | 'mock2027' | 'norent'): Record<string, string> {
  const r = spawnSync(process.execPath, ['--import', 'tsx', 'tests/e2e/helpers/bahKitMock.ts', mode], {
    cwd: path.resolve(__dirname, '..', '..'),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  expect(r.status, r.stderr).toBe(0);
  return JSON.parse(r.stdout);
}

function sentence(d: BahKitData, id: string): string | undefined {
  return d.sentences.find((s) => s.id === id)?.text;
}

/** "up $21 (1.2%)" / "down $66 (3.4%)", straight from the registry rates. */
function expectedMove(current: number, prior: number): string {
  const abs = current - prior;
  return `${abs > 0 ? 'up' : 'down'} ${formatCurrency(Math.abs(abs))} (${Math.abs((abs / prior) * 100).toFixed(1)}%)`;
}

/** Expected rent sentence from the FMR registry (HUD FY = BAH year). */
function expectedRent(name: string, mhaLabel: string, mha: string, year: string, e5: number): string {
  const fy = FMR_BY_YEAR[year as keyof typeof FMR_BY_YEAR];
  const r = fy.data[mha].br2;
  const pos = e5 > r.p75 ? 'above' : e5 < r.p25 ? 'below' : 'within';
  return `Across the ${mhaLabel} area, 2-bedroom Fair Market Rent (HUD, FY${fy.year}) runs about ${formatCurrency(r.p25)}–${formatCurrency(r.p75)} a month (median ${formatCurrency(r.median)}). The ${year} BAH at ${name} for an E-5 with dependents (${formatCurrency(e5)}) is ${pos} that range. ${KIT_SOURCE_DTMO_HUD}`;
}

// Kit sentences are pasted under someone else's name: facts only.
const ADVICE = /\byou\b|\byour\b|should|loan|lender|mortgage|afford|financ|buy|budget/i;
// Decreases are stated plainly.
const ALARM = /drop|cut|plunge|slash|\blos[es]\b|loss|warning|!|−/i;

test.describe('Kit data (live year)', () => {
  test('a kit for every CONUS station; overseas and unknown slugs get none', () => {
    expect(bahKitStations().map((s) => s.slug)).toEqual(CONUS.map((s) => s.slug));
    expect(CONUS.length).toBeGreaterThan(100);
    const overseas = DUTY_STATIONS.filter((s) => s.oconus);
    expect(overseas.length).toBeGreaterThan(0);
    for (const s of overseas) expect(bahKitData(s.slug), s.slug).toBeNull();
    expect(bahKitData('not-a-station')).toBeNull();
  });

  // Fort Bragg and Naval Station Norfolk (increases), JB San Antonio and Luke AFB
  // (decreases). Every figure from the registry, through the ZIP map.
  for (const slug of ['fort-bragg', 'naval-station-norfolk', 'joint-base-san-antonio', 'luke-afb']) {
    test(`${slug}: headline, protection and rent sentences match the ${BAH_YEAR} data`, () => {
      const s = station(slug);
      const mha = ZIP_TO_MHA[s.zip];
      expect(mha, `${s.zip} in the ${BAH_YEAR} ZIP map`).toBeTruthy();
      const priorMha = PRIOR_BY_ZIP[s.zip] ?? mha;
      const cur = BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha];
      const prior = BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR as Year][priorMha];
      const e5 = cur.w['E-5'];
      const d = bahKitData(slug)!;

      expect(d.mhaCode).toBe(mha);
      expect(sentence(d, 'headline')).toBe(
        `The ${BAH_YEAR} BAH at ${s.name} for an E-5 with dependents is ${formatCurrency(e5)} a month, ${expectedMove(e5, prior.w['E-5'])} from ${BAH_PRIOR_YEAR}. ${KIT_SOURCE_DTMO}`,
      );
      const fell = e5 < prior.w['E-5'];
      expect(sentence(d, 'protection')).toBe(fell ? `${RATE_PROTECTION_RULE} ${KIT_SOURCE_DTMO}` : undefined);
      expect(sentence(d, 'rent')).toBe(expectedRent(s.name, d.mhaLabel, mha, BAH_YEAR, e5));
      expect(d.rentSourceLabel).toBe(`2-bedroom Fair Market Rent (HUD, FY${BAH_YEAR})`);

      // The table: every grade, both statuses, both years.
      expect(d.table.ratesW).toEqual(cur.w);
      expect(d.table.ratesWO).toEqual(cur.wo);
      expect(d.table.ratesWPrev).toEqual(prior.w);
      expect(d.table.ratesWOPrev).toEqual(prior.wo);
      expect(d.effectiveLabel).toBe(`January 1, ${BAH_YEAR}`);
    });
  }

  test('the spot-check set has increases and decreases', () => {
    const e5 = (slug: string) => {
      const s = station(slug);
      return [BAH_RATES_BY_YEAR[BAH_YEAR as Year][ZIP_TO_MHA[s.zip]].w['E-5'], BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR as Year][ZIP_TO_MHA[s.zip]].w['E-5']];
    };
    for (const slug of ['fort-bragg', 'naval-station-norfolk']) expect(e5(slug)[0], slug).toBeGreaterThan(e5(slug)[1]);
    for (const slug of ['joint-base-san-antonio', 'luke-afb']) expect(e5(slug)[0], slug).toBeLessThan(e5(slug)[1]);
  });

  test('decrease wording is plain: "down $N (N.N%)", no alarm words or minus sign', () => {
    for (const slug of ['joint-base-san-antonio', 'luke-afb']) {
      const h = sentence(bahKitData(slug)!, 'headline')!;
      expect(h, slug).toMatch(/, down \$\d[\d,]* \(\d+\.\d%\) from /);
      expect(h, slug).not.toMatch(ALARM);
    }
  });

  test('E-5 unchanged (MacDill): "unchanged from", no protection sentence', () => {
    const s = station('macdill-afb');
    const mha = ZIP_TO_MHA[s.zip];
    const e5 = BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha].w['E-5'];
    test.skip(e5 !== BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR as Year][mha].w['E-5'], `MacDill E-5 changed in ${BAH_YEAR}`);
    const d = bahKitData('macdill-afb')!;
    expect(sentence(d, 'headline')).toBe(
      `The ${BAH_YEAR} BAH at ${s.name} for an E-5 with dependents is ${formatCurrency(e5)} a month, unchanged from ${BAH_PRIOR_YEAR}. ${KIT_SOURCE_DTMO}`,
    );
    expect(sentence(d, 'protection')).toBeUndefined();
  });

  test('Dyess AFB (temporary increase): dates instead of a change, no protection sentence', () => {
    const s = station('dyess-afb');
    const mha = ZIP_TO_MHA[s.zip];
    const midYear = BAH_MID_YEAR_CHANGES_BY_YEAR[BAH_YEAR as Year]?.[mha];
    test.skip(!midYear?.temporary, `no temporary mid-year change for ${mha} in ${BAH_YEAR}`);
    const d = bahKitData('dyess-afb')!;
    const e5 = BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha].w['E-5'];
    expect(sentence(d, 'headline')).toBe(
      `The ${BAH_YEAR} BAH at ${s.name} for an E-5 with dependents is ${formatCurrency(e5)} a month (temporary rates effective ${formatBahDate(midYear!.effective)}, through ${formatBahDate(midYear!.temporary!.expires)}). ${KIT_SOURCE_DTMO}`,
    );
    expect(sentence(d, 'headline')).not.toContain('%');
    expect(sentence(d, 'protection')).toBeUndefined();
    expect(sentence(d, 'rent')).toBe(expectedRent(s.name, d.mhaLabel, mha, BAH_YEAR, e5));
    expect(d.effectiveLabel).toBe(`${formatBahDate(midYear!.effective)} (DTMO mid-year change)`);
  });

  test('no HUD rent row: the rent sentence and the rent source lines are left out', () => {
    const noRent: BahKitSource = { ...LIVE_BAH_KIT_SOURCE, rent: () => null };
    const d = bahKitData('fort-bragg', noRent)!;
    expect(d.sentences.map((s) => s.id)).toEqual(['headline']);
    expect(d.rentSourceLabel).toBeNull();
    expect(d.allText).toBe(sentence(d, 'headline'));
    const html = renderAll('norent')['fort-bragg'];
    expect(html).toContain('Fort Bragg BAH'); // control: the page rendered
    expect(html).not.toContain('Fair Market Rent');
  });

  test('every CONUS station: protection only where E-5 fell; sources; no advice words', () => {
    let fell = 0;
    for (const s of CONUS) {
      const d = bahKitData(s.slug)!;
      const mha = ZIP_TO_MHA[s.zip];
      const priorMha = PRIOR_BY_ZIP[s.zip] ?? mha;
      const cur = BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha].w['E-5'];
      const prior = BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR as Year][priorMha]?.w['E-5'];
      const temporary =
        BAH_MID_YEAR_CHANGES_BY_YEAR[BAH_YEAR as Year]?.[mha]?.temporary ||
        BAH_MID_YEAR_CHANGES_BY_YEAR[BAH_PRIOR_YEAR as Year]?.[priorMha]?.temporary;
      const expectProtection = prior !== undefined && cur < prior && !temporary;
      if (expectProtection) fell++;
      expect(sentence(d, 'protection') !== undefined, s.slug).toBe(expectProtection);
      expect(sentence(d, 'headline')!.startsWith(`The ${BAH_YEAR} BAH at ${s.name} for an E-5 with dependents `), s.slug).toBe(true);
      for (const x of d.sentences) {
        expect(x.text.endsWith(x.id === 'rent' ? KIT_SOURCE_DTMO_HUD : KIT_SOURCE_DTMO), `${s.slug} ${x.id}`).toBe(true);
        expect(x.text, `${s.slug} ${x.id}`).not.toMatch(ADVICE);
        expect(x.text, `${s.slug} ${x.id}`).not.toMatch(/\b\w+'s\b/); // no possessives
      }
    }
    expect(fell).toBeGreaterThan(5); // control: decreases exist in this year's data
  });

  test('credit link, image links and the page link', () => {
    const d = bahKitData('fort-bragg')!;
    expect(d.credit.url).toBe('https://www.milpaytools.com/bah/fort-bragg?utm_source=kit&utm_medium=realtor');
    expect(d.credit.html).toBe(
      '<a href="https://www.milpaytools.com/bah/fort-bragg?utm_source=kit&amp;utm_medium=realtor">Fort Bragg BAH rates from MilPayTools</a>',
    );
    expect(d.image.src).toMatch(new RegExp(`^/api/bah-image/fort-bragg\\?format=portrait&y=${BAH_YEAR}&v=\\d+$`));
    expect(d.image.downloadHref).toBe(`${d.image.src}&download=1`);
    expect(d.image.filename).toBe(`fort-bragg-bah-${BAH_YEAR}.png`);
    expect([d.image.width, d.image.height]).toEqual([1080, 1350]);
    expect(d.pageHref).toBe('/bah/fort-bragg');
  });

  test('the page body renders the kit for every CONUS station', () => {
    const pages = renderAll('live');
    expect(Object.keys(pages)).toEqual(CONUS.map((s) => s.slug));
    for (const s of CONUS) {
      const html = pages[s.slug];
      expect(html, s.slug).toContain(`${s.name.replace(/&/g, '&amp;')} BAH ${BAH_YEAR} kit`);
      expect(html, s.slug).not.toMatch(/\bloan|lender|mortgage/i);
    }
  });
});

test.describe('Year flip (mocked 2027 data year)', () => {
  // MOCK (helpers/bahKitMock.ts): 2027 = 2026 + $30, TX270's temporary increase ends.
  const rates2026 = BAH_RATES_BY_YEAR['2026'];
  const rates2025 = BAH_RATES_BY_YEAR['2025'];

  test('every CONUS station: 2027 labels, compared with 2026, FY2027 rents', () => {
    for (const s of CONUS) {
      const d = bahKitData(s.slug, MOCK);
      expect(d, s.slug).not.toBeNull();
      expect(d!.year).toBe('2027');
      expect(d!.priorYear).toBe('2026');
      expect(d!.effectiveLabel, s.slug).toBe('January 1, 2027');
      expect(d!.image.src, s.slug).toContain('&y=2027&');
      const e5 = mock2027(d!.mhaCode, 'w')!['E-5'];
      if (d!.mhaCode !== 'TX270') {
        const prior = rates2026[d!.mhaCode].w['E-5'];
        expect(sentence(d!, 'headline'), s.slug).toBe(
          `The 2027 BAH at ${s.name} for an E-5 with dependents is ${formatCurrency(e5)} a month, ${expectedMove(prior + BUMP, prior)} from 2026. ${KIT_SOURCE_DTMO}`,
        );
        expect(sentence(d!, 'protection'), s.slug).toBeUndefined(); // every mocked rate rose
      }
      const rent = sentence(d!, 'rent');
      if (FMR_BY_YEAR['2027'].data[d!.mhaCode]?.br2) {
        expect(rent, s.slug).toBe(expectedRent(s.name, d!.mhaLabel, d!.mhaCode, '2027', e5));
      } else {
        expect(rent, s.slug).toBeUndefined();
      }
      for (const x of d!.sentences) expect(x.text, `${s.slug} ${x.id}`).not.toMatch(/2025|FY2026/);
    }
  });

  test('prior-year temporary increase (TX270 after the flip): compared with the temporary 2026 rate, no protection', () => {
    const d = bahKitData('dyess-afb', MOCK)!;
    const e5 = rates2025.TX270.w['E-5'];
    const prior = rates2026.TX270.w['E-5'];
    const expires = BAH_MID_YEAR_CHANGES_BY_YEAR['2026']!.TX270!.temporary!.expires;
    expect(sentence(d, 'headline')).toBe(
      `The 2027 BAH at Dyess AFB for an E-5 with dependents is ${formatCurrency(e5)} a month, ${expectedMove(e5, prior)} from the temporary 2026 rate of ${formatCurrency(prior)} (in effect through ${formatBahDate(expires)}). ${KIT_SOURCE_DTMO}`,
    );
    expect(sentence(d, 'protection')).toBeUndefined();
  });

  test('a real decrease after the flip gets the protection sentence', () => {
    const down: BahKitSource = {
      ...MOCK,
      ratesWithDeps: (mha, year) =>
        year === '2027' ? Object.fromEntries(Object.entries(rates2026[mha]?.w ?? {}).map(([g, v]) => [g, v - 12])) : MOCK.ratesWithDeps(mha, year),
    };
    const d = bahKitData('fort-bragg', down)!;
    expect(sentence(d, 'headline')).toContain(', down $12 (');
    expect(sentence(d, 'protection')).toBe(`${RATE_PROTECTION_RULE} ${KIT_SOURCE_DTMO}`);
  });

  test('before January 1 (BAH_EFFECTIVE_NOTICE on): future tense', () => {
    const d = bahKitData('fort-bragg', { ...MOCK, effectiveNotice: true })!;
    const e5 = mock2027(d.mhaCode, 'w')!['E-5'];
    expect(sentence(d, 'headline')).toMatch(
      new RegExp(`^The 2027 BAH at Fort Bragg for an E-5 with dependents will be \\${formatCurrency(e5)} a month starting January 1, 2027, up \\$30 \\(`),
    );
  });

  test('every CONUS station page body renders under 2027', () => {
    const pages = renderAll('mock2027');
    expect(Object.keys(pages)).toEqual(CONUS.map((s) => s.slug));
    for (const s of CONUS) {
      const html = pages[s.slug];
      expect(html, s.slug).toContain(`BAH 2027 kit`);
      expect(html, s.slug).toContain('2027 BAH Rates — ');
      expect(html, s.slug).toContain('effective January 1, 2027');
      expect(html, s.slug).not.toContain('2025');
    }
  });
});
