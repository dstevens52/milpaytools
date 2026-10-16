/**
 * Deployment Pay Constants — 2026
 *
 * Sources:
 *   - HFP/IDP/HDP-L: ASW(M&RA) memo, "Increase in Monthly Amounts of Hostile Fire Pay and
 *     Imminent Danger Pay," signed July 14, 2026, effective October 1, 2026 — authority DoWI
 *     1340.09; DoW 7000.14-R Vol. 7a Ch. 10 (HFP/IDP) and Ch. 17 (HDP-L).
 *     Copy: docs/sources/hostile-pay-memo.pdf
 *     Statutory authority and history (from the DoD release, NOT the memo): "Statement by Chief
 *     Pentagon Spokesman, Sean Parnell, on the Department of War's Historic Increase to Hostile
 *     Fire and Imminent Danger Pay," war.gov, Oct. 1, 2026 — the increase is under 37 U.S.C. § 351,
 *     and "Since October 2002, both HFP and IDP pay have been set at a flat monthly rate of $225."
 *     Verified in browser 2026-10-16: 
 *     https://www.war.gov/News/Releases/Release/Article/4616378/statement-by-chief-pentagon-spokesman-sean-parnell-on-the-department-of-wars-hi/
 *   - FSA: 37 U.S.C. § 427 — increased to $300/month effective FY2026 NDAA
 *   - CZTE: 26 U.S.C. § 112, IRS Pub. 3 (Armed Forces' Tax Guide)
 *   - SDP: 10 U.S.C. § 1035 — 10% annual guaranteed return
 *   - TSP combat zone limit: IRC § 415(c) — $72,000 for 2026
 *
 * Update annually: verify HFP/IDP, HDP, and FSA rates each January. HFP/IDP/HDP-L can also
 * change off-cycle (the October 1, 2026 change did) — see docs/ANNUAL_DATA_UPDATE.md.
 */

export const DEPLOYMENT_RATES_2026 = {
  year: 2026,

  // ─── Hostile Fire Pay / Imminent Danger Pay ─────────────────────────────
  // Effective October 1, 2026. Verified against the signed memo (docs/sources/hostile-pay-memo.pdf)
  // on 2026-10-15: "the amounts for HFP and IDP are increased to $450 and $275 per month,
  // respectively. The $275 monthly IDP is prorated at $9.16 per day". Authority: DoWI 1340.09;
  // DoW 7000.14-R Vol. 7a Ch. 10. HFP and IDP may not be paid for the same period of service.
  // Earlier periods used the prior rates; this calculator does not model the transition.
  ratesEffectiveDate: 'October 1, 2026',
  hfpIdpUnchangedSince: 'October 2002', // DoD release (war.gov, Oct. 1, 2026), not the memo
  releaseUrl:
    'https://www.war.gov/News/Releases/Release/Article/4616378/statement-by-chief-pentagon-spokesman-sean-parnell-on-the-department-of-wars-hi/',
  hfp: 450, // $450/month — memo, effective 2026-10-01
  idp: 275, // $275/month — memo, effective 2026-10-01
  idpDaily: 9.16, // $9.16/day — memo, effective 2026-10-01. Not used yet: the calculator models full months of IDP.

  // ─── Hardship Duty Pay — Location (HDP-L) ───────────────────────────────
  // Tiered by location designation. Verified against the signed memo on 2026-10-15: "the monthly
  // HDP-L rate will be reduced from $150 to $100 per month in accordance with DoW 7000.14.R,
  // Volume 7a, Chapter 17." The memo names a single rate ($150 → $100) and says nothing about the
  // $50 or $100 tiers, so the $150 tier is removed and the others are unchanged. The former
  // $100 cap when combined with HFP/IDP no longer has any effect and was removed.
  hdpLevels: [0, 50, 100] as const, // $/month tiers, effective 2026-10-01
  hdpLTopRatePrior: 150, // $/month top HDP-L rate before 2026-10-01 — memo: "reduced from $150 to $100"

  // ─── Family Separation Allowance (FSA) ──────────────────────────────────
  // 37 U.S.C. § 427 — FY2026 NDAA increased from $250 to $300 (first increase since 2002)
  // Requires separation from dependents for 30+ consecutive days
  fsa: 300, // $300/month
  fsaMinDays: 30,
  fsaTaxable: false, // FSA is a non-taxable allowance

  // ─── Combat Zone Tax Exclusion (CZTE) ───────────────────────────────────
  // 26 U.S.C. § 112 — excludes military pay from federal income tax
  // Enlisted & Warrant Officers: ALL military pay is excluded
  // Officers: capped at highest enlisted rate + HFP/IDP amount
  // One day in a combat zone = entire month's pay excluded
  //
  // Officer CZTE cap: highest E-9 base pay rate + HFP/IDP ($225)
  // Approximate 2026 figure — verify exact E-9 max rate with DFAS
  // PENDING VERIFICATION (2026-10-15): still built on the pre-October $225 HFP/IDP. The
  // October 1, 2026 memo is silent on the CZTE cap, and HFP ($450) and IDP ($275) now differ,
  // so it is unconfirmed which amount the cap tracks. Not recomputed — hold for a sourced figure.
  officerCZTECap: 10_520, // ~$10,295 (E-9 max base pay) + $225 HFP = ~$10,520

  // ─── Savings Deposit Program (SDP) ──────────────────────────────────────
  // 10 U.S.C. § 1035 — guaranteed 10% annual return, government-backed
  sdpMaxDeposit: 10_000, // $10,000 maximum deposit
  sdpInterestRate: 0.10, // 10% annual guaranteed
  sdpQuarterlyRate: 0.025, // 2.5% per quarter
  sdpMinDays: 30, // Must be in combat zone 30+ consecutive days
  sdpInterestContinuesDays: 90, // Interest continues 90 days after leaving

  // ─── TSP Contribution Limits (2026) ─────────────────────────────────────
  // IRS § 402(g) elective deferral limit — normal
  tspNormalLimit: 24_500,
  // IRC § 415(c) total additions limit — applies during CZTE months
  tspCombatZoneLimit: 72_000,
} as const;

export type HDPLevel = (typeof DEPLOYMENT_RATES_2026.hdpLevels)[number];
