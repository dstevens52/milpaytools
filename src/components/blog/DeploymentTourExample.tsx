import { calculateDeployment, defaultDeploymentFilingStatus, type DeploymentResult } from '@/lib/calculations/deployment';
import { combinedBahForZip, getLocationDisplayName } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';

// S7b: the 9-month E-6 walkthrough in deployment-pay-explained, computed with the
// deployment calculator's own function (calculateDeployment), the same way the
// calculator's summary example runs it. BAH follows the one-year rule
// (combinedBahForZip). Server only; MDX posts can't import data modules.

export const DEPLOYMENT_TOUR_EXAMPLE = {
  payGrade: 'E-6',
  yearsOfService: 10,
  zipCode: '28310',
  deploymentMonths: 9,
  sdpDeposit: 10000,
} as const;

/** The walkthrough: E-6, 10 years, with dependents, 9 months in a combat zone with IDP and FSA, $10,000 in SDP. */
export function deploymentTourExample(): DeploymentResult {
  const ex = DEPLOYMENT_TOUR_EXAMPLE;
  const monthlyBAH = combinedBahForZip(ex.zipCode, ex.payGrade, true);
  if (!(monthlyBAH > 0)) throw new Error(`DeploymentTourExample: no BAH for ZIP ${ex.zipCode}`);
  return calculateDeployment({
    payGrade: ex.payGrade,
    yearsOfService: ex.yearsOfService,
    hasDependents: true,
    filingStatus: defaultDeploymentFilingStatus(true),
    zipCode: ex.zipCode,
    monthlyBAH,
    bahFound: true,
    deploymentMonths: ex.deploymentMonths,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: true,
    sdpDeposit: ex.sdpDeposit,
  });
}

/** Whole dollars, as the deployment calculator shows them. */
const usd = (n: number) => formatCurrency(Math.round(n));

export function DeploymentTourTable() {
  const r = deploymentTourExample();
  const d = r.during;
  const place = getLocationDisplayName(DEPLOYMENT_TOUR_EXAMPLE.zipCode) ?? `ZIP ${DEPLOYMENT_TOUR_EXAMPLE.zipCode}`;
  const rows: [string, string, string, boolean?][] = [
    ['Base pay (E-6, 10 years)', usd(d.monthlyBasePay), 'Excluded from federal taxable income (CZTE)'],
    [`BAH with dependents (${place}, ZIP ${DEPLOYMENT_TOUR_EXAMPLE.zipCode})`, usd(d.monthlyBAH), 'Already excluded'],
    ['BAS (enlisted)', usd(d.monthlyBAS), 'Already excluded'],
    ['Imminent Danger Pay', usd(d.monthlyIDP), 'Excluded (CZTE)'],
    ['Family Separation Allowance', usd(d.monthlyFSA), 'Non-taxable'],
    ['Total monthly pay', usd(d.grossMonthly), '', true],
    ['Federal income tax', usd(d.monthlyFederalTax), 'Combat zone month'],
    ['Social Security + Medicare on base pay', `−${usd(d.monthlyFICA)}`, 'Still withheld in a combat zone'],
    ['Monthly pay after taxes', usd(d.monthlyTakeHome), '', true],
  ];
  return (
    <table data-testid="deployment-tour-table">
      <thead>
        <tr>
          <th>Pay component</th>
          <th>Monthly</th>
          <th>Tax status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value, note, bold]) => (
          <tr key={label}>
            <td>{bold ? <strong>{label}</strong> : label}</td>
            <td>{bold ? <strong>{value}</strong> : value}</td>
            <td>{note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type TourFigure = 'takeHome9' | 'sdpInterest' | 'months';

/** One figure from the walkthrough, for use inline in post prose. */
export function DeploymentTourFigure({ name }: { name: TourFigure }) {
  const r = deploymentTourExample();
  switch (name) {
    case 'takeHome9':
      return <>{usd(r.during.monthlyTakeHome * DEPLOYMENT_TOUR_EXAMPLE.deploymentMonths)}</>;
    case 'sdpInterest':
      return <>{usd(r.tour.sdpInterestEarned)}</>;
    case 'months':
      return <>{DEPLOYMENT_TOUR_EXAMPLE.deploymentMonths}</>;
  }
}
