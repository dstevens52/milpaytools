# 2027 military pay raise status + 2027 retiree COLA — official sources

**Verified by Claude Chat:** 2026-11-13. Re-check weekly while the raise is pending (update `src/data/watch.ts` → `DATA_LAST_CHECKED` on each check).

## 1. 2027 basic pay raise — status (unchanged from 2026-11-11, re-verified 2026-11-13)

- **President's alternative pay plan**, 37 U.S.C. 1009(e), sent Aug 26, 2026 — H. Doc. 119-189 (govinfo: https://www.govinfo.gov/content/pkg/CDOC-119hdoc189/html/CDOC-119hdoc189.htm).
  - Sets "the 2027 monthly basic pay increase for members of the Armed Forces at 7.0 percent for grades E1 to E5, 6.0 percent for grades E6 to O3, and 5.0 percent for grades O4" and above, subject to the 37 U.S.C. 203 caps, effective Jan 1, 2027.
  - The letter refers to members "for the Department of War and the United States Coast Guard." The Coast Guard is one of the Armed Forces (10 U.S.C. 101(a)(4)), so the plan covers **Army, Navy, Marine Corps, Air Force, Space Force and Coast Guard** at the same rates. All six use the same basic pay table.
  - **Other uniformed services** (NOAA Corps, Public Health Service Commissioned Corps; uniformed services but not Armed Forces): **3.6%** under the plan. Source: the plan letter as reported by MeriTalk, FedManager and Federal News Network (Aug 2026). The govinfo page could not be fetched in full from this session, so this line is corroborated by three outlets quoting the letter rather than read in the primary text. Use it only in the "every branch" FAQ, pending mode only.
  - The plan takes effect Jan 1, 2027 unless Congress enacts a different raise.
- **Senate (SASC) FY2027 NDAA, S. 4784:** 3.6% for all grades (= the 37 U.S.C. 1009(c) ECI figure). CRS Insight IN12706 (Jul 14, 2026).
- **House:** H.R. 8800 passed Jul 22, 2026; supports 7-6-5.
- **Status 2026-11-13:** Senate cloture on the motion to proceed to S. 4784 failed 50-46 on Jul 14, 2026. No Senate passage, no conference report and no enacted FY2027 NDAA as of 2026-11-13 (CRS IN12704 status tracker; no newer floor action found). **Status stays `pending`.**

## 2. 2027 retiree COLA (military retired pay)

- **Percent: 3.6%.** SSA announced the 2027 COLA on Oct 14, 2026: "Social Security benefits will increase by 3.6 percent beginning with the December 2026 benefits, which are payable in January 2027" (https://www.ssa.gov/oact/cola/latestCOLA.html; fact sheet https://www.ssa.gov/news/en/cola/factsheets/2027.html). It's based on the CPI-W increase from Q3 2025 to Q3 2026.
- **Why the military number is the same:** 10 U.S.C. 1401a(b). "Effective on December 1 of each year," the Secretary of Defense increases retired pay by the percent (to the nearest 0.1%) by which the base-quarter CPI exceeds the prior base index. That's the same CPI-W measure SSA uses, so the percent matches (3.6%).
- **Effective date:** Dec 1, 2026. First in the **December 2026** retired pay, paid **December 31, 2026** (SBP annuitants: **January 4, 2027**), per the DFAS retired and annuitant pay schedule (https://www.dfas.mil/RetiredMilitary/manage/payschedule/; see `paydays-2027.md`). (Corrected 2026-11-13: this line said "first paid in the January 2027 payment" — that is Social Security's timing, not military retired pay.)
- **REDUX / Career Status Bonus:** 10 U.S.C. 1401a(b)(3). Members who entered on or after Aug 1, 1986 and elected the bonus (37 U.S.C. 322 pre-2008 / 354) get the paragraph (2) percent minus 1 percent → **2.6%**. Compute it as `percent - 1`; never hand-key 2.6.
- **First COLA after retiring in 2026:** 10 U.S.C. 1401a(d)–(e). The first adjustment counts only the CPI increase since the quarter before the member became entitled to retired pay, so it's generally smaller than 3.6%. For bonus (REDUX) electors it's further reduced by ¼% per quarter and can be zero. Page wording: "If your retired pay started during 2026, your first increase is generally smaller."
- **DFAS:** had not posted its 2027 retiree COLA notice as of late Oct 2026 (secondary reports). Cite SSA + the statute. Don't claim a DFAS page.
- **Out of scope here:** VA disability COLA (needs the annual Veterans' Compensation COLA Act; handled in build #6 when VA publishes the 2027 table).

## 3. 2027 BAH

- Not released as of 2026-11-13 (DTMO; the 2026 rates came out Dec 11, 2025). So the shared `DATA_LAST_CHECKED` bump to 2026-11-13 is also accurate for the 2027 BAH notice.
