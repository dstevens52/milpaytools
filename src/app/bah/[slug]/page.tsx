import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DUTY_STATIONS, STATION_BY_SLUG, type DutyStation } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getMHARatesForYear, getLocationName, getNationalAverages, CURRENT_BAH_YEAR, PRIOR_BAH_YEAR } from '@/lib/calculations/bah';
import { mhaPercentile, yoyForGrade, siblingInstallations, nearbyDeltas, hasRateDecrease, nationalIncreaseComparison } from '@/lib/calculations/bahStats';
import { getFMRRange } from '@/lib/calculations/fmr';
import { bahVsRentClause } from '@/lib/rentCompare';
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

// Append the richest trailing clause that keeps the meta description within
// `max` characters. Clauses are whole sentences, tried longest-first, so the
// tail drops cleanly on the longest base names instead of truncating mid-word.
function fitDescription(head: string, tails: string[], max = 160): string {
  return head + (tails.find((t) => head.length + t.length <= max) ?? '');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
  if (!station) return {};
  // E-5 reference rates, read from the same dataset the on-page rate table uses
  // so the snippet figures always match the table. OCONUS bases have no BAH
  // (they receive OHA) and fall through to a rate-free description below.
  const mhaCode = station.oconus ? null : getMHACode(station.zip);
  const e5W = mhaCode ? getMHARates(mhaCode, true)?.['E-5'] : undefined;
  const e5WO = mhaCode ? getMHARates(mhaCode, false)?.['E-5'] : undefined;

  const formerShort = station.formerName ? station.formerName.split(' (')[0] : null;
  // Locality comes from station.city — the MHA name often just repeats the base
  // name (e.g. "Fort Hood, TX"), so it can't capture city queries like
  // "bah killeen tx". Shown only when the city adds info beyond the base name.
  const cityDistinct = !station.name.toLowerCase().includes(station.city.toLowerCase());
  const locality = cityDistinct ? ` (${station.city})` : '';

  // ── Title: former name wins the parenthetical; locality is appended only when
  // there's no former name and "{name} BAH Rates 2026 — City, ST" fits ~60 chars.
  // titleBase omits the site name — the root layout's title template appends
  // " | MilPayTools". OG/Twitter don't run through that template, so they get an
  // explicit socialTitle (with the site name) to match the rendered <title>.
  let titleBase: string;
  if (station.oconus) {
    titleBase = `${station.name} BAH & OHA 2026`;
  } else {
    const core = formerShort
      ? `${station.name} (${formerShort}) BAH Rates 2026`
      : `${station.name} BAH Rates 2026`;
    const withLocality = `${core} — ${station.city}, ${station.state}`;
    titleBase = !formerShort && cityDistinct && withLocality.length <= 60 ? withLocality : core;
  }
  const socialTitle = `${titleBase} | MilPayTools`;

  // ── Description: lead with the actual E-5 figures so the search snippet shows
  // a real dollar amount. Trailing clauses drop whole-sentence on long names.
  let description: string;
  if (e5W !== undefined && e5WO !== undefined) {
    const head = `2026 BAH for ${station.name}, ${station.state}${locality}: E-5 with dependents ${formatCurrency(e5W)}/mo, without ${formatCurrency(e5WO)}/mo.`;
    description = fitDescription(head, [
      ' All ranks and dependency statuses. Official DTMO data, no account.',
      ' All ranks and dependency statuses.',
    ]);
  } else if (station.oconus) {
    const head = `${station.name}, ${station.stateName} is an overseas duty station — members receive Overseas Housing Allowance (OHA), not BAH.`;
    description = fitDescription(head, [
      ' Housing pay guidance for every pay grade, no account.',
      ' Housing pay guidance, no account.',
    ]);
  } else {
    description = `2026 BAH rates for ${station.name}, ${station.stateName}${locality}. Monthly BAH for every pay grade, with and without dependents. Official DTMO data, no account.`;
  }
  return {
    title: titleBase,
    description,
    alternates: { canonical: `/bah/${station.slug}` },
    openGraph: {
      title: socialTitle,
      description,
      type: 'website',
      url: `/bah/${station.slug}`,
      siteName: 'MilPayTools',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
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
  // HUD 2-bedroom Fair Market Rent range for this MHA (null = OCONUS/no coverage).
  const fmr2br = mhaCode ? getFMRRange(mhaCode, 2) : null;

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
    if (fmr2br && e5W !== undefined && e5W > 0) {
      faqs.push({
        question: `How does BAH at ${station.name} compare with local rent?`,
        answer: `For 2026, an E-5 with dependents at ${station.name} receives ${formatCurrency(e5W)}/month in BAH. Across the ${mhaLabel} area, 2-bedroom Fair Market Rent (HUD, FY2026) runs about ${formatCurrency(fmr2br.p25)}–${formatCurrency(fmr2br.p75)} (median ${formatCurrency(fmr2br.median)}). ${bahVsRentClause(e5W, fmr2br, 'an E-5 with dependents')} BAH is designed to cover about 95% of typical local housing costs — rent plus utilities — for a member's pay grade and dependency status.`,
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
  }

  const faqSchema = faqs.length > 0 ? faqPageSchema(faqs) : null;
  const breadcrumbSchema = breadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: 'BAH by Station', url: '/bah' },
    { name: station.name, url: pageUrl },
  ]);

  // StationPageClient is a client component, so every field of `station` is
  // serialized into the page's HTML payload. The page no longer renders the
  // retired home-buying / surplus / cost-of-living / neighborhood-steering copy,
  // so strip those fields here to keep them out of the shipped HTML entirely
  // (only stateTaxNote, rentalNote[OCONUS], and oconusContent are still rendered).
  const clientStation: DutyStation = {
    ...station,
    description: '',
    rentalContext: undefined,
    rentalNote: station.oconus ? station.rentalNote : '',
    bahVsHousing: undefined,
    localHousingTips: station.localHousingTips
      ? { coliNote: '', stateTaxNote: station.localHousingTips.stateTaxNote, neighborhoods: [], mistakeToAvoid: '' }
      : undefined,
  };

  return (
    <>
      <JsonLdScript schema={schema} />
      <JsonLdScript schema={breadcrumbSchema} />
      {faqSchema && <JsonLdScript schema={faqSchema} />}
      <StationPageClient
        station={clientStation}
        hasRichData={!!station.bahVsHousing}
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
        fmr2br={fmr2br}
        siblings={siblings}
        faqs={faqs}
      />
    </>
  );
}
