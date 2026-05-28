import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

BASE = r"C:\Users\danie\milpaytools\src"

SECTION_WRAPPER = '''\n      {{/* ── Direct answer */}}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          {content}
        </p>
      </div>\n'''

GUIDE_SECTION_WRAPPER = '''\n      {{/* ── Direct answer */}}
      <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            {content}
          </p>
        </div>
      </section>\n'''

CALC_PARAS = {
    "total-compensation": "Total military compensation includes base pay, BAH, BAS, TSP matching, and the tax advantage of allowances excluded from federal taxable income — together these often exceed what most service members realize. An E-5 with 6 years stationed in a mid-cost market typically receives $75,000–$90,000 in total compensation value per year, though the number varies significantly by duty station. This calculator breaks down every component and shows the civilian pretax salary equivalent needed to match your full package.",
    "bah": "BAH (Basic Allowance for Housing) is a monthly payment based on duty station location, pay grade, and dependency status — excluded from federal taxable income. Rates vary significantly by location: an E-5 with dependents receives $1,218/month in some markets and $3,975/month in San Diego. This calculator looks up your exact 2026 BAH rate using official DTMO data for all 40,959 ZIP codes.",
    "va-disability": "The VA combined rating is not calculated by adding percentages together — it uses a whole-person formula (38 CFR § 4.25) where each additional rating is applied to the remaining healthy capacity, not the original 100%. That is why 50% + 30% equals 65% combined (which rounds to 70%), not 80%. This calculator applies the official VA math step by step, including the bilateral factor, and shows your 2026 monthly compensation — excluded from federal taxable income.",
    "tsp": "The Thrift Savings Plan is the military&apos;s 401(k) equivalent, with expense ratios typically under 0.06% — among the lowest of any retirement plan available. Under BRS, the government contributes 1% automatically and matches up to 4% more for members who contribute at least 5% of base pay. This calculator projects your TSP balance at retirement based on contribution rate, fund allocation, and the BRS government match.",
    "pcs": "A PCS move triggers several financial entitlements — Dislocation Allowance (DLA), MALT mileage at $0.205/mile, per diem for travel days, and Temporary Lodging Expense (TLE) for transition. Service members who arrange a Personally Procured Move (PPM) can keep the difference between the government&apos;s weight estimate and their actual shipping cost, which often generates $1,000–$5,000 in net proceeds on longer moves. This calculator estimates all major PCS entitlements using 2026 DTMO rates for your rank and family situation.",
    "guard-reserve": "Guard and Reserve compensation extends beyond drill pay to include Annual Training pay, TRICARE Reserve Select ($57.88/month member-only or $286.66/month for family in 2026), and BRS TSP matching for enrolled members. An E-6 Guard member attending 48 UTA periods per year earns approximately $16,000–$18,000 in drill pay alone, before counting Annual Training, special pays, or healthcare savings. This calculator combines all components into a single annual compensation view using official 2026 DFAS rates.",
    "education": "Military education benefits work very differently from each other: the Post-9/11 GI Bill covers tuition plus a monthly housing allowance equal to E-5 with-dependents BAH at the school&apos;s ZIP code (ranging from $1,200 to over $3,600/month depending on location); VR&amp;E (Chapter 31) covers tuition with no cap without consuming GI Bill months; and Tuition Assistance covers up to $4,500/year while on active duty. This calculator compares total program value side by side for your specific school, eligibility level, and situation.",
    "retirement": "Military retirement pay is an immediate pension beginning at separation, not at age 65. Under High-3, the pension is 2.5% × years of service × average of the highest 36 months of base pay — 50% of High-3 at exactly 20 years; under BRS, the multiplier is 2.0%, partially offset by government TSP matching of up to 5% of base pay over a career. This calculator projects your pension under both systems and models the lifetime value at different career lengths.",
    "deployment": "Deployment to a qualifying combat zone activates several pay changes: Hostile Fire Pay or Imminent Danger Pay ($225/month), Family Separation Allowance ($300/month for qualifying members with dependents for 30+ days), and the Combat Zone Tax Exclusion, which eliminates federal income tax on all enlisted base pay in eligible months. The Savings Deposit Program additionally pays 10% guaranteed annual interest on up to $10,000 deposited during a combat zone deployment. This calculator shows your full pay picture before, during, and after deployment — including estimated CZTE tax savings and Roth TSP opportunities.",
    "dual-military-bah": "When two active-duty members are co-located with children, only one can receive the with-dependents BAH rate — and the financially optimal choice isn&apos;t always the higher-ranking member. The correct choice depends on which member has the larger gap between their with-dependents and without-dependents BAH rates, which varies by rank and duty station in ways that require checking the actual 2026 DTMO rate tables. This calculator models both scenarios side by side to identify which dependent designation produces the highest combined BAH.",
    "compare": "Comparing two duty stations financially requires looking beyond base pay — BAH differences of $1,000–$2,000/month between assignments are common, state income tax treatment varies significantly, and CONUS COLA may apply at some stations. An E-5 with dependents stationed in San Diego receives approximately $26,000 more per year in BAH than the same rank at Fort Bragg, before factoring in state taxes and cost of living. This calculator produces a side-by-side comparison of total compensation at two stations using official 2026 DTMO and DFAS data.",
    "separation-timeline": "Military separation triggers a series of time-sensitive benefits and deadlines that run on separate clocks: SGLI free coverage extends 120 days and VGLI conversion must happen within 240 days; TAMP transitional healthcare (where eligible) runs 180 days; and the VA Benefits Delivery at Discharge window opens 90–180 days before separation. Missing any of these windows can result in gaps in coverage or permanently forfeited benefits. This calculator generates a personalized timeline of key dates based on your separation date and type.",
    "transition-readiness": "Transition readiness requires replacing not just base pay, but the combined value of BAH, BAS, TRICARE, and tax advantages that disappear at separation. For an E-6 with a family, replacing TRICARE alone typically requires $15,000–$25,000/year in healthcare costs — often the most underestimated line item in any transition plan. This calculator compares military and civilian total compensation after taxes and benefits, identifying the minimum civilian offer needed to maintain financial parity.",
    "pay-charts": "Military base pay is set by the DoD pay scale based on pay grade (E-1 through O-10) and years of service, with the 2026 rate table effective January 1, 2026 reflecting a 3.8% increase. An E-5 with 6 years of service earns $4,110/month in base pay; an O-3 with 6 years earns $7,737/month. Base pay is the taxable portion of military compensation — BAH, BAS, and most allowances are excluded from federal taxable income and are listed separately.",
    "healthcare-comparison": "TRICARE Prime for active-duty members costs $0 — no premiums, no enrollment fees, and no deductibles for care at military treatment facilities. After separation, healthcare transitions to TRICARE retirement plans, employer coverage, or ACA marketplace options that typically cost $600–$2,000/month for family coverage. This calculator compares TRICARE, employer plans, and ACA marketplace costs side by side so separating service members and their families can plan for the transition.",
    "va-loan": "A VA loan allows eligible service members and veterans to purchase a home with no down payment and no monthly mortgage insurance. The main VA-specific cost is the funding fee — 2.15% of the loan amount at first use with no down payment, or 3.30% at subsequent use — though veterans receiving VA disability compensation are commonly exempt. This calculator estimates your monthly PITI, shows your funding fee or exemption savings, and optionally compares the estimated payment to your BAH.",
    "va-refinance": "An IRRRL (VA Streamline Refinance) allows existing VA loan holders to lower their interest rate with minimal paperwork — typically no appraisal and no full income verification required — and carries a 0.50% funding fee, the lowest of any VA loan type. A VA cash-out refinance carries a higher funding fee (2.15% or 3.30%) and requires a full appraisal and underwriting. This calculator estimates monthly savings, break-even timeline, and whether the VA&apos;s net tangible benefit requirement is met for your specific scenario.",
}

GUIDE_PARAS = {
    "military-pay": "Military compensation includes base pay, BAH, BAS, and allowances — most of which are excluded from federal taxable income, making them worth more than equivalent civilian wages. An E-5 with 6 years stationed at a mid-range duty station typically receives $75,000–$90,000 in total annual compensation value, though the number varies significantly by duty station and dependency status. Understanding the full picture is essential for comparing military pay to civilian job offers or making informed financial decisions.",
    "pcs": "A PCS move affects finances in two distinct ways: it triggers one-time entitlements (DLA, MALT mileage, per diem, TLE) and it permanently resets BAH to the new duty station&apos;s rate. Moving to a higher-cost station can increase BAH by $500–$1,500/month; moving to a lower-cost station does the opposite. Planning the financial impact — both the move costs and the ongoing pay change — before orders are finalized is one of the highest-return financial actions available to military families.",
    "retirement-tsp": "Military retirement provides an immediate pension beginning at separation — not at age 65 — plus access to TSP as a portable savings account. Under High-3 (for those who entered before 2018), the pension is 50% of average highest base pay at exactly 20 years; under BRS (for those who entered after 2018), it is 40%, partially offset by government TSP matching of up to 5% of base pay. Together, a 20-year retirement pension plus TSP savings represents one of the most valuable retirement packages available in any profession.",
    "education-benefits": "Military education benefits include four main programs that work differently and can be combined strategically: Post-9/11 GI Bill (tuition plus a monthly housing allowance based on BAH for an E-5 with dependents at the school&apos;s ZIP code), VR&amp;E Chapter 31 (tuition with no cap for veterans with service-connected disabilities, without consuming GI Bill months), Tuition Assistance (up to $4,500/year for active-duty members), and the Montgomery GI Bill. The housing allowance alone can range from $1,200 to over $3,600/month depending on school location, making school selection one of the most significant financial variables in GI Bill planning.",
    "starting-service": "Your first military paycheck is smaller than expected because federal income tax is withheld on base pay, SGLI life insurance is deducted, and junior enlisted in the barracks typically do not receive BAH. As you progress in rank and move off-post, BAH and BAS become major components of your compensation — excluded from federal taxable income and worth significantly more than equivalent civilian wages. The most important financial action in the first pay period is setting your TSP contribution to at least 5% to capture the full government match under BRS.",
}

TRANSITION_PARA = "Military-to-civilian financial transition requires replacing the full value of military compensation — not just base pay — in a civilian job offer. For an E-6 with a family, BAH, BAS, TRICARE, and tax advantages typically represent $30,000–$50,000 per year in value that disappears at separation, with healthcare replacement alone running $600–$2,000/month in premiums for comparable civilian family coverage. Use the tools on this page to understand the gap before accepting any offer."

results = []

def insert_before_class(fpath, search_class, para, wrapper, label):
    """Insert paragraph before first element containing search_class."""
    with open(fpath, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    # Find the line containing the search class
    pattern = re.compile(re.escape(search_class))
    m = pattern.search(content)
    if not m:
        print(f"NOT FOUND: {label} (class: {search_class[:40]})")
        return False

    # Find start of the JSX line containing this class
    start = content.rfind('\n', 0, m.start()) + 1
    new_block = wrapper.format(content=para)
    new_content = content[:start] + new_block + content[start:]
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    first = para.split('.')[0] + '.'
    results.append(f'[{label}] — "{first}"')
    print(f"DONE: {label}")
    return True

def insert_before_text(fpath, search_text, para, wrapper, label):
    """Insert paragraph before first occurrence of search_text."""
    with open(fpath, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    if search_text not in content:
        print(f"NOT FOUND: {label} (text: {search_text[:40]})")
        return False

    pos = content.index(search_text)
    # Find start of the line
    line_start = content.rfind('\n', 0, pos) + 1
    new_block = wrapper.format(content=para)
    new_content = content[:line_start] + new_block + content[line_start:]
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    first = para.split('.')[0] + '.'
    results.append(f'[{label}] — "{first}"')
    print(f"DONE: {label}")
    return True

# CALCULATOR PAGES — insert before "calc-example" section or ExampleBox
# Most pages have <section className="calc-example or <ExampleBox> directly
calc_search = {
    "total-compensation": 'className="calc-example',
    "bah": 'className="calc-example',
    "va-disability": 'className="calc-example',
    "tsp": 'className="calc-example',
    "pcs": 'className="calc-example',
    "guard-reserve": 'className="calc-example',
    "education": 'className="calc-example',   # different structure, has calc-example
    "retirement": 'className="calc-example',
    "deployment": 'className="calc-example',
    "dual-military-bah": 'className="calc-example',
    "compare": 'className="calc-example',      # compare page wraps slightly different
    "separation-timeline": 'className="calc-example',
    "transition-readiness": 'className="tr-example calc-example',
    "pay-charts": 'className="py-3 sm:py-4 border-t border-zinc-100"',  # Key facts section marker
    "healthcare-comparison": 'className="calc-example',
    "va-loan": 'className="calc-example',
    "va-refinance": 'className="calc-example',
}

for slug, search_class in calc_search.items():
    fpath = os.path.join(BASE, "app", "calculators", slug, "page.tsx")
    para = CALC_PARAS[slug]
    insert_before_class(fpath, search_class, para, SECTION_WRAPPER, f"/calculators/{slug}")

# GUIDE PAGES — insert before Zone 2
guide_search = {
    "military-pay": "ZONE 2: Three pay layers",
    "pcs": "ZONE 2: Three financial impacts",
    "retirement-tsp": "ZONE 2: Three insight cards",
    "education-benefits": "ZONE 2: Three insight cards",
    "starting-service": "Zone 2 + 3",
}

for slug, search_text in guide_search.items():
    if slug in ("military-pay", "pcs", "retirement-tsp", "education-benefits", "starting-service"):
        fpath = os.path.join(BASE, "app", "guides", slug, "page.tsx")
        para = GUIDE_PARAS[slug]
        insert_before_text(fpath, search_text, para, GUIDE_SECTION_WRAPPER, f"/guides/{slug}")

# TRANSITION PAGE
trans_path = os.path.join(BASE, "app", "transition", "page.tsx")
if "/transition" not in [r.split(']')[0][1:] for r in results]:
    insert_before_text(trans_path, "Three things that change after separation", TRANSITION_PARA, GUIDE_SECTION_WRAPPER, "/transition")

print(f"\n=== {len(results)} processed ===")
for r in results:
    print(r)
