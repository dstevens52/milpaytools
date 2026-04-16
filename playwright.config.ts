import { defineConfig, devices } from '@playwright/test';

/**
 * MilPayTools end-to-end test suite.
 *
 * Runs against the live site by default:
 *   npx playwright test
 *
 * Run against localhost:
 *   BASE_URL=http://localhost:3000 npx playwright test
 *
 * Run a single spec:
 *   npx playwright test tests/e2e/total-compensation.spec.ts
 *
 * Open HTML report after run:
 *   npx playwright show-report
 */

export default defineConfig({
  testDir: './tests/e2e',

  // Per-test timeout — calculators update reactively so 30s is generous
  timeout: 30_000,

  // Assertion timeout — how long to wait for a locator to match
  expect: { timeout: 8_000 },

  // No retries locally; 2 on CI to handle transient network blips
  retries: process.env.CI ? 2 : 0,

  // Run spec files in parallel; tests within a file run sequentially
  fullyParallel: true,

  // Workers: default is CPU count; cap at 4 to avoid overwhelming live site
  workers: process.env.CI ? 2 : 4,

  // Reporter: list for terminal, HTML for detailed review
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    // Target: live site by default, override with BASE_URL env var
    baseURL: process.env.BASE_URL ?? 'https://www.milpaytools.com',

    // Record trace on first retry so failures are debuggable
    trace: 'on-first-retry',

    // Viewport that matches typical desktop use
    viewport: { width: 1280, height: 800 },

    // Don't navigate on failed assertions — let Playwright surface the error
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results',
});
