import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPost, getAllSlugs, formatDate } from '@/lib/blog';
import { CalculatorCallout } from '@/components/blog/CalculatorCallout';
import { KeyFact } from '@/components/blog/KeyFact';
import { QuickAnswer, QAItem } from '@/components/blog/QuickAnswer';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';

// MDX components available in all posts
const mdxComponents = {
  CalculatorCallout,
  KeyFact,
  QuickAnswer,
  QAItem,
  Disclaimer,
};

const GUIDE_TITLES: Record<string, string> = {
  'military-pay': 'Military Pay & Compensation Guide',
  'va-disability': 'VA Disability Benefits Guide',
  'retirement-tsp': 'Military Retirement & TSP Guide',
  'pcs': 'PCS & Duty Station Financial Guide',
  'education-benefits': 'Military Education Benefits Guide',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Compensation & Pay':  'bg-red-100 text-red-700',
  'Veterans Benefits':   'bg-blue-100 text-blue-700',
  'Housing & BAH':       'bg-green-100 text-green-700',
  'TSP & Retirement':    'bg-purple-100 text-purple-700',
  'Retirement & TSP':    'bg-purple-100 text-purple-700',
  'Career Transition':   'bg-amber-100 text-amber-700',
  'Education Benefits':  'bg-teal-100 text-teal-700',
  'General':             'bg-zinc-100 text-zinc-600',
};

const POST_FAQS: Record<string, { question: string; answer: string }[]> = {
  'va-disability-math-explained': [
    {
      question: "Why doesn't the VA add disability percentages together?",
      answer: "The VA uses the 'whole person' method (38 CFR § 4.25). Each rating applies to your remaining functional capacity, not the original 100%. So 50% + 30% = 65% combined, which rounds to 70% — not 80%.",
    },
    {
      question: 'What is the bilateral factor in VA disability ratings?',
      answer: 'The bilateral factor (38 CFR § 4.26) adds a 10% bonus to the combined value of disabilities affecting both sides of a paired body part — both knees, both arms, both legs, etc. — before mixing those into the main calculation. Even a 10% rating on the second side triggers this factor.',
    },
    {
      question: 'How does VA disability rounding work?',
      answer: 'The final combined value rounds to the nearest 10%: values ending in 1–4 round down, values ending in 5–9 round up. This happens once, at the very end — never between calculation steps.',
    },
    {
      question: 'Why does the gap between 90% and 100% VA disability matter so much?',
      answer: 'In 2026, the jump from 90% ($2,362.30/month) to 100% ($3,938.58/month) is $1,576.28/month — the largest single step in the pay table. That is $18,915/year in tax-free compensation, making the difference between a 94.9% and 95% exact combined value worth thousands annually.',
    },
  ],
  'dual-military-bah-guide': [
    {
      question: 'Can both members of a dual military couple receive the with-dependents BAH rate?',
      answer: 'No. When both spouses are active-duty and co-located, only one member can receive the with-dependents BAH rate. The other always receives the without-dependents rate, regardless of rank or seniority.',
    },
    {
      question: 'Should the higher-ranking spouse always claim dependents for dual military BAH?',
      answer: "Not necessarily. The optimal configuration depends on which member has the larger gap between their with-dependents and without-dependents BAH rate at your specific duty station. In markets like San Diego, the E-5's gap can exceed the O-3's — making it more advantageous for the junior member to claim.",
    },
    {
      question: 'What happens to dual military BAH when spouses are stationed at different locations?',
      answer: 'When stationed separately, dependent assignment follows where the dependents physically reside — this is a policy determination, not a financial choice. The member whose children live with them receives the with-dependents rate for their duty station.',
    },
    {
      question: 'Do dual military couples without children get different BAH rates?',
      answer: 'No. A spouse technically counts as a dependent for BAH purposes, but dual military couples without children both receive the without-dependents rate. Marriage alone does not trigger with-dependents BAH when both spouses are active duty.',
    },
  ],
  'va-loan-funding-fee-explained': [
    {
      question: 'What is the VA funding fee for a first-time VA loan purchase in 2026?',
      answer: 'For a first-use purchase loan with no down payment, the VA funding fee is 2.15% of the loan amount. On a $350,000 loan that is $7,525. The fee drops to 1.50% with 5% down or 1.25% with 10% or more down.',
    },
    {
      question: 'Who is exempt from the VA funding fee?',
      answer: 'Veterans receiving VA compensation for a service-connected disability, active-duty Purple Heart recipients, surviving spouses receiving DIC, and service members with a proposed or memorandum disability rating prior to closing are all exempt from the VA funding fee entirely.',
    },
    {
      question: 'What is the VA funding fee for a subsequent use VA loan?',
      answer: 'For a subsequent-use purchase loan with no down payment, the fee is 3.30% — $11,550 on a $350,000 loan. At 5% down or more, the rate drops to 1.50% regardless of use count, the same as first use.',
    },
    {
      question: 'What is the VA IRRRL funding fee?',
      answer: 'The IRRRL (VA Streamline Refinance) carries a 0.50% funding fee — the lowest of any VA loan type, and it applies the same for first and subsequent use. On a $300,000 loan balance, that is $1,500.',
    },
  ],
  'can-i-use-va-loan-again': [
    {
      question: 'Can I use my VA loan benefit more than once?',
      answer: 'Yes. The VA loan benefit has no use limit and does not expire. Entitlement is restored when you sell your home and pay off the VA loan balance, allowing you to use full entitlement again with no down payment and no loan limit.',
    },
    {
      question: 'How do I restore my VA loan entitlement after selling?',
      answer: 'When your VA loan is paid off at closing, request entitlement restoration through VA.gov, eBenefits, or your lender. There is no waiting period — you can apply for a new VA loan immediately after restoration.',
    },
    {
      question: 'Can I have two VA loans at the same time?',
      answer: 'Yes, if you have sufficient remaining entitlement. When you close on a VA loan, a portion of your entitlement is tied to that loan. If enough remains to cover 25% of a new purchase price, you can carry two VA loans simultaneously — common when PCSing before selling.',
    },
    {
      question: 'Is the subsequent use VA funding fee worth it compared to conventional?',
      answer: 'In most cases, yes. The 3.30% subsequent-use funding fee at zero down adds roughly $73/month on a $350,000 loan (financed over 30 years at 6.5%). Conventional PMI on a loan with less than 20% down typically costs $145–175/month — more than double. The VA loan still carries a monthly cost advantage for borrowers without a down payment.',
    },
  ],
  'using-bah-to-buy-a-home': [
    {
      question: 'Does BAH count as income for a VA mortgage?',
      answer: 'Yes. Most VA-approved lenders count BAH at 100% of its value when calculating debt-to-income ratio and maximum loan amount. Your Leave and Earnings Statement (LES) is the standard documentation.',
    },
    {
      question: 'Can BAH cover a full mortgage payment?',
      answer: 'At many moderate-cost duty stations, yes. At national median E-5 with-dependent BAH rates in 2026, the allowance can cover principal, interest, taxes, and insurance on a median-priced local home financed with a VA loan — with some margin remaining. It depends entirely on the specific station and local market.',
    },
    {
      question: 'What happens to my mortgage when I PCS?',
      answer: 'The mortgage stays when you leave. At PCS time you typically sell the home, rent it out (using BAH at the new station to cover the new mortgage), or carry both expenses from base pay. Each path has different financial and logistical requirements — plan this before you buy.',
    },
    {
      question: 'Should I buy a home before separation from the military?',
      answer: 'Build the post-separation budget around base pay and VA disability compensation only — BAH ends at separation and the mortgage does not. If the payment is affordable without BAH, buying before separation can make sense. If the math only works with BAH included, the timing warrants careful consideration.',
    },
  ],
  'va-appraisal-what-to-expect': [
    {
      question: 'What is the purpose of a VA appraisal?',
      answer: 'A VA appraisal serves two purposes: establishing the market value of the property using comparable sales, and confirming the home meets VA Minimum Property Requirements (MPRs). Both must be satisfied for the loan to proceed. The appraisal is not a home inspection — it does not replace a thorough inspection by a licensed home inspector.',
    },
    {
      question: 'What are VA Minimum Property Requirements (MPRs)?',
      answer: 'VA MPRs are baseline safety and livability standards a property must meet. They cover roof condition (at least 2 years of remaining useful life), functional HVAC, plumbing, and electrical systems, safe water supply, adequate sewage disposal, lead paint remediation on pre-1978 homes, no active wood-destroying pest damage, and a structurally sound foundation. MPRs focus on safety and habitability — cosmetic issues like outdated finishes or deferred maintenance do not trigger MPR concerns.',
    },
    {
      question: 'What happens if the VA appraisal comes in below the purchase price?',
      answer: 'If the appraised value is less than the purchase price, you have four main options: renegotiate the price with the seller to match the appraised value, pay the difference between the appraised value and purchase price out of pocket (an appraisal gap payment), request a Reconsideration of Value (ROV) with supporting comparable sales data, or exit the contract under your appraisal contingency. A low appraisal is a negotiation opportunity — not an automatic dead deal.',
    },
    {
      question: 'What is the VA Tidewater process?',
      answer: 'Tidewater is a VA procedure that allows lenders to submit additional comparable sales or market data before the appraisal is finalized if the appraiser believes the value may come in below the purchase price. The lender has 2 business days to provide supporting data. It is an early-warning and correction opportunity — not a signal the deal is over.',
    },
  ],
  'va-loan-vs-fha-vs-conventional': [
    {
      question: 'What is the main difference between a VA loan and a conventional loan?',
      answer: 'VA loans allow eligible borrowers to purchase with no down payment and no private mortgage insurance (PMI). They carry a one-time VA funding fee (2.15% first use, waivable for disability-rated veterans) instead of ongoing PMI. Conventional loans require a down payment (3–20%) and PMI if the down payment is under 20%, but have no service eligibility requirement and can be used for non-primary residences.',
    },
    {
      question: 'Is FHA mortgage insurance permanent?',
      answer: 'For most FHA loans originated after June 2013 with a down payment under 10%, the annual mortgage insurance premium (MIP) remains for the life of the loan. It does not cancel when you reach 20% equity the way conventional PMI does. This is one of the most significant long-term cost differences between FHA and VA loans — VA loans have no monthly mortgage insurance at all.',
    },
    {
      question: 'When does a conventional loan beat a VA loan?',
      answer: 'Conventional financing may be more cost-effective when you have 20% or more for a down payment (no PMI either way, but no VA funding fee with conventional), when you are buying a second home or investment property (VA requires primary residence), when your conventional rate is meaningfully lower than VA rates for your credit profile, or when your expected hold period is short and the funding fee does not pencil out.',
    },
    {
      question: 'How should I actually compare VA vs FHA vs conventional loans?',
      answer: 'Generic comparisons show directional guidance — the real answer comes from actual Loan Estimates from lenders. Get quotes for VA, FHA, and conventional if you are eligible for multiple options, then compare total monthly payment, cash to close, and total cost over your expected hold period. A VA loan with a high rate and fees can be worse than a well-priced conventional loan.',
    },
  ],
  'va-loan-assumptions-explained': [
    {
      question: 'Can a non-veteran assume a VA loan?',
      answer: 'Yes. Both veterans and non-veterans can assume a VA loan if they qualify with the loan servicer. The buyer does not need to be VA-eligible to assume. However, if a non-veteran assumes without substituting VA entitlement, the seller\'s entitlement remains tied to the assumed loan until it is fully paid off — which can affect the seller\'s ability to use VA financing again.',
    },
    {
      question: 'What happens to the seller\'s VA entitlement after a loan assumption?',
      answer: 'It depends on whether the buyer substitutes VA entitlement. If a VA-eligible buyer formally substitutes their entitlement for the seller\'s, the seller\'s entitlement is released and restored. If a non-veteran (or a veteran who does not substitute) assumes the loan, the seller\'s entitlement remains tied to the assumed loan until it is fully paid off — potentially for decades.',
    },
    {
      question: 'What is the VA funding fee for a loan assumption?',
      answer: 'The buyer pays a VA funding fee of 0.5% of the remaining loan balance at assumption — the same rate as an IRRRL. On a $280,000 remaining balance, the assumption funding fee is $1,400. Standard disability-related exemptions may apply — confirm with the loan servicer.',
    },
    {
      question: 'How long does a VA loan assumption take to close?',
      answer: 'VA loan assumptions typically take 45–90 days or longer, which is significantly more than a standard purchase closing. The servicer must review the buyer\'s creditworthiness, process entitlement substitution if applicable, and formally approve the assumption. Plan for this timeline when structuring any purchase contract.',
    },
  ],
  'tuition-assistance-and-gi-bill-together': [
    {
      question: 'Can you use Tuition Assistance and the GI Bill for the same class?',
      answer: 'Not for the same tuition cost. Tuition Assistance covers up to $250 per credit hour; GI Bill Top-Up can fill the gap above what TA covers, but this uses GI Bill entitlement months. Most active-duty members do better preserving GI Bill for after separation, when its monthly housing allowance adds real value.',
    },
    {
      question: 'What is GI Bill Top-Up?',
      answer: 'GI Bill Top-Up allows GI Bill to cover tuition costs that exceed Tuition Assistance limits ($250/credit hour, $4,500/year). Each dollar of Top-Up uses GI Bill entitlement months — the same 36-month pool that funds housing allowance after separation.',
    },
    {
      question: 'Should I use Tuition Assistance or GI Bill while on active duty?',
      answer: 'Use Tuition Assistance first. GI Bill\'s monthly housing allowance is only paid when not on active duty — spending GI Bill months while serving wastes the most valuable part of the benefit. Save GI Bill for after separation or graduate school.',
    },
  ],
  'tsp-fund-options-military': [
    {
      question: 'What TSP fund options are available to military members?',
      answer: 'TSP offers five individual funds: G (government bonds, safest), F (bond index), C (S&P 500 equivalent, highest historical long-term returns), S (small-cap stocks), and I (international stocks). Lifecycle (L) Funds automatically blend all five based on a target retirement date and are the default for BRS enrollees.',
    },
    {
      question: 'What is the G Fund in TSP?',
      answer: 'The G Fund holds short-term U.S. Treasury securities and cannot lose value month over month. Its tradeoff is historically modest returns that may not keep pace with inflation over long periods. Many older TSP accounts default to G Fund if the member never changed their allocation.',
    },
    {
      question: 'What are Lifecycle (L) Funds in TSP?',
      answer: 'Lifecycle Funds automatically blend the five TSP individual funds and shift from aggressive (more stocks) to conservative (more bonds and G Fund) as the target retirement year approaches. They are the default for BRS auto-enrollees and are a reasonable set-it-and-forget-it option that prevents the common mistake of leaving everything in the G Fund.',
    },
  ],
  'is-sgli-enough-life-insurance': [
    {
      question: 'How much does SGLI cost in 2026?',
      answer: 'SGLI costs $26/month for the maximum $500,000 of coverage in 2026. Coverage can be elected in $50,000 increments from $50,000 to $500,000 for proportionally lower premiums. All active-duty members are automatically enrolled at the maximum unless they opt down or out.',
    },
    {
      question: 'Is $500,000 of SGLI enough life insurance?',
      answer: 'It depends on your situation. A common benchmark is 10–12 times annual income — for an E-6, that suggests $570,000–$684,000, near the SGLI maximum. Single members with no dependents may need much less; a family with a mortgage, young children, and a single income may need more than $500,000.',
    },
    {
      question: 'What happens to SGLI when you leave the military?',
      answer: 'SGLI terminates 120 days after separation. Within 240 days of separation, you can convert to VGLI (Veterans Group Life Insurance) without a health exam. After 240 days, a medical exam is required. VGLI premiums increase every 5 years with age and become significantly more expensive than private term life insurance purchased while young and healthy.',
    },
  ],
  'how-deployment-pay-works': [
    {
      question: 'What is the Combat Zone Tax Exclusion?',
      answer: 'CZTE excludes qualifying military pay from federal income tax during eligible months in a designated combat zone. Enlisted members and warrant officers can generally exclude all qualifying pay; commissioned officers have a monthly exclusion cap tied to the E-9 maximum rate. FICA taxes still apply even during CZTE months.',
    },
    {
      question: 'How much is Hostile Fire Pay in 2026?',
      answer: 'Hostile Fire Pay and Imminent Danger Pay each pay $225/month. HFP is typically paid for the full calendar month if you qualify any day of that month; IDP is generally prorated daily. Both are tax-free during combat zone months under CZTE.',
    },
    {
      question: 'What is the Savings Deposit Program during deployment?',
      answer: 'The Savings Deposit Program pays 10% annual interest — guaranteed by the U.S. government — on up to $10,000 deposited while deployed to a qualifying combat zone for 30 or more consecutive days. Interest accrues from the date of deposit and continues for up to 90 days after leaving the combat zone.',
    },
  ],
  'dual-military-bah-rules': [
    {
      question: 'Can both members of a dual-military couple receive BAH?',
      answer: 'Yes. Both active-duty members receive BAH, but the rates depend on whether they have children and their respective duty stations. When co-located with children, one member receives the with-dependents rate and the other receives the without-dependents rate. Without children, both receive the without-dependents rate.',
    },
    {
      question: 'Who gets the with-dependents BAH rate in a dual military couple?',
      answer: 'Whichever member designates the children as dependents in DEERS. The financially optimal choice is the member with the larger gap between their with-dependents and without-dependents BAH rates for their specific duty station — which is not always the higher-ranking member.',
    },
    {
      question: 'What happens to BAH when dual military spouses are at different duty stations?',
      answer: 'Each member receives BAH for their own duty station. The member with children designated in DEERS receives the with-dependents rate for their station; the other receives the without-dependents rate for theirs. Combined BAH for geographically separated dual-military couples can be substantial.',
    },
  ],
  'pcs-out-of-pocket-costs': [
    {
      question: 'Does the military pay for everything in a PCS move?',
      answer: 'Not entirely. While the military covers travel pay, mileage, per diem, temporary lodging allowances, and household goods shipping, most service members spend $1,000–$5,000 or more out of pocket on security deposits, gap lodging beyond TLE limits, items not fully covered by per diem, and the reimbursement lag.',
    },
    {
      question: 'What is DLA (Dislocation Allowance)?',
      answer: 'DLA is a one-time payment to offset PCS moving costs — for an E-6 with dependents in 2026, it is $3,548.02. It requires no receipts and is paid regardless of actual expenses. It rarely covers all out-of-pocket PCS costs, especially in high-cost destination markets.',
    },
    {
      question: 'What is a PPM or DITY PCS move?',
      answer: 'A Personally Procured Move (PPM, formerly DITY) allows you to arrange your own move and keep the difference between what the government would have paid a moving company and your actual costs. Done strategically on longer routes, a PPM can generate $2,000–$5,000 in net proceeds.',
    },
  ],
  'what-is-scra-military-protection': [
    {
      question: 'What is SCRA and who does it protect?',
      answer: 'The Servicemembers Civil Relief Act protects active-duty military members with a 6% cap on pre-service debt interest, lease termination rights with qualifying military orders, protection from certain evictions, and state tax protection through preservation of legal residence.',
    },
    {
      question: 'Does SCRA lower interest rates on all my debts?',
      answer: 'Only debts incurred before entering active duty. The 6% cap does not apply to accounts opened after you began active service. To activate the reduction, submit written notice to each lender with a copy of your orders. Many major issuers voluntarily reduce rates further or waive fees beyond the SCRA minimum.',
    },
    {
      question: 'Can I break my lease using SCRA?',
      answer: 'Yes, in qualifying situations. SCRA allows early lease termination if you receive PCS orders moving you more than 50 miles from the current location, or deployment orders for 90 or more consecutive days. Written notice and a copy of orders are required; early termination penalties cannot be enforced by the landlord.',
    },
  ],
  'what-happens-to-tsp-after-military': [
    {
      question: 'Can you keep your TSP after leaving the military?',
      answer: 'Yes. Your TSP account stays open after separation and continues to grow based on your existing fund allocations. You can change fund allocations and make interfund transfers. You cannot make new contributions unless you return to federal service.',
    },
    {
      question: 'Should you roll TSP into an IRA after military service?',
      answer: 'Not necessarily. TSP\'s expense ratios are among the lowest available anywhere, so keeping money in TSP is a reasonable long-term choice. Rolling to an IRA gives more investment options but often comes with higher fees. If you do roll over, use a direct rollover to avoid triggering taxes and the 10% early withdrawal penalty.',
    },
    {
      question: 'What happens if you withdraw TSP early after military separation?',
      answer: 'Early withdrawal before age 59½ typically triggers ordinary income taxes plus a 10% penalty on the distribution. On a $50,000 balance, that can mean $12,500–$17,500 lost to taxes and penalties depending on your bracket. Leaving the money invested or rolling it over preserves decades of tax-advantaged compound growth.',
    },
  ],
  'les-abbreviations-explained': [
    {
      question: 'What does FITW mean on a military LES?',
      answer: 'FITW stands for Federal Income Tax Withholding — the amount deducted from base pay and taxable special pays each month. BAH and BAS are not subject to FITW because they are excluded from federal taxable income. If FITW seems incorrect, verify your W-4 withholding elections through myPay.',
    },
    {
      question: 'Why does mid-month pay appear as a deduction on the LES?',
      answer: 'Mid-month pay is an advance paid during the month that is reconciled at end of month. On the end-of-month LES, the full monthly entitlement appears in the Entitlements column and the mid-month advance appears as a deduction — balancing the accounting so the net pay reflects only the remaining amount due.',
    },
    {
      question: 'What is AFRH on a military LES?',
      answer: 'AFRH stands for Armed Forces Retirement Home — a $0.50/month deduction from all active-duty members\' pay, regardless of branch or years of service. It funds the retirement homes in Washington, D.C. and Gulfport, Mississippi. It is not an error and cannot be waived.',
    },
  ],
  'brs-vs-high-3-difference': [
    {
      question: 'What is the main difference between BRS and High-3 retirement?',
      answer: 'Under High-3, the pension is 2.5% times years of service times the High-36 average base pay — 50% at 20 years. Under BRS, the multiplier is 2.0% — 40% at 20 years — but BRS adds government TSP matching of up to 5% of base pay. BRS provides portable value even for members who separate before 20 years.',
    },
    {
      question: 'Who is automatically in the Blended Retirement System?',
      answer: 'Anyone who entered military service on or after January 1, 2018 is automatically in BRS. Those serving before that date who did not opt into BRS during the 2018 window are in High-3. The 2018 opt-in window is closed and the choice was irrevocable.',
    },
    {
      question: 'Is BRS or High-3 better for a 20-year military career?',
      answer: 'High-3 generally produces a larger pension for members who complete 20 or more years because its multiplier is higher (2.5% vs 2.0%). BRS TSP matching partially offsets the pension reduction. Whether BRS\'s TSP growth fully offsets the pension gap depends on contribution rate, investment returns, and career length.',
    },
  ],
};

const CALCULATOR_LINKS: Record<string, { label: string; href: string }> = {
  'total-compensation': { label: 'Total Compensation Calculator',    href: '/calculators/total-compensation' },
  bah:                  { label: 'BAH Calculator',                   href: '/calculators/bah' },
  'va-disability':      { label: 'VA Disability Calculator',          href: '/calculators/va-disability' },
  'va-loan':            { label: 'VA Loan Calculator',                href: '/calculators/va-loan' },
  'va-refinance':       { label: 'VA Refinance Calculator',           href: '/calculators/va-refinance' },
  tsp:                  { label: 'TSP Growth Projector',              href: '/calculators/tsp' },
  retirement:           { label: 'Retirement Calculator',             href: '/calculators/retirement' },
  pcs:                  { label: 'PCS Cost Estimator',                href: '/calculators/pcs' },
  cola:                 { label: 'CONUS COLA Calculator',             href: '/calculators/cola' },
  compare:              { label: 'Compare Your PCS Move',             href: '/calculators/compare' },
  deployment:           { label: 'Deployment Pay Calculator',          href: '/calculators/deployment' },
  'pay-charts':         { label: '2026 Military Pay Charts',           href: '/calculators/pay-charts' },
  'guard-reserve':      { label: 'Guard & Reserve Pay Calculator',     href: '/calculators/guard-reserve' },
  'dual-military-bah':      { label: 'Dual Military BAH Calculator',        href: '/calculators/dual-military-bah' },
  'transition-readiness':   { label: 'Transition Readiness Calculator',     href: '/calculators/transition-readiness' },
  'healthcare-comparison':  { label: 'Healthcare Cost Comparison',          href: '/calculators/healthcare-comparison' },
  'separation-timeline':    { label: 'Separation Benefits Timeline',        href: '/calculators/separation-timeline' },
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogImage = `/api/og?type=blog&title=${encodeURIComponent(post.title)}&v=2`;
  return {
    title: { absolute: `${post.title}` },
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `/blog/${slug}`,
      siteName: 'MilPayTools',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: ogImage, width: 2400, height: 1260 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const colorClass = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS['General'];
  const relatedCalcs = post.calculators
    .map((c) => CALCULATOR_LINKS[c])
    .filter((c): c is { label: string; href: string } => Boolean(c));
  const parentGuideTitle = post.guide ? GUIDE_TITLES[post.guide] : null;
  const postFaqs = POST_FAQS[slug];

  return (
    <>
      <JsonLdScript schema={articleSchema({ title: post.title, description: post.description, datePublished: post.date, url: `/blog/${slug}` })} />
      {postFaqs && <JsonLdScript schema={faqPageSchema(postFaqs)} />}
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Parent guide breadcrumb */}
      {parentGuideTitle && post.guide && (
        <div className="mb-5">
          <a
            href={`/guides/${post.guide}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Part of our {parentGuideTitle} →
          </a>
        </div>
      )}

      {/* Post header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {post.category}
          </span>
          <span className="text-xs text-zinc-400">
            {formatDate(post.date)} · {post.readTime} min read · By {post.author}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">{post.description}</p>
      </header>

      {/* Related calculators */}
      {relatedCalcs.length > 0 && (
        <div className="mb-8 rounded-lg bg-zinc-50 border border-zinc-200 p-4 not-prose">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Free Calculators Referenced in This Article
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedCalcs.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="inline-flex items-center text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 transition-colors px-3 py-1.5 rounded-md"
              >
                {c.label} →
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MDX content */}
      <article className="prose prose-zinc prose-sm sm:prose-base max-w-none
        prose-headings:font-bold prose-headings:text-zinc-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-zinc-700 prose-p:leading-relaxed
        prose-strong:text-zinc-900 prose-strong:font-semibold
        prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
        prose-li:text-zinc-700 prose-li:leading-relaxed
        prose-table:text-sm
        prose-th:bg-zinc-50 prose-th:font-semibold prose-th:text-zinc-700
        prose-td:text-zinc-700
        prose-hr:border-zinc-200
        prose-blockquote:border-red-300 prose-blockquote:text-zinc-600">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {/* Author bio */}
      <AuthorBio date={post.date} />

      {/* Feedback */}
      <div className="mt-6 pt-6 border-t border-zinc-100">
      </div>

      {/* Disclaimer */}
      <div className="mt-8">
        <Disclaimer dataYear="2026" />
      </div>
    </div>
    </>
  );
}
