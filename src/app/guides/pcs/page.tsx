import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'Know What Your PCS Move Really Costs — Before Orders Drop';
const DESC =
  'BAH changes, moving entitlements, state taxes, and cost of living can swing your finances by thousands. Compare duty stations and estimate move costs with free tools using official 2026 DTMO data.';
const CANONICAL = '/guides/pcs';
const DATE = '2026-04-12';
const OG_IMAGE = '/api/og?type=guide&title=PCS+%26+Duty+Station+Financial+Guide+2026&v=2';

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
    question: 'What PCS entitlements am I authorized?',
    answer:
      'PCS entitlements include: Dislocation Allowance (DLA) — amounts vary by rank and dependency status (e.g., $2,389 without dependents and $3,548 with dependents for E-6 in 2026); MALT mileage at $0.205/mile for the official distance; per diem for authorized travel days (1 day per 350 miles); and Temporary Lodging Expense (TLE) for up to 21 days combined at old and new stations at actual cost up to the per diem rate.',
  },
  {
    question: 'Should I use a government move or do a PPM (DITY move)?',
    answer:
      'A government contracted move is simpler but gives you no financial upside. A Personally Procured Move (PPM) reimburses you 95% of what a contracted move would have cost — creating net proceeds when you can move for less. Typical PPM net proceeds range from $1,000–$8,000 depending on move distance and how efficiently you move. PPM net proceeds are taxable income.',
  },
  {
    question: 'How does BAH change at my new station?',
    answer:
      'When you check into your new duty station, BAH resets to the current rate for the new Military Housing Area (MHA), grade, and dependency status. Your old rate does not carry over — there is no rate protection across a PCS. Rate protection only applies to year-over-year decreases at the same duty station. Moving from San Diego to Fort Bragg could reduce BAH by $1,000–$2,000/month; moving from rural Georgia to Northern Virginia could increase it by the same.',
  },
  {
    question: 'How do I compare two duty stations financially?',
    answer:
      'A complete duty station financial comparison includes: BAH rate at both stations; state income tax (nine states have no income tax — AK, FL, NV, NH, SD, TN, TX, WA, WY); CONUS COLA eligibility at each station; and non-housing cost of living (groceries, transportation, childcare). For an O-3, the difference between a zero-income-tax state and California is roughly $6,700/year — often more than the BAH difference.',
  },
  {
    question: 'Why do OCONUS allowances often produce less savings than expected?',
    answer:
      'Overseas tours come with OHA, Overseas COLA, and MIHA that look like a significant raise on paper. In practice, OCONUS living costs — restaurants, transportation, travel home — typically run higher than CONUS. Overseas COLA is calculated on standardized spending patterns that may not match yours. Many service members find that OCONUS allowances offset higher costs rather than creating a windfall. Directing any surplus to TSP rather than absorbing it through lifestyle costs is the strategy most often cited by those who built savings overseas.',
  },
  {
    question: 'What is the PCS financial timeline?',
    answer:
      'Orders drop: research BAH at gaining station, decide PPM vs government move. 30–60 days before departure: submit PPM paperwork, schedule pre-move weight ticket. Arrival: sign in as early as possible (BAH starts at report date), claim TLE immediately. 30–60 days after arrival: file travel voucher (DD Form 1351-2) for DLA, MALT, per diem, and TLE — do not delay past 90 days. 90–180 days after arrival: finalize PPM reimbursement with post-move weight ticket.',
  },
  {
    question: 'How does PCS work for dual military couples?',
    answer:
      'Joint domicile requests are encouraged but not guaranteed — approval depends on manpower requirements for both career fields. If stationed separately, each service member claims BAH at the without-dependents rate for their own location (unless children are present, in which case the parent the children live with claims with-dependents rate). Geographically separated service members may qualify for a Family Separation Allowance of $300/month.',
  },
  {
    question: 'How can BAH build wealth through each PCS move?',
    answer:
      'BAH is paid regardless of your actual housing cost. If you find housing that costs less than your BAH, you keep the difference. Using a VA loan to purchase a home where the mortgage payment runs below BAH allows the excess to cover ownership costs (taxes, insurance, maintenance), while you accumulate equity through principal paydown and appreciation. When you PCS again, you sell or rent the property and realize that equity. This is not guaranteed — markets vary — but it is a widely used long-term wealth strategy for military families.',
  },
];

// ── Impact cards (Zone 2) ─────────────────────────────────────────────────────

const IMPACT_CARDS = [
  {
    accent: 'bg-blue-800',
    label: 'Impact 1',
    title: 'Your BAH resets',
    description:
      'When you check into your new station, BAH resets to the new location\'s rate. No rate protection carries over from your old station.',
    bullets: [
      'San Diego → Fort Bragg: BAH could drop $1,500+/mo',
      'Rural GA → Northern VA: BAH could jump $1,000+/mo',
      'Biggest ongoing financial impact of any PCS',
    ],
    cta: 'Compare BAH at two stations →',
    href: '/calculators/bah',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Impact 2',
    title: 'Entitlements don\'t cover everything',
    description:
      'DLA, MALT mileage, per diem, and TLE offset your costs — but they rarely cover the full expense of a military move.',
    bullets: [
      'DLA: $2,389 (E-6, no dep) / $3,548 (E-6, w/ dep) — varies by rank',
      'MALT: $0.205/mile — less than actual driving costs',
      'PPM net proceeds: $1,000–$8,000 if you move yourself',
    ],
    cta: 'Estimate my move costs →',
    href: '/calculators/pcs',
  },
  {
    accent: 'bg-amber-600',
    label: 'Impact 3',
    title: 'State taxes and cost of living shift',
    description:
      'Nine states have no income tax. Moving from Texas to California could cost an O-3 roughly $6,700/year in state taxes alone.',
    bullets: [
      'No-tax states: AK, FL, NV, NH, SD, TN, TX, WA, WY',
      'CONUS COLA may offset some high-cost areas',
      'Non-housing costs vary dramatically by location',
    ],
    cta: 'Compare full cost of two stations →',
    href: '/calculators/compare',
  },
];

// ── Accordion items (Zone 4) ──────────────────────────────────────────────────

const ACCORDION = [
  {
    question: 'What PCS entitlements am I authorized?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          PCS orders trigger a set of government travel entitlements designed — but often failing
          — to make you financially whole for the cost of a military move.
        </p>
        <p>
          <strong className="text-zinc-800">DLA (Dislocation Allowance)</strong> is a flat-rate
          payment based on rank and dependency status, paid once per PCS. It is not a
          reimbursement — no receipts required, no tie to actual expenses.
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Without dependents: $2,389.42 (E-6) — ranges from ~$1,871 (E-1) to ~$5,187 (O-7+)</li>
          <li>With dependents: $3,548.02 (E-1–E-6) — ranges up to ~$6,386 (O-7+)</li>
        </ul>
        <p>
          <strong className="text-zinc-800">MALT (Monetary Allowance in Lieu of Transportation)</strong>{' '}
          is a flat travel allowance of <strong className="text-zinc-800">$0.205/mile</strong> based
          on the official DoD distance, not your actual route. A cross-country move from Virginia to
          California (~2,700 miles) yields $553.50 — meaningfully less than actual fuel and vehicle costs.
        </p>
        <p>
          <strong className="text-zinc-800">Per diem</strong> covers lodging and meals during travel
          days, at 1 authorized day per 350 miles of official distance. Keep all receipts.
        </p>
        <p>
          <strong className="text-zinc-800">TLE (Temporary Lodging Expense)</strong> covers temporary
          lodging near your old and/or new duty station — up to{' '}
          <strong className="text-zinc-800">21 days combined</strong> at actual cost up to the per
          diem rate. This is separate from travel-day per diem.
        </p>
        <Link href="/calculators/pcs" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Estimate your full PCS entitlements →
        </Link>
      </div>
    ),
  },
  {
    question: 'Should I use a government move or do a PPM (DITY move)?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">Government contracted move:</strong> The government
          contracts a moving company that packs, ships, and delivers your goods. Simple — but you
          lose control, and damage or missing items are common.
        </p>
        <p>
          <strong className="text-zinc-800">PPM (Personally Procured Move):</strong> You manage your
          own move and the government reimburses you{' '}
          <strong className="text-zinc-800">95% of what a contracted move would have cost</strong>{' '}
          them. When you can move for less than that, the difference is your net proceeds.
        </p>
        <p>Typical PPM net proceeds range from <strong className="text-zinc-800">$1,000–$8,000</strong> depending on distance and how efficiently you move. Self-packing and using a rented truck increases it; hiring a full-service mover reduces it.</p>
        <p>
          <strong className="text-zinc-800">Tax note:</strong> PPM net proceeds are taxable income. The
          government will report it — plan for a tax payment in the year of the move.
        </p>
        <Link href="/calculators/pcs" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate PPM net proceeds for your move →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does BAH change at my new station?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          When you check into your new duty station, BAH resets to the current rate for your new
          Military Housing Area (MHA), grade, and dependency status.{' '}
          <strong className="text-zinc-800">Your old rate does not carry over.</strong>
        </p>
        <p>
          <strong className="text-zinc-800">Rate protection only applies within the same duty
          station,</strong> year-over-year. It protects you from DTMO reducing rates for your MHA
          in a new calendar year — as long as your grade and dependency status haven't changed.
          Once you PCS, you start fresh at the new location's current rate.
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Moving from San Diego to Fort Bragg could reduce BAH by $1,000–$2,000/month</li>
          <li>Moving from rural Georgia to Northern Virginia could increase it by the same</li>
          <li>Neither situation involves rate protection</li>
        </ul>
        <p>
          Practical tip: look up BAH at your gaining station <em>before</em> signing a lease or
          accepting orders. A $1,500/month BAH drop you didn't budget for will hurt far more than
          the move itself.
        </p>
        <Link href="/calculators/bah" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Compare BAH at both duty stations →
        </Link>
      </div>
    ),
  },
  {
    question: 'How do I compare two duty stations financially?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          BAH is the most visible variable, but a complete comparison includes four factors:
        </p>
        <p>
          <strong className="text-zinc-800">State income tax:</strong> Nine states have no income
          tax (FL, TX, NV, WA, WY, SD, AK, TN, NH). Several others — including Virginia, Maryland,
          and California — have rates of 5–13%. For an O-3 earning $74,000 in base pay, the
          difference between a zero-tax state and California is roughly{' '}
          <strong className="text-zinc-800">$6,700/year</strong> — often more than the BAH difference.
        </p>
        <p>
          <strong className="text-zinc-800">CONUS COLA eligibility:</strong> A small number of
          high-cost CONUS stations receive supplemental COLA in addition to BAH. Add it to the
          total when it applies.
        </p>
        <p>
          <strong className="text-zinc-800">Local cost of living:</strong> BAH covers housing, but
          groceries, transportation, childcare, and utilities vary significantly. The DTMO's
          official cost-of-living data provides a baseline.
        </p>
        <p>
          <strong className="text-zinc-800">Career factors:</strong> Some assignments are worth a
          financial trade-off for promotion visibility or joint billet access. Don't ignore the
          career calculus.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/compare" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Compare Your PCS Move →
          </Link>
          <Link href="/blog/best-worst-bah-duty-stations-2026" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Best & Worst BAH stations →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'Why do OCONUS allowances often produce less savings than expected?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Overseas tours come with OHA (Overseas Housing Allowance), Overseas COLA, and MIHA that
          look like a significant raise on paper. And sometimes they are. But frequently, service
          members return from OCONUS tours with less saved than they expected.
        </p>
        <p>
          <strong className="text-zinc-800">The trap:</strong> OHA covers housing, but OCONUS living
          costs — restaurants, transportation, entertainment, travel home — are typically higher
          than CONUS. Overseas COLA is calculated on standardized spending patterns that may not
          match yours.
        </p>
        <p>
          A common approach: treat OCONUS allowances as offsetting the higher cost of living, not
          as a windfall. Directing any surplus to TSP or savings — rather than absorbing it through
          higher lifestyle spending — is the strategy most often cited by those who actually built
          savings overseas.
        </p>
        <Link href="/blog/oconus-cola-trap" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          The OCONUS COLA Trap →
        </Link>
      </div>
    ),
  },
  {
    question: 'What is the PCS financial timeline?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>A PCS move has financial implications across a 6-month window.</p>
        <ul className="space-y-2 pl-4 list-disc">
          <li><strong className="text-zinc-800">Orders drop:</strong> Research BAH at gaining station. Decide PPM vs government move. Start tracking financial exposure.</li>
          <li><strong className="text-zinc-800">30–60 days before departure:</strong> Submit PPM paperwork if doing DITY. Schedule pre-move weight ticket. Track all moving expenses.</li>
          <li><strong className="text-zinc-800">Travel days:</strong> Keep every lodging and meal receipt. Per diem is claims-based — documentation required.</li>
          <li><strong className="text-zinc-800">Arrival:</strong> Sign in as early as possible — BAH at the new rate starts at report date. Claim TLE immediately for any temporary lodging.</li>
          <li><strong className="text-zinc-800">30–60 days after arrival:</strong> File travel voucher (DD Form 1351-2) for DLA, MALT, per diem, and TLE. Don't delay past 90 days.</li>
          <li><strong className="text-zinc-800">90–180 days after arrival:</strong> Finalize PPM reimbursement with post-move weight ticket submitted to the Transportation Office.</li>
        </ul>
        <Link href="/blog/pcs-financial-planning-guide" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Complete PCS financial planning checklist →
        </Link>
      </div>
    ),
  },
  {
    question: 'How does PCS work for dual military couples?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Dual military couples face unique PCS complexity that doesn't apply to single-income
          military families.
        </p>
        <p>
          <strong className="text-zinc-800">Joint domicile:</strong> DoD policy encourages but
          cannot guarantee joint assignments. Approval depends on manpower requirements for both
          career fields.
        </p>
        <p>
          <strong className="text-zinc-800">BAH when stationed separately:</strong> Each service
          member claims BAH at the without-dependents rate for their own location — unless children
          are present, in which case the parent the children live with claims the with-dependents
          rate.
        </p>
        <p>
          <strong className="text-zinc-800">Separation allowance:</strong> Service members
          geographically separated from dependents due to military assignment (not voluntarily) may
          qualify for Family Separation Allowance of $300/month.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/dual-military-bah" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Dual Military BAH Calculator →
          </Link>
          <Link href="/blog/dual-military-financial-strategies" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Dual Military Financial Strategies →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'How can BAH build wealth through each PCS move?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          BAH is paid regardless of your actual housing cost. If you live in housing that costs
          less than your BAH, you keep the difference. The strategy used most often by military
          families who build significant wealth: buy a home with a VA loan where the mortgage
          payment runs below BAH.
        </p>
        <p>
          When the mortgage payment is below BAH, the excess covers ownership costs (taxes,
          insurance, maintenance). Meanwhile, principal paydown and appreciation are equity that
          accumulates outside your military compensation. When you PCS, you sell or rent the
          property and realize that equity.
        </p>
        <p className="text-xs text-zinc-400 italic">
          This is not guaranteed — markets vary, and some service members who bought at the wrong
          time and PCS'd quickly took losses. It is a long-term strategy, not a short-term one.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/blog/how-bah-builds-wealth" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            How BAH Builds Wealth →
          </Link>
        </div>
      </div>
    ),
  },
];

// ── Related content cards (Zone 5) ───────────────────────────────────────────

const RELATED = [
  {
    href: '/blog/pcs-that-costs-14000-vs-makes-6000',
    border: 'border-l-blue-500',
    label: 'PCS PLANNING',
    title: 'The PCS That Costs $14,000 — And the One That Makes $6,000',
    description: 'Two scenarios for the same E-6 family on the same move — $20,000 apart based purely on knowing the entitlements.',
  },
  {
    href: '/blog/the-47000-gap-bah-duty-station',
    border: 'border-l-emerald-500',
    label: 'BAH DEEP DIVE',
    title: 'The $47,000 Gap',
    description: 'Why two E-5s with the same rank at different duty stations can have wildly different total compensation.',
  },
  {
    href: '/blog/best-worst-bah-duty-stations-2026',
    border: 'border-l-amber-500',
    label: 'DUTY STATIONS',
    title: 'Best and Worst BAH Duty Stations of 2026',
    description: 'Where BAH stretches furthest — and where it falls shortest — across major installations.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PcsGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'PCS & Duty Station Financial Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">PCS & Duty Station Financial Guide</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="border-b border-zinc-200 py-12 sm:py-16 px-4" style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}>
        <div className="mx-auto max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DTMO &amp; DFAS Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Know what your{' '}
            <span className="text-red-700">PCS move really costs</span>{' '}
            — before orders drop.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            BAH changes, moving entitlements, state taxes, and cost of living can swing your
            finances by thousands.{' '}
            <strong className="text-zinc-900">Compare duty stations and estimate move costs</strong>{' '}
            with free tools using official 2026 DTMO data.
          </p>

          {/* Urgency stat */}
          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              The same E-6 family on the same PCS move can{' '}
              <span className="text-red-700">lose $14,000 — or profit $6,000.</span>{' '}
              The difference is knowing the entitlements.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/compare"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Compare My Duty Stations →
            </Link>
            <Link
              href="/calculators/pcs"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Estimate My PCS Costs →
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 DTMO and DFAS data.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: Three financial impacts ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              Three things that change your money when you PCS.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              It&apos;s not just the cost of the move. Your ongoing pay changes too.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {IMPACT_CARDS.map(({ accent, label, title, description, bullets, cta, href }) => (
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
                See the full financial picture before you sign your housing lease.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your current and gaining duty stations. Compare BAH, state taxes, CONUS COLA,
                and estimated take-home — side by side.
              </p>
              <Link
                href="/calculators/compare"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Compare My Stations →
              </Link>
              <p className="mt-3 text-xs text-white/40">Takes 60 seconds. No account required.</p>
            </div>

            {/* Right: sample comparison card */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-sm">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3">
                  <p className="text-xs text-zinc-500 font-medium">E-6 · 8 years · With dependents</p>
                  <p className="text-sm font-semibold text-zinc-800">Compare Your PCS Move</p>
                </div>
                <div className="px-5 py-3 divide-y divide-zinc-100">
                  {/* Station A */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Station A — Fort Bragg, NC</p>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">BAH (w/ dependents)</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">$2,049<span className="text-zinc-400">/mo</span></span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">State income tax</span>
                      <span className="text-sm font-mono text-zinc-800">4.5%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">CONUS COLA</span>
                      <span className="text-sm font-mono text-zinc-800">None</span>
                    </div>
                  </div>
                  {/* Station B */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Station B — JBLM, WA</p>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">BAH (w/ dependents)</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">$2,919<span className="text-zinc-400">/mo</span></span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">State income tax</span>
                      <span className="text-sm font-mono text-zinc-800">None</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-zinc-600">CONUS COLA</span>
                      <span className="text-sm font-mono text-zinc-800">None</span>
                    </div>
                  </div>
                </div>
                {/* Difference bar */}
                <div className="mx-5 mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">BAH Difference</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700">+$870/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Annual impact</p>
                    <p className="text-sm font-semibold text-zinc-700">+$10,440/yr</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/compare" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Compare your stations →
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
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
              Understanding your PCS finances
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
              <Link href="/guides/military-pay" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Military Pay Guide →
              </Link>
              <Link href="/guides/retirement-tsp" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Retirement & TSP Guide →
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
