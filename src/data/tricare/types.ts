/**
 * Shape of a TRICARE cost year file (src/data/tricare/<year>/costs.ts).
 *
 * Every dollar value is copied from docs/sources/tricare-costs-2027.md, which
 * records the official source of each table (keys FR27, TM27, OS27, NR26, PH).
 * Amounts are in dollars: enrollment fees per year, premiums per month,
 * deductibles and catastrophic caps per calendar year, copays per visit.
 */

export interface TricareSource {
  /** Key used in docs/sources/tricare-costs-2027.md. */
  key: string;
  title: string;
  url: string;
}

export interface IndFam {
  individual: number;
  family: number;
}

/** Network copays per visit. */
export interface Copays {
  primary: number;
  specialty: number;
  er: number;
  urgent: number;
}

export interface RetireeCopays extends Copays {
  preventive: number;
}

export interface RetireePlan {
  enrollmentFee: IndFam;
  /** Network deductible (Prime: $0). */
  deductible: IndFam;
  /** Catastrophic cap per family per calendar year. */
  catastrophicCap: number;
  copays: RetireeCopays;
}

export interface AdfmSelectPlan {
  deductible: {
    /** Sponsor in pay grade E-1 to E-4. */
    e1ToE4: IndFam;
    /** Sponsor in pay grade E-5 and above (and officers). */
    e5AndAbove: IndFam;
  };
  catastrophicCap: number;
  copays: Copays;
}

export interface AdfmPrimePlan {
  enrollmentFee: number;
  deductible: number;
  /** Network copays for every visit type. */
  copay: number;
  catastrophicCap: number;
}

export interface TricareCosts {
  year: number;
  /** ISO date the rates take effect. */
  effective: string;
  sources: TricareSource[];

  /** Retirees, their families and others: TRICARE Prime / Select. */
  retiree: {
    primeA: RetireePlan;
    primeB: RetireePlan;
    selectA: RetireePlan;
    selectB: RetireePlan & {
      /** Select Group B only: non-network deductible. */
      nonNetworkDeductible: IndFam;
    };
    /** Non-network TRICARE Select cost-share, percent. */
    selectNonNetworkCostSharePct: number;
    /** Select Group A cap for survivors of active duty deceased sponsors and medically retired members and their dependents. */
    selectACapSurvivorsMedicallyRetired: number;
  };

  /** Active duty family members. Active duty members themselves have no out-of-pocket costs. */
  adfm: {
    primeA: AdfmPrimePlan;
    primeB: AdfmPrimePlan;
    selectA: AdfmSelectPlan & { enrollmentFee: number };
    selectB: AdfmSelectPlan & { enrollmentFee: number };
    /** Non-network TRICARE Select cost-share, percent. */
    selectNonNetworkCostSharePct: number;
  };

  /** Premium-based plans, monthly premiums. Deductibles, copays and caps follow TRICARE Select Group B. */
  premiumPlans: {
    trsMember: number;
    trsFamily: number;
    trrMember: number;
    trrFamily: number;
    tyaPrime: number;
    tyaSelect: number;
  };

  /** Plain-language exceptions, as stated by the source. No figures here: figures live in the fields above. */
  notes: string[];
}
