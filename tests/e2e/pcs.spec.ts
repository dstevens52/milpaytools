import { test, expect, type Page } from '@playwright/test';

// PCS calculator section labels are rendered as small-caps uppercase headings.
// Entitlement row labels appear in the results panel on the right side.
// Many terms (DLA, MALT, TLE) also appear in the explainer text below — use .first()
// or target specific roles/elements to avoid strict mode violations.

test.describe('PCS Cost Estimator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/pcs');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/PCS/i);
  });

  test('default state shows DLA in results', async ({ page }) => {
    // DLA row label appears in the right-side results panel
    await expect(page.getByText('Dislocation Allowance (DLA)').first()).toBeVisible();
  });

  test('MALT is shown for default 500-mile move', async ({ page }) => {
    await expect(page.getByText(/MALT|Monetary Allowance/i).first()).toBeVisible();
  });

  test('government move type is selected by default', async ({ page }) => {
    // The Government Move radio input is checked by default
    await expect(page.locator('input[name="moveType"][value="gov"]')).toBeChecked();
  });

  test('switching to Full PPM shows the PPM incentive explanation, no dollar figure', async ({ page }) => {
    // Move type uses radio inputs inside label elements, not buttons
    await page.locator('label').filter({ hasText: 'Full PPM / DITY' }).click();
    const panel = page.getByTestId('pcs-ppm-panel');
    await expect(panel).toContainText('100% of the Government Constructed Cost (GCC)');
    await expect(panel).toContainText('MilMove or DPS');
    const text = await panel.innerText();
    expect(text.length).toBeGreaterThan(100);
    expect(text).not.toMatch(/\$\d/); // no PPM dollar figure (audit PCS-06)
    await expect(page.getByText('Gross reimbursement estimate')).toHaveCount(0);
  });

  test('with-dependents toggle is active by default', async ({ page }) => {
    // Default hasDependents = true
    await expect(page.getByText(/with dependents|dependent/i).first()).toBeVisible();
  });

  test('TLE section row appears in results', async ({ page }) => {
    // Whole word: a case-insensitive /TLE/ also matches "EnTiTLEment" (the nav's
    // hidden "VA Entitlement Calculator" link, build V2).
    await expect(page.getByText(/Temporary Lodging|\bTLE\b/).first()).toBeVisible();
  });

  test('weight allowance is shown', async ({ page }) => {
    await expect(page.getByText(/weight allowance|lbs/i).first()).toBeVisible();
  });

  test('total entitlements row is highlighted', async ({ page }) => {
    await expect(page.getByText(/Total.*Government|Government.*Total|Total.*Entitlement/i).first()).toBeVisible();
  });

  test('PPM advance amount row appears for PPM moves', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Full PPM / DITY' }).click();
    await expect(page.getByText(/advance|60%.*advance/i).first()).toBeVisible();
  });

  test('action step links to BAH calculator', async ({ page }) => {
    await expect(page.getByRole('link', { name: /BAH/i }).first()).toBeVisible();
  });

  test('O-5 rank is selectable', async ({ page }) => {
    const rankSelect = page.locator('#rank');
    await rankSelect.selectOption('O-5');
    // Weight allowance should update (O-5 has higher allowance than E-5)
    await expect(page.getByText(/weight|lbs/i).first()).toBeVisible();
  });

  test('per diem row shows in results', async ({ page }) => {
    await expect(page.getByText(/Per diem|Per Diem/i).first()).toBeVisible();
  });

  // ── Destination station page cross-links ────────────────────────────────────

  test('destination ZIP matching a station MHA shows station guide link', async ({ page }) => {
    // 28301 is Fort Bragg's station ZIP → NC182 MHA → Fort Bragg /bah/ page
    await page.getByLabel('Moving to (optional)').pressSequentially('28301', { delay: 50 });
    await expect(page.getByRole('link', { name: /Moving to Fort Bragg/i })).toBeVisible();
  });

  test('non-station ZIP in a base MHA shows station guide link via MHA lookup', async ({ page }) => {
    // 28310 is a Fort Bragg area ZIP (not the station ZIP 28301) — MHA lookup should still find it
    await page.getByLabel('Moving to (optional)').pressSequentially('28310', { delay: 50 });
    await expect(page.getByRole('link', { name: /Moving to Fort Bragg/i })).toBeVisible();
  });

  test('destination ZIP with no station page shows no station guide link', async ({ page }) => {
    // 66062 is Olathe, KS — residential area with no military base page
    await page.getByLabel('Moving to (optional)').pressSequentially('66062', { delay: 50 });
    await expect(page.getByRole('link', { name: /Moving to/i })).not.toBeVisible();
  });
});

// ── Build 07: JTR rules in the results panel (docs/sources/pcs-rules-2026.md) ──

async function resultsText(page: Page, waitFor: string): Promise<string> {
  const results = page.getByTestId('pcs-results');
  // URL params apply after hydration — wait for them before reading figures.
  await expect(results).toContainText(waitFor);
  return (await results.innerText()).replace(/\s+/g, ' ');
}

test.describe('PCS estimator — JTR rules (build 07)', () => {
  test('E-5, spouse + 2 children under 12, 1,120 miles', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e5&dep=yes&dep12=1&depu12=2&movetype=gov&miles=1120&povs=1');
    const text = await resultsText(page, '1,120 miles');
    for (const v of [
      '4 travel days · 1,120 miles', // 1,120 ÷ 350 = 3 r 70 → 4 (was 3)
      '$5,769', // total
      '$3,548.02', // DLA
      '$229.60', // MALT
      '$724.00', // per diem — member: 4 × $181, no 75% day
      '$1,267.00', // dependents: 75% + 50% + 50%
      'Per Diem — Dependents (3)',
      '9,000 lbs', // E-5 with dependents
    ]) {
      expect(text, `missing "${v}"`).toContain(v);
    }
    expect(text).not.toContain('75% on');
  });

  test('TLE: "up to" ceiling by family size, $290 cap, 21-day total', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e5&dep=yes&dep12=1&depu12=3&movetype=gov&miles=1000&tleold=14&tlenew=14');
    const text = await resultsText(page, '1,000 miles');
    expect(text).toContain('TLE (21 days)');
    expect(text).toContain('Up to $6,090.00'); // 21 × $290 (175% × $181 = $316.75 → cap)
    expect(text).toContain('up to $290.00/day');
    await expect(page.getByTestId('pcs-tle-days-note')).toContainText('You entered 28; the estimate counts 21.');
  });

  test('single member: TLE at 65%, weight from the without-dependents column', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e4&dep=no&movetype=gov&miles=1000&tleold=10');
    const text = await resultsText(page, '1,000 miles');
    expect(text).toContain('Up to $1,176.50'); // 10 × 65% × $181
    expect(text).toContain('7,000 lbs'); // E-4 without dependents
  });

  test('no dependent traveling: second-POV MALT not paid', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e5&dep=no&movetype=gov&miles=1120&povs=2');
    const text = await resultsText(page, '1,120 miles');
    expect(text).toContain('$229.60'); // one POV (was $459.20)
    expect(text).not.toContain('$459.20');
    await expect(page.getByTestId('pcs-second-pov-note')).toBeVisible();
  });

  test('distance 0: DLA and TLE not counted, note shown', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e5&dep=yes&dep12=1&movetype=gov&miles=0&tleold=5');
    await expect(page.getByTestId('pcs-local-move-note')).toBeVisible();
    const text = await resultsText(page, '0 miles');
    expect(text).toContain('Not counted');
    expect(text).toContain('rate: $3,548.02');
    expect(text).toContain('Government move entitlements total $0');
  });

  test('prior-enlisted officer: ?rank=o1e loads O-1E with its own DLA', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=o1e&dep=yes&dep12=1&movetype=gov&miles=1000');
    await expect(page.locator('#rank')).toHaveValue('O-1E');
    const text = await resultsText(page, '1,000 miles');
    expect(text).toContain('$3,621.10');
    expect(text).toContain('12,000 lbs'); // O-1 row, with dependents
    await expect(page.locator('#rank optgroup[label="Officer (prior enlisted)"] option')).toHaveCount(3);
  });

  test('share link carries every input, including the dependent age split', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __copied: string[] }).__copied = [];
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (t: string) => { (window as unknown as { __copied: string[] }).__copied.push(t); } },
      });
    });
    await page.goto('/calculators/pcs?rank=o2e&dep=yes&dep12=2&depu12=3&movetype=partial-ppm&miles=1500&povs=2&hhg=4000&tleold=6&tlenew=9');
    await resultsText(page, '1,500 miles');
    await page.getByRole('button', { name: 'Copy result link' }).click();
    const handle = await page.waitForFunction(() => {
      const c = (window as unknown as { __copied: string[] }).__copied;
      return c.length > 0 ? c[c.length - 1] : null;
    });
    const url = new URL((await handle.jsonValue()) as string);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      rank: 'o2e', dep: 'yes', dep12: '2', depu12: '3', movetype: 'partial-ppm',
      miles: '1500', povs: '2', hhg: '4000', tleold: '6', tlenew: '9',
    });
  });

  test('computed figures in the page copy keep their spaces (JSX line-wrap guard)', async ({ page }) => {
    await page.goto('/calculators/pcs?movetype=full-ppm&miles=1000');
    await resultsText(page, '1,000 miles');
    const text = await page.locator('main').innerText();
    expect(text.length).toBeGreaterThan(2000);
    expect(text.match(/\d%[A-Za-z]/g)).toBeNull();
    expect(text.match(/\$\d[\d,.]*[A-Za-z]/g)).toBeNull();
    expect(text.match(/[\w)]·/g)).toBeNull(); // "Table 5-37· pro-gear"
  });

  test('default state: a prompt instead of figures, and no "$0" in the server HTML', async ({ page, request }) => {
    const prompt = 'Enter your old and new duty stations to see your estimate';
    const res = await request.get('/calculators/pcs');
    expect(res.status()).toBe(200);
    const html = (await res.text()).replace(/<!-- -->/g, '');
    const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ');
    expect(text.length).toBeGreaterThan(5000);
    expect(text).toContain(prompt);
    expect(text).toContain('$3,548.02'); // DLA rate shown for reference
    expect(text.match(/\$0(?![.,]?\d)/g)).toBeNull(); // "$0.205" is a rate, not a $0 figure

    await page.goto('/calculators/pcs');
    await expect(page.getByTestId('pcs-needs-input')).toHaveText(prompt);
    const results = (await page.getByTestId('pcs-results').innerText()).replace(/\s+/g, ' ');
    expect(results).not.toMatch(/\$0(?![.,]?\d)/);
    expect(results).not.toContain('Government move entitlements total');

    // Entering a mileage replaces the prompt with figures.
    await page.locator('#distance').fill('1120');
    await expect(page.getByTestId('pcs-needs-input')).toHaveCount(0);
    await expect(page.getByTestId('pcs-results')).toContainText('4 travel days · 1,120 miles');
  });

  test('retired post 301-redirects to the calculator', async ({ request }) => {
    const res = await request.get('/blog/pcs-that-costs-14000-vs-makes-6000', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/calculators/pcs');
  });

  test('old share link (numdep=2) reads as two dependents 12 or older', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e5&dep=yes&numdep=2&movetype=gov&miles=1000');
    await resultsText(page, '1,000 miles');
    await expect(page.locator('#depsAge12Plus')).toHaveValue('2');
    await expect(page.locator('#depsUnder12')).toHaveValue('0');
  });
});
