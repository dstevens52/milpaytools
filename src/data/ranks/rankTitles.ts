/**
 * Rank names by pay grade and service: the single source for every rank
 * abbreviation and title the site shows (build RL, Nov 2026).
 *
 * Source: docs/sources/rank-abbreviations.md (U.S. Military Rank Insignia,
 * war.gov; verified by Claude Chat 2026-11-25). Never type a rank label or title list anywhere else: the grade
 * dropdown labels (RANK_DISPLAY), the helper line under each grade select and
 * the /pay/[rank] branch titles are all built from this file.
 *
 * Services are always listed in DoD order of precedence: Army · Marine Corps ·
 * Navy · Air Force · Space Force. The Coast Guard uses Navy rank names, so the
 * helper line calls the Navy slot "Navy & Coast Guard" (just "Navy" at W-1 and
 * W-5, which the Coast Guard doesn't have). A service with no rank at a grade
 * (Air Force and Space Force warrant officers) has an empty list.
 *
 * Checked by tests/e2e/rank-titles-unit.spec.ts (the abbreviations against the
 * source table, typed into the test from the source file).
 */

import type { PayGrade, PriorEnlistedOfficerGrade } from '@/types/military';

export const RANK_SERVICES = ['army', 'marineCorps', 'navy', 'airForce', 'spaceForce'] as const;
export type RankService = (typeof RANK_SERVICES)[number];

/** Service names as the helper line shows them. */
export const RANK_SERVICE_NAMES: Record<RankService, string> = {
  army: 'Army',
  marineCorps: 'Marines',
  navy: 'Navy & Coast Guard',
  airForce: 'Air Force',
  spaceForce: 'Space Force',
};

/** Grades where the Coast Guard has no rank (war.gov lists Coast Guard warrants CWO2–CWO4 only). */
const NO_COAST_GUARD: ReadonlySet<PayGrade> = new Set<PayGrade>(['W-1', 'W-5']);

export interface RankName {
  /** Official abbreviation: 'SPC', 'PO3', '2d Lt'. */
  abbr: string;
  /** Full title: 'Specialist', 'Petty Officer Third Class'. */
  title: string;
  /**
   * Only where one service gives two grades the same title (Army Private at
   * E-1 and E-2): the parenthetical the /pay/[rank] pages put after the title
   * ("Private (PV1)"). Not used by the dropdown or the helper line.
   */
  payPageQualifier?: string;
}

/**
 * One grade: each service's rank name(s). Two names = two ranks at the grade (Army E-4
 * SPC or CPL); none = the service has no rank at this grade (Air Force W grades).
 */
export type ServiceRanks = Readonly<Record<RankService, readonly RankName[]>>;

type BaseGrade = Exclude<PayGrade, PriorEnlistedOfficerGrade>;

const n = (abbr: string, title: string, payPageQualifier?: string): RankName =>
  payPageQualifier ? { abbr, title, payPageQualifier } : { abbr, title };

/** Arguments in the fixed service order: Army, Marine Corps, Navy, Air Force, Space Force. */
function grade(
  army: RankName | RankName[],
  marineCorps: RankName | RankName[],
  navy: RankName | RankName[],
  airForce: RankName | RankName[],
  spaceForce: RankName | RankName[],
): ServiceRanks {
  const list = (x: RankName | RankName[]) => (Array.isArray(x) ? x : [x]);
  return {
    army: list(army),
    marineCorps: list(marineCorps),
    navy: list(navy),
    airForce: list(airForce),
    spaceForce: list(spaceForce),
  };
}

const BASE: Record<BaseGrade, ServiceRanks> = {
  // ─── Enlisted ─────────────────────────────────────────────────────────────
  'E-1': grade(
    n('PVT', 'Private', 'PV1'),
    n('Pvt', 'Private'),
    n('SR', 'Seaman Recruit'),
    n('AB', 'Airman Basic'),
    n('Spc1', 'Specialist 1'),
  ),
  'E-2': grade(
    n('PV2', 'Private', 'PV2'),
    n('PFC', 'Private First Class'),
    n('SA', 'Seaman Apprentice'),
    n('Amn', 'Airman'),
    n('Spc2', 'Specialist 2'),
  ),
  'E-3': grade(
    n('PFC', 'Private First Class'),
    n('LCpl', 'Lance Corporal'),
    n('SN', 'Seaman'),
    n('A1C', 'Airman First Class'),
    n('Spc3', 'Specialist 3'),
  ),
  'E-4': grade(
    [n('SPC', 'Specialist'), n('CPL', 'Corporal')],
    n('Cpl', 'Corporal'),
    n('PO3', 'Petty Officer Third Class'),
    n('SrA', 'Senior Airman'),
    n('Spc4', 'Specialist 4'),
  ),
  'E-5': grade(
    n('SGT', 'Sergeant'),
    n('Sgt', 'Sergeant'),
    n('PO2', 'Petty Officer Second Class'),
    n('SSgt', 'Staff Sergeant'),
    n('Sgt', 'Sergeant'),
  ),
  'E-6': grade(
    n('SSG', 'Staff Sergeant'),
    n('SSgt', 'Staff Sergeant'),
    n('PO1', 'Petty Officer First Class'),
    n('TSgt', 'Technical Sergeant'),
    n('TSgt', 'Technical Sergeant'),
  ),
  'E-7': grade(
    n('SFC', 'Sergeant First Class'),
    n('GySgt', 'Gunnery Sergeant'),
    n('CPO', 'Chief Petty Officer'),
    n('MSgt', 'Master Sergeant'),
    n('MSgt', 'Master Sergeant'),
  ),
  'E-8': grade(
    [n('MSG', 'Master Sergeant'), n('1SG', 'First Sergeant')],
    [n('MSgt', 'Master Sergeant'), n('1stSgt', 'First Sergeant')],
    n('SCPO', 'Senior Chief Petty Officer'),
    n('SMSgt', 'Senior Master Sergeant'),
    n('SMSgt', 'Senior Master Sergeant'),
  ),
  'E-9': grade(
    [n('SGM', 'Sergeant Major'), n('CSM', 'Command Sergeant Major')],
    [n('MGySgt', 'Master Gunnery Sergeant'), n('SgtMaj', 'Sergeant Major')],
    n('MCPO', 'Master Chief Petty Officer'),
    n('CMSgt', 'Chief Master Sergeant'),
    n('CMSgt', 'Chief Master Sergeant'),
  ),

  // ─── Warrant officers (war.gov: no Air Force or Space Force warrant officers) ──
  'W-1': grade(n('WO1', 'Warrant Officer 1'), n('WO', 'Warrant Officer'), n('WO1', 'Warrant Officer 1'), [], []),
  'W-2': grade(n('CW2', 'Chief Warrant Officer 2'), n('CWO2', 'Chief Warrant Officer 2'), n('CWO2', 'Chief Warrant Officer 2'), [], []),
  'W-3': grade(n('CW3', 'Chief Warrant Officer 3'), n('CWO3', 'Chief Warrant Officer 3'), n('CWO3', 'Chief Warrant Officer 3'), [], []),
  'W-4': grade(n('CW4', 'Chief Warrant Officer 4'), n('CWO4', 'Chief Warrant Officer 4'), n('CWO4', 'Chief Warrant Officer 4'), [], []),
  'W-5': grade(n('CW5', 'Chief Warrant Officer 5'), n('CWO5', 'Chief Warrant Officer 5'), n('CWO5', 'Chief Warrant Officer 5'), [], []),

  // ─── Officers ─────────────────────────────────────────────────────────────
  'O-1': grade(
    n('2LT', 'Second Lieutenant'),
    n('2ndLt', 'Second Lieutenant'),
    n('ENS', 'Ensign'),
    n('2d Lt', 'Second Lieutenant'),
    n('2d Lt', 'Second Lieutenant'),
  ),
  'O-2': grade(
    n('1LT', 'First Lieutenant'),
    n('1stLt', 'First Lieutenant'),
    n('LTJG', 'Lieutenant (Junior Grade)'),
    n('1st Lt', 'First Lieutenant'),
    n('1st Lt', 'First Lieutenant'),
  ),
  'O-3': grade(
    n('CPT', 'Captain'),
    n('Capt', 'Captain'),
    n('LT', 'Lieutenant'),
    n('Capt', 'Captain'),
    n('Capt', 'Captain'),
  ),
  'O-4': grade(
    n('MAJ', 'Major'),
    n('Maj', 'Major'),
    n('LCDR', 'Lieutenant Commander'),
    n('Maj', 'Major'),
    n('Maj', 'Major'),
  ),
  'O-5': grade(
    n('LTC', 'Lieutenant Colonel'),
    n('LtCol', 'Lieutenant Colonel'),
    n('CDR', 'Commander'),
    n('Lt Col', 'Lieutenant Colonel'),
    n('Lt Col', 'Lieutenant Colonel'),
  ),
  'O-6': grade(
    n('COL', 'Colonel'),
    n('Col', 'Colonel'),
    n('CAPT', 'Captain'),
    n('Col', 'Colonel'),
    n('Col', 'Colonel'),
  ),
  // O-7 to O-10 full titles: war.gov wording (Navy "Rear Admiral Lower/Upper Half").
  'O-7': grade(
    n('BG', 'Brigadier General'),
    n('BGen', 'Brigadier General'),
    n('RDML', 'Rear Admiral Lower Half'),
    n('Brig Gen', 'Brigadier General'),
    n('Brig Gen', 'Brigadier General'),
  ),
  'O-8': grade(
    n('MG', 'Major General'),
    n('MajGen', 'Major General'),
    n('RADM', 'Rear Admiral Upper Half'),
    n('Maj Gen', 'Major General'),
    n('Maj Gen', 'Major General'),
  ),
  'O-9': grade(
    n('LTG', 'Lieutenant General'),
    n('LtGen', 'Lieutenant General'),
    n('VADM', 'Vice Admiral'),
    n('Lt Gen', 'Lieutenant General'),
    n('Lt Gen', 'Lieutenant General'),
  ),
  'O-10': grade(
    n('GEN', 'General'),
    n('Gen', 'General'),
    n('ADM', 'Admiral'),
    n('Gen', 'General'),
    n('Gen', 'General'),
  ),
};

/** Prior-enlisted officer grades: the same ranks as their O grade, paid on a separate table. */
export const PRIOR_ENLISTED_BASE: Record<PriorEnlistedOfficerGrade, BaseGrade> = {
  'O-1E': 'O-1',
  'O-2E': 'O-2',
  'O-3E': 'O-3',
};

const PRIOR_ENLISTED_SUFFIX = ' — prior enlisted';

function isPriorEnlisted(g: PayGrade): g is PriorEnlistedOfficerGrade {
  return g in PRIOR_ENLISTED_BASE;
}

/** Every grade's rank names by service (-E grades share their O grade's names). */
export const RANK_TITLES: Readonly<Record<PayGrade, ServiceRanks>> = {
  ...BASE,
  'O-1E': BASE['O-1'],
  'O-2E': BASE['O-2'],
  'O-3E': BASE['O-3'],
};

const abbrs = (names: readonly RankName[]) => names.map((x) => x.abbr).join('/');

/** Services with no rank at this grade (warrant grades: Air Force, Space Force). */
const servicesWithout = (ranks: ServiceRanks) => RANK_SERVICES.filter((s) => ranks[s].length === 0);

/**
 * Dropdown label: "E-4 (SPC/CPL · Cpl · PO3 · SrA · Spc4)". All five services in the
 * fixed order so the slots never move. Where a service has no rank at the grade
 * (warrant grades), identical abbreviations merge instead: "W-2 (CW2 · CWO2)".
 */
export function rankLabel(g: PayGrade): string {
  const ranks = RANK_TITLES[g];
  const slots = RANK_SERVICES.filter((s) => ranks[s].length > 0).map((s) => abbrs(ranks[s]));
  const inner = servicesWithout(ranks).length > 0 ? [...new Set(slots)].join(' · ') : slots.join(' · ');
  return `${g} (${inner}${isPriorEnlisted(g) ? PRIOR_ENLISTED_SUFFIX : ''})`;
}

/**
 * Helper line under a grade select: "Army SGM/CSM · Marines MGySgt/SgtMaj · Navy & Coast
 * Guard MCPO · Air Force CMSgt · Space Force CMSgt". Warrant grades end with
 * "no Air Force or Space Force warrant officers".
 */
export function rankHelperText(g: PayGrade): string {
  const ranks = RANK_TITLES[g];
  const name = (s: RankService) => (s === 'navy' && NO_COAST_GUARD.has(g) ? 'Navy' : RANK_SERVICE_NAMES[s]);
  const parts = RANK_SERVICES.filter((s) => ranks[s].length > 0).map((s) => `${name(s)} ${abbrs(ranks[s])}`);
  const without = servicesWithout(ranks);
  if (without.length > 0) parts.push(`no ${without.map(name).join(' or ')} warrant officers`);
  return `${parts.join(' · ')}${isPriorEnlisted(g) ? PRIOR_ENLISTED_SUFFIX : ''}`;
}

/** Dropdown labels for every grade. RANK_DISPLAY in src/types/military.ts is this object. */
export const RANK_LABELS: Readonly<Record<PayGrade, string>> = Object.fromEntries(
  (Object.keys(RANK_TITLES) as PayGrade[]).map((g) => [g, rankLabel(g)]),
) as Record<PayGrade, string>;

/** The /pay/[rank] page's branch titles ("Specialist or Corporal", "Private (PV1)"). */
export interface PayPageBranchTitles {
  army: string;
  marines: string;
  airForce: string;
  navy: string;
  spaceForce: string;
}

export function payPageBranchTitles(g: PayGrade): PayPageBranchTitles {
  const ranks = RANK_TITLES[g];
  const join = (names: readonly RankName[]) =>
    names
      .map((x) => (x.payPageQualifier ? `${x.title} (${x.payPageQualifier})` : x.title))
      .join(' or ');
  return {
    army: join(ranks.army),
    marines: join(ranks.marineCorps),
    airForce: join(ranks.airForce),
    navy: join(ranks.navy),
    spaceForce: join(ranks.spaceForce),
  };
}
