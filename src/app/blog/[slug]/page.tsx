import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPost, getAllSlugs, formatDate } from '@/lib/blog';
import { CalculatorCallout } from '@/components/blog/CalculatorCallout';
import { KeyFact } from '@/components/blog/KeyFact';
import { QuickAnswer, QAItem } from '@/components/blog/QuickAnswer';
import { DeploymentTourTable, DeploymentTourFigure, DeploymentYearTable, DeploymentYearFigure } from '@/components/blog/DeploymentTourExample';
import { GiBillMhaTable, GiBillMhaFigure, GiBillTotalFigure } from '@/components/blog/GiBillMha';
import { PayFigure, PayYear, SgliBenchmarkFigure, CzteBasePayFigure } from '@/components/blog/PayFigure';
import { PcsDlaTable, PcsFigure } from '@/components/blog/PcsPost';
import { sgliEnoughFaqAnswer } from '@/lib/payPost';
import { RetirementFigure, High3Breakdown, CrdpCrscFigure, FinalYearCompTotal } from '@/components/blog/RetirementFigure';
import { TricareFigure, TricareChangeRange, TricareDate, TricareCostYear } from '@/components/blog/TricareFigure';
import { TricareCostTable, TricareRetireeFeeTable } from '@/components/blog/TricareCostTable';
import { TampEligibilityList } from '@/components/blog/TampEligibilityList';
import { VaFundingFee } from '@/components/blog/VaFundingFee';
import { VaEntitlementFigure } from '@/components/blog/VaEntitlementFigure';
import { vaFundingFeeFigure } from '@/lib/vaFundingFeePost';
import { TrackedLink } from '@/components/TrackedLink';
import { TricareOpenSeason, TricarePostFaq } from '@/components/blog/TricarePost';
import { PostFaq } from '@/components/blog/PostFaq';
import { tricarePostFaqs } from '@/lib/tricarePost';
import { OPEN_SEASON_2026_STATUS } from '@/data/tricare/2027/openSeason';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { ogImage, ogSubFromDescription } from '@/lib/og';

// MDX components available in all posts
const mdxComponents = {
  CalculatorCallout,
  KeyFact,
  QuickAnswer,
  QAItem,
  Disclaimer,
  DeploymentTourTable,
  DeploymentTourFigure,
  DeploymentYearTable,
  DeploymentYearFigure,
  GiBillMhaTable,
  GiBillMhaFigure,
  GiBillTotalFigure,
  PayFigure,
  PayYear,
  SgliBenchmarkFigure,
  CzteBasePayFigure,
  PcsDlaTable,
  PcsFigure,
  RetirementFigure,
  High3Breakdown,
  CrdpCrscFigure,
  FinalYearCompTotal,
  TricareFigure,
  TricareChangeRange,
  TricareDate,
  TricareCostYear,
  TricareCostTable,
  TricareRetireeFeeTable,
  TricareOpenSeason,
  TricarePostFaq,
  TampEligibilityList,
  VaFundingFee,
  VaEntitlementFigure,
  TrackedLink,
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
  // Built from the TRICARE year files; the same answers render visibly in the post (<TricarePostFaq />).
  'tricare-costs-2026-vs-civilian': tricarePostFaqs(OPEN_SEASON_2026_STATUS),
  'how-much-does-an-o3-really-make-2026': [
    {
      question: 'How much does an O-3 make in 2026?',
      answer: 'O-3 base pay in 2026 is $7,737.00/month ($92,844/year) at 6 years of service, per the verified DFAS pay table. Adding BAH (roughly $2,175/month at Fort Bragg to $4,518/month in San Diego for an O-3 with dependents) and officer BAS of $328.48/month, total compensation ranges from about $123,000 to $151,000/year depending on duty station — before healthcare, retirement matching, and the tax advantage of the allowances.',
    },
    {
      question: 'What is the 2026 officer BAS rate, and is it different from enlisted BAS?',
      answer: 'The 2026 Basic Allowance for Subsistence rate for officers is $328.48/month, flat regardless of grade or location. It is lower than the enlisted BAS rate of $476.95/month — the two are set separately by statute. BAS is excluded from federal taxable income.',
    },
    {
      question: 'Does an O-3 make more than an E-7?',
      answer: 'In base pay, yes. At 6 years of service an O-3 earns $7,737.00/month versus $4,843.80/month for an E-7 — a difference of $2,893.20/month. The grades sit at different career stages, so the cleanest comparison is on total compensation at similar career points rather than base pay alone.',
    },
    {
      question: 'What is O-3E prior-enlisted officer pay?',
      answer: 'O-3E is the pay scale for O-3s with more than four years of prior active enlisted service. At 6 years of service it matches the standard O-3 rate, but the prior-enlisted advantage appears later: standard O-3 base pay caps at $9,004.20/month at over 14 years, while O-3E continues to $9,609.60/month at over 18 years.',
    },
    {
      question: 'How is O-3 total compensation different from base pay?',
      answer: 'Base pay is only one of three cash components. BAH (location-based housing allowance) and BAS (subsistence allowance) are added on top and are excluded from federal income tax, FICA, and most state income taxes. Because a civilian would pay tax on equivalent income, an O-3 with dependents is typically competitive with civilian roles paying $130,000–$170,000/year depending on duty station.',
    },
  ],
  'va-disability-math-explained': [
    {
      question: "Why doesn't the VA add disability percentages together?",
      answer: "The VA reads combined ratings off the § 4.25 Combined Ratings Table, combining conditions one at a time, highest first, and applying each to the capacity that remains rather than the original 100%. So 50% + 30% combines to 65, which rounds to 70% — not 80%.",
    },
    {
      question: 'What is the bilateral factor in VA disability ratings?',
      answer: 'The bilateral factor (38 CFR § 4.26) adds a 10% bonus to the combined value of disabilities affecting both sides of a paired body part — both knees, both arms, both legs, etc. — before mixing those into the main calculation. Even a 10% rating on the second side triggers this factor.',
    },
    {
      question: 'How does VA disability rounding work?',
      answer: 'The final combined value rounds to the nearest 10%: values ending in 1–4 round down, values ending in 5–9 round up. The VA works down the § 4.25 table one condition at a time and applies this final rounding only at the end — not between steps.',
    },
    {
      question: 'Why does the gap between 90% and 100% VA disability matter so much?',
      answer: 'In 2026, the jump from 90% ($2,362.30/month) to 100% ($3,938.58/month) is $1,576.28/month — the largest single step in the pay table. That is $18,915/year in compensation excluded from federal taxable income, making the difference between a 94.9% and 95% exact combined value worth thousands annually.',
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
  // V2 (2026-11-25): entitlement answers in the source's wording
  // (docs/sources/va-entitlement-loan-limits-2027.md); fee figures from vaLoanFees.ts.
  'can-i-use-va-loan-again': [
    {
      question: 'Can I use my VA loan benefit more than once?',
      answer: 'Yes. The VA loan benefit has no use limit and does not expire. Entitlement is restored when the home bought with the prior VA loan is sold and the loan paid in full. With full entitlement, VA sets no loan limit; your lender still approves the loan amount.',
    },
    {
      question: 'How do I restore my VA loan entitlement after selling?',
      answer: 'VA restores previously used entitlement when the home bought with the prior VA loan has been sold and the loan paid in full, or when a qualified Veteran buyer assumes the loan and substitutes their entitlement. There is also a one-time restoration if you have repaid the prior VA loan in full, even if you kept the home. Your Certificate of Eligibility (COE) shows your entitlement.',
    },
    {
      question: 'Can I have two VA loans at the same time?',
      answer: "Yes, with remaining entitlement. VA's rule: remaining entitlement is 25% of the county's One-Unit loan limit minus the entitlement already used. Most lenders lend up to 4 times your remaining entitlement with no down payment; for a larger loan, most lenders want your entitlement and a down payment together to cover at least 25% of the loan. This is common when PCSing before selling.",
    },
    {
      question: 'How much is the VA funding fee on a second VA loan?',
      answer: `With less than 5% down, the subsequent-use fee is ${vaFundingFeeFigure({ use: 'subsequent', down: '0', show: 'rate' })} (${vaFundingFeeFigure({ use: 'first', down: '0', show: 'rate' })} on first use): ${vaFundingFeeFigure({ price: '350000', use: 'subsequent', down: '0' })} on a $350,000 loan. Financed over 30 years at 6.5%, it adds about ${vaFundingFeeFigure({ price: '350000', use: 'subsequent', down: '0', show: 'monthly', interest: '6.5', years: '30' })} a month. At 5% down or more, the rate is the same as first use. Veterans receiving VA disability compensation don't pay the fee on any use.`,
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
  'tsp-fund-options-explained': [
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
      // S8: computed from the pay table (src/lib/payPost.ts), the same figures as the post body.
      answer: sgliEnoughFaqAnswer(),
    },
    {
      question: 'What happens to SGLI when you leave the military?',
      answer: 'SGLI terminates 120 days after separation. You can apply for VGLI (Veterans Group Life Insurance) within 1 year and 120 days of separation. Within the first 240 days you won’t need to prove you’re in good health; after 240 days you’ll need to submit evidence of good health. VGLI premiums increase every 5 years with age and become significantly more expensive than private term life insurance purchased while young and healthy.',
    },
  ],
  'hfp-idp-hdpl-rate-changes-october-2026': [
    {
      question: 'What is hostile fire pay in 2026?',
      answer: 'Effective October 1, 2026, Hostile Fire Pay is $450/month, up from $225. It is paid as the full monthly amount, not prorated, for a month in which you qualify.',
    },
    {
      question: 'Did imminent danger pay go up?',
      answer: 'Yes. Effective October 1, 2026, Imminent Danger Pay is up to $275/month, up from $225. It is prorated at $9.16 per day in a designated imminent danger area, up to the $275 monthly maximum.',
    },
    {
      question: 'Why did hardship duty pay go down?',
      answer: 'The memo that raised HFP and IDP also reduced the top Hardship Duty Pay–Location rate from $150 to $100/month. It gives the reason as consistency with the maximum allowed for combined payment of HDP-L with HFP, and of HDP-L with IDP. Members at top-tier locations who draw neither HFP nor IDP now receive $50/month less. For members who draw both: before October 1, the pay regulation (FMR Volume 7A, Chapter 17, paragraph 3.1) limited HDP-L to $100 and the combined total to $325 a month. That chapter has not been updated for the new rates, so how the limit applies now is not yet published — check your LES and your finance office.',
    },
    {
      question: 'Can you get both HFP and IDP?',
      answer: 'No. The memo directs the services and DFAS to make sure members do not receive HFP and IDP for the same period of service. FMR Volume 7A, Chapter 10 applies this month by month: in a month when HFP is paid, it covers that entire month, and IDP is paid only for other periods. Either one can be drawn alongside Hardship Duty Pay–Location.',
    },
    {
      question: 'When did the new rates take effect?',
      answer: 'October 1, 2026. The memo was signed July 14, 2026. Periods of service before October 1 are paid at the prior rates.',
    },
    {
      question: 'Does everyone on HDP-L get less now?',
      answer: 'No. The $50 and $100 HDP-L rates did not change; only the top rate dropped from $150 to $100. Members at top-tier locations without HFP or IDP receive $50/month less. For members who also draw HFP or IDP: before October 1, the pay regulation (FMR Volume 7A, Chapter 17, paragraph 3.1) limited HDP-L to $100 and the combined total to $325 a month. That chapter has not been updated for the new rates, so how the limit applies now is not yet published — check your LES and your finance office.',
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
  'total-compensation': { label: 'Military Pay Calculator',          href: '/calculators/total-compensation' },
  bah:                  { label: 'BAH Calculator',                   href: '/bah' },
  'va-disability':      { label: 'VA Disability Calculator',          href: '/calculators/va-disability' },
  'va-loan':            { label: 'VA Loan Calculator',                href: '/calculators/va-loan' },
  'va-entitlement':     { label: 'VA Entitlement Calculator',         href: '/calculators/va-entitlement' },
  'va-refinance':       { label: 'VA Refinance Calculator',           href: '/calculators/va-refinance' },
  tsp:                  { label: 'TSP Growth Projector',              href: '/calculators/tsp' },
  retirement:           { label: 'Retirement Calculator',             href: '/calculators/retirement' },
  pcs:                  { label: 'PCS Cost Estimator',                href: '/calculators/pcs' },
  cola:                 { label: 'CONUS COLA Calculator',             href: '/calculators/cola' },
  compare:              { label: 'Compare Your PCS Move',             href: '/calculators/compare' },
  deployment:           { label: 'Deployment Pay Calculator',          href: '/calculators/deployment' },
  'pay-charts':         { label: '2026 Military Pay Charts',           href: '/pay' },
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

  const ogImages = ogImage({ type: 'blog', title: post.title, sub: ogSubFromDescription(post.description) });
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
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      authors: [post.author],
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ogImages,
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
  // <PostFaq /> in a post renders that post's POST_FAQS entries: the same list as
  // its FAQPage schema. A post that uses it without entries fails the build.
  const components = {
    ...mdxComponents,
    PostFaq: () => {
      if (!postFaqs?.length) throw new Error(`<PostFaq /> in ${slug} but no POST_FAQS entry`);
      return <PostFaq faqs={postFaqs} />;
    },
  };

  return (
    <>
      <JsonLdScript schema={articleSchema({ title: post.title, description: post.description, datePublished: post.date, dateModified: post.updated, url: `/blog/${slug}` })} />
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
          components={components}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {/* Author bio */}
      {/* "Last reviewed" = the last factual update when set, else the publish date */}
      <AuthorBio date={post.updated ?? post.date} />

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
