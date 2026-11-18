# MilPayTools — Project Conventions

## What This Is
MilPayTools.com is a free military financial calculator and education platform for active-duty service members, Guard/Reserve, and veterans. Every tool follows an "Explain → Decide → Act" pattern. The site is positioning for DoD TAP curriculum integration and military leadership endorsement.

## Stack
- Next.js / TypeScript / Tailwind CSS / App Router
- GitHub (dstevens52/milpaytools) → Vercel auto-deploy from main
- MDX for blog posts and guide content
- Playwright for E2E tests (`npm run test:e2e`, 650+ tests)
- Beehiiv API for email capture (env vars: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID)
- Vercel Analytics

## Data Layer
- BAH rates: `src/data/bah/2026/` — ZIP-to-MHA mapping (40,959 ZIPs → 338 MHAs) + rate tables by rank/dependent status. Source: DTMO
- Pay tables: `src/data/` — 2026 DoD pay tables from DFAS PDFs
- Station data: station-level data files with BAH rates, local market data (median rent, home prices), branch, installation details
- National averages: computed dynamically via `getNationalAverages()` in `src/lib/calculations/bah.ts` using median across all 338 MHAs
- All data updates annually in January. The data layer is designed for versioned annual replacement.

## Site Structure (as of May 2026)
- 16 calculators at /calculators/[name]
- 65 BAH station pages at /bah/[slug] with full StoryBrand content (hero, money strip, housing costs, "What to know before you move", CTAs, email signup)
- ~135+ additional basic BAH pages with rate tables only
- 39 blog posts (MDX)
- 7 guide hub pages at /guides/[name] (includes /guides/starting-service and /guides/navigating-service journey landing pages)
- /guides/starting-service — dedicated journey landing page for new service members
- /guides/navigating-service — dedicated journey landing page for mid-career (PCS, deployment, duty station)
- /transition — transition hub page
- Homepage with journey cards, 1-2-3 process strip with proof card, calculator grid with filter pills

## Key Components
- `StationPageClient.tsx` — BAH station page template. Conditionally renders StoryBrand sections when data exists. Rank selector drives all dynamic content.
- `EmailSignup` — reusable Beehiiv signup component. Props: headline, subtext, source, stationName, variant ("inline" | "card")
- `BaseSearchInput` — type-ahead input for base names and ZIP codes, used across BAH, Dual Military BAH, COLA, and PCS calculators
- Calculator pages share common patterns: 3-step plan (dark strip), trust pill badges, static example, disclaimer, post-result email signup
- Branch emblems: SVGs in /public/images/branches/, rendered as semi-transparent watermarks in BAH page heroes

## Content Guidelines
- NEVER imply first-person military service. Dan writes from "someone who builds financial tools" perspective.
- NEVER give financial, tax, legal, or housing advice. Present data and let users decide.
- Use "Common among:" not "Best for:" when describing demographics
- Use "What to know before you move" not "Mistake to avoid"
- All housing data must cite sources (Zillow, Redfin, BestPlaces, GreatSchools)
- Master disclaimer required on all station pages with housing data
- No display ads ever — preserves institutional credibility for TAP/endorsement path
- Voice: explain something important to a smart friend in the military. Not military slang, not corporate stiff.
- Blog posts: write for a real person, not Google first. Plain English, zero unexplained jargon. Include summary tables for scannability. End with clear action items.

## Testing

### What runs where (updated 2026-11-18, Dan — this is the only testing rule; it overrides any "run after every change" line elsewhere)
**Local is for iterating. CI is the gate.** (Since the CI gate went live, CI results have matched
local ones on builds 9a and 1b; the old local gate steps are retired.)
1. **Local, while iterating** — all of these, nothing more:
   - `npx tsc --noEmit -p .` and `npx eslint <changed files>` (no new lint problems versus `main`).
   - The data-only tests: `npm run test:pay-table` (locks `src/data/pay-tables/2026.ts` to
     `docs/sources/dfas-2026-basic-pay.csv`), `npm run test:pay-raise` (2027 raise golden values,
     tiers, caps, status modes), `npm run test:figures` (guards the `check:figures` tool). Seconds
     each; no browser or server.
   - The 1–3 spec files being changed, **Chromium only**, on the default `next dev` server:
     `npx playwright test <specs> --project=chromium --reporter=json`.
2. **Not local:** no production builds (`npm run build`), no full suite, no Firefox/WebKit or
   multi-browser runs, no `--repeat-each`. Those are CI's job (the full gate on every PR; repeat
   runs via the workflow's manual run, below). This machine has run out of memory on local gates.
3. **Finish all review before pushing.** Fold in every pending fix, data spot-check and copy edit
   first, so CI runs once. If code changes after a CI run, re-run tier 1 for the changed files and
   push; CI runs again on the new commit.
4. **Don't re-run a suite to investigate a single failure.** Re-run just that spec file (locally
   on Chromium, or in CI with the repeat run if it only fails in Firefox/WebKit/CI).
5. A local spec run uses :3000 with `reuseExistingServer`. Never run two local test sessions at
   once, and stop any leftover `next start`/`next dev` on :3000 first (it makes Playwright test a
   stale build).
6. Baseline failures and their root causes are in `tests/KNOWN_FAILURES.md`.

### CI gate (GitHub Actions, added 2026-11-18)
The full suite runs in GitHub Actions (`.github/workflows/e2e.yml`) whenever a PR to `main` is
opened or gets new commits, drafts included.
- **Build flow:** run the tier 1 checks locally → push the branch → open a **draft** PR (a draft
  creates only a Vercel preview, never a production deploy) → CI runs the full suite on all three
  browsers against a production build → the PR is marked ready only after Claude Chat signs off
  (unless Dan says otherwise for that PR). Marking a PR ready does **not** re-run CI: the run on
  the same commit already counts.
- **Repeat runs (proving a flake fixed):** Actions → "E2E gate" → Run workflow, or
  `gh workflow run e2e.yml --ref <branch> -f specs="tests/e2e/a.spec.ts tests/e2e/b.spec.ts" -f browsers="webkit" -f repeat_each=10`.
  Runs only those specs, `--repeat-each=N`, `--retries=0`, on each chosen browser against a
  production build. The `repeat` job fails on any failure (no known-failures allowance); its job
  summary has the stats block. A flake counts as fixed after a clean repeat run plus a clean PR run.
- **Stuck "pending" check:** GitHub occasionally leaves a finished job listed as `in_progress` (seen
  once on `versions`, run 44334615844: every step completed, conclusion `success`). It's on GitHub's
  side; only `report` is required, so it doesn't block a merge. `gh pr checks --watch` waits on it
  forever, so read the run with `gh run view <id>` instead.
- **`report` is a required status check on `main`** (branch protection, set 2026-11-18): a PR
  can't merge until it passes.
- **The gate is the `report` job.** It merges every shard and runs `scripts/ci-known-failures.ts`
  against `tests/known-failures.json` (the machine-readable twin of `KNOWN_FAILURES.md`; keep both
  in step). It fails on any new failure, a report with zero tests, or tests missing versus
  `--list` (a crashed or timed-out shard). The shard jobs stay green when tests fail.
- **Reading results:** `gh pr checks <PR>`; the job summary of the `report` job holds the stats
  block and the three lists; `gh run download <run-id> -n merged-report` gets `merged-report.json`
  (and `-n html-report` the HTML report). Paste the merged `stats` block verbatim and the
  classifier's three lists (new / known still failing / known now passing) into the build report.
- **Setup:** build and browser jobs run in the `mcr.microsoft.com/playwright` image whose tag is
  read from `package-lock.json` (upgrading Playwright upgrades the image), on `ubuntu-24.04`
  (`ubuntu-latest` is 26.04, which Playwright 1.59.1 doesn't support). 2 shards per browser,
  `--workers=2`, `--retries=0`. No secrets or env vars are needed.

### Reference
- Which tests to run where: see "What runs where" above
- ~1,440 Playwright tests per browser (4,330+ across Chromium/Firefox/WebKit) covering all calculators and BAH pages
- Fort Bragg and Fort Hood are commonly used as test reference pages
- **Any run reported as evidence uses the JSON reporter** (CI does): `npx playwright test <specs> --reporter=json > results.json`
  The `--reporter=line` reporter silently drops failures from its counts (verified 2026-07-10:
  28 known failures showed as 0 failed + 30 "did not run" under line; JSON showed 28 unexpected).
  Never use `--reporter=line` for a build gate or regression check.
- **Every build report must paste the JSON `stats` block verbatim** — `expected`, `unexpected`,
  `skipped`, `flaky` fields. Example from 2026-07-10 run:
  ```json
  { "expected": 1238, "skipped": 33, "unexpected": 28, "flaky": 0 }
  ```
- The 33 `skipped` tests are expected: 30 conditional `test.skip()` data-guards (show as "did not
  run" under line reporter, "skipped" under JSON) + 3 `test.fixme` entries × 3 browsers.

## Verification Conventions

- **Any diff or comparison step must print the line count of both inputs before comparing.**
  A zero-length input is a failure, not a match. `diff a b` on two empty files exits 0 and reports
  nothing — indistinguishable from a real "no change" result unless the counts are shown.
  This applies to every comparison: sitemap URL lists, build route tables, grep result sets,
  before/after metadata dumps.

  ```bash
  echo "before: $(wc -l < a.txt)  after: $(wc -l < b.txt)"   # required, before the diff
  diff a.txt b.txt && echo "IDENTICAL"
  ```

  Verified 2026-09-18: a route-table comparison reported "IDENTICAL — no route lost" while both
  extractions were empty because the parsing regex had failed. The same build had exited 1. The
  line counts would have caught it immediately; the diff alone hid it.

- **Retired URLs (zero-reference rule).** `/calculators/bah` and `/calculators/pay-charts` were
  consolidated into `/bah` and `/pay` (B2, 2026-09-18) and 308-redirect there. They must appear
  **only** in these allowlisted files — any other hit is a stale link to fix:
  - `next.config.ts` — the redirect rules
  - `tests/e2e/redirects.spec.ts` — the redirect test (intentional, not stale)
  - `CLAUDE.md` — this rule's own definition

  Check with a control, and with `MSYS_NO_PATHCONV=1` (Git Bash rewrites leading-`/` arguments
  into Windows paths, which silently empties the grep):
  ```bash
  export MSYS_NO_PATHCONV=1
  echo "control: $(git grep -n '/calculators/' | wc -l)"   # must be non-zero
  git grep -nE "calculators/(bah|pay-charts)" \
    | grep -vE "@/components/calculators/(bah|pay-charts)/" \
    | grep -vE "^(next\.config\.ts|tests/e2e/redirects\.spec\.ts|CLAUDE\.md):"   # must print nothing
  ```

- The rule generalizes: **an empty result is evidence of nothing.** A grep that returns no hits,
  a manifest lookup that finds no entries, a test filter that matches no tests — confirm the
  command actually ran and the input was non-empty before reporting the absence as a finding.

## Accuracy Conventions

Before flagging any figure as wrong, the full lookup chain must be established and stated:

- **BAH figures:** trace ZIP → MHA code (`sorted_zipmha26.txt`) → MHA name (`mhanames26.txt`) → rate (`bahw26.txt`/`bahwo26.txt`). A lib lookup alone (`mhaRates.ts`) is not sufficient — the MHA code must be confirmed against the name file before the figure can be attributed to a location. Confusing codes (e.g., CA022 = Fresno ≠ CA039 = Monterey) has caused false-positive mismatch reports.
- **Pay/VA figures:** trace pay grade + YOS → DFAS pay table row, or VA rating → `src/data/va-rates/2026.ts`. State the exact source row alongside any claimed discrepancy.
- **No correction without external verification:** a mismatch flagged from a lib lookup alone is a hypothesis, not a finding. Confirm against the official source (DTMO PDF/ASCII, DFAS pay table, VA.gov compensation page) before declaring a figure wrong or proposing a fix.
- **Guardrail B hold:** if a recomputed figure differs from the displayed one and would change the story the copy tells, flag it and hold — do not silently ship the new number.

## Git Worktrees

- **Git worktrees in this repo must not share or symlink `node_modules`.** No junctions, symlinks,
  or `mklink /J` pointing at the main checkout's `node_modules`. Removing such a worktree
  (`git worktree remove --force`, or a recursive delete) follows the link and deletes the **real**
  `node_modules`. Verified 2026-09-18: it emptied `node_modules/.bin` and broke `tsc`/`eslint`
  until `npm ci`.
- Give a worktree its own install (`npm ci` inside it), or lint/build old code another way
  (e.g. `git show <ref>:<path>` into a scratch file).
- **Verify before removing any worktree:** list reparse points/symlinks inside it first and
  confirm none point outside the worktree:
  ```powershell
  Get-ChildItem <worktree> -Recurse -Force -Attributes ReparsePoint -ErrorAction SilentlyContinue
  ```
  If any exist, remove each link alone (`cmd /c rmdir "<link>"` deletes only the link), re-run the
  check until it returns nothing, then remove the worktree.
- Recovery if it happens: `npm ci` restores `node_modules` from `package-lock.json` without
  modifying either package file.

## Environment Variables (Vercel + .env.local)
- BEEHIIV_API_KEY
- BEEHIIV_PUBLICATION_ID

## Prompt Efficiency Rules
- Reference specific file paths rather than describing files
- One type of change at a time for code modifications
- Cap at 5-8 files for code changes per prompt
- Verify between builds
- Test per "What runs where" in the Testing section (local = iterate; CI = the gate)
