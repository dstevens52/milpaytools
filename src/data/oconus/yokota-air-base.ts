import type { OconusStation } from './types';

// Every fact verified by Dan against the official source on 2026-10-18.
// Do not add or "improve" facts here without new verification.
const V = '2026-10-18';
const MOS = 'https://installations.militaryonesource.mil/military-installation';
const MOS_YOKOTA = `${MOS}/yokota-ab`;
const MOS_HOUSING = `${MOS}/yokota-ab/housing/housing`;
const MOS_VEHICLES = `${MOS}/yokota-ab/transportation/motor-vehicles`;

export const yokota: OconusStation = {
  slug: 'yokota-air-base',
  templateVersion: 2,
  published: true,
  name: 'Yokota Air Base',
  shortName: 'Yokota AB',
  hostCountry: { value: 'Japan', sourceUrl: MOS_YOKOTA, verifiedOn: V },
  cityRegion: { value: 'Fussa, Tokyo area', sourceUrl: MOS_YOKOTA, verifiedOn: V },
  branches: { value: ['Air Force'], sourceUrl: MOS_YOKOTA, verifiedOn: V },
  ohaLocalityCode: {
    value: 'JP065',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: V,
  },
  colaLocality: {
    value: 'Japan – Yokota (TO), JP065',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: V,
  },
  localContext: {
    value:
      'Yokota Air Base in the Tokyo area hosts Headquarters, U.S. Forces Japan and Fifth Air Force. Unaccompanied members in grades E-1 through E-4 are assigned on-base housing, while unaccompanied members E-5 and above and officers live off base. On- and off-base quarters are relatively small, so the housing office recommends shipping only essential items and using non-temporary storage for the rest.',
    sourceUrl: MOS_HOUSING,
    verifiedOn: V,
  },
  leaseQuestions: [
    { value: 'Has the housing office reviewed the home and the lease before you sign?', sourceUrl: MOS_HOUSING, verifiedOn: V },
    {
      value: 'Will your furniture fit? Homes in the area are relatively small, so measure before you commit to shipping large pieces.',
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: "Which appliances does the home already have? The base furnishings office provides a washer, dryer, stove, and refrigerator, so you don't need to ship your own.",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    { value: 'Which utilities are included in the rent, and which are billed separately?', sourceUrl: MOS_HOUSING, verifiedOn: V },
  ],
  beforeYouMove: [
    {
      lead: 'Driving.',
      value: "You'll need a SOFA driver's license, issued after the required training. Japan drives on the left, and Japanese law treats drivers as responsible for accidents their vehicles are involved in, so fault is often shared.",
      sourceUrl: MOS_VEHICLES,
      verifiedOn: V,
    },
    {
      lead: 'Vehicles.',
      value: 'Registering a vehicle in Japan requires Japanese Compulsory Insurance (JCI), property damage insurance, road tax, and an inspection, and Yokota registrations go through the base Pass and Registration office. Ask your sponsor before deciding whether to ship, buy, or sell a vehicle.',
      sourceUrl: `${MOS}/kadena-ab/transportation/motor-vehicles`,
      verifiedOn: V,
    },
    {
      lead: 'Medications.',
      value: 'Japan prohibits importing some common U.S. medications, including Vicks nasal inhalers and cough syrups containing codeine. Check before you pack.',
      sourceUrl: `${MOS}/kadena-ab`,
      verifiedOn: V,
    },
    {
      lead: 'Electrical.',
      value: "The Tokyo area, including Yokota, uses 100-volt, 50 Hz electricity. Check each device's voltage and frequency label.",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      lead: 'Pets.',
      value: "Bringing a pet to Japan takes advance paperwork, and pet boarding can be expensive if base housing isn't available right away. Ask your sponsor early.",
      sourceUrl: MOS_YOKOTA,
      verifiedOn: V,
    },
    {
      lead: 'Exchange rate.',
      value: 'Off-base spending is in yen. OHA and COLA adjust for exchange rates, but everyday off-base costs still move with the yen-dollar rate.',
      sourceUrl: 'https://www.travel.dod.mil/Allowances/Currency-Fluctuations-Exchange-Rates/',
      verifiedOn: V,
    },
  ],
  officialLinks: [
    { label: 'Yokota housing (Military OneSource)', url: MOS_HOUSING },
    { label: 'Yokota driving and vehicles (Military OneSource)', url: MOS_VEHICLES },
    { label: 'Military OneSource — Yokota AB', url: MOS_YOKOTA },
  ],
  relatedStations: ['kadena-air-base', 'camp-humphreys', 'ramstein-air-base', 'raf-lakenheath'],
  lastReviewed: '2026-10-18',
};
