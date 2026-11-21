import { vaFundingFeeFigure, type FeeFigureInput } from '@/lib/vaFundingFeePost';

// MDX posts can't import data modules, so VA funding fee rates and dollar amounts
// are rendered here from the calculators' fee table (src/lib/calculations/vaLoanFees.ts)
// via src/lib/vaFundingFeePost.ts (build V3). Server only. Props arrive as strings
// from MDX (next-mdx-remote drops JS-expression props): loan="350000", down="5".
//
//   <VaFundingFee price="350000" use="first" down="0" />            → $7,525
//   <VaFundingFee price="350000" use="subsequent" show="rate" />    → 3.30%
//   <VaFundingFee type="irrrl" loan="300000" />                     → $1,500

export function VaFundingFee(props: FeeFigureInput) {
  return <>{vaFundingFeeFigure(props)}</>;
}
