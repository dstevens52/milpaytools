# VA refinance rules: rate drop, recoupment, seasoning, cash-out

Verified by Claude Chat on 2026-11-21.

## 38 U.S.C. § 3709
Source: https://uscode.house.gov/us/usc/t38/s3709/ ("Text contains those laws in effect through Public Law 119-142 (November 10, 2026)").

Subsections (a)–(c) apply "Except as provided in subsection (d)…". Subsection (d) exempts a cash-out refinance where the new principal is more than the payoff amount.

**(a) Fee recoupment.** The loan can't be guaranteed unless:
- the lender certifies the recoupment period for "fees, closing costs, and any expenses (other than taxes, amounts held in escrow, and fees paid under this chapter)";
- "all of the fees and incurred costs are scheduled to be recouped on or before the date that is 36 months after the date of loan issuance"; and
- "the recoupment is calculated through lower regular monthly payments (other than taxes, amounts held in escrow, and fees paid under this chapter) as a result of the refinanced loan."

"This chapter" is chapter 37. The VA funding fee is charged under § 3729, which is in chapter 37, so **the funding fee is excluded from the recoupment costs**.

**(b) Net tangible benefit.**
- Fixed rate to fixed rate: the new rate must be "not less than 50 basis points less than the previous loan".
- Fixed rate to adjustable rate: "not less than 200 basis points less".
- The lower rate can't come solely from discount points unless the points are paid at closing and not added to the loan. There are exceptions tied to 100% LTV (one point or less) and 90% LTV (more than one point).

**(c) Loan seasoning.** The loan can't be guaranteed "until the date that is the later of—
(1) the date on which the borrower has made at least six consecutive monthly payments on the loan being refinanced; and
(2) the date that is 210 days after the first payment due date of the loan being refinanced."

## 38 CFR § 36.4306 (refinancing, including cash-out)
Source: https://www.ecfr.gov/current/title-38/chapter-I/part-36/subpart-B/section-36.4306 (eCFR, up to date as of 10/22/2026; "authoritative but unofficial").
- (a)(1): "The amount of the new loan must not exceed an amount equal to 100 percent of the reasonable value" of the home.
- (a)(2): the funding fee "may be included in the new loan amount", subject to that limit.
- (b)(1): the same 36-month recoupment rule, with the same exclusion of "fees paid under 38 U.S.C. chapter 37".
- (b)(2): seasoning is the later of 210 days and "the date on which the sixth monthly payment is made on the loan".
- (c)(2): a similar seasoning requirement applies when the new loan is more than the payoff amount, but only if the loan being refinanced is VA-guaranteed or insured.

## Funding fee (from `docs/sources/va-funding-fee-2026.md`)
- Cash-out refinance: 2.15% first use, 3.3% after first use. It's "a percentage of your total loan amount" and doesn't change with down payment.
- IRRRL: 0.5%.

## Use on MilPayTools
- Show VA's recoupment as net closing costs (after lender credits) ÷ monthly P&I savings, without the funding fee. When the fee is financed, it's already in the new payment.
- Rate test in whole basis points.
- Show the earliest closing date: the later of the date of the sixth consecutive monthly payment (assume each payment is made on its due date: first payment due date + 5 months) and first payment due date + 210 days.
- When cash-out is greater than $0, don't show VA's recoupment or rate tests as requirements (§ 3709(d)). Show the cost math only. Seasoning still applies when the current loan is a VA loan (36.4306(c)(2)).
