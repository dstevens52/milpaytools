import type { SharedLink } from './types';

// Shared copy rendered on every v2 OCONUS station. Kept as plain strings (not
// inline JSX) so scripts/lint-oconus.ts can lint exactly what ships. Tokens
// {name} and {ohaLocalityCode} are filled per station by fillTokens().

export function fillTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

export const HERO_EYEBROW = 'Overseas Duty Station';

export const PLAN_STEPS = [
  {
    title: 'Know your overseas allowances',
    sub: 'Eligible members renting privately generally receive OHA and OCONUS COLA.',
  },
  {
    title: 'Understand how OHA works',
    sub: 'Rent is reimbursed up to a ceiling; utilities are a separate allowance.',
  },
  {
    title: 'Plan your move',
    // Linked to the PCS estimator only when it is flagged supportsOconus;
    // otherwise to the on-page "Before you move" checklist.
    subPcs: 'Estimate your PCS move costs.',
    subAnchor: 'See the before-you-move checklist below.',
  },
] as const;

// ── 4a. OconusAllowanceExplainer — verbatim from the v2 spec ────────────────

export const EXPLAINER_HEADING = 'How overseas housing allowances work';

export const EXPLAINER_LEAD = {
  strong: 'Which allowance applies depends on your situation.',
  body: "Eligible members renting privately at an overseas station generally receive the Overseas Housing Allowance (OHA) for their housing there, plus an overseas Cost-of-Living Allowance (COLA). Your orders, whether you're assigned government housing, and where your dependents live determine which housing allowances apply — for example, members serving unaccompanied may receive a housing allowance based on their dependents' location. Your finance office and orders are the authority for your case.",
};

export const EXPLAINER_POINTS: { strong: string; body: string }[] = [
  {
    strong: 'Rent is reimbursed up to a ceiling.',
    body: "The rent portion of OHA covers what you actually pay, up to a ceiling set by pay grade, dependency status, and locality ({ohaLocalityCode} for {name}). If your rent is below the ceiling, the rent portion pays your actual rent — unlike BAH, there's no rent difference to keep.",
  },
  {
    strong: 'Utilities and maintenance are a separate piece.',
    body: 'OHA includes a separate monthly utility/recurring maintenance allowance that is not tied to your rent amount.',
  },
  {
    strong: 'A one-time move-in allowance may apply.',
    body: 'The Move-In Housing Allowance (MIHA) can help with certain one-time costs of occupying a private rental overseas.',
  },
  {
    strong: 'Government housing changes the picture.',
    body: "Members assigned government or on-base housing generally don't receive OHA for that housing.",
  },
  {
    strong: 'Amounts move with exchange rates.',
    body: "DTMO reviews exchange rates twice a month, so OHA and OCONUS COLA amounts can change between paychecks. That's why this page links to official lookups instead of listing rates.",
  },
  {
    strong: 'OCONUS COLA covers non-housing costs.',
    body: 'It helps offset higher prices for everyday goods and services and varies by location, pay grade, years of service, and dependents.',
  },
  {
    strong: 'Tax treatment.',
    body: 'OHA and OCONUS COLA are excluded from federal taxable income.',
  },
];

// Official lookups. A URL still starting "TODO-DAN" renders as plain text,
// never as a link. All verified by Dan against the official sources.
const VERIFIED = '2026-10-17';

// Primary buttons: the two DTMO rate lookups.
export const OFFICIAL_LOOKUPS: SharedLink[] = [
  {
    label: 'OHA rate lookup',
    url: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: VERIFIED,
  },
  {
    label: 'OCONUS COLA rate lookup',
    url: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: VERIFIED,
  },
];

// Secondary link beside the buttons.
export const SECONDARY_LOOKUPS: SharedLink[] = [
  {
    label: 'Exchange-rate adjustments',
    url: 'https://www.travel.dod.mil/Allowances/Currency-Fluctuations-Exchange-Rates/',
    verifiedOn: VERIFIED,
  },
];

export const LES_NOTE = "Your LES in myPay shows what you're actually receiving.";

// Source line under the explainer. OHA and OCONUS COLA policy lives in the
// DoD FMR Volume 7A (not the JTR).
export const EXPLAINER_SOURCES: SharedLink[] = [
  { label: 'DTMO OHA program page', url: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/', verifiedOn: VERIFIED },
  { label: 'DTMO OCONUS COLA program page', url: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/', verifiedOn: VERIFIED },
  {
    label: 'DoD FMR Volume 7A, Chapter 26 (Housing Allowances)',
    url: 'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_26.pdf',
    verifiedOn: VERIFIED,
  },
  {
    label: 'DoD FMR Volume 7A, Chapter 68 (Cost of Living Allowance Outside the Continental United States)',
    url: 'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_68.pdf',
    verifiedOn: VERIFIED,
  },
  // Installation-specific eligibility sources live on the station as
  // commandSponsorshipSource and render after these.
];

/** Every shared link — for the lints, the link checker, and the Sources list. */
export const ALL_SHARED_LINKS: SharedLink[] = [...OFFICIAL_LOOKUPS, ...SECONDARY_LOOKUPS, ...EXPLAINER_SOURCES];

// ── Section 8. What doesn't change overseas ────────────────────────────────

export const UNCHANGED_HEADING = "What doesn't change overseas";

export const UNCHANGED_POINTS: string[] = [
  'Basic pay and BAS follow the same tables as stateside.',
  'State income tax obligations follow your state of legal residence, not your duty station.',
];

// ── 4b. OCONUS disclaimer (replaces the BAH/MHA disclaimer on v2 pages) ─────

export const OCONUS_DISCLAIMER =
  'OHA and OCONUS COLA amounts are set by the Defense Travel Management Office (DTMO) and can change as often as twice a month with exchange rates. MilPayTools does not display these rates. This page is educational information only — not financial, tax, or legal advice — and is not affiliated with DoD, DTMO, or any government agency. Verify your entitlements with DTMO, your orders, and your finance office.';

// ── FAQ schema. Questions only; every answer is assembled from explainer
// text already visible on the page, so schema and page never diverge. ──────

export const FAQ_QUESTIONS = {
  bah: 'Do members at {name} receive BAH?',
  oha: 'How does OHA work?',
  change: 'How often do OHA and OCONUS COLA change?',
} as const;

export function oconusFaqs(tokens: { name: string; ohaLocalityCode: string }): { question: string; answer: string }[] {
  const point = (i: number) => `${EXPLAINER_POINTS[i].strong} ${fillTokens(EXPLAINER_POINTS[i].body, tokens)}`;
  return [
    { question: fillTokens(FAQ_QUESTIONS.bah, tokens), answer: `${EXPLAINER_LEAD.strong} ${EXPLAINER_LEAD.body}` },
    { question: FAQ_QUESTIONS.oha, answer: [0, 1, 2, 3].map(point).join(' ') },
    { question: FAQ_QUESTIONS.change, answer: fillTokens(EXPLAINER_POINTS[4].body, tokens) },
  ];
}

// Always-relevant, non-station links for "What to do next" (e.g. /pay, TSP
// projector). Empty until Dan approves each one.
export const OCONUS_APPROVED_NEXT_LINKS: { label: string; href: string }[] = [];

/** Every shared string, for the lints. Labels included; URLs excluded. */
export function allSharedCopy(): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [
    { field: 'HERO_EYEBROW', text: HERO_EYEBROW },
    { field: 'EXPLAINER_HEADING', text: EXPLAINER_HEADING },
    { field: 'EXPLAINER_LEAD.strong', text: EXPLAINER_LEAD.strong },
    { field: 'EXPLAINER_LEAD.body', text: EXPLAINER_LEAD.body },
    { field: 'LES_NOTE', text: LES_NOTE },
    { field: 'UNCHANGED_HEADING', text: UNCHANGED_HEADING },
    { field: 'OCONUS_DISCLAIMER', text: OCONUS_DISCLAIMER },
  ];
  Object.entries(FAQ_QUESTIONS).forEach(([k, q]) => out.push({ field: `FAQ_QUESTIONS.${k}`, text: q }));
  PLAN_STEPS.forEach((s, i) => {
    out.push({ field: `PLAN_STEPS[${i}].title`, text: s.title });
    for (const k of ['sub', 'subPcs', 'subAnchor'] as const) {
      if (k in s) out.push({ field: `PLAN_STEPS[${i}].${k}`, text: (s as Record<string, string>)[k] });
    }
  });
  EXPLAINER_POINTS.forEach((p, i) => {
    out.push({ field: `EXPLAINER_POINTS[${i}].strong`, text: p.strong });
    out.push({ field: `EXPLAINER_POINTS[${i}].body`, text: p.body });
  });
  UNCHANGED_POINTS.forEach((t, i) => out.push({ field: `UNCHANGED_POINTS[${i}]`, text: t }));
  OCONUS_APPROVED_NEXT_LINKS.forEach((l, i) => out.push({ field: `OCONUS_APPROVED_NEXT_LINKS[${i}].label`, text: l.label }));
  ALL_SHARED_LINKS.forEach((l, i) =>
    out.push({ field: `link[${i}].label`, text: l.label }),
  );
  return out;
}
