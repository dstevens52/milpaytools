import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { HealthcareComparisonCalculator } from '@/components/calculators/healthcare-comparison/HealthcareComparisonCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import Link from 'next/link';

const TITLE = 'Military Healthcare Cost Comparison Calculator 2026 | MilPayTools';
const DESC =
  'See exactly how much healthcare will cost after military separation — employer insurance, ACA Marketplace, VA healthcare, and TRICARE Reserve Select compared against active-duty TRICARE rates.';
const CANONICAL = '/calculators/healthcare-comparison';
const OG_IMAGE = `/api/og?type=calculator&title=Healthcare+Cost+Comparison&v=2`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: 'website',
    url: CANONICAL,
    siteName: 'MilPayTools',
    images: [{ url: OG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
};

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border border-zinc-200 rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-white hover:bg-zinc-50 transition-colors list-none">
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <svg
          className="w-4 h-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-3 bg-white text-sm text-zinc-600 leading-relaxed space-y-3 border-t border-zinc-100">
        {children}
      </div>
    </details>
  );
}

export default function HealthcareComparisonPage() {
  return (
    <>
      <JsonLdScript
        schema={webApplicationSchema({
          name: 'Military Healthcare Cost Comparison Calculator',
          description: DESC,
          url: CANONICAL,
        })}
      />

      {/* ── Page intro ────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Healthcare Cost Comparison
              </h1>
              <p className="hidden md:block text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Active-duty TRICARE costs you nothing. Civilian healthcare can cost thousands per year.
                Estimate what that gap could look like for your family — employer insurance, ACA Marketplace,
                VA healthcare, and TRICARE Reserve Select compared side by side.
              </p>
            </div>
          </div>

          <div className="mt-3 hidden md:flex flex-wrap gap-3">
            {[
              { icon: '🏥', text: 'Employer vs. ACA vs. VA' },
              { icon: '💰', text: 'First-year cost estimate' },
              { icon: '🛡️', text: 'TAMP 180-day bridge split' },
              { icon: '📊', text: '2026 rate data' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                <span>{icon}</span>
                {text}
              </span>
            ))}
          </div>
          <div className="hidden md:block">
            <DataCurrencyBadge source="KFF, VA.gov, TRICARE.mil — 2026 estimates" />
          </div>
        </div>
      </div>

      {/* ── 3-step plan strip ────────────────────────────────────────── */}
      <div className="hidden md:block border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-5">
            {[
              { n: 1, title: 'Enter your family size and service status' },
              { n: 2, title: 'Compare TRICARE, employer, ACA, and VA options' },
              { n: 3, title: 'See your first-year healthcare cost for each option' },
            ].map(({ n, title }, i, arr) => (
              <>
                <div key={n} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none">
                    {n}
                  </div>
                  <p className="font-semibold text-zinc-700 text-sm whitespace-nowrap">{title}</p>
                </div>
                {i < arr.length - 1 && (
                  <svg key={`sep-${n}`} className="w-4 h-4 text-zinc-300 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <HealthcareComparisonCalculator />

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does Healthcare Cost an E-5 Family of 3 After Separation?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5 separating after 8 years, married with one child (family of 3). 40% VA disability rating. No TAMP eligibility (voluntary ETS). Comparing all options available in 2026.
          </p>
          <ExampleTable>
            <ExampleRow label="Active-duty TRICARE Prime (for reference)" value="$0/mo — $0/yr" />
            <ExampleRow label="Employer plan — family (avg employee share, Silver tier)" value="$570/mo — $6,840/yr" highlight />
            <ExampleRow label="Employer plan — typical family deductible & copays" value="+$1,500–$2,500/yr" />
            <ExampleRow label="Employer plan — true first-year cost" value="~$8,340–$9,340/yr" highlight />
            <ExampleRow label="ACA Marketplace silver plan (family, unsubsidized)" value="$1,200/mo — $14,400/yr" />
            <ExampleRow label="VA Healthcare (member only — SC conditions, 40% rating)" value="$0 for SC care; family not covered" />
            <ExampleRow label="TRICARE Reserve Select — member + family (if joining Guard/Reserve)" value="$286.66/mo — $3,440/yr" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> Even the most affordable family option — TRICARE Reserve Select at $3,440/year — costs more than $0 active-duty TRICARE. For most separating service members without TAMP, the realistic choice is between an employer plan (~$8,000–$9,000/year after deductibles) and, if joining the Guard or Reserves, TRS at $3,440/year. VA healthcare is valuable but covers the veteran only — your family will still need separate coverage. The $8,000–$10,000/year swing is the single largest underestimated cost of leaving the military.
          </p>
        </ExampleBox>
      </section>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        <hr className="border-zinc-200" />
        <h2 className="text-xl font-semibold text-zinc-900">Understanding your healthcare options</h2>

        <div className="space-y-3">
          <Accordion title="What healthcare options do I have after separation?">
            <p>
              When you leave active duty, your TRICARE coverage ends on your separation date (or after 180 days if you qualify for TAMP). You have several paths:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Employer-sponsored insurance</strong> — if your new employer offers health benefits, this is often a strong starting point because employers usually pay a large share of the premium, significantly lowering your out-of-pocket cost.</li>
              <li><strong>ACA Marketplace</strong> — individual and family plans available through healthcare.gov. Premiums can be offset by subsidies if your income is below 400% of the Federal Poverty Level.</li>
              <li><strong>VA Healthcare</strong> — free or low-cost care for veterans with service-connected conditions. Does not cover your family.</li>
              <li><strong>TRICARE Reserve Select (TRS)</strong> — available to members of the Selected Reserve. Lower premiums than ACA in most cases, but requires you to join a Reserve or Guard unit.</li>
              <li><strong>TAMP</strong> — if you qualify, free TRICARE coverage for 180 days. Use this window to plan and enroll in a permanent option before day 181.</li>
            </ul>
          </Accordion>

          <Accordion title="How does TAMP work and am I eligible?">
            <p>
              The Transitional Assistance Management Program (TAMP) provides 180 days of TRICARE Prime or Select coverage after separation at no cost to you or your family — the same coverage you had on active duty.
            </p>
            <p>
              TAMP is not automatic and not available to everyone. Qualifying conditions include: involuntary separation (e.g., reduction in force), early retirement, separation under the Voluntary Separation Incentive (VSI) or Special Separation Benefit (SSB), and certain other special programs.
            </p>
            <p>
              Verify your TAMP eligibility with your branch&apos;s personnel office before separating. If you do qualify, use the 180-day window to compare options, enroll in employer insurance, and avoid a gap in coverage. TAMP ends hard on day 181 — there is no grace period.
            </p>
          </Accordion>

          <Accordion title="What does VA healthcare actually cover?">
            <p>
              VA healthcare covers eligible veterans for conditions that are service-connected (SC) and, at higher eligibility tiers, for general medical care as well. Key points:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>All veterans with a service-connected (SC) disability rating receive care for SC conditions at $0 copay for service-connected care. No premiums.</li>
              <li>Veterans with 50%+ disability ratings (Priority Group 1) generally face $0 copays for most care. Veterans at lower ratings may have copays for non-SC care — amounts vary by priority group.</li>
              <li>0% SC veterans receive care generally limited to their service-connected conditions.</li>
              <li><strong>VA healthcare covers the veteran only</strong> — your spouse and children are not covered and will need separate insurance.</li>
            </ul>
            <p>
              VA healthcare can be a valuable part of your post-service plan, but it covers the veteran only — not spouse or children. Most veterans use VA for SC conditions and employer or ACA coverage for their family and non-SC care. Verify your specific copay schedule at VA.gov based on your priority group.
            </p>
          </Accordion>

          <Accordion title="How do ACA Marketplace subsidies work?">
            <p>
              The Affordable Care Act&apos;s premium tax credits (APTC) can significantly reduce your monthly premium if your household income falls below a certain percentage of the Federal Poverty Level (FPL). Generally, lower income relative to the FPL means a larger subsidy — but the exact amount depends on your age, location, and the benchmark plan in your area.
            </p>
            <p className="text-xs text-zinc-500">
              FPL thresholds are based on 2025 federal poverty guidelines used for the 2026 coverage year. Verify current figures at Healthcare.gov.
            </p>
            <p>
              Subsidies are calculated at tax time and can be taken in advance to reduce your monthly premium. If your income changes during the year, update your marketplace enrollment to avoid a repayment at filing. Losing employer coverage (like separating from service) is a qualifying life event that opens a special enrollment period.
            </p>
          </Accordion>

          <Accordion title="What is TRICARE Reserve Select?">
            <p>
              TRICARE Reserve Select (TRS) is a premium-based health plan available to members of the Selected Reserve who are not on active duty orders. In 2026, premiums are $57.88/month for the member only and $286.66/month for member plus family.
            </p>
            <p>
              TRS provides TRICARE Select-level benefits — comparable to a civilian PPO — with access to the TRICARE network of providers. Annual deductibles are low: $150 for individuals and $300 for families.
            </p>
            <p>
              To qualify, you must be an actively drilling member of the National Guard or Reserves. If you separate from active duty and join a Reserve unit, TRS can be one of the most cost-effective post-separation coverage options available — often cheaper than both ACA and employer options at equivalent coverage levels.
            </p>
          </Accordion>

          <Accordion title="How much should I budget for healthcare in my first civilian year?">
            <p>
              Plan for more than just monthly premiums. A realistic first-year healthcare budget includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Premiums</strong> — your monthly cost × 12. For a family, employer Silver plans average around $6,840/year in employee-paid premiums.</li>
              <li><strong>Deductible costs</strong> — most families use roughly 40–50% of their deductible in a given year for routine care. At a $4,000 deductible, budget $1,600–$2,000 for deductible expenses.</li>
              <li><strong>Copays and coinsurance</strong> — even after hitting your deductible, many plans charge 20–30% coinsurance until you reach your out-of-pocket maximum.</li>
              <li><strong>Dental and vision</strong> — most medical plans do not include dental or vision. Budget $30–$80/month for separate dental and vision coverage if you&apos;re coming off TRICARE Dental.</li>
            </ul>
            <p>
              A conservative total healthcare budget for a family in year one is often $10,000–$15,000 depending on plan tier and utilization. This is one of the largest and most frequently underestimated costs of military separation.
            </p>
          </Accordion>
        </div>

        {/* Related resources */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Related resources
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/transition-readiness"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Transition Readiness Calculator →
            </Link>
            <Link
              href="/calculators/separation-timeline"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Separation Benefits Timeline →
            </Link>
            <Link
              href="/transition"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Military Transition Financial Roadmap →
            </Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
