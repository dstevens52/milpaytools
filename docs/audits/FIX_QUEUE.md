# MilPayTools — Calculation Fix Queue

**Created:** 2026-11-12 · **Owner:** Dan · **Source audits:** `docs/audits/math-audit-round-1.md` (VA disability, retirement, deployment, PCS, dual-military BAH, total comp, TSP) and `docs/audits/math-audit-round-2.md` (guard/reserve, COLA, education, healthcare, transition readiness, separation timeline, PCS compare, VA loan, VA refinance, BAH lookup). Both audits: Fable 5.2, read-only, each finding has file:line, scenario, rule citation, confidence.

**How to use this file:** each build below is one Claude Code session (Opus 5.5, high). Start a session with: "Read docs/audits/FIX_QUEUE.md and docs/audits/math-audit-round-N.md, then do build #X." Update the Status column when a build merges.

## Ground rules (carry into every build)
- Never act on an audit finding without its rule being confirmed. CONFIRMED findings can go straight in; LIKELY / QUESTION need the noted check first; DATA flags need an official-source trace (DFAS, DTMO, VA.gov, GSA, tricare.mil) before any figure changes.
- No hand-keyed dollar figures. Page examples, hero strips and FAQ figures must be computed from the lib.
- Workflow: feature branch → reproduce the audit scenario first (stop if it doesn't reproduce) → fix → tiered tests → hold before push → Vercel preview (Claude Chat verifies) → merge → IndexNow after production is confirmed.
- Update the existing tests that lock in wrong values (e.g. `edge-cases.spec.ts:55-66` for VA-01).

---

## Done
| Date | Build | PR | Notes |
|---|---|---|---|
| 2026-11-12 | Branch-term SEO pass (titles/meta/FAQ on total comp, PCS, BAH, guard/reserve, dual BAH, all 15 /pay pages; new `FaqSection` component; FAQ↔schema parity spec) | #13 | Measure ~2026-12-10: re-pull GSC filters "army" / "navy" / "air force" (baseline 3 mo: 218 / 12 / 34 clicks). GSC "request indexing" done for total-comp; PCS hit daily quota. |
| 2026-11-12 | Hotfix DEP-01 (FSA requires dependents) + RET-01 (VA waiver offset below 50%) + RET-08 hero strip computed (now 50% VA CRDP scenario) | #14 | IndexNow submitted for both pages. |
| 2026-11-12 | Build #1 COLA scale-back: official 2026 DTMO list (18 MHAs, `docs/sources/conus-cola-locations-2026.md`), MHA-keyed eligibility + index + DTMO link, no dollar estimates; PCS Compare no longer adds COLA; 20 BAH station pages corrected; JBLM llms.txt claim removed | fix/cola-scale-back | MHA mapping verified by Claude Chat against DTMO raw `mhanames26.txt` / `sorted_zipmha26.txt`. IndexNow: 27 URLs. Observed flake: bah-station.spec.ts:56 (Chromium) — add to KNOWN_FAILURES if it recurs. |
| 2026-11-12 | Build #1b Abilene/Dyess BAH mid-year increase: TX270 current rates (eff. 2026-05-16) from `docs/sources/bah-2026-abilene-temporary-increase.md`; Dyess page line + effective-date labels; quarterly mid-year BAH check added to ANNUAL_DATA_UPDATE | #17 | All other 337 MHAs byte-identical (checksum test). IndexNow: 48 URLs (Dyess, /bah, 37 station pages via rank/nearby deltas, 9 /pay pages via national medians). |
| 2026-11-12 | Build #2 Education (EDU-01–08): tiers 50/60; MHA × tier × rate of pursuit ($0 at half time or less, ¾ = 80%); VR&E standard subsistence without GI Bill eligibility; online $1,198; MGIB $2,601 + 24-month service rule; page and guide figures computed from data | #18 | Source: `docs/sources/education-rates-2026-27.md`. IndexNow: /calculators/education, /guides/education-benefits. |
| 2026-11-12 | Education blog facts: post-911-gi-bill-explained-2026, gi-bill-housing-allowance-zip-code, va-gi-bill-comparison-tool-guide (tiers, online $1,198, rate of pursuit, half time = $0); blog `updated` frontmatter → "Last reviewed" + dateModified | #19 | IndexNow: 3 posts + /llms.txt. |
| 2026-11-12 | Build #3 PCS Compare (CMP-01/03/04): SCRA default (same state tax at both stations; optional state of legal residence + opt-in residence change); station state from the ZIP-prefix table with 6 prefixes corrected against DTMO ZIP data (MHA prefix rejected: MHAs span states); "After income taxes" labels (before Social Security and Medicare), single-filer note; hero/example figures computed | #20 | IndexNow: /, /calculators, /calculators/compare, /partners, /llms.txt. |
| 2026-11-12 | Build 3b PCS content SCRA follow-up: /guides/pcs (FAQ schema + visible answer, Impact card, hero/CTA copy; per-station state-tax rows removed from the sample card, card BAH computed) + compare callouts/paragraph in best-worst-bah-duty-stations-2026, dual-military-bah-rules, military-tax-advantages-by-state, pcs-financial-planning-guide | #21 | IndexNow: the guide + 4 posts. |
| 2026-11-13 | Build #4 Guard & Reserve (GR-01–05): BRS contributions on all basic pay incl. drill pay (automatic 1% from 1 yr, matching from 2 yrs, shared tspGrowth tiers); hours = weekends × periods × 4; TRS premium shown as a separate cost, out of the total (unsourced civilian comparison deleted); AT/additional days add BAS, BAH-RC/T guidance replaces locality BAH; per-weekend = drill pay ÷ weekends; no-rate grades show a message; REFRAD removed | #22 | IndexNow: /calculators/guard-reserve. BRS tiers still duplicated in total-compensation.ts (TC-01, build #5). |

---

## Queue (in order)

| # | Build | Findings | Pre-work / decisions | Status |
|---|---|---|---|---|
| 1 | **COLA scale-back** (done, see above) | COLA-01–05, CMP-02 | **Decided 2026-11-12:** stop showing COLA dollar amounts. Show eligibility keyed by MHA (via `zipToMha`, not 3-digit ZIP prefix), the published 2026 index per area, and a link to DTMO's official COLA calculator. Remove "official 2026 DTMO data" claims about dollar figures; fix Boston copy (COLA-05); fix O-1E–O-3E grouping (COLA-04) if any grade logic remains; tests must do a positive lookup (current cola.spec passes on static hero text). PCS Compare must stop adding COLA dollars (CMP-02) — show eligibility note instead. Area list needs official 2026 location list (travel.dod.mil `cclocs26.pdf` returned 403 to Fable — Dan/Claude Chat to fetch via browser). Full rebuild from DTMO tables = later, only if traffic justifies (GSC: ~126 impressions / 0 clicks for COLA queries, Aug–Nov 2026). | Done 2026-11-12 |
| 5 | **Retirement full pass** | RET-02–07, TR-06, TC-01 (match timing in total comp + TSP) | RET-02: retired pay is taxable (FICA-exempt) — gross up only VA portion (+ optional FICA); confirm via IRS Pub 525. RET-03 High-3 uses YOS−1..−3. RET-04 W-5/O-9/O-10 $0 terms. RET-05 share link. RET-06 cap at elective deferral limit. TR-06: transition readiness reuses `calculateHigh3Average`. | Queued |
| 6 | **VA disability + Dec 1 rates** | VA-01–07 | VA-01 confirmed by Claude Chat (VA rate-table footnotes: school children are added on top of the under-18 base; base never counts a school child). VA-02 (38 CFR 4.26(d), most-favorable-to-veteran) confirmed. 2027 rates: 3.6% COLA effective Dec 1, 2026 — load only VA's published table, not a computed projection. | Queued — deadline Dec 1 |
| 7 | **PCS** | PCS-01–07 + DATA flags | Before the build: Claude Chat reads the actual JTR text (travel days 050205; TLE 0506 percentages + daily cap; weight table 5-37 with/without dependents; per diem first/last day). DATA: PPM rate/cwt, M&IE $69 vs GSA, TLE max days 21 vs 14. | Blocked on JTR check |
| 8 | **Deployment cleanup** | DEP-02–09 | DEP-06 DATA: officer CZTE cap (comment says E-9 max $10,295; repo table has $10,729.20; statute uses highest enlisted rate — likely senior enlisted advisor pay). Share links don't preserve FSA=off with dependents. | Queued |
| 9 | **Accuracy & copy sweep** | HC-01–06, TR-01–05/07, SEP-01–05, VAL-01–04, VRF-01–06, DM-01–03, TC-02, TSP-01, BAH-01 | Highest value here: TAMP eligibility text (HC-04, TR-01 — 10 USC 1145 list), VA loan page promises a VA-vs-conventional comparison that doesn't exist (VAL-01), VA refi cash-out has no cash amount (VRF-01) and ignores restarted term (VRF-03), dual-BAH explanation false 46% of the time (DM-01), separation timeline BDD "Expired" while open (SEP-01). Add test files for VA loan + VA refinance (none exist). | Queued |

---

## Open verification items (Claude Chat)
- [x] Official 2026 CONUS COLA location list + indexes (DTMO) — done 2026-11-12, `docs/sources/conus-cola-locations-2026.md`
- [x] VA.gov: Post-9/11 online-only housing rate 2026–27; MGIB Chapter 30 rates eff. Oct 1 2026 — done 2026-11-12, `docs/sources/education-rates-2026-27.md`
- [ ] JTR text: 050205 travel days, 0506 TLE, Table 5-37 weights, per diem first/last day — build #7
- [ ] IRS Pub 525 (retired pay taxable, FICA-exempt) — build #5
- [ ] Officer CZTE cap 2026 (highest enlisted rate) — build #8
- [ ] TRICARE Reserve Select 2026 deductible/cap structure (HC-03) — build #9

## Housekeeping
- Repo root untracked prompt files can be deleted after this file is committed: `fable-math-audit-prompt.md`, `fable-audit-2-prompt.md`.
- Remove audit worktree: `git worktree remove ../milpaytools-audit`.
- Backlog (not from audits): E-1 first FAQ answer lacks under-4-months rate; pay-page meta descriptions show cents while titles show whole dollars.
  - Post-9/11 blog post says ¾ time = '75% of tuition covered' and half time = '50% of tuition'. Chapter 33 pays the tuition actually charged (prorated by tier, not rate of pursuit). Verify against VA.gov before changing.
  - Fix rate-protection wording in the next BAH build (decrease paragraph, station FAQ, ZIP calculator step); Claude Chat supplies the text. Per DTMO's official FAQ (travel.dod.mil, "BAH Rate Changes / Rate Protection"), protection continues unless there is a reduction in pay grade or a change in dependency status; a promotion does not end it. Current copy: `StationPageClient.tsx` decrease block, the "How much did … change" FAQ in `src/app/bah/[slug]/page.tsx`, the "Understand rate protection" step in `BAHCalculator.tsx` Same "pay grade stays the same" error elsewhere, fix in the same build: `/bah` "Rate protection" section (`src/app/bah/page.tsx`), the dual-military page paragraphs ("change pay grade") and the dual calculator's "Understand rate protection for dual military" step, and `/guides/military-pay` ("grade … don't change"). The rate-table footnotes ("individual rate protection may keep your personal rate higher") are generic and look fine. Found 2026-11-13; must ship before or with the 2027 BAH release-day merge.
  - `/pay` approximate BAH ranges (`BAH_RANGES` in `PayChartsClient.tsx`, typed "2026 approximate values") feed the total-comp range estimate: replace with values computed from the BAH data after the 2027 BAH release day (`docs/RELEASE_DAY_BAH_2027.md` step 6).
  - `/guides/military-pay` reads `src/data/bah-rates/2026.ts`, a typed 50-ZIP BAH table duplicating the DTMO dataset: retire it and read the BAH registry after the 2027 BAH release day.
  - military-tax-advantages-by-state: hand-typed '$2,800/year … $56,000 over a 20-year career' figure for changing legal residence. Compute from data or remove; check the framing doesn't encourage a residence change.
