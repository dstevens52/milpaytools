import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getLocationName } from '@/lib/calculations/bah';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';
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
  const description = `2026 Basic Allowance for Housing rates for ${station.name} in ${station.city}, ${station.stateName}. Monthly BAH for every pay grade — with and without dependents — plus local housing market insights.`;
  const ogImageTitle = `${station.name} BAH Rates 2026`;
  const ogImage = `/api/og?type=station&title=${encodeURIComponent(ogImageTitle)}&v=2`;
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
      images: [{ url: ogImage, width: 2400, height: 1260 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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

  const pageUrl = `/bah/${station.slug}`;
  const schema = articleSchema({
    title: `${station.name} BAH Rates 2026`,
    description: `2026 BAH rates for ${station.name} — full pay grade table with and without dependents.`,
    datePublished: '2026-04-27',
    url: pageUrl,
  });

  return (
    <>
      <JsonLdScript schema={schema} />
      <StationPageClient
        station={station}
        ratesW={ratesW ?? {}}
        ratesWO={ratesWO ?? {}}
        locationName={locationName ?? station.city}
        taxInfo={taxInfo}
        colaArea={colaArea}
        nearbyData={nearbyData}
        hasRates={!station.oconus && !!ratesW && !!ratesWO}
      />
    </>
  );
}
