import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, breadcrumbListSchema } from '@/lib/schema';
import { ogImage } from '@/lib/og';
import { FaqSection } from '@/components/FaqSection';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { NextPayday } from '@/components/pay-dates/NextPayday';
import { DATA_LAST_CHECKED } from '@/data/watch';
import { PAYDAY_SOURCES, PENDING_JAN_2028_TEXT } from '@/data/paydays/2027';
import { monthLabel, tableDate } from '@/lib/calculations/paydays';
import { formatIsoDate } from '@/lib/calculations/payRaise';
import {
  PAY_DATES_PATH,
  PAY_DATES_TITLE,
  PAY_DATES_H1,
  PAY_DATES_DESCRIPTION,
  PAY_DATES_PUBLISHED,
  paydays2027,
  vaPayments2027,
  restOf2026,
  retiredPayRows,
  answerLines,
  activeDutyLabel,
  rest2026Note,
  GUARD_RESERVE_TEXT,
  RETIRED_RULE_TEXT,
  retireeColaLine,
  VA_RULE_TEXT,
  vaColaLine,
  payDatesFaqs,
  widgetPaydays,
} from '@/lib/pay-dates/content';

// Static route: takes precedence over /pay/[rank] (dynamicParams = false there).
// Prerendered: nothing on this page reads the server clock. The "next payday"
// widget runs in the browser only.

const OG = ogImage({ type: 'guide', title: 'Military Pay Dates 2027', sub: 'Active duty, retiree and VA payment dates' });

export const metadata: Metadata = {
  title: PAY_DATES_TITLE,
  description: PAY_DATES_DESCRIPTION,
  alternates: { canonical: PAY_DATES_PATH },
  openGraph: {
    title: `${PAY_DATES_TITLE} | MilPayTools`,
    description: PAY_DATES_DESCRIPTION,
    type: 'article',
    url: PAY_DATES_PATH,
    siteName: 'MilPayTools',
    images: OG,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAY_DATES_TITLE} | MilPayTools`,
    description: PAY_DATES_DESCRIPTION,
    images: OG,
  },
};

const th = 'px-3 py-2.5 font-semibold text-zinc-700 text-left';
const td = 'px-3 py-2 text-zinc-800 align-top';
const link = 'text-blue-700 underline hover:text-blue-800';

export default function PayDatesPage() {
  const ad = paydays2027();
  const va = vaPayments2027();
  const rest = restOf2026();
  const retired = retiredPayRows();
  const [line1, line2, line3] = answerLines();
  const sources = Object.values(PAYDAY_SOURCES);

  return (
    <>
      <JsonLdScript
        schema={breadcrumbListSchema([
          { name: 'Home', url: '/' },
          { name: 'Pay by Rank', url: '/pay' },
          { name: 'Pay Dates 2027', url: PAY_DATES_PATH },
        ])}
      />
      <JsonLdScript
        schema={articleSchema({
          title: PAY_DATES_H1,
          description: PAY_DATES_DESCRIPTION,
          datePublished: PAY_DATES_PUBLISHED,
          dateModified: DATA_LAST_CHECKED,
          url: PAY_DATES_PATH,
        })}
      />

      {/* ── Hero + top answer ─────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-4">
            {PAY_DATES_H1}
          </h1>
          <div className="rounded-lg border border-zinc-300 bg-white p-4 space-y-2" data-testid="pay-dates-answer">
            <p className="text-sm sm:text-base text-zinc-800 leading-relaxed">{line1}</p>
            <p className="text-sm sm:text-base text-zinc-800 leading-relaxed">
              {`${line2} `}
              <Link href="/pay/raise#your-2027-base-pay" className={link}>
                See your 2027 base pay →
              </Link>
            </p>
            <p className="text-sm sm:text-base text-zinc-800 leading-relaxed">{line3}</p>
          </div>
          <div className="mt-4">
            <NextPayday paydays={widgetPaydays()} />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Active duty 2027 ────────────────────────────────────────── */}
        <section id="active-duty" className="scroll-mt-20" aria-labelledby="ad-h">
          <h2 id="ad-h" className="text-xl font-semibold text-zinc-900 mb-2">
            Active duty paydays 2027
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4" data-testid="ad-label">
            {activeDutyLabel()}
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm" data-testid="ad-2027-table">
              <caption className="sr-only">2027 active-duty paydays</caption>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th scope="col" className={th}>Pay period</th>
                  <th scope="col" className={th}>Scheduled</th>
                  <th scope="col" className={th}>Paid</th>
                  <th scope="col" className={th}>Why it moved</th>
                </tr>
              </thead>
              <tbody>
                {ad.map((p) => (
                  <tr
                    key={`${p.period}-${p.half}`}
                    className="border-b border-zinc-100"
                    data-testid="ad-row"
                    data-status={p.status}
                    data-paid={p.paid ?? ''}
                  >
                    <th scope="row" className={`${td} font-medium text-left whitespace-nowrap`}>
                      {`${monthLabel(p.period).split(' ')[0]} ${p.half === 'mid' ? 'mid-month' : 'end of month'}`}
                    </th>
                    <td className={`${td} whitespace-nowrap`}>{tableDate(p.scheduled)}</td>
                    <td className={`${td} whitespace-nowrap font-semibold`}>
                      {p.paid ? tableDate(p.paid) : 'Pending'}
                    </td>
                    <td className={`${td} text-zinc-600`}>{p.paid ? (p.reason ?? '') : PENDING_JAN_2028_TEXT}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Rest of 2026 ────────────────────────────────────────────── */}
        <section id="rest-of-2026" className="scroll-mt-20" aria-labelledby="r26-h">
          <h2 id="r26-h" className="text-xl font-semibold text-zinc-900 mb-2">
            Rest of 2026 (official DFAS dates)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm" data-testid="rest-2026-table">
              <caption className="sr-only">Remaining 2026 active-duty paydays and LES dates</caption>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th scope="col" className={th}>Pay period</th>
                  <th scope="col" className={th}>Payday</th>
                  <th scope="col" className={th}>LES available</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((r) => (
                  <tr key={`${r.period}-${r.half}`} className="border-b border-zinc-100" data-testid="rest-2026-row">
                    <th scope="row" className={`${td} font-medium text-left whitespace-nowrap`}>
                      {`${monthLabel(r.period).split(' ')[0]} ${r.half === 'mid' ? 'mid-month' : 'end of month'}`}
                    </th>
                    <td className={`${td} whitespace-nowrap font-semibold`}>{tableDate(r.paid)}</td>
                    <td className={`${td} whitespace-nowrap`}>{tableDate(r.les)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed mt-3">
            {`${rest2026Note()} `}
            <Link href="/pay/raise" className={link}>
              2027 pay raise calculator →
            </Link>
          </p>
        </section>

        {/* ── Guard and Reserve ───────────────────────────────────────── */}
        <section aria-labelledby="gr-h">
          <h2 id="gr-h" className="text-xl font-semibold text-zinc-900 mb-2">
            Guard and Reserve
          </h2>
          <p className="text-sm text-zinc-700 leading-relaxed" data-testid="guard-reserve">
            {GUARD_RESERVE_TEXT}
          </p>
        </section>

        {/* ── Retired and annuitant ───────────────────────────────────── */}
        <section id="retired" className="scroll-mt-20" aria-labelledby="ret-h">
          <h2 id="ret-h" className="text-xl font-semibold text-zinc-900 mb-2">
            Retired and annuitant pay dates 2027
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">{RETIRED_RULE_TEXT}</p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm" data-testid="retired-table">
              <caption className="sr-only">DFAS retired and annuitant pay dates, October 2026 to December 2027</caption>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th scope="col" className={th}>Entitlement month</th>
                  <th scope="col" className={th}>Retired pay date</th>
                  <th scope="col" className={th}>Annuitant pay date</th>
                </tr>
              </thead>
              <tbody>
                {retired.map((r) => (
                  <tr key={r.month} className="border-b border-zinc-100" data-testid="retired-row">
                    <th scope="row" className={`${td} font-medium text-left whitespace-nowrap`}>{monthLabel(r.month)}</th>
                    <td className={`${td} whitespace-nowrap`}>{tableDate(r.retired)}</td>
                    <td className={`${td} whitespace-nowrap`}>{tableDate(r.annuitant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed mt-3" data-testid="retiree-cola-line">
            {`${retireeColaLine()} `}
            <Link href="/pay/raise#key-dates" className={link}>
              2027 key dates →
            </Link>{' '}
            <Link href="/calculators/retirement" className={link}>
              Retirement calculator →
            </Link>
          </p>
        </section>

        {/* ── VA disability ───────────────────────────────────────────── */}
        <section id="va-disability" className="scroll-mt-20" aria-labelledby="va-h">
          <h2 id="va-h" className="text-xl font-semibold text-zinc-900 mb-2">
            VA disability compensation payment dates 2027
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4" data-testid="va-label">
            {VA_RULE_TEXT}
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm" data-testid="va-table">
              <caption className="sr-only">VA disability compensation payment dates</caption>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th scope="col" className={th}>Benefit month</th>
                  <th scope="col" className={th}>Paid</th>
                </tr>
              </thead>
              <tbody>
                {va.map((v) => (
                  <tr key={v.benefitMonth} className="border-b border-zinc-100" data-testid="va-row" data-paid={v.paid}>
                    <th scope="row" className={`${td} font-medium text-left whitespace-nowrap`}>{monthLabel(v.benefitMonth)}</th>
                    <td className={`${td} whitespace-nowrap`}>
                      {tableDate(v.paid)}
                      {v.reason && <span className="text-zinc-500 font-normal">{` (${v.reason})`}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed mt-3" data-testid="va-cola-line">
            {`${vaColaLine()} `}
            <Link href="/calculators/va-disability" className={link}>
              VA disability calculator →
            </Link>
          </p>
        </section>

        <FaqSection faqs={payDatesFaqs()} />

        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/pay/raise" className={link}>2027 Military Pay Raise Calculator</Link>{' '}
              <span className="text-zinc-500">— your 2027 base pay and every 2027 key date</span>
            </li>
            <li>
              <Link href="/pay" className={link}>2026 Military Pay Charts</Link>{' '}
              <span className="text-zinc-500">— official 2026 tables and pay by rank</span>
            </li>
            <li>
              <Link href="/calculators/total-compensation" className={link}>Total Compensation Calculator</Link>{' '}
              <span className="text-zinc-500">— base pay plus BAH, BAS and TSP match</span>
            </li>
          </ul>
        </section>

        <Disclaimer dataYear="2026" className="text-xs" />

        {/* ── Sources ─────────────────────────────────────────────────── */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5" data-testid="pay-dates-sources">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Sources:</strong>{' '}
            {sources.map((s, i) => (
              <span key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {s.name}
                </a>
                {i < sources.length - 1 ? '; ' : '. '}
              </span>
            ))}
            {`Last checked ${formatIsoDate(DATA_LAST_CHECKED)}.`}
          </p>
        </div>
      </div>
    </>
  );
}
