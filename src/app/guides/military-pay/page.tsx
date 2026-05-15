import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'See What Your Military Pay Is Actually Worth';
const DESC =
  'Most service members underestimate their total compensation by $20,000–$40,000 per year. See your base pay, BAH, BAS, TSP matching, and civilian salary equivalent — instantly, with official 2026 DFAS and DTMO data.';
const CANONICAL = '/guides/military-pay';
const DATE = '2026-04-12';
const OG_IMAGE = '/api/og?type=guide&title=Military+Pay+%26+Compensation+Guide+2026&v=2';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | MilPayTools` },
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
    question: 'How does military base pay work?',
    answer:
      'Base pay is your taxable monthly salary, determined by pay grade (E-1 through E-9, W-1 through W-5, O-1 through O-10) and years of service. It increased 3.8% in 2026. Selected rates: E-1 under 2 years $2,052/month; E-5 with 6 years $3,717/month; O-3 with 6 years $6,156/month. Most service members see automatic pay increases at the 2-, 3-, 4-, 6-, 8-, 10-, 12-, 14-, 16-, 18-, 20-, and 22-year marks.',
  },
  {
    question: 'How does BAH work and why does it vary so much?',
    answer:
      'BAH (Basic Allowance for Housing) is a tax-free monthly payment set by the Defense Travel Management Office based on your duty station ZIP code, pay grade, and dependent status. DTMO surveys local rental markets and sets rates to cover approximately 95% of median local rental costs. An E-5 with dependents can receive from $1,218/month in a low-cost area to $3,897/month in high-cost markets. At the 22% federal bracket, $2,500/month in BAH is worth $3,205/month in equivalent taxable civilian wages.',
  },
  {
    question: 'What are BAS, CONUS COLA, and special pays?',
    answer:
      'BAS (Basic Allowance for Subsistence) is a flat monthly food allowance: $477.75 for enlisted, $329.82 for officers in 2026. It is tax-free and does not vary by location. CONUS COLA is a supplemental allowance for high-cost CONUS duty stations where BAH alone does not cover the full cost-of-living differential. Special and incentive pays include Hazardous Duty Pay ($150–$275/month), Special Duty Assignment Pay ($75–$675/month), Aviation Career Incentive Pay (up to $1,000/month), and Career Sea Pay ($70–$805/month).',
  },
  {
    question: 'How do I read my LES (Leave and Earnings Statement)?',
    answer:
      "Your LES is your military pay stub. Key sections: Entitlements (everything you're owed — base pay, BAH, BAS, special pays); Deductions (taxes, SGLI, dental, TSP, TRICARE); Allotments (automatic transfers); Leave (accrued balance, 30 days earned per year). Your W-2 will show a lower number than your total LES entitlements because BAH and BAS are excluded from taxable income — this is correct.",
  },
  {
    question: 'How is Guard and Reserve pay calculated differently from active duty?',
    answer:
      'Guard and Reserve drill pay is calculated at 1/30th of monthly active duty base pay per drill period. A standard weekend consists of four drill periods. Example: E-6 with 8 years ($4,387/month active base pay) earns $146.23 per drill period, $584.92 per drill weekend, approximately $7,019 per year from 48 IDT periods, plus about $2,924 for 2-week Annual Training.',
  },
  {
    question: 'What would a civilian need to earn to match military pay?',
    answer:
      "To calculate civilian salary equivalence, combine base pay plus the taxable equivalent of tax-free allowances. Example — E-5 with 6 years, JBLM, with dependents: base pay $3,717/month + BAH $2,991/month + BAS $477.75/month + TSP match ~$186/month = $7,372/month ($88,464/year). At the 22% federal bracket, a civilian would need roughly $107,000–$115,000/year in gross wages to match this. Most E-5s underestimate their total package by 40–60% when looking only at base pay.",
  },
];

// ── Pay layer cards (Zone 2) ──────────────────────────────────────────────────

const PAY_LAYERS = [
  {
    accent: 'bg-red-700',
    label: 'Layer 1',
    title: 'Base Pay',
    description:
      'Your taxable monthly salary, set by rank and years of service. This is the number on your W-2 — but it\'s only part of the picture.',
    bullets: ['E-3 (2 yrs): $2,378/mo', 'E-5 (6 yrs): $3,717/mo', 'Increases every January 1st'],
    cta: 'Look up your base pay →',
    href: '/calculators/pay-charts',
  },
  {
    accent: 'bg-blue-800',
    label: 'Layer 2',
    title: 'Housing Allowance (BAH)',
    description:
      'A tax-free monthly payment based on your duty station ZIP code. This is where most of the hidden compensation lives.',
    bullets: ['~$1,200/mo to $4,500+/mo by location', 'Completely tax-free income', 'Not on your W-2'],
    cta: 'Look up your BAH →',
    href: '/calculators/bah',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Layer 3',
    title: 'Everything Else',
    description:
      'BAS, TSP matching, tax advantages, TRICARE healthcare coverage, and special pays. Combined, these add tens of thousands per year.',
    bullets: ['BAS: $477.75/mo (enlisted)', 'TSP match: up to 5% base pay (BRS)', 'Tax advantage: $5K–$15K+/yr', 'TRICARE: $0 premiums (worth $7,200–$20,400/yr)'],
    cta: 'See your full picture →',
    href: '/calculators/total-compensation',
    secondaryHref: '/calculators/healthcare-comparison',
    secondaryLabel: 'See what healthcare is worth →',
  },
];

// ── Accordion items (Zone 4) ──────────────────────────────────────────────────

const ACCORDION = [
  {
    question: 'How does base pay work?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Base pay is your taxable monthly salary. It is set by Congress, determined by your{' '}
          <strong className="text-zinc-800">pay grade and years of service</strong>, and increases every
          January 1st. This is the number that appears on your W-2. The 2026 Military Pay Raise Act
          increased base pay by 3.8%, effective January 1, 2026 — the largest raise since 2019.
        </p>
        <p>Pay tables are organized by grade and years of service. Selected 2026 monthly rates:</p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">E-1 (under 2 years):</strong> $2,052</li>
          <li><strong className="text-zinc-800">E-4 (4 years):</strong> $2,810</li>
          <li><strong className="text-zinc-800">E-5 (6 years):</strong> $3,717</li>
          <li><strong className="text-zinc-800">E-7 (10 years):</strong> $4,739</li>
          <li><strong className="text-zinc-800">O-1 (under 2 years):</strong> $3,988</li>
          <li><strong className="text-zinc-800">O-3 (6 years):</strong> $6,156</li>
          <li><strong className="text-zinc-800">O-5 (14 years):</strong> $9,105</li>
        </ul>
        <p>
          Most service members see automatic pay increases at the 2-, 3-, 4-, 6-, 8-, 10-, 12-, 14-,
          16-, 18-, 20-, and 22-year marks.
        </p>
        <Link href="/calculators/pay-charts" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Browse the complete 2026 pay charts →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does BAH work and why does it vary so much?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          BAH is the most variable and most valuable component of military compensation for most
          service members. The Defense Travel Management Office (DTMO) surveys local rental markets
          each year and sets rates to offset approximately 95% of median local housing costs for
          your pay grade, with a built-in 5% cost-sharing assumption. That&apos;s why a sergeant in
          San Diego and a sergeant in rural Georgia receive completely different rates.
        </p>
        <p><strong className="text-zinc-800">2026 BAH range with dependents:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>E-5: $1,218/mo (low-cost) to $3,897/mo (San Francisco area)</li>
          <li>O-3: $1,590/mo to $4,437/mo</li>
          <li>O-5: $1,818/mo to $4,713/mo</li>
        </ul>
        <p>
          <strong className="text-zinc-800">The tax-free multiplier:</strong> BAH is excluded from
          taxable income under 26 U.S.C. § 134. An E-5 receiving $2,500/month in BAH would need
          $3,205/month in taxable civilian wages to have the same after-tax spending power at the 22%
          federal bracket. Over a career, this exclusion is worth tens of thousands of dollars.
        </p>
        <p>
          <strong className="text-zinc-800">Rate protection:</strong> If DTMO reduces BAH rates for
          your area, you keep your current rate as long as your grade, duty station, and dependent
          status don&apos;t change. This grandfathering resets when you PCS.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/bah" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Look up BAH for any ZIP code →
          </Link>
          <Link href="/blog/bah-rates-2026-complete-guide" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            2026 BAH Rates Complete Guide →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'What are BAS, CONUS COLA, and special pays?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">BAS (Basic Allowance for Subsistence)</strong> is a flat
          monthly rate that does not vary by location or number of dependents. 2026 rates:{' '}
          <strong className="text-zinc-800">$477.75/month enlisted</strong>,{' '}
          <strong className="text-zinc-800">$329.82/month officers</strong>. Like BAH, it is
          excluded from federal taxable income.
        </p>
        <p>
          <strong className="text-zinc-800">CONUS COLA</strong> is a supplemental allowance for
          duty stations in high-cost CONUS areas where BAH alone doesn&apos;t cover the full
          cost-of-living differential. It affects a relatively small number of duty stations —
          primarily high-cost metro areas — and varies by pay grade and dependent status.
        </p>
        <p><strong className="text-zinc-800">Special and incentive pays include:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Hazardous Duty Pay: $150–$275/month</li>
          <li>Special Duty Assignment Pay (SDAP): $75–$675/month</li>
          <li>Aviation Career Incentive Pay: up to $1,000/month</li>
          <li>Career Sea Pay: $70–$805/month by grade and cumulative sea duty</li>
        </ul>
        <p>Your LES will show all pays you&apos;re currently receiving.</p>
        <Link href="/calculators/cola" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Check CONUS COLA for your duty station →
        </Link>
      </div>
    ),
  },
  {
    question: 'How do I read my LES (pay stub)?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Your LES (Leave and Earnings Statement) is your pay stub — but it contains far more
          information than a civilian pay stub, and the format is confusing until you know what
          you&apos;re looking at.
        </p>
        <p><strong className="text-zinc-800">Key sections:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">Entitlements:</strong> Everything you&apos;re owed — base pay, BAH, BAS, special pays. Your total gross military pay.</li>
          <li><strong className="text-zinc-800">Deductions:</strong> Federal and state taxes, SGLI premium, dental, TSP contributions, TRICARE.</li>
          <li><strong className="text-zinc-800">Allotments:</strong> Automatic transfers you&apos;ve set up.</li>
          <li><strong className="text-zinc-800">Leave column:</strong> Accrued leave balance (30 days earned per year, up to 60 days carried forward).</li>
        </ul>
        <p>
          One frequent source of confusion: your W-2 will show a lower number than your total LES
          entitlements because BAH and BAS are not included in taxable wages on your W-2. This is
          correct — it doesn&apos;t mean you&apos;re missing pay.
        </p>
        <Link href="/blog/how-to-read-military-les-2026" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Complete LES walkthrough →
        </Link>
      </div>
    ),
  },
  {
    question: 'How is Guard and Reserve pay different?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Guard and Reserve compensation follows a different structure than active duty. Instead of
          a monthly salary, drill pay is calculated on a{' '}
          <strong className="text-zinc-800">daily rate basis: 1/30th of the monthly active duty
          base pay</strong> for your grade and years of service per drill period.
        </p>
        <p>
          A standard inactive duty training (IDT) weekend consists of four drill periods (typically
          Friday evening + Saturday + Sunday). Example:{' '}
          <strong className="text-zinc-800">Staff Sergeant (E-6) with 8 years service</strong>{' '}
          ($4,387/month active base pay):
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Per drill period: $4,387 ÷ 30 = $146.23</li>
          <li>Per drill weekend (4 periods): $584.92</li>
          <li>Per year (standard 48 IDT periods): $7,019</li>
          <li>Plus 2-week Annual Training: ~$2,924</li>
        </ul>
        <p>
          Guard and Reserve members also have access to TRICARE Reserve Select health coverage.
          Under BRS, they are eligible for TSP matching during qualifying active service periods.
        </p>
        <Link href="/calculators/guard-reserve" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate Guard/Reserve annual compensation →
        </Link>
      </div>
    ),
  },
  {
    question: 'What would a civilian need to earn to match my pay?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The honest answer to "how much does the military pay" requires combining all compensation
          layers. Here&apos;s a representative example:
        </p>
        <p>
          <strong className="text-zinc-800">E-5 with 6 years, Joint Base Lewis-McChord, with dependents:</strong>
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Base pay: $3,717/month</li>
          <li>BAH (with dependents): $2,991/month</li>
          <li>BAS: $477.75/month</li>
          <li>BRS TSP matching (~5% contribution): ~$186/month</li>
          <li><strong className="text-zinc-800">Total: $7,372/month — $88,464/year</strong></li>
        </ul>
        <p>
          At the 22% federal bracket, a civilian would need roughly{' '}
          <strong className="text-zinc-800">$107,000–$115,000/year in gross wages</strong> to match
          this — and that&apos;s before accounting for subsidized TRICARE health coverage.
        </p>
        <p className="text-xs text-zinc-400 italic">
          Illustrative estimate. Actual equivalence depends on individual tax situation, state of
          residence, filing status, and benefits not captured in this simplified model.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/total-compensation" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Calculate your civilian equivalent →
          </Link>
          <Link href="/blog/how-much-does-an-e5-really-make-2026" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            E-5 pay deep dive →
          </Link>
        </div>
      </div>
    ),
  },
];

// ── Related content cards (Zone 5) ───────────────────────────────────────────

const RELATED = [
  {
    href: '/blog/how-much-does-an-e5-really-make-2026',
    border: 'border-l-red-500',
    label: 'Pay Breakdown',
    title: 'How Much Does an E-5 Really Make in 2026?',
    description: 'A real-world total compensation breakdown with numbers — base pay, BAH, BAS, and civilian salary equivalent.',
  },
  {
    href: '/blog/military-tax-advantages',
    border: 'border-l-blue-500',
    label: 'Tax Strategy',
    title: 'Military Tax Advantages Most Service Members Miss',
    description: 'Why your effective compensation is higher than you think — and how to quantify it.',
  },
  {
    href: '/blog/the-47000-gap-bah-duty-station',
    border: 'border-l-emerald-500',
    label: 'BAH Deep Dive',
    title: 'The $47,000 Gap',
    description: 'Why two E-5s with the same rank at different duty stations can have wildly different total compensation.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MilitaryPayGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'Military Pay & Compensation Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Military Pay & Compensation</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Comprehensive Guide · Official 2026 DFAS & DTMO Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            See what your{' '}
            <span className="text-red-700">military pay</span>{' '}
            is actually worth.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            Most service members only look at base pay. Your real compensation — including
            tax-free housing, food allowances, and TSP matching — is worth{' '}
            <strong className="text-zinc-900">significantly more than you think.</strong>
          </p>

          {/* Urgency stat callout */}
          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              The average service member underestimates their total compensation by{' '}
              <span className="text-red-700">$20,000–$40,000 per year.</span>
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              See My Total Compensation →
            </Link>
            <Link
              href="/calculators/pay-charts"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Browse 2026 Pay Tables →
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 DFAS and DTMO data.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: Three pay layers ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              Your military pay has three layers most people miss.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Base pay is just the start. The other two layers are where the real value hides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAY_LAYERS.map(({ accent, label, title, description, bullets, cta, href, secondaryHref, secondaryLabel }) => (
              <div key={title} className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
                <div className={`${accent} px-5 py-3`}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{label}</span>
                  <p className="text-lg font-bold text-white leading-snug mt-0.5">{title}</p>
                </div>
                <div className="px-5 py-4 flex flex-col flex-1">
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{description}</p>
                  <ul className="space-y-2 flex-1 mb-5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <svg className="w-4 h-4 flex-none text-zinc-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-zinc-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={href} className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    {cta}
                  </Link>
                  {secondaryHref && (
                    <Link href={secondaryHref} className="mt-1.5 text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                      {secondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE 3: Mid-page CTA strip ── */}
      <section className="bg-slate-900 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: copy + CTA */}
            <div>
              <div className="flex justify-start mb-4" aria-hidden="true">
                <div className="w-8 h-0.5 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                Ready to see your full number?
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your rank, location, and years of service. Your total compensation — including
                the civilian salary equivalent — calculates instantly.
              </p>
              <Link
                href="/calculators/total-compensation"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Calculate My Compensation →
              </Link>
              <p className="mt-3 text-xs text-white/40">Takes 30 seconds. No account required.</p>
            </div>

            {/* Right: sample card */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">E-3 · 2 years · Fort Bragg, NC</p>
                    <p className="text-sm font-semibold text-zinc-800">Total Compensation Breakdown</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-1 divide-y divide-zinc-100">
                  {[
                    { label: 'Base Pay', value: '$3,015.00' },
                    { label: 'BAH (w/ dependents)', value: '$1,722' },
                    { label: 'BAS', value: '$476.95' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">{value}<span className="text-zinc-400">/mo</span></span>
                    </div>
                  ))}
                </div>
                <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Total Monthly</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700">$5,214</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Civilian equivalent</p>
                    <p className="text-sm font-semibold text-zinc-700">≈ $74,000 / yr</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/total-compensation" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    View Full Breakdown →
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-white/40">
                What an E-3 at Fort Bragg sees — your numbers update live as you enter inputs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 4: Learning zone ── */}
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
              Understanding your military compensation
            </h2>
            <p className="text-base text-zinc-500">
              Expand any section to go deeper. Everything below is for reference — the calculators
              above give you the numbers for your specific situation.
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

          {/* Author + related guides */}
          <AuthorBio />

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link href="/guides" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              ← Back to all guides
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/guides/pcs" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                PCS Financial Guide →
              </Link>
              <Link href="/guides/retirement-tsp" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Retirement & TSP Guide →
              </Link>
            </div>
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
