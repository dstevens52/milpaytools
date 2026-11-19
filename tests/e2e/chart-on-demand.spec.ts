import { test, expect } from '@playwright/test';

// P1 #7 (docs/perf/p1-step1-report.md): the retirement and TSP charts (recharts, ~90 KB
// compressed) load only when they near the viewport (WhenVisible + next/dynamic), not with the
// page. At phone width both charts start well below the fold.

test.use({ viewport: { width: 390, height: 844 } });

for (const { path, heading } of [
  { path: '/calculators/retirement', heading: /Projected Monthly Income Over Time/ },
  { path: '/calculators/tsp', heading: 'Balance Growth Over Time' },
]) {
  test(`${path}: chart renders only after scrolling to it`, async ({ page }) => {
    await page.goto(path);
    const head = page.getByRole('heading', { name: heading });
    await expect(head).toBeAttached();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.locator('.recharts-surface')).toHaveCount(0);
    await head.scrollIntoViewIfNeeded();
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
  });
}
