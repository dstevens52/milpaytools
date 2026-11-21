# VA funding fee: rates and exemptions

Verified by Claude Chat on 2026-11-20/21 on VA.gov (read in a browser).
Source: https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/ (page "Last updated: October 5, 2026"; rates "Effective April 7, 2023").

## Rates (match `src/lib/calculations/vaLoanFees.ts`)
Purchase and construction loans (Veterans, active-duty service members, National Guard and Reserve members):
| Down payment | First use | After first use |
|---|---|---|
| Less than 5% | 2.15% | 3.3% |
| 5% or more | 1.5% | 1.5% |
| 10% or more | 1.25% | 1.25% |
Note (VA): if you used a VA-backed or VA direct home loan to purchase only a manufactured home in the past, you'll still pay the first-time funding fee.

Cash-out refinance: first use 2.15%, after first use 3.3% (doesn't change with down payment).
IRRRL 0.5%. Loan assumptions 0.5%. Manufactured home (not permanently affixed) 1%. Vendee 2.25%.

## Exemptions (VA's wording)
"You won't have to pay a VA funding fee if any of these descriptions are true for you:
- You're receiving VA compensation for a service-connected disability, or
- You're eligible to receive VA compensation for a service-connected disability, but you're receiving retirement or active-duty pay instead, or
- You're receiving Dependency and Indemnity Compensation (D.I.C.) as the surviving spouse of a Veteran, or
- You're a service member who has received a proposed or memorandum rating before the loan closing date that says you're eligible to get compensation because of a pre-discharge claim, or
- You're an active-duty member of the Armed Forces, and on or before your loan closing date you provide evidence that you received a Purple Heart"

## Refunds (VA's wording)
- "You may be eligible for a refund of the VA funding fee if you're later awarded VA compensation for a service-connected disability. The effective date of your VA compensation must be retroactive to before the date of your loan closing."
- "If you get a proposed or memorandum rating after your loan closing date, you'll still need to pay the funding fee. You won't be eligible for a refund based on this rating."

## Use on MilPayTools
- The exemption follows compensation status, not a rating number. A 0% rating pays no compensation, so it doesn't exempt anyone by itself; 10%+ with compensation does.
- "Claim pending" = fee charged at closing, refund possible per the rule above.
