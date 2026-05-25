import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getLocationName, getNationalAverages } from '@/lib/calculations/bah';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { formatCurrency } from '@/lib/utils';
import { STATE_TAX_DATA } from '@/data/compare/stateTax';
import { COLA_AREAS } from '@/data/cola/2026/constants';
import { StationPageClient } from '@/components/calculators/bah/StationPageClient';

export async function generateStaticParams() {
  return DUTY_STATIONS.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
  if (!station) return {};
  const title = `${station.name} BAH Rates 2026 | ${station.city}, ${station.state}`;
  const formerNameShort = station.formerName ? station.formerName.split(' (')[0] : null;
  const description = `2026 BAH rates for ${station.name}${formerNameShort ? ` (formerly ${formerNameShort})` : ''} in ${station.city}, ${station.stateName}. Monthly BAH for every pay grade — with and without dependents — plus local housing market insights.`;
  return {
    title,
    description,
    alternates: { canonical: `/bah/${station.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/bah/${station.slug}`,
      siteName: 'MilPayTools',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
  if (!station) notFound();

  const mhaCode = station.oconus ? null : getMHACode(station.zip);
  const ratesW = mhaCode ? getMHARates(mhaCode, true) : null;
  const ratesWO = mhaCode ? getMHARates(mhaCode, false) : null;
  const locationName = mhaCode ? getLocationName(station.zip) : null;

  const taxInfo = STATE_TAX_DATA[station.state] ?? null;
  const colaAreaFull = station.oconus
    ? null
    : COLA_AREAS.find((a) => a.zipPrefixes.includes(station.zip.slice(0, 3))) ?? null;
  const colaArea = colaAreaFull ? { name: colaAreaFull.name, tier: colaAreaFull.tier } : null;

  const nearbyData = DUTY_STATIONS.filter((s) => station.nearby.includes(s.slug)).map((s) => {
    const nearbyMha = s.oconus ? null : getMHACode(s.zip);
    const nearbyRates = nearbyMha ? getMHARates(nearbyMha, true) : null;
    return {
      name: s.name,
      slug: s.slug,
      city: s.city,
      state: s.state,
      oconus: s.oconus,
      e5Rate: nearbyRates?.['E-5'],
    };
  });

  const nationalAvgs = getNationalAverages();

  const pageUrl = `/bah/${station.slug}`;
  const schema = articleSchema({
    title: `${station.name} BAH Rates 2026`,
    description: `2026 BAH rates for ${station.name} — full pay grade table with and without dependents.`,
    datePublished: '2026-04-27',
    url: pageUrl,
  });

  const faqSchema = slug === 'offutt-afb' && ratesW && ratesWO
    ? faqPageSchema([
        {
          question: 'What is the 2026 BAH rate at Offutt AFB?',
          answer: `BAH at Offutt AFB depends on pay grade and dependent status. For 2026, the Omaha/Offutt AFB MHA rates include: E-5 with dependents ${formatCurrency(ratesW['E-5'])}/month, E-6 with dependents ${formatCurrency(ratesW['E-6'])}/month, E-7 with dependents ${formatCurrency(ratesW['E-7'])}/month, and O-3 with dependents ${formatCurrency(ratesW['O-3'])}/month. E-5 without dependents is ${formatCurrency(ratesWO['E-5'])}/month. BAH is excluded from federal taxable income.`,
        },
        {
          question: 'Is BAH at Offutt AFB taxable income?',
          answer: 'No. BAH is excluded from federal taxable income under the Military Pay Tax Exclusion. Nebraska also does not tax BAH or BAS. Service members keep 100% of their housing allowance — a civilian would need to earn significantly more gross income to take home the equivalent amount after federal and state taxes.',
        },
        {
          question: 'What Military Housing Area (MHA) does Offutt AFB use for BAH?',
          answer: 'Offutt AFB is assigned to the Omaha/Offutt AFB, NE Military Housing Area (MHA). All service members stationed at Offutt AFB receive BAH rates set for the Omaha MHA, regardless of their exact address within the metro area. Rates are published annually by the Defense Travel Management Office (DTMO) and take effect January 1 each year.',
        },
        {
          question: 'Can I afford to buy a home near Offutt AFB using BAH?',
          answer: `The Omaha/Bellevue area offers one of the strongest BAH-to-home-price ratios in the Air Force. Median home prices near Offutt run approximately $300,000, with estimated PITI mortgage payments of $2,050–$2,250/month. An E-6 with dependents receives ${formatCurrency(ratesW['E-6'])}/month in BAH — enough to cover a typical mortgage payment. E-5s with dependents at ${formatCurrency(ratesW['E-5'])}/month can also cover a significant portion of a median mortgage, particularly with a VA loan eliminating the down payment requirement.`,
        },
      ])
    : null;

  return (
    <>
      <JsonLdScript schema={schema} />
      {faqSchema && <JsonLdScript schema={faqSchema} />}
      <StationPageClient
        station={station}
        ratesW={ratesW ?? {}}
        ratesWO={ratesWO ?? {}}
        locationName={locationName ?? station.city}
        taxInfo={taxInfo}
        colaArea={colaArea}
        nearbyData={nearbyData}
        hasRates={!station.oconus && !!ratesW && !!ratesWO}
        nationalAvgs={nationalAvgs}
      />
    </>
  );
}
