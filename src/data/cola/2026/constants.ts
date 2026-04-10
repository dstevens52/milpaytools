// CONUS COLA qualifying areas and approximate rate data for 2026
// Source: Defense Travel Management Office (DTMO) — https://www.travel.dod.mil/
// IMPORTANT: These are approximate rates for informational purposes only.
// Always verify your specific rate at https://www.travel.dod.mil/Pay-Entitlements/CONUS-COLA/
//
// CONUS COLA (Continental U.S. Cost of Living Allowance) supplements pay for members
// stationed in high-cost CONUS areas where the cost of living substantially exceeds
// the national average. Unlike BAH, CONUS COLA is taxable income.
//
// ── 2026 ELIGIBILITY CHANGES ─────────────────────────────────────────────────
// Per DoD/DTMO announcements effective FY2026:
//
// AREAS THAT LOST ELIGIBILITY IN 2026 (no longer qualify):
//   - Greater Boston, MA (removed from data below)
//   - Cape Cod / South Massachusetts, MA (removed from data below)
//   - San Luis Obispo, CA (was not in this dataset)
//   - San Bernardino, CA (was not in this dataset)
//   - Humboldt County, CA (was not in this dataset)
//   - Riverside, CA (was not in this dataset)
//   - Bridgeport, CA (was not in this dataset)
//   - 2 additional areas per DTMO — verify at DTMO for complete list
//
// AREAS THAT GAINED ELIGIBILITY IN 2026:
//   - Seattle / Puget Sound, WA (new — 5% rate)
//
// RATE CHANGES IN 2026:
//   - New York City: rate reduced from 8% to 4% (tier downgraded from high → moderate-high)
//
// DTMO updates eligibility annually. Always verify your specific station at DTMO.

export const DATA_YEAR = '2026';

export type ColaTier = 'high' | 'moderate-high' | 'moderate';

export interface ColaArea {
  id: string;
  name: string;
  state: string;
  tier: ColaTier;
  zipPrefixes: string[]; // First 3 digits of ZIP code
  notes?: string;
}

// Grade group categories for approximate rate lookup
export type GradeGroup =
  | 'E1-E4'
  | 'E5-E9'
  | 'W1-W5'
  | 'O1-O3'
  | 'O4-O6'
  | 'O7-O10';

// Approximate monthly COLA by tier × grade group × dependency status
// These are estimates. Actual amounts vary and are published by DTMO.
// Format: [withoutDependents, withDependents]
export const COLA_RATE_ESTIMATES: Record<ColaTier, Record<GradeGroup, [number, number]>> = {
  'high': {
    'E1-E4':   [200, 270],
    'E5-E9':   [310, 430],
    'W1-W5':   [340, 460],
    'O1-O3':   [310, 430],
    'O4-O6':   [380, 520],
    'O7-O10':  [440, 610],
  },
  'moderate-high': {
    'E1-E4':   [120, 170],
    'E5-E9':   [200, 270],
    'W1-W5':   [220, 300],
    'O1-O3':   [200, 270],
    'O4-O6':   [240, 330],
    'O7-O10':  [280, 390],
  },
  'moderate': {
    'E1-E4':   [60,  90],
    'E5-E9':   [100, 140],
    'W1-W5':   [110, 150],
    'O1-O3':   [100, 140],
    'O4-O6':   [120, 165],
    'O7-O10':  [140, 195],
  },
};

// CONUS COLA qualifying areas by ZIP prefix — 2026 eligibility
// NOTE: Boston/MA areas and several CA areas lost eligibility effective FY2026.
// Seattle/WA gained eligibility. NYC rate reduced from 8% to 4%.
export const COLA_AREAS: ColaArea[] = [
  // California — San Francisco Bay Area / Silicon Valley
  {
    id: 'ca-sf-bay',
    name: 'San Francisco Bay Area',
    state: 'CA',
    tier: 'high',
    zipPrefixes: ['940', '941', '942', '943', '944', '945', '946', '947', '948', '949', '950', '951'],
    notes: 'Includes San Francisco, Oakland, Berkeley, San Jose, and surrounding Bay Area cities.',
  },
  // California — Monterey Peninsula
  {
    id: 'ca-monterey',
    name: 'Monterey Peninsula',
    state: 'CA',
    tier: 'high',
    zipPrefixes: ['939'],
    notes: 'Home to the Naval Postgraduate School (NPS) and DLI. One of the highest-cost small military markets in CONUS.',
  },
  // California — Los Angeles Metro
  {
    id: 'ca-los-angeles',
    name: 'Los Angeles Metro',
    state: 'CA',
    tier: 'moderate-high',
    zipPrefixes: ['900', '901', '902', '903', '904', '905', '906', '907', '908', '910', '911', '912', '913'],
    notes: 'Includes Los Angeles, Santa Monica, West Hollywood, Burbank, and surrounding metro.',
  },
  // California — Orange County
  {
    id: 'ca-orange-county',
    name: 'Orange County',
    state: 'CA',
    tier: 'moderate-high',
    zipPrefixes: ['926', '927', '928'],
    notes: 'Includes Anaheim, Santa Ana, Irvine, and surrounding area.',
  },
  // California — San Diego
  {
    id: 'ca-san-diego',
    name: 'San Diego',
    state: 'CA',
    tier: 'moderate-high',
    zipPrefixes: ['919', '920', '921', '922'],
    notes: 'Home to Naval Station San Diego, MCRD, and multiple Navy/Marine installations.',
  },
  // California — Ventura County
  {
    id: 'ca-ventura',
    name: 'Ventura County',
    state: 'CA',
    tier: 'moderate',
    zipPrefixes: ['930'],
    notes: 'Includes Oxnard, Camarillo, and surrounding area near Naval Base Ventura County.',
  },
  // California — Santa Barbara / Vandenberg
  {
    id: 'ca-santa-barbara',
    name: 'Santa Barbara / Vandenberg',
    state: 'CA',
    tier: 'moderate',
    zipPrefixes: ['931', '932'],
    notes: 'Includes Santa Barbara and Lompoc (Vandenberg Space Force Base area).',
  },
  // Washington — Seattle / Puget Sound (NEW in 2026)
  {
    id: 'wa-seattle',
    name: 'Seattle / Puget Sound',
    state: 'WA',
    tier: 'moderate',
    zipPrefixes: ['980', '981', '982'],
    notes: 'NEW in 2026 — Seattle and surrounding Puget Sound metro area. Approximate 5% COLA rate per DTMO. Verify your specific station at DTMO.',
  },
  // New York — New York City (rate reduced from 8% to 4% in 2026)
  {
    id: 'ny-nyc',
    name: 'New York City',
    state: 'NY',
    tier: 'moderate-high', // Downgraded from 'high' — NYC rate reduced 8% → 4% in FY2026
    zipPrefixes: ['100', '101', '102', '103', '104'],
    notes: 'Includes all five boroughs. Rate reduced from 8% to 4% effective FY2026. Verify at DTMO.',
  },
  // New York — Long Island
  {
    id: 'ny-long-island',
    name: 'Long Island',
    state: 'NY',
    tier: 'moderate-high',
    zipPrefixes: ['110', '111', '112', '113', '114', '115', '116', '117', '118', '119'],
    notes: 'Includes Nassau and Suffolk counties.',
  },
  // New York — Westchester / Hudson Valley
  {
    id: 'ny-westchester',
    name: 'Westchester & Lower Hudson Valley',
    state: 'NY',
    tier: 'moderate-high',
    zipPrefixes: ['105', '106', '107', '108', '109'],
    notes: 'Includes White Plains, Yonkers, and the lower Hudson Valley north of NYC.',
  },
  // Connecticut — Fairfield County (Stamford/Greenwich area)
  {
    id: 'ct-fairfield',
    name: 'Fairfield County',
    state: 'CT',
    tier: 'moderate-high',
    zipPrefixes: ['066', '067', '068', '069'],
    notes: 'Includes Stamford, Greenwich, and Norwalk.',
  },
  // Connecticut — New Haven area
  {
    id: 'ct-new-haven',
    name: 'New Haven Area',
    state: 'CT',
    tier: 'moderate',
    zipPrefixes: ['064', '065'],
    notes: 'Includes New Haven, Milford, and surrounding area.',
  },
  // Connecticut — New London / Groton (Submarine Base)
  {
    id: 'ct-groton',
    name: 'New London / Groton',
    state: 'CT',
    tier: 'moderate',
    zipPrefixes: ['063'],
    notes: 'Home to Naval Submarine Base New London.',
  },
  // New Jersey — Northern NJ (NY metro area)
  {
    id: 'nj-northern',
    name: 'Northern New Jersey',
    state: 'NJ',
    tier: 'moderate-high',
    zipPrefixes: ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079'],
    notes: 'Includes Newark, Jersey City, Hoboken, and metro communities serving the NYC military market.',
  },
  // Virginia / DC — National Capital Region
  {
    id: 'dc-ncr',
    name: 'National Capital Region',
    state: 'DC/VA/MD',
    tier: 'moderate',
    zipPrefixes: ['200', '201', '202', '203', '204', '205', '220', '221', '222', '223'],
    notes: 'Includes Washington D.C. and Northern Virginia. Verify at DTMO — NCR eligibility varies by ZIP and changes annually.',
  },
  // Rhode Island — Newport area
  {
    id: 'ri-newport',
    name: 'Newport Area',
    state: 'RI',
    tier: 'moderate',
    zipPrefixes: ['028', '029'],
    notes: 'Includes Newport (Naval Station Newport) and surrounding area.',
  },
];

// Build a lookup map for O(1) ZIP prefix → area resolution
export const ZIP_PREFIX_MAP: Map<string, ColaArea> = new Map(
  COLA_AREAS.flatMap((area) => area.zipPrefixes.map((prefix) => [prefix, area]))
);

// Human-readable tier labels
export const TIER_LABELS: Record<ColaTier, string> = {
  'high': 'High-cost area',
  'moderate-high': 'Moderate-high-cost area',
  'moderate': 'Moderate-cost area',
};

// Annual amount (monthly × 12)
export function annualColaEstimate(monthly: number): number {
  return monthly * 12;
}
