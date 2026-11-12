# MATH_AUDIT_REPORT — Independent Calculation Audit

**Date:** 2026-11-12 · **Branch:** main @ 78074b3 · **Mode:** read-only (no source, data or test file touched)
**Method:** read the calculation code, ran the existing functions in an inline scratch runner (`node node_modules/tsx/dist/cli.mjs -e`, nothing saved), and compared against the governing rule.

**Confidence labels**
- **CONFIRMED** — traced/run in code, and the rule text was fetched this session (URL given), or the finding is provable from the repo alone.
- **LIKELY** — traced/run in code; rule cited from memory or from a search snippet. Marked "from memory — verify".
- **QUESTION** — intent unclear; needs Dan's decision.
- **DATA** — a figure that looks inconsistent. No corrected value is offered.

**Sources I could not fetch:** eCFR (redirects to a bot wall — used the Cornell LII mirror instead), travel.dod.mil / JTR (403), militarypay.defense.gov (403), GSA per-diem lookup (API down). Every JTR citation below is therefore "from memory — verify".

---

## 1. Summary

| Calculator | CONFIRMED | LIKELY | QUESTION | DATA | Highest severity |
|---|---|---|---|---|---|
| VA Disability | 6 | 0 | 1 | 0 | **HIGH** (2) |
| Retirement | 5 | 3 | 0 | 0 | **HIGH** (2) |
| Deployment | 2 | 5 | 1 | 1 | **HIGH** (1) |
| PCS / PPM | 1 | 3 | 3 | 4 | **HIGH** (2) |
| Dual-Military BAH | 1 | 0 | 2 | 0 | MED |
| Total Comp / TSP | 0 | 3 | 0 | 0 | MED |

Seven HIGH findings. The five I would fix first:

1. **RET-01** — VA compensation is added on top of the pension for 10–40% ratings (no waiver offset). Overstates income by the full VA amount.
2. **VA-01** — a veteran whose only child is an 18–23 school child is paid at the under-18 "1 child" rate. Understates by $56–$192/month.
3. **VA-02** — the 2023 bilateral-factor exception (§ 4.26(d)) is not implemented. Rare, but it flips 100% to 90%.
4. **DEP-01** — Family Separation Allowance defaults to "Yes" and stays on when the user says they have no dependents.
5. **PCS-01** — travel days are one short in 50-mile bands (401–450, 751–800, 1,101–1,150 …), about 1 move in 7.

---

## 2. Findings

### 2.1 VA Disability Combined Rating

**Where the logic lives:** `src/lib/calculations/va-combined-table.ts` (`combinePair`, `combineRatings`), `src/lib/calculations/va-disability.ts` (`calculateCombinedRating`, `getCompensation`, `whatIfAddRating`, `roundVARating`), rates in `src/data/va-rates/2026.ts`. Shared with `VADisabilityUnlocks.tsx`, the page's worked example and rate table (`src/app/calculators/va-disability/page.tsx`), and `retirement.ts` (veteran-alone rate only).

#### VA-01 — School-child-only households are paid the under-18 "with 1 child" rate
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/va-disability.ts:322-350` (base selection uses `hasAnyChild`), `:367-378` (first school child treated as the Table B base). Locked in by `tests/e2e/edge-cases.spec.ts:55-66`.
- **Scenario (run):**

  | Inputs | Code returns | Rule gives | Difference |
  |---|---|---|---|
  | 100%, spouse, 0 under-18, 1 school child | $4,318.99 | $4,158.17 + $352.45 = $4,510.62 | −$191.63/mo |
  | 50%, no spouse, 1 school child | $1,205.90 | $1,132.90 + $176.00 = $1,308.90 | −$103.00/mo |
  | 30%, spouse, 2 school children | $771.47 | $617.47 + 2 × $105.00 = $827.47 | −$56.00/mo |

  All rule figures are built from the repo's own rate table. When at least one under-18 child exists the code is correct (30%, spouse, 1 under-18 + 1 school child = $771.47).
- **Rule:** 38 U.S.C. § 1115(1)(F) opens "notwithstanding the other provisions of this paragraph, the monthly amount payable on…" each child 18+ in school is the school-child amount (https://www.law.cornell.edu/uscode/text/38/1115). VA's own rate-table footnote: "Rates for each school child are shown separately. They are not included with any other compensation rates. All other entries on this chart reflecting a rate for children show the rate payable for children under 18 or helpless." Its example takes the spouse-and-3-children rate and adds one school-child rate for a family with four children, one in school (https://benefits.va.gov/COMPENSATION/resources_comp0107.asp — a 2007 table; the statute is unchanged in structure). The current VA.gov page lists "Each additional child over age 18 in a qualifying school program" as an added amount and does not address the school-child-only case.
- **Fix:** Pick the base rate from under-18 children only; add `additionalSchoolChild` for every school child. Update the edge-case test that currently asserts the wrong value.

#### VA-02 — § 4.26(d) exception not implemented: the bilateral factor can lower the result
- **Severity:** HIGH (rare, but the consequence is a whole rating tier) · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/va-disability.ts:189-238` — the factor is always applied when a group qualifies.
- **Scenario (run):** left knee 10%, right knee 10%, plus 90% and 30% non-bilateral.
  - Code: bilateral 19 → 20.9 → 21; then 90 & 30 → 93; 93 & 21 → 94 → **90%** ($2,362.30 veteran alone).
  - Rule: without the factor, 90 & 30 → 93; & 10 → 94; & 10 → 95 → **100%** ($3,938.58).
  - Brute-force over one left + one right rating plus up to three other ratings: 15 of 15,730 combinations differ, and all 15 are 94→90% vs 95→100%. Others include 10/10 + 70/50/50, 20/10 + 80/60, 40/10 + 80/30/20.
- **Rule:** 38 CFR § 4.26(d): "In cases where the combined evaluation is lower than what could be achieved by not including one or more bilateral disabilities in the bilateral factor calculation, those bilateral disabilities will be removed from the bilateral factor calculation and combined separately, to achieve the combined evaluation most favorable to the veteran." Added by 88 FR 22917 (Apr. 14, 2023). https://www.law.cornell.edu/cfr/text/38/4.26
- **Fix:** Compute the result with each subset of bilateral members excluded from the factor and keep the highest rounded rating; show a step explaining why the factor was not applied.

#### VA-03 — Bilateral value can exceed 100 and is shown to the user
- **Severity:** LOW (final rating is still correct) · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/va-disability.ts:144-147`, `:219-237`
- **Scenario (run):** left arm 100% + right arm 10% → `exact: 110`, UI prints "Combined value: 110% → rounds to 100%". Left leg 90% + right leg 60% + 50% → steps read "106 & 50 → 103".
- **Rule:** 38 CFR § 4.25 — the combined value cannot exceed 100. Any bilateral value above 100 already rounds to 100%, so only the display is wrong.
- **Fix:** Cap the post-factor value at 100.

#### VA-04 — Spouse Aid & Attendance: page contradicts itself
- **Severity:** LOW · **Confidence:** CONFIRMED
- **File:** `src/app/calculators/va-disability/page.tsx:159` lists "Spouse Aid & Attendance added amounts" under "does not estimate"; `:381-383` tells veterans with "a spouse receiving Aid & Attendance" to "enter your situation in the calculator above for an exact figure." `spouseAA` exists in the data (`src/data/va-rates/2026.ts`) but `DependentConfig` has no field for it.
- **Rule:** 38 U.S.C. § 1115(1)(E); VA.gov added-amounts table (https://www.va.gov/disability/compensation-rates/veteran-rates/).
- **Fix:** Either add the input or drop the A&A clause from the table footnote.

#### VA-05 — "Never rounds between steps" is not what the code does
- **Severity:** LOW · **Confidence:** CONFIRMED
- **File:** `src/app/calculators/va-disability/page.tsx:78` (FAQ + FAQPage schema): "It never rounds between steps." `va-combined-table.ts:26-30` rounds every pairwise step to a whole number, which is correct — Table I cells are integers (fetched: 45 & 10 = 51, 25 & 10 = 33, 19 & 10 = 27). The "Common mistakes" copy at `page.tsx:292` gets it right ("never rounding to a 10% step in between").
- **Also:** `va-disability.ts:140` and `tests/e2e/va-combined-engine.spec.ts:22` call "30 & 10 → 37 → 40.7 → 41" "§ 4.26's own worked example". The regulation's example is 60, 20, 10, 10 with the 10s bilateral → 21 → 74 → 70% (the code reproduces it). The whole-number rounding is right; the attribution is not.
- **Rule:** 38 CFR § 4.25(a), Table I; § 4.26 (https://www.law.cornell.edu/cfr/text/38/4.25).
- **Fix:** Reword the FAQ to "never rounds to the nearest 10% between steps"; correct the comment and test name.

#### VA-06 — "How close are you" text prints the rounded rating twice
- **Severity:** LOW · **Confidence:** CONFIRMED
- **File:** `src/components/calculators/va-disability/VADisabilityUnlocks.tsx:70-77`, `:223-225`
- **Scenario:** any rating below 100%. Text reads "would bring your combined rating to 70%, which rounds to 70%" because it interpolates `newRounded`, not `newExact`.
- **Fix:** Carry `newExact` into `nextData` and print that first.

#### VA-07 — Two intent questions
- **Severity:** LOW · **Confidence:** QUESTION
- `VADisabilityCalculator.tsx:229-236`: the TDIU note ("You may qualify for TDIU…") still shows at a 100% combined rating, where TDIU is moot (38 CFR § 4.16(a), from memory — verify). Intended?
- `VADisabilityCalculator.tsx:28-39`: § 4.26 also covers "paired skeletal muscles"; the page copy says so (`page.tsx:239`) but the location list offers only upper and lower extremities. Intended scope?

---

### 2.2 Military Retirement

**Where the logic lives:** `src/lib/calculations/retirement.ts` (`calculateHigh3Average`, `calculatePension`, `calculateTSPAgencyMonthly`, `calculateTSPGrowth`, `calculateCivilianEquivalent`, `calculateRetirement`), `src/lib/calculations/basePay.ts` (`lookupBasePay`, shared with total-comp, deployment, guard/reserve), multipliers in `src/data/constants.ts:37-39`. The page's worked example (`src/app/calculators/retirement/page.tsx:44-55`) calls the same lib.

#### RET-01 — VA compensation is added to the pension below 50% (no waiver offset)
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/retirement.ts:281-291`; displayed at `RetirementCalculator.tsx:473-481` ("Combined with VA") and `:542-550` ("Combined monthly income").
- **Scenario (run):** E-7, 20 years, High-3, 40% VA → pension $3,100.05, VA $795.84, **total $3,895.89**. Rule: retired pay is reduced dollar-for-dollar by the VA award, so the total stays **$3,100.05** ($795.84 of it tax-free). Overstated by $795.84/month. The same total feeds the civilian-equivalent figure.
- **UI contradiction:** the action step at `RetirementCalculator.tsx:121-126` tells the same user "At 40% VA rating you currently receive a pension offset", and the page explains the waiver at `page.tsx:205-209`.
- **Rule:** 10 U.S.C. § 1414(a) — concurrent receipt "without regard to sections 5304 and 5305 of title 38" only for a disability "rated as not less than 50 percent" (https://www.law.cornell.edu/uscode/text/10/1414). 38 U.S.C. §§ 5304–5305 (waiver) — from memory — verify.
- **Fix:** Below 50%, total = max(pension, VA) and show the tax-free portion as the benefit; keep the additive total for 50%+.

#### RET-02 — Civilian salary equivalent grosses up the taxable pension as if it were tax-free
- **Severity:** HIGH (shown to every user) · **Confidence:** LIKELY
- **File:** `src/lib/calculations/retirement.ts:190-204` ("simplified: pension is 'net'"), shown at `RetirementCalculator.tsx:554-566` and `:586-592`.
- **Scenario (run):** E-7, 20 years, High-3, no VA → annual pension $37,200.60, code returns **$47,693**. Military retired pay is ordinary federal taxable income, so a $37,201 salary and a $37,201 pension owe the same federal income tax. The real difference is FICA (7.65%), which gives about $40,300. The callout justifies the number with "VA disability is 100% tax-free" even when no VA rating is entered. A flat 22% "effective" rate is also far above the effective federal rate at this income.
- **Rule:** IRS Pub. 525 (military retirement pay is taxable; not subject to FICA) — from memory — verify.
- **Fix:** Gross up only the tax-free VA portion (and optionally FICA on the pension); label the rate as marginal, not effective.

#### RET-03 — High-3 average uses the wrong three pay-table columns (off by one year)
- **Severity:** MED (systematic 1–2% overstatement at every retirement year where pay steps) · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/retirement.ts:76-85`
- **Scenario (run):** E-7 retiring at exactly 20 years. Code averages Over-20, Over-18, Over-18 = ($6,245.70 + $6,177.30 + $6,177.30) / 3 = **$6,200.10**. A member with exactly 20 years was never paid the Over-20 rate; the last 36 months were spent at Over-16 (year 18), Over-18 (year 19), Over-18 (year 20) = ($6,000.90 + $6,177.30 + $6,177.30) / 3 = **$6,118.50**. High-3 pension: $3,100.05 vs $3,059.25 (+$40.80/mo). O-5 at 20: $11,820.10 vs $11,606.30 → pension +$106.90/mo.
- **UI:** `page.tsx:193-198` says this is "consistent with how DFAS applies the formula".
- **Rule:** 10 U.S.C. § 1407(c)(1): "the total amount of monthly basic pay to which the member was entitled for the 36 months (whether or not consecutive) out of all the months of active service… for which the monthly basic pay… was the highest, divided by 36" (https://www.law.cornell.edu/uscode/text/10/1407).
- **Note:** this depends on reading "retire at 20" as 20 years 0 months, which is what the multiplier (exactly 20 × 2.5%) already assumes.
- **Fix:** Average pay at YOS−1, YOS−2, YOS−3 (the years actually served), or take months as an input.

#### RET-04 — W-5, O-9, O-10 at 20–21 years: $0 enters the High-3 average
- **Severity:** MED (edge case, but W-5 with the default 20-year slider hits it immediately) · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/basePay.ts:19-32` returns 0 when no column exists at or below the YOS; `retirement.ts:80-83`.
- **Scenario (run):** W-5 at 20 → breakdown [$10,169.70, $0, $0], average **$3,389.90**, pension about $1,695/mo. O-9 at 20 → [$18,999.90, $0, $0] → pension $3,166.65. At 21, two of three years count.
- **Rule:** DFAS pay table — W-5, O-9 and O-10 have no column below Over 20 (matches `src/data/pay-tables/2026.ts`). The card shows "Base pay at 19 yrs (W-5): $0".
- **Fix:** For these grades, clamp the lookback to the first published column or block the combination with a note.

#### RET-05 — "Save or share" link does not reproduce the result
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `RetirementCalculator.tsx:255-262` writes `yos = retirementYOS`; `:238-244` reads it back as `currentYOS = min(yos, 20)`. Current YOS, current rank, TSP %, TSP balance and return are not in the URL.
- **Scenario (run):** default BRS state (E-7, current 10, retire 20, 5%, 7%) → total BRS income $2,785.85/mo. Reloading the shared link sets current YOS = 20 → 0 years of contributions → **$2,480.04/mo**, TSP $0.
- **Fix:** Serialize all inputs, or at minimum current YOS and the TSP fields.

#### RET-06 — TSP contributions are not capped at the elective deferral limit
- **Severity:** MED (edge case) · **Confidence:** LIKELY
- **File:** `src/lib/calculations/retirement.ts:252-270`; slider allows 0–50% (`RetirementCalculator.tsx:390-396`).
- **Scenario (run):** O-5 with 10 years at 50% → $59,571/year of member contributions projected every year; the repo's own limit is $24,500 (`src/data/constants.ts:22`). `tspGrowth.ts` enforces the limit; this lib does not.
- **Rule:** 26 U.S.C. § 402(g) — from memory — verify.
- **Fix:** Reuse the cap logic from `tspGrowth.ts`.

#### RET-07 — No credit for months; REDUX not mentioned
- **Severity:** LOW · **Confidence:** CONFIRMED (rule fetched; these are gaps, not wrong arithmetic)
- **File:** `RetirementCalculator.tsx:363-370` (integer slider); `page.tsx:240-250` ("does not include" list).
- **Rule:** 10 U.S.C. § 1409 — years of service include "1⁄12 of a year for each full month of service"; § 1409(b)(2) reduces the multiplier for members with under 30 years who took the career status bonus (REDUX) (https://www.law.cornell.edu/uscode/text/10/1409). A member retiring at 20 years 6 months gets 51.25%, not 50%.
- **Fix:** Add a months input, or state the whole-year assumption; add REDUX/CSB to the "does not include" list.

#### RET-08 — Smaller items
- **Severity:** LOW · **Confidence:** LIKELY
- `retirement.ts:252-257`: TSP projection holds pay flat at the *current* grade and YOS for the whole career. The disclaimer mentions constant contribution rate and return, not flat pay.
- E-9 with current YOS under 10 (no pay column): base pay resolves to $0 and the TSP projection silently shows $0 (run: E-9, current 5).
- `page.tsx:105-110`: the hero "Sample output" strip is hand-keyed ($2,480, ~$190K, $796, ~$50K). It matches the lib today, but it shows a 40% VA case and so carries RET-01 and RET-02.
- The 75% cap is correctly absent (10 U.S.C. § 1409(b)(3), fetched): 40 years gives 100% High-3 / 80% BRS.

---

### 2.3 Deployment Pay

**Where the logic lives:** `src/lib/calculations/deployment.ts` (`calculateDeployment` and three private phase functions, own progressive-tax helper), rates in `src/data/deployment/2026/constants.ts`, brackets in `src/data/constants.ts`. Base pay via the shared `lookupBasePay`. The page's worked example and hero strip call the same lib.

#### DEP-01 — FSA is paid to members with no dependents
- **Severity:** HIGH · **Confidence:** CONFIRMED
- **File:** `src/components/calculators/deployment/DeploymentCalculator.tsx:221`, `:229` (both default `true`), `:371-372` (dependents toggle does not touch FSA), `:451-459`; `src/lib/calculations/deployment.ts:154` (no dependents check).
- **Scenario (run):** single E-4, 3 years, dependents = No, 9 months, everything else default → FSA $300/mo still included; tour benefit overstated by **$2,700**. A shared link with `dependents=no` loads the same way.
- **Rule:** 37 U.S.C. § 427(a)(1): "a member of a uniformed service with dependents is entitled to a monthly allowance" (https://www.law.cornell.edu/uscode/text/37/427). The page says the same at `page.tsx:289-290`.
- **Fix:** Force FSA off (and disable the toggle) when dependents = No; ignore `hasFSA` in the lib when `hasDependents` is false.

#### DEP-02 — CZTE savings use the average tax rate, not the tax actually avoided
- **Severity:** MED (understates; affects most deployments under 12 months) · **Confidence:** LIKELY
- **File:** `src/lib/calculations/deployment.ts:118-121`, `:163-167`, `:217`
- **Scenario (run):** E-5, 6 years, 6-month deployment → code: annual tax $3,738.40 ÷ 12 × 6 = **$1,869.20**. Excluding six months of pay removes income from the top of the year: tax on $49,320 ($3,738.40) minus tax on $24,660 ($856.00) = **$2,882.40**. Understated by about $1,013 (single filer, one tax year, repo brackets).
- **Rule:** 26 U.S.C. § 112(a) — excluded months come out of gross income; the saving is the tax on that income at marginal rates (statute fetched; the marginal-rate conclusion is mine).
- **Fix:** Compute tax(full year) − tax(year with the excluded months removed), or label the figure as a conservative average-rate estimate.

#### DEP-03 — Filing status is hard-coded to single, including the "married" worked example
- **Severity:** MED · **Confidence:** QUESTION
- **File:** `src/lib/calculations/deployment.ts:14`, `:89-101`; `src/app/calculators/deployment/page.tsx:177-194`
- **Scenario:** the worked example is "E-5, 8 years of service, married". Single brackets give $334.32/mo of tax → "Over 9 months the CZTE alone saves $3,009". With the MFJ deduction and brackets already in `src/data/constants.ts:60-71` and one income, tax is $161.66/mo → about $1,455. Disclosed in the disclaimer (`page.tsx:372-374`), not next to the number. Brackets are sourced (Rev. Proc. 2025-32); the filing status is the unsourced assumption.
- **Fix:** Tie filing status to the dependents toggle or add a selector; at minimum make the example say single filer.

#### DEP-04 — "Est. take-home" omits FICA
- **Severity:** MED · **Confidence:** LIKELY
- **File:** `src/lib/calculations/deployment.ts:121`, `:183`; labels at `DeploymentCalculator.tsx:568`, `:604`, `:664`
- **Scenario:** E-6 over 10, base $4,759.50 → about $364/mo of Social Security and Medicare is not deducted before or during deployment. The CZTE does not remove FICA. The monthly *increase* is nearly unaffected; the two take-home figures are about 7% high. State tax, SGLI and the user's own TSP % are also not deducted.
- **Rule:** 26 U.S.C. § 112 is an income-tax exclusion only; IRS Pub. 3 — from memory — verify.
- **Fix:** Deduct 7.65% of taxable pay, or rename to "after federal income tax" and say what is excluded.

#### DEP-05 — Officer cap logic does not follow § 112(c)(5)
- **Severity:** MED (O-4 with long service and above) · **Confidence:** CONFIRMED
- **File:** `src/lib/calculations/deployment.ts:168-176`
- **Scenario (run):** O-6, 20 years, receiving IDP. Code: taxable = $13,751.10 − $10,520 = $3,231.10/mo. Under the statute the cap is the highest enlisted rate plus the special pay *this officer actually receives*, and the officer's own IDP and HDP-L are part of the compensation being tested. Using the constant's own base figure: ($13,751.10 + $275) − ($10,295 + $275) = $3,456.10/mo taxable. The code bakes a fixed $225 into the cap whether or not IDP is on, and never counts the officer's IDP or HDP-L as compensation.
- **Rule:** 26 U.S.C. § 112(b), (c)(5): "maximum enlisted amount" = "the highest rate of basic pay payable for such month to any enlisted member… at the highest pay grade" plus, for an officer entitled to hostile-fire special pay, "the amount of such special pay payable to such officer for such month" (https://www.law.cornell.edu/uscode/text/26/112). Commissioned warrant officers are correctly excluded from the cap.
- **Fix:** Cap = highest enlisted rate + (IDP if received); taxable = base + IDP + HDP-L − cap.

#### DEP-06 — DATA — needs external verification: `officerCZTECap`
- **Severity:** MED · **Confidence:** DATA
- **File:** `src/data/deployment/2026/constants.ts:63-68` — `officerCZTECap: 10_520`, commented "~$10,295 (E-9 max base pay) + $225 HFP".
- **Inconsistency:** the repo's own 2026 table has E-9 at $10,729.20 (`src/data/pay-tables/2026.ts:128`; `docs/sources/dfas-2026-basic-pay.csv:10`), above the "$10,295" the comment calls the E-9 maximum. The $225 component is the pre-October HFP/IDP rate. The file already flags this as pending. The statute's "highest rate… payable to any enlisted member" may be a senior-enlisted rate that is not a table column; I could not fetch it (militarypay.defense.gov 403). No corrected figure offered.

#### DEP-07 — SDP interest: page says quarterly compounding, code is simple interest on day one
- **Severity:** LOW · **Confidence:** LIKELY
- **File:** `src/lib/calculations/deployment.ts:219-226`; `page.tsx:249-256`; `sdpQuarterlyRate` (`constants.ts:74`) is unused.
- **Scenario (run):** $10,000, 12 months → code $1,000.00; quarterly compounding at 2.5% → $1,038.13. A 1-month deployment earns $83.33 although the program needs 30+ days before any deposit. The model also assumes the full $10,000 is on deposit from day one (deposits are limited to current pay — from memory) and ignores the 90 days of post-return interest the page mentions. The errors point in different directions.
- **Rule:** 10 U.S.C. § 1035; DoD FMR Vol. 7A Ch. 51 — from memory — verify.
- **Fix:** Either model a deposit ramp with quarterly compounding and the 90-day tail, or say on the result row that it is simple interest on a day-one deposit.

#### DEP-08 — Outside a combat zone, IDP and HDP-L are not taxed
- **Severity:** LOW · **Confidence:** LIKELY
- **File:** `src/lib/calculations/deployment.ts:177-181`
- **Scenario (run):** E-5, combat zone = No, IDP + HDP-L $100 → federal tax unchanged at $311.53/mo although $375/mo of taxable special pay was added (about $45/mo at 12%).
- **Rule:** special pays are taxable unless excluded under § 112 — IRS Pub. 3, from memory — verify.
- **Fix:** Add taxable special pays to the tax base when the exclusion does not apply.

#### DEP-09 — TSP limit wording
- **Severity:** LOW · **Confidence:** LIKELY
- `page.tsx:299-300`: "the total annual additions limit (IRC § 415(c)) rises from $24,500 to $72,000". $24,500 is the § 402(g) elective deferral limit; the § 415(c) limit does not "rise" in a combat zone — tax-exempt traditional contributions simply are not counted against § 402(g). `src/data/constants.ts:21` labels the elective deferral limit "IRS 415(c)". From memory — verify.

---

### 2.4 PCS / PPM

**Where the logic lives:** `src/lib/calculations/pcs.ts` (`calculateTravelDays`, `calculateDLA`, `calculateMALT`, `calculatePerDiem`, `calculateTLE`, `calculatePPM`, `getWeightAllowance`, `calculatePCS`), rates in `src/data/pcs/2026/constants.ts`. Not shared with other calculators. Distance is haversine × 1.25 in `PCSCalculator.tsx:309-316` unless typed in.

#### PCS-01 — Travel days are one short in 50-mile bands
- **Severity:** HIGH · **Confidence:** LIKELY
- **File:** `src/lib/calculations/pcs.ts:48-56`
- **Scenario (run):** the code subtracts 400 miles, then divides the remainder by 350. The JTR method divides the *total* distance by 350, adds a day when the remainder is 51 or more, and separately allows 1 day for 400 miles or fewer.

  | Miles | Code | JTR method |
  |---|---|---|
  | 401–450 | 1 | 2 |
  | 751–800 | 2 | 3 |
  | 1,101–1,150 | 3 | 4 |
  | 1,451–1,500 | 4 | 5 |
  | 2,851–2,900 | 8 | 9 |

  450 of every 3,500 distances differ (about 13%). At 1,120 miles for a member with 3 dependents: code 3 days, per diem $1,454.38; JTR 4 days → $2,036.13. Understated by $581.75.
- **Rule:** JTR par. 050205 — from memory — verify. DTMO's computation examples divide the total (2,627 ÷ 350 = 7 r 177 → 8 days; 2,984 → 9 days), seen only in search snippets because travel.dod.mil returned 403. Those two examples give the same answer under both methods, so they do not settle it alone; the published "400 or fewer miles = 1 day" clause is what makes 401 miles a 2-day trip.
- **Fix:** `days = distance ≤ 400 ? 1 : floor(d / 350) + (d % 350 ≥ 51 ? 1 : 0)`. Confirm against the JTR text first.

#### PCS-02 — TLE ignores family size
- **Severity:** HIGH · **Confidence:** LIKELY
- **File:** `src/lib/calculations/pcs.ts:117-120` — `days × $179` for everyone.
- **Scenario (run):** single E-4, 10 TLE days → **$1,790**. From memory, the TLE ceiling is a percentage of the locality per diem by number of people: 65% for a member alone ($116.35/day → $1,163.50), 100% for member + 1 dependent, +25% per additional dependent under 12, +35% per dependent 12 and over, capped at $290/day. A member with spouse and two children under 12 → 150% → $2,685 vs the same $1,790. TLE also reimburses actual lodging, so every figure is a ceiling.
- **Rule:** JTR par. 0506 and its TLE percentage table — from memory — verify.
- **Fix:** Apply the family-size percentage and the daily cap; label the row "up to".

#### PCS-03 — Weight allowance has one column; JTR has two
- **Severity:** MED · **Confidence:** LIKELY (logic) + DATA (values)
- **File:** `src/lib/calculations/pcs.ts:150-152`; `src/data/pcs/2026/constants.ts:97-122`
- **Scenario:** `getWeightAllowance('E-5')` returns 9,000 lbs with or without dependents. JTR Table 5-37 has separate with- and without-dependent columns, so a single E-5's PPM weight (and incentive) is capped too high.
- **DATA — needs external verification:** the table does not look like one consistent column. From memory, E-5 through O-6 match the with-dependents column, while O-1 (10,000), O-2 (12,500), W-1 (10,000) and W-2 (12,500) look like without-dependents values, and O-3/W-3 (14,000) match neither. No corrected values offered.
- **Fix:** Store both columns and select on `hasDependents`.

#### PCS-04 — Per diem: 75% applied to lodging; all dependents at 75%
- **Severity:** MED · **Confidence:** QUESTION
- **File:** `src/lib/calculations/pcs.ts:87-112`; `constants.ts:30`
- The first and last travel day are paid at 75% of the whole $179 (lodging + M&IE). Under TDY rules the 75% applies to M&IE only, and my recollection is that PCS travel by POV pays the flat standard CONUS rate for each authorized day. Either way, 75% of lodging matches neither. Which rule was intended?
- Every dependent is paid 75% of the member's rate. JTR pays 50% for dependents under 12 (the code comment admits the approximation; the UI says "approx."). A member with three children under 12 on a 4-day trip is overstated by about $470.
- **Rule:** JTR pars. 050203 and 050205 (MALT-Plus per diem) — from memory — verify.
- **Fix:** Confirm the first/last-day rule; add an under-12 count.

#### PCS-05 — O-1E–O-3E cannot be modeled; `?rank=` is unvalidated
- **Severity:** MED · **Confidence:** CONFIRMED (repo-only)
- **File:** `src/components/calculators/pcs/PCSCalculator.tsx:53-55` (no prior-enlisted group), `:365` (`if (r) setRank(r)`); `src/lib/calculations/pcs.ts:61-66`, `:150-152`
- **Scenario (run):** `calculateDLA('O-1E', true)` → **$0**; weight allowance falls back to 8,000 lbs. Reachable with `?rank=O-1E`, the format other calculators' links use. `tests/e2e/pcs-dla-unit.spec.ts` already records that the official DLA table has O-1E–O-3E rows the code lacks, so a prior-enlisted officer who picks O-1–O-3 gets a different DLA than the official one.
- **Fix:** Add the three DLA rows and the grade group; validate the `rank` param against the known list.

#### PCS-06 — PPM incentive is a flat rate per hundredweight regardless of distance
- **Severity:** LOW (disclosed in the UI) · **Confidence:** QUESTION
- **File:** `src/lib/calculations/pcs.ts:135-145`; `constants.ts:126`
- **Scenario (run):** 9,000 lbs → $18,900 at both 300 miles and 3,000 miles. Government constructed cost scales with distance, so short moves are overstated and long moves understated. The 22% tax on profit is labeled as an estimate.
- **DATA — needs external verification:** `ppmPerCWT: 210.0` is described as "approximate".
- **Fix:** A distance-banded rate table, or show a range.

#### PCS-07 — Authorization edge cases
- **Severity:** LOW · **Confidence:** QUESTION
- `calculateMALT` pays 2 POVs for a member with no dependents (run: $459.20 at 1,120 miles). Second-POV MALT generally needs a second authorized traveler (JTR 050203 — from memory).
- Distance 0 → DLA $3,548.02 plus TLE still shown (run). DLA is not payable on a local move without an HHG relocation, a first-duty-station move for a member without dependents, or a separation/retirement move (from memory). Not stated near the number.

#### PCS DATA flags (no corrected values offered)
- `constants.ts:28` — `perDiemMIE: 69` / `perDiemTotal: 179`: could not confirm against GSA FY2026 (lookup down); my recollection of the standard M&IE differs by $1. Needs external verification.
- `constants.ts:131` — `tleMaxDays: 21`, while `pcs.ts:115` says "capped at 14 combined days" and each UI field caps at 14 (`PCSCalculator.tsx:671`, `:683`). Needs external verification.

---

### 2.5 Dual-Military BAH

**Where the logic lives:** entirely in `src/components/calculators/dual-military-bah/DualMilitaryBAHCalculator.tsx:142-216` (no lib function — it cannot be unit-tested without a browser). Rates come from `/api/bah/lookup` via the shared `useBahLookup` / `rateFor`.

#### DM-01 — The explanation of the recommendation is false about half the time, including the default state
- **Severity:** MED (the dollar recommendation is right; the stated reason is wrong) · **Confidence:** CONFIRMED (repo data)
- **File:** `DualMilitaryBAHCalculator.tsx:232` (action step) and `:701-705` (table footnote): "the rate gap between the with-dependents and without-dependents rates is larger at higher pay grades, so assigning dependents to the higher-ranking member produces the higher total."
- **Scenario (run):** the default state, O-3 + E-5 at Fort Bragg (28310 → NC182). O-3 claims: $2,175 + $1,527 = $3,702. E-5 claims: $1,956 + $1,806 = **$3,762**. The calculator correctly picks Member 2 (the E-5, +$60/mo) and then prints the sentence above. Across all 338 MHAs and every grade pair, the lower grade has the larger gap in 32,935 of 70,980 cases (46.4%).
- **The page already says the opposite:** `src/app/calculators/dual-military-bah/page.tsx:147` and `:168` ("the financially optimal choice isn't always the higher-ranking member").
- **Rule:** 2026 DTMO BAH tables as loaded in the repo.
- **Fix:** Replace the sentence with one built from the two actual gaps ("Member 2's with-dependents premium here is $279 vs $219").

#### DM-02 — Government quarters, barracks and sea duty are not modeled or mentioned
- **Severity:** LOW · **Confidence:** QUESTION
- **File:** `page.tsx:31-33` FAQ: "Both members receive their full BAH entitlement regardless of shared housing."
- A member assigned to government quarters, or a junior member without dependents on sea duty, generally does not draw full BAH. The calculator has no such input and the FAQ is unconditional. No disallowed recommendation results: at different stations the tool gives no financial recommendation (`:186-188`), and at the same station either member may claim.
- **Rule:** 37 U.S.C. § 403 — from memory — verify.
- **Fix:** Add one sentence of scope to the FAQ and the rules box.

#### DM-03 — Rule citations may be out of date
- **Severity:** LOW · **Confidence:** QUESTION
- **File:** `page.tsx:48` ("Joint Travel Regulations, Chapter 10"), `:231` ("DoD policy (DoDI 1340.09)")
- My recollection is that housing-allowance policy moved from JTR Chapter 10 to DoD FMR Vol. 7A, Chapter 26. Could not fetch either. From memory — verify.

---

### 2.6 Total Compensation and TSP

**Where the logic lives:** `src/lib/calculations/total-compensation.ts` (`calculateTotalCompensation`), `src/lib/utils.ts:82-102` (`estimateMarginalRate`, `estimateTaxAdvantage`), `src/lib/calculations/tspGrowth.ts` (`projectTSP`, `calcBRSMatch`, `rothVsTraditional`). The BRS match is implemented three separate times (`total-compensation.ts:28-33`, `tspGrowth.ts:90-111`, `retirement.ts:109-119`); all three agree on the tiers.

#### TC-01 — BRS matching is paid from day one (no two-year wait)
- **Severity:** MED (new members are a core audience) · **Confidence:** LIKELY
- **File:** `src/lib/calculations/total-compensation.ts:28-33`, `:61-64`; `src/lib/calculations/tspGrowth.ts:90-111`, `:211-213`. Only `retirement.ts:151-159` models the wait.
- **Scenario (run):** Total comp, E-2, 0 years, BRS, 5% → agency contribution **$1,618.74/yr**; with only the 1% automatic contribution it is $323.75. TSP projector, E-1, 0 years, 5% → year-1 government contribution **$1,444.32**; 1% automatic only is $288.86. The `calcBRSMatch` doc comment says matching begins in the 25th month; the function has no service-time input.
- **Rule:** BRS matching begins after two years of service; the 1% automatic contribution after 60 days — from memory — verify (`src/app/calculators/retirement/page.tsx:220-222` states the same).
- **Fix:** Pass years of service into both functions and pay only the 1% before month 25.

#### TC-02 — Tax advantage is not grossed up, and uses the marginal rate on base pay alone
- **Severity:** MED (understates) · **Confidence:** LIKELY
- **File:** `src/lib/utils.ts:92-102`; used at `total-compensation.ts:70`, `:90`
- **Scenario (run):** E-6, 10 years, BAH $2,000 → tax-free allowances $29,723; code adds 12% × $29,723 = **$3,567**. To net $29,723 a civilian needs $29,723 ÷ (1 − t), i.e. an extra t ÷ (1 − t) — 13.6% at a 12% rate, 28.2% at 22%. The rate is also looked up at base pay only ($57,114 → 12% bracket, single filer), while the added $29,723 would largely fall in the 22% bracket. The callout calls the result what "a civilian would need to earn… before taxes".
- **Rule:** DoD's Regular Military Compensation tax-advantage definition (37 U.S.C. § 101(25)) — from memory — verify.
- **Fix:** Compute tax(base + allowances grossed up) − tax(base) iteratively, or use t ÷ (1 − t) on the correct bracket; state the single-filer assumption beside the number.

#### TSP-01 — Projection conventions worth stating
- **Severity:** LOW · **Confidence:** LIKELY
- `tspGrowth.ts:160` and `retirement.ts:146`: monthly rate = annual ÷ 12, so a "7%" assumption compounds to about 7.23% a year.
- `tspGrowth.ts:166`, `:206`: the $24,500 limit stays fixed in nominal dollars while contributions grow with the pay-raise input, so the cap binds earlier than it would in practice. Catch-up contributions and the combat-zone limit are not modeled here.
- `tspGrowth.ts:275-296`: Roth vs. Traditional compares the same dollar contribution and ignores the tax paid up front on Roth, so Roth always wins when the retirement tax rate is above zero.

---

## 3. Missing tests

None of these exist today. Inputs → expected output. Where a finding above is open, the expected value is the rule value.

**VA Disability** (engine tests exist; these cases do not)
- 100%, spouse, 0 under-18, 1 school child → $4,510.62. *(The existing test at `edge-cases.spec.ts:57` asserts whatever the lib currently returns, so it passes on the wrong value and must change.)*
- 50%, no spouse, 1 school child → $1,308.90. 30%, spouse, 2 school children → $827.47.
- 30%, spouse, 1 under-18 + 1 school child → $771.47 (currently correct — pin it).
- Parents: 70%, spouse + 1 child + 2 parents → $2,320.45; 30%, 2 parents only → $656.47.
- § 4.26(d): L leg 10, R leg 10, 90, 30 → 100%. L 20, R 10, 80, 60 → 100%.
- § 4.26 regulation example: 60, 20, L 10, R 10 → bilateral 21 → 74 → 70%.
- L arm 100 + R arm 10 → displayed combined value never above 100.
- 100 + 50 → 100; five 10s → 41 → 40%; ten 10s → 65 → 70%.
- Arms qualify, one leg only (L arm 20, R arm 20, L leg 30) → leg combines outside the factor.
- `getCompensation(20, any dependents)` = `getCompensation(20, none)`.

**Retirement** (no lib-level tests at all; the 12 browser tests check that elements render)
- E-7, 20, High-3 → High-3 average and pension pinned to dollars.
- BRS = exactly 80% of High-3 for the same inputs; 40 years → 100% / 80%.
- 40% VA, 20 years → total equals pension; 50% → pension + $1,132.90.
- W-5 at 20, O-9 at 20, O-10 at 21 → no $0 term in the breakdown.
- TSP: current YOS 0, 1, 2 → match starts in projection month 25, 13, 1.
- `calculateTSPAgencyMonthly`: 0% → 1%, 3% → 4%, 4% → 4.5%, 5% and 50% → 5%.
- O-5 at 50% → annual member contribution capped at $24,500.
- Share-link round trip → identical total BRS income.

**Deployment** (16 browser tests; none assert a dollar figure beyond $275)
- Dependents = No → FSA $0 regardless of the toggle.
- E-5/6 yrs, 6 months, combat zone → CZTE savings pinned (and the method documented).
- Enlisted and W-4 in a combat zone → federal tax $0; O-4 below the cap → $0; O-6 over 20 → taxable above cap pinned.
- Officer, IDP off → cap excludes the special-pay add-on.
- Combat zone = No with IDP + HDP-L → tax rises with the special pays.
- SDP: $10,000 × 12 months and × 1 month pinned; deposit above $10,000 clamps; SDP forced to $0 outside a combat zone.
- TSP: 100% of pay, non-combat → capped at $24,500 pro rata.

**PCS / PPM** (only DLA has a unit test)
- Travel days at 0, 1, 400, 401, 450, 451, 750, 751, 800, 1,100, 1,101, 1,150, 1,151 miles.
- Per diem: 1 day, 2 days, 4 days; with 0, 1, 3 dependents; mixed ages once modeled.
- TLE: 10 days for member alone, member + 1, member + 3; old + new days above the cap.
- `calculateDLA('O-1E' | 'O-2E' | 'O-3E')` → non-zero; unknown rank → handled, not $0.
- Weight allowance with vs without dependents; PPM weight above the allowance clamps.
- PPM: expenses above reimbursement → negative profit not taxed; advance = 60%.
- Distance 0 → MALT $0 and per diem $0.

**Dual-Military BAH** (no functional test of any kind)
- Same station, O-3 + E-5, 28310 → optimal = Member 2, gain $60.
- Same station, same grade → "tied", gain $0.
- No dependents → both at the without-dependents rate, no recommendation.
- Different stations → `optimal` null for every grade pair.
- O-8/O-9/O-10 map to the O-7 rate.
- Explanation text names the member with the larger gap, checked on one MHA each way.

**Total Compensation / TSP**
- BRS, years of service 0 and 1 → agency contribution = 1% only.
- Tax advantage for a base pay just under and just over a bracket edge.
- Warrant officer → officer BAS.
- `projectTSP`: $4,000/mo → member contributions stop at $24,500 and the match drops to the 1% automatic for the rest of that year (currently correct — pin it).
- `projectTSP` with years of service 0 → no match in months 1–24.

---

## 4. Clean areas

- **VA combining order and table math:** descending sort, each pair rounded half-up to a whole number — matches § 4.25 Table I cells fetched this session (45 & 10 = 51, 25 & 10 = 33, 35 & 10 = 42, 55 & 30 = 69, 19 & 10 = 27, 65 & 10 = 69).
- **VA final rounding:** nearest 10 with 5s up, done once; 95+ → 100. Correct.
- **VA bilateral basics:** both sides must be above 0%; same-side pairs excluded; arms and legs merged into one computation with a single factor per § 4.26(b); factor added, not combined; result treated as one rating. Correct, and the regulation's own example reproduces (74 → 70%).
- **VA dependents below 30%:** flat. With at least one under-18 child, additional-child and school-child amounts are correct; VA.gov's 70% spouse + 3 children example reproduces ($2,226.45 before A&A).
- **VA edge inputs:** empty list, single rating, 0% ratings, 100% + anything all behave.
- **Retirement multipliers:** 2.5% and 2.0% per year; no 75% cap after 30 years (correct for post-2006 retirements); 20-year floor enforced by the slider.
- **Retirement CRDP threshold:** 50% and 20 years. Correct.
- **BRS match tiers:** 1% + 100% of the first 3% + 50% of the next 2%, capped at 5% — identical in all three implementations. The 25th-month start is right in `retirement.ts`.
- **Deployment CZTE for enlisted and warrant officers:** full exclusion; warrant officers correctly not capped.
- **Deployment special pays:** IDP and HDP-L additive with no cap; HFP never added alongside IDP; full-month assumption disclosed in the UI.
- **Deployment tax brackets:** progressive calculation is arithmetically correct and sourced.
- **PCS DLA:** lookup by grade and dependency; covered by a unit test against the official table.
- **PCS MALT arithmetic and PPM arithmetic** (profit, tax only on positive profit, 60% advance): correct as formulas.
- **Dual-military totals and optimum:** both scenarios computed from actual with/without rates; no financial recommendation at different stations; no arrangement recommended that the rules disallow.
- **TSP projector:** deferral limit enforced per year, match correctly lost after the limit is hit, contributions stop at separation while growth continues.
- **Total comp BAS:** warrant officers get the officer rate.
