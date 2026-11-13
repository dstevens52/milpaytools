import { test, expect, type Page } from '@playwright/test';
import { DATA_LAST_CHECKED } from '@/data/watch';
import { formatIsoDate } from '@/lib/calculations/payRaise';
import {
  BAH_2027_STATUS,
  bah2027NoticeText,
  bah2027FaqAnswer,
  bah2027FaqQuestion,
  type Bah2027StatusConfig,
} from '@/data/bah/2027-status';
import { bahNoticeMode } from '@/lib/calculations/bahTransition';

// Dated "2027 BAH rates" notice: CONUS station pages + /bah hub, never OCONUS.
// It shows only in the 'next-year-status' mode (BAH_YEAR before 2027). Once
// 2027 rates are loaded the page checks flip to "notice and FAQ are gone".
const SHOWS_NOTICE = bahNoticeMode() === 'next-year-status';

const CHECKED = formatIsoDate(DATA_LAST_CHECKED);

async function faqQuestions(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = blocks.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
  return faq ? faq.mainEntity.map((q: { name: string }) => q.name) : [];
}

for (const s of [
  { slug: 'fort-bragg', name: 'Fort Bragg' },
  { slug: 'naval-station-norfolk', name: 'Naval Station Norfolk' },
]) {
  test(`${s.slug}: notice visible, dated, FAQ in JSON-LD`, async ({ page }) => {
    test.skip(!SHOWS_NOTICE, 'BAH_YEAR is past 2026: the notice is removed (checked below)');
    await page.goto(`/bah/${s.slug}`);
    const notice = page.getByTestId('bah-2027-notice');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(`not yet published as of ${CHECKED}`);
    await expect(notice).toContainText('December 11, 2025');
    await expect(notice).toContainText(`This page will show 2027 rates for ${s.name} once DoD publishes them.`);
    await expect(notice.getByRole('link', { name: /2027 base pay raise/ })).toHaveAttribute('href', '/pay/raise');
    expect(await faqQuestions(page)).toContain(`When will 2027 BAH rates for ${s.name} be released?`);
    // Visible FAQ matches the schema.
    await expect(page.getByText(`When will 2027 BAH rates for ${s.name} be released?`)).toBeVisible();
  });
}

test('OCONUS v2 station page has no 2027 BAH notice', async ({ page }) => {
  const res = await page.goto('/bah/ramstein-air-base');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByTestId('bah-2027-notice')).toHaveCount(0);
  expect((await faqQuestions(page)).some((q) => q.includes('2027 BAH'))).toBe(false);
});

test('after the 2027 import: no 2027 notice or "When will…" FAQ on /bah or station pages', async ({ page }) => {
  test.skip(SHOWS_NOTICE, 'notice mode is next-year-status (BAH_YEAR 2026)');
  for (const path of ['/bah', '/bah/fort-bragg']) {
    await page.goto(path);
    await expect(page.getByTestId('bah-2027-notice')).toHaveCount(0);
    expect((await faqQuestions(page)).some((q) => q.startsWith('When will 2027 BAH rates'))).toBe(false);
  }
});

test('/bah hub shows the notice without a station name', async ({ page }) => {
  test.skip(!SHOWS_NOTICE, 'BAH_YEAR is past 2026: the notice is removed');
  await page.goto('/bah');
  const notice = page.getByTestId('bah-2027-notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(`not yet published as of ${CHECKED}`);
  await expect(notice).not.toContainText('This page will show 2027 rates for');
});

test.describe('2027 BAH wording (data-only)', () => {
  test('pending wording matches the spec exactly', () => {
    expect(BAH_2027_STATUS.status).toBe('pending');
    expect(BAH_2027_STATUS.lastChecked).toBe(DATA_LAST_CHECKED);
    expect(bah2027NoticeText('Fort Bragg')).toBe(
      `2027 BAH rates: not yet published as of ${CHECKED}. DoD usually releases next year's rates in mid-December (the 2026 rates came out December 11, 2025); they take effect January 1, 2027. The rates below are 2026 rates, in effect through December 31, 2026. This page will show 2027 rates for Fort Bragg once DoD publishes them.`,
    );
    const faq = bah2027FaqAnswer('Fort Bragg');
    expect(bah2027FaqQuestion('Fort Bragg')).toBe('When will 2027 BAH rates for Fort Bragg be released?');
    for (const d of ['December 11, 2025', 'December 13, 2024', 'December 14, 2023', 'mid-December']) {
      expect(faq).toContain(d);
    }
    // Dated facts only: no promised date, no direction-of-change claims, no advice.
    for (const t of [bah2027NoticeText('Fort Bragg'), bah2027NoticeText(), faq]) {
      expect(t).not.toMatch(/\bshould\b|plan for|expect|increase|decrease|rise|fall/i);
    }
  });

  test('released wording includes the released date', () => {
    const fixture: Bah2027StatusConfig = { ...BAH_2027_STATUS, status: 'released', releasedDate: '2026-12-12' };
    expect(bah2027NoticeText('Fort Bragg', fixture)).toBe(
      "DoD published 2027 BAH rates on December 12, 2026, effective January 1, 2027. We're updating this page; until then, check the official DoD BAH lookup.",
    );
    expect(bah2027FaqAnswer('Fort Bragg', fixture)).toContain('December 12, 2026');
    expect(() => bah2027NoticeText(undefined, { ...BAH_2027_STATUS, status: 'released' })).toThrow();
  });
});
