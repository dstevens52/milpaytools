/**
 * Rate-protection wording guard (feat/bah-2027-what-we-know).
 *
 * Rule (DTMO FAQ): protection ends only with a REDUCTION in pay grade or a change
 * in dependency status; a promotion does not end it. The approved text lives in
 * src/data/bah/rateProtection.ts. This spec fails if any old wording comes back,
 * in the source tree or in the rendered HTML of every page that states the rule
 * (including the ZIP and dual-military calculator steps, which render after a lookup).
 */

import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..');

/** Old wording, phrase-specific (plain "same pay grade" is fine elsewhere, e.g. same-MHA FAQs). */
const OLD_WORDING: RegExp[] = [
  /promotion or demotion/i,
  /grandfather/i,
  /remained at this duty station with the same pay grade/i,
  /change pay grade/i,
  /pay grade changes\*{0,2} \(promotion/i,
  /pay grade, duty station,? and dependency status (?:stay the same|don(?:'|&apos;|’)t change)/i,
  /grade, duty station,? and dependent status/i,
  /dependency status and duty station don(?:'|&apos;|’)t change/i,
  /grade and dependency status haven(?:'|&apos;|’)t changed/i,
  /your pay grade doesn(?:'|&apos;|’)t change/i,
  /resets? with a PCS, promotion/i,
  /same location with the same dependency status keeps/i,
  /whose dependency status changes in \d{4}/i,
];

const hits = (text: string) => OLD_WORDING.filter((re) => re.test(text)).map(String);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mdx?)$/.test(name)) out.push(p);
  }
  return out;
}

test.describe('Rate-protection wording: source tree', () => {
  test('no old wording in src/ (excluding the guard list in rateProtection.ts)', () => {
    const files = walk(join(ROOT, 'src'));
    expect(files.length).toBeGreaterThan(100); // an empty walk proves nothing
    const found: string[] = [];
    for (const f of files) {
      const rel = relative(ROOT, f).replace(/\\/g, '/');
      if (rel === 'src/data/bah/rateProtection.ts') continue;
      for (const h of hits(readFileSync(f, 'utf8'))) found.push(`${rel}: ${h}`);
    }
    expect(found).toEqual([]);
  });

  test('the patterns catch the old copy (control)', () => {
    expect(hits('as long as your pay grade, duty station, and dependency status stay the same')).toHaveLength(1);
    expect(hits('You receive a **promotion or demotion** (pay grade changes)')).toHaveLength(1);
    expect(hits('Rate protection resets when you PCS, change dependency status, or change pay grade.')).toHaveLength(1);
    expect(hits("keeps their rate as long as they have no reduction in pay grade and no change in dependency status")).toHaveLength(0);
  });
});

// Static pages that state the rule. Fort Bragg and JBSA show the decrease paragraph (2026 < 2025).
const PAGES = [
  '/bah',
  '/bah/fort-bragg',
  '/bah/joint-base-san-antonio',
  '/bah/fort-hood',
  '/calculators/dual-military-bah',
  '/guides/military-pay',
  '/guides/pcs',
  '/blog/bah-rates-2026-complete-guide',
  '/blog/best-worst-bah-duty-stations-2026',
  '/blog/what-is-bah-military-housing-allowance',
];

test.describe('Rate-protection wording: rendered HTML', () => {
  for (const path of PAGES) {
    test(`${path}: no old wording`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const html = await page.content();
      expect(html).toMatch(/rate protection/i); // the page does state the rule
      expect(hits(html)).toEqual([]);
    });
  }

  test('/bah/fort-bragg: decrease paragraph uses the approved text', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const p = page.getByTestId('bah-decrease-notice');
    await expect(p).toHaveAttribute('data-kind', 'rate-protection');
    await expect(p).toContainText("as long as they don't have a reduction in pay grade or a change in dependency status; a promotion doesn't end the protection.");
  });

  test('ZIP calculator step after a lookup', async ({ page }) => {
    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially('28307', { delay: 50 });
    await expect(page.getByText('you keep your current rate as long as you stay at this duty station with no reduction in pay grade and no change in dependency status.').first()).toBeVisible();
    expect(hits(await page.content())).toEqual([]);
  });

  test('dual-military calculator step after a lookup', async ({ page }) => {
    await page.goto('/calculators/dual-military-bah?rank1=e5&rank2=e5&zip=28310&dependents=yes');
    await expect(page.getByText('Rate protection applies to each member separately.').first()).toBeVisible();
    expect(hits(await page.content())).toEqual([]);
  });
});
