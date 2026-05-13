import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'Your education benefits could be worth $100,000+. Make sure you use them in the right order.';
const DESC =
  'Post-9/11 GI Bill, VR&E, Tuition Assistance, and Montgomery GI Bill each work differently. The order you use them — and where you go to school — can swing the total value by tens of thousands of dollars.';
const CANONICAL = '/guides/education-benefits';
const DATE = '2026-04-12';
const OG_IMAGE = '/api/og?type=guide&title=Military+Education+Benefits+Guide+2026&v=2';

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
    question: 'What does the Post-9/11 GI Bill cover?',
    answer:
      'At 100% eligibility, Post-9/11 GI Bill (Chapter 33) covers: full tuition at public in-state institutions (private/out-of-state capped at ~$30,908/year in 2026–2027); a Monthly Housing Allowance (MHA) based on BAH for an E-5 with dependents at the school\'s ZIP code; and a book and supply stipend up to $1,000/year. Entitlement is 36 months. Online-only MHA is up to $1,261/month for the 2026-2027 academic year, subject to eligibility tier and rate of pursuit.',
  },
  {
    question: 'Why does my school\'s ZIP code matter for GI Bill?',
    answer:
      'GI Bill MHA is calculated as the BAH rate for an E-5 with dependents at the school\'s primary campus ZIP code. A school in the Bay Area pays ~$3,600/month in MHA; a rural Midwest school pays ~$1,200/month. Same benefit, same enrollment status — $21,600/year difference, or $86,400 over a 4-year degree.',
  },
  {
    question: 'What is VR&E Chapter 31 and who qualifies?',
    answer:
      'Vocational Rehabilitation and Employment (Chapter 31) can cover approved tuition, required books, and supplies under a counselor-approved rehabilitation plan, and does not consume GI Bill months. Eligibility and covered services depend on VA counselor approval. Veterans with a service-connected disability rating (even 0% with an employment handicap) may qualify. Using VR&E first preserves all 36 months of GI Bill for a later program or transfer to dependents.',
  },
  {
    question: 'Should I use Tuition Assistance or the GI Bill first?',
    answer:
      'While on active duty, Tuition Assistance is often worth considering first — it covers up to $4,500/year and costs zero GI Bill months. Preserving GI Bill months for after separation can increase their value, since eligible students receive MHA when no longer on active-duty pay.',
  },
  {
    question: 'How does GI Bill transfer to dependents work?',
    answer:
      'Requirements: must be on active duty at time of transfer request (cannot add after separation); at least 6 years of service; a 4-year additional service commitment from the date of transfer approval; dependents enrolled in DEERS. Spouses can use the benefit immediately. Children must be at least 18. The 4-year commitment is typically worth it given the value of a covered 4-year degree.',
  },
  {
    question: 'How do online programs affect GI Bill housing allowance?',
    answer:
      'Students enrolled exclusively in online courses receive online-only MHA of up to $1,261/month for the 2026-2027 academic year, subject to eligibility tier and rate of pursuit — regardless of where they physically live or the school\'s ZIP code. Hybrid programs with any in-person attendance qualify for the full school ZIP code rate.',
  },
  {
    question: 'What is the Montgomery GI Bill (MGIB)?',
    answer:
      'MGIB (Chapter 30) pays a flat monthly rate ($2,518/month for full-time enrollment with 3+ years of service (Oct 2025–Sept 2026)) regardless of school or location. Unlike Post-9/11, it doesn\'t cover tuition separately. For nearly all service members at standard four-year programs, Post-9/11 GI Bill is more valuable. MGIB can be advantageous at very low-cost schools where the flat rate exceeds what GI Bill tuition coverage would provide.',
  },
  {
    question: 'How should I sequence my education benefits?',
    answer:
      'A widely used strategy: (1) Active duty — use Tuition Assistance for all coursework, preserving all GI Bill months. (2) Approaching 6 years — transfer GI Bill to spouse or dependents if planning to stay. (3) Separation — activate Post-9/11 GI Bill, choosing school strategically based on MHA. (4) If service-connected disability — evaluate VR&E before activating GI Bill, which preserves remaining GI Bill for dependents or a later program.',
  },
];

const INSIGHT_CARDS = [
  {
    accent: 'bg-blue-800',
    label: 'Decision 1',
    title: 'Your school\'s ZIP code changes your GI Bill value',
    description:
      'GI Bill MHA is based on BAH at your school\'s ZIP code — not where you live. A school in the Bay Area pays ~$3,600/month in housing. A rural Midwest school pays ~$1,200/month. Same benefit, $86,400 difference over 4 years.',
    cta: 'Compare MHA by school →',
    href: '/calculators/education',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Decision 2',
    title: 'While on active duty, Tuition Assistance is often worth considering first — it does not use GI Bill months',
    description:
      'TA covers $4,500/year while on active duty and costs zero GI Bill months. Preserving GI Bill months for after separation can increase their value, since eligible students receive MHA when no longer on active-duty pay.',
    cta: 'See the sequencing strategy →',
    href: '#learning',
  },
  {
    accent: 'bg-amber-600',
    label: 'Decision 3',
    title: 'VR&E Chapter 31 may be more valuable than GI Bill',
    description:
      'If you have a service-connected disability, VR&E can cover approved tuition and required books under a counselor-approved rehabilitation plan, and doesn\'t consume GI Bill months. Eligibility and covered services depend on VA counselor approval. Using VR&E first may preserve your GI Bill for transfer to dependents or a second program.',
    cta: 'Compare VR&E vs GI Bill →',
    href: '#learning',
  },
];

const ACCORDION = [
  {
    question: 'What does the Post-9/11 GI Bill cover?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The Post-9/11 GI Bill (Chapter 33) is the most widely used military education benefit
          and, for most veterans, the highest-value program.
        </p>
        <p>
          <strong className="text-zinc-800">Eligibility tiers based on service length</strong> (at
          least 90 days of aggregate active duty after September 10, 2001):
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>90+ days: 40% of full benefit</li>
          <li>12 months: 60% &nbsp;·&nbsp; 24 months: 80% &nbsp;·&nbsp; 36+ months: 100%</li>
        </ul>
        <p><strong className="text-zinc-800">At 100% eligibility, the GI Bill covers:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">Tuition:</strong> Full tuition at public in-state institutions. Private/out-of-state capped at ~$30,908/year (2026–2027). Yellow Ribbon may cover the gap at participating schools.</li>
          <li><strong className="text-zinc-800">Monthly Housing Allowance (MHA):</strong> BAH rate for an E-5 with dependents at the school&apos;s primary campus ZIP code. Online-only MHA is up to $1,261/month for the 2026-2027 academic year, subject to eligibility tier and rate of pursuit.</li>
          <li><strong className="text-zinc-800">Book stipend:</strong> Up to $1,000/year.</li>
          <li><strong className="text-zinc-800">Entitlement:</strong> 36 months (4 academic years).</li>
        </ul>
        <Link href="/calculators/education" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your GI Bill value by school →
        </Link>
      </div>
    ),
  },
  {
    question: 'Why does your school\'s ZIP code matter so much?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed" id="zip-mha">
        <p>
          This is the most overlooked variable in GI Bill planning — and it can be worth over
          $1,000/month. MHA is paid at the BAH rate for an E-5 with dependents at the school&apos;s
          ZIP code. Because BAH varies dramatically by location, two schools with identical tuition
          can produce completely different monthly GI Bill income.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-1.5 pr-4 font-semibold text-zinc-700">School location</th>
                <th className="text-left py-1.5 pr-4 font-semibold text-zinc-700">MHA/month</th>
                <th className="text-left py-1.5 font-semibold text-zinc-700">Annual MHA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-1.5 pr-4 text-zinc-700">Bay Area, CA</td>
                <td className="py-1.5 pr-4 tabular-nums text-zinc-700">~$3,600</td>
                <td className="py-1.5 tabular-nums text-zinc-700">~$32,400</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 text-zinc-700">Northern Virginia</td>
                <td className="py-1.5 pr-4 tabular-nums text-zinc-700">~$2,700</td>
                <td className="py-1.5 tabular-nums text-zinc-700">~$24,300</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 text-zinc-700">Rural Midwest</td>
                <td className="py-1.5 pr-4 tabular-nums text-zinc-700">~$1,200</td>
                <td className="py-1.5 tabular-nums text-zinc-700">~$10,800</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The Bay Area school produces <strong className="text-zinc-800">$21,600 more per year</strong> in MHA — even if tuition is identical. Over a 4-year degree, that&apos;s an{' '}
          <strong className="text-zinc-800">$86,400 difference</strong> from one ZIP code.
        </p>
        <Link href="/blog/gi-bill-housing-allowance-zip-code" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          GI Bill housing allowance: why your school ZIP code matters →
        </Link>
      </div>
    ),
  },
  {
    question: 'What is VR&E Chapter 31 and who qualifies?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Vocational Rehabilitation and Employment (VR&amp;E), also called Chapter 31, is not as
          well known as the GI Bill — but for veterans with service-connected disabilities, it is
          frequently more valuable.
        </p>
        <p><strong className="text-zinc-800">Key differences from GI Bill:</strong></p>
        <ul className="space-y-2 pl-4 list-disc">
          <li><strong className="text-zinc-800">Tuition and supplies:</strong> VR&amp;E can cover approved tuition, required books, and supplies under a counselor-approved rehabilitation plan. Eligibility and covered services depend on VA counselor approval.</li>
          <li><strong className="text-zinc-800">Duration:</strong> Up to 48 months for an undergraduate degree.</li>
          <li><strong className="text-zinc-800">No GI Bill consumption:</strong> VR&amp;E has a separate entitlement — using it does not consume GI Bill months.</li>
          <li><strong className="text-zinc-800">Eligibility:</strong> Service-connected disability with an employment handicap. A 0% rating can qualify. Veterans at 10%+ are presumed to have an employment handicap.</li>
        </ul>
        <p>
          A veteran who uses VR&amp;E to complete a bachelor&apos;s degree can then use their full
          36 months of GI Bill for graduate school or transfer it to a dependent.
        </p>
        <Link href="/blog/vre-chapter-31-vs-gi-bill" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          VR&E Chapter 31 vs GI Bill: which to use first →
        </Link>
      </div>
    ),
  },
  {
    question: 'Should you use TA or GI Bill first?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          A widely used approach: <strong className="text-zinc-800">use Tuition Assistance while
          on active duty. Preserve GI Bill months for after separation.</strong>
        </p>
        <p>
          <strong className="text-zinc-800">Why TA on active duty:</strong> TA covers up to
          $250/credit hour, capped at $4,500/year. It is funded by your branch&apos;s education
          budget — not your GI Bill. Using TA costs zero GI Bill months. On active duty, you have
          a salary and BAH covering housing; the GI Bill MHA adds no marginal value.
        </p>
        <p>
          <strong className="text-zinc-800">Why GI Bill after separation:</strong> The MHA
          ($1,200–$3,600/month depending on school location) replaces some of the income you no
          longer have. The tuition coverage prevents education debt when you&apos;re not drawing a
          military paycheck.
        </p>
        <p>
          The exception: if your service ends before completing a degree you started on TA, the
          remaining TA can&apos;t be used — but GI Bill can pick up where TA left off.
        </p>
        <Link href="/blog/gi-bill-vs-tuition-assistance" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          GI Bill vs Tuition Assistance: which to use first →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does GI Bill transfer to dependents work?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          One of the most valuable long-term benefits available to service members is the ability
          to transfer Post-9/11 GI Bill entitlement to a spouse or children.
        </p>
        <p><strong className="text-zinc-800">Requirements:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Must be on <strong className="text-zinc-800">active duty</strong> at the time of the transfer request — cannot be added after separation</li>
          <li>At least <strong className="text-zinc-800">6 years of service</strong> at time of request</li>
          <li>A <strong className="text-zinc-800">4-year additional service commitment</strong> from the date of transfer approval</li>
          <li>Dependents must be enrolled in DEERS</li>
        </ul>
        <p>
          Spouses can use the benefit immediately upon transfer. Children must be at least 18 (or
          17 if deployed parent). Transfer requests submitted too close to a separation date are
          routinely denied — initiate well before your projected separation.
        </p>
        <p>
          A transferred GI Bill benefit covering a dependent child&apos;s four-year degree is worth
          $100,000–$200,000 in avoided tuition and loans. The 4-year service commitment required to
          transfer is often viewed as worthwhile given the potential value of the transferred benefit.
        </p>
      </div>
    ),
  },
  {
    question: 'How do online programs affect MHA?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          GI Bill MHA for fully online programs is paid at{' '}
          <strong className="text-zinc-800">50% of the national average BAH rate</strong> —
          up to $1,261/month for the 2026-2027 academic year, subject to eligibility tier and
          rate of pursuit — regardless of where you physically live or the school&apos;s ZIP code.
        </p>
        <p>
          In-person programs at high-BAH locations generally produce significantly higher MHA than
          online-only programs.
        </p>
        <p>
          <strong className="text-zinc-800">Hybrid programs:</strong> If any classroom attendance
          occurs — even one day per week — the program qualifies for the school&apos;s ZIP code
          MHA rate, not the online flat rate. This distinction matters significantly for programs
          that offer both in-person and remote options.
        </p>
        <Link href="/calculators/education" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Compare MHA for in-person vs online →
        </Link>
      </div>
    ),
  },
  {
    question: 'What is the Montgomery GI Bill and when is it better?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          MGIB (Chapter 30) is the predecessor to the Post-9/11 GI Bill. Most active duty service
          members who entered after 1985 contributed $1,200 toward MGIB during their first year of
          service.
        </p>
        <p>
          <strong className="text-zinc-800">How it works:</strong> MGIB pays a flat monthly rate —
          $2,518/month for full-time enrollment with 3+ years of service (Oct 2025–Sept 2026) — regardless of school or location. It
          doesn&apos;t cover tuition separately; you receive the flat monthly payment and use it for
          tuition plus living expenses.
        </p>
        <p>
          <strong className="text-zinc-800">When MGIB might be preferred:</strong> In rare
          situations where the flat MGIB monthly rate exceeds what Post-9/11 GI Bill would provide
          in tuition coverage alone — typically at very low-cost schools where tuition is minimal
          and the flat MGIB rate is relatively high compared to the available tuition benefit.
        </p>
        <p>
          For nearly all service members at standard four-year programs, Post-9/11 GI Bill is more
          valuable than MGIB. The calculator makes this comparison automatic.
        </p>
        <Link href="/calculators/education" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Compare GI Bill vs MGIB for your situation →
        </Link>
      </div>
    ),
  },
  {
    question: 'How should you sequence your education benefits?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>A widely used strategy for most service members:</p>
        <ul className="space-y-2 pl-4 list-disc">
          <li>
            <strong className="text-zinc-800">Phase 1 — Active duty:</strong> Use Tuition
            Assistance for any college credits you can complete. Get general education requirements
            done. Cost to GI Bill entitlement: zero.
          </li>
          <li>
            <strong className="text-zinc-800">Phase 2 — Approaching 6 years:</strong> If you plan
            to stay, apply to transfer GI Bill to spouse or future children before the eligibility
            window closes. This requires a 4-year service commitment.
          </li>
          <li>
            <strong className="text-zinc-800">Phase 3 — Separation or retirement:</strong> Activate
            Post-9/11 GI Bill. Choose your school strategically, weighting the MHA for that
            school&apos;s ZIP code alongside program quality and career outcomes.
          </li>
          <li>
            <strong className="text-zinc-800">Phase 4 — VR&amp;E eligibility:</strong> If you have
            a service-connected disability, evaluate VR&amp;E before activating GI Bill — VR&amp;E
            may cover graduate school at no cost to your GI Bill entitlement, preserving those
            months for transfer or a later program.
          </li>
        </ul>
        <Link href="/calculators/education" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Model your complete education benefits strategy →
        </Link>
      </div>
    ),
  },
];

const RELATED = [
  {
    href: '/blog/gi-bill-housing-allowance-zip-code',
    border: 'border-l-blue-500',
    label: 'GI BILL',
    title: 'GI Bill Housing Allowance: Why Your School ZIP Code Matters',
    description: 'How the same GI Bill at two different schools can produce an $86,400 difference over four years — based purely on ZIP code.',
  },
  {
    href: '/blog/vre-chapter-31-vs-gi-bill',
    border: 'border-l-emerald-500',
    label: 'VR&E',
    title: 'VR&E Chapter 31 vs GI Bill: Which to Use First',
    description: 'For veterans with service-connected disabilities: the strategic case for using VR&E before activating Post-9/11 GI Bill.',
  },
  {
    href: '/blog/gi-bill-vs-tuition-assistance',
    border: 'border-l-amber-500',
    label: 'SEQUENCING',
    title: 'GI Bill vs Tuition Assistance: Which to Use First',
    description: 'Why using TA while on active duty and saving GI Bill for after separation often produces the highest total benefit value.',
  },
];

export default function EducationBenefitsGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'Military Education Benefits Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Military Education Benefits Guide</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Military Education Benefits Guide · Official 2026 VA Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Your education benefits could be worth{' '}
            <span className="text-red-700">$100,000+.</span>{' '}
            Make sure you use them in the right order.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            Post-9/11 GI Bill, VR&amp;E, Tuition Assistance, and Montgomery GI Bill each work
            differently. The order you use them — and where you go to school — can swing the total
            value by tens of thousands of dollars.
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              The same GI Bill at two different schools can produce a{' '}
              <span className="text-red-700">$21,600/year difference in housing allowance alone</span>{' '}
              — just from the ZIP code. Over a 4-year degree, that&apos;s $86,400.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/education"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Compare My Education Benefits →
            </Link>
            <Link
              href="#zip-mha"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              See GI Bill MHA by ZIP ↓
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 VA education benefit rates.
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
              Three education benefit decisions worth tens of thousands.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Most service members leave money on the table by not knowing these.
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
                See exactly what your education benefits are worth — by school.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your benefit type, school ZIP code, and enrollment status. Compare GI Bill
                vs VR&amp;E vs TA side by side, including total tuition coverage, monthly housing,
                and multi-year value.
              </p>
              <Link
                href="/calculators/education"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Compare My Benefits →
              </Link>
              <p className="mt-3 text-xs text-white/40">Takes 30 seconds. No account required.</p>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Post-9/11 GI Bill · Full-time</p>
                    <p className="text-sm font-semibold text-zinc-800">School ZIP Comparison</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Bay Area, CA ZIP</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Monthly MHA</span>
                        <span className="font-mono tabular-nums text-zinc-800">$3,603</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Annual MHA (9 mo)</span>
                        <span className="font-mono tabular-nums text-zinc-800">$32,427</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">4-year total value</span>
                        <span className="font-semibold text-zinc-800">~$142,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 pt-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Rural Midwest ZIP</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Monthly MHA</span>
                        <span className="font-mono tabular-nums text-zinc-800">$1,203</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">4-year total value</span>
                        <span className="font-semibold text-zinc-800">~$56,000</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-5 mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">ZIP difference</p>
                  <p className="text-2xl font-bold tabular-nums text-red-700">+$86,000</p>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/education" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Compare your schools →
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
              Understanding your military education benefits
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
