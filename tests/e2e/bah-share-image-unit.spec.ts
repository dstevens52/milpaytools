/**
 * BAH share images (build W2): the data behind every image, and the year flip.
 * No browser or server. Run with:
 *   npm run test:bah-share
 *
 * Expected figures are read from the registered data (registry.ts, the ZIP map
 * and mid-year records) on a separate path from src/lib/bahShareImage.ts, never
 * typed. The year-flip test runs the generator under a mocked 2027 data year and
 * renders every CONUS station in both formats. The served route is checked in
 * bah-share-image.spec.ts and scripts/check-bah-images.ts.
 */
import { test, expect } from '@playwright/test';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { BAH_RATES_BY_YEAR, BAH_LOOKUP_TABLES, BAH_MID_YEAR_CHANGES_BY_YEAR } from '../../src/data/bah/registry';
import { BAH_YEAR, BAH_PRIOR_YEAR } from '../../src/data/bah/current';
import { formatBahDate } from '../../src/data/bah/midYear';
import { formatCurrency } from '../../src/lib/utils';
import {
  BAH_SHARE_FORMATS,
  BAH_SHARE_GRADES,
  LIVE_BAH_SHARE_SOURCE,
  bahShareData,
  bahShareFilename,
  bahShareImageUrl,
  bahShareOgImages,
  bahShareStations,
  type BahShareFormat,
  type BahShareSource,
} from '../../src/lib/bahShareImage';
import { renderBahShareImage } from '../../src/lib/bahShareImageRender';

type Year = keyof typeof BAH_RATES_BY_YEAR;
const CONUS = DUTY_STATIONS.filter((s) => !s.oconus);
const ZIP_TO_MHA = BAH_LOOKUP_TABLES[BAH_YEAR as Year]!.zipToMha;
const MINUS = '−';

function station(slug: string) {
  const s = CONUS.find((x) => x.slug === slug);
  if (!s) throw new Error(`no CONUS station ${slug}`);
  return s;
}

/** Expected change text, straight from the registry rates. */
function expectedChange(current: number, prior: number): string {
  const abs = current - prior;
  if (abs === 0) return 'Unchanged';
  const sign = abs > 0 ? '+' : MINUS;
  return `${sign}${formatCurrency(Math.abs(abs))} (${sign}${Math.abs((abs / prior) * 100).toFixed(1)}%)`;
}

/** PNG width/height from the IHDR chunk. */
function pngSize(buf: Buffer): { width: number; height: number } {
  expect(buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function renderPng(slug: string, format: BahShareFormat, source: BahShareSource): Promise<Buffer> {
  const data = bahShareData(slug, source);
  if (!data) throw new Error(`no share data for ${slug}`);
  return Buffer.from(await renderBahShareImage(data, format).arrayBuffer());
}

test.describe('Share image data (live year)', () => {
  test('covers exactly the CONUS stations; overseas and unknown slugs get no image', () => {
    expect(bahShareStations().map((s) => s.slug)).toEqual(CONUS.map((s) => s.slug));
    expect(CONUS.length).toBeGreaterThan(100);
    const overseas = DUTY_STATIONS.filter((s) => s.oconus);
    expect(overseas.length).toBeGreaterThan(0);
    for (const s of overseas) expect(bahShareData(s.slug), s.slug).toBeNull();
    expect(bahShareData('not-a-station')).toBeNull();
  });

  // Fort Bragg (increase), JB San Antonio and Luke AFB (decreases), MacDill
  // (E-5 unchanged). Every figure from the registry, through the ZIP map.
  for (const slug of ['fort-bragg', 'joint-base-san-antonio', 'luke-afb', 'macdill-afb']) {
    test(`${slug}: rate, change and table match the ${BAH_YEAR} and ${BAH_PRIOR_YEAR} data`, () => {
      const s = station(slug);
      const mha = ZIP_TO_MHA[s.zip];
      expect(mha, `${s.zip} in the ${BAH_YEAR} ZIP map`).toBeTruthy();
      const cur = BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha].w;
      const prior = BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR as Year][mha].w;
      const d = bahShareData(slug)!;

      expect(d.headline).toBe(`${s.name} BAH ${BAH_YEAR}`);
      expect(d.mhaCode).toBe(mha);
      expect(d.e5.rate).toBe(cur['E-5']);
      expect(d.e5.rateText).toBe(formatCurrency(cur['E-5']));
      expect(d.changeLine).toBe(`${expectedChange(cur['E-5'], prior['E-5'])} from ${BAH_PRIOR_YEAR}`);
      expect(d.showChanges).toBe(true);
      expect(d.rows.map((r) => r.grade)).toEqual([...BAH_SHARE_GRADES]);
      for (const r of d.rows) {
        expect(r.rate, `${slug} ${r.grade}`).toBe(cur[r.grade]);
        expect(r.change?.text, `${slug} ${r.grade}`).toBe(expectedChange(cur[r.grade], prior[r.grade]));
      }
      expect(d.effectiveLabel).toBe(`January 1, ${BAH_YEAR}`);
      expect(d.pageLabel).toBe(`milpaytools.com/bah/${slug}`);
    });
  }

  test('the spot-check set includes a decrease and an unchanged E-5 rate', () => {
    expect(bahShareData('joint-base-san-antonio')!.e5.change!.abs).toBeLessThan(0);
    expect(bahShareData('joint-base-san-antonio')!.changeLine!.startsWith(MINUS)).toBe(true);
    expect(bahShareData('macdill-afb')!.changeLine).toBe(`Unchanged from ${BAH_PRIOR_YEAR}`);
  });

  test('Dyess AFB (temporary increase): rate shown, change left out, mid-year effective date', () => {
    const s = station('dyess-afb');
    const mha = ZIP_TO_MHA[s.zip];
    const midYear = BAH_MID_YEAR_CHANGES_BY_YEAR[BAH_YEAR as Year]?.[mha];
    test.skip(!midYear?.temporary, `no temporary mid-year change for ${mha} in ${BAH_YEAR}`);
    const d = bahShareData('dyess-afb')!;
    expect(d.e5.rate).toBe(BAH_RATES_BY_YEAR[BAH_YEAR as Year][mha].w['E-5']);
    expect(d.changeLine).toBe('See page for details');
    expect(d.showChanges).toBe(false);
    expect(d.effectiveLabel).toBe(`${formatBahDate(midYear!.effective)} (DTMO mid-year change)`);
  });

  test('no prior-year row: the change line and the change column are left out', () => {
    const noPrior: BahShareSource = {
      ...LIVE_BAH_SHARE_SOURCE,
      ratesWithDeps: (mha, year) => (year === BAH_PRIOR_YEAR ? null : LIVE_BAH_SHARE_SOURCE.ratesWithDeps(mha, year)),
    };
    const d = bahShareData('fort-bragg', noPrior)!;
    expect(d.e5.rate).toBe(bahShareData('fort-bragg')!.e5.rate);
    expect(d.changeLine).toBeNull();
    expect(d.showChanges).toBe(false);
    expect(d.rows.every((r) => r.change === null)).toBe(true);
  });

  test('image URL carries the BAH year; og images are 1200×630; download filenames', () => {
    expect(bahShareImageUrl('fort-bragg', 'preview')).toMatch(
      new RegExp(`^/api/bah-image/fort-bragg\\?format=preview&y=${BAH_YEAR}&v=\\d+$`),
    );
    expect(bahShareOgImages('fort-bragg')).toEqual([
      { url: bahShareImageUrl('fort-bragg', 'preview'), width: 1200, height: 630 },
    ]);
    expect(bahShareFilename({ slug: 'fort-bragg', year: BAH_YEAR }, 'portrait')).toBe(`fort-bragg-bah-${BAH_YEAR}.png`);
    expect(bahShareFilename({ slug: 'fort-bragg', year: BAH_YEAR }, 'preview')).toBe(`fort-bragg-bah-${BAH_YEAR}-preview.png`);
  });

  test('renders PNGs at the declared sizes', async () => {
    for (const format of ['preview', 'portrait'] as const) {
      const size = pngSize(await renderPng('fort-bragg', format, LIVE_BAH_SHARE_SOURCE));
      expect(size).toEqual(BAH_SHARE_FORMATS[format]);
    }
  });
});

test.describe('Year flip (mocked 2027 data year)', () => {
  // Release-day stand-in: "2027" rates = the 2026 rates + $30, except TX270,
  // whose 2026 temporary increase ends (2027 = its 2025 rates). 2026 becomes
  // the prior year, with its real mid-year record (TX270 temporary).
  const BUMP = 30;
  const rates2026 = BAH_RATES_BY_YEAR['2026'];
  const rates2025 = BAH_RATES_BY_YEAR['2025'];
  const mock2027 = (mha: string): Record<string, number> | null => {
    if (mha === 'TX270') return rates2025[mha]?.w ?? null;
    const w = rates2026[mha]?.w;
    return w ? Object.fromEntries(Object.entries(w).map(([g, v]) => [g, v + BUMP])) : null;
  };
  const MOCK: BahShareSource = {
    year: '2027',
    priorYear: '2026',
    mhaForZip: (zip) => ZIP_TO_MHA[zip] ?? null,
    priorMhaForZip: (zip) => ZIP_TO_MHA[zip] ?? null,
    ratesWithDeps: (mha, year) => (year === '2027' ? mock2027(mha) : year === '2026' ? rates2026[mha]?.w ?? null : null),
    midYearChange: (mha, year) => (year === '2026' ? BAH_MID_YEAR_CHANGES_BY_YEAR['2026']?.[mha] ?? null : null),
  };

  test('every CONUS station: 2027 label, 2027 rate, change from 2026', () => {
    for (const s of CONUS) {
      const d = bahShareData(s.slug, MOCK);
      expect(d, s.slug).not.toBeNull();
      expect(d!.headline, s.slug).toBe(`${s.name} BAH 2027`);
      expect(d!.year).toBe('2027');
      expect(d!.effectiveLabel, s.slug).toBe('January 1, 2027');
      expect(d!.e5.rate, s.slug).toBe(mock2027(d!.mhaCode)!['E-5']);
      if (d!.mhaCode === 'TX270') continue;
      const prior = rates2026[d!.mhaCode].w['E-5'];
      expect(d!.changeLine, s.slug).toBe(`${expectedChange(prior + BUMP, prior)} from 2026`);
    }
  });

  test('prior-year temporary increase (TX270 after the flip): change left out', () => {
    const d = bahShareData('dyess-afb', MOCK)!;
    expect(d.e5.rate).toBe(rates2025.TX270.w['E-5']);
    expect(d.changeLine).toBe('See page for details');
    expect(d.showChanges).toBe(false);
  });

  test('image URL follows the year', () => {
    expect(bahShareImageUrl('fort-bragg', 'portrait', '2027')).toContain('&y=2027&');
  });

  test('every CONUS station renders in both formats under 2027', async () => {
    test.setTimeout(240_000);
    for (const s of CONUS) {
      for (const format of ['preview', 'portrait'] as const) {
        const size = pngSize(await renderPng(s.slug, format, MOCK));
        expect(size, `${s.slug} ${format}`).toEqual(BAH_SHARE_FORMATS[format]);
      }
    }
  });
});
