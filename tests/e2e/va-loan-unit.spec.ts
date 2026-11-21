import { test, expect } from '@playwright/test';
import {
  FEE_STATUSES,
  VA_PURCHASE_FUNDING_FEE as FEE,
  bandDownPct,
  fundingFeeAmount,
  fundingFeeRateFor,
  getFundingFeeRate,
  isFeeExempt,
  parseFeeStatus,
  type FeeStatus,
} from '../../src/lib/calculations/vaLoanFees';
import { calcMonthlyPI, calcVaLoan, VA_LOAN_DEFAULTS } from '../../src/lib/calculations/vaLoan';

// VA loan calculator logic (build V1: fee status, VAL-02, VAL-03). Unit tests: no
// page is opened. Rules: docs/sources/va-funding-fee-2026.md. Run: npm run test:va-loan

const EXEMPT: FeeStatus[] = ['comp', 'eligible', 'dic', 'predischarge', 'purpleheart'];
const CHARGED: FeeStatus[] = ['none', 'pending'];

test.describe('Funding fee status → rate', () => {
  test('seven statuses, in VA order, five exempt', () => {
    expect(FEE_STATUSES.map((s) => s.value)).toEqual([
      'none', 'comp', 'eligible', 'dic', 'predischarge', 'purpleheart', 'pending',
    ]);
    expect(FEE_STATUSES.filter((s) => s.exempt).map((s) => s.value)).toEqual(EXEMPT);
  });

  for (const status of EXEMPT) {
    test(`${status} → rate 0 at every band, first and subsequent use`, () => {
      expect(isFeeExempt(status)).toBe(true);
      for (const firstUse of [true, false]) {
        for (const pct of [0, 4.99, 5, 9.99, 10, 20]) {
          expect(fundingFeeRateFor(status, firstUse, pct)).toBe(0);
        }
      }
    });
  }

  for (const status of CHARGED) {
    test(`${status} → the normal band rate`, () => {
      expect(isFeeExempt(status)).toBe(false);
      // VA table (docs/sources/va-funding-fee-2026.md).
      expect(fundingFeeRateFor(status, true, 0)).toBe(0.0215);
      expect(fundingFeeRateFor(status, false, 0)).toBe(0.033);
      expect(fundingFeeRateFor(status, true, 5)).toBe(0.015);
      expect(fundingFeeRateFor(status, false, 5)).toBe(0.015);
      expect(fundingFeeRateFor(status, true, 10)).toBe(0.0125);
      expect(fundingFeeRateFor(status, false, 10)).toBe(0.0125);
      for (const firstUse of [true, false]) {
        for (const pct of [0, 4.99, 5, 9.99, 10, 20]) {
          expect(fundingFeeRateFor(status, firstUse, pct)).toBe(getFundingFeeRate(firstUse, pct));
        }
      }
    });
  }
});

test.describe('VAL-02: percent mode takes the band from the typed percentage', () => {
  const price = 389905;
  /** What the calculator stores for a typed percent: rounded dollars. */
  const dollarsFor = (pct: number) => Math.round((price * pct) / 100);

  test('5% typed on $389,905 → 1.5% band; fee on $370,410 = $5,556.15 → $5,556', () => {
    const down = dollarsFor(5);
    expect(down).toBe(19495);
    // The old way: percent recomputed from the rounded dollars falls under 5%.
    expect((down / price) * 100).toBeLessThan(5);
    const band = bandDownPct('percent', 5, down, price);
    expect(band).toBe(5);
    const r = calcVaLoan({ ...VA_LOAN_DEFAULTS, homePrice: price, downDollars: down, bandPct: band });
    expect(r.baseLoan).toBe(370410);
    expect(r.fundingFeeRate).toBe(0.015);
    expect(r.baseLoan * r.fundingFeeRate).toBeCloseTo(5556.15, 2);
    expect(r.fundingFeeAmount).toBe(5556);
  });

  test('10% typed on $389,905 → 1.25% band', () => {
    const down = dollarsFor(10);
    const band = bandDownPct('percent', 10, down, price);
    expect(band).toBe(10);
    const r = calcVaLoan({ ...VA_LOAN_DEFAULTS, homePrice: price, downDollars: down, bandPct: band });
    expect(r.fundingFeeRate).toBe(0.0125);
    expect(r.fundingFeeAmount).toBe(fundingFeeAmount(price - down, 0.0125));
  });

  test('10% typed where the dollars round down ($389,904 → $38,990, 9.99997%) → still 1.25%', () => {
    const p = 389904;
    const down = Math.round((p * 10) / 100);
    expect((down / p) * 100).toBeLessThan(10);
    expect(bandDownPct('percent', 10, down, p)).toBe(10);
    expect(getFundingFeeRate(true, bandDownPct('percent', 10, down, p))).toBe(0.0125);
  });

  test('dollar mode keeps dollars ÷ price', () => {
    expect(bandDownPct('dollar', 99, 17500, 350000)).toBeCloseTo(5, 9);
    expect(bandDownPct('dollar', 0, 17499, 350000)).toBeLessThan(5);
    expect(bandDownPct('dollar', 0, 0, 0)).toBe(0);
  });
});

test.describe('URL: fee= and the older exempt=', () => {
  test('exempt=yes → comp; exempt=no → none (only when fee is absent)', () => {
    expect(parseFeeStatus(null, 'yes')).toBe('comp');
    expect(parseFeeStatus(null, '1')).toBe('comp');
    expect(parseFeeStatus(null, 'no')).toBe('none');
    expect(parseFeeStatus('pending', 'yes')).toBe('pending');
    expect(parseFeeStatus('none', 'yes')).toBe('none');
  });

  test('every status round-trips (the share link writes fee=<status>)', () => {
    for (const { value } of FEE_STATUSES) {
      const q = new URLSearchParams({ fee: value }).toString();
      expect(parseFeeStatus(new URLSearchParams(q).get('fee'), null)).toBe(value);
    }
    expect(parseFeeStatus('pending', null)).toBe('pending');
  });

  test('unknown values → none', () => {
    expect(parseFeeStatus('garbage', null)).toBe('none');
    expect(parseFeeStatus('', null)).toBe('none');
    expect(parseFeeStatus(null, 'maybe')).toBe('none');
    expect(parseFeeStatus(null, null)).toBe('none');
  });
});

test.describe('VAL-03: the page example is the calculator default', () => {
  test('defaults: $7,525 fee, P&I $2,143.54, PITI $2,610.21 (displays $2,610)', () => {
    const r = calcVaLoan(VA_LOAN_DEFAULTS);
    expect(r.fundingFeeAmount).toBe(fundingFeeAmount(350000, FEE.first.lt5));
    expect(r.fundingFeeAmount).toBe(7525);
    expect(r.financedLoan).toBe(357525);
    expect(r.monthlyPI).toBeCloseTo(2143.54, 2);
    expect(r.totalPITI).toBeCloseTo(2610.21, 2);
    expect(Math.round(r.totalPITI)).toBe(2610);
    expect(r.feeFinancedExtra).toBeCloseTo(45.116, 3); // displays $45
  });

  test('exempt: loan stays $350,000, P&I $2,098.43, payment $45.12/mo lower (displays $45)', () => {
    const base = calcVaLoan(VA_LOAN_DEFAULTS);
    const ex = calcVaLoan({ ...VA_LOAN_DEFAULTS, feeStatus: 'comp' });
    expect(ex.fundingFeeAmount).toBe(0);
    expect(ex.standardFeeAmount).toBe(7525);
    expect(ex.financedLoan).toBe(350000);
    expect(ex.monthlyPI).toBeCloseTo(2098.43, 2);
    expect(base.totalPITI - ex.totalPITI).toBeCloseTo(45.116, 3);
    expect(base.totalPITI - ex.totalPITI).toBeCloseTo(base.feeFinancedExtra, 9);
  });

  test('pending is charged like none', () => {
    expect(calcVaLoan({ ...VA_LOAN_DEFAULTS, feeStatus: 'pending' })).toEqual(calcVaLoan(VA_LOAN_DEFAULTS));
  });

  test('monthly P&I formula: 0% rate is straight-line, empty loan is 0', () => {
    expect(calcMonthlyPI(360000, 0, 30)).toBe(1000);
    expect(calcMonthlyPI(0, 6, 30)).toBe(0);
  });
});
