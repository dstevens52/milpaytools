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

---

## Queue (in order)

| # | Build | Findings | Pre-work / decisions | Status |
|---|---|---|---|---|
| 1b | **BAH TX270 Abilene/Dyess mid-year increase** | (found 2026-11-12 by Claude Chat, not in audits) | DTMO raised TX270 BAH effective 2026-05-16; repo still has January rates (E-5 w/dep $1,554 vs $1,872). Source: `docs/sources/bah-2026-abilene-temporary-increase.md`. Prompt: `build-01b-abilene-bah-prompt.md`. Adds a quarterly mid-year BAH diff to ANNUAL_DATA_UPDATE. | Next |
| 1 | **COLA scale-back** (done, see above) | COLA-01–05, CMP-02 | **Decided 2026-11-12:** stop showing COLA dollar amounts. Show eligibility keyed by MHA (via `zipToMha`, not 3-digit ZIP prefix), the published 2026 index per area, and a link to DTMO's official COLA calculator. Remove "official 2026 DTMO data" claims about dollar figures; fix Boston copy (COLA-05); fix O-1E–O-3E grouping (COLA-04) if any grade logic remains; tests must do a positive lookup (current cola.spec passes on static hero text). PCS Compare must stop adding COLA dollars (CMP-02) — show eligibility note instead. Area list needs official 2026 location list (travel.dod.mil `cclocs26.pdf` returned 403 to Fable — Dan/Claude Chat to fetch via browser). Full rebuild from DTMO tables = later, only if traffic justifies (GSC: ~126 impressions / 0 clicks for COLA queries, Aug–Nov 2026). | Done 2026-11-12 |
| 2 | **Education** | EDU-01–08 | All three HIGHs confirmed vs VA.gov + 38 USC 3313: tiers 50/60 (not 40/50); tier applies to housing allowance; housing $0 at ≤50% rate of pursuit, rate of pursuit rounded to nearest 10%. EDU-03 fix applies to Chapter 33 only (VR&E pays at half time). EDU-07 DATA: online-only housing $1,198 (repo $1,261) and MGIB full-time $2,601 eff. Oct 1 2026 (repo $2,518) — Claude Chat to re-verify on VA.gov before the build. | Queued |
| 3 | **PCS Compare** | CMP-01, CMP-03, CMP-04 | CMP-01 confirmed (SCRA, 50 USC 4001): default to no state-tax difference between stations; optional "state of legal residence" selector or "if I change residence" toggle. State from MHA code prefix, not ZIP ranges. | Queued |
| 4 | **Guard & Reserve** | GR-01–05 | GR-01 now confirmed by Claude Chat: BRS 1% automatic + matching apply to inactive-duty (drill) pay too (Military Times; USMC TSP guidance "1 percent of inactive-duty pay for RC"). Also model the 60-day / 2-year timing (TC-01). GR-03 is a decision: TRS comparison vs employer share — default to member's avoided premium, not total premium. | Queued |
| 5 | **Retirement full pass** | RET-02–07, TR-06, TC-01 (match timing in total comp + TSP) | RET-02: retired pay is taxable (FICA-exempt) — gross up only VA portion (+ optional FICA); confirm via IRS Pub 525. RET-03 High-3 uses YOS−1..−3. RET-04 W-5/O-9/O-10 $0 terms. RET-05 share link. RET-06 cap at elective deferral limit. TR-06: transition readiness reuses `calculateHigh3Average`. | Queued |
| 6 | **VA disability + Dec 1 rates** | VA-01–07 | VA-01 confirmed by Claude Chat (VA rate-table footnotes: school children are added on top of the under-18 base; base never counts a school child). VA-02 (38 CFR 4.26(d), most-favorable-to-veteran) confirmed. 2027 rates: 3.6% COLA effective Dec 1, 2026 — load only VA's published table, not a computed projection. | Queued — deadline Dec 1 |
| 7 | **PCS** | PCS-01–07 + DATA flags | Before the build: Claude Chat reads the actual JTR text (travel days 050205; TLE 0506 percentages + daily cap; weight table 5-37 with/without dependents; per diem first/last day). DATA: PPM rate/cwt, M&IE $69 vs GSA, TLE max days 21 vs 14. | Blocked on JTR check |
| 8 | **Deployment cleanup** | DEP-02–09 | DEP-06 DATA: officer CZTE cap (comment says E-9 max $10,295; repo table has $10,729.20; statute uses highest enlisted rate — likely senior enlisted advisor pay). Share links don't preserve FSA=off with dependents. | Queued |
| 9 | **Accuracy & copy sweep** | HC-01–06, TR-01–05/07, SEP-01–05, VAL-01–04, VRF-01–06, DM-01–03, TC-02, TSP-01, BAH-01 | Highest value here: TAMP eligibility text (HC-04, TR-01 — 10 USC 1145 list), VA loan page promises a VA-vs-conventional comparison that doesn't exist (VAL-01), VA refi cash-out has no cash amount (VRF-01) and ignores restarted term (VRF-03), dual-BAH explanation false 46% of the time (DM-01), separation timeline BDD "Expired" while open (SEP-01). Add test files for VA loan + VA refinance (none exist). | Queued |

---

## Open verification items (Claude Chat)
- [x] Official 2026 CONUS COLA location list + indexes (DTMO) — done 2026-11-12, `docs/sources/conus-cola-locations-2026.md`
- [ ] VA.gov: Post-9/11 online-only housing rate 2026–27; MGIB Chapter 30 rates eff. Oct 1 2026 — build #2
- [ ] JTR text: 050205 travel days, 0506 TLE, Table 5-37 weights, per diem first/last day — build #7
- [ ] IRS Pub 525 (retired pay taxable, FICA-exempt) — build #5
- [ ] Officer CZTE cap 2026 (highest enlisted rate) — build #8
- [ ] TRICARE Reserve Select 2026 deductible/cap structure (HC-03) — build #9

## Housekeeping
- Repo root untracked prompt files can be deleted after this file is committed: `fable-math-audit-prompt.md`, `fable-audit-2-prompt.md`.
- Remove audit worktree: `git worktree remove ../milpaytools-audit`.
- Backlog (not from audits): E-1 first FAQ answer lacks under-4-months rate; pay-page meta descriptions show cents while titles show whole dollars.
