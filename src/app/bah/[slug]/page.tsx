import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getMHARatesForYear, getLocationName, getNationalAverages, CURRENT_BAH_YEAR, PRIOR_BAH_YEAR } from '@/lib/calculations/bah';
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

  // Prior-year rates for year-over-year deltas — resolved at build time only.
  // Small resolved objects (~24 grades) become props; the dataset never ships.
  const ratesWPrev = mhaCode ? getMHARatesForYear(mhaCode, true, PRIOR_BAH_YEAR) : null;
  const ratesWOPrev = mhaCode ? getMHARatesForYear(mhaCode, false, PRIOR_BAH_YEAR) : null;

  // Fixed direct-answer YoY clause for E-5 with dependents (most-common rate).
  // Computed once here so the visible FAQ text and the FAQ schema stay identical.
  const e5Curr = ratesW?.['E-5'];
  const e5Prev = ratesWPrev?.['E-5'];
  const e5YoYClause =
    e5Curr !== undefined && e5Prev !== undefined && e5Prev > 0 && e5Curr !== e5Prev
      ? ` The E-5 with-dependents rate is ${e5Curr > e5Prev ? 'up' : 'down'} ${(
          (Math.abs(e5Curr - e5Prev) / e5Prev) * 100
        ).toFixed(1)}% from ${PRIOR_BAH_YEAR}'s ${formatCurrency(e5Prev)}/mo.`
      : '';

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

  const mhaLabel = locationName ?? station.city;
  const q4Answer = station.bahVsHousing
    ? `Local median home prices run approximately ${formatCurrency(station.bahVsHousing.medianHomePrice)}, with estimated monthly mortgage payments (PITI) of ${formatCurrency(station.bahVsHousing.mortgageMin)}–${formatCurrency(station.bahVsHousing.mortgageMax)}. An E-6 with dependents receives ${formatCurrency(ratesW?.['E-6'] ?? 0)}/month in BAH. E-5s with dependents at ${formatCurrency(ratesW?.['E-5'] ?? 0)}/month can cover a significant portion of a median mortgage, particularly with a VA loan eliminating the down payment requirement.`
    : `BAH is designed to cover local housing costs at approximately the 25th percentile of the local rental market. Whether BAH covers a mortgage depends on local home prices, interest rates, and your pay grade. VA loans — which require no down payment — can make homeownership viable on BAH alone in many markets. An E-5 with dependents receives ${formatCurrency(ratesW?.['E-5'] ?? 0)}/month and an E-6 with dependents receives ${formatCurrency(ratesW?.['E-6'] ?? 0)}/month in the ${mhaLabel} MHA.`;

  const faqSchema = ratesW && ratesWO
    ? faqPageSchema([
        {
          question: `What is the 2026 BAH rate at ${station.name}?`,
          answer: `BAH at ${station.name} depends on pay grade and dependent status. For 2026, the ${mhaLabel} MHA rates include: E-5 with dependents ${formatCurrency(ratesW['E-5'] ?? 0)}/month, E-6 with dependents ${formatCurrency(ratesW['E-6'] ?? 0)}/month, E-7 with dependents ${formatCurrency(ratesW['E-7'] ?? 0)}/month, and O-3 with dependents ${formatCurrency(ratesW['O-3'] ?? 0)}/month. E-5 without dependents is ${formatCurrency(ratesWO['E-5'] ?? 0)}/month. BAH is excluded from federal taxable income.${e5YoYClause}`,
        },
        {
          question: `Is BAH at ${station.name} taxable income?`,
          answer: 'No. BAH is excluded from federal taxable income under the Military Pay Tax Exclusion. Most states also exempt BAH and BAS from state income tax, though treatment varies by state. Service members keep the full dollar value of their housing allowance — a significant financial advantage over taxable income of the same amount.',
        },
        {
          question: `What Military Housing Area (MHA) does ${station.name} use for BAH?`,
          answer: `${station.name} is assigned to the ${mhaLabel} Military Housing Area (MHA). All service members stationed at ${station.name} receive BAH rates set for this MHA, regardless of their exact address within the area. Rates are published annually by the Defense Travel Management Office (DTMO) and take effect January 1 each year.`,
        },
        {
          question: `Can I afford to buy a home near ${station.name} using BAH?`,
          answer: q4Answer,
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
        ratesWPrev={ratesWPrev ?? {}}
        ratesWOPrev={ratesWOPrev ?? {}}
        currentYear={CURRENT_BAH_YEAR}
        priorYear={PRIOR_BAH_YEAR}
        e5YoYClause={e5YoYClause}
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
