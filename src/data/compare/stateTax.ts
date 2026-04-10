// State income tax data for duty station comparison
// Approximate effective rates for mid-grade military income ($40,000–$80,000 taxable)
// Note: Many states offer partial or full exemptions for active duty military pay.
// These rates are estimates — see disclaimer on calculator.
// Sources: NCSL 2026 state tax surveys; state revenue department rate tables.

export interface StateTaxInfo {
  name: string;
  rate: number;       // Approximate effective rate on wages (0.0 = no tax)
  noTax: boolean;
}

export const STATE_TAX_DATA: Record<string, StateTaxInfo> = {
  // ── No state income tax ─────────────────────────────────────────────────
  AK: { name: 'Alaska',        rate: 0,      noTax: true },
  FL: { name: 'Florida',       rate: 0,      noTax: true },
  NV: { name: 'Nevada',        rate: 0,      noTax: true },
  NH: { name: 'New Hampshire', rate: 0,      noTax: true }, // no tax on wages
  SD: { name: 'South Dakota',  rate: 0,      noTax: true },
  TN: { name: 'Tennessee',     rate: 0,      noTax: true },
  TX: { name: 'Texas',         rate: 0,      noTax: true },
  WA: { name: 'Washington',    rate: 0,      noTax: true },
  WY: { name: 'Wyoming',       rate: 0,      noTax: true },
  // ── States with income tax — approximate effective rates ────────────────
  AL: { name: 'Alabama',         rate: 0.040,  noTax: false },
  AR: { name: 'Arkansas',        rate: 0.049,  noTax: false },
  AZ: { name: 'Arizona',         rate: 0.025,  noTax: false },
  CA: { name: 'California',      rate: 0.065,  noTax: false },
  CO: { name: 'Colorado',        rate: 0.044,  noTax: false },
  CT: { name: 'Connecticut',     rate: 0.050,  noTax: false },
  DC: { name: 'Wash. D.C.',      rate: 0.060,  noTax: false },
  DE: { name: 'Delaware',        rate: 0.055,  noTax: false },
  GA: { name: 'Georgia',         rate: 0.0549, noTax: false },
  HI: { name: 'Hawaii',          rate: 0.065,  noTax: false },
  IA: { name: 'Iowa',            rate: 0.060,  noTax: false },
  ID: { name: 'Idaho',           rate: 0.058,  noTax: false },
  IL: { name: 'Illinois',        rate: 0.0495, noTax: false },
  IN: { name: 'Indiana',         rate: 0.030,  noTax: false },
  KS: { name: 'Kansas',          rate: 0.046,  noTax: false },
  KY: { name: 'Kentucky',        rate: 0.040,  noTax: false },
  LA: { name: 'Louisiana',       rate: 0.040,  noTax: false },
  MA: { name: 'Massachusetts',   rate: 0.050,  noTax: false },
  MD: { name: 'Maryland',        rate: 0.050,  noTax: false },
  ME: { name: 'Maine',           rate: 0.071,  noTax: false },
  MI: { name: 'Michigan',        rate: 0.0425, noTax: false },
  MN: { name: 'Minnesota',       rate: 0.070,  noTax: false },
  MO: { name: 'Missouri',        rate: 0.048,  noTax: false },
  MS: { name: 'Mississippi',     rate: 0.050,  noTax: false },
  MT: { name: 'Montana',         rate: 0.065,  noTax: false },
  NC: { name: 'North Carolina',  rate: 0.0399, noTax: false },
  ND: { name: 'North Dakota',    rate: 0.020,  noTax: false },
  NE: { name: 'Nebraska',        rate: 0.0584, noTax: false },
  NJ: { name: 'New Jersey',      rate: 0.055,  noTax: false },
  NM: { name: 'New Mexico',      rate: 0.045,  noTax: false },
  NY: { name: 'New York',        rate: 0.055,  noTax: false },
  OH: { name: 'Ohio',            rate: 0.035,  noTax: false },
  OK: { name: 'Oklahoma',        rate: 0.0475, noTax: false },
  OR: { name: 'Oregon',          rate: 0.090,  noTax: false },
  PA: { name: 'Pennsylvania',    rate: 0.0307, noTax: false },
  RI: { name: 'Rhode Island',    rate: 0.0599, noTax: false },
  SC: { name: 'South Carolina',  rate: 0.050,  noTax: false },
  UT: { name: 'Utah',            rate: 0.0465, noTax: false },
  VA: { name: 'Virginia',        rate: 0.0475, noTax: false },
  VT: { name: 'Vermont',         rate: 0.066,  noTax: false },
  WI: { name: 'Wisconsin',       rate: 0.053,  noTax: false },
  WV: { name: 'West Virginia',   rate: 0.065,  noTax: false },
};

/**
 * Map a 5-digit ZIP code to a 2-letter state abbreviation.
 * Uses ZIP prefix ranges — approximate and covers all 50 states + DC.
 * Returns null for territories, APO/FPO, and unrecognized prefixes.
 */
export function getStateFromZip(zipCode: string): string | null {
  const digits = zipCode.replace(/\D/g, '');
  if (digits.length < 5) return null;
  const p = parseInt(digits.slice(0, 3), 10);
  if (isNaN(p)) return null;

  if (p >= 10  && p <= 27)  return 'MA';
  if (p >= 28  && p <= 29)  return 'RI';
  if (p >= 30  && p <= 38)  return 'NH';
  if (p >= 39  && p <= 49)  return 'ME';
  if (p >= 50  && p <= 59)  return 'VT';
  if (p >= 60  && p <= 69)  return 'CT';
  if (p >= 70  && p <= 89)  return 'NJ';
  if (p >= 100 && p <= 149) return 'NY';
  if (p >= 150 && p <= 196) return 'PA';
  if (p >= 197 && p <= 199) return 'DE';
  if (p >= 200 && p <= 205) return 'DC';
  if (p >= 206 && p <= 219) return 'MD';
  if (p >= 220 && p <= 246) return 'VA';
  if (p >= 247 && p <= 268) return 'WV';
  if (p >= 270 && p <= 289) return 'NC';
  if (p >= 290 && p <= 299) return 'SC';
  if (p >= 300 && p <= 319) return 'GA';
  if (p >= 320 && p <= 349) return 'FL';
  if (p >= 350 && p <= 369) return 'AL';
  if (p >= 370 && p <= 385) return 'TN';
  if (p >= 386 && p <= 399) return 'MS';
  if (p >= 400 && p <= 427) return 'KY';
  if (p >= 430 && p <= 459) return 'OH';
  if (p >= 460 && p <= 479) return 'IN';
  if (p >= 480 && p <= 499) return 'MI';
  if (p >= 500 && p <= 528) return 'IA';
  if (p >= 530 && p <= 549) return 'WI';
  if (p >= 550 && p <= 567) return 'MN';
  if (p >= 570 && p <= 577) return 'SD';
  if (p >= 580 && p <= 588) return 'ND';
  if (p >= 590 && p <= 599) return 'MT';
  if (p >= 600 && p <= 629) return 'IL';
  if (p >= 630 && p <= 658) return 'MO';
  if (p >= 660 && p <= 679) return 'KS';
  if (p >= 680 && p <= 693) return 'NE';
  if (p >= 700 && p <= 714) return 'LA';
  if (p >= 716 && p <= 729) return 'AR';
  if (p >= 730 && p <= 749) return 'OK';
  if (p >= 750 && p <= 799) return 'TX';
  if (p >= 800 && p <= 816) return 'CO';
  if (p >= 820 && p <= 831) return 'WY';
  if (p >= 832 && p <= 838) return 'ID';
  if (p >= 840 && p <= 847) return 'UT';
  if (p >= 850 && p <= 865) return 'AZ';
  if (p >= 870 && p <= 884) return 'NM';
  if (p >= 889 && p <= 898) return 'NV';
  if (p >= 900 && p <= 961) return 'CA';
  if (p >= 967 && p <= 968) return 'HI';
  if (p >= 970 && p <= 979) return 'OR';
  if (p >= 980 && p <= 994) return 'WA';
  if (p >= 995 && p <= 999) return 'AK';

  return null;
}
