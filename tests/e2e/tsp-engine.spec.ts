/**
 * Unit-style tests for projectTSP() — no browser, pure engine assertions.
 *
 * These run in Node.js inside the Playwright test runner. No page fixture
 * is used; the browser is never launched for these tests.
 *
 * Gap (a) coverage: asserts that the two-phase gate in the engine correctly
 * stops member contributions and BRS gov match at the separation boundary,
 * and that the balance keeps compounding after separation.
 */

import { test, expect } from '@playwright/test';
import { projectTSP, getBasePayMonthly } from '@/lib/calculations/tspGrowth';
import { SAMPLE_BAR_SCENARIO } from './tspTestFixtures';

// Convenience: run the default 14-year in-service / 25-year growth scenario.
function runDefault() {
  return projectTSP(SAMPLE_BAR_SCENARIO);
}

test.describe('projectTSP() two-phase engine', () => {

  test('member contributions are strictly increasing through year 14, then exactly flat', () => {
    const { snapshots } = runDefault();

    // Phase 1: each annual snapshot shows MORE member contributions than the one before
    for (let y = 1; y <= 14; y++) {
      expect(snapshots[y].memberContributionsTotal).toBeGreaterThan(
        snapshots[y - 1].memberContributionsTotal
      );
    }

    // Phase 2: cumulative member total freezes at the year-14 value
    const cumAtSeparation = snapshots[14].memberContributionsTotal;
    for (let y = 15; y <= 39; y++) {
      expect(snapshots[y].memberContributionsTotal).toBe(cumAtSeparation);
    }
  });

  test('gov contributions (BRS match) are strictly increasing through year 14, then exactly flat', () => {
    const { snapshots } = runDefault();

    for (let y = 1; y <= 14; y++) {
      expect(snapshots[y].govContributionsTotal).toBeGreaterThan(
        snapshots[y - 1].govContributionsTotal
      );
    }

    const cumGovAtSeparation = snapshots[14].govContributionsTotal;
    for (let y = 15; y <= 39; y++) {
      expect(snapshots[y].govContributionsTotal).toBe(cumGovAtSeparation);
    }
  });

  test('total balance strictly increases through all 39 years (growth continues post-separation)', () => {
    const { snapshots } = runDefault();

    for (let y = 1; y <= 39; y++) {
      expect(snapshots[y].totalBalance).toBeGreaterThan(snapshots[y - 1].totalBalance);
    }
  });

  test('result.totalGovContributions equals the cumulative gov total at year 14 only', () => {
    const result = runDefault();

    // No gov contributions are added after separation, so the running total
    // in the snapshot at year 14 must equal the final reported total.
    expect(result.totalGovContributions).toBe(result.snapshots[14].govContributionsTotal);

    // Sanity: the year-39 snapshot agrees with the result field
    expect(result.snapshots[39].govContributionsTotal).toBe(result.totalGovContributions);
  });

  test('contrast: moreYearsToServe=39 (full horizon) produces materially higher finalBalance and totalGovContributions', () => {
    const gated = runDefault(); // 14-year in-service phase
    const full = projectTSP({ ...SAMPLE_BAR_SCENARIO, moreYearsToServe: 39 }); // contributions the full 39 years

    expect(full.finalBalance).toBeGreaterThan(gated.finalBalance);
    expect(full.totalGovContributions).toBeGreaterThan(gated.totalGovContributions);

    // "Materially higher" — the 25 extra years of member contributions (plus 6 more years
    // of government money, through 26 YOS) make the full-horizon balance at least 40%
    // larger. Was > 1.5 while government money (wrongly) ran to 45 YOS; now 1.48.
    expect(full.finalBalance / gated.finalBalance).toBeGreaterThan(1.4);

    // RET-09: government contributions end after 26 years of service. The scenario
    // starts at 6 YOS, so government money runs only through projection year 20.
    expect(full.snapshots[20].govContributionsTotal).toBe(full.totalGovContributions);
    expect(full.snapshots[21].annualGovContrib).toBe(0);
    expect(full.snapshots[21].annualMemberContrib).toBeGreaterThan(0);
  });

});

// TC-01: automatic 1% after 60 days (service month 3), match after 2 years (month 25).
test.describe('projectTSP() BRS timing', () => {
  const e1 = getBasePayMonthly('E-1', 0);
  const run = () =>
    projectTSP({
      startingBalance: 0,
      monthlyContribution: e1 * 0.05,
      retirementSystem: 'brs',
      payGrade: 'E-1',
      yearsOfService: 0,
      allocation: { G: 100, F: 0, C: 0, S: 0, I: 0 },
      yearsToProject: 3,
      annualPayRaisePct: 0,
      moreYearsToServe: 3,
    });

  test('E-1, 0 YOS, 5%: year 1 = 10 months of the 1% only (was $1,444.32 with the match)', () => {
    expect(run().snapshots[1].annualGovContrib).toBeCloseTo(e1 * 0.01 * 10, 2);
  });

  test('no match in months 1–24; full 5% from month 25', () => {
    const { snapshots } = run();
    expect(snapshots[2].annualGovContrib).toBeCloseTo(e1 * 0.01 * 12, 2);
    expect(snapshots[3].annualGovContrib).toBeCloseTo(e1 * 0.05 * 12, 2);
  });
});
