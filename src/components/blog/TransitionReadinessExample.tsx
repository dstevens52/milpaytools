import {
  getTransitionReadinessExample,
  getExampleSalaryForSurplusTarget,
  TR_EXAMPLE_SURPLUS_TARGET,
} from '@/lib/calculations/transition-readiness-example';
import { FILING_STATUS_LABEL } from '@/lib/calculations/transition-readiness';
import { formatCurrency } from '@/lib/utils';

// MDX posts can't import data modules, so the Transition Readiness worked example is
// rendered here from the same computation the calculator page uses.

export function TransitionReadinessExample() {
  const tr = getTransitionReadinessExample();
  const rows: [string, string, boolean?][] = [
    [`Salary + spouse income ($75K + $24K, after federal ${FILING_STATUS_LABEL[tr.filingStatus].toLowerCase()} + FICA + state tax)`, formatCurrency(tr.afterTaxTaxableIncomeMonthly)],
    ['VA disability (40%, with dependents, tax-free)', formatCurrency(tr.vaCompMonthly)],
    ['Projected total income', formatCurrency(tr.projectedCivilianMonthly), true],
    ['Monthly expenses', formatCurrency(tr.rawMonthlyExpenses)],
    ['Healthcare replacement (family)', formatCurrency(tr.healthcareCostMonthly)],
    ['Total adjusted expenses', formatCurrency(tr.adjustedMonthlyExpenses), true],
    ['Monthly surplus', formatCurrency(tr.monthlyGapOrSurplus), true],
    [`Emergency fund ($15K ÷ ${formatCurrency(tr.adjustedMonthlyExpenses)}/mo)`, `${tr.emergencyFundMonths.toFixed(1)} months`],
  ];
  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Monthly</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value, bold]) => (
          <tr key={label}>
            <td>{bold ? <strong>{label}</strong> : label}</td>
            <td>{bold ? <strong>{value}</strong> : value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ExampleFigure = 'surplus' | 'runway' | 'efGap' | 'efTarget' | 'surplusTarget' | 'salaryForSurplusTarget';

/** A single figure from the worked example, for use inline in post prose. */
export function TransitionExampleFigure({ name }: { name: ExampleFigure }) {
  const tr = getTransitionReadinessExample();
  const efTarget = 6 * tr.adjustedMonthlyExpenses;
  switch (name) {
    case 'surplus':
      return <>{formatCurrency(tr.monthlyGapOrSurplus)}</>;
    case 'runway':
      return <>{tr.emergencyFundMonths.toFixed(1)}</>;
    case 'efGap':
      return <>{formatCurrency(Math.max(0, efTarget - tr.totalLiquidSavings))}</>;
    case 'efTarget':
      return <>{formatCurrency(efTarget)}</>;
    case 'surplusTarget':
      return <>{formatCurrency(TR_EXAMPLE_SURPLUS_TARGET)}</>;
    case 'salaryForSurplusTarget':
      return <>{formatCurrency(getExampleSalaryForSurplusTarget())}</>;
  }
}
