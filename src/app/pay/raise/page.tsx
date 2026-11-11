import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PAY_RAISE_2027,
  SOURCES,
  TIER_ASSUMPTION_NOTE,
} from '@/data/pay-raise/2027';
import {
  getColumns,
  resultFor,
  pay2026,
  isAssumedTier,
  statusLabel,
  statusText,
  summaryText,
  pageTitle,
  pageDescription,
  raiseFaqs,
  shortPercentLabel,
  formatIsoDate,
  CAP_NOTE_PENDING,
  ESTIMATE_NOTE,
} from '@/lib/calculations/payRaise';
import {
  ENLISTED_GRADES,
  WARRANT_GRADES,
  OFFICER_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
  YOS_BREAKPOINTS,
  type PayGrade,
} from '@/types/military';
import { formatCurrency } from '@/lib/utils';
import { JsonLdScript } from '@/components/JsonLdScript';
import { breadcrumbListSchema, webApplicationSchema, faqPageSchema } from '@/lib/schema';
import { ogImage } from '@/lib/og';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { CalculatorEmailSignup } from '@/components/CalculatorEmailSignup';
import { PayRaiseCalculator } from '@/components/calculators/pay-raise/PayRaiseCalculator';
import { RaiseChartTabs } from '@/components/calculators/pay-raise/RaiseChartTabs';

// Static route: takes precedence over /pay/[rank] (dynamicParams = false there),
// so /pay/raise never reaches that page's notFound().

const config = PAY_RAISE_2027;
const TITLE = pageTitle(config);
const DESC = pageDescription(config);
const OG = ogImage({
  type: 'calculator',
  title: '2027 Military Pay Raise Calculator',
  sub:
    config.status === 'pending'
      ? `${shortPercentLabel(config.scenarios[0].percentByTier)} plan vs ${shortPercentLabel(config.scenarios[1].percentByTier)}, by grade and years of service`
      : 'Official 2027 basic pay by grade and years of service',
});

export const metadata: Metadata = {
  // absolute: the root template would push the title past SERP width.
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/pay/raise' },
  openGraph: {
    title: `${TITLE} | MilPayTools`,
    description: DESC,
    type: 'website',
    url: '/pay/raise',
    siteName: 'MilPayTools',
    images: OG,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | MilPayTools`,
    description: DESC,
    images: OG,
  },
};

const GRADE_GROUPS: { label: string; grades: readonly PayGrade[] }[] = [
  { label: 'Enlisted', grades: ENLISTED_GRADES },
  { label: 'Warrant officer', grades: WARRANT_GRADES },
  { label: 'Officer', grades: OFFICER_GRADES },
  { label: 'Officer, prior enlisted', grades: PRIOR_ENLISTED_OFFICER_GRADES },
];

const KEY_YEARS = new Set([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 26, 30]);
const yosLabel = (y: number) => (y === 0 ? '2 or less' : `Over ${y}`);
const money = (n: number) => formatCurrency(n, true);

function ChartTable({ yos }: { yos: number }) {
  const columns = getColumns(config);
  const showTier = config.status !== 'official-table';
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <caption className="sr-only">{`2027 monthly basic pay, ${yosLabel(yos).toLowerCase()} years of service`}</caption>
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200 text-left">
            <th scope="col" className="px-3 py-2.5 font-semibold text-zinc-700">Grade</th>
            <th scope="col" className="px-3 py-2.5 font-semibold text-zinc-700 text-right">2026 official</th>
            {columns.map((c) => (
              <th key={c.id} scope="col" className="px-3 py-2.5 font-semibold text-zinc-700 text-right">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        {GRADE_GROUPS.map((group) => (
          <tbody key={group.label}>
            <tr className="bg-zinc-50/60">
              <th colSpan={2 + columns.length} scope="colgroup" className="px-3 py-1.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                {group.label}
              </th>
            </tr>
            {group.grades.map((grade) => {
              const base = pay2026(grade, yos);
              return (
                <tr key={grade} className="border-b border-zinc-100">
                  <th scope="row" className="px-3 py-1.5 text-left font-medium text-zinc-800 whitespace-nowrap">
                    {grade}
                    {showTier && isAssumedTier(grade) && <span className="text-zinc-400">*</span>}
                  </th>
                  <td className="px-3 py-1.5 text-right tabular-nums text-zinc-700">
                    {base === null ? <span className="text-zinc-300">—</span> : money(base)}
                  </td>
                  {columns.map((c) => {
                    const r = resultFor(c, grade, yos, config);
                    return (
                      <td key={c.id} className="px-3 py-1.5 text-right tabular-nums text-zinc-900">
                        {r.applicable ? (
                          <>
                            {money(r.projected)}
                            {r.capped && <span className="text-amber-700">†</span>}
                          </>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default function PayRaisePage() {
  const columns = getColumns(config);
  const faqs = raiseFaqs(config);
  const checked = formatIsoDate(config.lastChecked);
  const isPending = config.status === 'pending';
  const estimateCols = columns.some((c) => c.kind !== 'official-table');

  return (
    <>
      <JsonLdScript
        schema={breadcrumbListSchema([
          { name: 'Home', url: '/' },
          { name: 'Pay by Rank', url: '/pay' },
          { name: '2027 Pay Raise', url: '/pay/raise' },
        ])}
      />
      <JsonLdScript schema={webApplicationSchema({ name: '2027 Military Pay Raise Calculator', description: DESC, url: '/pay/raise' })} />
      <JsonLdScript schema={faqPageSchema(faqs)} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DFAS Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-3">
            {TITLE}
          </h1>

          {/* ── Status box ─────────────────────────────────────────────── */}
          <div
            className={`rounded-lg border p-4 ${isPending ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}
            data-testid="raise-status"
          >
            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isPending ? 'text-amber-800' : 'text-green-800'}`}>
              {statusLabel(config)}
            </p>
            <p className="text-sm sm:text-base text-zinc-800 leading-relaxed">{statusText(config)}</p>
            {isPending && (
              <p className="text-sm text-zinc-700 mt-2 font-medium">Your 2026 pay is the only guaranteed figure.</p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Calculator ──────────────────────────────────────────────── */}
        <section aria-labelledby="raise-calc-h">
          <h2 id="raise-calc-h" className="text-xl font-semibold text-zinc-900 mb-1">
            Your 2027 base pay
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            {isPending
              ? 'Pick your grade and years of service. Each scenario still in play is shown side by side, next to your official 2026 pay.'
              : 'Pick your grade and years of service to see 2027 basic pay next to your 2026 pay.'}
          </p>
          <PayRaiseCalculator />
        </section>

        {/* ── Summary (quotable plain text for search engines and AI) ─── */}
        <section aria-labelledby="raise-summary-h" className="border-l-4 border-zinc-300 pl-4">
          <h2 id="raise-summary-h" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
            Summary
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed" data-testid="raise-summary">
            {summaryText(config)}
          </p>
        </section>

        {/* ── Full chart ──────────────────────────────────────────────── */}
        <section aria-labelledby="raise-chart-h">
          <h2 id="raise-chart-h" className="text-xl font-semibold text-zinc-900 mb-1">
            2027 military pay chart by grade
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            {`Monthly basic pay for every grade: 2026 official vs ${columns.map((c) => c.label).join(' vs ')}. Pick a years-of-service column; "Full chart" shows all of them.`}
          </p>
          <RaiseChartTabs
            panels={YOS_BREAKPOINTS.map((y) => ({ yos: y, label: yosLabel(y), key: KEY_YEARS.has(y) }))}
          >
            {YOS_BREAKPOINTS.map((y) => (
              <ChartTable key={y} yos={y} />
            ))}
          </RaiseChartTabs>
          <div className="text-xs text-zinc-500 mt-2 space-y-1 leading-relaxed">
            <p>— DFAS publishes no rate for that grade at that many years of service.</p>
            {estimateCols && <p>{`2027 figures: ${ESTIMATE_NOTE}`}</p>}
            {config.caps.pending && <p>{`† ${CAP_NOTE_PENDING} Shown at the ${config.caps.capYear} cap.`}</p>}
            {config.status !== 'official-table' && <p>{`* ${TIER_ASSUMPTION_NOTE}`}</p>}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="space-y-4" aria-labelledby="raise-faq-h">
          <h2 id="raise-faq-h" className="text-xl font-semibold text-zinc-900">
            Frequently asked questions
          </h2>
          {faqs.map(({ question, answer }) => (
            <div key={question} className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">{question}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{answer}</p>
            </div>
          ))}
        </section>

        <CalculatorEmailSignup headline="Get notified when 2027 military pay data is updated" />

        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/pay" className="text-blue-700 underline hover:text-blue-800">2026 Military Pay Charts</Link>{' '}
              <span className="text-zinc-500">— official 2026 tables and pay by rank</span>
            </li>
            <li>
              <Link href="/calculators/total-compensation" className="text-blue-700 underline hover:text-blue-800">Total Compensation Calculator</Link>{' '}
              <span className="text-zinc-500">— base pay plus BAH, BAS and TSP match</span>
            </li>
            <li>
              <Link href="/blog/2026-military-pay-raise-explained" className="text-blue-700 underline hover:text-blue-800">2026 Military Pay Raise Explained</Link>{' '}
              <span className="text-zinc-500">— what the 3.8% raise meant in dollars</span>
            </li>
          </ul>
        </section>

        <Disclaimer dataYear="2026" className="text-xs" />

        {/* ── Sources ─────────────────────────────────────────────────── */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5" data-testid="raise-sources">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Sources:</strong>{' '}
            {[
              { name: SOURCES.plan.name, url: SOURCES.plan.url },
              { name: SOURCES.crs.name, url: SOURCES.crs.url },
              ...(config.enacted ? [{ name: config.enacted.lawName, url: config.enacted.sourceUrl }] : []),
              { name: `${SOURCES.usc1009.name} (annual pay adjustment)`, url: SOURCES.usc1009.url },
              { name: `${SOURCES.usc203.name} (pay caps)`, url: SOURCES.usc203.url },
              { name: 'DFAS 2026 basic pay tables', url: SOURCES.dfas.url },
            ].map((s, i, arr) => (
              <span key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {s.name}
                </a>
                {i < arr.length - 1 ? '; ' : '. '}
              </span>
            ))}
            {`${config.caps.capYear} pay caps (Executive Schedule Level II ${money(config.caps.levelII)}, Level V ${money(config.caps.levelV)}) from the DFAS officer table notes. Basic pay is taxable income; BAH and BAS are excluded from federal taxable income. Last checked ${checked}.`}
          </p>
        </div>
      </div>
    </>
  );
}
