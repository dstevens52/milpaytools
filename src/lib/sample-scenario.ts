import { lookupBAH } from '@/lib/calculations/bah';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import type { TotalCompensationInput } from '@/types/calculator';

// Canonical sample scenario shown on the homepage hero and the type=home OG card:
// E-5 @ 8 YOS, Naval Station San Diego (ZIP 92106 → MHA CA038), with dependents,
// using the total-compensation calculator's exact defaults (BRS + 5% TSP).
// Server-side only — pulls in the full BAH dataset. Never hand-key these figures,
// and never compute this scenario anywhere else: both consumers must import from
// here so the hero and the share preview can't drift apart.
export const SAMPLE_SCENARIO_INPUT: TotalCompensationInput = {
  payGrade: 'E-5',
  yearsOfService: 8,
  hasDependents: true,
  zipCode: '92106',
  retirementSystem: 'brs',
  tspContributionPct: 5,
  govHousing: false,
  mealCard: false,
};

const sampleBAH = lookupBAH({
  payGrade: SAMPLE_SCENARIO_INPUT.payGrade,
  zipCode: SAMPLE_SCENARIO_INPUT.zipCode,
  hasDependents: SAMPLE_SCENARIO_INPUT.hasDependents,
});

export const SAMPLE_SCENARIO = calculateTotalCompensation(
  SAMPLE_SCENARIO_INPUT,
  sampleBAH?.monthlyRate ?? 0,
);
