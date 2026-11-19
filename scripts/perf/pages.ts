/**
 * Page lists for the P1 performance measurement (docs/audits/FIX_QUEUE.md row 11,
 * build-p1-performance.md Step 1). Tooling only: nothing in the app imports this.
 */

/** Top-traffic pages named in the build brief (always reported, heavy or not). */
export const TOP_TRAFFIC = [
  '/calculators/deployment',
  '/calculators/pcs',
  '/calculators/total-compensation',
  '/pay/raise',
  '/bah/naval-station-norfolk',
  '/bah/fort-bragg',
  '/bah',
  '/bah/changes',
  '/calculators/va-disability',
  '/pay/e5',
] as const;

/**
 * The three pages traced for "what runs on load", interaction cost and third-party
 * cost. `interactions` run in order after load; each is one trusted input
 * (keyboard or pointer), so Event Timing records it the way it would for a visitor.
 */
export type Interaction =
  | { kind: 'select-next'; name: string; selector: string }
  | { kind: 'type'; name: string; selector: string; text: string }
  | { kind: 'click'; name: string; selector: string };

export const TRACE_PAGES: { path: string; interactions: Interaction[] }[] = [
  {
    path: '/calculators/total-compensation',
    interactions: [
      // The first select in the calculator is "Rank / Pay Grade".
      { kind: 'select-next', name: 'rank select (ArrowDown)', selector: 'main select' },
      { kind: 'type', name: 'duty station / ZIP typed', selector: 'main input[type="text"]', text: '28310' },
    ],
  },
  {
    path: '/bah/fort-bragg',
    interactions: [
      { kind: 'select-next', name: 'pay grade select (ArrowDown)', selector: '#station-pay-grade' },
    ],
  },
  {
    path: '/bah/changes',
    interactions: [
      { kind: 'click', name: 'sort by name (click)', selector: '[data-testid="bah-changes-sort-name"]' },
    ],
  },
];
