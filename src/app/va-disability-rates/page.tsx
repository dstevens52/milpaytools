import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection } from '@/components/FaqSection';
import { CalculatorEmailSignup } from '@/components/CalculatorEmailSignup';
import { breadcrumbListSchema } from '@/lib/schema';
import { ogImage } from '@/lib/og';
import { formatCurrency } from '@/lib/utils';
import { VA_RATES_2027_STATUS } from '@/data/va-rates/2027-status';
import { vaRates2027 } from '@/data/va-rates/registry';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { formatVaDate, vaFirstPaymentText } from '@/lib/calculations/vaRatesStatus';
import {
  ADDED_COLUMNS,
  DEPENDENT_RATINGS,
  FLAT_RATINGS,
  NO_CHILD_COLUMNS,
  VA_CALCULATOR_PATH,
  VA_RATES_PAGE_PATH,
  WITH_CHILD_COLUMNS,
  rateCell,
  vaRatesPageDescription,
  vaRatesPageFaqs,
  vaRatesPageH1,
  vaRatesPageMode,
  vaRatesPageTitle,
  vaRatesPageYear,
  vaRatesStatusBox,
  type RateColumn,
} from '@/lib/calculations/vaRatesPage';

// Everything below reads the status file and the rate tables through
// src/lib/calculations/vaRatesPage.ts. Publishing 2027 is a data-only change.

const PUBLISHED = vaRates2027();
const MODE = vaRatesPageMode(PUBLISHED);
const YEAR = vaRatesPageYear(PUBLISHED);
const TITLE = vaRatesPageTitle(MODE);
const H1 = vaRatesPageH1(MODE);
const DESC = vaRatesPageDescription(MODE, PUBLISHED);
const OG = ogImage({
  type: 'guide',
  title: MODE === 'pending' ? 'VA Disability Rates 2027' : 'VA Disability Rates 2027: Official',
  sub: MODE === 'pending' ? 'COLA status and the full 2026 rate table' : 'Official pay chart by rating and dependents',
});

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: VA_RATES_PAGE_PATH },
  openGraph: {
    title: `${TITLE} | MilPayTools`,
    description: DESC,
    type: 'website',
    url: VA_RATES_PAGE_PATH,
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

const money = (n: number) => formatCurrency(n, true);

function Cell({ rating, col }: { rating: number; col: RateColumn['key'] }) {
  const c = rateCell(rating, col, PUBLISHED);
  return (
    <td className="px-3 py-2 text-right tabular-nums text-zinc-800 whitespace-nowrap">
      {money(c.amount)}
      {c.change !== null && (
        <span className="block text-[11px] text-green-700">{`${c.change >= 0 ? '+' : '−'}${money(Math.abs(c.change))}`}</span>
      )}
    </td>
  );
}

function SourceLine() {
  return (
    <p className="text-xs text-zinc-500 mt-2">
      Source:{' '}
      <a href={YEAR.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
        VA.gov, Veterans disability compensation rates
      </a>
      {`, effective ${formatVaDate(YEAR.effectiveDate)}. Monthly amounts in U.S. dollars.`}
      {PUBLISHED && ' Green figures: change from the 2026 rate.'}
    </p>
  );
}

function DependentTable({ caption, columns }: { caption: string; columns: RateColumn[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200 text-left">
            <th scope="col" className="px-3 py-2.5 font-semibold text-zinc-700">Rating</th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2.5 font-semibold text-zinc-700 text-right">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEPENDENT_RATINGS.map((r) => (
            <tr key={r} className="border-b border-zinc-100 last:border-0">
              <th scope="row" className="px-3 py-2 text-left font-mono font-semibold text-red-700">{r}%</th>
              {columns.map((c) => (
                <Cell key={c.key} rating={r} col={c.key} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VaDisabilityRatesPage() {
  const faqs = vaRatesPageFaqs(VA_RATES_2027_STATUS, PUBLISHED);
  const box = vaRatesStatusBox(VA_RATES_2027_STATUS);
  const y = YEAR.year;

  return (
    <>
      <JsonLdScript
        schema={breadcrumbListSchema([
          { name: 'Home', url: '/' },
          { name: 'VA Disability Calculator', url: VA_CALCULATOR_PATH },
          { name: 'VA Disability Rates', url: VA_RATES_PAGE_PATH },
        ])}
      />

      {/* ── Hero + status ───────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              {`Free · No Account · Official VA.gov Rates`}
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-3">
            {H1}
          </h1>

          {MODE === 'pending' ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4" data-testid="va-rates-status">
              <p className="text-xs font-bold uppercase tracking-wide mb-2 text-amber-800">{box.label}</p>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-800 leading-relaxed">
                <div>
                  <p className="font-semibold text-zinc-900 mb-1">Official</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {box.official.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 mb-1">Pending</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {box.pending.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm text-zinc-800 mt-3">
                <strong>{box.effective}</strong> {box.payment}
              </p>
              <p className="text-xs text-zinc-600 mt-2">{box.checked}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4" data-testid="va-rates-status">
              <p className="text-xs font-bold uppercase tracking-wide mb-1 text-green-800">Official 2027 rates</p>
              <p className="text-sm text-zinc-800 leading-relaxed">
                {`VA has published its 2027 rate tables: a ${PUBLISHED!.colaPercent}% COLA, effective ${formatVaDate(PUBLISHED!.effectiveDate)}. ${vaFirstPaymentText(PUBLISHED!.effectiveDate)}`}
              </p>
              <p className="text-xs text-zinc-600 mt-2">{`Checked ${formatVaDate(VA_RATES_2027_STATUS.checkedDate)}.`}</p>
            </div>
          )}

          <p className="text-sm text-zinc-700 mt-4">
            Rates depend on your combined rating, which VA works out with its own math rather than by
            adding percentages.{' '}
            <Link href={VA_CALCULATOR_PATH} className="font-semibold text-red-700 underline hover:text-red-800">
              Work out your combined rating and monthly amount →
            </Link>
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── 10% and 20% ─────────────────────────────────────────────────── */}
        <section aria-labelledby="flat-h">
          <h2 id="flat-h" className="text-xl font-semibold text-zinc-900 mb-1">
            {`${y} VA disability rates: 10% and 20%`}
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            At 10% and 20% the monthly amount is the same with or without a spouse, children or
            dependent parents.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 max-w-sm">
            <table className="w-full text-sm">
              <caption className="sr-only">{`${y} VA disability compensation, 10% and 20% ratings`}</caption>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-left">
                  <th scope="col" className="px-3 py-2.5 font-semibold text-zinc-700">Rating</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold text-zinc-700 text-right">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {FLAT_RATINGS.map((r) => (
                  <tr key={r} className="border-b border-zinc-100 last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-mono font-semibold text-red-700">{r}%</th>
                    <Cell rating={r} col="veteranAlone" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SourceLine />
        </section>

        {/* ── 30%–100%, no children ───────────────────────────────────────── */}
        <section aria-labelledby="no-child-h">
          <h2 id="no-child-h" className="text-xl font-semibold text-zinc-900 mb-1">
            {`${y} rates, 30% to 100%: veteran alone, spouse or parents (no children)`}
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            From 30%, VA adds for a spouse and dependent parents. These are VA&apos;s published
            amounts for each combination, not sums.
          </p>
          <DependentTable caption={`${y} VA disability compensation, 30% to 100%, no children`} columns={NO_CHILD_COLUMNS} />
          <SourceLine />
        </section>

        {/* ── 30%–100%, with a child ──────────────────────────────────────── */}
        <section aria-labelledby="child-h">
          <h2 id="child-h" className="text-xl font-semibold text-zinc-900 mb-1">
            {`${y} rates, 30% to 100%: with a child under 18`}
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            For one child under 18. For more children, or a child 18 to 23 in school, add the amounts
            in the next table.
          </p>
          <DependentTable caption={`${y} VA disability compensation, 30% to 100%, with one child under 18`} columns={WITH_CHILD_COLUMNS} />
          <SourceLine />
        </section>

        {/* ── Added amounts ───────────────────────────────────────────────── */}
        <section aria-labelledby="added-h">
          <h2 id="added-h" className="text-xl font-semibold text-zinc-900 mb-1">
            {`${y} added amounts, 30% to 100%`}
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            Added to the amount from the tables above: each child under 18 beyond the first, each
            child 18 to 23 in a qualifying school program, and a spouse who receives Aid &amp;
            Attendance.
          </p>
          <DependentTable caption={`${y} VA disability compensation added amounts, 30% to 100%`} columns={ADDED_COLUMNS} />
          <SourceLine />
          <p className="text-sm text-zinc-700 mt-3">
            <Link href={VA_CALCULATOR_PATH} className="font-semibold text-red-700 underline hover:text-red-800">
              Add it up for your family in the VA disability calculator →
            </Link>
          </p>
        </section>

        <CalculatorEmailSignup headline="Get an email when VA publishes the 2027 rates" />

        {/* ── FAQ (one array: visible list + FAQPage schema) ──────────────── */}
        <FaqSection faqs={faqs} />

        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={VA_CALCULATOR_PATH} className="text-blue-700 underline hover:text-blue-800">VA Disability Calculator</Link>{' '}
              <span className="text-zinc-500">— combined rating, bilateral factor and monthly amount with dependents</span>
            </li>
            <li>
              <Link href="/guides/va-disability" className="text-blue-700 underline hover:text-blue-800">VA Disability Guide</Link>{' '}
              <span className="text-zinc-500">— how ratings, VA math and compensation fit together</span>
            </li>
            <li>
              <Link href="/pay/dates" className="text-blue-700 underline hover:text-blue-800">Military Pay Dates 2027</Link>{' '}
              <span className="text-zinc-500">— active duty, retiree and VA payment dates</span>
            </li>
            <li>
              <Link href="/pay/raise" className="text-blue-700 underline hover:text-blue-800">2027 Military Pay Raise</Link>{' '}
              <span className="text-zinc-500">— 2027 basic pay and the key dates calendar</span>
            </li>
          </ul>
        </section>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            These are VA&apos;s published compensation rates, shown for education. Your payment depends
            on VA&apos;s decision on your claim, your effective date, verified dependents and any
            offsets. VA disability compensation is excluded from federal taxable income. MilPayTools is
            not affiliated with the Department of Veterans Affairs or the Department of Defense.
          </p>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5" data-testid="va-rates-sources">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Sources:</strong>{' '}
            {[
              { name: `VA.gov compensation rates (effective ${formatVaDate(YEAR.effectiveDate)})`, url: YEAR.sourceUrl },
              { name: VA_RATES_2027_STATUS.billCitation, url: VA_RATES_2027_STATUS.billUrl },
              { name: 'SSA: Latest Cost-of-Living Adjustment', url: RETIREE_COLA_2027.sources[0].url },
              { name: '38 U.S.C. 5120 (payment dates)', url: 'https://www.law.cornell.edu/uscode/text/38/5120' },
            ].map((s, i, arr) => (
              <span key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {s.name}
                </a>
                {i < arr.length - 1 ? '; ' : '. '}
              </span>
            ))}
            {`Last checked ${formatVaDate(VA_RATES_2027_STATUS.checkedDate)}.`}
          </p>
        </div>
      </div>
    </>
  );
}
