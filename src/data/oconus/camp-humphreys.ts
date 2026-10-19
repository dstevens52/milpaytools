import type { OconusStation } from './types';

// Every fact verified by Dan against the official source on 2026-10-18.
// Do not add or "improve" facts here without new verification.
//
// OHA/COLA code: the Military OneSource housing page says "KR035" for the
// Humphreys area, but DTMO's own OHA and COLA lookups list Camp Humphreys as
// KR025. DTMO is authoritative — never cite the Military OneSource page for it.
const V = '2026-10-18';
const MOS = 'https://installations.militaryonesource.mil/military-installation';
const MOS_HUMPHREYS = `${MOS}/camp-humphreys-usag-humphreys`;
const MOS_HOUSING = `${MOS}/camp-humphreys-usag-humphreys/housing/housing`;
const MOS_VEHICLES = `${MOS}/camp-humphreys-usag-humphreys/transportation/motor-vehicles`;

const COMMAND_SPONSORSHIP =
  "If you're on an unaccompanied tour and bring your family at your own expense, you're not automatically entitled to OHA and aren't eligible for on-post family housing. Command sponsorship is how families are authorized to come to Korea.";

export const campHumphreys: OconusStation = {
  slug: 'camp-humphreys',
  templateVersion: 2,
  published: true,
  name: 'Camp Humphreys',
  shortName: 'Camp Humphreys',
  // The legacy duty-station name, which the PCS estimator's search returns.
  searchNames: ['Camp Humphreys (K-6)'],
  hostCountry: { value: 'South Korea', sourceUrl: MOS_HUMPHREYS, verifiedOn: V },
  cityRegion: { value: 'Pyeongtaek area', sourceUrl: MOS_HOUSING, verifiedOn: V },
  branches: { value: ['Army'], sourceUrl: MOS_HUMPHREYS, verifiedOn: V },
  ohaLocalityCode: {
    value: 'KR025',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/OHA-Rate-Lookup/',
    verifiedOn: V,
  },
  colaLocality: {
    value: 'Korea – Camp Humphreys (formerly Pyongtaek), KR025',
    sourceUrl: 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/Overseas-COLA-Rate-Lookup/',
    verifiedOn: V,
  },
  commandSponsorshipSource: { value: COMMAND_SPONSORSHIP, sourceUrl: MOS_HOUSING, verifiedOn: V },
  localContext: {
    value:
      "Command-sponsored families at Camp Humphreys are assigned on-post family housing first when it's available, and live off post in private rentals when it isn't. Most off-post housing is built to American standards. Unaccompanied members E-7 and above are assigned Senior Leader Quarters, and E-6 and below live in barracks.",
    sourceUrl: MOS_HOUSING,
    verifiedOn: V,
  },
  leaseQuestions: [
    {
      value: "Has the housing office confirmed whether you're required to live on post before you start looking off post?",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: 'Does the landlord provide a washer, dryer, stove, and refrigerator? If not, the housing office can provide them.',
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      value: "Does the home have both 110-volt and 220-volt outlets? Most off-post housing does, but it's worth confirming.",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
  ],
  beforeYouMove: [
    { lead: 'Command sponsorship.', value: COMMAND_SPONSORSHIP, sourceUrl: MOS_HOUSING, verifiedOn: V },
    {
      lead: 'Shipping limits.',
      value: "Household goods weight allowances to Korea are restricted, so the housing office provides furniture and appliances. Ask what's provided before deciding what to ship.",
      sourceUrl: MOS_HOUSING,
      verifiedOn: V,
    },
    {
      lead: 'Driving.',
      value: "You'll need a USFK driver's license, which requires a valid stateside license for your whole tour and passing an online written test. Not everyone is authorized a privately owned vehicle in Korea, so confirm your status allows one before shipping or buying a car.",
      sourceUrl: MOS_VEHICLES,
      verifiedOn: V,
    },
    {
      lead: 'Schools.',
      value: 'Only command-sponsored families have guaranteed access to DoD schools at Humphreys.',
      sourceUrl: MOS_HUMPHREYS,
      verifiedOn: V,
    },
    {
      lead: 'Pets.',
      value: 'Shipping a cat or dog to Korea is subject to Korean customs and quarantine requirements.',
      sourceUrl: MOS_HUMPHREYS,
      verifiedOn: V,
    },
    {
      lead: 'Exchange rate.',
      value: 'Off-post spending is in won. OHA and COLA adjust for exchange rates, but everyday off-post costs still move with the won-dollar rate.',
      sourceUrl: 'https://www.travel.dod.mil/Allowances/Currency-Fluctuations-Exchange-Rates/',
      verifiedOn: V,
    },
  ],
  officialLinks: [
    { label: 'Humphreys housing (Military OneSource)', url: MOS_HOUSING },
    { label: 'Humphreys driving and vehicles (Military OneSource)', url: MOS_VEHICLES },
    { label: 'Military OneSource — USAG Humphreys', url: MOS_HUMPHREYS },
  ],
  relatedStations: ['yokota-air-base', 'kadena-air-base', 'ramstein-air-base', 'raf-lakenheath'],
  lastReviewed: '2026-10-18',
};
