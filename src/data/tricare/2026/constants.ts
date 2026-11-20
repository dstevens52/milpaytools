/**
 * TRICARE Reserve Select premiums, 2026 — kept for the guard-reserve
 * calculator, page and lib. Derived from ./costs.ts (the one place the 2026
 * TRICARE figures are typed; source in docs/sources/tricare-costs-2027.md).
 */

import { TRICARE_COSTS_2026 } from './costs';

export const TRICARE_RATES_2026 = {
  year: 2026,

  reserveSelect: {
    memberOnly: TRICARE_COSTS_2026.premiumPlans.trsMember, // $/month
    memberAndFamily: TRICARE_COSTS_2026.premiumPlans.trsFamily, // $/month
  },
} as const;
