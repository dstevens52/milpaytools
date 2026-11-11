/**
 * State income tax treatment of military retired pay.
 *
 * DATA RULE: every record is populated from the state's official revenue
 * source (revenue department page, form instructions, or published guidance).
 * No values from memory. A state without a verified source stays in
 * STATE_MILITARY_RETIREMENT_TAX_PENDING and out of every dropdown until it is
 * verified. Re-verify every record each January (docs/ANNUAL_DATA_UPDATE.md).
 *
 * Modeling notes:
 * - `exemptionCap` is the annual amount of military retired pay excluded for a
 *   working-age retiree (the case a transition calculator models). Where the
 *   cap depends on age or income, the working-age figure is used and the
 *   condition is stated in `conditionNote`.
 * - `exemptionPercent` covers the one percentage-based rule (Montana).
 * - Conditions the calculator can evaluate are modeled, not just noted:
 *   `earnedIncomeBonus` (GA), `agiLimit` (CA — a cliff), `exemptionCapMfj` (ID).
 *   Anything else (age, residency dates, etc.) lives only in `conditionNote`.
 * - `varies` marks a rule the calculator does not model (e.g. an income phase-out).
 *   It shows both outcomes — taxed and exempt — like "I'm not sure yet", plus the
 *   `conditionNote`.
 * - `taxYear` is the tax year the cited source covers. Pages that describe an
 *   ongoing rule without a year carry the year they were verified.
 *
 * Shaped so the planned 50-State Military Tax Guide page can import it.
 */

export type MilitaryRetirementTaxTreatment =
  | 'no_income_tax'
  | 'fully_exempt'
  | 'partial'
  | 'taxable'
  | 'varies';

export interface StateMilitaryRetirementTax {
  state: string; // USPS code
  name: string;
  treatment: MilitaryRetirementTaxTreatment;
  exemptionCap?: number; // annual $ excluded, for partial
  exemptionPercent?: number; // share excluded, for partial (0–1)
  exemptionCapMfj?: number; // cap when filing jointly, if it differs from exemptionCap
  earnedIncomeBonus?: { over: number; extraCap: number }; // cap rises by extraCap when the member's earned income > over
  agiLimit?: { single: number; mfj: number }; // exclusion applies only at federal AGI ≤ limit (single = any non-joint status); above it, fully taxable
  conditionNote?: string; // plain-language age/income condition
  taxYear: number;
  sourceUrl: string; // official state revenue source only
  lastVerified: string; // YYYY-MM-DD
}

const V = '2026-11-10';

export const STATE_MILITARY_RETIREMENT_TAX: readonly StateMilitaryRetirementTax[] = [
  { state: 'AL', name: 'Alabama', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://www.revenue.alabama.gov/wp-content/uploads/2026/01/25f40bk.pdf', lastVerified: V },
  { state: 'AK', name: 'Alaska', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://www.tax.alaska.gov/programs/programs/reports/AnnualReport.aspx?Year=2023', lastVerified: V },
  { state: 'AZ', name: 'Arizona', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140i.pdf', lastVerified: V },
  { state: 'AR', name: 'Arkansas', treatment: 'fully_exempt', taxYear: 2024, sourceUrl: 'https://dfa.arkansas.gov/wp-content/uploads/2024_AR1000F_and_AR1000NR_Instructions.pdf', lastVerified: V },
  {
    state: 'CA', name: 'California', treatment: 'partial', exemptionCap: 20_000,
    agiLimit: { single: 125_000, mfj: 250_000 },
    conditionNote: 'Only if your federal adjusted gross income is $125,000 or less ($250,000 married filing jointly); above that, none of it is excluded. Available for tax years 2025 through 2029.',
    taxYear: 2025, sourceUrl: 'https://www.ftb.ca.gov/forms/2025/2025-1032-publication.pdf', lastVerified: V,
  },
  {
    state: 'CO', name: 'Colorado', treatment: 'partial', exemptionCap: 15_000,
    conditionNote: 'For retirees under 55 at year end. At 55 and older, Colorado’s general pension subtraction ($20,000, or $24,000 at 65+) applies instead.',
    taxYear: 2025, sourceUrl: 'https://tax.colorado.gov/retired-servicemembers', lastVerified: V,
  },
  { state: 'CT', name: 'Connecticut', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://portal.ct.gov/-/media/drs/forms/2025/income/2025-ct-1040-instructions_1225.pdf', lastVerified: V },
  {
    state: 'DE', name: 'Delaware', treatment: 'partial', exemptionCap: 12_500,
    conditionNote: 'Under 60: the lesser of $12,500 or your military pension. At 60 and older, the $12,500 exclusion also covers other retirement income.',
    taxYear: 2025, sourceUrl: 'https://revenuefiles.delaware.gov/2025/PITForms_Instructions/Instructions/PIT-RES_Instructions_2025-01.pdf', lastVerified: V,
  },
  { state: 'FL', name: 'Florida', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://floridarevenue.com/faq/Pages/FAQDetails.aspx?FAQID=1466', lastVerified: V },
  {
    state: 'GA', name: 'Georgia', treatment: 'partial', exemptionCap: 17_500,
    earnedIncomeBonus: { over: 17_500, extraCap: 17_500 },
    conditionNote: 'For retirees under 62: $17,500, or $35,000 if you have more than $17,500 of Georgia earned income (the calculator uses your civilian salary). Each spouse qualifies separately. At 62 and older, Georgia’s general retirement exclusion applies.',
    taxYear: 2026, sourceUrl: 'https://dor.georgia.gov/retirement-income-exclusion', lastVerified: V,
  },
  { state: 'HI', name: 'Hawaii', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://files.hawaii.gov/tax/forms/2025/n11ins.pdf', lastVerified: V },
  {
    state: 'ID', name: 'Idaho', treatment: 'partial', exemptionCap: 48_216, exemptionCapMfj: 72_324,
    conditionNote: 'Under 62, you qualify only if you worked during the year and had to file a federal return. 2025 limits: $48,216 ($72,324 married filing jointly), reduced by Social Security benefits; Idaho resets them each year.',
    taxYear: 2025, sourceUrl: 'https://tax.idaho.gov/wp-content/uploads/forms/EIN00046/EIN00046_03-02-2026.pdf', lastVerified: V,
  },
  { state: 'IL', name: 'Illinois', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://tax.illinois.gov/research/publications/pubs/retirement-income.html', lastVerified: V },
  { state: 'IN', name: 'Indiana', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://forms.in.gov/Download.aspx?id=16915', lastVerified: V },
  { state: 'IA', name: 'Iowa', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://revenue.iowa.gov/taxes/tax-guidance/individual-income-tax/military-tax-information', lastVerified: V },
  { state: 'KS', name: 'Kansas', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.ksrevenue.gov/pdf/ia-36.pdf', lastVerified: V },
  {
    state: 'KY', name: 'Kentucky', treatment: 'partial', exemptionCap: 31_110,
    conditionNote: 'This is Kentucky’s general pension exclusion, shared with any other pension income. Service before 1998 can raise it (Schedule P).',
    taxYear: 2026, sourceUrl: 'https://revenue.ky.gov/Individual/Pages/Military-Tax-Issues.aspx', lastVerified: V,
  },
  { state: 'LA', name: 'Louisiana', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://revenue.louisiana.gov/tax-education-and-faqs/faqs/individual-income-tax/is-there-a-list-of-retirement-system-benefits-that-may-be-excluded-from-louisiana-income-tax/', lastVerified: V },
  { state: 'ME', name: 'Maine', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.maine.gov/revenue/faq/individual-income-tax', lastVerified: V },
  {
    state: 'MD', name: 'Maryland', treatment: 'partial', exemptionCap: 12_500,
    conditionNote: 'For retirees under 55 at year end. The cap rises to $20,000 at 55 and older.',
    taxYear: 2025, sourceUrl: 'https://www.marylandtaxes.gov/faq/seniors-retirees.php', lastVerified: V,
  },
  { state: 'MA', name: 'Massachusetts', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://www.mass.gov/doc/2025-form-1-instructions/download', lastVerified: V },
  { state: 'MI', name: 'Michigan', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.michigan.gov/taxes/questions/iit/accordion/military/are-military-retirement-benefits-exempt-from-michigan-individual-income-tax', lastVerified: V },
  { state: 'MN', name: 'Minnesota', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.revenue.state.mn.us/military-personnel-how-minnesota-taxes-your-income', lastVerified: V },
  { state: 'MS', name: 'Mississippi', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://www.dor.ms.gov/sites/default/files/tax-forms/individual/80100251%202.pdf', lastVerified: V },
  { state: 'MO', name: 'Missouri', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://dor.mo.gov/military/income-deduction-information.html', lastVerified: V },
  {
    state: 'MT', name: 'Montana', treatment: 'partial', exemptionPercent: 0.5,
    conditionNote: 'The exemption is the lesser of 50% of your military retired pay or your Montana wages and business income, for five consecutive years. You must have become a resident after June 30, 2023 (or been one before retired pay started). File Form WMRE.',
    taxYear: 2026, sourceUrl: 'https://revenue.mt.gov/taxes/individual-income-tax/working-military-retirement-exemption', lastVerified: V,
  },
  { state: 'NE', name: 'Nebraska', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://revenue.nebraska.gov/about/frequently-asked-questions/military-retirement-benefits-exclusion', lastVerified: V },
  { state: 'NV', name: 'Nevada', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://tax.nv.gov/about-nevada-department-of-taxation/income-tax-in-nevada/', lastVerified: V },
  { state: 'NH', name: 'New Hampshire', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://www.revenue.nh.gov/news-and-media/repeal-nh-interest-and-dividends-tax-now-effect', lastVerified: V },
  { state: 'NJ', name: 'New Jersey', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://nj.gov/treasury/taxation/military/taxinformation.shtml', lastVerified: V },
  {
    state: 'NM', name: 'New Mexico', treatment: 'partial', exemptionCap: 30_000,
    conditionNote: 'Set at $30,000 for tax years 2024 through 2026. Check whether it continues after 2026.',
    taxYear: 2025, sourceUrl: 'https://realfile.tax.newmexico.gov/2025pit-adj-ins.pdf', lastVerified: V,
  },
  { state: 'NY', name: 'New York', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.tax.ny.gov/pit/file/military_page.htm', lastVerified: V },
  {
    state: 'NC', name: 'North Carolina', treatment: 'fully_exempt',
    conditionNote: 'Requires 20 or more years of service or a Chapter 61 medical retirement.',
    taxYear: 2026, sourceUrl: 'https://www.ncdor.gov/taxes-forms/information-tax-professionals/tax-bulletins-directives-and-other-important-notices/important-notices-and-frequently-asked-questions-personal-taxes/important-notice-north-carolina-enacts-new-deduction-certain-military-retirement-pay-and', lastVerified: V,
  },
  { state: 'ND', name: 'North Dakota', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.tax.nd.gov/sites/www/files/documents/guidelines/individual/military-service-members.pdf', lastVerified: V },
  { state: 'OH', name: 'Ohio', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://tax.ohio.gov/individual/military', lastVerified: V },
  { state: 'OK', name: 'Oklahoma', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://oklahoma.gov/tax/helpcenter/income-tax.html', lastVerified: V },
  {
    state: 'OR', name: 'Oregon', treatment: 'taxable',
    conditionNote: 'Oregon’s federal pension subtraction covers only service before October 1991.',
    taxYear: 2026, sourceUrl: 'https://www.oregon.gov/dor/forms/FormsPubs/publication-or-pit-vet_101-009.pdf', lastVerified: V,
  },
  { state: 'PA', name: 'Pennsylvania', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/gross-compensation', lastVerified: V },
  { state: 'RI', name: 'Rhode Island', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://tax.ri.gov/sites/g/files/xkgbur541/files/2026-02/PUB_2026-01_Retirement_Income_Guide.pdf', lastVerified: V },
  { state: 'SC', name: 'South Carolina', treatment: 'fully_exempt', taxYear: 2025, sourceUrl: 'https://dor.sc.gov/sites/dor/files/forms/SC1040Instr_2025.pdf', lastVerified: V },
  { state: 'SD', name: 'South Dakota', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://dor.sd.gov/individuals/taxes/', lastVerified: V },
  { state: 'TN', name: 'Tennessee', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://www.tn.gov/revenue/taxes/hall-income-tax.html', lastVerified: V },
  { state: 'TX', name: 'Texas', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://comptroller.texas.gov/economy/fiscal-notes/industry/2025/small-biz-info/', lastVerified: V },
  {
    state: 'UT', name: 'Utah', treatment: 'fully_exempt',
    conditionNote: 'Utah uses a nonrefundable credit equal to its flat tax rate times your military retired pay (4.5% for 2025), which generally cancels the Utah tax on it.',
    taxYear: 2025, sourceUrl: 'https://files.tax.utah.gov/tax/forms/current/tc-40inst.pdf', lastVerified: V,
  },
  {
    state: 'VT', name: 'Vermont', treatment: 'varies',
    conditionNote: 'Fully exempt if your adjusted gross income is $125,000 or less. The exempt amount shrinks between $125,000 and $175,000, and there is no exemption at $175,000 or more (any filing status).',
    taxYear: 2025, sourceUrl: 'https://tax.vermont.gov/individuals/income-tax-returns/who-needs-to-file/military-personnel', lastVerified: V,
  },
  {
    state: 'VA', name: 'Virginia', treatment: 'partial', exemptionCap: 40_000,
    taxYear: 2025, sourceUrl: 'https://www.tax.virginia.gov/military-benefits-faq', lastVerified: V,
  },
  {
    state: 'WA', name: 'Washington', treatment: 'no_income_tax',
    conditionNote: 'A 9.9% tax on income over $1 million starts in 2028.',
    taxYear: 2026, sourceUrl: 'https://dor.wa.gov/taxes-rates/income-tax', lastVerified: V,
  },
  { state: 'WV', name: 'West Virginia', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://tax.wv.gov/Documents/TSD/tsd443.pdf', lastVerified: V },
  { state: 'WI', name: 'Wisconsin', treatment: 'fully_exempt', taxYear: 2026, sourceUrl: 'https://www.revenue.wi.gov/Pages/FAQS/pcs-retired.aspx', lastVerified: V },
  // Official state page (not the revenue department) — accepted for "no personal income tax".
  { state: 'WY', name: 'Wyoming', treatment: 'no_income_tax', taxYear: 2026, sourceUrl: 'https://www.wyo.gov/about-wyoming', lastVerified: V },
];

/** Not yet verified against an official revenue source — excluded from dropdowns. */
export const STATE_MILITARY_RETIREMENT_TAX_PENDING: readonly { state: string; name: string; reason: string }[] = [
  { state: 'DC', name: 'District of Columbia', reason: 'OTR repealed the $3,000 exclusion for 62+ (2015 filing season); excluded until the 2026 D-40 instructions confirm current treatment.' },
];

export function getStateMilitaryRetirementTax(state: string | null | undefined): StateMilitaryRetirementTax | null {
  if (!state) return null;
  return STATE_MILITARY_RETIREMENT_TAX.find((s) => s.state === state) ?? null;
}

/**
 * Portion of federally taxable retired pay that the state taxes, per its treatment.
 * `varies` returns the full amount (the conservative case); callers that show both
 * outcomes handle `varies` before calling this.
 */
export interface StateTaxContext {
  filingStatus: 'single' | 'mfj' | 'hoh';
  federalAgiAnnual: number; // wages + taxable retired pay, as the calculator computes it
  memberEarnedIncomeAnnual: number; // the retiree's own wages (not the spouse's)
}

/** Annual dollar cap for a cap-based partial rule, after the conditions we can evaluate. */
export function effectiveExemptionCap(rule: StateMilitaryRetirementTax, ctx: StateTaxContext): number {
  if (rule.agiLimit) {
    const limit = ctx.filingStatus === 'mfj' ? rule.agiLimit.mfj : rule.agiLimit.single;
    if (ctx.federalAgiAnnual > limit) return 0; // cliff, not a phase-out
  }
  let cap = ctx.filingStatus === 'mfj' && rule.exemptionCapMfj !== undefined ? rule.exemptionCapMfj : rule.exemptionCap ?? 0;
  if (rule.earnedIncomeBonus && ctx.memberEarnedIncomeAnnual > rule.earnedIncomeBonus.over) {
    cap += rule.earnedIncomeBonus.extraCap;
  }
  return cap;
}

export function stateTaxableRetiredPay(
  rule: StateMilitaryRetirementTax,
  taxableRetiredPayAnnual: number,
  ctx: StateTaxContext,
): number {
  const pay = Math.max(0, taxableRetiredPayAnnual);
  switch (rule.treatment) {
    case 'no_income_tax':
    case 'fully_exempt':
      return 0;
    case 'partial': {
      const excluded = rule.exemptionPercent !== undefined
        ? pay * rule.exemptionPercent
        : Math.min(pay, effectiveExemptionCap(rule, ctx));
      return Math.max(0, pay - excluded);
    }
    case 'taxable':
    case 'varies':
      return pay;
  }
}
