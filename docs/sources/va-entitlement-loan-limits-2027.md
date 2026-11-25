# VA remaining entitlement and county loan limits (2026 and 2027)

Verified by Claude Chat on 2026-11-25.

## FHFA conforming loan limits
**2027.** Source: FHFA news release "FHFA Announces Conforming Loan Limit for 2027", 11/24/2026: https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-for-2027
- "In most of the United States, the 2027 CLL for one-unit properties will be $855,400", "an increase of $22,650 from 2026."
- "The new ceiling loan limit for one-unit properties will be $1,283,100."
- House prices "increased 2.72 percent, on average, between the third quarters of 2025 and 2026."
- "The CLL will be higher in all but 24 U.S. counties or county equivalents."
- Alaska, Hawaii, Guam and the U.S. Virgin Islands (one unit): baseline $1,283,100, ceiling $1,924,650.
- County file (all counties):
  - CSV: https://www.fhfa.gov/document/d/cll/fullcountyloanlimitlist2027_hera-based_final_flat.csv
  - XLSX: https://www.fhfa.gov/document/d/cll/fullcountyloanlimitlist2027_hera-based_final_flat.xlsx
- FAQ: https://www.fhfa.gov/document/d/cll/fhfa-cll-faqs-2027.pdf

**2026.** Source: FHFA, announced 11/25/2025.
- Baseline one-unit $832,750 (up from $806,500 in 2025). Ceiling $1,249,125.
- County file (all counties):
  - CSV: https://www.fhfa.gov/document/d/cll/fullcountyloanlimitlist2026_hera-based_final_flat.csv
  - XLSX: https://www.fhfa.gov/document/d/cll/fullcountyloanlimitlist2026_hera-based_final_flat.xlsx
- Both files are listed on https://www.fhfa.gov/data/conforming-loan-limit-cll-values (2026 under "Previously Announced Loan Limits").

**Which limit applies:** the limits apply to loans in that calendar year. The 2026 limits apply through Dec 31, 2026 and the 2027 limits from Jan 1, 2027. Use the **One-Unit** column. Per VA, use it "even if your property has more than one unit."

## VA rules
**VA.gov "VA home loan limits"** (https://www.va.gov/housing-assistance/home-loans/loan-limits/, "Last updated: August 12, 2025").
- VA home loan limits are the same as FHFA's conforming loan limits. Use the One-Unit Limit.
- Full entitlement: "You don't have a loan limit." The lender still has to approve the loan (credit, income, debts, assets) and the appraisal has to support the price.
- Basic entitlement covers a loan of "$144,000 or less." For loans above $144,000, VA guarantees up to 25% of the loan amount, and bonus entitlement covers the rest of that guaranty.
- Remaining bonus entitlement (VA's steps, paraphrased):
  1. Find the entitlement already used on your COE, in the table "Prior Loans charged to entitlement".
  2. Look up the county's One-Unit limit (FHFA).
  3. Multiply it by 0.25.
  4. Subtract the entitlement already used. The result is your remaining bonus entitlement.
- VA's worked example:
  - county limit $900,000 × 0.25 = $225,000;
  - $225,000 − $50,000 used = $175,000 remaining;
  - $175,000 × 4 = $700,000, "the maximum loan most lenders would make without a down payment."
- If the loan is larger: "Your lender may require you to make a down payment if you don't have enough remaining bonus entitlement." Most lenders want entitlement, a down payment, or both to cover at least 25% of the total loan.

**Army Benefits Center, "VA Home Loans"** (https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/VA-Home-Loans?serv=128, document review date 30 January 2026).
- Remaining entitlement is "25% of the county loan limit reduced by the amount of entitlement previously used and not restored."
- Lenders generally "only loan up to four times a Veteran's available entitlement" without a down payment.
- Restoration of previously used entitlement happens when:
  - "the property purchased with the prior VA loan has been sold and the loan paid in full"; or
  - "a qualified Veteran buyer agrees to assume the VA loan and substitute their entitlement"; or
  - once only, if "the Veteran has repaid the prior VA loan in full," even if the property hasn't been sold.

**Archived VA guaranty examples** (benefits.va.gov "guaranty_calculation_examples.pdf", Wayback 2023-03-23).
- VA's guaranty is the lesser of 25% of the loan amount, or 25% of the county loan limit minus entitlement used and not restored.
- Down payment example: loan $480,000 × 25% = $120,000; $120,000 − $104,250 remaining = $15,750 down payment.

## Use on MilPayTools (V2)
- remaining = max(0, 0.25 × county One-Unit limit − entitlement used).
- Maximum loan with $0 down (lender convention) = 4 × remaining.
- If the planned loan is larger: the down payment most lenders look for = max(0, 0.25 × loan − remaining). Label it as a typical lender requirement, not a VA rule.
- Full entitlement: no county limit. Say so and send people to the VA loan calculator.
- Entitlement used: from the COE. Helper for a prior loan over $144,000: 25% of that loan amount (VA's guaranty for loans above $144,000). Label it "estimate; your COE shows the exact amount."
- Funding fee for a second VA loan: the subsequent-use rates in `docs/sources/va-funding-fee-2026.md` (`vaLoanFees.ts`), using the V1 exemption statuses.
