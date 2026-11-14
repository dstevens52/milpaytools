import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { calculateTransitionReadiness, defaultFilingStatus } from '../../src/lib/calculations/transition-readiness';
import {
  getTransitionReadinessExample,
  getExampleSalaryForSurplusTarget,
  TR_EXAMPLE_INPUT,
  TR_EXAMPLE_SURPLUS_TARGET,
} from '../../src/lib/calculations/transition-readiness-example';
import { formatCurrency } from '../../src/lib/utils';
import {
  STATE_MILITARY_RETIREMENT_TAX,
  STATE_MILITARY_RETIREMENT_TAX_PENDING,
  getStateMilitaryRetirementTax,
} from '../../src/data/state-military-retirement-tax';
import { payTable } from '../../src/data/pay-tables/2026';
import { vaRates } from '../../src/data/va-rates/2026';
import type { TransitionReadinessInput, FilingStatus } from '../../src/types/calculator';

// Unit-level checks for retired pay, the VA waiver, and household taxes — no browser page needed.

// 2026 federal brackets, written out independently of src/data/constants.ts
// (IRS Rev. Proc. 2025-32 Tables 1–3; standard deductions from the IRS 2026 release).
const FED_2026: Record<FilingStatus, { deduction: number; brackets: [number, number][] }> = {
  single: { deduction: 16_100, brackets: [[12_400, 0.10], [50_400, 0.12], [105_700, 0.22], [201_775, 0.24], [256_225, 0.32], [640_600, 0.35], [Infinity, 0.37]] },
  mfj: { deduction: 32_200, brackets: [[24_800, 0.10], [100_800, 0.12], [211_400, 0.22], [403_550, 0.24], [512_450, 0.32], [768_700, 0.35], [Infinity, 0.37]] },
  hoh: { deduction: 24_150, brackets: [[17_700, 0.10], [67_450, 0.12], [105_700, 0.22], [201_750, 0.24], [256_200, 0.32], [640_600, 0.35], [Infinity, 0.37]] },
};

function fedTax2026(gross: number, status: FilingStatus): number {
  const { deduction, brackets } = FED_2026[status];
  const taxable = Math.max(0, gross - deduction);
  let tax = 0;
  let prev = 0;
  for (const [upTo, rate] of brackets) {
    tax += (Math.min(taxable, upTo) - prev) * rate;
    if (taxable <= upTo) break;
    prev = upTo;
  }
  return tax;
}
const mfjTax2026 = (gross: number) => fedTax2026(gross, 'mfj');

const STATE_RATE = 0.05;

// E-6, 20 yrs, retiring now, High-3 (legacy), 30% VA, $75K salary, $50K spouse.
const base: TransitionReadinessInput = {
  payGrade: 'E-6',
  yearsOfService: 20,
  zipCode: '',
  hasDependents: true,
  separationMonths: 0,
  retirementSystem: 'legacy',
  targetCivilianSalary: 75_000,
  spouseIncome: 50_000,
  vaRating: 30,
  crscEligible: false,
  retirementState: 'PA', // fully_exempt
  stateTaxRate: STATE_RATE,
  filingStatus: 'mfj',
  healthcareAssumption: 'employer',
  expenseMode: 'quick',
  totalMonthlyExpenses: 5_000,
  expenseHousing: 0,
  expenseCar: 0,
  expenseInsurance: 0,
  expenseGroceries: 0,
  expenseDebt: 0,
  expenseChildcare: 0,
  expenseUtilities: 0,
  expenseOther: 0,
  emergencyFund: 30_000,
  tspBalance: 45_000,
  otherSavings: 0,
};

const run = (overrides: Partial<TransitionReadinessInput> = {}) =>
  calculateTransitionReadiness({ ...base, ...overrides }, 0);

// E-6 retiring at exactly 20 YOS: High-3 = the last 36 months = years 18, 19, 20 of
// service = "over 16" × 12 months + "over 18" × 24 months (E-6 tops out at over 18).
// TR-06: transition readiness uses the Retirement calculator's High-3 (10 U.S.C. § 1407).
const E6_20_HIGH3 = (payTable['E-6'][16]! * 12 + payTable['E-6'][18]! * 24) / 36;
const GROSS_HIGH3 = E6_20_HIGH3 * 0.025 * 20 * 12;
const VA30 = vaRates[30].withSpouse * 12;
const VA60 = vaRates[60].withSpouse * 12;
const WAGES = 125_000;

test.describe('Transition readiness — retired pay and VA waiver', () => {
  test('1. 30% VA, 20 yrs: VA waiver, joint federal tax, no FICA on retired pay, exempt state', () => {
    const r = run();
    const taxableRetired = GROSS_HIGH3 - VA30;

    expect(r.receivesCRDP).toBe(false);
    expect(r.grossRetiredPayMonthly * 12).toBeCloseTo(GROSS_HIGH3, 2);
    expect(r.vaWaiverMonthly * 12).toBeCloseTo(VA30, 2);
    expect(r.taxableRetiredPayMonthly * 12).toBeCloseTo(taxableRetired, 2);
    // Retirement + VA together = gross retired pay, not gross + VA.
    expect((r.taxableRetiredPayMonthly + r.crscMonthly + r.vaCompMonthly) * 12).toBeCloseTo(GROSS_HIGH3, 2);

    expect(r.filingStatus).toBe('mfj');
    expect(r.civilianFedTaxableIncomeAnnual).toBeCloseTo(WAGES + taxableRetired, 2);
    expect(r.civilianFedTaxMonthly * 12).toBeCloseTo(mfjTax2026(WAGES + taxableRetired), 2);
    expect(r.civilianFICAMonthly * 12).toBeCloseTo(WAGES * 0.0765, 2);
    expect(r.stateRetiredPayTaxedMonthly).toBe(0);
    expect(r.civilianStateTaxMonthly * 12).toBeCloseTo(WAGES * STATE_RATE, 2);
  });

  test('2. 60% VA, 20 yrs: CRDP — full retired pay and full VA; only retired pay is taxable', () => {
    const r = run({ vaRating: 60 });
    expect(r.receivesCRDP).toBe(true);
    expect(r.vaWaiverMonthly).toBe(0);
    expect(r.taxableRetiredPayMonthly * 12).toBeCloseTo(GROSS_HIGH3, 2);
    expect(r.vaCompMonthly * 12).toBeCloseTo(VA60, 2);
    expect((r.taxableRetiredPayMonthly + r.vaCompMonthly) * 12).toBeCloseTo(GROSS_HIGH3 + VA60, 2);
    expect(r.civilianFedTaxableIncomeAnnual).toBeCloseTo(WAGES + GROSS_HIGH3, 2);
  });

  test('3. 30% VA with CRSC checked: full total restored, waived portion tax-free', () => {
    const plain = run();
    const r = run({ crscEligible: true });
    expect(r.crscMonthly * 12).toBeCloseTo(VA30, 2);
    expect((r.taxableRetiredPayMonthly + r.crscMonthly + r.vaCompMonthly) * 12).toBeCloseTo(GROSS_HIGH3 + VA30, 2);
    // CRSC adds no federal taxable income and no tax.
    expect(r.civilianFedTaxableIncomeAnnual).toBeCloseTo(plain.civilianFedTaxableIncomeAnnual, 2);
    expect(r.civilianFedTaxMonthly).toBeCloseTo(plain.civilianFedTaxMonthly, 2);
    expect(r.projectedCivilianMonthly - plain.projectedCivilianMonthly).toBeCloseTo(VA30 / 12, 2);
  });

  test('CRSC box has no effect at 50%+ (CRDP already pays both)', () => {
    expect(run({ vaRating: 60, crscEligible: true }).crscMonthly).toBe(0);
  });

  test('4. 10 yrs, separating, 40% VA: VA in full and tax-free, no retired pay (page example)', () => {
    const r = getTransitionReadinessExample();
    expect(r.militaryMonthlyBAH).toBeGreaterThan(0); // BAH resolved for JBSA, not a silent $0
    expect(r.isRetirementEligible).toBe(false);
    expect(r.grossRetiredPayMonthly).toBe(0);
    expect(r.vaWaiverMonthly).toBe(0);
    expect(r.vaCompMonthly).toBeCloseTo(vaRates[40].withSpouse, 2);
    expect(r.civilianFedTaxableIncomeAnnual).toBe(99_000); // VA excluded
    expect(r.projectedCivilianMonthlyIfStateExempts).toBeNull(); // nothing to split without retired pay
    expect(r.verdict).toBe('not-yet');
    expect(r.emergencyFundMonths).toBeCloseTo(15_000 / 5_900, 4);
  });
});

test.describe('Transition readiness — state treatment of retired pay', () => {
  const taxableRetired = GROSS_HIGH3 - VA30;

  test('5. taxable vs fully exempt differ by exactly rate × taxable retired pay', () => {
    expect(getStateMilitaryRetirementTax('OR')?.treatment).toBe('taxable');
    expect(getStateMilitaryRetirementTax('PA')?.treatment).toBe('fully_exempt');
    const taxed = run({ retirementState: 'OR' });
    const exempt = run({ retirementState: 'PA' });
    expect((taxed.civilianStateTaxMonthly - exempt.civilianStateTaxMonthly) * 12).toBeCloseTo(STATE_RATE * taxableRetired, 2);
  });

  test('6. partial with a cap taxes only retired pay above the cap', () => {
    const ga = getStateMilitaryRetirementTax('GA');
    expect(ga?.treatment).toBe('partial');
    // $10K salary keeps Georgia at its base $17,500 cap (no earned-income bonus).
    const cap = 17_500;
    expect(taxableRetired).toBeGreaterThan(cap); // otherwise this test proves nothing
    const partial = run({ retirementState: 'GA', targetCivilianSalary: 10_000 });
    const exempt = run({ retirementState: 'PA', targetCivilianSalary: 10_000 });
    expect(partial.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(taxableRetired - cap, 2);
    expect((partial.civilianStateTaxMonthly - exempt.civilianStateTaxMonthly) * 12).toBeCloseTo(STATE_RATE * (taxableRetired - cap), 2);
  });

  test('6b. partial by percentage (Montana) taxes the non-excluded share', () => {
    const mt = getStateMilitaryRetirementTax('MT');
    const r = run({ retirementState: 'MT' });
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(taxableRetired * (1 - mt!.exemptionPercent!), 2);
  });

  test('7. no income tax state: state tax is 0 regardless of the rate input', () => {
    expect(getStateMilitaryRetirementTax('TX')?.treatment).toBe('no_income_tax');
    expect(run({ retirementState: 'TX', stateTaxRate: 0.09 }).civilianStateTaxMonthly).toBe(0);
  });

  test('8. "not sure yet" shows both results, matching the taxable and exempt cases', () => {
    const unsure = run({ retirementState: null });
    const taxed = run({ retirementState: 'OR' });
    const exempt = run({ retirementState: 'PA' });
    expect(unsure.projectedCivilianMonthlyIfStateTaxes).toBeCloseTo(taxed.projectedCivilianMonthly, 6);
    expect(unsure.projectedCivilianMonthlyIfStateExempts).toBeCloseTo(exempt.projectedCivilianMonthly, 6);
    // The headline result is the conservative (taxed) one.
    expect(unsure.projectedCivilianMonthly).toBeCloseTo(taxed.projectedCivilianMonthly, 6);
  });

  test('9. BRS (2.0%) vs High-3 (2.5%) at the same base pay: pension ratio is exactly 0.8', () => {
    const high3 = run({ retirementSystem: 'legacy' });
    const brs = run({ retirementSystem: 'brs' });
    expect(brs.grossRetiredPayMonthly / high3.grossRetiredPayMonthly).toBeCloseTo(0.8, 10);
    // E-6, 20 yrs, BRS: High-3 (over 16 × 12 + over 18 × 24) ÷ 36 × 2.0% × 20 × 12.
    expect(brs.grossRetiredPayMonthly * 12).toBeCloseTo(E6_20_HIGH3 * 0.02 * 20 * 12, 2);
  });

  test('9a. TR-06: E-7, 20 yrs now, High-3 → $3,059.25/mo (same High-3 as the Retirement calculator)', () => {
    const r = run({ payGrade: 'E-7', vaRating: 0 });
    expect(r.grossRetiredPayMonthly).toBeCloseTo(3059.25, 2);
  });

  test('9b. screenshot scenario: E-6, 20 yrs now, separating at 21 yrs, BRS → $26,549/yr (2026 pay, no raises)', () => {
    const r = run({ retirementSystem: 'brs', separationMonths: 12 }); // 20 + 12 months = 21 years
    expect(Math.floor(r.separationYOS)).toBe(21);
    expect(r.grossRetiredPayMonthly * 12).toBeCloseTo(5_267.70 * 0.42 * 12, 2);
    expect(Math.round(r.grossRetiredPayMonthly * 12)).toBe(26_549);
  });
});

test.describe('Transition readiness — filing status', () => {
  test('default: spouse income → MFJ; dependents but no spouse income → HOH; otherwise single', () => {
    expect(defaultFilingStatus(24_000, true)).toBe('mfj');
    expect(defaultFilingStatus(24_000, false)).toBe('mfj');
    expect(defaultFilingStatus(0, true)).toBe('hoh');
    expect(defaultFilingStatus(0, false)).toBe('single');
  });

  test('single parent (with dependents, no spouse income) uses HOH brackets, not MFJ', () => {
    const r = run({ spouseIncome: 0, filingStatus: defaultFilingStatus(0, true) });
    expect(r.filingStatus).toBe('hoh');
    const fedBase = 75_000 + (GROSS_HIGH3 - VA30);
    expect(r.civilianFedTaxMonthly * 12).toBeCloseTo(fedTax2026(fedBase, 'hoh'), 2);
    expect(r.civilianFedTaxMonthly * 12).not.toBeCloseTo(fedTax2026(fedBase, 'mfj'), 0);
  });

  test('filing status override is honored', () => {
    // Married with spouse income, but the user picks single — the calculator follows the user.
    const r = run({ filingStatus: 'single' });
    expect(r.filingStatus).toBe('single');
    expect(r.civilianFedTaxMonthly * 12).toBeCloseTo(fedTax2026(WAGES + GROSS_HIGH3 - VA30, 'single'), 2);
  });

  for (const status of ['single', 'mfj', 'hoh'] as FilingStatus[]) {
    for (const spouseIncome of [0, 50_000]) {
      test(`military and civilian sides use the same filing status and spouse treatment (${status}, spouse $${spouseIncome})`, () => {
        const r = run({ filingStatus: status, spouseIncome, retirementState: 'PA' });
        const basePay = r.militaryMonthlyBasePay;
        // Military side: base pay + spouse wages on the same return.
        expect(r.militaryFedTaxMonthly * 12).toBeCloseTo(fedTax2026(basePay * 12 + spouseIncome, status), 2);
        expect(r.militaryFICAMonthly * 12).toBeCloseTo((basePay * 12 + spouseIncome) * 0.0765, 2);
        expect(r.militarySpouseStateTaxMonthly * 12).toBeCloseTo(spouseIncome * STATE_RATE, 2);
        // Civilian side: same status; spouse wages in the federal base, FICA and state base.
        expect(r.civilianFedTaxMonthly * 12).toBeCloseTo(fedTax2026(75_000 + spouseIncome + (GROSS_HIGH3 - VA30), status), 2);
        expect(r.civilianFICAMonthly * 12).toBeCloseTo((75_000 + spouseIncome) * 0.0765, 2);
        expect(r.civilianStateTaxMonthly * 12).toBeCloseTo((75_000 + spouseIncome) * STATE_RATE, 2);
      });
    }
  }

  test('grossed-up salary matches military take-home under the same filing status', () => {
    for (const status of ['single', 'mfj', 'hoh'] as FilingStatus[]) {
      const r = run({ filingStatus: status, retirementState: 'PA' });
      const s = r.grossedUpCivilianSalary;
      const wages = s + base.spouseIncome;
      const net = wages - fedTax2026(wages, status) - wages * 0.0765 - wages * STATE_RATE;
      // Rounded to the nearest $1,000 of salary → within ~$70/mo of the military side.
      expect(Math.abs(net / 12 - r.militaryTakeHomeMonthly)).toBeLessThan(70);
    }
  });
});

// ── D.C. and Vermont (32 V.S.A. § 5830e(d)) ──────────────────────────────
// Statute values written out here, independent of the data file, so a data typo fails.
const VT_FULL = 125_000;
const VT_NONE = 175_000;
const VT_DIVISOR = 50_000;

// Household AGI = salary + spouse income + federally taxable retired pay (after the VA waiver).
// Probe with salary 0 to get spouse + taxable retired pay, then pick the salary that lands AGI
// on the target.
function vtAt(targetAgi: number, overrides: Partial<TransitionReadinessInput> = {}) {
  const probe = run({ retirementState: 'VT', ...overrides, targetCivilianSalary: 0 });
  const r = run({ retirementState: 'VT', ...overrides, targetCivilianSalary: targetAgi - probe.civilianFedTaxableIncomeAnnual });
  return { r, agi: r.civilianFedTaxableIncomeAnnual, taxableRP: r.taxableRetiredPayMonthly * 12 };
}
const vtLow = vtAt(60_000);
const vt125 = vtAt(125_000);
const vt150 = vtAt(150_000);
const vt175 = vtAt(175_000);
const vtStatuses = (['single', 'mfj', 'hoh'] as FilingStatus[]).map((fs) => ({ fs, ...vtAt(150_000, { filingStatus: fs }) }));
const vtWaiver = vtAt(150_000, { vaRating: 30 });
const fmtAgi = (n: number) => `AGI $${n.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;

test.describe('Transition readiness — D.C. and Vermont', () => {
  test('1. D.C.: retired pay taxed at the state rate input, no "both outcomes"', () => {
    const dc = getStateMilitaryRetirementTax('DC');
    expect(dc?.treatment).toBe('taxable');
    expect(dc?.sourceUrl).toBe('https://code.dccouncil.gov/us/dc/council/code/sections/47-1803.02');
    const r = run({ retirementState: 'DC' });
    const taxableRetired = GROSS_HIGH3 - VA30; // independent of the lib
    expect(taxableRetired).toBeGreaterThan(0); // otherwise this test proves nothing
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(taxableRetired, 6);
    const wages = base.targetCivilianSalary + base.spouseIncome;
    expect(r.civilianStateTaxMonthly * 12).toBeCloseTo(STATE_RATE * (wages + taxableRetired), 6);
    expect(r.projectedCivilianMonthlyIfStateTaxes).toBeNull();
    expect(r.projectedCivilianMonthlyIfStateExempts).toBeNull();
  });

  test('Vermont record: statute thresholds as named constants, divisor = none − full', () => {
    const vt = getStateMilitaryRetirementTax('VT');
    expect(vt?.treatment).toBe('partial');
    expect(vt?.agiPhaseOut).toEqual({ fullExclusionMaxAgi: VT_FULL, noExclusionMinAgi: VT_NONE, divisor: VT_DIVISOR });
    expect(vt!.agiPhaseOut!.divisor).toBe(vt!.agiPhaseOut!.noExclusionMinAgi - vt!.agiPhaseOut!.fullExclusionMaxAgi);
    expect(vt?.sourceUrl).toBe('https://legislature.vermont.gov/statutes/section/32/151/05830e');
  });

  test(`2. Vermont, ${fmtAgi(vtLow.agi)} (well under $125,000): fully excluded`, () => {
    expect(vtLow.agi).toBe(60_000);
    expect(vtLow.taxableRP).toBeGreaterThan(0);
    expect(vtLow.r.stateExclusionShare).toBe(1);
    expect(vtLow.r.stateRetiredPayTaxedMonthly).toBe(0);
    expect(vtLow.r.projectedCivilianMonthlyIfStateTaxes).toBeNull(); // no "both outcomes"
  });

  test(`3. Vermont, ${fmtAgi(vt125.agi)} (boundary): fully excluded`, () => {
    expect(vt125.agi).toBe(VT_FULL);
    expect(vt125.r.stateExclusionShare).toBe(1);
    expect(vt125.r.stateRetiredPayTaxedMonthly).toBe(0);
  });

  test(`4. Vermont, ${fmtAgi(vt150.agi)}: exactly 50% excluded`, () => {
    expect(vt150.agi).toBe(150_000);
    expect(vt150.r.stateExclusionShare).toBe((VT_NONE - 150_000) / VT_DIVISOR);
    expect(vt150.r.stateExclusionShare).toBe(0.5);
    expect(vt150.r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(vt150.taxableRP * 0.5, 6);
  });

  test(`5. Vermont, ${fmtAgi(vt175.agi)} (boundary): nothing excluded`, () => {
    expect(vt175.agi).toBe(VT_NONE);
    expect(vt175.r.stateExclusionShare).toBe(0);
    expect(vt175.r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(vt175.taxableRP, 6);
  });

  test(`6. Vermont: same thresholds for every filing status (${vtStatuses.map((s) => `${s.fs} ${fmtAgi(s.agi)}`).join(', ')})`, () => {
    for (const s of vtStatuses) {
      expect(s.r.filingStatus).toBe(s.fs);
      expect(s.agi).toBe(150_000);
      expect(s.r.stateExclusionShare).toBe(0.5);
      expect(s.r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(s.taxableRP * 0.5, 6);
    }
    // And the boundaries hold for single/hoh too, not just the joint return.
    for (const fs of ['single', 'hoh'] as FilingStatus[]) {
      expect(vtAt(VT_FULL, { filingStatus: fs }).r.stateExclusionShare).toBe(1);
      expect(vtAt(VT_NONE, { filingStatus: fs }).r.stateExclusionShare).toBe(0);
    }
  });

  test(`7. Vermont, VA 30% (waiver), ${fmtAgi(vtWaiver.agi)}: exclusion applies to retired pay after the waiver`, () => {
    const { r, agi } = vtWaiver;
    expect(agi).toBe(150_000);
    const gross = r.grossRetiredPayMonthly * 12;
    const afterWaiver = r.taxableRetiredPayMonthly * 12;
    expect(r.vaWaiverMonthly).toBeGreaterThan(0); // otherwise this test proves nothing
    expect(afterWaiver).toBeLessThan(gross);
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(afterWaiver * 0.5, 6);
    expect(Math.abs(r.stateRetiredPayTaxedMonthly * 12 - gross * 0.5)).toBeGreaterThan(1);
  });

  test('Wyoming is in the table as a no-income-tax state', () => {
    expect(getStateMilitaryRetirementTax('WY')?.treatment).toBe('no_income_tax');
    expect(run({ retirementState: 'WY', stateTaxRate: 0.07 }).civilianStateTaxMonthly).toBe(0);
  });
});

test.describe('Transition readiness — state conditions the calculator computes', () => {
  test('GA: civilian salary $75K → $35,000 cap; $10K → $17,500 cap', () => {
    expect(run({ retirementState: 'GA', targetCivilianSalary: 75_000 }).stateExemptionCapAnnual).toBe(35_000);
    expect(run({ retirementState: 'GA', targetCivilianSalary: 10_000 }).stateExemptionCapAnnual).toBe(17_500);
    // Only the member's own salary counts — spouse wages don't unlock the bonus.
    expect(run({ retirementState: 'GA', targetCivilianSalary: 10_000, spouseIncome: 90_000 }).stateExemptionCapAnnual).toBe(17_500);
  });

  // Build a household whose federal AGI (wages + taxable retired pay) hits a target.
  function caAt(agi: number, status: FilingStatus, spouseIncome: number) {
    const probe = run({ retirementState: 'CA', filingStatus: status, spouseIncome });
    const retired = probe.taxableRetiredPayMonthly * 12;
    const r = run({ retirementState: 'CA', filingStatus: status, spouseIncome, targetCivilianSalary: agi - spouseIncome - retired });
    expect(r.civilianFedTaxableIncomeAnnual).toBeCloseTo(agi, 2);
    return { r, retired };
  }

  test('CA: single, AGI $130K → no exclusion (cliff)', () => {
    const { r, retired } = caAt(130_000, 'single', 0);
    expect(r.stateExemptionCapAnnual).toBe(0);
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(retired, 2);
  });

  test('CA: single, AGI $120K → $20,000 excluded', () => {
    const { r, retired } = caAt(120_000, 'single', 0);
    expect(r.stateExemptionCapAnnual).toBe(20_000);
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(retired - 20_000, 2);
  });

  test('CA: MFJ, AGI $200K → $20,000 excluded (joint limit is $250K)', () => {
    const { r, retired } = caAt(200_000, 'mfj', 50_000);
    expect(r.stateExemptionCapAnnual).toBe(20_000);
    expect(r.stateRetiredPayTaxedMonthly * 12).toBeCloseTo(retired - 20_000, 2);
  });

  test('ID: MFJ → $72,324 cap; single → $48,216', () => {
    expect(run({ retirementState: 'ID', filingStatus: 'mfj' }).stateExemptionCapAnnual).toBe(72_324);
    expect(run({ retirementState: 'ID', filingStatus: 'single' }).stateExemptionCapAnnual).toBe(48_216);
    expect(run({ retirementState: 'ID', filingStatus: 'hoh' }).stateExemptionCapAnnual).toBe(48_216);
  });
});

test.describe('Transition readiness — no hardcoded example outputs', () => {
  const ex = getTransitionReadinessExample();
  const surplus = formatCurrency(ex.monthlyGapOrSurplus);
  const runway = ex.emergencyFundMonths.toFixed(1);

  test('example input is the one the page and blog describe', () => {
    expect(TR_EXAMPLE_INPUT.targetCivilianSalary).toBe(75_000);
    expect(TR_EXAMPLE_INPUT.spouseIncome).toBe(24_000);
    expect(ex.verdict).toBe('not-yet'); // the blog and hero bar say "Not yet ready"
    expect(ex.surplusStatus).toBe('green'); // the blog says the surplus clears $500
  });

  test('llms.txt quotes the computed surplus and runway', () => {
    const llms = readFileSync('public/llms.txt', 'utf8');
    expect(llms).toContain(`showing a ${surplus}/month surplus — Not Yet verdict due to ${runway}-month emergency fund runway`);
  });

  test('blog post renders the example from the calculator, with no literal figures', () => {
    const mdx = readFileSync('src/content/blog/are-you-financially-ready-to-leave-the-military.mdx', 'utf8');
    expect(mdx).toContain('<TransitionReadinessExample />');
    expect(mdx).toContain('<TransitionExampleFigure name="surplus" />');
    expect(mdx).toContain('<TransitionExampleFigure name="salaryForSurplusTarget" />');
    const salaryTarget = formatCurrency(getExampleSalaryForSurplusTarget());
    for (const stale of ['$374', '$6,274', '$4,084', '$1,307', '$35,400', '$82,000', surplus, salaryTarget]) {
      expect(mdx).not.toContain(stale);
    }
  });

  test('step 3 salary is the smallest $1,000 step that clears the $2,000/mo surplus target', () => {
    expect(TR_EXAMPLE_SURPLUS_TARGET).toBe(2_000);
    const salary = getExampleSalaryForSurplusTarget();
    expect(salary % 1_000).toBe(0);
    const bah = ex.militaryMonthlyBAH;
    const at = (s: number) => calculateTransitionReadiness({ ...TR_EXAMPLE_INPUT, targetCivilianSalary: s }, bah);
    expect(at(salary).monthlyGapOrSurplus).toBeGreaterThanOrEqual(2_000);
    expect(at(salary - 1_000).monthlyGapOrSurplus).toBeLessThan(2_000);
    expect(at(salary).filingStatus).toBe(ex.filingStatus); // same filing status as the example
  });

  test('calculator page hero bar is computed, not typed in', () => {
    const page = readFileSync('src/app/calculators/transition-readiness/page.tsx', 'utf8');
    expect(page).toContain('formatCurrency(tr.monthlyGapOrSurplus)}/mo surplus');
    expect(page).not.toMatch(/\$\d[\d,]*\/mo surplus/);
  });
});

test.describe('State military retirement tax data', () => {
  test('table is non-empty (an empty loop below would prove nothing)', () => {
    expect(STATE_MILITARY_RETIREMENT_TAX.length).toBeGreaterThan(0);
  });

  test('no duplicate states, and no pending state is in the dropdown list', () => {
    const codes = STATE_MILITARY_RETIREMENT_TAX.map((s) => s.state);
    expect(new Set(codes).size).toBe(codes.length);
    for (const p of STATE_MILITARY_RETIREMENT_TAX_PENDING) expect(codes).not.toContain(p.state);
    expect(codes.length + STATE_MILITARY_RETIREMENT_TAX_PENDING.length).toBe(51);
  });

  for (const s of STATE_MILITARY_RETIREMENT_TAX) {
    test(`${s.state}: complete record`, () => {
      expect(s.sourceUrl).toMatch(/^https:\/\//);
      expect(s.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.taxYear).toBeGreaterThanOrEqual(2024);
      if (s.treatment === 'partial') {
        expect(s.exemptionCap !== undefined || s.exemptionPercent !== undefined || s.agiPhaseOut !== undefined).toBe(true);
        if (s.agiPhaseOut) {
          expect(s.agiPhaseOut.divisor).toBe(s.agiPhaseOut.noExclusionMinAgi - s.agiPhaseOut.fullExclusionMaxAgi);
        }
      } else if (s.treatment === 'varies') {
        expect(s.conditionNote).toBeTruthy(); // the note is the only explanation the user gets
      } else {
        expect(s.exemptionCap).toBeUndefined();
        expect(s.exemptionPercent).toBeUndefined();
      }
    });
  }
});
