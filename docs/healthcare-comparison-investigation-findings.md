# Healthcare-Comparison Calculator — Correctness Investigation

**Mode:** Read-only investigation. No code changes were made (this document is the only file written).
**Date:** 2026-06-13
**Scope:** `/calculators/healthcare-comparison` page, component, and its data layer.
**Hard rule observed:** No TRICARE/DHA dollar figure was fetched, generated, or "corrected." Logic is diagnosed; figure *values* are only reported and flagged for Dan to verify against official sources.

---

## Files in scope

| File | Role |
|---|---|
| `src/app/calculators/healthcare-comparison/page.tsx` | Page shell, hero, example box, accordion (static copy w/ many inline $ figures) |
| `src/components/calculators/healthcare-comparison/HealthcareComparisonCalculator.tsx` | All calculation logic + UI |
| `src/data/healthcare/2026/constants.ts` | `HEALTHCARE_2026` — the data this calculator actually reads |
| `src/data/tricare/2026/constants.ts` | `TRICARE_RATES_2026` — a **second, separate** TRS premium source used by the Guard/Reserve calculator |
| `tests/e2e/healthcare-comparison.spec.ts`, `tests/e2e/data-accuracy.spec.ts` | E2E assertions |

---

## 1. TRS bug — verdict: **LOGIC REFUTED / FIGURE UNVERIFIED**

**The TRS code path is logically correct. There is no logic bug in how TRS is selected, tiered, or annualized.** The only open question is whether the premium *values* `$57.88` / `$286.66` are the true published 2026 rates — which I am barred from verifying and which Dan must confirm.

### What the TRS path does (traced end to end)

`HealthcareComparisonCalculator.tsx:158-172`:
```ts
case 'trs': {
  const p = HEALTHCARE_2026.tricareReserveSelect[coverage];   // coverage = 'single' | 'family'
  const dedUsage = Math.round(p.deductible * 0.45);
  return {
    monthlyPremium: p.premium,
    annualPremium: p.premium * 12,
    ...
    firstYearTotal: p.premium * 12 + dedUsage,
    ...
  };
}
```

- **Tier mapping is correct.** `coverage = family ? 'family' : 'single'` (line 80), where `family = isFamily(familyStatus)` and `isFamily = fs !== 'single'` (lines 50-52). So **single → member-only** premium; **any dependents (including married-no-kids and single-parent) → member-and-family** premium. This matches TRS's real two-tier structure (member-only vs. member-and-family, where one or more family members triggers the family rate). ✅
- **Premium is monthly and annualized consistently.** `monthlyPremium = p.premium` (57.88 / 286.66 — monthly), `annualPremium = ×12`. Employer and ACA paths annualize identically (`premium × 12`). So TRS is apples-to-apples with the other monthly-premium options. ✅
- **Source of the figure:** `src/data/healthcare/2026/constants.ts:81-84`:
  ```ts
  tricareReserveSelect: {
    single: { premium: 57.88,  deductible: 150, oopMax: 3000 },
    family: { premium: 286.66, deductible: 300, oopMax: 6000 },
  },
  ```
  Year = 2026 (file header line 9: "TRICARE.mil, effective January 1, 2026").
- **Not conflated with TRR or TRICARE Select.** Searched the entire repo: there is **no TRR (TRICARE Retired Reserve) data anywhere**, and no TRICARE Select *enrollment fee* is used. TRS is modeled on its own two premium tiers + deductible + cap. The "confused with TRR/Select" hypothesis is **refuted**. ✅

### Why it was flagged, and why I can't close it

Commit **`92750ef`** (2026-05-12, "fix: data accuracy and language softening") deliberately changed TRS premiums:

```
- single: { premium: 52,  ... }
- family: { premium: 260, ... }
+ single: { premium: 57.88,  ... }
+ family: { premium: 286.66, ... }
```
…with the commit message line: *"TRS premiums: $52/$260 → $57.88/$286.66 (correct 2026 TRICARE.mil rates)."*

So the current numbers were **hand-entered as a correction**. They are now **internally consistent in every location** (see §4), which means:
- If they are right, there is nothing to fix.
- If the *correction itself* introduced a wrong number (e.g. a stale prior-year rate or a transposed family rate), **nothing in the codebase would catch it** — including the "data-accuracy" test, which is a tautology here (see HIGH-2 below).

**Neutral cross-check cue for Dan (arithmetic on the code's own values, not an external figure):** the in-code member-and-family premium is **4.95×** the member-only premium (286.66 ÷ 57.88). Please verify **both** tiers *independently* against the official 2026 TRS premium table at tricare.mil — a correct member-only rate does not guarantee a correct family rate. See the checklist in §3.

**Bottom line:** TRS logic = correct. TRS figure = **must be verified by Dan** (cannot be confirmed or refuted here under the hard rule). This is verification item #1.

---

## 2. All other correctness issues (ranked by severity)

### HIGH-1 — Two separate sources of truth for the TRS premium (drift hazard)
The same TRS premium lives in **two** files:
- `src/data/healthcare/2026/constants.ts:82-83` → `tricareReserveSelect.single/family` (used by *this* calculator)
- `src/data/tricare/2026/constants.ts:16-17` → `TRICARE_RATES_2026.reserveSelect.memberOnly/memberAndFamily` (used by the Guard/Reserve calculator: `guardReserve.ts:103-113`, `GuardReserveCalculator.tsx`)

They currently agree (both 57.88 / 286.66), but **the January annual update has to touch both or they silently diverge** — exactly the failure mode that hides a wrong number on a live page. **Severity HIGH because it directly compounds the §1 risk.** Recommend consolidating to one constant after Dan confirms the figure.

### HIGH-2 — The "data-accuracy" E2E test cannot catch a wrong TRS figure (false sense of safety)
`tests/e2e/data-accuracy.spec.ts:227-239` asserts the page shows `$286.66` and `$57.88`. But those expected strings are just the same hand-keyed constants rendered back — the test confirms "the data file value displays," **not** "the value matches tricare.mil." A stale/wrong premium would pass green. The comment *"TRICARE.mil 2026 rate, effective January 1, 2026"* makes this look like an external check when it is not. Same pattern at lines 267-271 for Guard/Reserve. **No fix needed to logic — but Dan should not treat these passing tests as figure validation.**

### MED-1 — ACA out-of-pocket max is silently dropped (cross-option inconsistency)
Employer (`:84-96`) and TRS (`:158-172`) carry a real `oopMax` and display it (`CoverageColumn`, `:273-278`, shown only when `oopMax > 0`). But **both ACA paths hardcode `oopMax: 0`** (`aca-no-subsidy` at line 107; `aca-subsidy` at line 132), and the ACA data block (`constants.ts:32-43`) has no `oopMax` field at all. Result: ACA plans show no OOP max while employer/TRS do, even though ACA plans have *federally-mandated* OOP maximums. Inconsistent comparison surface. (Note: no total ever uses `oopMax` — see MED-3 — so this is a display gap, not a math error.)

### MED-2 — Pre-tax vs. post-tax premium treatment is ignored (apples-to-not-quite-apples)
All premiums are compared as raw dollars. Employer premiums are typically **pre-tax** (Section 125 / cafeteria plan), while ACA and TRS premiums are **post-tax**. The calculator applies no tax adjustment and the methodology note (`page.tsx`/component `:697-699`) doesn't mention it. This can overstate the *effective* cost of an employer plan relative to TRS/ACA. The prompt explicitly called for flagging this. Defensible for an "estimate" tool, but it can mislead at decision time — recommend a one-line caveat in the methodology note.

### MED-3 — Catastrophic cap / OOP max is never applied to any total (model simplification)
`firstYearTotal` for every paid option = `premium × 12 + round(deductible × 0.45)`. The cost-share portion modeled is only ~45% of the *deductible*; copays/coinsurance between the deductible and the OOP max are never added, and `oopMax` never bounds anything. So:
- The cap can never bind (the modeled spend is far below it) — **not a live miscalculation**, because premiums correctly sit *outside* the cap and the modeled cost-share is tiny.
- But every paid option understates a heavy-utilization year by the same mechanism. It is **consistent across options**, so it doesn't bias the *comparison*; it does make absolute totals optimistic. Worth a short disclosure; not urgent.

### MED-4 — Example table mislabels ACA bronze as "silver" (static content contradicts the calculator)
`page.tsx:142`:
```
<ExampleRow label="ACA Marketplace silver plan (family, unsubsidized)" value="$1,200/mo — $14,400/yr" />
```
But in the data, family **bronze** = `$1,200/mo` and family **silver** = `$1,600/mo` (`constants.ts:39-40`). A user who reads "silver = $1,200" here and then selects ACA-no-subsidy / family / silver in the live calculator sees **$1,600/mo**. Either the label should say "bronze" or the value should be `$1,600/mo — $19,200/yr`. Credibility-relevant inconsistency. (This is a content/figure fix, not logic.)

### LOW-1 — VA path always returns $0 regardless of rating (by-design, but the selector is now cosmetic)
Commit `92750ef` zeroed `monthlyCopayEst` for *all* VA rating tiers (`constants.ts:58-79`). The VA branch computes `annualCopayEst = monthlyCopayEst * 12 = 0` for every rating (`:141-156`). So the VA rating dropdown changes only the **label/note**, never the cost — every VA scenario shows `$0`. Intentional per that commit (they removed specific copay claims), but be aware the input no longer affects output.

### LOW-2 — Non-50%+ VA ratings render a red "$0" under "Annual healthcare cost gap"
`:588-592`: the green-$0 branch fires only for `va + 50plus`. For `30to40 / 10to20 / 0sc`, `annualGap = 0` but it renders in **red** via the else-branch (`fmt(annualGap)` = "$0" in red). Cosmetically alarming ("gap" in red) for a $0 value. Purely visual.

### LOW-3 — FPL year labeling is inconsistent across the page
- `constants.ts:45` comment: "2026 Federal Poverty Level thresholds"; header `:7`: "HHS 2026 FPL guidelines".
- UI `:511`: "% of **2025** FPL used for 2026 coverage"; accordion `page.tsx:203`: "2025 federal poverty guidelines used for the 2026 coverage year."

The UI/accordion convention (2025 FPL → 2026 coverage) is the standard ACA mechanic; the data-file comments say "2026 FPL," which contradicts it. Align the comments to avoid confusion at update time. (Figure/label item — confirm which year `base1: 15650` actually represents.)

---

## 3. Figure-verification checklist (Dan fills the "official value" column)

> Every dollar value the calculator uses. **I have not entered any "correct" values.** "Sourced" = read from a data file; "Inline" = hand-keyed in page/component JSX (will NOT auto-update when the data file changes — maintenance hazard).

### TRICARE Reserve Select — **TOP PRIORITY**
| Item | Code value | Where | Inline/Sourced | Year repr. | Verify against |
|---|---|---|---|---|---|
| TRS member-only premium | **$57.88/mo** | `constants.ts:82`; dup `tricare/2026:16` | Sourced (×2 files) | 2026 | tricare.mil TRS premium table 2026 |
| TRS member-and-family premium | **$286.66/mo** | `constants.ts:83`; dup `tricare/2026:17` | Sourced (×2 files) | 2026 | tricare.mil TRS premium table 2026 |
| TRS individual deductible | **$150/yr** | `constants.ts:82` | Sourced | 2026 | tricare.mil TRS cost terms |
| TRS family deductible | **$300/yr** | `constants.ts:83` | Sourced | 2026 | tricare.mil TRS cost terms |
| TRS individual catastrophic cap | **$3,000** | `constants.ts:82` | Sourced | 2026 | tricare.mil catastrophic cap |
| TRS family catastrophic cap | **$6,000** | `constants.ts:83` | Sourced | 2026 | tricare.mil catastrophic cap |
| TRS premiums (inline copy) | $57.88 / $286.66 | `page.tsx:144,212`; `guard-reserve/page.tsx:155`; blogs `tricare-costs-2026-vs-civilian.mdx:20,102-103`, `tamp-...mdx:88,138` | Inline | 2026 | must match the sourced value above |

### Employer-sponsored (KFF Employer Health Benefits Survey)
| Tier | premium / deductible / oopMax | Where | Inline/Sourced | Verify against |
|---|---|---|---|---|
| Single bronze | $105 / $3,500 / $8,000 | `constants.ts:21` | Sourced | KFF latest survey |
| Single silver | $170 / $2,000 / $6,500 | `constants.ts:22` | Sourced | KFF |
| Single gold | $250 / $1,000 / $5,000 | `constants.ts:23` | Sourced | KFF |
| Family bronze | $450 / $7,000 / $16,000 | `constants.ts:26` | Sourced | KFF |
| Family silver | $570 / $4,000 / $13,000 | `constants.ts:27` | Sourced | KFF |
| Family gold | $750 / $2,000 / $10,000 | `constants.ts:28` | Sourced | KFF |
| Employer family silver (inline examples) | $570/mo, $6,840/yr, $8,640/yr | `page.tsx:119,139,141,227` | Inline | must match sourced |

### ACA Marketplace (Healthcare.gov / KFF Marketplace Calculator)
| Tier | premium / deductible | Where | Inline/Sourced | Verify against |
|---|---|---|---|---|
| Single bronze | $350 / $7,500 | `constants.ts:34` | Sourced | Healthcare.gov benchmark |
| Single silver | $500 / $5,000 | `constants.ts:35` | Sourced | Healthcare.gov |
| Single gold | $650 / $2,000 | `constants.ts:36` | Sourced | Healthcare.gov |
| Family bronze | $1,200 / $15,000 | `constants.ts:39` | Sourced | Healthcare.gov |
| Family silver | $1,600 / $10,000 | `constants.ts:40` | Sourced | Healthcare.gov |
| Family gold | $2,100 / $4,000 | `constants.ts:41` | Sourced | Healthcare.gov |
| ACA "silver" example | $1,200/mo — $14,400/yr | `page.tsx:142` | Inline | **mislabeled — see MED-4** (this is the bronze rate) |
| ACA OOP max | **absent (treated as $0)** | calc `:107,132` | n/a | ACA OOP max exists — see MED-1 |

### ACA subsidy model (IRS APTC / FPL)
| Item | Code value | Where | Verify against |
|---|---|---|---|
| FPL base (1 person) | $15,650 | `constants.ts:47` | HHS poverty guidelines — confirm 2025-for-2026 (see LOW-3) |
| FPL increment / person | $5,500 | `constants.ts:48` | HHS poverty guidelines |
| Subsidy band <150% FPL | 90% | `constants.ts:53` | IRS/ACA APTC schedule |
| Subsidy band 150–250% | 75% | `constants.ts:54` | IRS/ACA |
| Subsidy band 250–400% | 40% | `constants.ts:55` | IRS/ACA |
| >400% FPL | 0% (cliff) | `getSubsidyRate` `:42-48` | Confirm whether the post-IRA "no 400% cliff" rule applies for 2026 |

### VA healthcare
| Item | Code value | Where | Verify against |
|---|---|---|---|
| Monthly copay est (all rating tiers) | $0 | `constants.ts:60,66,71,76` | VA.gov copay rates / priority groups (note: all tiers now $0 — LOW-1) |

### TAMP
| Item | Code value | Where | Verify against |
|---|---|---|---|
| Premium / deductible / duration | $0 / $0 / 180 days | `constants.ts:86-91` | DoDI 1341.10, 10 U.S.C. §1145 |

### Inline marketing claims (not computed — sanity-check only)
| Claim | Where | Note |
|---|---|---|
| "premiums alone can run $7,000–$12,000 per year" | component `:391` | Inline copy |
| "$600–$2,000/month for family coverage" | `page.tsx:104` | Inline copy |
| "$10,000–$15,000" first-year family budget | `page.tsx:233` | Inline copy |
| "$30–$80/month" dental+vision | `page.tsx:230` | Inline copy |
| Civilian comparison $7,500 / $27,000 | `tricare/2026/constants.ts:23-24` | Sourced (Guard/Reserve calc only — not this page) |

---

## 4. Prioritized fix plan (one change-type per build, smallest blast radius first)

Issues split into **(a) logic/content fixes implementable on approval** and **(b) figure corrections that need Dan's verified numbers first.**

### Build 0 — (b) Verify the TRS figure *before any code change* — BLOCKER
Dan confirms `$57.88` and `$286.66` (and the $150/$300 deductibles, $3,000/$6,000 caps) against the 2026 tricare.mil TRS premium table. **Everything else waits on this**, because the consolidation in Build 1 should bake in the confirmed value. If a number is wrong, it is a one-line data edit — but it must be Dan's number.

### Build 1 — (a) Consolidate the duplicate TRS source [HIGH-1]
After Build 0: make `HEALTHCARE_2026.tricareReserveSelect` and `TRICARE_RATES_2026.reserveSelect` reference a single constant (or have one import the other) so the annual update can never desync the two calculators. Smallest blast radius: both consumers already read structured objects. Run `npm run test:e2e` (healthcare + guard-reserve + data-accuracy specs).

### Build 2 — (b) Fix the ACA example mislabel [MED-4]
Pure content. Either change `page.tsx:142` label to "bronze," or change the value to the confirmed family-silver figure ($1,600/mo / $19,200/yr). Dan picks which is intended.

### Build 3 — (a) Decide ACA OOP-max treatment [MED-1]
Either add an `oopMax` to the ACA data tiers and surface it like employer/TRS, **or** add a short note that ACA OOP max is not modeled — for parity across columns. (If adding values, those are figures → Dan supplies.)

### Build 4 — (a) Methodology disclosures [MED-2, MED-3]
One-paragraph addition to the methodology note (`:697-699`): (i) premiums shown pre-/post-tax are not tax-adjusted; (ii) totals model routine-utilization deductible spend only and do not include the catastrophic-cap ceiling. No math change.

### Build 5 — (a) Cosmetic + labeling polish [LOW-1, LOW-2, LOW-3]
- LOW-2: render the VA "$0" gap in green for all ratings (not just 50%+).
- LOW-1: either hide the VA rating selector (since it no longer changes cost) or add a note that it affects coverage notes only.
- LOW-3: align the `constants.ts` FPL comments with the "2025 FPL → 2026 coverage" wording the UI uses.

### Not a code change — testing posture [HIGH-2]
Be aware the `data-accuracy.spec.ts` TRS assertions validate display, not source accuracy. Consider this a documentation note for Dan rather than a code fix; a genuine guard would require an independent reference value, which is itself a Build-0 figure decision.

---

## Summary

- **TRS logic: correct** — right tier mapping, monthly premium annualized consistently, no TRR/Select conflation. **Refuted as a logic bug.**
- **TRS figure: unverified** — `$57.88` / `$286.66` were hand-set as a "correction" in `92750ef` and are consistent everywhere, but consistency ≠ accuracy, and no test guards the actual value. **Dan must verify against tricare.mil (Build 0).**
- **Biggest structural risk:** the TRS premium has **two sources of truth** (HIGH-1) and a **tautological test** (HIGH-2) — together they are how a wrong number could stay live undetected.
- **Most user-visible content bug:** ACA bronze rate labeled "silver" in the example table (MED-4).
- No fixes were implemented. Report complete.
