import { test, expect, type Page } from '@playwright/test';

// SEP-01 (math-audit-round-2): the BDD window runs 180 to 90 days before separation. A past
// opening date reads "Expired" only once the window has closed. Today is pinned to Jun 1, 2026.
test.describe('Separation timeline — BDD window status (SEP-01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 5, 1, 10, 0, 0));
  });

  test('separation 150 days out: window open, not expired', async ({ page }) => {
    // Oct 29, 2026: window opened May 2 (30 days ago), closes Jul 31.
    await page.goto('/calculators/separation-timeline?date=2026-10-29');
    const card = page.getByTestId('timeline-item-bdd-opens');
    await expect(card).toContainText('Active now');
    await expect(card).toContainText('Opened 30 days ago');
    await expect(card).not.toContainText('Expired');
    await expect(page.getByTestId('timeline-item-bdd-closes')).toContainText('60 days away');
  });

  test('separation 90 days out: last day of the window is still open', async ({ page }) => {
    // Aug 30, 2026: window opened Mar 3 (90 days ago), closes today.
    await page.goto('/calculators/separation-timeline?date=2026-08-30');
    await expect(page.getByTestId('timeline-item-bdd-opens')).toContainText('Active now');
    await expect(page.getByTestId('timeline-item-bdd-opens')).toContainText('Opened 90 days ago');
  });

  test('separation 60 days out: window closed, opening reads expired', async ({ page }) => {
    // Jul 31, 2026: window opened Feb 1 and closed May 2.
    await page.goto('/calculators/separation-timeline?date=2026-07-31');
    await expect(page.getByTestId('timeline-item-bdd-opens')).toContainText('Expired');
    await expect(page.getByTestId('timeline-item-bdd-closes')).toContainText('Expired');
  });

  test('separation 200 days out: window not yet open', async ({ page }) => {
    // Dec 18, 2026: window opens Jun 21 (20 days away).
    await page.goto('/calculators/separation-timeline?date=2026-12-18');
    await expect(page.getByTestId('timeline-item-bdd-opens')).toContainText('Approaching');
    await expect(page.getByTestId('timeline-item-bdd-opens')).toContainText('20 days away');
  });
});


// Build 10a: SEP-02–05. Today pinned to Nov 20, 2026.
test.describe('Separation timeline — rules (build 10a)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
  });

  test('SEP-03/04: TAMP ends Aug 27, VGLI deadline Jun 29, 2028 for Mar 1, 2027', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-03-01&type=separating&tamp=yes');
    await expect(page.getByTestId('timeline-item-tamp')).toContainText('Aug 27, 2027');
    await expect(page.getByTestId('timeline-item-tamp')).toContainText('day 1');
    await expect(page.getByTestId('timeline-item-vgli-closes')).toContainText('Jun 29, 2028');
    await expect(page.locator('main')).not.toContainText('485');
  });

  test('SEP-03: Jun 1, 2027 → Sep 29, 2028', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01');
    await expect(page.getByTestId('timeline-item-vgli-closes')).toContainText('Sep 29, 2028');
  });

  test('SEP-04: preseparation counseling card 365 days before', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-12-01');
    const card = page.getByTestId('timeline-item-tap-start');
    await expect(card).toContainText('Start Preseparation Counseling');
    await expect(card).toContainText('Dec 1, 2026');
    await expect(card).toContainText('no later than 365 days');
  });

  test('SEP-02: retiring shows retiree TRICARE enrollment, no TAMP', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01&type=retiring&tamp=yes');
    await expect(page.getByTestId('timeline-item-retiree-tricare')).toBeVisible();
    await expect(page.getByTestId('timeline-item-tamp')).toHaveCount(0);
    await expect(page.locator('#tamp-select')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Estimate retiree TRICARE costs →' })).toHaveAttribute('href', '/calculators/healthcare-comparison?path=tricare-retiree');
  });

  test('SEP-05: impossible date shows the empty state', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2026-02-31');
    await expect(page.getByText('Enter your separation date above to see your timeline')).toBeVisible();
    await expect(page.locator('#sep-date')).toHaveValue('');
  });

  test('page example: computed VGLI dates, no 485 days, statutory TAMP list', async ({ page }) => {
    await page.goto('/calculators/separation-timeline');
    const main = page.locator('main');
    await expect(main).toContainText('VGLI final deadline (1 year and 120 days)');
    await expect(main).toContainText('January 28, 2028');
    await expect(main).toContainText('May 28, 2027');
    await expect(main).not.toContainText('485');
    await expect(page.getByTestId('tamp-eligibility').locator('li')).toHaveCount(7);
    await expect(main).not.toContainText(/early retirement programs|special separation benefits/i);
  });
});

test.describe('Separation Benefits Timeline Calculator', () => {
  // Run serially — parallel execution with shared localhost causes flaky date-fill behavior
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/separation-timeline');
  });

  /**
   * Set the separation date cross-browser.
   * webkit's <input type="date"> doesn't reliably fire React onChange via fill() +
   * programmatic events, so we navigate with ?date= which is proven to work on all browsers.
   */
  async function fillDate(page: Page, date: string) {
    await page.goto(`/calculators/separation-timeline?date=${date}`);
  }

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Separation Benefits Timeline/i);
  });

  test('empty state prompts user to enter date', async ({ page }) => {
    await expect(page.getByText(/enter your separation date/i).first()).toBeVisible();
  });

  test('entering a future date shows timeline', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i).first()).toBeVisible();
    await expect(page.getByText(/TRICARE Active-Duty Coverage Ends/i).first()).toBeVisible();
    await expect(page.getByText(/SGLI Free Coverage Ends/i).first()).toBeVisible();
    await expect(page.getByText(/VGLI Application Window Closes/i).first()).toBeVisible();
  });

  test('pre-separation section appears for a far-future date', async ({ page }) => {
    await fillDate(page, '2028-01-01');
    await expect(page.locator('section[aria-label="Pre-Separation"]')).toBeVisible();
    await expect(page.getByText(/TAP Completion Deadline/i).first()).toBeVisible();
  });

  test('post-separation section appears after date is entered', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.locator('section[aria-label="Post-Separation"]')).toBeVisible();
    // Exact match avoids strict mode — intro paragraph and badge also match the loose regex
    await expect(page.getByText('Final Move Deadline', { exact: true })).toBeVisible();
  });

  test('separating type shows 180-day final move deadline text', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    // Default is separating — text should mention 180 days
    await expect(page.getByText(/180 days/i).first()).toBeVisible();
  });

  test('switching to retiring changes final move text to 3 years', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await page.getByRole('button', { name: /retiring/i }).click();
    // "3 years" appears in both card and explainer; first() avoids strict mode
    await expect(page.getByText(/3 years/i).first()).toBeVisible();
  });

  test('switching back to separating removes 3 years from final move card', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await page.getByRole('button', { name: /retiring/i }).click();
    await page.getByRole('button', { name: /separating/i }).click();
    // "3 years from retirement date" is unique to the card body — not in the static explainer
    await expect(page.getByText(/3 years from retirement date/i)).not.toBeVisible();
  });

  test('TAMP shown by default (not sure)', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.getByText(/TAMP Coverage Period/i).first()).toBeVisible();
  });

  test('TAMP shown when set to Yes', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    // Wait for timeline to confirm React committed the date before interacting with select
    await expect(page.getByText(/TAMP Coverage Period/i).first()).toBeVisible();
    await page.locator('select#tamp-select').selectOption('yes');
    await expect(page.getByText(/TAMP Coverage Period/i).first()).toBeVisible();
  });

  test('TAMP hidden when set to No', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i).first()).toBeVisible();
    await page.locator('select#tamp-select').selectOption('no');
    await expect(page.getByText(/TAMP Coverage Period/i).first()).not.toBeVisible();
  });

  test('BDD window visible when VA claim not filed', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    // exact:true matches only the card heading — not the description span with different case/text
    await expect(page.getByText('BDD Filing Window Opens', { exact: true })).toBeVisible();
    await page.locator('select#va-select').selectOption('no');
    await expect(page.getByText('BDD Filing Window Opens', { exact: true })).toBeVisible();
  });

  test('BDD window hidden when VA claim already filed', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i).first()).toBeVisible();
    await page.locator('select#va-select').selectOption('yes');
    // exact:true ensures we only check the card heading, not description spans
    await expect(page.getByText('BDD Filing Window Opens', { exact: true })).not.toBeVisible();
  });

  test('SHPE/SHA always visible regardless of VA toggle', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await page.locator('select#va-select').selectOption('yes');
    // Exact card title — avoids matching the longer card body text
    await expect(page.getByText('Schedule SHPE / SHA')).toBeVisible();
  });

  test('share button appears after entering a date', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    // Desktop viewport (config default): "Share result" is mobile-only, so check "Copy result link".
    await expect(page.getByRole('button', { name: 'Copy result link', exact: true })).toBeVisible();
  });

  test('print button appears after entering a date', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.getByRole('button', { name: /print|save as pdf/i })).toBeVisible();
  });

  test('URL params pre-populate date and type', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01&type=retiring&tamp=no');
    await expect(page.getByLabel(/separation date/i)).toHaveValue('2027-06-01');
    // Retiring: the TAMP question is hidden (retirees enroll in retiree TRICARE; SEP-02, build 10a).
    await expect(page.getByLabel(/TAMP Eligible/i)).toHaveCount(0);
    await expect(page.getByText(/TAMP Coverage Period/i).first()).not.toBeVisible();
    // "3 years" appears in card body and explainer; first() avoids strict mode
    await expect(page.getByText(/3 years/i).first()).toBeVisible();
  });

  test('URL param va=yes hides BDD window', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01&va=yes');
    await expect(page.getByText('BDD Filing Window Opens', { exact: true })).not.toBeVisible();
  });

  test('separation day section always shows', async ({ page }) => {
    await fillDate(page, '2027-01-15');
    await expect(page.locator('section[aria-label="Separation Day"]')).toBeVisible();
  });

  test('mobile responsive: timeline visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await fillDate(page, '2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i).first()).toBeVisible();
    await expect(page.getByText(/SGLI Free Coverage Ends/i).first()).toBeVisible();
  });
});

// Build 10a content sweep: posts that repeated the fixed claims.
test.describe('Separation rules in posts (build 10a)', () => {
  test('TAMP post: statutory list, day 1, no VSI/SSB', async ({ page }) => {
    await page.goto('/blog/tamp-healthcare-after-military-separation');
    const article = page.locator('main');
    await expect(page.getByTestId('tamp-eligibility').locator('li')).toHaveCount(7);
    await expect(article).toContainText('A voluntary separation at the end of an enlistment does not qualify on its own; it does if you join the Selected Reserve.');
    await expect(article).toContainText('starts on your separation date: that date is day 1');
    await expect(article).not.toContainText(/\(SSB, VSI\)|TAMP begins after your official separation date/);
  });

  test('SGLI FAQ (FAQPage JSON-LD): 1 year and 120 days; evidence of good health after 240 days', async ({ page }) => {
    await page.goto('/blog/is-sgli-enough-life-insurance');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(ld).toContain('within 1 year and 120 days of separation');
    expect(ld).toContain('after 240 days you’ll need to submit evidence of good health');
    expect(ld).not.toContain('After 240 days, a medical exam is required.');
  });
});
