import { test, expect } from '@playwright/test';
import { vaFundingFeeFigure as fig, feeScenario } from '../../src/lib/vaFundingFeePost';
import { formatCurrency } from '../../src/lib/utils';

// <VaFundingFee> (build V3): the MDX component that renders every funding fee rate and
// dollar amount in the VA loan posts. Unit tests: no page is opened.
// Run: npm run test:va-loan
//
// Expected values are rebuilt here from VA's table as written in
// docs/sources/va-funding-fee-2026.md (VA.gov, rates effective April 7, 2023), not from
// the lib, so a wrong rate in vaLoanFees.ts fails here.

const VA = {
  purchase: {
    first: { lt5: 0.0215, gte5: 0.015, gte10: 0.0125 },
    subsequent: { lt5: 0.033, gte5: 0.015, gte10: 0.0125 },
  },
  cashout: { first: 0.0215, subsequent: 0.033 },
  irrrl: 0.005,
  assumption: 0.005,
  manufactured: 0.01,
};
const usd = (n: number) => formatCurrency(Math.round(n));
/** Standard amortizing payment, written out here rather than imported. */
const pmt = (loan: number, ratePct: number, years: number) => {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  return (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
};

test.describe('VaFundingFee: rates (VA table)', () => {
  test('purchase rates by use and down payment band', () => {
    const cases: [string, string, string][] = [
      ['first', '0', '2.15%'],
      ['first', '4.99', '2.15%'],
      ['first', '5', '1.50%'],
      ['first', '9.99', '1.50%'],
      ['first', '10', '1.25%'],
      ['first', '20', '1.25%'],
      ['subsequent', '0', '3.30%'],
      ['subsequent', '5', '1.50%'],
      ['subsequent', '10', '1.25%'],
    ];
    for (const [use, down, want] of cases) {
      expect(fig({ use: use as 'first' | 'subsequent', down, show: 'rate' }), `${use} ${down}%`).toBe(want);
    }
  });

  test('other loan types', () => {
    expect(fig({ type: 'irrrl', show: 'rate' })).toBe('0.50%');
    expect(fig({ type: 'irrrl', use: 'subsequent', show: 'rate' })).toBe('0.50%');
    expect(fig({ type: 'cashout', use: 'first', show: 'rate' })).toBe('2.15%');
    expect(fig({ type: 'cashout', use: 'subsequent', show: 'rate' })).toBe('3.30%');
    expect(fig({ type: 'assumption', show: 'rate' })).toBe('0.50%');
    expect(fig({ type: 'manufactured', show: 'rate' })).toBe('1.00%');
  });
});

test.describe('VaFundingFee: dollar amounts', () => {
  test('$350,000 purchase: the post\'s scenarios (control values from VA\'s table)', () => {
    // Controls: the figures the funding fee post used to type by hand.
    expect(usd(350000 * VA.purchase.first.lt5)).toBe('$7,525');
    expect(usd(350000 * VA.purchase.subsequent.lt5)).toBe('$11,550');
    expect(usd(332500 * VA.purchase.first.gte5)).toBe('$4,988');
    expect(usd(315000 * VA.purchase.first.gte10)).toBe('$3,938');
    expect(usd(300000 * VA.irrrl)).toBe('$1,500');

    expect(fig({ price: '350000', use: 'first', down: '0' })).toBe(usd(350000 * VA.purchase.first.lt5));
    expect(fig({ price: '350000', use: 'subsequent', down: '0' })).toBe(usd(350000 * VA.purchase.subsequent.lt5));
    expect(fig({ price: '350000', use: 'first', down: '5' })).toBe(usd(332500 * VA.purchase.first.gte5));
    expect(fig({ price: '350000', use: 'first', down: '10' })).toBe(usd(315000 * VA.purchase.first.gte10));
    expect(fig({ type: 'irrrl', loan: '300000' })).toBe(usd(300000 * VA.irrrl));
    expect(fig({ type: 'assumption', loan: '300000' })).toBe(usd(300000 * VA.assumption));
    expect(fig({ type: 'cashout', use: 'subsequent', loan: '300000' })).toBe(usd(300000 * VA.cashout.subsequent));
  });

  test('down payment, base loan and financed loan', () => {
    expect(fig({ price: '350000', down: '5', show: 'down' })).toBe('$17,500');
    expect(fig({ price: '350000', down: '5', show: 'loan' })).toBe('$332,500');
    expect(fig({ price: '350000', down: '10', show: 'loan' })).toBe('$315,000');
    expect(fig({ price: '350000', down: '0', show: 'down' })).toBe('$0');
    expect(fig({ price: '350000', use: 'first', down: '0', show: 'financed' })).toBe('$357,525');
    // Numbers (not strings) work too.
    expect(fig({ price: 350000, use: 'first', down: 0 })).toBe('$7,525');
  });

  test('vsUse / vsDown: the difference between two scenarios', () => {
    const first0 = 350000 * VA.purchase.first.lt5;
    const sub0 = 350000 * VA.purchase.subsequent.lt5;
    const first5 = Math.round(332500 * VA.purchase.first.gte5);
    const sub5 = Math.round(332500 * VA.purchase.subsequent.gte5);
    const first10 = Math.round(315000 * VA.purchase.first.gte10);
    expect(fig({ price: '350000', use: 'first', down: '5', vsDown: '0' })).toBe(usd(first0 - first5));
    expect(fig({ price: '350000', use: 'subsequent', down: '5', vsDown: '0' })).toBe(usd(sub0 - sub5));
    expect(fig({ price: '350000', use: 'first', down: '10', vsDown: '5' })).toBe(usd(first5 - first10));
    expect(fig({ price: '350000', use: 'subsequent', down: '0', vsUse: 'first' })).toBe(usd(sub0 - first0));
    // Controls: the post's old hand-typed differences.
    expect(usd(first0 - first5)).toBe('$2,537');
    expect(usd(sub0 - sub5)).toBe('$6,562');
    expect(usd(first5 - first10)).toBe('$1,050');
    expect(usd(sub0 - first0)).toBe('$4,025');
  });

  test('monthly cost of a financed fee and its total over the term', () => {
    const m = pmt(7525, 6.5, 30);
    expect(fig({ price: '350000', use: 'first', down: '0', show: 'monthly', interest: '6.5', years: '30' })).toBe(usd(m));
    expect(fig({ price: '350000', use: 'first', down: '0', show: 'totalPaid', interest: '6.5', years: '30' })).toBe(usd(m * 360));
    // The post used to say "$47/month" and "$16,920"; the payment formula gives these.
    expect(usd(m)).toBe('$48');
    expect(usd(m * 360)).toBe('$17,123');
  });

  test('payment: P&I on the base loan, with the fee, plus stated costs, minus a BAH', () => {
    expect(fig({ loan: '280000', show: 'payment', interest: '6.0', years: '30' })).toBe(usd(pmt(280000, 6, 30)));
    expect(fig({ loan: '280000', use: 'first', show: 'payment', withFee: 'yes', interest: '6.0', years: '30' })).toBe(
      usd(pmt(280000 + 280000 * VA.purchase.first.lt5, 6, 30)),
    );
    const pi240 = pmt(240000, 6.5, 30);
    expect(fig({ loan: '240000', show: 'payment', interest: '6.5', years: '30' })).toBe(usd(pi240));
    expect(fig({ loan: '240000', show: 'payment', interest: '6.5', years: '30', plus: '300' })).toBe(usd(pi240 + 300));
    expect(fig({ loan: '240000', show: 'payment', interest: '6.5', years: '30', plus: '300', subtractFrom: '2050' })).toBe(
      usd(2050 - (pi240 + 300)),
    );
    // Controls: the post used to say $1,518 and ~$1,818 (off by a dollar).
    expect(usd(pi240)).toBe('$1,517');
    expect(usd(pi240 + 300)).toBe('$1,817');
  });

  test('feeScenario: no exemption is applied (the posts show the fee a non-exempt borrower pays)', () => {
    expect(feeScenario({ price: '350000', use: 'first', down: '0' }).fee).toBe(7525);
  });
});

test.describe('VaFundingFee: bad props throw (never render NaN or $0 by accident)', () => {
  const bad: Parameters<typeof fig>[0][] = [
    { price: 'abc', down: '0' },
    { price: '-5', down: '0' },
    { price: '350000', down: '100' },
    { price: '350000', down: 'x' },
    { down: '0' }, // fee needs a price
    { type: 'irrrl' }, // fee needs a loan
    { price: '350000', show: 'monthly' }, // needs interest and years
    { price: '350000', show: 'payment', interest: '6' }, // needs years
    { price: '350000', use: 'second' as never },
    { type: 'vendee' as never, show: 'rate' },
    { price: '350000', show: 'bogus' as never },
  ];
  for (const p of bad) {
    test(JSON.stringify(p), () => {
      expect(() => fig(p)).toThrow(/VaFundingFee/);
    });
  }
});
