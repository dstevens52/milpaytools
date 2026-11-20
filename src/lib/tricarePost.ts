/**
 * Everything the TRICARE costs post (/blog/tricare-costs-2026-vs-civilian)
 * computes: figures by path, 2026 → 2027 changes, the cost tables, the Open
 * Season wording and the post's FAQ answers. All values come from the TRICARE
 * year files (src/data/tricare/<year>/costs.ts, 2027/openSeason.ts); nothing
 * here is typed by hand.
 */

import { TRICARE_COSTS_2026 } from '@/data/tricare/2026/costs';
import { TRICARE_COSTS_2027 } from '@/data/tricare/2027/costs';
import { currentTricareCosts } from '@/data/tricare/current';
import {
  OFFICIAL_COMPARISON_2027,
  OPEN_SEASON_2026,
  OPEN_SEASON_SOURCE,
  type ComparisonCell,
} from '@/data/tricare/2027/openSeason';

/** 'current' = TRICARE_COST_YEAR (what calculators show; 2026 until Jan. 1, 2027). */
export type PostYear = '2026' | '2027' | 'current';

const YEARS = { '2026': TRICARE_COSTS_2026, '2027': TRICARE_COSTS_2027 } as const;
const yearFile = (y: PostYear) => (y === 'current' ? currentTricareCosts : YEARS[y]);

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Dollars and cents, "$1,233.96". */
export const usdCents = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Whole dollars, "$4,802". */
export const usdWhole = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
/** Cents only when the value has them. */
export const usdAuto = (n: number) => (Number.isInteger(n) ? usdWhole(n) : usdCents(n));

/** Two-decimal rounding that survives float noise (0.1 + 0.2). */
const r2 = (n: number) => Math.round(n * 100 + (n >= 0 ? 1e-7 : -1e-7)) / 100;

export type Format = 'cents' | 'dollars' | 'auto';
export function formatUsd(n: number, f: Format = 'auto'): string {
  return f === 'cents' ? usdCents(n) : f === 'dollars' ? usdWhole(n) : usdAuto(n);
}

/** Percent change from a to b, one decimal: 7.263 → "7.3%". */
export const pctChange = (a: number, b: number) => ((b - a) / a) * 100;
export const fmtPct = (p: number) => `${p.toFixed(1)}%`;

// AP-style dates: "Nov. 9", "Dec. 8, 2026", "Jan. 1, 2027".
const AP_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}
export function apDate(iso: string, withYear = true): string {
  const { y, m, d } = parts(iso);
  return `${AP_MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ''}`;
}
/** "Nov. 9–Dec. 8, 2026" (same year), else both years. */
export function apRange(startIso: string, endIso: string): string {
  const sameYear = parts(startIso).y === parts(endIso).y;
  return `${apDate(startIso, !sameYear)}–${apDate(endIso)}`;
}

// ─── Figures by path ─────────────────────────────────────────────────────────

function walk(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), root);
}

/**
 * One number by dot path. `comparison.<field>` reads the official 2027
 * comparison data (OS27); anything else reads that year's cost file.
 * Throws on a bad path, so a typo fails the build instead of rendering blank.
 */
export function tricareValue(year: PostYear, path: string): number {
  const v = path.startsWith('comparison.')
    ? walk(OFFICIAL_COMPARISON_2027, path.slice('comparison.'.length))
    : walk(yearFile(year), path);
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`TRICARE figure: no number at ${year} "${path}"`);
  return v;
}

export function tricareDate(which: 'openSeason' | 'openSeasonEnd' | 'effective2027' | 'fedvip' | 'pharmacyThrough'): string {
  switch (which) {
    case 'openSeason':
      return apRange(OPEN_SEASON_2026.start, OPEN_SEASON_2026.end);
    case 'openSeasonEnd':
      return apDate(OPEN_SEASON_2026.end);
    case 'effective2027':
      return apDate(OPEN_SEASON_2026.changesEffective);
    case 'fedvip':
      return apRange(OPEN_SEASON_2026.fedvipStart, OPEN_SEASON_2026.fedvipEnd);
    case 'pharmacyThrough':
      return apDate(TRICARE_COSTS_2027.pharmacyCopaysUnchangedThrough);
  }
}

// ─── 2026 → 2027 changes ─────────────────────────────────────────────────────

export interface Change {
  from: number;
  to: number;
  dollars: number;
  pct: number;
}

export function tricareChange(path: string): Change {
  const from = tricareValue('2026', path);
  const to = tricareValue('2027', path);
  return { from, to, dollars: r2(to - from), pct: from === 0 ? 0 : pctChange(from, to) };
}

/** "+$20.82", "+$1", "No change". */
export function fmtChangeDollars(c: Change, f: Format = 'auto'): string {
  if (c.dollars === 0) return 'No change';
  return `${c.dollars > 0 ? '+' : '−'}${formatUsd(Math.abs(c.dollars), f)}`;
}
export function fmtChangePct(c: Change): string {
  if (c.dollars === 0) return 'No change';
  return `${c.pct > 0 ? '+' : '−'}${fmtPct(Math.abs(c.pct))}`;
}

const IND_FAM = ['individual', 'family'] as const;
const RETIREE_PLANS = ['primeA', 'primeB', 'selectA', 'selectB'] as const;
const VISITS = ['primary', 'specialty', 'er', 'urgent'] as const;

/** Paths whose 2026 → 2027 change ranges are quoted in the post. */
export const CHANGE_SETS = {
  retireeFees: RETIREE_PLANS.flatMap((p) => IND_FAM.map((k) => `retiree.${p}.enrollmentFee.${k}`)),
  copays: [
    ...RETIREE_PLANS.flatMap((p) => VISITS.map((v) => `retiree.${p}.copays.${v}`)),
    ...(['selectA', 'selectB'] as const).flatMap((p) => VISITS.map((v) => `adfm.${p}.copays.${v}`)),
  ],
} as const;

/** "3.6–3.7%" (pct) or "$0–$5" (dollars) across a change set. */
export function changeRange(set: keyof typeof CHANGE_SETS, unit: 'pct' | 'dollars'): string {
  const changes = CHANGE_SETS[set].map(tricareChange);
  if (unit === 'pct') {
    const ps = changes.map((c) => Number(c.pct.toFixed(1)));
    const lo = Math.min(...ps);
    const hi = Math.max(...ps);
    return lo === hi ? fmtPct(lo) : `${lo.toFixed(1)}–${fmtPct(hi)}`;
  }
  const ds = changes.map((c) => c.dollars);
  const lo = Math.min(...ds);
  const hi = Math.max(...ds);
  return lo === hi ? usdAuto(lo) : `${usdAuto(lo)}–${usdAuto(hi)}`;
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export interface PostTable {
  head: string[];
  rows: string[][];
  footnotes?: string[];
  source?: { title: string; url: string };
}

type RowSpec = [label: string, path: string];

/** A 2026 | 2027 | Change table. Fees and premiums show cents and a % change; the rest whole dollars. */
function yearTable(firstCol: string, specs: RowSpec[], f: Format, withPct: boolean): PostTable {
  return {
    head: [firstCol, '2026', '2027', 'Change'],
    rows: specs.map(([label, path]) => {
      const c = tricareChange(path);
      const change =
        withPct && c.dollars !== 0 ? `${fmtChangeDollars(c, f)} (${fmtChangePct(c)})` : fmtChangeDollars(c, f);
      return [label, formatUsd(c.from, f), formatUsd(c.to, f), change];
    }),
  };
}

const PLAN_LABEL = {
  primeA: 'Prime, Group A',
  primeB: 'Prime, Group B',
  selectA: 'Select, Group A',
  selectB: 'Select, Group B',
} as const;
const VISIT_LABEL = { primary: 'primary care', specialty: 'specialty care', er: 'emergency room', urgent: 'urgent care' } as const;

export const TABLE_NAMES = [
  'retireeFees',
  'retireeDeductiblesCaps',
  'retireeCopays',
  'adfmSelect',
  'premiumPlans',
  'officialComparison2027',
] as const;
export type TableName = (typeof TABLE_NAMES)[number];

function comparisonCell(c: ComparisonCell): string {
  return typeof c === 'number' ? usdAuto(c) : c;
}

export function tricareTable(name: TableName): PostTable {
  switch (name) {
    case 'retireeFees':
      return yearTable(
        'Annual enrollment fee',
        RETIREE_PLANS.flatMap((p) =>
          IND_FAM.map((k): RowSpec => [`${PLAN_LABEL[p]}, ${k}`, `retiree.${p}.enrollmentFee.${k}`]),
        ),
        'cents',
        true,
      );
    case 'retireeDeductiblesCaps':
      return yearTable(
        'Deductible or cap (per year)',
        [
          ['Prime (Group A and B) deductible', 'retiree.primeA.deductible.individual'],
          ['Select, Group A deductible, individual', 'retiree.selectA.deductible.individual'],
          ['Select, Group A deductible, family', 'retiree.selectA.deductible.family'],
          ['Select, Group B deductible, individual (network)', 'retiree.selectB.deductible.individual'],
          ['Select, Group B deductible, family (network)', 'retiree.selectB.deductible.family'],
          ['Select, Group B deductible, individual (non-network)', 'retiree.selectB.nonNetworkDeductible.individual'],
          ['Select, Group B deductible, family (non-network)', 'retiree.selectB.nonNetworkDeductible.family'],
          ['Catastrophic cap, Prime Group A (per family)', 'retiree.primeA.catastrophicCap'],
          ['Catastrophic cap, Prime Group B', 'retiree.primeB.catastrophicCap'],
          ['Catastrophic cap, Select Group A', 'retiree.selectA.catastrophicCap'],
          ['Catastrophic cap, Select Group B', 'retiree.selectB.catastrophicCap'],
        ],
        'dollars',
        false,
      );
    case 'retireeCopays':
      return yearTable(
        'Network copay (per visit)',
        [
          ...VISITS.map((v): RowSpec => [`Prime (Group A and B), ${VISIT_LABEL[v]}`, `retiree.primeA.copays.${v}`]),
          ...VISITS.map((v): RowSpec => [`Select, Group A, ${VISIT_LABEL[v]}`, `retiree.selectA.copays.${v}`]),
          ...VISITS.map((v): RowSpec => [`Select, Group B, ${VISIT_LABEL[v]}`, `retiree.selectB.copays.${v}`]),
          ['Preventive visit (all plans)', 'retiree.primeA.copays.preventive'],
        ],
        'dollars',
        false,
      );
    case 'adfmSelect':
      return yearTable(
        'TRICARE Select, active duty family members',
        [
          ...(['selectA', 'selectB'] as const).flatMap((p) => {
            const g = p === 'selectA' ? 'Group A' : 'Group B';
            return [
              [`${g} deductible, E-1–E-4 sponsor, individual`, `adfm.${p}.deductible.e1ToE4.individual`],
              [`${g} deductible, E-1–E-4 sponsor, family`, `adfm.${p}.deductible.e1ToE4.family`],
              [`${g} deductible, E-5 and above, individual`, `adfm.${p}.deductible.e5AndAbove.individual`],
              [`${g} deductible, E-5 and above, family`, `adfm.${p}.deductible.e5AndAbove.family`],
              [`${g} catastrophic cap (Prime and Select)`, `adfm.${p}.catastrophicCap`],
              ...VISITS.map((v): RowSpec => [`${g} network copay, ${VISIT_LABEL[v]}`, `adfm.${p}.copays.${v}`]),
            ] as RowSpec[];
          }),
        ],
        'dollars',
        false,
      );
    case 'premiumPlans':
      return yearTable(
        'Monthly premium',
        [
          ['TRICARE Reserve Select, member only', 'premiumPlans.trsMember'],
          ['TRICARE Reserve Select, member and family', 'premiumPlans.trsFamily'],
          ['TRICARE Retired Reserve, member only', 'premiumPlans.trrMember'],
          ['TRICARE Retired Reserve, member and family', 'premiumPlans.trrFamily'],
          ['TRICARE Young Adult-Prime', 'premiumPlans.tyaPrime'],
          ['TRICARE Young Adult-Select', 'premiumPlans.tyaSelect'],
        ],
        'cents',
        true,
      );
    case 'officialComparison2027':
      return {
        head: ['Cost type', ...OFFICIAL_COMPARISON_2027.columns],
        rows: OFFICIAL_COMPARISON_2027.rows.map((r) => [r.label, ...r.cells.map(comparisonCell)]),
        footnotes: [OFFICIAL_COMPARISON_2027.intro, ...OFFICIAL_COMPARISON_2027.footnotes],
        source: OPEN_SEASON_SOURCE,
      };
  }
}

// ─── Open Season wording ─────────────────────────────────────────────────────

export type OpenSeasonStatus = 'open' | 'closed';

/** The Open Season section's paragraphs (plain text) for either status. */
export function openSeasonParagraphs(status: OpenSeasonStatus): string[] {
  const window = tricareDate('openSeason');
  const effective = tricareDate('effective2027');
  const fedvip = tricareDate('fedvip');
  const qle =
    'Outside Open Season, changing a TRICARE Prime or TRICARE Select enrollment needs a TRICARE Qualifying Life Event.';
  if (status === 'open') {
    return [
      `TRICARE Open Season runs ${window}. Enrollment changes made during Open Season take effect ${effective}.`,
      'To keep your current TRICARE Prime or TRICARE Select plan, no action is needed: coverage continues in 2027 while you stay eligible.',
      `The Federal Benefits Open Season for dental and vision coverage (FEDVIP) runs ${fedvip}.`,
      qle,
    ];
  }
  return [
    `TRICARE Open Season for 2027 coverage ran ${window} and ended ${tricareDate('openSeasonEnd')}. Changes made during it take effect ${effective}.`,
    'If you didn’t make a change, your current TRICARE Prime or TRICARE Select plan continues in 2027 while you stay eligible.',
    `The Federal Benefits Open Season for dental and vision coverage (FEDVIP) ran ${fedvip}.`,
    qle,
  ];
}

// ─── FAQ (schema + visible on the page) ──────────────────────────────────────

export function tricarePostFaqs(status: OpenSeasonStatus): { question: string; answer: string }[] {
  const t26 = TRICARE_COSTS_2026.premiumPlans;
  const t27 = TRICARE_COSTS_2027.premiumPlans;
  const b = TRICARE_COSTS_2027.adfm.selectB;
  const window = tricareDate('openSeason');
  const effective = tricareDate('effective2027');
  const openSeasonAnswer =
    status === 'open'
      ? `TRICARE Open Season runs ${window}, and changes made during it take effect ${effective}. To keep your current TRICARE Prime or TRICARE Select plan, no action is needed. The Federal Benefits Open Season for dental and vision (FEDVIP) runs ${tricareDate('fedvip')}. Outside Open Season, changing a Prime or Select enrollment needs a TRICARE Qualifying Life Event.`
      : `TRICARE Open Season for 2027 coverage ran ${window} and has ended; changes made during it take effect ${effective}. Current plans continue without any action. Outside Open Season, changing a Prime or Select enrollment needs a TRICARE Qualifying Life Event.`;
  return [
    { question: 'When is TRICARE Open Season for 2027 coverage?', answer: openSeasonAnswer },
    {
      question: 'How much is TRICARE Reserve Select in 2027?',
      answer: `TRICARE Reserve Select premiums in 2027 are ${usdCents(t27.trsMember)} a month for member-only coverage and ${usdCents(t27.trsFamily)} a month for member and family, up from ${usdCents(t26.trsMember)} and ${usdCents(t26.trsFamily)} in 2026. TRS follows TRICARE Select Group B cost-sharing: in 2027 the deductible is ${usdWhole(b.deductible.e1ToE4.individual)} individual / ${usdWhole(b.deductible.e1ToE4.family)} family for sponsors in pay grades E-1–E-4 and ${usdWhole(b.deductible.e5AndAbove.individual)} / ${usdWhole(b.deductible.e5AndAbove.family)} for E-5 and above, and the catastrophic cap is ${usdWhole(b.catastrophicCap)} per family.`,
    },
    {
      question: 'Did TRICARE pharmacy copays change for 2027?',
      answer: `No. TRICARE pharmacy copays were set by the National Defense Authorization Act for Fiscal Year 2018, and TRICARE says the current copays stay in effect through ${tricareDate('pharmacyThrough')}.`,
    },
  ];
}
