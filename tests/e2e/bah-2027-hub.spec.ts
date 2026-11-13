/**
 * feat/bah-2027-what-we-know:
 *  - /bah "#2027" section + its 4 FAQs, in pending / released / loaded modes
 *  - TX270 (Abilene/Dyess AFB) temporary increase: pending wording now, and the
 *    release-day path with a synthetic 2027 fixture (a test-only registry entry;
 *    no rehearsal branch needed)
 *  - station email alert: placement, one per CONUS page, no year after the flip
 *  - transition tense: "will receive" while BAH_EFFECTIVE_NOTICE is true
 *
 * Unit tests use fixtures; page tests check the live (pending) build.
 */

import { test, expect } from '@playwright/test';
import {
  BAH_2027_STATUS,
  bah2027Facts,
  bah2027FaqAnswer,
  bah2027HubFaqs,
  bah2027HubHeading,
  bah2027HubMode,
  bah2027HubStatusText,
  type Bah2027StatusConfig,
} from '@/data/bah/2027-status';
import { BAH_RELEASE_HISTORY, type BahRelease } from '@/data/bah/releaseHistory';
import { BAH_MID_YEAR_CHANGES_BY_YEAR, BAH_RATES_BY_YEAR } from '@/data/bah/registry';
import { hasDecreaseBetween } from '@/lib/calculations/bahStats';
import {
  bahAlertHeadline,
  bahAlertSource,
  bahDecreaseNotice,
  bahE5RateFaqAnswer,
  bahE5RateLead,
  bahTransitionText,
  type BahYearConfig,
} from '@/lib/calculations/bahTransition';
import { temporaryIncreasePendingText } from '@/data/bah/midYear';
import { RATE_PROTECTION_RULE } from '@/data/bah/rateProtection';

// Temporary-increase exception (approved wording, Nov 13, 2026).
const NEXT_YEAR_REPLACES = "so when a temporary increase ends, the next year's published rate replaces it.";

// No forecast language anywhere in the 2027 copy.
const ESTIMATE = /\bexpect(ed)? (to|increase)|estimat|project(ed|ion)|forecast|likely|predict|could rise|should rise/i;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RELEASED: Bah2027StatusConfig = {
  ...BAH_2027_STATUS,
  status: 'released',
  releasedDate: '2026-12-12',
  avgIncreasePct: 4.6,
  releaseSourceUrl: 'https://example.mil/2027-bah-release',
};
const RELEASED_NO_PCT: Bah2027StatusConfig = { ...RELEASED, avgIncreasePct: null };
const HISTORY_2027: readonly BahRelease[] = [
  { ratesYear: 2027, avgIncreasePct: 4.6, releasedDate: '2026-12-12', sourceUrl: 'https://example.mil/2027', sourceLabel: 'fixture' },
  ...BAH_RELEASE_HISTORY,
];

const CFG_TRANSITION: BahYearConfig = { year: '2027', priorYear: '2026', effectiveNotice: true };
const CFG_AFTER_JAN1: BahYearConfig = { year: '2027', priorYear: '2026', effectiveNotice: false };

// Synthetic 2027 TX270 row: every 2026 rate (the temporary, May 16 rate) minus $100.
const TX270_2026 = BAH_RATES_BY_YEAR['2026'].TX270;
const minus100 = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).map(([g, v]) => [g, v - 100]));
const TX270_2027_FIXTURE = { w: minus100(TX270_2026.w), wo: minus100(TX270_2026.wo) };
const TX270_MID_2026 = BAH_MID_YEAR_CHANGES_BY_YEAR['2026']!.TX270;

// ─── /bah #2027 section + FAQs (unit) ────────────────────────────────────────

test.describe('/bah #2027: modes (unit)', () => {
  test('pending: heading, status line, no figures, no estimates', () => {
    const mode = bah2027HubMode();
    expect(mode).toBe('pending');
    expect(bah2027HubHeading(mode)).toBe('2027 BAH rates: release date, increase history and rate protection');
    const status = bah2027HubStatusText(mode);
    expect(status).toContain('Not yet published as of November 13, 2026.');
    expect(status).toContain("DoD usually releases next year's BAH rates in mid-December; 2027 rates take effect January 1, 2027.");
    expect(status).toContain("Pages on this site switch to 2027 rates as soon as we've loaded and checked DoD's published rates.");
    expect(status).not.toMatch(/same day|the day DoD/i);
    expect(status).not.toMatch(ESTIMATE);
  });

  test('pending FAQs: release history as history, rate protection, pay raise; no forecast', () => {
    const faqs = bah2027HubFaqs();
    expect(faqs.map((f) => f.question)).toEqual([
      'When do 2027 BAH rates come out?',
      'How much will BAH go up in 2027?',
      'Can my BAH go down?',
      'Does the 2027 pay raise change BAH?',
    ]);
    expect(faqs[0].answer).toContain('the 2024 rates, December 14, 2023');
    expect(faqs[1].answer).toContain("DoD hasn't announced it.");
    expect(faqs[1].answer).toContain('4.2% for 2026, 5.4% for 2025 and 5.4% for 2024');
    expect(faqs[1].answer).toContain('rates in some areas fall');
    expect(faqs[2].answer).toContain(RATE_PROTECTION_RULE);
    expect(faqs[2].answer).toContain("A promotion doesn't end the protection.");
    expect(faqs[2].answer).toContain('temporary increases');
    expect(faqs[2].answer).toContain(NEXT_YEAR_REPLACES);
    expect(faqs[2].answer).not.toContain('the regular rate replaces it');
    expect(faqs[3].answer).toMatch(/^No\. /);
    expect(faqs[3].answer).toContain('[the 2027 pay raise](/pay/raise)');
    for (const f of faqs) expect(f.answer, f.question).not.toMatch(ESTIMATE);
  });

  test('released (BAH_YEAR still 2026): "are out", date, percent only when set', () => {
    const mode = bah2027HubMode(RELEASED, '2026');
    expect(mode).toBe('released');
    expect(bah2027HubHeading(mode)).toBe('2027 BAH rates are out');
    expect(bah2027HubStatusText(mode, RELEASED)).toBe(
      "DoD published 2027 BAH rates on December 12, 2026, effective January 1, 2027. DoD reported a national average increase of 4.6%. Pages on this site switch to 2027 rates as soon as we've loaded and checked DoD's published rates.",
    );
    expect(bah2027HubStatusText(mode, RELEASED_NO_PCT)).not.toMatch(/%/);
    const faqs = bah2027HubFaqs(RELEASED, '2026');
    expect(faqs[0].answer).toContain('DoD published 2027 BAH rates on December 12, 2026');
    expect(faqs[1].answer).toContain('national average increase of 4.6%');
    expect(bah2027HubFaqs(RELEASED_NO_PCT, '2026')[1].answer).not.toContain('4.6');
  });

  test('loaded (BAH_YEAR 2027): "are out"; facts prefer the 2027 history row; works with no data at all', () => {
    expect(bah2027HubMode(BAH_2027_STATUS, '2027')).toBe('loaded');
    expect(bah2027Facts(BAH_2027_STATUS, HISTORY_2027)).toEqual({ releasedDate: '2026-12-12', avgIncreasePct: 4.6, sourceUrl: 'https://example.mil/2027' });
    const faqs = bah2027HubFaqs(BAH_2027_STATUS, '2027', HISTORY_2027);
    expect(faqs[0].answer).toBe('DoD published 2027 BAH rates on December 12, 2026, effective January 1, 2027.');
    expect(faqs[1].answer).toContain('national average increase of 4.6%');
    // Rehearsal shape: year flipped, status still pending, no 2027 row yet.
    expect(bah2027HubStatusText('loaded', BAH_2027_STATUS, bah2027Facts(BAH_2027_STATUS))).toBe(
      'DoD has published 2027 BAH rates, effective January 1, 2027.',
    );
    for (const f of [...faqs, ...bah2027HubFaqs(BAH_2027_STATUS, '2027')]) expect(f.answer).not.toMatch(/2028|not yet published/);
  });
});

// ─── TX270 temporary increase ───────────────────────────────────────────────

test.describe('TX270 temporary increase (unit)', () => {
  test('pending wording, from the record (not a TX270 check)', () => {
    expect(temporaryIncreasePendingText(TX270_MID_2026)).toBe(
      "These temporary rates expire December 31, 2026, and DTMO says 2027 rates may be different. In DoD's 2021 and 2022 temporary increases, DoD said individual rate protection did not apply to the temporary amounts, so don't assume the temporary rate continues into 2027.",
    );
  });

  test('synthetic 2027 row below the temporary rate → temporary-ending wording, not rate protection', () => {
    expect(TX270_2026.w['E-5']).toBe(1872); // the temporary (May 16, 2026) rate is the comparison base
    const decreased = hasDecreaseBetween(TX270_2027_FIXTURE, TX270_2026);
    expect(decreased).toBe(true);
    const notice = bahDecreaseNotice('Dyess AFB', CFG_TRANSITION, decreased, TX270_MID_2026);
    expect(notice?.kind).toBe('temporary-ending');
    expect(notice?.text).toBe(
      "The temporary 2026 rates for Abilene/Dyess AFB (effective May 16, 2026) expire December 31, 2026. DoD has said rate protection doesn't apply to temporary increases, so the 2027 rate replaces them for pay grades where it's lower.",
    );
    expect(notice?.text).not.toContain('Under individual rate protection');
  });

  test('the transition line shows the temporary rate: "Until then, the 2026 rate applies: $1,872"', () => {
    expect(bahTransitionText(CFG_TRANSITION, TX270_2026.w['E-5'])).toBe(
      '2027 rates take effect January 1, 2027. Until then, the 2026 rate applies: $1,872 for an E-5 with dependents.',
    );
  });

  test('control: an MHA without a prior-year temporary increase gets the rate-protection paragraph', () => {
    const notice = bahDecreaseNotice('Fort Bragg', CFG_TRANSITION, true, null);
    expect(notice?.kind).toBe('rate-protection');
    expect(notice?.text).toBe(
      "Some pay grades at Fort Bragg decreased for 2027 compared with 2026. Under individual rate protection, a member already receiving BAH here keeps the higher 2026 rate as long as they don't have a reduction in pay grade or a change in dependency status; a promotion doesn't end the protection. The lower 2027 rate applies to members who arrive here, or whose pay grade is reduced or dependency status changes.",
    );
    expect(bahDecreaseNotice('Fort Bragg', CFG_TRANSITION, false, TX270_MID_2026)).toBeNull();
    // A synthetic 2027 row at or above the temporary rate: no decrease, no paragraph.
    expect(hasDecreaseBetween(TX270_2026, TX270_2026)).toBe(false);
  });
});

// ─── Transition tense + alert headline ───────────────────────────────────────

test.describe('Transition tense and alert headline (unit)', () => {
  test('"will receive" while BAH_EFFECTIVE_NOTICE is true; "receives" otherwise', () => {
    expect(bahE5RateLead(CFG_TRANSITION, 'Dyess AFB')).toBe('Starting January 1, 2027, an E-5 with dependents at Dyess AFB will receive');
    const a = bahE5RateFaqAnswer(CFG_TRANSITION, 'Dyess AFB', 'Abilene/Dyess Afb, TX', TX270_2027_FIXTURE.w, TX270_2027_FIXTURE.wo);
    expect(a).toMatch(/^Starting January 1, 2027, an E-5 with dependents at Dyess AFB will receive \$1,772\/month in BAH/);
    expect(a).toContain('E-5 without dependents will receive');
    expect(a).not.toMatch(/\breceives\b|\bis \$/);
    expect(bahE5RateLead(CFG_AFTER_JAN1, 'Dyess AFB')).toBe('For 2027, an E-5 with dependents at Dyess AFB receives');
  });

  test('alert headline: names 2027 while pending, NO year after the flip', () => {
    expect(bahAlertHeadline('Fort Hood', 'next-year-status')).toBe('Get an email when 2027 BAH for Fort Hood is published');
    for (const mode of ['transition', 'none'] as const) {
      const h = bahAlertHeadline('Fort Hood', mode);
      expect(h).toBe('Get notified when BAH rates change for Fort Hood');
      expect(h).not.toMatch(/\b20\d\d\b/);
    }
    expect(bahAlertSource('fort-hood')).toBe('bah-alert-fort-hood');
  });

  test('station "When will…" FAQ cites the 2024 release as December 14, 2023', () => {
    expect(bah2027FaqAnswer('Fort Hood')).toContain('the 2024 rates, December 14, 2023');
  });
});

// ─── Rendered (pending build) ────────────────────────────────────────────────

test.describe('/bah #2027 section (rendered)', () => {
  test('section, history table with linked sources, rate protection with DoD quote', async ({ page }) => {
    await page.goto('/bah#2027');
    // The id starts with a digit (valid HTML, /bah#2027 works) but isn't a valid CSS #id selector.
    const s = page.locator('section[id="2027"]');
    await expect(s).toHaveAttribute('data-mode', 'pending');
    await expect(s.locator('h2')).toHaveText('2027 BAH rates: release date, increase history and rate protection');
    await expect(s.getByTestId('bah-2027-status')).toContainText("as soon as we've loaded and checked DoD's published rates");
    const rows = s.getByTestId('bah-release-history').locator('tbody tr');
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText('2026');
    await expect(rows.first()).toContainText('4.2%');
    await expect(rows.first().locator('a')).toHaveAttribute('href', BAH_RELEASE_HISTORY[0].sourceUrl);
    await expect(rows.nth(2)).toContainText('December 14, 2023');
    await expect(s.getByTestId('bah-release-history').locator('caption')).toHaveText('Source: DoD release for each year.');
    await expect(s).toContainText('will not see his/her Basic Allowance for Housing rate decrease');
    await expect(s).toContainText("A promotion doesn't end the protection.");
    await expect(s.locator('#rate-protection')).toContainText(NEXT_YEAR_REPLACES);
    await expect(s).not.toContainText('the regular rate replaces it');
    await expect(s.getByRole('link', { name: 'See the 2027 pay raise →' })).toHaveAttribute('href', '/pay/raise');
  });

  test('/bah FAQ JSON-LD includes the four 2027 questions; <title> unchanged', async ({ page }) => {
    await page.goto('/bah');
    await expect(page).toHaveTitle('BAH Calculator 2026: Rates by Duty Station | MilPayTools');
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = ld.map((t) => JSON.parse(t)).find((j) => j['@type'] === 'FAQPage');
    const qs: string[] = faq.mainEntity.map((q: { name: string }) => q.name);
    for (const q of ['When do 2027 BAH rates come out?', 'How much will BAH go up in 2027?', 'Can my BAH go down?', 'Does the 2027 pay raise change BAH?']) {
      expect(qs).toContain(q);
    }
    // "Can my BAH go down?": JSON-LD and the visible answer carry the new wording.
    const down = faq.mainEntity.find((q: { name: string }) => q.name === 'Can my BAH go down?');
    expect(down.acceptedAnswer.text).toContain(NEXT_YEAR_REPLACES);
    expect(down.acceptedAnswer.text).not.toContain('the regular rate replaces it');
    await expect(page.getByText(NEXT_YEAR_REPLACES)).toHaveCount(2); // the #2027 section + the visible FAQ answer
  });
});

test.describe('Station pages (rendered)', () => {
  test('/bah/dyess-afb: temporary-increase wording next to the mid-year notice, with both DTMO sources', async ({ page }) => {
    await page.goto('/bah/dyess-afb');
    await expect(page.getByTestId('bah-midyear-change')).toBeVisible();
    const t = page.getByTestId('bah-temporary-increase');
    await expect(t).toContainText('These temporary rates expire December 31, 2026, and DTMO says 2027 rates may be different.');
    await expect(t.locator('a[href*="4485972"]')).toHaveCount(1);
    await expect(t.locator('a[href*="3167951"]')).toHaveCount(1);
  });

  test('/bah/fort-hood: one alert signup, under the 2027 notice, source bah-alert-fort-hood; no dark-box signup', async ({ page }) => {
    await page.goto('/bah/fort-hood');
    const alert = page.getByTestId('bah-station-alert');
    await expect(alert).toHaveCount(1);
    await expect(alert).toContainText('Get an email when 2027 BAH for Fort Hood is published');
    // Directly after the 2027 notice.
    await expect(page.locator('[data-testid="bah-2027-notice"] ~ [data-testid="bah-station-alert"]')).toHaveCount(1);
    await expect(page.locator('main').getByText(/Get notified when 20\d\d BAH rates update/)).toHaveCount(0);
    // The station FAQ cites the corrected 2024 release date.
    await expect(page.getByText(/the 2024 rates, December 14, 2023/).first()).toBeVisible();
  });

  test('alert signup posts source bah-alert-{slug} (request intercepted, nothing sent)', async ({ page }) => {
    let body: { email?: string; source?: string } | null = null;
    await page.route('**/api/subscribe', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    await page.goto('/bah/naval-station-norfolk');
    // The page is prerendered: typing before React hydrates is lost (WebKit posted an
    // empty email once). Wait for hydration, then confirm the value stuck.
    await page.waitForLoadState('networkidle');
    const alert = page.getByTestId('bah-station-alert');
    const input = alert.getByPlaceholder('you@example.com');
    await input.fill('test@example.com');
    await expect(input).toHaveValue('test@example.com');
    await alert.getByRole('button', { name: 'Notify me' }).click();
    await expect(alert).toContainText("You're on the list.");
    expect(body).toEqual({ email: 'test@example.com', source: 'bah-alert-naval-station-norfolk' });
  });

  test('OCONUS station page has no station alert', async ({ page }) => {
    await page.goto('/bah/ramstein-air-base');
    await expect(page.getByTestId('bah-station-alert')).toHaveCount(0);
  });
});
