/**
 * Deployment Pay Constants — 2026
 *
 * Sources:
 *   - HFP/IDP: 37 U.S.C. § 310, DoD FMR Vol. 7A Ch. 10 — $225/month
 *   - HDP: 37 U.S.C. § 305, DoD FMR Vol. 7A Ch. 17 — tiered $50–$150/month
 *   - FSA: 37 U.S.C. § 427 — increased to $300/month effective FY2026 NDAA
 *   - CZTE: 26 U.S.C. § 112, IRS Pub. 3 (Armed Forces' Tax Guide)
 *   - SDP: 10 U.S.C. § 1035 — 10% annual guaranteed return
 *   - TSP combat zone limit: IRC § 415(c) — $72,000 for 2026
 *
 * Update annually: verify HFP/IDP, HDP, and FSA rates each January.
 */

export const DEPLOYMENT_RATES_2026 = {
  year: 2026,

  // ─── Hostile Fire Pay / Imminent Danger Pay ─────────────────────────────
  // 37 U.S.C. § 310 — same monthly rate for both HFP and IDP
  // HFP: paid monthly (flat). IDP: may be prorated daily depending on deployment type.
  hfpIdp: 225, // $225/month

  // ─── Hardship Duty Pay — Location (HDP-L) ───────────────────────────────
  // 37 U.S.C. § 305 — tiered by location designation
  hdpLevels: [0, 50, 100, 150] as const, // $/month tiers
  // If also receiving HFP/IDP, HDP is capped at $100/month (DoD FMR 7A Ch. 17)
  hdpCapWithHFP: 100,

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

export type HDPLevel = 0 | 50 | 100 | 150;
