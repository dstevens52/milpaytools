import type { OconusStation } from './types';

// Every fact verified by Dan against the official source on 2026-10-18.
// Do not add or "improve" facts here without new verification.
const V = '2026-10-18';
const MOS = 'https://installations.militaryonesource.mil/military-installation';
const MOS_KADENA = `${MOS}/kadena-ab`;
const MOS_HOUSING = `${MOS}/kadena-ab/housing/housing`;
const MOS_VEHICLES = `${MOS}/kadena-ab/transportation/motor-vehicles`;

export const kadena: OconusStation = {
  slug: 'kadena-air-base',
  templateVersion: 2,
  published: true,
  name: 'Kadena Air Base',
  shortName: 'Kadena AB',
  hostCountry: { value: 'Japan', sourceUrl: MOS_KADENA, verifiedOn: V },
  cityRegion: { value: 'Okinawa City, Okinawa', sourceUrl: MOS_KADENA, verifiedOn: V },
  branches: { value: ['Air Force'], sourceUrl: MOS_KADENA, verifiedOn: V },
  ohaLocalityCode: {
    value: 'JP027',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: V,
  },
  colaLocality: {
    value: 'Japan – Okinawa (OK), JP027',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: V,
  },
  localContext: {
    value:
      'All military family housing on Okinawa is managed by one housing office on Kadena Air Base. Accompanied active-duty members are required to live on base when adequate family housing is available, so OHA applies only to members who are authorized to live off base. Unaccompanied members E-4 and below are not authorized to live off base.',
    sourceUrl: MOS_HOUSING,
    verifiedOn: V,
  },
  leaseQuestions: [
    {
      value: "Has the housing office confirmed whether you're required to live on base before you start looking off base?",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: "Have you reserved temporary lodging in case your assigned home isn't ready when you arrive? The housing office recommends it.",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: 'Does the home come with major appliances? Kadena issues major appliances for the tour to accompanied Air Force members authorized to live off base.',
      sourceUrl: MOS_KADENA,
      verifiedOn: V,
    },
  ],
  beforeYouMove: [
    {
      lead: 'Driving.',
      value: "You'll need a USFJ operator's permit (USFJ Form 4EJ) to drive in Japan.",
      sourceUrl: MOS_VEHICLES,
      verifiedOn: V,
    },
    {
      lead: 'Vehicles.',
      value: 'Vehicles on Okinawa are registered through the Joint Services Vehicle Registration Office on Camp Foster. Registration requires Japanese Compulsory Insurance (JCI), property damage insurance, the annual road tax, and an inspection. Ask your sponsor before deciding whether to ship, buy, or sell a vehicle.',
      sourceUrl: MOS_VEHICLES,
      verifiedOn: V,
    },
    {
      lead: 'Medications.',
      value: 'Japan prohibits importing some common U.S. medications, including Vicks nasal inhalers and cough syrups containing codeine. Check before you pack.',
      sourceUrl: MOS_KADENA,
      verifiedOn: V,
    },
    {
      lead: 'Furniture.',
      value: "Loaner furniture is offered only to members authorized a full household goods shipment, and furnishings off base can be expensive and often aren't U.S. sizes.",
      sourceUrl: MOS_KADENA,
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
    { label: 'Kadena housing (Military OneSource)', url: MOS_HOUSING },
    { label: 'Kadena driving and vehicles (Military OneSource)', url: MOS_VEHICLES },
    { label: 'Military OneSource — Kadena AB', url: MOS_KADENA },
  ],
  relatedStations: ['yokota-air-base', 'camp-humphreys', 'ramstein-air-base', 'raf-lakenheath'],
  lastReviewed: '2026-10-18',
};
