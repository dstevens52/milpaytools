import { test, expect } from '@playwright/test';
import {
  FEE_STATUSES,
  parseFeeStatus,
  type FeeStatus,
} from '../../src/lib/calculations/vaLoanFees';
import {
  VA_REFINANCE_DEFAULTS as D,
  bottomLineSentences,
  bpsLabel,
  calcSeasoning,
  calcVaRefinance,
  localToday,
  parseIsoDate,
  rateDropBps,
  toIsoDate,
} from '../../src/lib/calculations/vaRefinance';

// VA refinance calculator logic (build 10b: VRF-01, 03–06, fee status). Unit tests:
// no page is opened. Rules: docs/sources/va-refinance-rules-2026.md and
// docs/sources/va-funding-fee-2026.md. Run: npm run test:va-refinance

/** Independent copy of the amortization formula, so the lib is checked against it. */
function pi(loan: number, ratePct: number, years: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  return (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

const EXEMPT: FeeStatus[] = ['comp', 'eligible', 'dic', 'predischarge', 'purpleheart'];
const CHARGED: FeeStatus[] = ['none', 'pending'];

test.describe('Defaults (the page example)', () => {
  const r = calcVaRefinance(D);

  test('payment drop $312.69 and 8 months to recover closing costs', () => {
    expect(r.monthlySavings).toBeCloseTo(312.69, 2);
    expect(Math.round(r.monthlySavings)).toBe(313);
    expect(r.monthsToRecover).toBe(8);
    expect(r.fundingFeeAmount).toBe(1500);
    expect(r.newLoan).toBe(301500);
    expect(r.rateDropBps).toBe(100);
    expect(r.ratePass).toBe(true);
    expect(r.recoupmentPass).toBe(true);
  });

  test('VRF-06: one figure, VA method: the funding fee is not an up-front cost', () => {
    // ceil(net closing ÷ savings); the fee is only in the new payment.
    expect(r.monthsToRecover).toBe(Math.ceil(2500 / (pi(300000, 7, 25) - pi(301500, 6, 30))));
    // The old "consumer break-even" counted the fee twice: (1,500 + 2,500) ÷ savings = 13.
    expect(r.monthsToRecover).not.toBe(13);
    // Exempt: no fee in the payment either; still 8 months at the defaults.
    expect(calcVaRefinance({ ...D, feeStatus: 'comp' }).monthsToRecover).toBe(8);
  });

  test('VRF-03: full-term figures (audit: $636,101 vs $650,752 + $2,500 closing)', () => {
    expect(r.currentRemainingTotal).toBe(636101);
    expect(r.currentRemainingTotal).toBe(Math.round(pi(300000, 7, 25) * 300));
    expect(Math.round(r.newPayment * 360)).toBe(650752);
    expect(r.newLoanTotal).toBe(650752 + 2500);
    expect(r.fullTermDifference).toBe(17151);
    expect(r.extraYears).toBe(5);
    expect(r.sameTermPayment).toBeCloseTo(pi(301500, 6, 25), 6);
    expect(r.sameTermSavings).toBeCloseTo(pi(300000, 7, 25) - pi(301500, 6, 25), 6);
  });

  test('fee paid at closing is added to the full-term cost, not financed', () => {
    const atClosing = calcVaRefinance({ ...D, financeFee: false });
    expect(atClosing.newLoan).toBe(300000);
    expect(atClosing.newLoanTotal).toBe(Math.round(pi(300000, 6, 30) * 360) + 2500 + 1500);
  });
});

test.describe('VRF-01: cash-out amount', () => {
  test('$300,000 balance, $50,000 cash out, first use → fee $7,525, loan $357,525', () => {
    const r = calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000, firstUse: true });
    expect(r.feeBase).toBe(350000);
    expect(r.fundingFeeRate).toBe(0.0215);
    expect(r.fundingFeeAmount).toBe(7525);
    expect(r.newLoan).toBe(357525);
    expect(r.isCashOut).toBe(true);
  });

  test('after first use → 3.3% of balance + cash out', () => {
    const r = calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000, firstUse: false });
    expect(r.fundingFeeAmount).toBe(11550);
    expect(r.newLoan).toBe(361550);
  });

  test('cash out is ignored for an IRRRL', () => {
    const r = calcVaRefinance({ ...D, type: 'irrrl', cashOut: 50000 });
    expect(r.cashOut).toBe(0);
    expect(r.isCashOut).toBe(false);
    expect(r.newLoan).toBe(301500);
  });

  test('cash out > $0: the summary says § 3709(d) and gives no recovery months', () => {
    const r = calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000 });
    const text = bottomLineSentences(r).join(' ');
    expect(text).toContain('38 U.S.C. § 3709(d)');
    expect(text).toContain('including repaying the $50,000 cash out');
    expect(text).not.toMatch(/recovered through the lower payment in/);
  });

  test('cash out $0: same as an IRRRL-style refinance at the cash-out fee', () => {
    const r = calcVaRefinance({ ...D, type: 'cashout', cashOut: 0 });
    expect(r.isCashOut).toBe(false);
    expect(r.fundingFeeAmount).toBe(6450);
    expect(r.monthsToRecover).not.toBeNull();
  });
});

test.describe('VRF-04: rate test in basis points', () => {
  for (const [cur, next] of [[8.2, 7.7], [4.1, 3.6]] as const) {
    test(`${cur} → ${next} is 50 bps and passes`, () => {
      expect(cur - next).not.toBe(0.5); // the float that used to fail
      expect(rateDropBps(cur, next)).toBe(50);
      expect(calcVaRefinance({ ...D, currentRate: cur, newRate: next }).ratePass).toBe(true);
      expect(bpsLabel(rateDropBps(cur, next))).toBe('50 basis points (0.50 percentage points)');
    });
  }

  test('6.4 → 6.0 is 40 bps and fails; 6.5 → 6.0 passes', () => {
    expect(calcVaRefinance({ ...D, currentRate: 6.4, newRate: 6.0 }).ratePass).toBe(false);
    expect(calcVaRefinance({ ...D, currentRate: 6.5, newRate: 6.0 }).ratePass).toBe(true);
  });

  test('every one-decimal pair from 3% to 9% exactly 0.5 apart passes', () => {
    for (let t = 35; t <= 90; t++) {
      const cur = t / 10;
      const next = (t - 5) / 10;
      expect(rateDropBps(cur, next), `${cur} → ${next}`).toBe(50);
    }
  });
});

test.describe('VRF-05: seasoning shows a date', () => {
  test('first payment due 2026-04-16 → earliest closing 2026-11-12, in any time zone', () => {
    const saved = process.env.TZ;
    try {
      for (const tz of ['UTC', 'America/Chicago', 'America/Los_Angeles', 'Pacific/Pago_Pago', 'Pacific/Kiritimati', 'Asia/Tokyo']) {
        process.env.TZ = tz;
        const s = calcSeasoning('2026-04-16', { y: 2026, m: 11, d: 1 });
        expect(s, tz).not.toBeNull();
        expect(toIsoDate(s!.earliestClosing), tz).toBe('2026-11-12');
        expect(toIsoDate(s!.day210), tz).toBe('2026-11-12');
        expect(toIsoDate(s!.sixthPayment), tz).toBe('2026-09-16');
        // The viewer's calendar date: 6 pm Nov 11 local is still Nov 11.
        expect(localToday(new Date(2026, 10, 11, 18, 0))).toEqual({ y: 2026, m: 11, d: 11 });
      }
    } finally {
      process.env.TZ = saved;
    }
  });

  test('past / today / ahead by calendar date', () => {
    expect(calcSeasoning('2026-04-16', { y: 2026, m: 11, d: 11 })!.status).toBe('ahead');
    expect(calcSeasoning('2026-04-16', { y: 2026, m: 11, d: 12 })!.status).toBe('today');
    expect(calcSeasoning('2026-04-16', { y: 2026, m: 11, d: 13 })!.status).toBe('past');
  });

  test('the sixth payment never comes after day 210', () => {
    for (const iso of ['2026-01-31', '2026-08-31', '2027-02-28', '2028-02-29', '2026-12-31']) {
      const s = calcSeasoning(iso, { y: 2030, m: 1, d: 1 })!;
      expect(s.earliestClosing, iso).toEqual(s.day210);
    }
  });

  test('impossible or malformed dates → null', () => {
    for (const bad of ['2026-02-31', '2026-13-01', '2026-4-16', '', 'garbage']) {
      expect(parseIsoDate(bad), bad).toBeNull();
      expect(calcSeasoning(bad, { y: 2026, m: 11, d: 1 }), bad).toBeNull();
    }
  });
});

test.describe('Funding fee status', () => {
  test('seven statuses, same as the VA loan calculator', () => {
    expect(FEE_STATUSES.map((s) => s.value)).toEqual([...CHARGED.slice(0, 1), ...EXEMPT, 'pending']);
  });

  for (const status of EXEMPT) {
    test(`${status} → no fee on an IRRRL or a cash-out refinance`, () => {
      const irrrl = calcVaRefinance({ ...D, feeStatus: status });
      expect(irrrl.fundingFeeAmount).toBe(0);
      expect(irrrl.newLoan).toBe(300000);
      expect(irrrl.standardFeeAmount).toBe(1500);
      for (const firstUse of [true, false]) {
        const co = calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000, firstUse, feeStatus: status });
        expect(co.fundingFeeAmount).toBe(0);
        expect(co.standardFeeAmount).toBe(firstUse ? 7525 : 11550);
      }
    });
  }

  for (const status of CHARGED) {
    test(`${status} → fee charged`, () => {
      expect(calcVaRefinance({ ...D, feeStatus: status }).fundingFeeAmount).toBe(1500);
      expect(calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000, feeStatus: status }).fundingFeeAmount).toBe(7525);
    });
  }

  test('exempt=yes back-compat: yes → comp (no fee), no → none; fee= wins', () => {
    expect(parseFeeStatus(null, 'yes')).toBe('comp');
    expect(calcVaRefinance({ ...D, feeStatus: parseFeeStatus(null, 'yes') }).fundingFeeAmount).toBe(0);
    expect(parseFeeStatus(null, 'no')).toBe('none');
    expect(parseFeeStatus('none', 'yes')).toBe('none');
    expect(parseFeeStatus('pending', null)).toBe('pending');
  });
});

test.describe('Summary copy', () => {
  test('no verdicts in any mode', () => {
    const cases = [
      calcVaRefinance(D),
      calcVaRefinance({ ...D, currentRate: 6.2, closingCosts: 9000 }),
      calcVaRefinance({ ...D, newRate: 7.5 }),
      calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000 }),
      calcVaRefinance({ ...D, type: 'cashout', cashOut: 0 }),
    ];
    for (const r of cases) {
      const text = bottomLineSentences(r).join(' ');
      expect(text).not.toMatch(/favorable|you should|makes sense/i);
      expect(text).toContain('Compare quotes from multiple VA-approved lenders.');
    }
  });

  test('defaults: the numbers and VA results', () => {
    expect(bottomLineSentences(calcVaRefinance(D))).toEqual([
      'Your monthly principal and interest drops by $313, from $2,120 to $1,808.',
      'The $2,500 in net closing costs is recovered through the lower payment in 8 months.',
      "The rate drops 100 basis points (1.00 percentage points), so this meets VA's fixed-to-fixed rate test (at least 50 basis points lower). It meets VA's 36-month recoupment test.",
      'Paid to the end of its term, the new loan (payments plus net closing costs) totals $17,151 more than the remaining payments on your current loan. The new loan adds 5 years of payments.',
      'Your actual rate, fees and savings depend on the lender. Compare quotes from multiple VA-approved lenders.',
    ]);
  });
});
