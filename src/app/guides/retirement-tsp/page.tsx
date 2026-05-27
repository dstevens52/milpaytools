import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'Know what your military retirement is actually worth — before you decide to stay or go.';
const DESC =
  'Your pension, TSP balance, TRICARE, and VA disability all add up to a retirement package most civilians can\'t match. But only if you understand the math and make informed TSP decisions along the way.';
const CANONICAL = '/guides/retirement-tsp';
const DATE = '2026-04-12';
const OG_IMAGE = '/api/og?type=guide&title=Military+Retirement+%26+TSP+Guide+2026&v=2';

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
    question: 'What are the military retirement systems and which one am I on?',
    answer:
      'High-3 (Legacy) applies to service members who entered before January 1, 2018 with 12+ years of service as of December 31, 2017. BRS (Blended Retirement System) applies to everyone who entered on or after January 1, 2018, plus legacy members who opted in during the 2018 window. Check your LES — BRS members see TSP matching contributions listed.',
  },
  {
    question: 'How is my military pension calculated?',
    answer:
      'High-3: Monthly pension = 2.5% × years of service × average of highest 36 months of base pay. At 20 years: 50%; at 30 years: 75%. BRS uses 2.0% per year — 40% at 20 years, 60% at 30 years — partially offset by TSP matching over a career.',
  },
  {
    question: 'What are the 2026 TSP contribution limits?',
    answer:
      '2026 limits: annual elective deferral $24,500; catch-up contributions age 50–59 and 64+: additional $8,000 (total $32,500); enhanced catch-up ages 60–63 under SECURE 2.0: additional $11,250 (total $35,750). In a combat zone, the total annual additions limit rises to $72,000 — but Roth TSP contributions remain capped at $24,500; contributions above that from tax-exempt combat-zone pay go into the traditional tax-exempt portion of TSP, not Roth. TSP expense ratios are among the lowest of any retirement plan available.',
  },
  {
    question: 'Should I choose Roth or Traditional TSP?',
    answer:
      'Traditional TSP reduces current taxable income — an advantage in higher brackets or if you expect a lower rate in retirement. Roth TSP may appeal in lower tax years or when contributions come from combat-zone tax-exempt pay, since qualified withdrawals are tax-free. Military retirees have a guaranteed taxable pension income stream, which is one factor to consider. The right approach depends on current brackets, expected retirement income, state taxes, and other personal factors.',
  },
  {
    question: 'How does BRS TSP matching work?',
    answer:
      'Under BRS: 1% automatic contribution begins after 60 days (vests at 2 years). Dollar-for-dollar match on first 3% of base pay (vests immediately). 50 cents on the dollar for the next 2%. Maximum government contribution: 5% of base pay when you contribute at least 5%. Under BRS, contributing less than 5% of base pay means missing part of the available government match.',
  },
  {
    question: 'Is it worth staying to 20 years for the pension?',
    answer:
      'The 20-year pension cliff is significant. An E-7 retiring at 38 with a $3,100/month pension who lives to 82 collects for 44 years — with COLA, the lifetime nominal value can exceed $2.9 million. Healthcare: TRICARE for retirees is worth an estimated $10,000–$15,000/year compared to civilian coverage. The financial case for staying to 20 is strong, but career factors and quality of life matter equally.',
  },
  {
    question: 'How does VA disability interact with military retirement pay?',
    answer:
      'CRDP (Concurrent Retirement and Disability Pay): veterans with 50%+ VA disability and 20+ years of service receive both full pension and full VA compensation with no offset. CRSC (Combat-Related Special Compensation): for combat-related disabilities, provides non-taxable income that can net more after taxes than CRDP for veterans in higher brackets.',
  },
];

const INSIGHT_CARDS = [
  {
    accent: 'bg-blue-800',
    label: 'Decision 1',
    title: 'Your pension system determines everything',
    description:
      'High-3 gives 50% at 20 years. BRS gives 40% — but adds TSP matching. Which system you\'re on isn\'t a choice anymore, but understanding how yours works is the foundation of every retirement decision.',
    cta: 'Compare High-3 vs BRS →',
    href: '#learning',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Decision 2',
    title: 'BRS matching can add thousands to your retirement savings — if your contributions qualify',
    description:
      'Under BRS, the government matches up to 5% of your base pay. Contributing less than 5% of base pay means missing part of the available government match. With expense ratios around a few basis points, TSP is among the lowest-cost retirement plans available.',
    cta: 'Project my TSP growth →',
    href: '/calculators/tsp',
  },
  {
    accent: 'bg-amber-600',
    label: 'Decision 3',
    title: 'Roth vs Traditional TSP depends on your bracket',
    description:
      'Contributing to Roth TSP at lower tax brackets — especially from combat-zone tax-exempt pay — may create tax-advantaged retirement income. Whether Roth or Traditional is better depends on current and future tax rates, state taxes, and other factors.',
    cta: 'See Roth vs Traditional comparison →',
    href: '#learning',
  },
];

const ACCORDION = [
  {
    question: 'What are the military retirement systems and which one am I on?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">High-3 (Legacy System):</strong> Applies to service
          members who entered before January 1, 2018 and had 12 or more years of service as of
          December 31, 2017, and those who opted out of BRS during the 2018 window. Defined benefit
          pension only — no TSP matching.
        </p>
        <p>
          <strong className="text-zinc-800">Blended Retirement System (BRS):</strong> Applies to
          everyone who entered service on or after January 1, 2018, plus legacy members who opted in
          during the 2018 window. Combines a slightly smaller pension with mandatory government TSP
          contributions.
        </p>
        <p>
          <strong className="text-zinc-800">REDUX (rare):</strong> Some legacy-era service members
          accepted a $30,000 Career Status Bonus at 15 years in exchange for a reduced retirement
          COLA adjustment. REDUX has significantly reduced the real value of the pension over time
          for most who chose it.
        </p>
        <p>
          If you&apos;re unsure which system you&apos;re on: your LES will show TSP matching
          contributions if you&apos;re on BRS. You can also verify through your MyPay account.
        </p>
        <Link href="/blog/brs-vs-high-3-retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Full BRS vs. High-3 comparison →
        </Link>
      </div>
    ),
  },
  {
    question: 'How is my pension calculated under High-3 and BRS?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">High-3 formula:</strong> Monthly pension = Multiplier ×
          Average highest 36 months of base pay
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>At exactly 20 years: <strong className="text-zinc-800">50%</strong> (2.5% × 20)</li>
          <li>At 22 years: 55%</li>
          <li>At 30 years: 75% (maximum)</li>
        </ul>
        <p>
          The &quot;highest 36 months&quot; means the three consecutive years of highest base pay —
          almost always your final 36 months. High-3 retirees receive annual COLA adjustments equal
          to the full CPI-W inflation rate.
        </p>
        <p>
          <strong className="text-zinc-800">Example — O-5 retiring at exactly 20 years:</strong>
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Final base pay: ~$9,660/month (2026 O-5 at 20 years)</li>
          <li>Highest 36-month average: ~$9,200/month</li>
          <li>Pension: 50% × $9,200 = <strong className="text-zinc-800">$4,600/month ($55,200/year)</strong>, for life with COLA</li>
        </ul>
        <p>
          <strong className="text-zinc-800">BRS formula:</strong> 2.0% per year (not 2.5%),
          reaching 40% at 20 years and 60% at 30 years. The pension reduction is partially offset
          by TSP matching over a career.
        </p>
        <Link href="/calculators/retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your pension projection →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does TSP work and what are the 2026 contribution limits?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The TSP is the federal government&apos;s equivalent of a 401(k), available to all service
          members. Key advantage:{' '}
          <strong className="text-zinc-800">expense ratio of 0.055%</strong> — you pay $0.55 per
          year for every $1,000 invested. The average actively managed mutual fund charges 10–20×
          more. This difference compounds dramatically over a career.
        </p>
        <p><strong className="text-zinc-800">2026 contribution limits:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Annual elective deferral: <strong className="text-zinc-800">$24,500</strong></li>
          <li>Catch-up (age 50–59 and 64+): additional $8,000 → total $32,500</li>
          <li>Enhanced catch-up (ages 60–63, SECURE 2.0): additional $11,250 → total $35,750</li>
          <li>Combat zone: total annual additions limit rises to <strong className="text-zinc-800">$72,000</strong> — Roth TSP remains capped at $24,500; contributions above that from tax-exempt combat-zone pay go into the traditional tax-exempt portion of TSP, not Roth</li>
        </ul>
        <p><strong className="text-zinc-800">TSP fund options:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">G Fund:</strong> Government securities, zero volatility, currently ~4–5% annually</li>
          <li><strong className="text-zinc-800">C Fund:</strong> S&P 500 index (large-cap U.S. equities)</li>
          <li><strong className="text-zinc-800">S Fund:</strong> Small/mid-cap U.S. equity index</li>
          <li><strong className="text-zinc-800">I Fund:</strong> International equities index</li>
          <li><strong className="text-zinc-800">L Funds:</strong> Lifecycle funds, automatically adjust allocation by target retirement date</li>
        </ul>
        <Link href="/calculators/tsp" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Project your TSP balance at retirement →
        </Link>
      </div>
    ),
  },
  {
    question: 'Should I choose Roth or Traditional TSP?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">Traditional TSP:</strong> Contributions are pre-tax
          (lower taxable income now), but withdrawals in retirement are fully taxable.
        </p>
        <p>
          <strong className="text-zinc-800">Roth TSP:</strong> Contributions are after-tax (no
          tax break now), but qualified withdrawals — including all growth — are tax-free.
        </p>
        <p><strong className="text-zinc-800">Factors commonly considered for each approach:</strong></p>
        <ul className="space-y-2 pl-4 list-disc">
          <li>
            <strong className="text-zinc-800">Traditional TSP:</strong> Reduces current taxable
            income — valuable in higher brackets or when you expect a lower rate in retirement.
            Withdrawals are taxed as ordinary income.
          </li>
          <li>
            <strong className="text-zinc-800">Roth TSP in lower-bracket years:</strong> An E-5 or
            O-2 in the 12–22% federal bracket may find Roth favorable if retirement income will push
            into higher brackets. Whether this pays off depends on actual future tax rates.
          </li>
          <li>
            <strong className="text-zinc-800">Combat zone Roth opportunity:</strong> Contributions
            from combat-zone tax-exempt pay go into Roth TSP with no tax at contribution or on
            qualified withdrawal — one of the more notable tax-advantaged opportunities available
            to service members in a combat zone.
          </li>
          <li>
            <strong className="text-zinc-800">Pension consideration:</strong> Military retirees
            already have a guaranteed taxable income stream. This may reduce the need for
            Traditional TSP withdrawals — but the right balance depends on your overall
            retirement income picture.
          </li>
        </ul>
        <Link href="/blog/roth-tsp-deployment-strategy" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          The Roth TSP deployment strategy →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does BRS TSP matching work?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>If you&apos;re on BRS, the government matching structure is:</p>
        <ul className="space-y-2 pl-4 list-disc">
          <li><strong className="text-zinc-800">1% automatic:</strong> The government deposits 1% of your base pay into TSP regardless of whether you contribute. Begins after 60 days of service. Vests at 2 years — separate before then and you forfeit it.</li>
          <li><strong className="text-zinc-800">Dollar-for-dollar on first 3%:</strong> Contribute 3% → government adds 3%. This matching vests immediately.</li>
          <li><strong className="text-zinc-800">50 cents on the dollar for next 2%:</strong> Contribute 4% → government adds 0.5%; contribute 5% → government adds another 0.5%.</li>
          <li><strong className="text-zinc-800">Maximum: 5% government contribution</strong> (1% auto + up to 4% match) when you contribute at least 5%.</li>
        </ul>
        <p>
          <strong className="text-zinc-800">Cost of under-contributing:</strong> If you contribute
          3% instead of 5%, the top 1% of government matching is forfeited — approximately
          $28–$97/month depending on grade. For an E-5 at $4,110/month (6 years of service),
          that&apos;s roughly $41/month or $493/year in forfeited government contributions.
        </p>
        <Link href="/calculators/tsp" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Model your TSP matching over a career →
        </Link>
      </div>
    ),
  },
  {
    question: 'Should I stay to 20 years?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The 20-year mark is the financial cliff in regular active-duty retirement — retire at 19 years
          and 11 months and you receive exactly $0 in defined-benefit pension. Retire at 20 years and
          you receive a benefit for life. (Disability retirement, medical retirement, and special programs
          may have different rules.)
        </p>
        <p><strong className="text-zinc-800">What the pension is actually worth:</strong></p>
        <p>
          An E-7 retiring at age 38 with a $3,100/month pension who lives to 82 will collect for{' '}
          44 years. With COLA adjustments, the lifetime nominal value can easily exceed{' '}
          <strong className="text-zinc-800">$2.9 million</strong>.
        </p>
        <p><strong className="text-zinc-800">TRICARE:</strong> Military retirees qualify for TRICARE coverage — one of the most comprehensive and affordable health insurance options available. For a family, the difference between TRICARE and civilian employer coverage can exceed $10,000–$15,000/year. This benefit is frequently underweighted in retirement calculations.</p>
        <p>
          <strong className="text-zinc-800">The civilian salary you&apos;d need:</strong> To match
          the financial value of military retirement (pension + healthcare + commissary/exchange
          access), a civilian job would need to offer significantly higher compensation than your
          final military base pay.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Calculate your lifetime pension value →
          </Link>
          <Link href="/blog/what-walking-away-at-12-years-costs" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            What leaving at 12 years costs →
          </Link>
          <Link href="/calculators/healthcare-comparison" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            See what replacing TRICARE costs on the civilian side →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'How does VA disability interact with retirement pay (CRDP/CRSC)?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Veterans who retire with 20+ years and have a VA disability rating face a potentially
          complex interaction between the two income streams.
        </p>
        <p>
          <strong className="text-zinc-800">The old rule (pre-2004):</strong> Retirement pay was
          reduced dollar-for-dollar by VA compensation. You couldn&apos;t receive both in full.
        </p>
        <p>
          <strong className="text-zinc-800">CRDP (Concurrent Retirement and Disability Pay):</strong>{' '}
          Retirees with a VA disability rating of <strong className="text-zinc-800">50% or higher</strong>{' '}
          receive full retirement pay plus full VA compensation — no offset.
        </p>
        <p>
          <strong className="text-zinc-800">CRSC (Combat-Related Special Compensation):</strong>{' '}
          An alternative for retirees whose disability is specifically combat-related. CRSC is
          non-taxable — unlike retirement pay — which can net $400+/month more than CRDP for a
          retiree in the 22% bracket. You can only receive CRDP or CRSC, not both. Apply for CRSC
          through your branch&apos;s finance center.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            VA Disability Calculator →
          </Link>
          <Link href="/blog/crdp-vs-crsc-military-retirement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            CRDP vs CRSC: which pays more? →
          </Link>
        </div>
      </div>
    ),
  },
];

const RELATED = [
  {
    href: '/blog/brs-vs-high-3-retirement',
    border: 'border-l-blue-500',
    label: 'RETIREMENT SYSTEMS',
    title: 'BRS vs. High-3: Which Military Retirement System Wins?',
    description: 'Full comparison of the two retirement systems with E-7 numbers — pension value, TSP matching, and which comes out ahead.',
  },
  {
    href: '/blog/tsp-for-beginners-what-happens-if-you-do-nothing',
    border: 'border-l-purple-500',
    label: 'TSP BASICS',
    title: 'TSP for Beginners: What Happens If You Never Change Your Settings',
    description: 'What your TSP account is doing right now — fund allocation, government match, and the gap between "decent default" and optimal.',
  },
  {
    href: '/blog/roth-tsp-deployment-strategy',
    border: 'border-l-emerald-500',
    label: 'TSP STRATEGY',
    title: 'The Roth TSP Deployment Strategy That Builds a Tax-Free Fortune',
    description: 'How combat-zone Roth TSP contributions may avoid taxation at both contribution and withdrawal — and what $20K at age 25 becomes by 60.',
  },
  {
    href: '/blog/what-walking-away-at-12-years-costs',
    border: 'border-l-amber-500',
    label: 'CAREER DECISION',
    title: 'What Walking Away at 12 Years Actually Costs',
    description: 'The full dollar value of the 12-to-20 decision: pension, TRICARE, and TSP matching for an E-7.',
  },
];

export default function RetirementTspGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'Military Retirement & TSP Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Military Retirement & TSP Guide</li>
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
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Know what your{' '}
            <span className="text-red-700">military retirement</span>{' '}
            is actually worth — before you decide to stay or go.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            Your pension, TSP balance, TRICARE, and VA disability all add up to a retirement package
            most civilians can&apos;t match. But only if you understand the math and make informed
            TSP decisions along the way.
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              An E-7 retiring at 38 with a $3,100/month pension will collect over{' '}
              <span className="text-red-700">$2.9 million in lifetime pension value alone.</span>{' '}
              But contributing 3% to TSP instead of 5% costs roughly $493/year in available government matching.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/retirement"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Project My Retirement →
            </Link>
            <Link
              href="/calculators/tsp"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              See TSP Growth →
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 DFAS pay tables and TSP data.
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
              Three retirement decisions that are worth more than you think.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Small choices now compound into six-figure differences later.
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
                See what your retirement looks like at 20, 24, or 30 years.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your rank, years of service, retirement system, and TSP details. See your
                projected pension, TSP balance at retirement, lifetime pension value, and CRDP
                eligibility — all in one view.
              </p>
              <Link
                href="/calculators/retirement"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Project My Retirement →
              </Link>
              <p className="mt-3 text-xs text-white/40">Takes 60 seconds. No account required.</p>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">E-7 · 20 years · High-3</p>
                    <p className="text-sm font-semibold text-zinc-800">Retirement Projection</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-1 divide-y divide-zinc-100">
                  {[
                    { label: 'Monthly pension', value: '$3,100' },
                    { label: 'Annual pension', value: '$37,200' },
                    { label: 'Est. TRICARE savings', value: '~$12,000/yr' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Lifetime pension value</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700">~$2.4M</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">CRDP eligible</p>
                    <p className="text-sm font-semibold text-zinc-700">Yes (if 50%+ VA rating)</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/retirement" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Project your retirement →
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-white/40">
                Your numbers update live as you enter inputs
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
              Understanding military retirement and TSP
            </h2>
            <p className="text-base text-zinc-500">
              Expand any section to go deeper. The calculators above give you the numbers — these
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

          <AuthorBio />

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link href="/guides" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              ← Back to all guides
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/guides/va-disability" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                VA Disability Guide →
              </Link>
              <Link href="/guides/military-pay" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Military Pay Guide →
              </Link>
            </div>
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
