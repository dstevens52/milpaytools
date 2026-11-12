import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { ColaCalculator } from '@/components/calculators/cola/ColaCalculator';
import { ColaAreaTable } from '@/components/calculators/cola/ColaAreaTable';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { lookupCola } from '@/lib/calculations/cola';
import { COLA_AREAS, COLA_SOURCE, DATA_YEAR, highestIndexArea } from '@/data/cola/2026/constants';

// ── Everything below is computed from src/data/cola/2026/constants.ts ─────────
const AREA_COUNT = COLA_AREAS.length;
const COLA_STATES = [...new Set(COLA_AREAS.map((a) => a.state))];

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const TITLE = `CONUS COLA Calculator ${DATA_YEAR}: Eligible Locations & Index`;
const DESCRIPTION = `Check whether your duty station is one of the ${AREA_COUNT} military housing areas on DTMO's official ${DATA_YEAR} CONUS COLA list, see its COLA index, and get your exact amount from DTMO's rate lookup.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: '/calculators/cola',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: '/calculators/cola',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: `CONUS COLA Calculator ${DATA_YEAR}`, sub: `Is your duty station on the official ${DATA_YEAR} list, and its index` }),
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ogImage({ type: 'calculator', title: `CONUS COLA Calculator ${DATA_YEAR}`, sub: `Is your duty station on the official ${DATA_YEAR} list, and its index` }),
  },
};

const COLA_FAQS: FaqItem[] = [
  {
    question: "Why doesn't this calculator show a dollar amount?",
    answer:
      "CONUS COLA is calculated from your pay grade, years of service, dependents, and DTMO's spendable-income tables. To avoid showing an estimate that could be wrong, we show whether your duty station qualifies and its official index, and link to DTMO's rate lookup for your exact amount.",
  },
  {
    question: 'What does the COLA index mean?',
    answer:
      'It reflects how much higher non-housing costs are at that duty station than the national average. A higher index means a larger allowance at the same grade, years of service, and dependents.',
  },
  {
    question: 'Is CONUS COLA taxable?',
    answer: 'Yes. Unlike BAH and BAS, CONUS COLA is taxable income.',
  },
  {
    question: 'How often does the list change?',
    answer: `DTMO publishes the CONUS COLA location list each year, and areas can gain or lose eligibility. This page reflects the ${DATA_YEAR} list.`,
  },
];

export default function ColaPage() {
  // ── Hero sample + worked example, computed from the data file and the lib ────
  const top = highestIndexArea();
  const exEligible = lookupCola('98101'); // Seattle
  const exNotEligible = lookupCola('93940'); // Monterey
  const exEligibleLabel = exEligible.status === 'eligible' ? exEligible.dtmoName : 'ZIP 98101';
  const exNotEligibleLabel = exNotEligible.status === 'not-found' ? 'ZIP 93940' : exNotEligible.mhaName;
  const statusText = (r: typeof exEligible) =>
    r.status === 'eligible'
      ? `${DATA_YEAR} COLA area · ${r.index}% index`
      : r.status === 'not-eligible'
        ? `Not a ${DATA_YEAR} COLA area`
        : 'ZIP not found';

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: `CONUS COLA Calculator ${DATA_YEAR}`, description: DESCRIPTION, url: '/calculators/cola' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        {/* ── Intro ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official {DATA_YEAR} DTMO Location List
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            CONUS COLA Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Check whether your duty station is on DTMO&apos;s official {DATA_YEAR}{' '}CONUS COLA list and see
            its COLA index. Then get your exact monthly amount from DTMO&apos;s rate lookup.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your duty station ZIP' },
          { title: `Check ${DATA_YEAR} CONUS COLA eligibility and index` },
          { title: "Get your exact amount from DTMO's rate lookup" },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden" data-testid="cola-hero-sample">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              {top.dtmoName}
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">
                {DATA_YEAR} COLA index <span className="font-semibold text-zinc-700">{top.index}%</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Highest {DATA_YEAR}{' '}index &middot; Taxable
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10">
        <ColaCalculator />

        <ColaAreaTable />

        {/* Example Calculation */}
        <div className="calc-example">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Example: one duty station on the {DATA_YEAR}{' '}list, one that isn&apos;t
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Two ZIP codes run through the calculator above: downtown Seattle (98101) and Monterey
            (93940), home of the Naval Postgraduate School and the Defense Language Institute.
          </p>
          <ExampleTable>
            <ExampleRow label={`${exEligibleLabel} (ZIP 98101)`} value={statusText(exEligible)} highlight />
            <ExampleRow label={`${exNotEligibleLabel} (ZIP 93940)`} value={statusText(exNotEligible)} />
            <ExampleRow label="Tax treatment" value="Taxable income" />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> A member stationed in {exEligibleLabel} receives CONUS COLA
            {exEligible.status === 'eligible' ? ` at the area's ${exEligible.index}% index` : ''}; the
            monthly amount depends on pay grade, years of service, and dependents, and DTMO&apos;s rate
            lookup gives the exact figure. Monterey is a high-cost area, but it is not on the {DATA_YEAR}{' '}
            list, so members there don&apos;t receive CONUS COLA this year.
          </p>
        </ExampleBox>
        </div>

        {/* Explainer */}
        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is CONUS COLA?</h2>
            <p className="text-zinc-600 mb-3">
              CONUS COLA (Continental U.S. Cost of Living Allowance) is a supplemental pay
              entitlement for service members stationed in high-cost CONUS locations where the cost
              of living substantially exceeds the national average. It is paid in addition to BAH
              and BAS — it does not replace or reduce those allowances.
            </p>
            <p className="text-zinc-600">
              CONUS COLA is governed by 37 U.S.C. § 403b and administered by the Defense Travel
              Management Office (DTMO), which publishes the qualifying locations and their index
              each year, and the rates by grade, years of service, and dependents.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              How CONUS COLA differs from BAH
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-zinc-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">BAH</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">CONUS COLA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Purpose', 'Offset housing costs', 'Offset high non-housing costs'],
                    ['Who receives it', 'All members assigned to CONUS duty stations', `Members in the ${AREA_COUNT} qualifying military housing areas only`],
                    ['Taxable?', 'No — tax-free', 'Yes — taxable income'],
                    ['Basis', 'Pay grade + ZIP code + dependency status', 'Qualifying area + pay grade + years of service + dependents'],
                    ['Updated', 'January 1 each year', 'Annually by DTMO'],
                    ['Paid together?', 'Yes — both can be paid simultaneously', 'Yes — paid in addition to BAH'],
                  ].map(([feature, bah, cola]) => (
                    <tr key={feature} className="border-t border-zinc-100">
                      <td className="px-4 py-3 font-medium text-zinc-700">{feature}</td>
                      <td className="px-4 py-3 text-zinc-600">{bah}</td>
                      <td className="px-4 py-3 text-zinc-600">{cola}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Which areas qualify for CONUS COLA?
            </h2>
            <p className="text-zinc-600 mb-3">
              DTMO&apos;s official {DATA_YEAR} location list names {AREA_COUNT} military housing areas in{' '}
              {COLA_STATES.length} states: {listJoin(COLA_STATES)}. The full list, with each
              area&apos;s index, is in the table above. Eligibility follows DTMO&apos;s military housing
              area boundaries, which don&apos;t always match city or county lines — that&apos;s why this
              calculator checks by ZIP code.
            </p>
            <p className="text-zinc-600 mb-3">
              Most CONUS duty stations do not qualify. Members at installations like Fort Bragg
              (Fayetteville, NC) or Fort Hood (Killeen, TX) do not receive CONUS COLA, and some
              high-cost areas — Monterey and the National Capital Region among them — are not on
              the {DATA_YEAR} list.
            </p>
            <p className="text-zinc-600">
              For your exact monthly amount, use{' '}
              <a
                href={COLA_SOURCE.rateLookupUrl}
                target="_blank"
                rel="noopener"
                className="text-blue-700 underline hover:text-blue-800"
              >
                DTMO&apos;s CONUS COLA rate lookup
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              CONUS COLA and your tax picture
            </h2>
            <p className="text-zinc-600 mb-3">
              Unlike BAH and BAS, which are excluded from federal income tax, CONUS COLA is fully
              taxable. This is an important distinction when calculating your total take-home
              compensation.
            </p>
            <p className="text-zinc-600">
              In the 22% federal tax bracket, you keep about 78 cents of each COLA dollar before
              state tax. When comparing duty stations, consider the after-tax value — the pre-tax
              COLA amount overstates what reaches your account.
            </p>
          </div>

          <FaqSection faqs={COLA_FAQS} />

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Related calculators</h2>
            <ul className="space-y-2">
              <li>
                <a href="/calculators/total-compensation" className="text-blue-700 hover:text-blue-800 underline">
                  Total Military Compensation Calculator
                </a>{' '}
                — See your full compensation package including BAH, BAS, and tax advantages
              </li>
              <li>
                <Link href="/bah" className="text-blue-700 hover:text-blue-800 underline">
                  BAH Calculator
                </Link>{' '}
                — Look up your Basic Allowance for Housing by ZIP code and pay grade
              </li>
              <li>
                <a href="/calculators/pcs" className="text-blue-700 hover:text-blue-800 underline">
                  PCS Cost Estimator
                </a>{' '}
                — Estimate DLA, MALT mileage, per diem, and PPM net proceeds for your next move
              </li>
            </ul>
          </div>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
