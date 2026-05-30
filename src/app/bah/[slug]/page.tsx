import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getMHARatesForYear, getLocationName, getNationalAverages, CURRENT_BAH_YEAR, PRIOR_BAH_YEAR } from '@/lib/calculations/bah';
import { mhaPercentile, yoyForGrade, siblingInstallations, nearbyDeltas, hasRateDecrease, nationalIncreaseComparison } from '@/lib/calculations/bahStats';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema, breadcrumbListSchema } from '@/lib/schema';
import { formatCurrency } from '@/lib/utils';
import { STATE_TAX_DATA } from '@/data/compare/stateTax';
import { COLA_AREAS } from '@/data/cola/2026/constants';
import { StationPageClient } from '@/components/calculators/bah/StationPageClient';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function listToProse(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

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

  const taxInfo = STATE_TAX_DATA[station.state] ?? null;
  const colaAreaFull = station.oconus
    ? null
    : COLA_AREAS.find((a) => a.zipPrefixes.includes(station.zip.slice(0, 3))) ?? null;
  const colaArea = colaAreaFull ? { name: colaAreaFull.name, tier: colaAreaFull.tier } : null;

  const nearbyData = nearbyDeltas(station.slug);

  const nationalAvgs = getNationalAverages();

  // ── Universal enrichment, computed from the DoD dataset (E-5 with dependents
  // is the canonical reference grade). All degrade gracefully to null/empty. ──
  const e5W = ratesW?.['E-5'];
  const e5Median = nationalAvgs.w['E-5'];
  const e5Pctile = mhaCode ? mhaPercentile(mhaCode, 'E-5', true) : null;
  const e5YoY = mhaCode ? yoyForGrade(mhaCode, 'E-5', true) : null;
  const siblings = mhaCode ? siblingInstallations(mhaCode, station.slug) : [];
  // True if any displayed pay grade decreased 2025→2026 at this MHA.
  const hasDecrease = mhaCode ? hasRateDecrease(mhaCode) : false;

  const pageUrl = `/bah/${station.slug}`;
  const schema = articleSchema({
    title: `${station.name} BAH Rates 2026`,
    description: `2026 BAH rates for ${station.name} — full pay grade table with and without dependents.`,
    datePublished: '2026-04-27',
    url: pageUrl,
  });

  const mhaLabel = locationName ?? station.city;

  // ── Fixed E-5 with-dependents reference sentences. Built once so the visible
  // prose and the FAQ/schema stay identical. Empty string = omit (graceful). ──
  const medianSentence =
    e5W !== undefined && e5W > 0
      ? `${station.name} BAH for an E-5 with dependents is ${formatCurrency(e5W)}/month — ${
          e5W === e5Median
            ? 'right at'
            : `${formatCurrency(Math.abs(e5W - e5Median))}/month ${e5W > e5Median ? 'above' : 'below'}`
        } the national median of ${formatCurrency(e5Median)}.`
      : '';

  const percentileSentence = e5Pctile
    ? `That ranks the ${mhaLabel} MHA ${ordinal(e5Pctile.rankFromTop)}-highest of the ${e5Pctile.total} military housing areas tracked nationwide (top ${e5Pctile.topPercent}%) for the E-5 with-dependents rate.`
    : '';

  // YoY summary: monthly change + annualized impact (+ tax framing on a gain),
  // then this base's % change vs the official DTMO national-average increase.
  const e5YoYComparison = e5YoY ? nationalIncreaseComparison(e5YoY.pct, CURRENT_BAH_YEAR) : null;
  let yoySummary = '';
  if (e5YoY) {
    const annual = formatCurrency(Math.abs(e5YoY.abs) * 12);
    const prior = formatCurrency(e5YoY.prior);
    if (e5YoY.abs === 0) {
      yoySummary = `For 2026, the E-5 with-dependents rate at ${station.name} is unchanged from ${PRIOR_BAH_YEAR}'s ${prior}/month.`;
    } else if (e5YoY.abs > 0) {
      yoySummary = `For 2026, the E-5 with-dependents rate at ${station.name} rose ${formatCurrency(e5YoY.abs)} (+${e5YoY.pct.toFixed(1)}%) from ${PRIOR_BAH_YEAR}'s ${prior}/month — about ${annual} more over the year, excluded from federal taxable income.`;
    } else {
      yoySummary = `For 2026, the E-5 with-dependents rate at ${station.name} fell ${formatCurrency(Math.abs(e5YoY.abs))} (−${Math.abs(e5YoY.pct).toFixed(1)}%) from ${PRIOR_BAH_YEAR}'s ${prior}/month — about ${annual} less over the year.`;
    }
    if (e5YoYComparison) {
      yoySummary += ` That's ${e5YoYComparison.relation} the national average BAH increase of ${e5YoYComparison.nationalPct}% for ${CURRENT_BAH_YEAR}.`;
    }
  }

  const buyAnswer = station.bahVsHousing
    ? `Local median home prices run approximately ${formatCurrency(station.bahVsHousing.medianHomePrice)}, with estimated monthly mortgage payments (PITI) of ${formatCurrency(station.bahVsHousing.mortgageMin)}–${formatCurrency(station.bahVsHousing.mortgageMax)}. An E-6 with dependents receives ${formatCurrency(ratesW?.['E-6'] ?? 0)}/month in BAH and an E-5 with dependents ${formatCurrency(ratesW?.['E-5'] ?? 0)}/month. Whether BAH covers a mortgage depends on home prices, rates, and pay grade.`
    : '';

  // Nearby comparison (E-5 w/dep deltas), CONUS only, for the FAQ.
  const nearbyForFaq = nearbyData.filter((n) => !n.oconus && n.e5Delta !== undefined);
  const nearbyFaqAnswer =
    nearbyForFaq.length > 0 && e5W !== undefined
      ? `Nearby installations have their own MHA rates. For an E-5 with dependents: ${listToProse(
          nearbyForFaq.map((n) =>
            n.e5Delta === 0
              ? `${n.name} is the same`
              : `${n.name} is ${formatCurrency(Math.abs(n.e5Delta!))}/month ${n.e5Delta! > 0 ? 'higher' : 'lower'}`,
          ),
        )} — compared with ${station.name}'s ${formatCurrency(e5W)}/month.`
      : '';

  // ── Unified FAQ: single source for both the visible list and FAQPage schema ──
  const faqs: { question: string; answer: string }[] = [];
  if (ratesW && ratesWO) {
    faqs.push({
      question: `What is the 2026 BAH rate for an E-5 with dependents at ${station.name}?`,
      answer: `For 2026, an E-5 with dependents at ${station.name} receives ${formatCurrency(ratesW['E-5'] ?? 0)}/month in BAH (${mhaLabel} MHA). Other grades with dependents: E-6 ${formatCurrency(ratesW['E-6'] ?? 0)}/month, E-7 ${formatCurrency(ratesW['E-7'] ?? 0)}/month, O-3 ${formatCurrency(ratesW['O-3'] ?? 0)}/month. E-5 without dependents is ${formatCurrency(ratesWO['E-5'] ?? 0)}/month. BAH is excluded from federal taxable income.`,
    });
    faqs.push({
      question: `Which Military Housing Area (MHA) is used for ${station.name} BAH?`,
      answer: `${station.name} is assigned to the ${mhaLabel} Military Housing Area (MHA). Every installation and address in the same MHA receives the same rate, regardless of exact ZIP or neighborhood. Rates are published annually by the Defense Travel Management Office (DTMO) and take effect January 1.`,
    });
    if (yoySummary) {
      faqs.push({
        question: `How much did ${station.name} BAH change from 2025 to 2026?`,
        answer: `${yoySummary} Rate protection means a member who stays at the same location with the same dependency status keeps their rate even if the published table rate falls.`,
      });
    }
    faqs.push({
      question: `Does ${station.name} BAH depend on my exact ZIP code?`,
      answer: `No. BAH is set by Military Housing Area (MHA), not by your specific ZIP or neighborhood. ${station.name} falls in the ${mhaLabel} MHA, so every ZIP in that area receives the identical rate for a given pay grade and dependency status.`,
    });
    if (nearbyFaqAnswer) {
      faqs.push({
        question: `How does ${station.name} BAH compare with nearby installations?`,
        answer: nearbyFaqAnswer,
      });
    }
    faqs.push({
      question: `Is BAH taxable for service members stationed at ${station.name}?`,
      answer: `No. BAH is excluded from federal taxable income under the Military Pay Tax Exclusion. Most states also exempt BAH from state income tax, though treatment varies by state. Service members keep the full dollar value of their housing allowance.`,
    });
    if (siblings.length > 0) {
      faqs.push({
        question: `Why do ${station.name} and ${siblings.length === 1 ? siblings[0].name : 'nearby installations'} have the same BAH rate?`,
        answer: `${station.name} shares the ${mhaLabel} MHA with ${listToProse(siblings.map((s) => s.name))} — all of them receive identical BAH because the rate is set per MHA, not per installation. A member at any of these locations with the same pay grade and dependency status receives the same amount.`,
      });
    }
    if (buyAnswer) {
      faqs.push({
        question: `Can I afford to buy a home near ${station.name} using BAH?`,
        answer: buyAnswer,
      });
    }
  }

  const faqSchema = faqs.length > 0 ? faqPageSchema(faqs) : null;
  const breadcrumbSchema = breadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: 'BAH by Station', url: '/bah' },
    { name: station.name, url: pageUrl },
  ]);

  return (
    <>
      <JsonLdScript schema={schema} />
      <JsonLdScript schema={breadcrumbSchema} />
      {faqSchema && <JsonLdScript schema={faqSchema} />}
      <StationPageClient
        station={station}
        ratesW={ratesW ?? {}}
        ratesWO={ratesWO ?? {}}
        ratesWPrev={ratesWPrev ?? {}}
        ratesWOPrev={ratesWOPrev ?? {}}
        currentYear={CURRENT_BAH_YEAR}
        priorYear={PRIOR_BAH_YEAR}
        locationName={locationName ?? station.city}
        mhaLabel={mhaLabel}
        taxInfo={taxInfo}
        colaArea={colaArea}
        nearbyData={nearbyData}
        hasRates={!station.oconus && !!ratesW && !!ratesWO}
        nationalAvgs={nationalAvgs}
        medianSentence={medianSentence}
        percentileSentence={percentileSentence}
        yoySummary={yoySummary}
        hasDecrease={hasDecrease}
        siblings={siblings}
        faqs={faqs}
      />
    </>
  );
}
