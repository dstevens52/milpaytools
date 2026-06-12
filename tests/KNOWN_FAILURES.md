# E2E Known Failures — Baseline

**Date:** 2026-06-08
**Target:** `local` (`http://localhost:3000`, auto-started `next dev` via Playwright `webServer`)
**Playwright:** 1.59.1
**Run summary:** 1025 passed · 28 failed · 3 skipped · 30 did not run

This file is the baseline to diff future **local** runs against. A new failure that
is NOT listed here is a regression. The conditional `test.skip()` data-guards (skip
when reference BAH/pay data is absent) and the `transition-readiness.spec.ts:59`
`test.fixme` are expected and excluded from the counts below.

> Note: this baseline run reported **30 tests "did not run"** (likely a worker
> interruption mid-run). The 28 failures below are stable and consistent across
> browsers; re-run `npm run test:e2e` for a fully clean sweep if needed.

## Failing tests (28)

Failures group into four clusters. Browser coverage noted per cluster.

### Total Compensation — base pay known answers (6 = 3 browsers × 2 tests)
- `data-accuracy.spec.ts:108` — Total Comp: E-5 6 YOS base pay = $49,320/yr — chromium, firefox, webkit
- `data-accuracy.spec.ts:114` — Total Comp: E-5 8 YOS base pay = $4,299.90/mo — chromium, firefox, webkit

### Total Compensation — BRS match tiering (12 = 3 browsers × 4 tests)
- `edge-cases.spec.ts:158` — 3% contribution → 4% government total (not 3%) — chromium, firefox, webkit
- `edge-cases.spec.ts:166` — 4% contribution → 4.5% government total — chromium, firefox, webkit
- `edge-cases.spec.ts:174` — 5% contribution → 5% government total — chromium, firefox, webkit
- `edge-cases.spec.ts:182` — 0% contribution → 1% automatic only — chromium, firefox, webkit

**Likely reason (both Total Comp clusters):** recent commit `8daeede`
("require a matched CONUS duty station before total-comp results") now gates the
total-comp results behind a matched duty station. These tests don't select one, so
the results region stays hidden and the expected values never render. Triage
separately — needs either a duty-station step added to the tests or a confirmation
that the gating is intended. **Not fixed here.**

### Share button visibility (9 = 3 browsers × 3 tests)
- `healthcare-comparison.spec.ts:137` — share button appears — chromium, firefox, webkit
- `separation-timeline.spec.ts:113` — share button appears after entering a date — chromium, firefox, webkit
- `transition-readiness.spec.ts:51` — share button appears after engaging with calculator — chromium, firefox, webkit

**Likely reason:** the `/share|copy link/i` button isn't present in the locally
served build. The adjacent `transition-readiness.spec.ts:58` `fixme` comment notes
such share/PDF UI "passes after deployment," suggesting these assertions depend on
post-deploy behavior rather than local code. Triage separately. **Not fixed here.**

### VA Disability — single browser (1)
- `data-accuracy.spec.ts:40` — VA: 40% with spouse = $882.84/mo — firefox only

**Likely reason:** firefox-only (passed on chromium + webkit) → probable flake.
Confirm on a re-run before treating as a real failure. **Not fixed here.**

## Known flaky tests (not failures — excluded from the baseline count)

Single-browser failures that passed an isolated re-run. If one of these shows up
in a full-suite run, re-run it in isolation before treating it as a regression.

- `pay-charts.spec.ts:79` — W-4 at 20 YOS shows correct pay — firefox only
  (failed in 2026-06-12 full run, passed isolated re-run)
- `compare-async.spec.ts:15` — rapid destination ZIP change lands on the FINAL
  location (race-safe) — webkit only (failed in 2026-06-12 full run, passed
  isolated re-run)
