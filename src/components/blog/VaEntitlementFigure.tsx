import { vaEntitlementFigure, type EntitlementFigureInput } from '@/lib/vaEntitlementPost';

// MDX posts can't import data modules, so VA entitlement figures (county limits,
// remaining entitlement, the lender-convention $0-down maximum and down payment) are
// rendered here from the FHFA summary files and src/lib/calculations/vaEntitlement.ts
// via src/lib/vaEntitlementPost.ts (build V2). Server only. Props are strings:
//
//   <VaEntitlementFigure prior="280000" show="remaining" />   → remaining entitlement
//   <VaEntitlementFigure show="limit" />                      → most U.S. counties, LOAN_LIMIT_YEAR

export function VaEntitlementFigure(props: EntitlementFigureInput) {
  return <>{vaEntitlementFigure(props)}</>;
}
