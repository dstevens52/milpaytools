import { test, expect } from '@playwright/test';

// v2 OCONUS stations #3–5 — Yokota, Kadena, Camp Humphreys. These slugs used
// the legacy overseas template until feature/oconus-v2-pacific.

const PACIFIC: {
  path: string;
  h1: string;
  title: string;
  code: string;
  related: string[];
  commandSponsorship: boolean;
}[] = [
  {
    path: '/bah/yokota-air-base',
    h1: 'Yokota Air Base OHA, COLA & PCS Housing Guide',
    title: "Yokota AB BAH? It's OHA — Housing & COLA Guide | MilPayTools",
    code: 'JP065',
    related: ['kadena-air-base', 'camp-humphreys', 'ramstein-air-base', 'raf-lakenheath'],
    commandSponsorship: false,
  },
  {
    path: '/bah/kadena-air-base',
    h1: 'Kadena Air Base OHA, COLA & PCS Housing Guide',
    title: "Kadena AB BAH? It's OHA — Housing & COLA Guide | MilPayTools",
    code: 'JP027',
    related: ['yokota-air-base', 'camp-humphreys', 'ramstein-air-base', 'raf-lakenheath'],
    commandSponsorship: false,
  },
  {
    path: '/bah/camp-humphreys',
    h1: 'Camp Humphreys OHA, COLA & PCS Housing Guide',
    title: "Camp Humphreys BAH? It's OHA — Housing & COLA Guide | MilPayTools",
    code: 'KR025',
    related: ['yokota-air-base', 'kadena-air-base', 'ramstein-air-base', 'raf-lakenheath'],
    commandSponsorship: true,
  },
];

for (const p of PACIFIC) {
  test.describe(`OCONUS v2 — ${p.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(p.path);
    });

    test('H1, rendered title, OHA code, and "Last reviewed October 2026"', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(p.h1);
      await expect(page).toHaveTitle(p.title);
      const main = page.locator('main');
      await expect(main).toContainText('Last reviewed October 2026');
      await expect(main).toContainText(p.code);
    });

    test('"What to do next" shows exactly three links', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What to do next' })).toBeVisible();
      await expect(page.locator('[data-next-link]')).toHaveCount(3);
    });

    test('"Other overseas stations" lists v2 stations only, in order', async ({ page }) => {
      const slugs = await page
        .locator('[data-related-station]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('data-related-station')));
      expect(slugs).toEqual(p.related);
    });

    test(`command sponsorship source ${p.commandSponsorship ? 'appears' : 'is absent'}`, async ({ page }) => {
      const cs = page.locator('section[aria-labelledby="oconus-explainer"] [data-command-sponsorship-source]');
      if (p.commandSponsorship) {
        await expect(cs).toHaveCount(1);
        await expect(cs.locator('a')).toHaveAttribute(
          'href',
          'https://installations.militaryonesource.mil/military-installation/camp-humphreys-usag-humphreys/housing/housing',
        );
        await expect(cs).toContainText('Command sponsorship is how families are authorized to come to Korea.');
      } else {
        await expect(cs).toHaveCount(0);
      }
    });

    test('contains no quarterly, BAH-rate, MHA, or currency text', async ({ page }) => {
      const text = (await page.locator('main').innerText()).trim();
      expect(text.length).toBeGreaterThan(500); // an empty page would pass every check below
      for (const banned of ['quarterly', '2027 BAH rates', 'Military Housing Area', 'TODO-DAN']) {
        expect(text, `found "${banned}"`).not.toMatch(new RegExp(banned, 'i'));
      }
      expect(text, 'found a currency symbol followed by a digit').not.toMatch(/[$€£¥₩]\s?\d/);
    });
  });
}

test('Camp Humphreys shows the DTMO code, not the Military OneSource "KR035"', async ({ page }) => {
  await page.goto('/bah/camp-humphreys');
  const main = page.locator('main');
  await expect(main).toContainText('Korea – Camp Humphreys (formerly Pyongtaek), KR025');
  await expect(main).not.toContainText('KR035');
});
