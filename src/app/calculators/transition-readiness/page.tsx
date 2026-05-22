import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { TransitionReadinessCalculator } from '@/components/calculators/transition-readiness/TransitionReadinessCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import Link from 'next/link';

const TITLE = 'Transition Readiness Calculator 2026: Am I Financially Ready to Leave the Military? | MilPayTools';
const DESC =
  'Find out if you can afford to leave the military. Enter your rank, duty station, VA rating, target salary, and expenses — get a readiness verdict with action steps.';
const CANONICAL = '/calculators/transition-readiness';
const OG_IMAGE = `/api/og?type=calculator&title=Transition+Readiness+Calculator+2026&v=2`;

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

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="tr-page-intro border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        {/* ── Intro ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Transition Readiness Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Find out if you can afford to leave the military — compare your current compensation against civilian income, healthcare costs, and emergency fund runway.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your military profile and civilian target' },
          { title: 'See the true compensation gap' },
          { title: 'Get your readiness verdict and action steps' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}
        <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-6 &middot; 10 yrs &middot; JBSA &middot; w/dep
            </p>
            <p className="text-[12px] text-zinc-500 flex-none whitespace-nowrap">
              $75K salary &middot; 40% VA
            </p>
            <div className="flex-1 min-w-0" />
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Verdict: <span className="font-semibold text-amber-600">Not yet ready</span> &mdash; <span className="font-semibold text-zinc-700">$374/mo surplus · 2.5 mo runway</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator ─────────────────────────────────────────────── */}
      <TransitionReadinessCalculator />

      {/* ── Example Calculation ────────────────────────────────────── */}
      <section className="tr-example hidden md:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Example: Tech Sergeant (E-6), 10 Years, Separating in 14 Months
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6, 10 years of service, Joint Base San Antonio (ZIP 78234), married,
            14 months until separation, Legacy retirement system, targeting $75,000/year
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
            <Link
              href="/calculators/healthcare-comparison"
              className="mt-3 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
            >
              Compare TRICARE to civilian healthcare options →
            </Link>
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
              adds roughly $883/month. This income is excluded from federal income tax and doesn&apos;t
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
            <li>
              Post-TAMP healthcare costs —{' '}
              <Link href="/calculators/healthcare-comparison" className="font-medium text-red-700 hover:text-red-800 transition-colors">
                use the Healthcare Cost Comparison Calculator
              </Link>{' '}
              to see costs across employer plans, ACA marketplace, VA care, and TRICARE Reserve Select
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
            <Link
              href="/calculators/healthcare-comparison"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              Healthcare Cost Comparison Calculator →
            </Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
