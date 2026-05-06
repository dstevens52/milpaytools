import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { TransitionReadinessCalculator } from '@/components/calculators/transition-readiness/TransitionReadinessCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import Link from 'next/link';

const TITLE = 'Transition Readiness Calculator 2026: Am I Financially Ready to Leave the Military? | MilPayTools';
const DESC =
  'Find out if you can afford to leave the military. Enter your rank, duty station, VA rating, target salary, and expenses — get a readiness verdict with action steps.';
const CANONICAL = '/calculators/transition-readiness';
const OG_IMAGE = `/api/og?type=calculator&title=Transition+Readiness+Calculator+2026&v=2`;

export const metadata: Metadata = {
  title: TITLE,
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

export default function TransitionReadinessPage() {
  return (
    <>
      <JsonLdScript
        schema={webApplicationSchema({
          name: 'Transition Readiness Calculator 2026',
          description: DESC,
          url: CANONICAL,
        })}
      />

      {/* ── Page intro ─────────────────────────────────────────────── */}
      <div className="tr-page-intro bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Transition Readiness Calculator
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Separating from the military isn&apos;t just a career change — it&apos;s a complete
                financial reset. This calculator compares what you earn now against what you&apos;ll
                need on the civilian side: salary, VA compensation, healthcare costs, and emergency
                fund runway. The result is a clear verdict and the specific gaps standing between
                you and a financially safe separation.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: '📊', text: 'Full compensation comparison' },
              { icon: '🏥', text: 'Healthcare replacement cost' },
              { icon: '🛡️', text: 'VA disability included' },
              { icon: '💰', text: 'Emergency fund runway' },
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
          <DataCurrencyBadge source="Official DFAS, DTMO &amp; VA rates" />
        </div>
      </div>

      {/* ── Calculator ─────────────────────────────────────────────── */}
      <TransitionReadinessCalculator />

      {/* ── Example Calculation ────────────────────────────────────── */}
      <section className="tr-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Example: Tech Sergeant (E-6), 10 Years, Separating in 14 Months
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6, 10 years of service, Joint Base San Antonio (ZIP 78234), married with
            2 kids, 14 months until separation, Legacy retirement system, targeting $75,000/year
            in IT, 40% VA rating (expected), spouse earns $24,000/year part-time,
            $15,000 emergency fund, $45,000 TSP, $4,200/month in household expenses.
          </p>
          <ExampleTable>
            <ExampleRow label="Current military base pay (E-6, 10 YOS — 2026 table)" value="$4,759/mo" />
            <ExampleRow label="BAH — JBSA (ZIP 78234, with dependents)" value="$2,094/mo" />
            <ExampleRow label="BAS — Enlisted" value="$477/mo" />
            <ExampleRow label="Total military compensation (pre-tax)" value="$7,330/mo" highlight />
            <ExampleRow label="Post-separation: $75K salary after federal + FICA + state tax" value="$4,084/mo" />
            <ExampleRow label="VA disability — 40%, with dependents (tax-free)" value="$883/mo" />
            <ExampleRow label="Spouse income ($24K) after tax" value="$1,307/mo" />
            <ExampleRow label="Total projected civilian income" value="$6,274/mo" highlight />
            <ExampleRow label="Monthly expenses" value="$4,200/mo" />
            <ExampleRow label="Healthcare replacement (family, market rate)" value="+$1,700/mo" />
            <ExampleRow label="Total adjusted expenses" value="$5,900/mo" highlight />
            <ExampleRow label="Monthly surplus" value="$374/mo" />
            <ExampleRow label="Emergency fund runway ($15K ÷ $5,900/mo)" value="2.5 months" />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>Verdict: Not yet ready.</strong> The monthly surplus is thin ($374) and the
            emergency fund covers only 2.5 months — below the 3-month minimum for even a
            &quot;yellow&quot; status. The healthcare cost alone ($1,700/month for a family) is the
            biggest surprise for most service members who&apos;ve never paid a TRICARE premium.
            With 14 months remaining, this member has time to close the gaps — the action steps
            focus on building the emergency fund to 6 months and targeting a slightly higher
            civilian salary.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ──────────────────────────────────────────────── */}
      <div className="tr-explainer max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Why healthcare is the most underestimated transition cost
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Active-duty service members pay nothing for TRICARE Prime. It covers the service
              member and all family members with zero premiums, $0 copays at military treatment
              facilities, and minimal out-of-pocket costs. It&apos;s invisible because it&apos;s never
              a line item on your LES.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              When you separate, that coverage ends the day you leave. Replacing it for a family
              costs $1,400–$2,000/month on the open market (KFF 2025 Employer Health Benefits
              Survey, silver-tier marketplace). Even with an employer plan, your share of premiums
              plus deductibles and copays can easily exceed $10,000/year for a family. Plan for it
              before you separate, not after.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Filing VA disability before you separate
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The VA&apos;s Benefits Delivery at Discharge (BDD) program lets you file a claim
              while you&apos;re still on active duty — 180 to 90 days before your separation date.
              VA&apos;s goal is to deliver a decision within 30 days after separation, but timing
              depends on claim complexity, exams, records, and workload.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Even a 20% rating adds $286/month tax-free for life. A 40% rating with dependents
              adds roughly $840/month. This income is excluded from federal income tax and doesn&apos;t
              count against your civilian salary in most contexts. It can meaningfully close the
              income gap from day one.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              How this calculator defines &quot;ready&quot;
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Three factors determine the verdict: income surplus, emergency fund runway, and VA
              claim status. <strong>Ready</strong> requires all three to be green — a $500+/month
              income surplus after replacing healthcare, at least 6 months of expenses in liquid
              savings, and a VA rating filed (or retirement making VA moot).
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              <strong>Almost</strong> means no income deficit, but one factor isn&apos;t quite there.{' '}
              <strong>Not yet</strong> means there&apos;s an income gap, the emergency fund is under
              3 months, or both — things that genuinely need to be addressed before your separation
              date becomes real.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Why your TSP doesn&apos;t count as an emergency fund
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TSP balances are excluded from the emergency fund calculation intentionally.
              Withdrawals before age 59½ trigger ordinary income tax plus a 10% early withdrawal
              penalty. On a $45,000 balance, that&apos;s potentially $15,000+ in tax and penalties —
              making it a very expensive emergency fund.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Liquid savings (savings accounts, money market, short-term CDs) are what count for
              transition runway. Your TSP stays invested and compounds. The calculator counts your
              emergency fund and other liquid savings, not TSP, toward your runway months.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-2">What this calculator does not include</h3>
          <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
            <li>Special pay still active at separation (hazardous duty, sea pay, etc.)</li>
            <li>
              Severance pay (for involuntary separations) — significant if applicable, verify with your finance office
            </li>
            <li>
              State income tax on VA disability or military retirement — several states exempt both; verify for your new state
            </li>
            <li>
              Commissary and exchange savings that disappear at separation — often $2,000–$4,000/year for an active family
            </li>
            <li>
              GI Bill housing allowance if you&apos;re planning to use education benefits post-separation — this can be a meaningful income source
            </li>
            <li>
              TAMP (Transitional Assistance Management Program) — 180 days of continued TRICARE for eligible separating members;{' '}
              verify eligibility before assuming you need to buy marketplace coverage immediately
            </li>
          </ul>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Related resources
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/transition"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Military Transition Financial Roadmap →
            </Link>
            <Link
              href="/calculators/va-disability"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              VA Disability Rating Calculator →
            </Link>
            <Link
              href="/blog/what-civilian-salary-do-i-need"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              What Civilian Salary Do I Need? →
            </Link>
            <Link
              href="/blog/are-you-financially-ready-to-leave-the-military"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Are You Financially Ready to Leave? (full article) →
            </Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
