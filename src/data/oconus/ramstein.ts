import type { OconusStation } from './types';

// DRAFT — Dan verifies every field before `published: true`.
// Converted from the legacy page with all numbers, vendor names, and directive
// phrasing removed. Do not add or "improve" facts here without verification.
export const ramstein: OconusStation = {
  slug: 'ramstein-air-base',
  templateVersion: 2,
  published: false, // flip after Dan verifies
  name: 'Ramstein Air Base',
  shortName: 'Ramstein AB',
  hostCountry: { value: 'Germany', sourceUrl: 'TODO-DAN', verifiedOn: null },
  cityRegion: { value: 'Ramstein-Miesenbach, Rhineland-Palatinate', sourceUrl: 'TODO-DAN', verifiedOn: null },
  branches: { value: ['Air Force', 'Army (Kaiserslautern Military Community)'], sourceUrl: 'TODO-DAN', verifiedOn: null },
  ohaLocalityCode: { value: 'DE700', sourceUrl: 'TODO-DAN (DTMO OHA lookup)', verifiedOn: null },
  colaLocality: { value: 'TODO-DAN (DTMO COLA locality name)', sourceUrl: 'TODO-DAN', verifiedOn: null },
  coLocated: { value: ['TODO-DAN: list KMC Army installations from official source'], sourceUrl: 'TODO-DAN', verifiedOn: null },
  localContext: {
    value:
      'Ramstein is part of the Kaiserslautern Military Community (KMC), a large American community with a developed off-base rental market. Many local landlords are experienced with SOFA tenants, and the installation housing office tracks current local rental conditions.',
    sourceUrl: 'TODO-DAN',
    verifiedOn: null,
  },
  leaseQuestions: [
    { value: 'What type of heating does the home use — gas, oil, or heat pump? If oil, who pays for the seasonal fuel fill, and how is it billed?', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'Which utilities and building costs are included in the rent, and which are billed separately or settled in an annual statement?', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'What does the lease (Mietvertrag) require at move-out — painting, restoration, or other condition terms — and what is the notice period?', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'Has the installation housing office reviewed the lease? Many members consider having the office review their first German lease, since terms differ from typical U.S. leases.', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'For off-base internet and phone, what contract length is required, and is the contract in German? The housing office can point to providers commonly used by SOFA tenants.', sourceUrl: 'TODO-DAN', verifiedOn: null },
  ],
  beforeYouMove: [
    { value: "Ask about VAT relief before major purchases. Eligible SOFA personnel may be able to buy certain items without German VAT through the installation's VAT/tax relief office. The process involves purchase-specific forms and a participating seller, so confirm current procedures with the office first.", sourceUrl: 'TODO-DAN (official VAT/tax relief office page — avoid news articles)', verifiedOn: null },
    { value: 'Check the voltage label on electronics and appliances. Germany uses a different voltage and plug type than the U.S. A plug adapter changes only the plug shape — it does not convert voltage. Devices labeled for a wide input range (such as most phone and laptop chargers) generally work with an adapter; others may need a voltage converter or replacement.', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'Ask your sponsor or gaining unit about driver licensing and vehicle registration requirements for SOFA members before deciding whether to ship, buy, or sell a vehicle.', sourceUrl: 'TODO-DAN', verifiedOn: null },
    { value: 'Off-base spending is in euros. OHA and COLA adjust for exchange rates, but everyday off-base costs still move with the euro-dollar rate.', sourceUrl: 'TODO-DAN', verifiedOn: null },
  ],
  officialLinks: [
    { label: 'Ramstein housing office', url: 'TODO-DAN' },
    { label: 'Military OneSource — Ramstein installation overview', url: 'TODO-DAN' },
  ],
  relatedStations: ['yokota-air-base', 'kadena-air-base', 'camp-humphreys'],
  lastReviewed: 'TODO-DAN',
};
