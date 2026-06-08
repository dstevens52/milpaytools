import { defineConfig, devices } from '@playwright/test';

/**
 * MilPayTools end-to-end test suite.
 *
 * Default (local):  npm run test:e2e       — auto-starts `next dev` on :3000
 * Against live:      npm run test:e2e:live  — post-deploy smoke; no local server
 * Custom target:     BASE_URL=<url> npm run test:e2e
 *
 * Run a single spec:
 *   npx playwright test tests/e2e/total-compensation.spec.ts
 *
 * Open HTML report after run:
 *   npx playwright show-report
 */

// Resolve the target up-front so the webServer can be made conditional on it.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

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

  // Auto-start a local dev server only when targeting localhost. For live
  // (or any non-local BASE_URL) this is undefined so no local server is started.
  webServer: isLocal
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,

  use: {
    // Target: local by default, override with BASE_URL env var
    baseURL,

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
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results',
});
