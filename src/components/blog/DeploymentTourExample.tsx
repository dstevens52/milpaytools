import { calculateDeployment, defaultDeploymentFilingStatus, type DeploymentResult } from '@/lib/calculations/deployment';
import { combinedBahForZip, getLocationDisplayName } from '@/lib/calculations/bah';
import type { FilingStatus } from '@/lib/calculations/federalTax';
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

/** E-6, 10 years, with dependents, in a combat zone with IDP and FSA, $10,000 in SDP. */
function runExample(deploymentMonths: number, filingStatus: FilingStatus): DeploymentResult {
  const ex = DEPLOYMENT_TOUR_EXAMPLE;
  const monthlyBAH = combinedBahForZip(ex.zipCode, ex.payGrade, true);
  if (!(monthlyBAH > 0)) throw new Error(`DeploymentTourExample: no BAH for ZIP ${ex.zipCode}`);
  return calculateDeployment({
    payGrade: ex.payGrade,
    yearsOfService: ex.yearsOfService,
    hasDependents: true,
    filingStatus,
    zipCode: ex.zipCode,
    monthlyBAH,
    bahFound: true,
    deploymentMonths,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: true,
    sdpDeposit: ex.sdpDeposit,
  });
}

/** The walkthrough: E-6, 10 years, with dependents, 9 months in a combat zone with IDP and FSA, $10,000 in SDP. */
export function deploymentTourExample(): DeploymentResult {
  return runExample(DEPLOYMENT_TOUR_EXAMPLE.deploymentMonths, defaultDeploymentFilingStatus(true));
}

/**
 * The 12-month "what a deployment adds" example (PR #90 review): same member and inputs as the
 * walkthrough, 12 months, at married filing jointly and single. BAH doesn't enter these figures
 * (CZTE savings are on base pay + IDP). FSA is the lib's $300/month (FY2026 NDAA, 37 U.S.C. § 427,
 * effective Dec 18, 2025; MARADMIN 150/26).
 */
export const DEPLOYMENT_YEAR_MONTHS = 12;
export function deploymentYearExample(): { joint: DeploymentResult; single: DeploymentResult } {
  return {
    joint: runExample(DEPLOYMENT_YEAR_MONTHS, 'mfj'),
    single: runExample(DEPLOYMENT_YEAR_MONTHS, 'single'),
  };
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

/** The 12-month table: what a year in a combat zone adds, from the same lib call as the walkthrough. */
export function DeploymentYearTable() {
  const { joint, single } = deploymentYearExample();
  const n = DEPLOYMENT_YEAR_MONTHS;
  const d = joint.during;
  const rows: [string, string, string][] = [
    ['Base pay (excluded from federal taxable income under CZTE)', usd(d.monthlyBasePay), usd(d.monthlyBasePay * n)],
    [
      'Federal income tax savings (CZTE, base pay + IDP)',
      `~${usd(joint.tour.totalCZTESavings / n)} joint / ~${usd(single.tour.totalCZTESavings / n)} single`,
      `~${usd(joint.tour.totalCZTESavings)} joint / ~${usd(single.tour.totalCZTESavings)} single`,
    ],
    ['Imminent Danger Pay (IDP)', usd(d.monthlyIDP), usd(d.monthlyIDP * n)],
    ['Family Separation Allowance', usd(d.monthlyFSA), usd(d.monthlyFSA * n)],
    ['Hardship Duty Pay (varies by category/location)', 'varies', 'varies'],
    [`SDP interest (on ${usd(DEPLOYMENT_TOUR_EXAMPLE.sdpDeposit)})`, '—', `~${usd(joint.tour.sdpInterestEarned)}`],
  ];
  return (
    <table data-testid="deployment-year-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Monthly</th>
          <th>{n}-Month Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, monthly, total]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{monthly}</td>
            <td>{total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type YearFigure =
  | 'fica'
  | 'taxSavingsJoint'
  | 'taxSavingsSingle'
  | 'specialPays'
  | 'sdpInterest'
  | 'totalJoint'
  | 'totalSingle';

/** One figure from the 12-month example, for use inline in post prose. */
export function DeploymentYearFigure({ name }: { name: YearFigure }) {
  const { joint, single } = deploymentYearExample();
  switch (name) {
    case 'fica':
      return <>{usd(joint.during.monthlyFICA)}</>;
    case 'taxSavingsJoint':
      return <>{usd(joint.tour.totalCZTESavings)}</>;
    case 'taxSavingsSingle':
      return <>{usd(single.tour.totalCZTESavings)}</>;
    case 'specialPays':
      return <>{usd(joint.tour.totalAdditionalAllowancePay)}</>;
    case 'sdpInterest':
      return <>{usd(joint.tour.sdpInterestEarned)}</>;
    case 'totalJoint':
      return <>{usd(joint.tour.totalTourBenefit)}</>;
    case 'totalSingle':
      return <>{usd(single.tour.totalTourBenefit)}</>;
  }
}
