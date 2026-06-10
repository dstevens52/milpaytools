import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PAY_PAGE_RANKS,
  RANK_BY_SLUG,
  PAY_PAGES_LAST_UPDATED,
  PAY_PAGES_PUBLISHED_ISO,
  type PayPageRank,
} from '@/data/pay-pages/ranks';
import { payTable } from '@/data/pay-tables/2026';
import { YOS_BREAKPOINTS, ENLISTED_GRADES, type YearsOfService } from '@/types/military';
import { BAS_RATES, DATA_AS_OF } from '@/data/constants';
import { getNationalAverages } from '@/lib/calculations/bah';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { formatCurrency, getYOSBracket, estimateMarginalRate } from '@/lib/utils';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema, breadcrumbListSchema } from '@/lib/schema';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

export async function generateStaticParams() {
  return PAY_PAGE_RANKS.map((r) => ({ rank: r.slug }));
}

export const dynamicParams = false;

// ─── Build-time figure resolution ────────────────────────────────────────────
// Everything dollar-shaped on the page comes through here — the pay table, BAH
// dataset, and BAS constants are read once server-side and rendered as text.
// No client component on this route, so none of the datasets ship to the browser.

function yosLabel(bp: number): string {
  return bp === 0 ? 'Under 2 years' : `Over ${bp} years`;
}

/** The pay table only keys YOS columns where the rate changes; DFAS publishes
 *  every column. Carry values forward so users can find their own cell.
 *  Columns below a grade's floor (E-8 starts Over 8, E-9 Over 10) get
 *  monthly: null and render as "—" — never $0. */
function progressionRows(rank: PayPageRank) {
  const entry = payTable[rank.grade];
  const keys = Object.keys(entry)
    .map(Number)
    .sort((a, b) => a - b);
  return YOS_BREAKPOINTS.map((bp) => {
    const validKeys = keys.filter((k) => k <= bp);
    const monthly =
      validKeys.length > 0 ? entry[validKeys[validKeys.length - 1] as YearsOfService]! : null;
    return { bp, label: yosLabel(bp), monthly };
  });
}

function resolveFigures(rank: PayPageRank) {
  const entry = payTable[rank.grade];
  const keys = Object.keys(entry)
    .map(Number)
    .sort((a, b) => a - b);
  const minPay = entry[keys[0] as YearsOfService]!;
  const maxPay = entry[keys[keys.length - 1] as YearsOfService]!;
  // First published YOS column — 0 for most grades; 8 for E-8, 10 for E-9.
  const floorKey = keys[0];
  // Fewer than 4 distinct values (E-1/E-2/E-3): a full 22-row grid would be
  // almost entirely repeats — render a sentence + small table instead.
  const distinctCount = new Set(Object.values(entry)).size;

  const isEnlisted = ENLISTED_GRADES.includes(rank.grade as (typeof ENLISTED_GRADES)[number]);
  const nationalAvgs = getNationalAverages();
  const medianBAH = (rank.exampleDependents ? nationalAvgs.w : nationalAvgs.wo)[rank.grade];

  // Legacy + 0% TSP keeps agency-match assumptions out of the worked example —
  // the totals below are pure base pay + BAH + BAS (+ tax framing).
  const comp = calculateTotalCompensation(
    {
      payGrade: rank.grade,
      yearsOfService: rank.exampleYos,
      hasDependents: rank.exampleDependents,
      zipCode: '',
      retirementSystem: 'legacy',
      tspContributionPct: 0,
      govHousing: false,
      mealCard: false,
    },
    medianBAH
  );

  // Prior-enlisted comparison (O-1/O-2/O-3 pages), computed from the
  // DFAS-verified -E rows. The two scales are identical at Over 4 by design
  // and diverge with longevity, so the section shows both points.
  let priorEnlisted: {
    grade: string;
    at4: number;
    cap: number;
    capKey: number;
    standardCap: number;
    capDiff: number;
  } | null = null;
  if (rank.priorEnlistedGrade) {
    const eEntry = payTable[rank.priorEnlistedGrade];
    const eKeys = Object.keys(eEntry)
      .map(Number)
      .sort((a, b) => a - b);
    const eCapKey = eKeys[eKeys.length - 1];
    const eCap = eEntry[eCapKey as YearsOfService]!;
    priorEnlisted = {
      grade: rank.priorEnlistedGrade,
      at4: eEntry[4 as YearsOfService]!,
      cap: eCap,
      capKey: eCapKey,
      standardCap: maxPay,
      capDiff: eCap - maxPay,
    };
  }

  return { minPay, maxPay, floorKey, distinctCount, isEnlisted, medianBAH, comp, priorEnlisted };
}

// Append the richest trailing clause that keeps the meta description within
// `max` characters — same whole-sentence truncation as /bah/[slug].
function fitDescription(head: string, tails: string[], max = 160): string {
  return head + (tails.find((t) => head.length + t.length <= max) ?? '');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rank: string }>;
}): Promise<Metadata> {
  const { rank: slug } = await params;
  const rank = RANK_BY_SLUG[slug];
  if (!rank) return {};
  const { comp, minPay, maxPay } = resolveFigures(rank);

  // titleBase omits the site name — the root layout's title template appends
  // " | MilPayTools". OG/Twitter don't run through that template, so they get
  // an explicit socialTitle to match the rendered <title>.
  // Rendered <title> (titleBase + " | MilPayTools") must stay ≤60 chars for
  // every rank — this pattern renders at 58 for all 3-character grade tokens.
  const titleBase = `${rank.title} Pay 2026: Basic Pay & Total Compensation`;
  const socialTitle = `${titleBase} | MilPayTools`;

  const head =
    minPay === maxPay
      ? `2026 ${rank.title} pay: a flat ${formatCurrency(minPay, true)}/month basic pay at every year of service.`
      : `2026 ${rank.title} pay: ${formatCurrency(comp.monthlyBasePay, true)}/month basic pay at ${yosLabel(getYOSBracket(rank.exampleYos)).toLowerCase()} of service.`;
  const description = fitDescription(head, [
    ` Full ${rank.title} pay table by years of service, plus BAH, BAS, and total compensation.`,
    ' Full pay table, BAH, BAS, and total compensation.',
  ]);

  return {
    title: titleBase,
    description,
    alternates: { canonical: `/pay/${rank.slug}` },
    openGraph: {
      title: socialTitle,
      description,
      type: 'website',
      url: `/pay/${rank.slug}`,
      siteName: 'MilPayTools',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  };
}

export default async function RankPayPage({
  params,
}: {
  params: Promise<{ rank: string }>;
}) {
  const { rank: slug } = await params;
  const rank = RANK_BY_SLUG[slug];
  if (!rank) notFound();

  const { minPay, maxPay, floorKey, distinctCount, isEnlisted, medianBAH, comp, priorEnlisted } =
    resolveFigures(rank);
  const rows = progressionRows(rank);
  const exampleBracket = getYOSBracket(rank.exampleYos);
  const compactTable = distinctCount < 4;
  const isFlat = minPay === maxPay;

  const branchList = `${rank.branchTitles.army} in the Army, ${rank.branchTitles.marines} in the Marine Corps, ${rank.branchTitles.airForce} in the Air Force, ${rank.branchTitles.navy} in the Navy, and ${rank.branchTitles.spaceForce} in the Space Force`;
  const exampleLabel = `${rank.title}, ${yosLabel(exampleBracket).toLowerCase()}, ${rank.exampleDependents ? 'with' : 'without'} dependents`;
  // Prose variant for mid-sentence use ("an E-5 with over 6 years of service
  // and dependents receives…") — the comma-list label reads wrong inline.
  const exampleProse = `${rank.title} with ${yosLabel(exampleBracket).toLowerCase()} of service and ${rank.exampleDependents ? 'dependents' : 'no dependents'}`;
  // The marginal rate behind comp.taxAdvantageValue — disclosed in the
  // assumptions note under the worked example.
  const marginalRatePct = Math.round(estimateMarginalRate(comp.annualBasePay) * 100);
  const annualCash = comp.totalMonthly * 12;

  // ── Unified FAQ: single source for both the visible list and FAQPage schema.
  // Dollar amounts come from the same resolved figures as the table and worked
  // example — one source of truth per render.
  const faqs: { question: string; answer: string }[] = [
    {
      question: `How much does an ${rank.title} make in 2026?`,
      answer: `${
        minPay === maxPay
          ? `${rank.title} monthly basic pay in 2026 is a flat ${formatCurrency(minPay, true)} — the grade has no longevity steps.`
          : `${rank.title} monthly basic pay in 2026 ranges from ${formatCurrency(minPay, true)} to ${formatCurrency(maxPay, true)}, depending on years of service. An ${rank.title} ${yosLabel(exampleBracket).toLowerCase()} of service earns ${formatCurrency(comp.monthlyBasePay, true)}/month in basic pay.`
      } Basic pay is only part of military compensation — most members also receive BAH and BAS on top of it.`,
    },
    {
      question: `What is ${rank.title} total compensation with BAH and BAS?`,
      answer: `Using the 2026 national median BAH ${rank.exampleDependents ? 'with' : 'without'} dependents (${formatCurrency(medianBAH)}/month), an ${exampleProse} receives about ${formatCurrency(comp.totalMonthly)}/month — ${formatCurrency(comp.monthlyBasePay, true)} basic pay, ${formatCurrency(comp.monthlyBAH)} BAH, and ${formatCurrency(comp.monthlyBAS, true)} BAS — roughly ${formatCurrency(annualCash)} per year. Actual totals depend on duty station, since BAH varies by location.`,
    },
    ...(rank.faqExtras ?? []),
    {
      question: `Is ${rank.title} pay taxable?`,
      answer: `Basic pay is subject to federal income tax and, in most states, state income tax. BAH and BAS are excluded from federal taxable income, which is why the real value of an ${rank.title}'s package is higher than the base-pay number alone suggests. In designated combat zones, ${isEnlisted ? 'enlisted pay is excluded from federal income tax under the Combat Zone Tax Exclusion' : 'the Combat Zone Tax Exclusion applies to officers as well, capped at the highest enlisted pay rate'}.`,
    },
  ];

  const pageUrl = `/pay/${rank.slug}`;
  const schema = articleSchema({
    title: `${rank.title} Military Pay 2026`,
    description: `2026 ${rank.title} basic pay by years of service, plus BAH, BAS, and total compensation.`,
    datePublished: PAY_PAGES_PUBLISHED_ISO,
    url: pageUrl,
  });
  const faqSchema = faqPageSchema(faqs);
  const breadcrumbSchema = breadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: 'Pay by Rank', url: '/pay' },
    { name: rank.title, url: pageUrl },
  ]);

  return (
    <>
      <JsonLdScript schema={schema} />
      <JsonLdScript schema={breadcrumbSchema} />
      <JsonLdScript schema={faqSchema} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            {`${rank.title} Pay in 2026: Basic Pay, BAH & What It All Adds Up To`}
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            {`The pay chart says an ${rank.title} earns ${
              isFlat
                ? `${formatCurrency(minPay, true)} a month — a single flat rate`
                : `${formatCurrency(minPay, true)} to ${formatCurrency(maxPay, true)} a month`
            } — but basic pay is only the taxable slice of the package. This page shows the full 2026 ${rank.title} pay ${isFlat ? 'picture' : 'progression by years of service'}, then adds the parts a base-pay table hides: housing allowance, food allowance, and what they're worth because they're excluded from federal taxable income.`}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Pay progression table ───────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            {`2026 ${rank.title} basic pay by years of service`}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            {`Monthly basic pay from the 2026 DFAS pay table, effective ${DATA_AS_OF} (3.8% raise).`}
            {compactTable
              ? ` ${rank.title} pay has ${distinctCount === 1 ? 'a single flat rate' : `only ${distinctCount} longevity steps`} — the table below shows ${distinctCount === 1 ? 'it' : 'each step'}.`
              : ' Find the row matching your completed years of service — rates repeat between longevity steps, exactly as DFAS publishes them.'}
            {floorKey > 0 &&
              ` ${rank.title} rates begin at the over-${floorKey}-years column — DFAS publishes no ${rank.title} rate below that point, so earlier rows show a dash.`}
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-left">
                  <th className="px-4 py-2.5 font-semibold text-zinc-700">Years of service</th>
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 text-right">
                    Monthly basic pay
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 text-right">Annual</th>
                </tr>
              </thead>
              <tbody>
                {(compactTable
                  ? rows.filter(
                      (r, i) => i === 0 || r.monthly !== rows[i - 1].monthly
                    )
                  : rows
                ).map((row) => {
                  const isExampleRow = !compactTable && row.bp === exampleBracket;
                  return (
                    <tr
                      key={row.bp}
                      className={
                        isExampleRow
                          ? 'bg-amber-50 border-b border-zinc-100'
                          : 'border-b border-zinc-100 last:border-b-0'
                      }
                    >
                      <td className="px-4 py-2 text-zinc-700">
                        {row.label}
                        {isExampleRow && (
                          <span className="ml-2 text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                            Used in example below
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {row.monthly !== null ? formatCurrency(row.monthly, true) : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-600 tabular-nums">
                        {row.monthly !== null ? formatCurrency(row.monthly * 12) : <span className="text-zinc-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rank.tableFootnote && (
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{rank.tableFootnote}</p>
          )}
        </section>

        {/* ── Worked total-comp example ───────────────────────────────── */}
        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            {`What an ${rank.title} actually receives each month`}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            {`Worked example: ${exampleLabel}, living off-installation. Figures use the national median BAH across all 338 military housing areas — your actual BAH depends on your duty station.`}
          </p>
          <div className="rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100 text-sm">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-zinc-700">{`Basic pay (${yosLabel(exampleBracket).toLowerCase()})`}</span>
              <span className="font-medium text-zinc-900 tabular-nums">
                {formatCurrency(comp.monthlyBasePay, true)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-zinc-700">
                {`BAH (national median, ${rank.exampleDependents ? 'with' : 'without'} dependents)`}
              </span>
              <span className="font-medium text-zinc-900 tabular-nums">
                {formatCurrency(comp.monthlyBAH)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-zinc-700">{`BAS (${isEnlisted ? 'enlisted' : 'officer'} rate)`}</span>
              <span className="font-medium text-zinc-900 tabular-nums">
                {formatCurrency(comp.monthlyBAS, true)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50">
              <span className="font-semibold text-zinc-900">Total monthly</span>
              <span className="font-bold text-zinc-900 tabular-nums">
                {formatCurrency(comp.totalMonthly)}
              </span>
            </div>
          </div>
          {rank.exampleNote && (
            <p className="text-xs text-zinc-500 leading-relaxed mt-3">{rank.exampleNote}</p>
          )}
          <p className="text-sm text-zinc-600 leading-relaxed mt-4">
            {`That's about ${formatCurrency(annualCash)} per year — and because BAH and BAS are excluded from federal taxable income, this package is worth roughly ${formatCurrency(comp.taxAdvantageValue)} more per year than the same dollars paid as taxable salary. Counting that tax advantage and the value of TRICARE coverage, a civilian job would need to pay about ${formatCurrency(comp.civilianEquivalent)} to match it.`}
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed mt-2">
            {`Tax advantage estimated at a ${marginalRatePct}% marginal federal rate (single filer) for this base pay; your actual benefit depends on your income, filing status, and state taxes.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Run your own numbers →
            </Link>
            <Link
              href="/calculators/bah"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Look up BAH for your duty station →
            </Link>
          </div>
        </section>

        {/* ── Rank context ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            {`What ${rank.title} means — and what changes financially`}
          </h2>
          <p className="text-sm text-zinc-500 mb-3">
            {`${rank.title} is ${branchList}.`}
          </p>
          <div className="space-y-3">
            {rank.contextCopy.map((para, i) => (
              <p key={i} className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* ── Prior enlisted service (O-1/O-2/O-3 only) ───────────────── */}
        {priorEnlisted && (
          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              {`Prior enlisted service: the ${priorEnlisted.grade} pay scale`}
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed mb-2">
              {`${rank.title}s with more than 4 years of creditable service — most commonly officers who served enlisted first — are paid on the ${priorEnlisted.grade} scale instead. The criterion is the four-year creditable-service mark, not a "10-year rule." At over 4 years the two scales start at the same rate (${formatCurrency(priorEnlisted.at4, true)}/month), then diverge with longevity: ${priorEnlisted.grade} keeps climbing to ${formatCurrency(priorEnlisted.cap, true)}/month at over ${priorEnlisted.capKey} years, while standard ${rank.title} tops out at ${formatCurrency(priorEnlisted.standardCap, true)}/month — a gap of ${formatCurrency(priorEnlisted.capDiff, true)}/month at the top of the scales.`}
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {`The full ${priorEnlisted.grade} progression is in the `}
              <Link href="/calculators/pay-charts" className="text-blue-700 underline hover:text-blue-800">
                2026 pay charts
              </Link>
              .
            </p>
          </section>
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900">Frequently asked questions</h2>
          {faqs.map(({ question, answer }) => (
            <div key={question} className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-zinc-900 mb-1">{question}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{answer}</p>
            </div>
          ))}
        </section>

        {/* ── Internal links ──────────────────────────────────────────── */}
        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Go deeper
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/calculators/total-compensation" className="text-blue-700 underline hover:text-blue-800">
                Total Compensation Calculator
              </Link>{' '}
              <span className="text-zinc-500">— your full package with your actual BAH and TSP match</span>
            </li>
            <li>
              <Link href="/calculators/pay-charts" className="text-blue-700 underline hover:text-blue-800">
                2026 Military Pay Charts
              </Link>{' '}
              <span className="text-zinc-500">— interactive tables for every grade and year of service</span>
            </li>
            <li>
              <Link href="/calculators/bah" className="text-blue-700 underline hover:text-blue-800">
                BAH Calculator
              </Link>{' '}
              <span className="text-zinc-500">— 2026 rates for all 40,959 ZIP codes</span>
            </li>
            {rank.deepDivePost && (
              <li>
                <Link href={`/blog/${rank.deepDivePost.slug}`} className="text-blue-700 underline hover:text-blue-800">
                  {rank.deepDivePost.title}
                </Link>{' '}
                <span className="text-zinc-500">— the full deep dive</span>
              </li>
            )}
            {rank.exampleStations.map((s) => (
              <li key={s.slug}>
                <Link href={`/bah/${s.slug}`} className="text-blue-700 underline hover:text-blue-800">
                  {`${s.name} BAH rates`}
                </Link>{' '}
                <span className="text-zinc-500">
                  {`— see what an ${rank.title} actually receives at ${s.name}`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Disclaimer dataYear="2026" className="text-xs" />

        {/* ── Sources + last updated ──────────────────────────────────── */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Sources:</strong>{` basic pay from the `}
            <a
              href="https://militarypay.defense.gov/Pay/Military-Pay-Charts/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              2026 DFAS military pay tables
            </a>
            {`, effective ${DATA_AS_OF}. BAH national median computed from the official 2026 DTMO BAH rate data (338 military housing areas). BAS from the 2026 DFAS published rates. Basic pay is taxable income; verify your own pay on your LES via `}
            <a
              href="https://mypay.dfas.mil"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              myPay
            </a>
            {`. Last updated ${PAY_PAGES_LAST_UPDATED}.`}
          </p>
        </div>
      </div>
    </>
  );
}
