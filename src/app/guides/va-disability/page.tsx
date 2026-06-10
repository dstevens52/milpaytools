import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'Stop guessing your VA combined rating — and what it\'s worth.';
const DESC =
  'VA math is confusing by design. 50% + 30% doesn\'t equal 80%. Use the free calculator to see your exact combined rating, your monthly compensation, and what adding another condition could do.';
const CANONICAL = '/guides/va-disability';
const DATE = '2026-04-12';
const OG_IMAGE = '/api/og?type=guide&title=VA+Disability+Benefits+Guide+2026&v=2';

export const metadata: Metadata = {
  title: { absolute: `${TITLE}` },
  description: DESC,
  alternates: { canonical: `https://www.milpaytools.com${CANONICAL}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: 'article',
    url: CANONICAL,
    siteName: 'MilPayTools',
    publishedTime: DATE,
    authors: ['Dan Stevens'],
    images: [{ url: OG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
};

const FAQS = [
  {
    question: 'How does the VA combined rating formula work?',
    answer:
      'The VA uses "whole person" math under 38 CFR § 4.25. Each disability reduces from remaining functional capacity, not from 100%. Example: 50% + 30% — start at 100, subtract 50% (leaves 50), then subtract 30% of 50 (15), leaving 35. Combined = 65%, rounded to 70%. Rounding occurs once at the end: values ending in 1–4 round down, 5–9 round up.',
  },
  {
    question: 'What is the VA bilateral factor and how does it affect my rating?',
    answer:
      'Under 38 CFR § 4.26, if you have compensable ratings on both sides of a paired body part (both knees, both shoulders, both hands, etc.), the VA applies a 10% boost to the combined value of those bilateral ratings before mixing them into the main calculation. This can push your combined rating across a rounding threshold worth hundreds of dollars per month.',
  },
  {
    question: 'What are the 2026 VA disability monthly compensation rates?',
    answer:
      '2026 monthly rates (veteran alone): 10% = $180.42; 20% = $356.66; 30% = $552.47; 40% = $795.84; 50% = $1,132.90; 60% = $1,435.02; 70% = $1,808.45; 80% = $2,102.15; 90% = $2,362.30; 100% = $3,938.58. VA disability compensation is excluded from federal taxable income. Dependent additions apply at 30% rating and above.',
  },
  {
    question: 'What is Benefits Delivery at Discharge (BDD) and why does it matter?',
    answer:
      'BDD lets you file 180 to 90 days before separation, giving VA time to review records and schedule exams while you\'re still in. If approved, compensation can generally begin as early as the day after separation, rather than being delayed by filing later. Filing through BDD may help the VA process your claim sooner.',
  },
  {
    question: 'What if your VA rating decision seems too low?',
    answer:
      'An initial VA decision isn\'t final. If you believe it\'s incomplete or contains an error, the VA offers three free review options: a Supplemental Claim (VA Form 20-0995) to add new and relevant evidence, a Higher-Level Review (VA Form 20-0996) for a senior reviewer to re-examine the existing evidence, or a Board Appeal (VA Form 10182) to a Veterans Law Judge at the Board of Veterans\' Appeals. You generally have one year from the date on your decision letter to request a Higher-Level Review or Board Appeal; a Supplemental Claim can be filed anytime, but filing within one year preserves your original effective date. A VA-accredited Veterans Service Officer (VSO) can review your decision and file on your behalf at no cost.',
  },
  {
    question: 'What is CRDP and who qualifies?',
    answer:
      'Concurrent Retirement and Disability Pay (CRDP) allows veterans with 20+ years of qualifying service and a VA disability rating of 50% or higher to receive both full military retirement pay and full VA disability compensation with no dollar-for-dollar offset.',
  },
  {
    question: 'What is CRSC and when is it better than CRDP?',
    answer:
      'Combat-Related Special Compensation (CRSC) is for retirees whose disabilities are specifically combat-related. Unlike retirement pay, CRSC is non-taxable — which can make it worth more after taxes than CRDP, especially for veterans in the 22%+ bracket with combat-related conditions below 50% VA rating.',
  },
  {
    question: 'What are VA rating stability protections?',
    answer:
      'Ratings held 5+ years receive a stabilization protection (higher evidence threshold required for reduction). Ratings held 10+ years cannot be severed unless fraud was involved. Ratings held 20+ years are considered permanent and protected from reduction.',
  },
];

const INSIGHT_CARDS = [
  {
    accent: 'bg-blue-800',
    label: 'Thing 1',
    title: 'VA math doesn\'t add up the way you think',
    description:
      'The VA uses "whole person" math — each rating reduces from what\'s left, not from 100%. Two 50% ratings combine to 75%, not 100%. Where you land near a rounding threshold can swing your compensation by hundreds per month.',
    cta: 'See how the formula works →',
    href: '#learning',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Thing 2',
    title: 'Filing before separation can protect your earliest payment date',
    description:
      'BDD lets you file 180 to 90 days before separation, giving VA time to review records while you\'re still in. If approved, compensation can begin as early as the day after separation.',
    cta: 'Learn about BDD timing →',
    href: '#learning',
  },
  {
    accent: 'bg-amber-600',
    label: 'Thing 3',
    title: 'Retirement + VA disability interact in complex ways',
    description:
      'Eligible military retirees with a VA disability rating of 50% or higher generally receive retired pay restored through CRDP, allowing them to receive both military retired pay and VA disability compensation without the old dollar-for-dollar offset. Combat-related disabilities may qualify for CRSC instead — which is non-taxable. The comparison depends on your specific numbers.',
    cta: 'Understand CRDP vs CRSC →',
    href: '#learning',
  },
];

const ACCORDION = [
  {
    question: 'How does the VA combined rating formula actually work?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The VA does not add disability ratings together. Instead, it uses the{' '}
          <strong className="text-zinc-800">&quot;whole person&quot; method</strong> defined in 38 CFR § 4.25.
          Your body starts at 100% functional capacity. Each disability reduces from whatever
          capacity <em>remains</em>, not from the original 100%.
        </p>
        <p><strong className="text-zinc-800">Step-by-step example: 50% + 30%</strong></p>
        <ol className="space-y-1 pl-4 list-decimal">
          <li>Start: 100% whole person</li>
          <li>Apply highest rating first (50%): 100 − 50 = <strong className="text-zinc-800">50% remaining</strong></li>
          <li>Apply next rating to what&apos;s left (30% of 50): 30% × 50 = 15 → remaining = <strong className="text-zinc-800">35%</strong></li>
          <li>Combined disability: 100 − 35 = <strong className="text-zinc-800">65%</strong></li>
          <li>Round to nearest 10%: <strong className="text-zinc-800">70%</strong></li>
        </ol>
        <p>
          In a standard non-bilateral calculation, VA combines the conditions first, then rounds the
          final combined value to the nearest 10%. Values ending in 1–4 round down; values ending in
          5–9 round up.
        </p>
        <p>
          <strong className="text-zinc-800">Why this matters:</strong> The difference between 64.4%
          and 65% is the difference between a 60% rating ($1,435.02/month) and a 70% rating
          ($1,808.45/month) — a gap of $373.43/month or $4,481/year. Knowing your exact
          combined value tells you how close you are to the next threshold and what an additional
          condition could do.
        </p>
        <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your combined rating step by step →
        </Link>
      </div>
    ),
  },
  {
    question: 'What is the bilateral factor and when does it help?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The bilateral factor under <strong className="text-zinc-800">38 CFR § 4.26</strong> works
          in your favor. If you have compensable ratings (greater than 0%) on{' '}
          <strong className="text-zinc-800">both sides of a paired body part</strong> — both knees,
          both hips, both shoulders, both ankles, both hands, both feet, or both eyes — the VA
          applies a 10% increase to the combined value of those bilateral ratings before mixing them
          into the main calculation.
        </p>
        <p><strong className="text-zinc-800">Example: Left knee 30% + Right knee 20% + PTSD 50%</strong></p>
        <p>Step 1 — Combine the bilateral pair on the § 4.25 table:</p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>30 &amp; 20 → <strong className="text-zinc-800">44%</strong> bilateral combined value</li>
        </ul>
        <p>Step 2 — Apply bilateral factor (+10%):</p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>10% of 44 = 4.4 → 44 + 4.4 = 48.4 → rounds to <strong className="text-zinc-800">48%</strong> (replaces the pair in the main calc)</li>
        </ul>
        <p>Step 3 — Combine with PTSD (50%):</p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>48 &amp; 50 → <strong className="text-zinc-800">74%</strong> → rounds to <strong className="text-zinc-800">70%</strong></li>
        </ul>
        <p>
          Near a rounding boundary, the bilateral factor can push you across a threshold worth
          hundreds per month. If symptoms affect both sides of a paired extremity, reviewing
          both sides with a VSO or accredited representative can help ensure your claim reflects
          the full medical picture.
        </p>
      </div>
    ),
  },
  {
    question: 'What are the 2026 VA disability compensation rates?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed" id="rates">
        <p>VA disability compensation is excluded from federal taxable income.</p>
        <p><strong className="text-zinc-800">2026 monthly rates (veteran alone, no dependents):</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-1.5 pr-4 font-semibold text-zinc-700">Rating</th>
                <th className="text-left py-1.5 pr-4 font-semibold text-zinc-700">Monthly</th>
                <th className="text-left py-1.5 font-semibold text-zinc-700">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                ['10%', '$180.42', '$2,165'],
                ['20%', '$356.66', '$4,280'],
                ['30%', '$552.47', '$6,630'],
                ['40%', '$795.84', '$9,550'],
                ['50%', '$1,132.90', '$13,595'],
                ['60%', '$1,435.02', '$17,220'],
                ['70%', '$1,808.45', '$21,701'],
                ['80%', '$2,102.15', '$25,226'],
                ['90%', '$2,362.30', '$28,348'],
                ['100%', '$3,938.58', '$47,263'],
              ].map(([r, m, a]) => (
                <tr key={r}>
                  <td className="py-1.5 pr-4 font-medium text-zinc-800">{r}</td>
                  <td className="py-1.5 pr-4 tabular-nums text-zinc-700">{m}</td>
                  <td className="py-1.5 tabular-nums text-zinc-700">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>30% is a key compensation breakpoint.</strong> At 10% and 20%, the monthly
            payment is the same regardless of dependents. At 30% and above, spouse, child, and
            dependent-parent additions apply and can add $60–$160+ per month depending on rating
            and family size.
          </p>
        </div>
        <p>
          <strong className="text-zinc-800">Dependent additions</strong> apply at 30% and above only
          — veterans rated at 10% or 20% receive the flat base rate regardless of dependents.
          Additions include approximately $60–$160/month for a spouse, $32–$96/month per child
          under 18, and $47–$135/month per dependent parent, depending on rating tier.
        </p>
        <p>
          <strong className="text-zinc-800">TDIU:</strong> Veterans whose service-connected conditions
          prevent substantially gainful employment may qualify for Total Disability based on
          Individual Unemployability, which pays at the 100% rate even if the combined schedular
          rating is lower. Generally requires a single disability rated 60%+ or combined 70%+ with at
          least one condition at 40%+.
        </p>
        <p>
          In some cases, veterans who do not meet these percentage thresholds may be considered on
          an extraschedular basis, but that process is more situation-specific.
        </p>
        <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          See your compensation with dependent additions →
        </Link>
      </div>
    ),
  },
  {
    question: 'Why should you file through BDD before separation?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Filing early matters for two reasons that directly affect how much money you receive:
        </p>
        <p>
          <strong className="text-zinc-800">1. Effective date and timing.</strong> Filing before
          separation or within one year after separation can help preserve the earliest possible
          effective date, which is often the day after separation for direct service-connected claims.
        </p>
        <p>
          <strong className="text-zinc-800">2. Effective date and BDD processing.</strong> The VA&apos;s
          effective date for BDD claims is generally the day after separation, not the filing date
          itself. Filing early through BDD gives VA time to review records and schedule exams while
          you&apos;re still in, which may speed the decision. File using VA Form 21-526EZ,{' '}
          <strong className="text-zinc-800">180 to 90 days before separation</strong>.
        </p>
        <p>
          Your military medical records are the foundation of any service-connection claim. They are
          most accessible — and most complete — while you&apos;re still in uniform. Once you separate,
          requesting records can take months.
        </p>
        <p>
          <strong className="text-zinc-800">Rating stability protections:</strong> VA disability
          ratings are not always permanent, but procedural protections limit re-evaluation over time.
          Ratings in place for <strong className="text-zinc-800">5+ years</strong> receive a
          stabilization protection (higher evidence threshold for reduction). Ratings held for{' '}
          <strong className="text-zinc-800">10+ years</strong> cannot be severed unless fraud was
          involved. Ratings held for <strong className="text-zinc-800">20+ years</strong> are
          considered permanent and protected.
        </p>
        <Link href="/blog/file-va-disability-before-separation" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Step-by-step BDD filing guide →
        </Link>
      </div>
    ),
  },
  {
    question: 'What if your VA rating decision seems too low?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          An initial VA decision doesn&apos;t always capture every condition or apply every rating
          correctly — and it isn&apos;t the final word. If you believe your decision is incomplete
          or contains an error, the VA offers three formal review options, all free to request:
        </p>
        <ul className="space-y-2 pl-4 list-disc">
          <li>
            <strong className="text-zinc-800">Supplemental Claim (VA Form 20-0995)</strong> — add
            new and relevant evidence the VA didn&apos;t already consider.
          </li>
          <li>
            <strong className="text-zinc-800">Higher-Level Review (VA Form 20-0996)</strong> — ask
            a more senior reviewer to re-examine the same evidence for errors; no new evidence.
          </li>
          <li>
            <strong className="text-zinc-800">Board Appeal (VA Form 10182)</strong> — bring your
            case to a Veterans Law Judge at the Board of Veterans&apos; Appeals.
          </li>
        </ul>
        <p>
          <strong className="text-zinc-800">The deadline that matters:</strong> you generally have
          one year from the date on your decision letter to request a Higher-Level Review or Board
          Appeal. A Supplemental Claim can be filed anytime, but filing within that same year
          preserves your original effective date — and the back pay tied to it.
        </p>
        <p>
          You don&apos;t have to navigate this alone or pay for help. A VA-accredited Veterans
          Service Officer (VSO) can review your decision and file on your behalf at no cost.
          Reviewing your decision carefully before the one-year window closes — on your own or with
          a VSO — can be the difference between an incomplete rating and one that reflects your full
          medical picture.
        </p>
        <blockquote className="rounded-lg border-l-4 border-zinc-300 bg-zinc-50 px-4 py-3 my-1">
          <p className="italic text-zinc-600">
            My own initial decision missed conditions I didn&apos;t know to claim. Challenging it changed the outcome.
          </p>
          <footer className="mt-1.5 text-xs text-zinc-500">— Lt. Col. Ryan Durand, USAF/USSF (Ret.)</footer>
        </blockquote>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <a
            href="https://www.va.gov/resources/choosing-a-decision-review-option/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            Compare decision review options (VA.gov) →
          </a>
          <a
            href="https://www.va.gov/get-help-from-accredited-representative/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            Find a VA-accredited representative →
          </a>
        </div>
      </div>
    ),
  },
  {
    question: 'Already separated? Submit an Intent to File first.',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          If you&apos;re not ready to submit a full VA disability claim, an{' '}
          <strong className="text-zinc-800">Intent to File</strong> can protect a potential
          earlier effective date while you gather records and evidence. After submitting, you
          generally have one year to complete and file the claim.
        </p>
        <p>
          This can be done online at VA.gov, by phone, or through a VSO. It takes only a few
          minutes and requires no supporting documentation upfront.
        </p>
        <p>
          If you are still on active duty within the BDD window (90–180 days before separation),
          use BDD instead — Intent to File is for veterans who have already separated or who are
          outside the BDD window.
        </p>
      </div>
    ),
  },
  {
    question: 'Why a 0% rating can still matter',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          A 0% (noncompensable) rating does not pay monthly compensation, but it establishes
          that the VA recognizes the condition as{' '}
          <strong className="text-zinc-800">service-connected</strong>. If the condition worsens
          later, that existing service connection can make a future increase claim simpler than
          establishing service connection from scratch.
        </p>
        <p>
          A 0% rating may also provide access to VA healthcare for that specific condition,
          depending on your overall priority group.
        </p>
        <p>
          Veterans sometimes overlook 0% conditions at claim time because there is no immediate
          payment. Filing for them anyway preserves the record and may make future claims easier.
        </p>
      </div>
    ),
  },
  {
    question: 'How do CRDP and CRSC work for military retirees?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">The historical rule:</strong> Until 2004, veterans had
          to waive one dollar of retirement pay for every dollar of VA disability compensation they
          received — you couldn&apos;t receive both in full.
        </p>
        <p>
          <strong className="text-zinc-800">CRDP (Concurrent Retirement and Disability Pay):</strong>{' '}
          Since 2004, eligible military retirees with a VA disability rating of{' '}
          <strong className="text-zinc-800">50% or higher</strong> and 20+ years of qualifying
          service generally receive retired pay restored, allowing them to receive both military
          retired pay and VA disability compensation without the old dollar-for-dollar offset.
        </p>
        <p>
          <strong className="text-zinc-800">CRSC (Combat-Related Special Compensation):</strong>{' '}
          Veterans whose disabilities are specifically combat-related may elect CRSC instead. CRSC
          has the added benefit of being non-taxable income, whereas retirement pay is taxable.
          Veterans with combat-related disabilities below 50% may find CRSC produces more after-tax
          income than CRDP despite identical gross amounts.
        </p>
        <p>
          You can receive CRDP or CRSC — not both. You must apply for CRSC through your branch&apos;s
          finance center. The decision requires calculating your specific numbers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Military Retirement Calculator →
          </Link>
          <Link href="/blog/crdp-vs-crsc-military-retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            CRDP vs CRSC: which pays more? →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'What are your life insurance options when SGLI ends?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          SGLI (Servicemembers&apos; Group Life Insurance) provides up to $500,000 in coverage at{' '}
          <strong className="text-zinc-800">$26/month for most service members with maximum coverage</strong> while on active
          duty. It continues at no cost for 120 days after separation, then ends unless converted.
        </p>
        <p>
          <strong className="text-zinc-800">VGLI (Veterans&apos; Group Life Insurance):</strong> You can
          convert SGLI to VGLI by applying within 1 year and 120 days after separation. It is not
          automatic — you must apply. No medical exam is required if you apply within 240 days.
          Premiums start low for younger veterans but increase substantially with age. By the
          mid-40s, VGLI often costs more than comparable private coverage.
        </p>
        <p>
          <strong className="text-zinc-800">Private term life insurance:</strong> For veterans in
          good health, private term life frequently offers better value than VGLI by the mid-30s to
          40s. The advantage of VGLI is guaranteed issuance — which matters significantly if you
          have serious service-connected health conditions that could disqualify you from private
          coverage.
        </p>
        <Link href="/blog/sgli-vgli-private-life-insurance" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Compare SGLI, VGLI, and private options →
        </Link>
      </div>
    ),
  },
  {
    question: 'What are VA rating stability protections?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          VA disability ratings are not always permanent — the VA can re-evaluate ratings if it
          believes a condition has improved. However, several procedural protections limit this
          over time, and understanding them is part of long-term financial planning.
        </p>
        <ul className="space-y-2 pl-4 list-disc">
          <li>
            <strong className="text-zinc-800">5+ years:</strong> Ratings receive a &quot;stabilization&quot;
            protection. The VA must produce stronger evidence to reduce a rating it has held for five
            or more years — it cannot simply reassess at a lower level without justification.
          </li>
          <li>
            <strong className="text-zinc-800">10+ years:</strong> Service connection cannot be
            severed unless the VA can prove the original grant was based on fraud. The rating can
            still be reduced, but the connection itself cannot be eliminated.
          </li>
          <li>
            <strong className="text-zinc-800">20+ years:</strong> Ratings held for 20 or more
            continuous years are considered permanent and protected from reduction. The VA cannot
            reduce a rating that has been in place for two decades.
          </li>
        </ul>
        <p>
          These timelines make the effective date of your original claim critically important — every
          year of delay in filing is a year of protection you will not have for another decade.
        </p>
      </div>
    ),
  },
];

const RELATED = [
  {
    href: '/blog/va-disability-math-explained',
    border: 'border-l-blue-500',
    label: 'VA MATH',
    title: '50% + 30% + 20% = 100%, Right? How VA Math Actually Works',
    description: 'Step-by-step combined ratings formula with real examples showing what adding a 10% vs 20% condition does to your monthly check.',
  },
  {
    href: '/blog/file-va-disability-before-separation',
    border: 'border-l-emerald-500',
    label: 'BDD GUIDE',
    title: 'File Your VA Disability Claim Before Separation',
    description: 'Why filing through BDD while still on active duty may help the VA process your claim sooner — with a step-by-step timeline.',
  },
  {
    href: '/blog/crdp-vs-crsc-military-retirement',
    border: 'border-l-amber-500',
    label: 'RETIREMENT',
    title: 'CRDP vs CRSC: Which One Pays More After Taxes?',
    description: 'For retirees with VA ratings: the tax math on concurrent receipt options, with worked examples for when each wins.',
  },
];

export default function VADisabilityGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'VA Disability Benefits Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">VA Disability Benefits Guide</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="border-b border-zinc-200 py-12 sm:py-16 px-4" style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 VA Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Stop guessing your{' '}
            <span className="text-red-700">VA combined rating</span>{' '}
            — and what it&apos;s worth.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            VA math is confusing by design. 50% + 30% doesn&apos;t equal 80%. Use the free
            calculator to see your exact combined rating, your monthly compensation, and what
            adding another condition could do.
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              The difference between rounding to 60% and 70% is{' '}
              <span className="text-red-700">$373/month — $4,481/year, excluded from federal taxable income.</span>{' '}
              Knowing your exact combined value before filing matters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/va-disability"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Calculate My VA Rating →
            </Link>
            <Link
              href="#rates"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              See 2026 Compensation Rates ↓
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 VA compensation rates.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: Three insight cards ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              Three things about VA disability that catch veterans off guard.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              The system is complex. These are the parts that cost people money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INSIGHT_CARDS.map(({ accent, label, title, description, cta, href }) => (
              <div key={title} className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
                <div className={`${accent} px-5 py-3`}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{label}</span>
                  <p className="text-lg font-bold text-white leading-snug mt-0.5">{title}</p>
                </div>
                <div className="px-5 py-4 flex flex-col flex-1">
                  <p className="text-sm text-zinc-600 leading-relaxed flex-1 mb-5">{description}</p>
                  <Link href={href} className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    {cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE 3: Mid-page CTA ── */}
      <section className="bg-slate-900 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="flex justify-start mb-4" aria-hidden="true">
                <div className="w-8 h-0.5 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                See your combined rating and monthly compensation instantly.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your conditions one at a time. The calculator shows every step of the VA math,
                applies the bilateral factor, and calculates your 2026 monthly compensation with
                dependent additions.
              </p>
              <Link
                href="/calculators/va-disability"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Calculate My Rating →
              </Link>
              <p className="mt-3 text-xs text-white/40">Takes 30 seconds. No account required.</p>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Sample VA Calculation</p>
                    <p className="text-sm font-semibold text-zinc-800">Combined Rating Breakdown</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-1 divide-y divide-zinc-100">
                  {[
                    { label: 'PTSD', value: '50%' },
                    { label: 'Left knee', value: '30%' },
                    { label: 'Tinnitus', value: '10%' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-zinc-500">Combined (before rounding)</span>
                    <span className="text-sm font-mono tabular-nums text-zinc-600">68.5%</span>
                  </div>
                </div>
                <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Combined Rating</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700">70%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">Monthly (veteran alone)</p>
                    <p className="text-sm font-semibold text-zinc-700">$1,808.45</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">Annual (tax-exempt)</p>
                    <p className="text-sm font-semibold text-zinc-700">$21,701</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/va-disability" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Calculate your rating →
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-white/40">
                Your numbers update live as you add conditions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 4: Learning zone ── */}
      <section id="learning" className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
              Understanding VA disability benefits
            </h2>
            <p className="text-base text-zinc-500">
              Expand any section to go deeper. The calculator above gives you the numbers — these
              sections explain how they work.
            </p>
          </div>

          <div className="divide-y divide-zinc-200 border-t border-zinc-200">
            {ACCORDION.map(({ question, content }) => (
              <details key={question} className="group py-1">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-zinc-900 group-open:text-red-700 transition-colors pr-4">
                    {question}
                  </span>
                  <svg
                    className="w-5 h-5 text-zinc-400 flex-none transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-6 pr-4 sm:pr-8">
                  {content}
                </div>
              </details>
            ))}
          </div>

          <AuthorBio date={DATE} />

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link href="/guides" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              ← Back to all guides
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/guides/retirement-tsp" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Retirement & TSP Guide →
              </Link>
              <Link href="/guides/military-pay" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Military Pay Guide →
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 px-5 py-4 mt-6">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Note:</strong> This calculator estimates VA combined rating math — it is not a
              claims tool. Be accurate in documenting conditions, and work with a VSO or
              VA-accredited representative when filing. MilPayTools does not provide claims advice.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
          </div>

          <div className="mt-6">
            <Disclaimer dataYear="2026" />
          </div>
        </div>
      </section>

      {/* ── ZONE 5: Related content ── */}
      <section className="bg-zinc-50 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Keep exploring</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RELATED.map(({ href, border, label, title, description }) => (
              <Link
                key={href}
                href={href}
                className={`group bg-white rounded-xl border border-zinc-200 border-l-4 ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-5 py-5 flex flex-col gap-3`}
              >
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
                <p className="text-sm font-bold text-zinc-900 group-hover:text-red-700 transition-colors leading-snug">
                  {title}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
                <span className="text-xs font-bold text-red-700 group-hover:text-red-800 transition-colors mt-auto">
                  Read article →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
