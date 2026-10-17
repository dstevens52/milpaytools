# E2E Known Failures — Baseline

**Date:** 2026-06-08 (stats updated 2026-07-10 with JSON-reporter correction)
**Target:** `local` (`http://localhost:3000`, auto-started `next dev` via Playwright `webServer`)
**Playwright:** 1.59.1
**Run summary (JSON reporter, 2026-07-10):** 1238 expected · 28 unexpected · 33 skipped · 0 not-run

> **Reporter note:** The original June 2026 baseline was captured with `--reporter=line`, which
> reported `1025 passed · 28 failed · 3 skipped · 30 did not run`. The line reporter silently drops
> failures from its counts and classifies conditional `test.skip()` calls as "did not run" rather
> than "skipped". The JSON reporter is authoritative. Use `npx playwright test --reporter=json` for
> all baseline gate checks — never `--reporter=line`. See CLAUDE.md Testing section.

This file is the baseline to diff future **local** runs against. A new failure that
is NOT listed here is a regression. The conditional `test.skip()` data-guards (skip
when reference BAH/pay data is absent) and the `transition-readiness.spec.ts:59`
`test.fixme` are expected and excluded from the counts below.

## Failing tests (28)

> 2026-10-16: added `va-disability.spec.ts:207` (webkit) — see the VA Disability cluster below.
> Full-suite JSON run that day: 1268 expected · 28 unexpected · 33 skipped · 0 flaky.

Failures group into five clusters. Browser coverage noted per cluster.
`data-accuracy.spec.ts:40` (firefox, VA 40% with spouse) was previously listed here but has been
reclassified as a flake — see the flaky-pair entry below.

### Total Compensation — base pay known answers (6 = 3 browsers × 2 tests)
- `data-accuracy.spec.ts:108` — Total Comp: E-5 6 YOS base pay = $49,320/yr — chromium, firefox, webkit
- `data-accuracy.spec.ts:114` — Total Comp: E-5 8 YOS base pay = $4,299.90/mo — chromium, firefox, webkit

### Total Compensation — BRS match tiering (12 = 3 browsers × 4 tests)
- `edge-cases.spec.ts:159` — 3% contribution → 4% government total (not 3%) — chromium, firefox, webkit
- `edge-cases.spec.ts:167` — 4% contribution → 4.5% government total — chromium, firefox, webkit
- `edge-cases.spec.ts:175` — 5% contribution → 5% government total — chromium, firefox, webkit
- `edge-cases.spec.ts:183` — 0% contribution → 1% automatic only — chromium, firefox, webkit

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

### VA Disability — long multi-condition case (1 = webkit only)
- `va-disability.spec.ts:207` — Reddit case: 13 conditions with bilateral legs → 100% and
  walkthrough shows "rounds to 64" — webkit only

Fails with `Test timeout of 30000ms exceeded`. Pre-existing baseline failure, not a flake:
it failed in the 2026-10-16 full-suite run, again in isolation, and again in isolation against
unchanged `main` code (confirmed against main on 2026-10-16). Passes on chromium and firefox.
Triage separately. **Not fixed here.**

## Known flaky tests (not failures — excluded from the baseline count)

Single-browser failures that passed an isolated re-run. If one of these shows up
in a full-suite run, re-run it in isolation before treating it as a regression.

- `pay-charts.spec.ts:79` — W-4 at 20 YOS shows correct pay — firefox only
  (failed in 2026-06-12 full run, passed isolated re-run)
- `compare-async.spec.ts:15` — rapid destination ZIP change lands on the FINAL
  location (race-safe) — webkit only (failed in 2026-06-12 full run, passed
  isolated re-run)
- `healthcare-comparison.spec.ts:77` — TAMP option hides annual gap section —
  firefox only (failed in 2026-06-12 full run, passed isolated re-run)

### Intermittently swapping flake pair (verified 2026-07-10)

These two tests trade off between failing and passing across full-suite runs. In any
given run exactly one tends to fail and the other passes. Neither is a regression
indicator on its own — treat both as flakes and re-run in isolation to confirm.

- `data-accuracy.spec.ts:40` — VA: 40% with spouse = $882.84/mo — **firefox only**
  First appeared in June 2026 baseline as a single-browser failure ("probable flake").
  In the 2026-07-10 JSON run it passed on all 3 browsers.

- `data-accuracy.spec.ts:235` — Healthcare: TRS member-only premium = $57.88/mo — **webkit only**
  Not present in the June 2026 baseline. Failed in the 2026-07-10 JSON full-suite run
  (webkit only), passed on isolated re-run of `data-accuracy.spec.ts --project=webkit`.

**Pattern:** when `:40` (firefox) fails in a run, `:235` (webkit) tends to pass, and vice versa.
Both test healthcare/disability rate rendering under a specific browser rendering path.
If both fail in the same run, treat that as a real signal and investigate before dismissing.

## Known issues (not Playwright failures)

### ESLint — PCS estimator URL-params effect (noted 2026-10-17)
- `src/components/calculators/pcs/PCSCalculator.tsx` — the mount effect that pre-populates inputs
  from URL params calls `setState` synchronously, which ESLint reports as
  `react-hooks/set-state-in-effect` (1 error). Pre-existing on `main` @ `d0c1688`, before
  `fix/pcs-oconus`. Does not affect `npm run build`. **Not fixed here** — triage separately.
