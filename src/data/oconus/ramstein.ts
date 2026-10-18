import type { OconusStation } from './types';

// Every fact verified by Dan against the official source on 2026-10-17.
// Do not add or "improve" facts here without new verification.
const V = '2026-10-17';
const MOS_RAMSTEIN = 'https://installations.militaryonesource.mil/military-installation/ramstein-ab';
const MOS_HOUSING = 'https://installations.militaryonesource.mil/military-installation/ramstein-ab/housing/housing';
const USAG_RP_VISITOR = 'https://home.army.mil/rheinland-pfalz/contact/visitor-information';

export const ramstein: OconusStation = {
  slug: 'ramstein-air-base',
  templateVersion: 2,
  published: true,
  name: 'Ramstein Air Base',
  shortName: 'Ramstein AB',
  hostCountry: { value: 'Germany', sourceUrl: MOS_RAMSTEIN, verifiedOn: V },
  cityRegion: { value: 'Ramstein-Miesenbach, Rhineland-Palatinate', sourceUrl: MOS_RAMSTEIN, verifiedOn: V },
  branches: { value: ['Air Force', 'Army (Kaiserslautern Military Community)'], sourceUrl: USAG_RP_VISITOR, verifiedOn: V },
  ohaLocalityCode: {
    value: 'DE700',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: V,
  },
  colaLocality: {
    value: 'Germany – Ramstein (RP), DE700',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: V,
  },
  coLocated: {
    value: ['Vogelweh', 'Landstuhl', 'Kleber Kaserne', 'Rhine Ordnance Barracks', 'Pulaski Barracks'],
    sourceUrl: USAG_RP_VISITOR,
    verifiedOn: V,
  },
  commandSponsorshipSource: {
    value: 'Military OneSource — USAG Rheinland-Pfalz check-in procedures',
    sourceUrl: 'https://installations.militaryonesource.mil/military-installation/usag-rheinland-pfalz/base-essentials/check-in-procedures',
    verifiedOn: V,
  },
  localContext: {
    value:
      'Ramstein is part of the Kaiserslautern Military Community (KMC), a large American community spanning Air Force and Army installations. Most of the KMC community lives off base, and rentals near Ramstein are in high demand. Many local landlords are experienced with SOFA tenants, and the KMC housing office tracks current local rental conditions.',
    sourceUrl: MOS_HOUSING,
    verifiedOn: V,
  },
  leaseQuestions: [
    { value: 'What type of heating does the home use — gas, oil, or heat pump? If oil, who pays for the seasonal fuel fill, and how is it billed?', sourceUrl: MOS_HOUSING, verifiedOn: V },
    { value: 'Which utilities and building costs are included in the rent, and which are billed separately or settled in an annual statement?', sourceUrl: MOS_HOUSING, verifiedOn: V },
    { value: 'What does the lease (Mietvertrag) require at move-out — painting, restoration, or other condition terms — and what is the notice period?', sourceUrl: MOS_HOUSING, verifiedOn: V },
    { value: 'Has the installation housing office reviewed the lease? Many members consider having the office review their first German lease, since terms differ from typical U.S. leases.', sourceUrl: MOS_HOUSING, verifiedOn: V },
    { value: 'For off-base internet and phone, what contract length is required, and is the contract in German? The housing office can point to providers commonly used by SOFA tenants.', sourceUrl: MOS_HOUSING, verifiedOn: V },
  ],
  beforeYouMove: [
    {
      value: "Ask about VAT relief before major purchases. Eligible SOFA personnel may be able to buy certain items without German VAT through the installation's VAT/tax relief office. The process involves purchase-specific forms and a participating seller, so confirm current procedures with the office first.",
      sourceUrl: 'https://kaiserslautern.armymwr.com/happenings/save-money-vat-office',
      verifiedOn: V,
      showInSources: false, // temporary page — linted and link-checked, not listed in Sources
    },
    {
      value: 'Check the voltage label on electronics and appliances. Germany uses a different voltage and plug type than the U.S. A plug adapter changes only the plug shape — it does not convert voltage. Devices labeled for a wide input range (such as most phone and laptop chargers) generally work with an adapter; others may need a voltage converter or replacement.',
      sourceUrl: 'https://www.ramstein.af.mil/About/Fact-Sheets/Display/Article/303681/household-goods-shipment/',
      verifiedOn: V,
    },
    {
      value: "Everyone assigned to Germany needs a U.S. Army Europe (USAREUR) driver's license to drive a privately owned vehicle; an international driving permit alone doesn't qualify. Ask your sponsor or gaining unit about the license exam and vehicle registration before deciding whether to ship, buy, or sell a vehicle.",
      sourceUrl: 'https://www.ramstein.af.mil/About/Fact-Sheets/Article/303616/driving-in-germany/',
      verifiedOn: V,
    },
    {
      value: 'Off-base spending is in euros. OHA and COLA adjust for exchange rates, but everyday off-base costs still move with the euro-dollar rate.',
      sourceUrl: 'https://www.travel.dod.mil/Allowances/Currency-Fluctuations-Exchange-Rates/',
      verifiedOn: V,
    },
  ],
  officialLinks: [
    { label: 'KMC housing office', url: MOS_HOUSING },
    { label: 'Ramstein newcomers — before you arrive', url: 'https://www.ramstein.af.mil/PCS-Info/Newcomers-Info/Before-You-Arrive/' },
    { label: 'Military OneSource — Ramstein overview', url: MOS_RAMSTEIN },
  ],
  relatedStations: ['raf-lakenheath', 'yokota-air-base', 'kadena-air-base', 'camp-humphreys'],
  lastReviewed: '2026-10-17',
};
