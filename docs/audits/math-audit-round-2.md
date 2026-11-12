# MATH_AUDIT_2_REPORT — Independent Calculation Audit, Round 2

**Date:** 2026-11-12 · **Branch:** main @ 9acca9c (worktree `milpaytools-audit`) · **Mode:** read-only (no source, data or test file touched; this report is the only file written)
**Method:** same as round 1 — read the calculation code, ran the existing exported functions in an inline scratch runner (`tsx -e`, nothing saved), and compared against the governing rule. The worktree has no `node_modules`, so the runner used the main checkout's `tsx` and module path; nothing was installed or linked in the worktree.
**File name:** `MATH_AUDIT_REPORT_2.md` does not match the `*_REPORT.md` gitignore pattern, so this file is `MATH_AUDIT_2_REPORT.md` as the prompt allows.

**Confidence labels** (unchanged from round 1)
- **CONFIRMED** — traced/run in code, and the rule text was fetched this session (URL given), or the finding is provable from the repo alone.
- **LIKELY** — traced/run in code; rule cited from memory. Marked "from memory — verify".
- **QUESTION** — intent unclear; needs Dan's decision.
- **DATA** — a figure that looks inconsistent. A value is quoted only where an official page was fetched this session.

**What could not be run:** four calculators keep their math inside the React component with nothing exported (Healthcare, Separation Timeline, VA Loan, VA Refinance). For those I traced the code and reproduced the same expressions in plain `node`; those rows say "traced" or "arithmetic reproduced", not "run". No browser or dev server was started.

**Sources I could not fetch:** travel.dod.mil (403 — CONUS COLA page and the 2026 location list `cclocs26.pdf`), usar.army.mil (403), military.com (expired certificate). militarypay.defense.gov was not retried (403 in round 1). JTR and DoD FMR citations are therefore "from memory — verify". The 2026 CONUS COLA announcement was read from a repost of the DoD release.

---

## 1. Summary

| Calculator | CONFIRMED | LIKELY | QUESTION | DATA | Highest severity |
|---|---|---|---|---|---|
| Guard & Reserve | 3 | 1 | 1 | 1 | **HIGH** (1) |
| CONUS COLA | 5 | 0 | 0 | 2 | **HIGH** (2) |
| Education | 6 | 0 | 1 | 1 | **HIGH** (3) |
| Healthcare comparison | 2 | 1 | 2 | 1 | MED |
| Transition readiness | 4 | 2 | 1 | 0 | MED |
| Separation timeline | 3 | 1 | 1 | 0 | MED |
| PCS compare | 3 | 1 | 0 | 0 | **HIGH** (1) |
| VA loan | 3 | 0 | 1 | 0 | MED |
| VA refinance | 5 | 0 | 1 | 0 | MED |
| BAH lookup | 0 | 0 | 1 | 0 | LOW |

Seven HIGH findings. The five I would fix first:

1. **EDU-01 / EDU-02 / EDU-03** — the Post-9/11 GI Bill model has the wrong two lowest tiers (40% and 50% instead of 50% and 60%), never applies the tier to the housing allowance, and pays half the housing allowance to half-time students who get none. All three confirmed against VA.gov and 38 U.S.C. § 3313.
2. **CMP-01** — PCS Compare taxes military pay at the duty station's state rate and lets that decide the verdict. Under the SCRA a PCS does not change which state taxes the pay.
3. **COLA-01** — COLA areas are matched on the first three ZIP digits, so NAS Lemoore, Twentynine Palms, El Centro and Travis AFB get a COLA result and Vandenberg SFB does not.
4. **COLA-02** — the three "tiers" contradict the published 2026 indexes: Seattle (5%) is in the lowest tier, Santa Clara County (5%) in the highest, and New York City ("4%") in between.
5. **GR-01** — BRS government contributions are calculated on Annual Training pay only, and the page tells reservists matching "does not apply" to drill pay. Confirm the rule first; if it is as I recall, the government contribution is understated about four-fold.

---

## 2. Findings

### 2.1 Guard & Reserve (`/calculators/guard-reserve`)

**Where the logic lives:** `src/lib/calculations/guardReserve.ts` (`calculateDrillPay`, `calculateATPay`, `calculateTRSSavings`, `calculateBRSMatch`, `calculateGuardReserve`). Base pay from the shared `lookupBasePay` (`basePay.ts`). TRS premiums from `src/data/tricare/2026/constants.ts` — a second copy of the same premiums lives in `src/data/healthcare/2026/constants.ts:82-83` (already noted in `docs/healthcare-comparison-investigation-findings.md`, HIGH-1). The BRS match is a fourth implementation of the tiers audited in round 1 (TC-01). The page's worked example calls the same lib.

#### GR-01 — BRS contributions exclude drill pay, and the page says matching "does not apply" to drill weekends
- **Severity:** HIGH · **Confidence:** LIKELY
- **File:** `src/lib/calculations/guardReserve.ts:182-184` (`activeDutyPay = atPay + additionalPay`); stated as a rule at `guardReserve.ts:117-120`, `GuardReserveCalculator.tsx:70`, `:450`, `:614`, and `src/app/calculators/guard-reserve/page.tsx:185-196`.
- **Scenario (run):** E-5, 6 years, 12 weekends MUTA-4, 15 AT days, BRS on, 5% → drill pay $6,576, AT pay $2,055. Code: government contribution = 5% × $2,055 = **$102.75**. If automatic and matching contributions are paid on drill pay as well: 5% × $8,631 = **$431.55**.
- **Rule:** my recollection of DoD's BRS guidance for the Reserve Component is that the 1% automatic and the matching contributions are paid on basic pay earned in any paid status, including inactive duty training — **from memory — verify**. I could not fetch an official statement (militarypay.defense.gov, usar.army.mil: 403). The statute does not settle it by itself: 5 U.S.C. § 8440e(a)(1) defines "basic pay" as pay under 37 U.S.C. § 204, subsection (d) separately lets Ready Reserve members contribute from § 206 (inactive-duty) compensation, and subsection (e) caps the service's contribution at "5 percent of the member's basic pay" (https://www.law.cornell.edu/uscode/text/5/8440e). The same section confirms the timing round 1 flagged in TC-01: automatic contributions from the 60th day, matching from two years and one day — neither is modeled here.
- **Fix:** Confirm against DFAS/DoD BRS Reserve Component guidance or a drill LES. If drill pay earns contributions, base the calculation on total basic pay and correct the copy in the five places above.

#### GR-02 — Effective hourly rate uses 16 hours per weekend for MUTA-6 and MUTA-8
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/lib/calculations/guardReserve.ts:190-193` — hours = weekends × 16 regardless of `periodsPerWeekend`.
- **Scenario (run, no TRS, no BRS):**

  | Periods | Total value | Hours used | Code rate | Hours at 4 per period | Rate |
  |---|---|---|---|---|---|
  | MUTA-4 | $8,631 | 312 | $27.66 | 312 | $27.66 |
  | MUTA-6 | $11,919 | 312 | **$38.20** | 408 | $29.21 |
  | MUTA-8 | $15,207 | 312 | **$48.74** | 504 | $30.17 |

- **Rule:** a paid drill period is at least four hours (37 U.S.C. § 206 and DoD FMR Vol. 7A Ch. 58 — from memory — verify). The page describes the 16-hour figure as "two 8-hour days", which is only the MUTA-4 case.
- **Fix:** hours = weekends × periods × 4.

#### GR-03 — "TRS premium value" compares the member's premium to the *total* employer-plus-employee premium
- **Severity:** MED · **Confidence:** QUESTION (+ one DATA flag)
- **File:** `src/lib/calculations/guardReserve.ts:95-114`, `:186`; `src/data/tricare/2026/constants.ts:22-25`; label at `GuardReserveCalculator.tsx:597`.
- **Scenario (run):** family TRS → $27,000 − $3,439.92 = **$23,560** added to "Total annual Guard/Reserve value", which becomes $32,191 (73% of it is this one line) and **$103.18/hour**. The Healthcare calculator prices the same family at $570/month of employee-paid premium (`src/data/healthcare/2026/constants.ts:27`), i.e. $6,840/yr, so the premium a reservist avoids is about $3,400/yr, not $23,560. The row is labeled as total premiums and the copy says employee cost varies; the question is whether the headline total should include the employer's share.
- **Label bug (CONFIRMED):** with member-only TRS the comparison row still reads "Avg. employer-sponsored **family** plan total premiums (KFF 2025)" while showing ~$7,500.
- **DATA — needs external verification:** `individualAnnual: 7500` is described as a "rough average"; the family figure cites the survey value ($26,993) and the single figure cites nothing.
- **Fix:** Decide which comparison is intended; make the label follow the selected plan.

#### GR-04 — Annual Training BAH guidance contradicts the page's own FAQ; AT pay is base pay only
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only contradiction); rule LIKELY
- **File:** `GuardReserveCalculator.tsx:53-58` (action step shown to every user: "Look up the **E-5** with/without dependents BAH rate for your AT duty station ZIP code" — grade is hard-coded); `:702-704`; `page.tsx:162-163` ("use the BAH calculator to look up rates at your training location"). The FAQ at `page.tsx:25-28` says orders of 30 days or fewer generally draw BAH-RC/T, "a non-locality rate".
- **Scenario:** an O-3 with a 15-day AT is told to look up the E-5 locality rate at the training site. Neither the grade nor the rate type applies.
- **Rule:** BAH-RC/T for orders of 30 days or fewer; for longer orders BAH follows the primary residence, not the training location (37 U.S.C. § 403(g); DoD FMR Vol. 7A Ch. 26 — from memory — verify).
- **Also:** `calculateATPay` is days × base pay ÷ 30 (`guardReserve.ts:81-83`) while the UI says "During AT, you receive full active duty pay" (`:556`). BAS and BAH-RC/T are not added and are not on the "does not include" list (`page.tsx:250-264`). At the repo's own BAS rate that is $238.48 for a 15-day AT for enlisted members, before any housing allowance.
- **Fix:** Drop the locality-BAH pointers (or scope them to orders over 30 days), use the member's grade, and either add BAS/BAH-RC/T or list them as excluded.

#### GR-05 — Smaller items
- **Severity:** LOW · **Confidence:** CONFIRMED (repo-only)
- "Per drill weekend" is total value ÷ weekends (`guardReserve.ts:188`), so it includes AT pay, TRS value and the match: default state shows $719 per weekend while a weekend pays $548 (run).
- E-9 under 10 years, W-5 under 20 years: base pay resolves to $0 and every figure is $0 with no message (run) — the `lookupBasePay` behavior round 1 reported as RET-04/RET-08. `?rank=` is applied unvalidated (`GuardReserveCalculator.tsx:234`).
- `page.tsx:188` lists "REFRAD" as a type of active duty order; it is the release from active duty.
- Weekends (0–52), AT days (0–365) and additional days (0–365) are not cross-checked against a year.

---

### 2.2 CONUS COLA (`/calculators/cola`)

**Where the logic lives:** `src/lib/calculations/cola.ts` (`lookupColaArea`, `getGradeGroup`, `getApproxMonthlyRate`, `lookupCola`), data in `src/data/cola/2026/constants.ts`. Shared with PCS Compare (`compare.ts:105-113`). The page's worked example calls the lib; the hero strip ($430/mo, $5,160) is hand-keyed and matches today.

**How the real allowance works (fetched):** the DoD 2026 release says CONUS COLA goes to areas where non-housing costs exceed 107% of the national average, and the amount "varies based on geographic duty location, pay grade, years of service, and dependency status". For 2026: 6 military housing areas began receiving it, 8 increased, 2 unchanged, 2 decreased, 9 lost it, and 21 non-metropolitan counties lost it. Highest rates: San Francisco 8%, Oakland 6%, Santa Clara County 5%, Staten Island 5%, Seattle 5% (DoD release as reposted at https://www.miragenews.com/war-dept-announces-2026-us-cost-of-living-rates-1594856/).

#### COLA-01 — Three-digit ZIP prefixes put the wrong installations in COLA areas
- **Severity:** HIGH · **Confidence:** CONFIRMED (repo data)
- **File:** `src/lib/calculations/cola.ts:42-46`; prefixes in `src/data/cola/2026/constants.ts:86-240`.
- **Scenario (run; MHA names from the repo's own `zipToMha` / `mhaNames`):**

  | ZIP | Repo MHA | COLA result |
  |---|---|---|
  | 93246 | CA023 Lemoore NAS | "Santa Barbara / Vandenberg" |
  | 93437 | CA026 Vandenberg SFB | **none** |
  | 92278 | CA032 Twentynine Palms MCB | "San Diego" |
  | 92243 | CA420 El Centro | "San Diego" |
  | 94535 | CA036 Vallejo/Travis AFB | "San Francisco Bay Area" (high tier) |
  | 11252 (Fort Hamilton) | NY219 New York City | "Long Island" |
  | 02903 | RI257 Providence | "Newport Area" |
  | 98278 | WA312 Whidbey Island | "Seattle / Puget Sound" |
  | 98315 | WA306 Bremerton | none |

  Counting every ZIP in the dataset: the "Santa Barbara / Vandenberg" area contains 42 Lemoore ZIPs and 1 Vandenberg ZIP; "San Diego" contains 23 Riverside ZIPs (the file's own header says Riverside lost eligibility in 2026); "San Francisco Bay Area" contains 51 Sacramento ZIPs; 138 New York City ZIPs (Brooklyn, Queens) land in "Long Island", whose note says Nassau and Suffolk.
- **Rule:** eligibility is set per military housing area and per non-metropolitan county (DoD release above), not per ZIP prefix. Which MHAs are on the 2026 list is a DATA question (below); the routing errors hold either way.
- **Fix:** Key COLA areas by MHA code through the existing `zipToMha` map.

#### COLA-02 — The tiers contradict the published 2026 indexes
- **Severity:** HIGH · **Confidence:** CONFIRMED (indexes fetched; inconsistency is in the repo) + DATA
- **File:** `src/data/cola/2026/constants.ts:56-81` (dollar table), `:150-167` (Seattle "5%" → `moderate`; NYC "4%" → `moderate-high`), `:88-95` (Bay Area → `high`).
- **Scenario (run), E-5 with dependents:**

  | Area | Published 2026 index | Tier in repo | Calculator shows |
  |---|---|---|---|
  | San Francisco | 8% | high | $430/mo |
  | Santa Clara County (95113) | 5% | high | $430/mo |
  | Seattle (98101) | 5% | moderate | **$140/mo** |
  | New York City (10004) | "4%" per the file's own note | moderate-high | **$270/mo** |

  Two 5% areas differ by a factor of three, and a 4% area is shown above a 5% area. Monterey is described as "one of the highest-tier CONUS COLA locations" (`page.tsx:107`) and is the hero example, but it is not among the five highest rates DoD named.
- **DATA — needs external verification (no corrected values offered):**
  - The dollar table is not derived from an index: the same $430 covers 5% and 8% areas, and the amounts are flat across years of service.
  - The area list (Los Angeles, Orange County, San Diego, Ventura, the National Capital Region, three Connecticut areas, Northern New Jersey, Newport) could not be checked against the official 2026 list — `cclocs26.pdf` returned 403. The DoD release counts 18 MHAs receiving COLA in 2026.
  - `constants.ts:166` says the NYC rate "includes all five boroughs"; the release lists Staten Island at 5%.
- **Page text vs code:** "using official 2026 DTMO data" (`page.tsx:66`) and "Uses DTMO area data for 2026" (`:16`), while the data file says "approximate rates for informational purposes only".
- **Fix:** Store the published index per MHA and either compute from DTMO's tables or show the index and link out rather than a dollar figure.

#### COLA-03 — No years-of-service input; six grade groups
- **Severity:** MED · **Confidence:** CONFIRMED (rule fetched)
- **File:** `src/lib/calculations/cola.ts:32-39`; `page.tsx:157` ("Basis: Pay grade + qualifying area + dependency status").
- **Scenario (run):** an E-1 and an E-4 get the same figure; O-1 to O-3 get exactly the E-5 to E-9 figures in every tier.
- **Rule:** the amount varies by pay grade, years of service and dependency status (DoD release above).
- **Fix:** Add years of service or state the simplification in the result card.

#### COLA-04 — O-1E, O-2E and O-3E fall through to the general-officer group
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/lib/calculations/cola.ts:38` (default branch returns `'O7-O10'`); `src/lib/urlParams.ts:12-14` accepts `o1e`.
- **Scenario (run):** ZIP 93940, with dependents: O-1 → $430; O-1E → **$610**. Reachable with `?rank=o1e`, and through PCS Compare, which shares the function.
- **Fix:** Map the three prior-enlisted grades to `O1-O3`; make the default branch explicit.

#### COLA-05 — Page and tests
- **Severity:** LOW · **Confidence:** CONFIRMED (repo-only)
- `page.tsx:179-181` lists Boston among qualifying areas; the calculator's own notice (`ColaCalculator.tsx:169-171`) says Greater Boston lost eligibility in 2026.
- `tests/e2e/cola.spec.ts:21-27` says "93446 (Paso Robles, CA area) has a CONUS COLA rate". `lookupColaArea('93446')` returns null (run). The assertion still passes because its regex matches the static "$430/mo" in the hero strip; the tier-badge test (`:51-55`) passes on static text the same way. No test exercises a positive lookup.

---

### 2.3 Education benefits (`/calculators/education`)

**Where the logic lives:** `src/lib/calculations/education.ts` (`calculateMHA`, `calculatePostGIBill`, `calculateVRE`, `calculateTA`, `calculateMGIB`, `compareAllBenefits`), rates and tiers in `src/data/education/2026/constants.ts`. School BAH comes from the shared `useBahLookup` / `rateFor` at E-5 with dependents (correct basis). The page's worked example calls the lib. In the runs below the school BAH was injected as $3,000.

#### EDU-01 — The two lowest Post-9/11 tiers are wrong (40% and 50% instead of 50% and 60%)
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/data/education/2026/constants.ts:70-71` (`'90d': 40`, `'6mo': 50`); UI hint "eligibility tier (40%–100%)" at `EducationCalculator.tsx:362`.
- **Scenario (run), veteran, public school, $12,000 tuition:**

  | Service | Code | Rule |
  |---|---|---|
  | 90 days | 40%: tuition $4,800, books $400 | 50%: $6,000, $500 |
  | 6 months | 50%: tuition $6,000, books $500 | 60%: $7,200, $600 |

- **Rule:** VA.gov, rates effective Aug 1, 2026: "90 to 179 days (90 days to 5 months): 50% of the full benefit"; "180 to 544 days (6 to 17 months): 60%" (https://www.va.gov/education/benefit-rates/post-9-11-gi-bill-rates/). 38 U.S.C. § 3313(c) lists reduced rates of 90, 80, 70, 60 and 50 percent — there is no 40% (https://www.law.cornell.edu/uscode/text/38/3313). The 12-month option (60%) is already correct.
- **Fix:** `'90d': 50`, `'6mo': 60`; update the hint.

#### EDU-02 — The eligibility percentage is never applied to the housing allowance
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/education.ts:75-91`, `:135` — `calculateMHA` takes no tier. Tuition (`:128-131`) and books (`:139`) are prorated. The card's own note says "all benefits prorated" (`:146`).
- **Scenario (run):** 60% tier → MHA **$3,000/mo**; rule 60% × $3,000 = **$1,800**. Overstated by $1,200/month, $10,800 per academic year, $43,200 over four years. At 80%: $3,000 vs $2,400.
- **Rule:** 38 U.S.C. § 3313(c)(2)–(6): "amounts equal to 90 percent of the amounts that would be payable to the individual under paragraph (1)" — paragraph (1) covers tuition, the monthly housing stipend and the books lump sum (URL above).
- **Fix:** Multiply the housing allowance by the tier percentage.

#### EDU-03 — Half-time students are paid half the housing allowance; three-quarter time is paid 75%
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/education.ts:62-66`, `:83-90`.
- **Scenario (run):** half-time → **$1,500/mo** ($13,500/yr, $54,000 over four years); rule **$0**. Three-quarter time → $2,250; rule 80% = $2,400.
- **Rule:** VA.gov lists "You're in school half time or less than half time" among those not eligible for the housing allowance, and gives the example of 9 of 12 credits as an 80% rate of pursuit "(9 divided by 12, rounded to the nearest tenth)". 38 U.S.C. § 3313(c)(1)(B)(i): the stipend is for pursuit "on more than a half-time basis", with the ratio "rounded to the nearest multiple of 10" (both URLs above).
- **Note:** VR&E reuses the same function (`:211`). Chapter 31 subsistence does pay at half time, so apply the fix to the Chapter 33 path only.
- **Fix:** Rate of pursuit = round to the nearest 10%; $0 at 50% or below.

#### EDU-04 — VR&E housing is always the Post-9/11 rate, even without GI Bill eligibility
- **Severity:** MED · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/education.ts:210-212`.
- **Scenario (run):** less than 90 days of service (not GI Bill eligible), 30% rating → VR&E housing **$3,000/mo**, annual value $40,200, "Highest est. value".
- **Rule:** "If a Veteran qualifies for the Post-9/11 GI Bill, they may be eligible to receive the Basic Allowance for Housing (BAH) rate for subsistence" (https://www.benefits.va.gov/vocrehab/subsistence_allowance_rates.asp). Otherwise the standard Chapter 31 rate applies — FY27 full-time, no dependents: $837.23 (https://www.benefits.va.gov/vocrehab/vrerates27.asp). The blue note under the inputs says this; the number does not follow it.
- **By construction:** for anyone with a 10%+ rating VR&E equals full tuition + the same housing + $1,200 books, so it always carries the "Highest est. value" badge.
- **Fix:** Use the Post-9/11 rate only when the GI Bill tier is above zero; otherwise the standard subsistence rate.

#### EDU-05 — Active-duty insight says the forfeited housing allowance is "~$0"; MGIB is flagged highest for active duty
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/lib/calculations/education.ts:431-434` sets `mhaMonthly` to null for active duty; `:364-371` then builds the sentence from it.
- **Scenario (run), active duty, defaults:** "Post-separation, GI Bill MHA could add in housing allowance — worth ~$0 over 4 years that you'd forfeit by using GI Bill while serving." The sentence exists to show a large number.
- **Also:** in the same run the "Highest est. value" badge lands on Montgomery GI Bill ($90,648) because MGIB is marked eligible for everyone (`:335`) and its full stipend is counted while the Post-9/11 housing is zero. On active duty Chapter 30 pays no more than tuition and fees (from memory — verify).
- **Fix:** Pass the school BAH to the insight regardless of status; gate or cap MGIB for active duty.

#### EDU-06 — An unresolved ZIP is shown to a veteran as "BAH on active duty"
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `EducationCalculator.tsx:142-146`, `:181-183` key the active-duty notice on `monthlyMHA === 0`.
- **Scenario (run):** veteran, ZIP not in the dataset (or lookup still pending or failed) → housing $0, total drops from $160,000 to $52,000, the badge moves to MGIB, and the card reads "Active-duty members using Post-9/11 GI Bill generally do not receive MHA — they already receive BAH."
- **Fix:** Key the notice on status, and show "enter a valid ZIP" when the rate is missing.

#### EDU-07 — DATA: two rates differ from the VA pages fetched this session
- **Severity:** MED · **Confidence:** DATA (official pages fetched)
- `src/data/education/2026/constants.ts:29` — `onlineMHAMonthly: 1261`, repeated as text at `education.ts:73` and `:156`. VA.gov, effective Aug 1, 2026 to Jul 31, 2027: online-only "up to $1,198" (https://www.va.gov/education/benefit-rates/post-9-11-gi-bill-rates/). This may be the Education MHA item already on hold.
- `constants.ts:56` — `fullTimeMonthly: 2518`, labeled Oct 2025–Sept 2026; also hard-coded at `src/app/calculators/education/page.tsx:162`. VA.gov, effective Oct 1, 2026: $2,601.00 full time, $1,950.75 at 75%, $1,300.50 at 50% (https://www.va.gov/education/benefit-rates/montgomery-active-duty-rates/). The file describes itself as the 2026–2027 academic year, most of which falls after Oct 1.
- The private-school cap ($30,908.34) and the $1,000 books stipend match the same VA page.

#### EDU-08 — Smaller items
- **Severity:** LOW · **Confidence:** QUESTION (rules from memory — verify)
- `education.ts:251-252`: Tuition Assistance is "active duty service members only"; drilling Guard and Reserve members can be eligible depending on the service.
- `education.ts:323`: "Requires $1,200 buy-in and service before Jan 1, 2018" — I know of no 2018 cutoff for Chapter 30; source unknown.
- Guard/Reserve status is shown the Chapter 30 active-duty rate; the Selected Reserve program is a different, lower rate.
- "Online only" always uses the private-school cap (`:126-132`), including online programs at public schools.
- The Yellow Ribbon note shows at every tier (`:151-154`; `EducationCalculator.tsx:523-527`); Yellow Ribbon needs the 100% tier.
- `?tier=` and `?va=` are applied unvalidated (`EducationCalculator.tsx:302-303`).
- `page.tsx:97-110`: the "Direct answer" paragraph is rendered twice.

---

### 2.4 Healthcare comparison (`/calculators/healthcare-comparison`)

**Where the logic lives:** entirely inside `HealthcareComparisonCalculator.tsx:27-208` (`calculate`, `getSubsidyRate`, `calcTampSplit`; none exported, so nothing here can be unit-tested without a browser), data in `src/data/healthcare/2026/constants.ts`. Transition Readiness keeps its own separate healthcare benchmarks (`transition-readiness.ts:34-42`: $175/$575 employer, $525/$1,700 marketplace vs $170/$570 and $500/$1,600 here).

**Already on record:** `docs/healthcare-comparison-investigation-findings.md` (2026-06-13) covers the duplicate TRS constant, the ACA out-of-pocket maximum, pre-tax premiums, the $0 VA path, and the FPL year labels. I did not re-audit those. One item from it is still open in the code: `page.tsx:142` labels $1,200/month as the family **silver** ACA plan; the data has $1,200 as bronze and $1,600 as silver (its MED-4).

#### HC-01 — A malformed share link crashes the calculator
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only, traced)
- **File:** `HealthcareComparisonCalculator.tsx:331-341` casts `path`, `family`, `tier` and `rating` from the URL with no check.
- **Scenario (traced):** `?path=cobra` → the `switch` at `:82` matches nothing, `calculate` returns undefined, and `calcTampSplit` reads `result.monthlyPremium` (`:200`) → TypeError during render. `?tier=platinum` → `p.deductible` on undefined (`:84-85`). `?rating=70` → `va.monthlyCopayEst` on undefined (`:142-143`). `?family=x` → household size undefined → FPL is NaN.
- **Fix:** Validate each param against its allowed values, as the other calculators do.

#### HC-02 — The ACA subsidy is a flat percentage off whichever tier is selected
- **Severity:** MED · **Confidence:** LIKELY
- **File:** `HealthcareComparisonCalculator.tsx:42-48`, `:115-119`; bands at `constants.ts:52-56`.
- **Scenario (arithmetic reproduced), single, silver ($500 list):** income $39,000 (249% FPL) → 75% off → **$125/mo**; income $39,200 (250.5%) → 40% off → **$300/mo**. $200 more income costs $2,100 a year. Income of $1 → 90% off.
- **Rule:** the credit is the benchmark (second-lowest silver) premium minus a sliding share of income, a dollar amount that is the same whichever tier is bought; households under 100% FPL generally get no credit (26 U.S.C. § 36B — from memory — verify). So a bronze plan costs less than the model shows and a gold plan more, and there are no cliffs at 150% and 250%.
- **Fix:** Compute expected contribution = income × applicable percentage, credit = benchmark silver − contribution, and subtract that dollar amount from each tier; show "not eligible" under 100% FPL.

#### HC-03 — DATA: TRS deductible and catastrophic cap
- **Severity:** MED · **Confidence:** DATA
- **File:** `src/data/healthcare/2026/constants.ts:82-83` — deductible $150 / $300, `oopMax` $3,000 / $6,000; also stated at `page.tsx:215`.
- tricare.mil now shows calendar-year **2027** TRS costs: premiums $60.54 and $307.48; deductible by pay grade — E-1 to E-4 $68 individual / $137 family, E-5 and above $205 / $411; catastrophic cap **$1,372 per family** (https://www.tricare.mil/Costs/HealthPlanCosts/TRS). I could not fetch the 2026 table, so no 2026 values are offered. The structure differs from the repo either way: the deductible depends on pay grade (no input for it), and the cap is one per-family figure well below $3,000, not a single/family pair.
- The 2026 premiums in the repo ($57.88 / $286.66) sit plausibly below the 2027 figures; not verified.

#### HC-04 — The TAMP eligibility list on the page does not match the statute
- **Severity:** MED · **Confidence:** CONFIRMED
- **File:** `src/app/calculators/healthcare-comparison/page.tsx:175-177`: "involuntary separation (e.g., reduction in force), early retirement, separation under the Voluntary Separation Incentive (VSI) or Special Separation Benefit (SSB), and certain other special programs." `constants.ts:90`: "Free TRICARE coverage for 180 days post-separation" with no condition.
- **Rule:** 10 U.S.C. § 1145(a)(2) lists: (A) involuntary separation; (B) reserve members released from more than 30 days of active duty for a contingency operation; (C) members retained under stop-loss; (D) members who voluntarily stayed under a year for a contingency operation; (E) sole survivorship discharge; (F) "A member who is separated from active duty who agrees to become a member of the Selected Reserve"; (G) certain National Guard duty under 32 U.S.C. § 502(f). 180 days under (a)(4). (https://www.law.cornell.edu/uscode/text/10/1145). The page omits (B) through (G) — including demobilizing reservists and members who join the Selected Reserve — and names "early retirement" and VSI/SSB, which are not on the list.
- **Fix:** Replace the list with the statutory categories in plain words.

#### HC-05 — Retirees have no option to select
- **Severity:** MED · **Confidence:** QUESTION
- **File:** `HealthcareComparisonCalculator.tsx:431-437` (six paths, none for retiree TRICARE); `page.tsx:104` says healthcare "transitions to TRICARE retirement plans, employer coverage, or ACA marketplace options"; step strip `:95` says "Compare TRICARE, employer, ACA, and VA options".
- A 20-year retiree is shown employer and ACA costs only, under the banner "After separation, premiums alone can run $7,000–$12,000 per year". For scale, tricare.mil's 2027 TRICARE Select retiree enrollment fees are $193.92 individual / $388.92 family (Group A) and $616.92 / $1,233.96 (Group B) per year (https://www.tricare.mil/Costs/HealthPlanCosts/TS).
- **Fix:** Add a retiree path (Prime/Select, Group A/B) or state at the top that the tool is for non-retirement separations.

#### HC-06 — Smaller items
- **Severity:** LOW · **Confidence:** QUESTION
- `constants.ts:77` and `page.tsx:190`: a 0% service-connected veteran's care is "generally limited to service-connected conditions". My recollection is that an enrolled veteran gets the full medical benefits package, with copays for non-service-connected care — from memory — verify.
- `HealthcareComparisonCalculator.tsx:595`: "VA healthcare at 50%+ has no premium cost for service-connected conditions" understates Priority Group 1, which has no copays for any care.
- `:199-207`: the TAMP split halves the estimated deductible usage for a half year; a deductible is annual and resets in January.

---

### 2.5 Transition readiness (`/calculators/transition-readiness`)

**Where the logic lives:** `src/lib/calculations/transition-readiness.ts` (`splitRetiredPay`, `computeCivilianTaxes`, `estimateAnnualFederalTax`, `calculateTransitionReadiness`), state rules in `src/data/state-military-retirement-tax.ts` (every record carries a source URL and a 2026-11-10 verification date; I did not re-audit state rates). Shares `lookupBasePay`, `vaRates`, BAS and the bracket constants with other calculators, and BAH through `useBahLookup`. The page's example comes from `transition-readiness-example.ts`, computed, not typed in. This is the best-tested calculator in the repo (`transition-readiness-unit.spec.ts`, about 40 lib-level cases). In the runs below BAH was injected as $1,956.

**The `test.fixme` at `tests/e2e/transition-readiness.spec.ts:92`**
- **What it was meant to test:** that a "Save as PDF" button appears once a salary and monthly expenses are entered. Its comment reads "passes after deployment — tests new Save as PDF button added in batch 2". It dates from when the suite ran against the live site, before commit `31deea7` ("transition readiness batch 2 — … PDF export") was deployed.
- **Is the underlying behavior correct?** In the code, yes. The button is at `TransitionReadinessCalculator.tsx:786-806`, labeled "Save as PDF", calls `window.print()`, and sits inside the branch that renders only when `hasEngaged` is true (`:366`, `:771`) — salary above zero and expenses above zero. That is what the test expects.
- **Not verified:** I did not start a browser, so I did not run it. One thing to check when un-fixing it: this test uses `.fill()` on the two currency inputs, while the passing share-button test just above it (`:83-89`) uses `pressSequentially` on the same fields. Use the same input method.

#### TR-01 — "TAMP covers your first 180 days" is stated to every non-retiree
- **Severity:** MED · **Confidence:** CONFIRMED
- **File:** `TransitionReadinessCalculator.tsx:1062-1066`: "**TAMP covers your first 180 days** — no healthcare premium for the first 6 months after separation." A smaller line below says to confirm eligibility.
- **Rule:** 10 U.S.C. § 1145(a)(2) (quoted in HC-04) — a voluntary separation at the end of an enlistment is not on the list unless the member joins the Selected Reserve. The Healthcare page's own example says "No TAMP eligibility (voluntary ETS)" (`healthcare-comparison/page.tsx:135`).
- The budget math uses the post-TAMP cost, so no number is wrong; the sentence is.
- **Fix:** "If you qualify for TAMP, your first 180 days are covered…".

#### TR-02 — The timeline factor can never change the verdict
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/lib/calculations/transition-readiness.ts:476-482` — `shortTimelineWithIssues` requires `hasDeficit || veryLowEF`, both already in the same `if`.
- **Scenario (run):** $1,023 surplus, 8.7 months of savings, 30% VA, **0 months** until separation → Timeline badge red, verdict **"Ready to Transition — Your income, savings, and timeline support a successful separation."**
- The page (`page.tsx:208-211`) correctly says three factors decide the verdict; the verdict summary (`TransitionReadinessCalculator.tsx:139`) names the timeline, and a fourth badge is shown beside the three that count.
- **Fix:** Remove the dead condition and drop "timeline" from the summary, or make a red timeline cap the verdict at "Almost".

#### TR-03 — VA claim factor: retirees are exempt, and "0% (filed)" reads as not filed
- **Severity:** MED · **Confidence:** QUESTION
- **File:** `transition-readiness.ts:467-471`; badge text at `TransitionReadinessCalculator.tsx:849-857`.
- **Scenario (run):** E-7 at 20 years, "Haven't filed yet" → VA claim status `na`, shown as "TRICARE retiree" under the heading "VA claim", verdict **Ready**, no "File your VA disability claim" step. The page explains this as "retirement making VA moot" (`page.tsx:211`). A VA rating is not moot for a retiree: below 50% it converts part of retired pay to tax-free income, and at 50%+ it is paid in addition — the calculator models both.
- **Scenario (run):** rating option "0% (filed, no rating)" → badge "Not yet filed" and the action step "File your VA disability claim before you separate".
- **Fix:** Judge the factor on "Haven't filed yet" (−1) alone, for retirees too.

#### TR-04 — Whole-year service input flips retirement eligibility for anyone inside their last year
- **Severity:** MED · **Confidence:** LIKELY
- **File:** `transition-readiness.ts:371-373`; the years-of-service field is a whole-number select with no hint.
- **Scenario (run):** E-7, High-3, 19 years. Separation 12 months out → pension $3,088.65, healthcare $0, surplus **$3,373**. Separation 11 months out → pension **$0**, healthcare $575, surplus **$405**, "Almost Ready". A member with 19 years 6 months retiring in 6 months at 20 years has to know to enter 20.
- **Rule:** service is credited by month (10 U.S.C. § 1409, fetched in round 1, RET-07).
- **Fix:** Add months, or a hint: "enter the years you will have completed on your separation date".

#### TR-05 — Two healthcare cases resolve to $0
- **Severity:** MED · **Confidence:** LIKELY
- **VA healthcare with dependents** (`transition-readiness.ts:54-56`): cost is $0 whatever the family status. Run: E-6 with dependents, 70%, VA healthcare → healthcare $0, verdict Ready. VA care covers the veteran only — the Healthcare calculator shows a warning for exactly this (`HealthcareComparisonCalculator.tsx:549-553`). The only warning here is about ratings below 50% (`TransitionReadinessCalculator.tsx:381`).
- **Retiree TRICARE** (`:433-436`): $0. TRICARE Select for retirees has an enrollment fee — 2027: $388.92/yr family in Group A, $1,233.96/yr in Group B (https://www.tricare.mil/Costs/HealthPlanCosts/TS) — plus cost shares. Small next to the other figures; the UI says "~$0/mo" and "minimal cost".
- **Fix:** With dependents and VA selected, add family coverage or warn; add the retiree enrollment fee.

#### TR-06 — Pension basis differs from the Retirement calculator
- **Severity:** LOW · **Confidence:** CONFIRMED (repo-only; depends on RET-03)
- **File:** `transition-readiness.ts:376-378` — current base pay at current years × multiplier × whole years at separation. No High-3 average.
- **Scenario (run):** E-7 with 20 years now, High-3 → **$3,122.85** here; `retirement.ts` gives $3,100.05 for the same member and the rule value from round 1 is $3,059.25. Three figures for one retirement. Far from retirement the error runs the other way (pay at today's years of service, multiplied by 20). Disclosed as "at your current base pay" (`page.tsx:254`).
- **Fix:** Reuse `calculateHigh3Average` once RET-03 is settled.

#### TR-07 — Smaller items
- **Severity:** LOW · **Confidence:** CONFIRMED (repo-only)
- The share link omits detailed-mode expenses (`TransitionReadinessCalculator.tsx:305-308` writes `exp` only in quick mode), so a detailed-mode link reloads to "Enter your monthly expenses".
- FICA is a flat 7.65% of all wages (`transition-readiness.ts:63`, `:194`): at a $400,000 salary the code deducts $2,550/month (run); Social Security stops at the annual wage base (from memory — verify).
- VA compensation with dependents uses the with-spouse rate (`:238`), including for a single parent filing head of household. The UI note says "Estimate assumes veteran with spouse" even when "No dependents" is selected, where the code uses the veteran-alone rate.
- W-5 with 10 years (no pay column): base pay $0, military take-home is BAH + BAS, "you would need a civilian salary of approximately $32,000" (run) — the `lookupBasePay` gap from RET-04.

---

### 2.6 Separation timeline (`/calculators/separation-timeline`)

**Where the logic lives:** entirely inside `SeparationTimelineCalculator.tsx:33-324` (`addDays`, `addYears`, `diffDays`, `parseISODate`, `buildTimeline`; none exported). Not shared. The page example (`page.tsx:96-105`) is hand-keyed.

**Date rules present:** BDD 180–90 days before; TAP completion 90 days before; TAMP 180 days; SGLI 120 days; VGLI 240 days without health questions and 485 days to apply; final move 180 days (separating) or 3 years (retiring). Terminal leave and GI Bill dates are not modeled.

#### SEP-01 — "BDD Filing Window Opens" turns red and reads "Expired" while the window is open
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only, traced)
- **File:** `SeparationTimelineCalculator.tsx:136-143` (`pointStatus`: any past date → `past`), `:119-125` (`past` → "Expired"), `:165-177`.
- **Scenario (traced):** separation 150 days from today. The window opened 30 days ago and closes in 60. The card shows a red "Expired" badge and "30 days ago" over the text "File your VA disability claim through Benefits Delivery at Discharge." The SHPE/SHA card for the same dates correctly shows "Active now".
- **Rule:** BDD claims are filed 180 to 90 days before separation (VA.gov — from memory — verify; the page says the same at `page.tsx:165`).
- **Fix:** Make the BDD window one range item, or label a past opening "Open".

#### SEP-02 — "Retiring" changes only the final-move date
- **Severity:** MED · **Confidence:** LIKELY
- **File:** `SeparationTimelineCalculator.tsx:158` is the only use of `sepType`.
- **Scenario (traced):** a retiree with the default "Not sure" for TAMP sees "TRICARE Active-Duty Coverage Ends" and a 180-day TAMP period, and no step for enrolling in retiree TRICARE.
- **Rule:** retirees keep TRICARE eligibility but must enroll in a retiree plan within a set window after retirement — 90 days, from memory — verify (the tricare.mil page fetched did not state it). Transitional coverage under 10 U.S.C. § 1145 is for the separating categories in HC-04.
- **Fix:** For retirees, replace the TAMP item with a retiree-enrollment deadline once the window is confirmed.

#### SEP-03 — VGLI deadline is 485 days, one day short of "1 year and 120 days" across a leap day
- **Severity:** LOW (errs early) · **Confidence:** CONFIRMED
- **File:** `SeparationTimelineCalculator.tsx:159`.
- **Scenario (arithmetic reproduced):** separation Jun 1, 2027 → code Sep 28, 2028; one calendar year plus 120 days → Sep 29, 2028. Same for Mar 1, 2027 and Feb 29, 2028. No difference when no Feb 29 falls in the first year (the page example, Sep 30, 2026 → Jan 28, 2028, is right).
- **Rule:** "You'll need to apply for VGLI within 1 year and 120 days of leaving the military"; "within 240 days… you won't need to prove you're in good health" (https://www.va.gov/life-insurance/options-eligibility/vgli/).
- **Fix:** `addDays(addYears(sepDate, 1), 120)`.

#### SEP-04 — Rule questions
- **Severity:** LOW · **Confidence:** QUESTION (from memory — verify)
- The only TAP item is the completion deadline at 90 days before separation. The start requirement — pre-separation counseling no later than 365 days before separation (10 U.S.C. § 1142) — has no card.
- Final move: 3 years for retirees and 180 days for separating members are JTR limits I could not fetch (travel.dod.mil 403).
- TAMP runs from the separation date through day +180, treating the day after the last active-duty day as day 1; § 1145(a)(4) says "180 days beginning on the date on which the member is separated". Off by at most one day.
- `page.tsx:87`: "VGLI conversion must happen within 240 days" — the 240 days is the no-health-questions window; the page gives the full window correctly further down.

#### SEP-05 — `?date=` accepts impossible dates
- **Severity:** LOW · **Confidence:** CONFIRMED (arithmetic reproduced)
- **File:** `SeparationTimelineCalculator.tsx:57-63`, `:447` — format check only.
- **Scenario:** `?date=2026-02-31` builds a timeline for Mar 3, 2026; `?date=2026-13-45` for Feb 14, 2027.
- **Fix:** Reject a date whose parts do not round-trip.

---

### 2.7 PCS compare (`/calculators/compare`)

**Where the logic lives:** `src/lib/calculations/compare.ts` (`compareLocations`, a private `computeLocation`, and its own copy of the progressive federal tax calculation, separate from the ones in `deployment.ts` and `transition-readiness.ts`), state rates and the ZIP-to-state function in `src/data/compare/stateTax.ts`. BAH is injected from the shared `useBahLookup` / `rateFor`; COLA comes from `cola.ts`. In the runs below BAH came from `lookupBAH` on the repo's 2026 data.

#### CMP-01 — The verdict includes a state tax difference that a PCS does not cause
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/compare.ts:115-128` (duty-station state rate × base pay), `:175-191` (verdict from take-home); headline and tax sentence at `CompareCalculator.tsx:125-146`.
- **Scenario (run):**

  | Member | A vs B | BAH | State tax in the model | Headline | Without the tax term |
  |---|---|---|---|---|---|
  | E-6, 10 yrs, dependents | Fort Bragg vs Fort Benning | $2,049 vs $1,977 | NC $190/mo vs GA $261/mo | "Fort Bragg pays $143 more per month" | $72 → "financially similar" |
  | E-7, 14 yrs, dependents | Norfolk vs Jacksonville | $2,604 vs $2,283 | VA $277/mo vs FL $0 | "financially similar" ($44) | Norfolk +$321/mo |
  | O-3, 6 yrs, none | Tacoma vs Norfolk | $2,784 vs $2,505 | WA $0 vs VA $368/mo | "Tacoma pays $647 more" | Tacoma +$279/mo |

- **Rule:** 50 U.S.C. § 4001(a)(1): "A servicemember shall neither lose nor acquire a residence or domicile for purposes of taxation" by being present under orders; § 4001(b): "Compensation of a servicemember for military service shall not be deemed to be income for services performed or from sources within a tax jurisdiction… if the servicemember is not a resident or domiciliary of the jurisdiction in which the servicemember is serving in compliance with military orders" (https://www.law.cornell.edu/uscode/text/50/4001). The member's state of legal residence taxes the pay at both stations, so the difference between stations is zero unless they change domicile.
- **Disclosure:** an amber box below the table says this (`CompareCalculator.tsx:538-561`). The headline, the "after estimated federal and state taxes" subline and "has no state income tax — that saves approximately $X/year" are stated as results above it.
- **Fix:** Default to no state-tax difference (same legal residence at both stations); offer a "state of legal residence" selector, or a clearly labeled "if I change my residence to the new state" toggle.

#### CMP-02 — COLA in the comparison inherits the ZIP-prefix and tier problems
- **Severity:** MED · **Confidence:** CONFIRMED (depends on COLA-01, COLA-02, COLA-04)
- **File:** `src/lib/calculations/compare.ts:105-113`.
- **Scenario (run):** E-6 with dependents at Camp Pendleton (92055) gets $270/mo "San Diego" COLA; E-5 at NAS Lemoore (93246) gets $140/mo "Santa Barbara / Vandenberg" COLA. Both feed gross pay, federal tax and the verdict.
- **Fix:** Follows from the COLA fixes.

#### CMP-03 — ZIP-to-state ranges
- **Severity:** LOW · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/data/compare/stateTax.ts:74-133`.
- **Scenario (run):** 20171 (Herndon, VA) → DC, taxed at 6.0% instead of Virginia's 4.75%; 39901 (the repo's MHA name is "Atlanta, GA") → MS; 88510 (El Paso, TX per the repo's MHA name) → null. An unrecognized prefix silently uses a 0% rate (`compare.ts:117-118`).
- **Fix:** Take the state from the MHA code's first two letters, which the BAH lookup already returns.

#### CMP-04 — Single filer, and "take-home" has no FICA
- **Severity:** LOW · **Confidence:** LIKELY (same class as round 1 DEP-03 and DEP-04)
- **File:** `src/lib/calculations/compare.ts:76-89`, `:128`.
- Federal tax uses single brackets even with dependents selected, and Social Security and Medicare are not deducted. Both stations share the same base pay, so the *difference* is affected only through COLA; each absolute take-home figure is high by about 7.65% of base pay.
- **Fix:** Rename to "after income tax" or deduct FICA; reuse `estimateAnnualFederalTax` with a filing status.

---

### 2.8 VA loan (`/calculators/va-loan`)

**Where the logic lives:** entirely inside `VALoanCalculator.tsx:23-49` and `:282-308` (`getFundingFeeRate`, `calcMonthlyPI`, the `calc` memo; none exported). BAH comparison uses the shared `useBahLookup` / `rateFor`. `calcMonthlyPI` is duplicated in `VARefinanceCalculator.tsx:12-18`. **There is no test file for this calculator.**

#### VAL-01 — The page promises a VA-vs-conventional comparison the calculator does not have
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/app/calculators/va-loan/page.tsx:37`, `:44`, `:54`, `:64` ("compare VA to conventional financing"), `:48`, `:55` (social image: "Monthly payment, funding fee, and VA vs conventional"). The component has no conventional or PMI calculation, and `page.tsx:373` says "It does not compare VA loans to conventional, FHA, or other loan types."
- **Fix:** Remove the claim from the description and image text, or build the comparison.

#### VAL-02 — Entering the down payment as a percentage can land in the wrong fee band
- **Severity:** LOW · **Confidence:** CONFIRMED (arithmetic reproduced)
- **File:** `VALoanCalculator.tsx:169-173` rounds the dollar amount; `:283-287` recomputes the percentage from the rounded dollars.
- **Scenario:** price $389,905, down payment typed as 5% → $19,495 → 4.99994% → 2.15% band → fee **$7,964**; the 1.5% band gives $5,556. The same happens at 10%. It affects prices where price × rate rounds down — not the usual round-thousand prices.
- **Rule:** VA.gov table: less than 5% down 2.15% (first use); 5% or more 1.5%; 10% or more 1.25% (https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/).
- **Fix:** In percent mode take the band from the typed percentage.

#### VAL-03 — Hand-keyed example and copy arithmetic
- **Severity:** LOW · **Confidence:** CONFIRMED (arithmetic reproduced)
- `page.tsx:127` and `:233`, `:236`: "Est. payment $2,611/mo". For the stated inputs the calculator computes $2,143.54 + $350 + $116.67 = $2,610.21 and displays **$2,610**; $2,611 is the sum of the rounded rows.
- `page.tsx:236` says the fee adds "roughly $45/month" and, in the next sentence, that an exempt borrower saves "$46/month". The figure is $45.11.
- `page.tsx:22` and `:312`: "conventional PMI at 0.5% of the loan amount runs about $143/month" on a $350K home with 5% down. 0.5% × $332,500 ÷ 12 = $138.54.

#### VAL-04 — Exemption wording; ARM
- **Severity:** LOW · **Confidence:** QUESTION
- `VALoanCalculator.tsx:107`, `page.tsx:176`, `:283`: "A rating of 10% or higher waives the funding fee". VA.gov's list is: receiving VA disability compensation; eligible for it but drawing retired or active-duty pay instead; a surviving spouse receiving DIC; a proposed or memorandum rating from a pre-discharge claim before closing; an active-duty Purple Heart recipient (URL above). The FAQ at `page.tsx:18` has the fuller version.
- The 5/1 ARM option is a 30-year loan at the entered rate for all 30 years, labeled "30-yr amort".

---

### 2.9 VA refinance (`/calculators/va-refinance`)

**Where the logic lives:** entirely inside `VARefinanceCalculator.tsx:163-221` (`seasoningCheck` and `calc` memos; none exported). Not shared, apart from the duplicated payment formula. **There is no test file for this calculator.**

#### VRF-01 — Cash-out mode has no cash-out amount
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `VARefinanceCalculator.tsx:184-186` — new loan = current balance + fee in both modes; there is no input for cash taken out.
- **Scenario (arithmetic reproduced):** $300,000 balance, $50,000 cash out, first use. Rule: fee is a percentage of the total loan amount → 2.15% × $350,000 = $7,525, loan $357,525. Code: fee $6,450, loan $306,450, and a positive "monthly savings" at a lower rate. The bottom-line text (`:319`) talks about "borrowing more", which cannot be entered.
- **Rule:** "We'll calculate your funding fee as a percentage of your total loan amount"; cash-out 2.15% first use, 3.3% after (https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/).
- **Fix:** Add a cash-out amount, or rename the mode to what it models (refinancing into a VA loan with no cash).

#### VRF-02 — The page's example disagrees with the calculator on its own default inputs
- **Severity:** MED · **Confidence:** CONFIRMED (arithmetic reproduced)
- **File:** `src/app/calculators/va-refinance/page.tsx:119-121` (hero strip) and `:209-213` (example): monthly savings **$312**, VA recoupment **9 months**.
- **Scenario:** $300,000 at 7.0%, 25 years left → 6.0%, 30 years, $2,500 closing — the component's defaults. Savings = $2,120.34 − $1,807.64 = $312.69, displayed as **+$313**; recoupment = ceil($2,500 ÷ $312.69) = **8 months**. The page's 9 is ceil($2,500 ÷ $312). The 13-month break-even and the exempt case (8 months) do match.
- **Fix:** Compute the example from shared code, as other pages do.

#### VRF-03 — "Financially favorable past the break-even" ignores the restarted term
- **Severity:** MED · **Confidence:** CONFIRMED (arithmetic); intent is a QUESTION
- **File:** `VARefinanceCalculator.tsx:327-329`; break-even at `:195-198`.
- **Scenario (default inputs):** break-even 13 months, bottom line "appears financially favorable if you keep the loan past the break-even point". Remaining payments on the current loan: $2,120.34 × 300 = **$636,101**. New loan: $1,807.64 × 360 = **$650,752**, plus $2,500 closing. Kept to term, the refinance costs about **$17,150 more**; most of the monthly saving comes from adding five years. The page FAQ warns about this (`page.tsx:25`); the result does not show it.
- **Fix:** Add a total-cost line (and the saving at the same remaining term), and soften the bottom line when the new term is longer than the remaining one.

#### VRF-04 — The 0.5% test fails for some rates exactly 0.5 apart
- **Severity:** LOW · **Confidence:** CONFIRMED (arithmetic reproduced)
- **File:** `VARefinanceCalculator.tsx:204-205` — `currentRate - newRate >= 0.5` on floating-point values.
- **Scenario:** 8.2% → 7.7% evaluates to 0.4999999999999991 → "Your rate drops only 0.50% — may not meet the VA's 0.5% minimum". Same for 4.1% → 3.6%. Two of the 61 one-decimal pairs between 3% and 9%; eighths and quarters are unaffected.
- **Rule:** fixed-to-fixed needs a rate at least 50 basis points lower (38 U.S.C. § 3709(b), https://www.law.cornell.edu/uscode/text/38/3709).
- **Fix:** Compare in basis points: `Math.round((currentRate - newRate) * 100) >= 50`.

#### VRF-05 — Seasoning check: time zone, reference date, and a test that cannot fail
- **Severity:** LOW · **Confidence:** CONFIRMED
- **File:** `VARefinanceCalculator.tsx:163-175`.
- `new Date('YYYY-MM-DD')` is UTC midnight and is compared with the local clock. Run on this machine (US Central): first payment 2026-04-16, local time Nov 11 at 6 pm → 210 days, "seasoned"; by calendar date it is day 209.
- The count runs to today. The statute bars the guaranty until "the date that is 210 days after the first payment due date" and the date of the sixth consecutive payment (§ 3709(c), URL above) — a test on the new loan's closing date. The text does say "before an IRRRL can close".
- "Six payments" is `floor(days / 30) >= 6`, i.e. 180 days, so it can never fail once the 210-day test passes, and before that it counts one payment too few (the payment on day 0 is not counted).
- **Fix:** Parse the date as local; describe the result as "earliest closing date" and print that date.

#### VRF-06 — Break-even counts the financed fee twice
- **Severity:** LOW · **Confidence:** QUESTION
- **File:** `VARefinanceCalculator.tsx:186-198`.
- The funding fee is added to the new balance (raising the new payment by about $9/month in the default case) and also added to the up-front costs being recovered. Default inputs: 13 months as coded; 8 months if the fee is treated only as financed. Conservative, and labeled "fee + closing".
- ARM-to-fixed is not modeled (disclosed at `page.tsx:284`); the 200-basis-point fixed-to-ARM test does not arise because only fixed terms are offered.

---

### 2.10 BAH lookup (`/bah`, `/api/bah/lookup`, `useBahLookup`, `rateFor`)

**Where the logic lives:** `src/lib/calculations/bah.ts` (`lookupBAH`, `getMHACode`, `getMHARates`, `isTerritory`), `src/app/api/bah/lookup/route.ts`, `src/components/calculators/shared/useBahLookup.ts` (`rateFor`, the fetch hook). Used by BAH, Dual-Military BAH, Compare, Education, Transition Readiness, VA Loan and COLA (station link only). Clean — see section 4. Partial BAH, BAH-RC/T and BAH-Diff are not in the dataset and not exposed.

#### BAH-01 — One-year CDN cache on data that changes each January
- **Severity:** LOW · **Confidence:** QUESTION
- **File:** `src/app/api/bah/lookup/route.ts:33-34` — `public, max-age=86400, s-maxage=31536000, immutable`, applied to found and not-found responses alike.
- Whether the January data swap reaches users at once depends on the host clearing its edge cache on deploy; browsers hold a response for a day regardless. Worth one line in `docs/ANNUAL_DATA_UPDATE.md` if it is not already there. Not a math issue.

---

## 3. Missing tests

None of these exist today. Inputs → expected output. Where a finding above is open, the expected value is the rule value.

**Guard & Reserve** (13 browser tests check that sections render; none pins a dollar figure)
- E-5, 6 yrs, 12 × MUTA-4, 15 AT → daily $137.00, drill $6,576, AT $2,055, total $8,631.
- MUTA-6 and MUTA-8 → hours 408 and 504.
- BRS 0%, 3%, 4%, 5%, 100% → government share 1%, 4%, 4.5%, 5%, 5% of the pay base (base per GR-01's outcome).
- TRS none / member / family → premium $0 / $694.56 / $3,439.92; member-only label does not say "family".
- E-9 at 6 yrs, W-5 at 10 yrs → a message, not $0.
- Weekends = 0 → per-weekend value hidden, no division by zero.

**CONUS COLA** (no test performs a positive lookup — see COLA-05)
- 93940 → Monterey; 93437 → the Vandenberg result; 93246, 92278, 92243 → whatever their own MHAs get, not a neighbor's.
- 11252 → New York City, not Long Island.
- O-1E, O-2E, O-3E → same group as O-1 to O-3.
- Two areas with the same published index → the same amount for the same grade.
- A non-COLA ZIP (28310) and a 4-digit ZIP → not eligible / no result.

**Education** (browser tests check visibility only; no lib-level tests)
- Tier table: 90 days → 50%, 6 months → 60%, 18 → 70%, 24 → 80%, 30 → 90%, 36 → 100%.
- 60% tier, BAH $3,000, full time → MHA $1,800.
- Half time → MHA $0; 9 of 12 credits → 80%.
- Active duty → MHA $0 and the insight sentence shows a non-zero forfeited amount.
- Private, $50,000 tuition, 100% → tuition covered $30,908.34.
- Online → the constant in the data file (once EDU-07 is settled).
- VR&E with no GI Bill eligibility → standard subsistence rate, not BAH.
- Veteran with an unresolved ZIP → no active-duty notice.

**Healthcare comparison** (24 browser tests; the logic is not exported)
- Each bad URL param (`path`, `tier`, `rating`, `family`) → page renders with defaults.
- Family silver employer → $6,840 premiums + $1,800 = $8,640 (the hero strip figure — pin it).
- ACA with subsidy: income just under and just over each band edge; income under 100% FPL.
- Example table row for ACA silver matches the data file.

**Transition readiness** (well covered at lib level; these cases are not)
- Separation 0 and 2 months out with green income and savings → verdict per TR-02's decision.
- 20+ years with "Haven't filed yet" → VA factor per TR-03's decision.
- 19 years + 11 months vs 19 years + 12 months → the eligibility flip is deliberate and explained.
- VA healthcare with dependents → non-zero family cost or a warning.
- Emergency fund at exactly 3.0 and 6.0 months; surplus at exactly $0 and $500.
- Detailed-mode share link round trip → same result.
- The `test.fixme` at spec line 92, converted to a normal test.

**Separation timeline** (20 browser tests; none checks a computed date)
- Sep 30, 2026 → Apr 3, 2026; Jul 2, 2026; Jan 28, 2027; Mar 29, 2027; May 28, 2027; Jan 28, 2028 (the page example — currently correct, pin it).
- Jun 1, 2027 → VGLI closes Sep 29, 2028.
- Feb 29, 2028, retiring → final move Mar 1, 2031 (currently correct — pin it).
- Separation 150 days out → BDD item reads as open, not expired.
- Retiring → no TAMP item by default.
- `?date=2026-02-31` → rejected.
- A separation date across a daylight-saving change → day counts unchanged (currently correct).

**PCS compare** (9 browser tests; no lib-level tests)
- Same legal residence at both stations → state tax difference $0.
- Bragg vs Benning, E-6 → verdict follows BAH ($72 → similar).
- Same ZIP twice → every difference $0, verdict "similar".
- A difference of exactly $100 → not "similar"; $99.99 → "similar".
- 20171 → VA; 39901 → GA.
- BAH not found on one side → no verdict.

**VA loan** (no tests at all)
- $350,000, $0 down, 6.0%, 30 yr, first use → fee $7,525, loan $357,525, P&I $2,143.54, PITI $2,610.21.
- Down 4.99%, 5%, 9.99%, 10% × first/subsequent → 2.15/1.5/1.5/1.25 and 3.3/1.5/1.5/1.25.
- 5% typed as a percentage on $389,905 → 1.5% band.
- Exempt → fee $0; fee paid in cash → loan = base loan.
- Rate 0% → payment = loan ÷ months.
- BAH above / below PITI → surplus / remainder.

**VA refinance** (no tests at all)
- Defaults → current $2,120.34, new $1,807.64, savings $312.69, break-even 13, VA recoupment 8.
- Exempt → fee $0, both measures 8.
- 8.2 → 7.7 and 4.1 → 3.6 → net tangible benefit passes; 7.0 → 6.51 → fails.
- Closing $0 or fully covered by credits → recoupment 0.
- New payment higher than current → no break-even, "review your inputs".
- Seasoning at 209, 210 and 211 days, evaluated late in the evening local time.
- Cash-out with a cash amount → fee on the full new loan.

**BAH lookup** (14 API tests already; add)
- Every grade key exists for every MHA, with- and without-dependents (currently true: 24 grades × 338 MHAs).
- With-dependents rate ≥ without-dependents for every cell (currently true: 0 of 8,112 cells violate it).
- O-8, O-9, O-10 → the O-7 rate from both `rateFor` and `lookupBAH`.

---

## 4. Clean areas

- **Guard/Reserve drill and AT base pay:** one period = 1/30 of monthly basic pay; 4/6/8 periods per weekend; AT and additional duty at days × 1/30. Worked-example figures on the page come from the lib. The 78 retirement points in the example (48 + 15 + 15) are right. Points and reserve retirement are otherwise not modeled.
- **Guard/Reserve BRS tiers:** 1% + 100% of the first 3% + 50% of the next 2%, capped at 5% — same as the three implementations checked in round 1.
- **Education:** housing allowance keyed to E-5 with dependents at the school ZIP; no housing on active duty; private cap applied before the tier; books stipend prorated by tier; private cap and books cap match VA.gov; 36/48-month entitlement labels; MGIB three-quarter and half rates are 75% and 50% of full, matching the VA table's structure.
- **Healthcare:** hero strip figure ($8,640) reproduces from the data; VA family-coverage warning; TAMP path hides the gap card.
- **Transition readiness:** VA waiver below 50%, CRDP at 50%+ with 20 years, CRSC capped at the waived amount; one household return on both sides with the same filing status; FICA on wages only, never on retired pay or VA pay; grossed-up salary solved against the same tax model; "not sure yet" shows both state outcomes; verdict thresholds ($0, $500, 3 months, 6 months) behave exactly as the page describes; emergency-fund months exclude TSP.
- **Separation timeline date arithmetic:** all dates built and compared at local midnight (no UTC mixing); `setDate` handles month ends and year ends; day differences are rounded, so daylight-saving changes do not shift a count (checked: 180 across March); Feb 29 + 3 years rolls to Mar 1. BDD 180/90, SGLI 120, VGLI 240, TAMP 180 and the separating-member 180-day move all match the rules as cited. Every date in the page example is correct.
- **PCS compare:** base pay and BAS identical on both sides; BAH from the shared lookup; only base pay and COLA taxed; $100 "similar" threshold applied to take-home.
- **VA loan:** purchase funding-fee table matches VA.gov for first and subsequent use at all three down-payment bands; fee charged on the loan amount; financed fee added to principal; standard amortization formula with a zero-rate guard; taxes and insurance ÷ 12; no mortgage insurance.
- **VA refinance:** IRRRL 0.5%; cash-out 2.15% / 3.3% with no down-payment bands; exemption zeroes the fee; recoupment excludes the funding fee, is measured through lower monthly payments, and is tested at 36 months; 50-basis-point fixed-to-fixed test (all confirmed against 38 U.S.C. § 3709 and VA.gov); lender credits floor at zero.
- **BAH lookup:** 40,959 ZIPs → 338 MHAs plus the territory code; every MHA in the ZIP map has rates and a name; territory ZIPs return "OHA area", unknown ZIPs "not found", malformed input a 400; O-8 to O-10 map to O-7 in both code paths; O-1E to O-3E and W grades have their own columns; unknown grades return null rather than a neighbor's rate; the hook discards stale responses.
