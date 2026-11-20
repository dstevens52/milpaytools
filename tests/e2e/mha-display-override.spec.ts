import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { BAH_YEAR } from '../../src/data/bah/current';
import { currentMhaNames, currentZipToMha, getLocationName, getLocationDisplayName } from '../../src/lib/calculations/bah';
import { MHA_DISPLAY_OVERRIDES, displayMhaName, formatMhaName } from '../../src/lib/mhaDisplay';
import { STATION_BY_SLUG } from '../../src/data/duty-stations/stations';

/**
 * Documented display-name overrides for DTMO typos (src/lib/mhaDisplay.ts), S8.
 * Today: GA073, which DTMO's names file lists as "FORT GORDON, AL".
 * Data part runs without a server; the page part needs the dev server.
 */

const ROOT = path.join(__dirname, '../..');
const DTMO_DIR = path.join(ROOT, 'data/sources/dtmo', BAH_YEAR);
const GORDON = STATION_BY_SLUG['fort-gordon'];

/** The DTMO names file for the current BAH year, as [1-based line number, code, name]. */
function dtmoNames(): [number, string, string][] {
  const file = readdirSync(DTMO_DIR).find((f) => /^mhanames\d{2}\.txt$/i.test(f));
  expect(file, `no mhanamesYY.txt in ${DTMO_DIR}`).toBeTruthy();
  const lines = readFileSync(path.join(DTMO_DIR, file!), 'utf8').split(/\r?\n/);
  return lines
    .map((l, i) => [i + 1, ...l.split(';')] as [number, string, string])
    .filter(([, code, name]) => code && name);
}

test.describe('MHA display overrides — data', () => {
  test('DTMO still publishes each overridden name; remove the override once DTMO fixes it', () => {
    const rows = dtmoNames();
    expect(rows.length).toBeGreaterThan(300); // control: the real names file
    const codes = Object.keys(MHA_DISPLAY_OVERRIDES);
    expect(codes).toContain('GA073');
    for (const code of codes) {
      const row = rows.find(([, c]) => c === code);
      expect(row, `${code} missing from DTMO's ${BAH_YEAR} names file`).toBeTruthy();
      expect(
        row![2].toUpperCase(),
        `DTMO's ${BAH_YEAR} names file now says "${row![2]}" for ${code}. If that's the fix, delete ${code} from MHA_DISPLAY_OVERRIDES (src/lib/mhaDisplay.ts) and this expectation.`,
      ).toBe(MHA_DISPLAY_OVERRIDES[code].dtmoName.toUpperCase());
    }
  });

  test('the 2026 typo is at mhanames26.txt line 74, as the override comment cites', () => {
    test.skip((BAH_YEAR as string) !== '2026', 'line number cited for the 2026 file only');
    const row = dtmoNames().find(([, c]) => c === 'GA073');
    expect(row).toEqual([74, 'GA073', 'FORT GORDON, AL']);
  });

  test('the stored name stays identical to DTMO; only the display changes', () => {
    expect(currentMhaNames()['GA073']).toBe('Fort Gordon, AL');
    expect(currentZipToMha()[GORDON.zip]).toBe('GA073'); // control: the station's ZIP is in GA073
    expect(getLocationName(GORDON.zip)).toBe('Fort Gordon, AL');
    expect(getLocationDisplayName(GORDON.zip)).toBe('Fort Gordon, GA');
    expect(displayMhaName('GA073', 'Fort Gordon, AL')).toBe('Fort Gordon, GA');
    expect(displayMhaName('GA073', 'FORT GORDON, AL')).toBe('Fort Gordon, GA');
  });

  test('the override is keyed by code and stops once the stored name changes', () => {
    // Same text under another code: not overridden.
    expect(displayMhaName('AL007', 'Fort Gordon, AL')).toBe('Fort Gordon, AL');
    // A corrected DTMO name passes through formatMhaName unchanged.
    expect(displayMhaName('GA073', 'Fort Gordon, GA')).toBe('Fort Gordon, GA');
    // No code: casing only.
    expect(displayMhaName(null, 'Davis-Monthan Afb, AZ')).toBe('Davis-Monthan AFB, AZ');
    // Every other code gets exactly formatMhaName.
    for (const [code, name] of Object.entries(currentMhaNames())) {
      if (code in MHA_DISPLAY_OVERRIDES) continue;
      expect(displayMhaName(code, name), code).toBe(formatMhaName(name));
    }
  });

  test('every display path goes through displayMhaName', () => {
    const grep = (pattern: string) => {
      try {
        return execFileSync('git', ['grep', '-n', '-F', pattern, '--', 'src'], { cwd: ROOT, encoding: 'utf8' })
          .split('\n')
          .filter(Boolean)
          // Code only: drop doc-comment and line-comment mentions ("path:N:   * text").
          .filter((l) => !/^[^:]+:\d+:\s*(\*|\/\/|\/\*)/.test(l));
      } catch {
        return []; // git grep exits 1 on no match
      }
    };
    expect(grep('displayMhaName(').length).toBeGreaterThanOrEqual(5); // control: the grep runs
    // formatMhaName is only called inside mhaDisplay.ts.
    expect(grep('formatMhaName(').filter((l) => !l.startsWith('src/lib/mhaDisplay.ts:'))).toEqual([]);
    // Raw ZIP → name lookups only where raw is the contract (API) or wrapped right after (station page).
    expect(
      grep('getLocationName(').filter(
        (l) =>
          !l.startsWith('src/lib/calculations/bah.ts:') &&
          !l.startsWith('src/app/api/bah/lookup/route.ts:') &&
          !l.startsWith('src/app/bah/[slug]/page.tsx:'),
      ),
    ).toEqual([]);
  });
});

test.describe('MHA display overrides — pages', () => {
  test('station page body says "Fort Gordon, GA", never "Fort Gordon, AL"', async ({ page }) => {
    await page.goto(`/bah/${GORDON.slug}`);
    const main = page.locator('main');
    await expect(main).toContainText('Fort Gordon, GA');
    await expect(main).not.toContainText('Fort Gordon, AL');
  });

  test('/bah/changes shows the GA073 row as "Fort Gordon, GA"', async ({ page }) => {
    await page.goto('/bah/changes');
    const row = page.getByTestId('bah-changes-table').locator('tr[data-mha="GA073"]');
    await expect(row).toContainText('Fort Gordon, GA');
    await expect(page.locator('main')).not.toContainText('Fort Gordon, AL');
  });

  test('ZIP lookup result shows "Fort Gordon, GA"; the API keeps DTMO\'s name', async ({ page, request }) => {
    const api = await (await request.get(`/api/bah/lookup?zip=${GORDON.zip}`)).json();
    expect(api.mha).toBe('GA073');
    expect(api.locationName).toBe('Fort Gordon, AL');

    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially(GORDON.zip, { delay: 50 });
    await expect(page.getByText('Fort Gordon, GA').first()).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Fort Gordon, AL');
  });
});
