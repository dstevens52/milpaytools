import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { SeparationTimelineCalculator } from '@/components/calculators/separation-timeline/SeparationTimelineCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import Link from 'next/link';
import { CalculatorFeedbackLink } from '@/components/CalculatorFeedbackLink';

const TITLE =
  'Military Separation Benefits Timeline Calculator 2026 | MilPayTools';
const DESC =
  'See exactly when each military benefit stops, converts, or expires after your separation date. TRICARE, SGLI, TAMP, BDD filing windows, and final move deadlines — calculated from your specific date.';
const CANONICAL = '/calculators/separation-timeline';
const OG_IMAGE = `/api/og?type=calculator&title=Separation+Benefits+Timeline&v=2`;

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

export default function SeparationTimelinePage() {
  return (
    <>
      <JsonLdScript
        schema={webApplicationSchema({
          name: 'Military Separation Benefits Timeline Calculator',
          description: DESC,
          url: CANONICAL,
        })}
      />

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
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Separation Benefits Timeline
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Enter your separation date and see exactly when TRICARE, SGLI, TAMP, BDD filing, and final move deadlines hit.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your separation date' },
          { title: 'See every key deadline and benefit window' },
          { title: 'Build your separation checklist' },
        ]} />

      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <SeparationTimelineCalculator />

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Example: Key Deadlines for an E-6 Separating September 30, 2026
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6 with 10 years of service, voluntary separation on September 30, 2026. Not eligible for TAMP (voluntary ETS). Every deadline below is calculated from that single date.
          </p>
          <ExampleTable>
            <ExampleRow label="BDD filing window opens (180 days before separation)" value="April 3, 2026" />
            <ExampleRow label="BDD filing window closes (90 days before separation)" value="July 2, 2026" highlight />
            <ExampleRow label="Separation date — TRICARE ends" value="September 30, 2026" highlight />
            <ExampleRow label="SGLI free coverage ends (120 days post-separation)" value="January 28, 2027" />
            <ExampleRow label="SGLI no-exam VGLI conversion window closes (240 days)" value="May 28, 2027" highlight />
            <ExampleRow label="Final move deadline — separating member (180 days)" value="March 29, 2027" highlight />
            <ExampleRow label="VGLI conversion final deadline (485 days)" value="January 28, 2028" />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> There are three deadlines that catch separating service members off guard. First, the BDD filing window closes July 2 — if you miss it, you can still file after separation but lose the faster processing timeline. Second, the SGLI no-exam window on May 28, 2027 is critical: after that date you must answer health questions and could be denied coverage. Third, the final move deadline of March 29, 2027 is strictly enforced — contact your TMO well in advance of peak PCS season (May–August).
          </p>
        </ExampleBox>
        <CalculatorFeedbackLink />
      </section>

      {/* ── Explainer ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              SGLI to VGLI: don&apos;t miss the no-exam window
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Your Servicemembers&apos; Group Life Insurance (SGLI) continues at no cost for 120 days
              after separation. After that, it ends — but you can convert to Veterans&apos; Group Life
              Insurance (VGLI) any time within 1 year and 120 days (485 days) of separation.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The critical window: apply within 240 days and you generally won&apos;t need to prove
              you&apos;re in good health, regardless of your medical status. After 240 days, you&apos;ll need to
              answer health questions and could be denied. VGLI premiums are based on age and
              coverage amount — set a reminder well before day 240.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              What is TAMP, and are you eligible?
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The Transitional Assistance Management Program (TAMP) provides 180 days of continued
              TRICARE coverage after separation — but it&apos;s not automatic and not available to
              everyone. TAMP covers service members who separate under qualifying involuntary
              conditions, early retirement programs, or certain special separation benefits.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Verify TAMP eligibility with your branch&apos;s personnel office before you separate.
              If you don&apos;t qualify, TRICARE ends the day you leave. You&apos;ll need to arrange
              marketplace coverage, employer-sponsored insurance, or VA healthcare immediately —
              there is no grace period.
            </p>
            <Link
              href="/calculators/healthcare-comparison"
              className="mt-3 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
            >
              Compare your post-separation healthcare options →
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Filing VA disability before you separate (BDD)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The VA&apos;s Benefits Delivery at Discharge (BDD) program lets you file a disability
              claim 180 to 90 days before separation. BDD is designed to help VA process your claim
              sooner after separation — VA&apos;s goal is to deliver a rating within 30 days of your separation date.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              To use BDD, you must have a confirmed separation date, be available for VA exams
              before separation, and submit service treatment records. Your Separation Health
              Assessment (SHA) Part A supports BDD claims — schedule both at the same time. Even a
              20% rating adds $356.66/month in 2026 in ongoing monthly tax-free compensation
              if service-connected and approved.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Final move: 180 days vs. 3 years
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Separating service members have 180 days from their separation date to complete their
              final government-paid move. Retirees have up to 3 years. This deadline is strictly
              enforced — miss it and you may lose the entitlement unless an extension or exception
              is approved. Check your orders and transportation office early.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Contact your branch&apos;s Personal Property office as early as possible. Peak PCS
              season (May–August) limits capacity and popular moving dates book out months in
              advance. The move covers your household goods to your home of record or a location
              of equivalent distance, whichever you choose.
            </p>
          </div>
        </div>

        {/* TAP note */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-2">About TAP deadlines</h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Plan to complete required TAP counseling, workshops, and Capstone before final out —
            many milestones are designed to be completed no later than 90 days before separation.
            If you&apos;re planning retirement, start TAP 18–24 months before your retirement date.
            TAP includes financial planning, employment assistance, VA benefits briefings, and the
            required capstone event. Completion is tracked through your Service&apos;s personnel
            system and is a commander&apos;s requirement.
          </p>
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
              href="/transition/worksheet"
              className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
            >
              TAP Checklist Worksheet →
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
