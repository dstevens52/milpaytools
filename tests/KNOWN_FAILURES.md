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
when reference BAH/pay data is absent) and the `transition-readiness.spec.ts:92`
`test.fixme` are expected and excluded from the counts below.

## Failing tests (1 test; depends on run order)

> 2026-10-18: the Total Comp base pay, BRS match tiering, and share-button clusters (27 failures
> = 9 tests × 3 browsers) were fixed in the tests, and `va-disability.spec.ts:207` (webkit) was
> marked `test.slow()` — see "Resolved 2026-10-18" below. Apart from the entry below, any failure
> in a full run is either a listed flake (re-run that spec file alone) or a regression.

### BAH release day — lookup API dynamic import (added 2026-11-14)
- `bah-release-day.spec.ts:237` — "lookup API serves EDUCATION_BAH_YEAR rates on request;
  rejects unregistered years" — all browsers

```
SyntaxError: Cannot use import statement outside a module
    at tests/e2e/bah-release-day.spec.ts:238:21
```

**Pre-existing on main.** Verified 2026-11-14 in a detached worktree of main (617f4d9, own
`npm ci`): the spec file alone on Chromium (`--workers=1`, JSON reporter) gave
`{ "expected": 18, "skipped": 0, "unexpected": 1, "flaky": 0 }`, with this test the only failure.
The error is thrown at the test's `await import('../../src/app/api/bah/lookup/route')`, before
the API is called, so it's a test-loading problem, not an API result. It passed in the
2026-11-14 full Chromium run and failed in the affected-spec Firefox and WebKit runs and when the
spec ran alone. Likely cause (not confirmed): Playwright's loader doesn't transform a dynamically
imported module unless something earlier in the run loaded it. A possible fix is a static import
of the route at the top of the spec.

`data-accuracy.spec.ts:40` (firefox, VA 40% with spouse) was previously listed here but has been
reclassified as a flake — see the flaky-pair entry below.

## Resolved 2026-10-18

### VA Disability — long multi-condition case (was 1 = webkit only)
- `va-disability.spec.ts:207` — Reddit case: 13 conditions with bilateral legs → 100% and
  walkthrough shows "rounds to 64" — webkit only

Failed with `Test timeout of 30000ms exceeded` (added 2026-10-16; it also failed alone that day).
**Neither the test nor the calculator was wrong — it was a time limit.** The test enters 13
conditions with ~26 clicks and 7 dropdown choices, which WebKit drives slowly: on 2026-10-18 the
spec file alone (`--workers=1`) passed on WebKit with `:207` at 16.9 s (Chromium 2.8 s). Under
full-suite parallel load that passes the 30 s limit. Production shows the expected result on both
browsers (100%, $3,938.58/mo, "rounds to 64"). Fixed on `chore/va-test-and-walkthrough` with
`test.slow()`, which triples that one test's limit to 90 s; what it checks is unchanged.

### Total Comp, BRS tiering, share buttons

Three clusters, 27 failures (9 tests × 3 browsers), fixed on `chore/fix-baseline-tests` by
changing the tests only — no calculator code changed. Diagnosed 2026-10-17, corrected 2026-10-18.
In all three clusters **the test was wrong; the calculator was correct**, and live users saw the
right values. Root-cause line numbers are pre-fix; the Fixes list gives the new ones.
Each test failed by waiting the full 8 s locator timeout, which also slowed every full run.

Fixes:
- **Total Comp base pay** — both tests enter ZIP 28310 before reading results; the 8-YOS test now
  expects the whole-dollar display `$4,300/mo` (`formatCurrency`). Now `data-accuracy.spec.ts:111, :119`.
- **BRS match tiering** — each UI step enters ZIP 28310; expected values unchanged
  (`$1,973` / `$2,219` / `$2,466` / `$493`). Now `edge-cases.spec.ts:160, :169, :178, :187`.
- **Share buttons** — each test checks the visible button by its exact name,
  `getByRole('button', { name: 'Copy result link', exact: true })`, at the desktop viewport.
  Line numbers unchanged.

Root causes:

- **Total Comp base pay — `data-accuracy.spec.ts:108, :114`.** Test is outdated. Since `8daeede`
  the results block only renders after the ZIP matches a CONUS duty station
  (`TotalCompensationCalculator.tsx` — `stationState === 'matched'`); these tests never enter a ZIP.
  - `:108` expects `$49,320/yr`. Without a ZIP the page shows only the station gate. With
    `?zip=28310` at the default 6 YOS it shows **`$49,320/yr`**, matching the expected value.
  - `:114` has a second problem: it expects `$4,299.9/mo` (`resultCardNum` drops the trailing zero),
    but the calculator rounds to whole dollars. With ZIP 28310 and 8 YOS it shows **`$4,300/mo`**
    (and `$51,599/yr` = 4,299.90 × 12, rounded). Both the ZIP and the expected format need fixing.
- **BRS match tiering — `edge-cases.spec.ts:159, :167, :175, :183`.** Same gate: the pure
  `calculateTotalCompensation()` assertions pass; the UI step fails because no ZIP is entered.
  With `zip=28310` added, each expected value renders: `tsp=3` → `$1,973`, `tsp=4` → `$2,219`,
  `tsp=5` → `$2,466`, `tsp=0` → `$493` (all visible).
- **Share buttons — `healthcare-comparison.spec.ts:137`, `separation-timeline.spec.ts:113`,
  `transition-readiness.spec.ts:51`.** Test selectors don't match the shared `SaveOrShareResults`
  component (unchanged since 2026-05-26). Its buttons are labeled **"Share result"** (`md:hidden`,
  mobile only) and **"Copy result link"**.
  - `:137` looks for `/copy link/i`, which can't match "Copy result link" (the word "result" sits
    between).
  - `:113` and `:51` use `/share|copy link/i` with `.first()`. Role lookup skips hidden elements,
    so the mobile-only "Share result" (hidden at the desktop viewport) is never a candidate, and
    "copy link" can't match "Copy result link" — the locator matches no button at all, so
    `toBeVisible()` fails. (Corrected 2026-10-18; the 2026-10-17 note said `.first()` picked the
    hidden "Share result" button.)
  - `healthcare-comparison.spec.ts` and `separation-timeline.spec.ts` both run in serial mode, so a
    failure skips every test after it in that file: `healthcare-comparison:137` skipped 5
    (`:141`–`:164`), and `separation-timeline:113` skipped 5 (`:118`–`:142`). (The separation-timeline
    cascade added 2026-10-18.)

## Known flaky tests (not failures — excluded from the baseline count)

Single-browser failures that passed an isolated re-run. If one of these shows up
in a full-suite run, re-run it in isolation before treating it as a regression.

- `pay-charts.spec.ts:79` — W-4 at 20 YOS shows correct pay — firefox only
  (failed in 2026-06-12 full run, passed isolated re-run)
- `compare-async.spec.ts:24` (was `:15`; deep link changed to E-7 on 2026-11-14) — rapid
  destination ZIP change lands on the FINAL location (race-safe) — webkit only (failed in
  2026-06-12 full run, passed isolated re-run; passed in the 2026-11-14 full WebKit run)
- `healthcare-comparison.spec.ts:77` — TAMP option hides annual gap section —
  firefox only (failed in 2026-06-12 full run, passed isolated re-run)
- `va-disability.spec.ts:207` — Reddit case: 13 conditions with bilateral legs → 100% — firefox
  (failed in the 2026-11-15 full Firefox run on `feat/ga4-key-events`: `locator.click` timeout
  waiting for the `20%` button; passed in an isolated re-run of the spec file, 15/15, `:207` in
  4.2 s). Same load-dependent slowness as the resolved webkit timeout below; the branch didn't touch
  the VA calculator.
- `bah-station.spec.ts:63` (was `:62` before Build 04 added a line above it) — rank selector updates the displayed BAH value when grade
  changes to E-7 — firefox only (failed in the 2026-11-13 BAH-specs run on
  `feat/bah-release-day-tooling`, `$2,094` not found within 8 s; the spec file passed 30/30
  in an isolated re-run; page HTML byte-identical to main). Also seen once on **chromium** in
  the 2026-11-15 full Chromium run on `feat/ga4-02b-calc-run-url-strip` (same `$2,094` timeout;
  the branch didn't touch the station page); the spec file alone on Chromium passed 30/30.
- `ga-events.spec.ts:294` (the `bah` case of "calculation_run: user action only"; was `:261`)
  — firefox only, under full-suite load. **Unexplained; kept on purpose.** Failed in the
  2026-11-15 full Firefox run (`--workers=1`) on `feat/ga4-02b-2-url-clean`:
  `locator.inputValue: Timeout 10000ms exceeded` waiting for `select#pay-grade` after both page
  loads had finished, though the failure snapshot shows the rendered BAH page with that select.
  Hydration doesn't explain it (`inputValue` doesn't need React; a duplicate id would have failed
  at once with a strict-mode error). Most likely Firefox's page was unresponsive under memory
  pressure, but that isn't proven. The spec file alone on Firefox passed 3/3 (37/37 each).
  The *other* bah failure (02b-1 gate: 0 events after one rank change) was a change before
  hydration; follow-up 4 reproduced and fixed that one (the test now waits for hydration) and it
  is no longer listed.
- `ga-events.spec.ts:294` (same `calculation_run` loop; was `:274`), three cases seen in the
  2026-11-15 Build 04 gate (`feat/station-first-screen`, `--workers=1`, foreground batches): a page
  load, a shared-link load, one change and a burst with 3 s quiet waits, close to the 30 s limit
  under load, sometimes stuck on `networkidle`. Build 04 doesn't touch these calculators.
  - `dual-military-bah` — chromium: timeout in the wait after the burst. Alone: 5/5.
  - `compare` — firefox: `page.goto(…, 'networkidle')` never settled. Alone: 4/5, then 10/10.
    A `main` build gave 10/10 and the branch 10/10 in back-to-back runs, so not caused by Build 04.
  - `va-loan` — firefox: timeout in the wait after the burst. Alone: 5/5.
  **Fix in place, not yet cleared** (follow-up 4, `test/ga-events-hydration-wait`): the loop no
  longer uses `networkidle` (it waits for hydration) and has a 60 s timeout. Repeated runs of the
  old spec never reproduced these three, so a clean repeated run of the new one can't clear them.
  Remove them after a full-suite gate on the browser above in which they don't appear.
  (The `education` case, `networkidle` timeout on Firefox, was removed: the old spec failed it 2/190
  in a Firefox `--repeat-each=10` run, the new spec passed 190/190.)
- `deployment-math.spec.ts:425` — round trip: every input survives copy link → reload — webkit.
  Failed once in the 2026-11-15 Build 04 gate: right after the reload the BAH line read $3,054
  instead of $2,427 (looks like a BAH lookup race). The spec file alone on WebKit passed 105/105
  (×3). The Deployment calculator wasn't touched.

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
