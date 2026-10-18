import type { OconusStation } from './types';

// One combined page for RAF Lakenheath and RAF Mildenhall: DTMO lists them as
// a single OHA and COLA locality (GB352) and they share one housing office.
// /bah/raf-mildenhall 301-redirects here (next.config.ts).
//
// Every fact verified by Dan against the official source on 2026-10-17.
// Do not add or "improve" facts here without new verification.
const V = '2026-10-17';
const MOS_LAKENHEATH = 'https://installations.militaryonesource.mil/military-installation/raf-lakenheath';
const MOS_MILDENHALL = 'https://installations.militaryonesource.mil/military-installation/raf-mildenhall';
const MOS_HOUSING = 'https://installations.militaryonesource.mil/military-installation/raf-lakenheath/housing/housing';

export const rafLakenheath: OconusStation = {
  slug: 'raf-lakenheath',
  templateVersion: 2,
  published: true,
  name: 'RAF Lakenheath & RAF Mildenhall',
  shortName: 'Lakenheath & Mildenhall',
  titleOverride: "Lakenheath & Mildenhall BAH? It's OHA",
  searchNames: ['RAF Lakenheath', 'RAF Mildenhall'],
  hostCountry: { value: 'United Kingdom', sourceUrl: MOS_LAKENHEATH, verifiedOn: V },
  cityRegion: { value: 'Suffolk, England', sourceUrl: MOS_LAKENHEATH, verifiedOn: V },
  branches: { value: ['Air Force'], sourceUrl: `${MOS_MILDENHALL}/base-essentials/major-units`, verifiedOn: V },
  ohaLocalityCode: {
    value: 'GB352',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: V,
  },
  colaLocality: {
    value: 'United Kingdom – Lakenheath/Mildenhall (Honington, Wattisham, Marham), GB352',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: V,
  },
  localContext: {
    value:
      'RAF Lakenheath and RAF Mildenhall in Suffolk share one military housing office, located at RAF Lakenheath. Homes near the bases are primarily detached, semi-detached, or terraced houses, and the housing office has a team for off-base rental questions.',
    sourceUrl: MOS_HOUSING,
    verifiedOn: V,
  },
  leaseQuestions: [
    {
      value: 'Has the housing office inspected and approved the home, and reviewed the lease, before you sign?',
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: 'Have you registered your council tax exemption with the local council? Off-base residents in the UK generally need to file for the visiting-forces exemption, and council mail is worth opening even when it\'s addressed to "the occupant."',
      sourceUrl: 'https://www.lakenheath.af.mil/News/Article-Display/Article/298959/the-council-tax/',
      verifiedOn: V,
    },
    {
      value: 'What type of heating does the home use, and how are heating fuel and other utilities billed?',
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: "Does a UK TV licence apply to how your household will watch TV? Ask the housing office if you're unsure.",
      sourceUrl: MOS_LAKENHEATH,
      verifiedOn: V,
    },
  ],
  beforeYouMove: [
    {
      lead: 'Driving.',
      value: "To drive in the UK, service members and command-sponsored dependents need a USAFE driving permit (USAFE Form 435), which requires passing a UK Highway Code test. Bring a valid stateside driver's license, and consider studying the Highway Code before you arrive. The UK drives on the left.",
      sourceUrl: 'https://static.e-publishing.af.mil/production/1/usafe-afafrica/publication/usafe-afafricai31-218/usafe-afafricai31-218.pdf',
      verifiedOn: V,
    },
    {
      lead: 'Vehicles.',
      value: 'A shipped or purchased vehicle needs a UK inspection, road tax, and registration through the base Pass and Registration office before it can be driven. Ask your sponsor about these steps before deciding whether to ship, buy, or sell a vehicle.',
      sourceUrl: 'https://www.mildenhall.af.mil/Portals/9/documents/newcomers/Newcomers%20Checklist%202.pdf',
      verifiedOn: V,
    },
    {
      lead: 'Base housing.',
      value: 'Ask the housing office how to apply for military family housing and about waiting lists before committing to an off-base rental.',
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      lead: 'Electrical.',
      value: "The UK uses a different voltage and plug type than the U.S. A plug adapter changes only the plug shape; it does not convert voltage. Check each device's voltage label.",
      sourceUrl: 'https://www.housing.af.mil/Home-depricated/Units/RAF-Mildenhall/Referral-and-Relocation/',
      verifiedOn: V,
      showInSources: false, // retiring housing.af.mil path — linted and link-checked, not listed in Sources
    },
    {
      lead: 'Exchange rate.',
      value: 'Off-base spending is in pounds sterling. OHA and COLA adjust for exchange rates, but everyday off-base costs still move with the pound-dollar rate.',
      sourceUrl: 'https://www.travel.dod.mil/Allowances/Currency-Fluctuations-Exchange-Rates/',
      verifiedOn: V,
    },
  ],
  officialLinks: [
    { label: 'Tri-Base housing office (Military OneSource)', url: MOS_HOUSING },
    { label: 'Military OneSource — RAF Lakenheath', url: MOS_LAKENHEATH },
    { label: 'Military OneSource — RAF Mildenhall', url: MOS_MILDENHALL },
  ],
  relatedStations: ['ramstein-air-base'],
  lastReviewed: '2026-10-17',
};
