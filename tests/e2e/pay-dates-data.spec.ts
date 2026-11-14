/**
 * /pay/dates data — no browser or server. Run via `npm run test:pay-dates`.
 *
 * - Proof: the payday rule reproduces DFAS's official 2026 active-duty table, 24/24.
 * - Golden: the computed 2027 active-duty and VA dates equal the lists in
 *   docs/sources/paydays-2027.md, typed here as literals (not lib output).
 * - The typed DFAS tables equal the tables in the source doc.
 * - The retiree COLA timing fix (first in the December 2026 retired pay, paid Dec 31, 2026).
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import {
  OPM_HOLIDAYS,
  OPM_HOLIDAYS_2026,
  OPM_HOLIDAYS_2027,
  DFAS_ACTIVE_DUTY_2026,
  DFAS_RETIRED_PAY,
  PENDING_JAN_2028_TEXT,
} from '@/data/paydays/2027';
import { activeDutyPaydays, vaPaymentDate, addDays } from '@/lib/calculations/paydays';
import {
  paydays2027,
  vaPayments2027,
  restOf2026,
  payDatesFaqs,
  answerLines,
  activeDutyLabel,
  retireeColaLine,
  vaColaLine,
  widgetPaydays,
  PAY_DATES_TITLE,
  PAY_DATES_DESCRIPTION,
  GUARD_RESERVE_TEXT,
} from '@/lib/pay-dates/content';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { retireeColaFaq } from '@/lib/calculations/payRaise';
import { getCalendar2027 } from '@/data/calendar-2027';

const ROOT = path.resolve(__dirname, '..', '..');
const DOC = readFileSync(path.join(ROOT, 'docs', 'sources', 'paydays-2027.md'), 'utf8');

const MON: Record<string, string> = {
  Jan: '01', January: '01', Feb: '02', February: '02', Mar: '03', March: '03', Apr: '04', April: '04',
  May: '05', June: '06', Jun: '06', July: '07', Jul: '07', Aug: '08', August: '08', Sep: '09', Sept: '09',
  September: '09', Oct: '10', October: '10', Nov: '11', November: '11', Dec: '12', December: '12',
};

/** "Jan. 15" + year → ISO; a month earlier than the row's period rolls to the next year. */
function docDate(s: string, year: number): string {
  const m = s.trim().match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?$/);
  if (!m) throw new Error(`bad doc date: ${s}`);
  return `${m[3] ?? year}-${MON[m[1]]}-${m[2].padStart(2, '0')}`;
}

/** Table rows (cells) under the first markdown table after `heading`. */
function docTable(heading: string): string[][] {
  const start = DOC.indexOf(heading);
  expect(start, `heading in doc: ${heading}`).toBeGreaterThan(-1);
  const lines = DOC.slice(start).split(/\r?\n/);
  const rows: string[][] = [];
  let inTable = false;
  for (const l of lines) {
    if (l.startsWith('|')) {
      inTable = true;
      if (/^\|[-| ]+\|$/.test(l)) continue;
      rows.push(l.split('|').slice(1, -1).map((c) => c.trim()));
    } else if (inTable) break;
  }
  return rows.slice(1); // drop header
}

test.describe('source doc parity', () => {
  test('DFAS 2026 active-duty table = doc (12 rows, 48 dates)', () => {
    const rows = docTable('## DFAS 2026 Active Duty Paydays');
    console.log(`doc rows: ${rows.length}  data rows: ${DFAS_ACTIVE_DUTY_2026.length}`);
    expect(rows).toHaveLength(12);
    rows.forEach((r, i) => {
      const d = DFAS_ACTIVE_DUTY_2026[i];
      const end = docDate(r[3], 2026);
      expect(d.period).toBe(`2026-${MON[r[0]]}`);
      expect(d.midMonth).toBe(docDate(r[1], 2026));
      expect(d.midMonthLes).toBe(docDate(r[2], 2026));
      expect(d.endOfMonth).toBe(end);
      expect(d.endOfMonthLes).toBe(docDate(r[4], 2026));
    });
  });

  test('DFAS retired/annuitant table = doc (Oct 2026–Dec 2027, 15 rows)', () => {
    const rows = docTable('## DFAS retired and annuitant pay schedule');
    console.log(`doc rows: ${rows.length}  data rows: ${DFAS_RETIRED_PAY.length}`);
    expect(rows).toHaveLength(15);
    rows.forEach((r, i) => {
      const [mName, y] = r[0].split(' ');
      const d = DFAS_RETIRED_PAY[i];
      expect(d.month).toBe(`${y}-${MON[mName]}`);
      expect(d.retired).toBe(docDate(r[1], 0));
      expect(d.annuitant).toBe(docDate(r[2], 0));
    });
  });

  test('OPM holidays = doc lines (2026: 11, 2027: 11), weekday labels match', () => {
    const line27 = DOC.split(/\r?\n/).find((l) => l.startsWith('2027 (as listed by OPM)'))!;
    const line26 = DOC.split(/\r?\n/).find((l) => l.startsWith('2026 (for the proof test)'))!;
    const wd = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });
    const label = (iso: string) => {
      const d = new Date(`${iso}T00:00:00Z`);
      return `${wd(iso)} ${d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' })} ${d.getUTCDate()}`;
    };
    expect(OPM_HOLIDAYS_2026).toHaveLength(11);
    expect(OPM_HOLIDAYS_2027).toHaveLength(11);
    for (const h of OPM_HOLIDAYS_2027) expect(line27, h.date).toContain(`${label(h.date)} ${h.name}`);
    for (const h of OPM_HOLIDAYS_2026) expect(line26, h.date).toContain(label(h.date));
  });
});

test.describe('payday rule', () => {
  test('PROOF: rule + OPM holidays reproduces DFAS 2026 active-duty table, 24/24', () => {
    // The Dec 2026 end-of-month payday is scheduled Jan 1, 2027, so the rule needs
    // OPM's 2027 list too (New Year's Day 2027) — exactly as DFAS did.
    const computed = activeDutyPaydays(2026, [...OPM_HOLIDAYS_2026, ...OPM_HOLIDAYS_2027]);
    const official = DFAS_ACTIVE_DUTY_2026.flatMap((r) => [r.midMonth, r.endOfMonth]);
    console.log(`computed: ${computed.length}  official: ${official.length}`);
    expect(computed).toHaveLength(24);
    expect(official).toHaveLength(24);
    let match = 0;
    computed.forEach((p, i) => {
      expect(p.paid, `${p.period} ${p.half}`).toBe(official[i]);
      if (p.paid === official[i]) match++;
    });
    expect(match).toBe(24);
  });

  test('GOLDEN: 2027 active-duty paydays (23 computed + the pending Jan 1, 2028 payday)', () => {
    const golden: [string, string | null][] = [
      ['2027-01-15', '2027-02-01'],
      ['2027-02-12', '2027-03-01'],
      ['2027-03-15', '2027-04-01'],
      ['2027-04-15', '2027-04-30'],
      ['2027-05-14', '2027-06-01'],
      ['2027-06-15', '2027-07-01'],
      ['2027-07-15', '2027-07-30'],
      ['2027-08-13', '2027-09-01'],
      ['2027-09-15', '2027-10-01'],
      ['2027-10-15', '2027-11-01'],
      ['2027-11-15', '2027-12-01'],
      ['2027-12-15', null],
    ];
    const got = paydays2027();
    expect(got).toHaveLength(24);
    expect(got.map((p) => p.paid)).toEqual(golden.flat());
    const pending = got.filter((p) => p.status === 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({ period: '2027-12', half: 'end', scheduled: '2028-01-01', paid: null });
  });

  test('"why it moved" notes for 2027 match the doc', () => {
    const moved = paydays2027().filter((p) => p.paid && p.paid !== p.scheduled).map((p) => [p.paid, p.reason]);
    expect(moved).toEqual([
      ['2027-02-12', "Feb 15 is Washington's Birthday"],
      ['2027-04-30', 'May 1 is a Saturday'],
      ['2027-05-14', 'May 15 is a Saturday'],
      ['2027-07-30', 'Aug 1 is a Sunday'],
      ['2027-08-13', 'Aug 15 is a Sunday'],
    ]);
    for (const p of paydays2027().filter((x) => x.paid === x.scheduled)) expect(p.reason).toBeNull();
  });

  test('FMR 010702: never more than 3 days before the scheduled payday, never after', () => {
    for (const p of [...activeDutyPaydays(2026, OPM_HOLIDAYS), ...paydays2027()]) {
      if (!p.paid) continue;
      expect(p.paid <= p.scheduled, p.scheduled).toBe(true);
      expect(p.paid >= addDays(p.scheduled, -3), p.scheduled).toBe(true);
    }
  });

  test('GOLDEN: VA payment dates (Dec 2026–Dec 2027) = doc; match DFAS retired pay dates', () => {
    const golden = [
      '2026-12-31', '2027-02-01', '2027-03-01', '2027-04-01', '2027-04-30', '2027-06-01', '2027-07-01',
      '2027-07-30', '2027-09-01', '2027-10-01', '2027-11-01', '2027-12-01', '2027-12-31',
    ];
    const va = vaPayments2027();
    expect(va.map((v) => v.paid)).toEqual(golden);
    for (const v of va) {
      const r = DFAS_RETIRED_PAY.find((x) => x.month === v.benefitMonth)!;
      expect(r.retired, v.benefitMonth).toBe(v.paid);
    }
    expect(vaPaymentDate('2026-12').reason).toBe("Jan 1 is New Year's Day");
    expect(vaPaymentDate('2027-12').reason).toBe('Jan 1 is a Saturday');
  });

  test('VA: a weekday 1st in a year without holiday data throws instead of guessing', () => {
    expect(() => vaPaymentDate('2028-01', OPM_HOLIDAYS)).toThrow(); // Feb 1, 2028 is a Tuesday
  });
});

test.describe('page content', () => {
  test('rest of 2026: official DFAS rows with LES dates (Nov 13, Dec 1, Dec 15, Dec 31)', () => {
    expect(restOf2026().map((r) => [r.paid, r.les])).toEqual([
      ['2026-11-13', '2026-11-07'],
      ['2026-12-01', '2026-11-24'],
      ['2026-12-15', '2026-12-10'],
      ['2026-12-31', '2026-12-24'],
    ]);
  });

  test('pending row text: no 2021 precedent; widget pending text', () => {
    expect(PENDING_JAN_2028_TEXT).toBe(
      "Not yet published. January 1, 2028 is a Saturday and OPM treats Friday, December 31, 2027 as the New Year's holiday for federal employees, so DFAS will pay either Thursday, December 30 or Friday, December 31.",
    );
    expect(PENDING_JAN_2028_TEXT).not.toContain('2021');
    const last = widgetPaydays().at(-1)!;
    expect(last).toMatchObject({ paid: null, pendingText: "late December 2027 (DFAS hasn't published the exact date)" });
  });

  test('top answer, labels and COLA lines', () => {
    expect(answerLines()).toEqual([
      'Active duty is paid on the 1st and 15th, moved to the workday before when that day is a weekend or federal holiday.',
      'The December 31, 2026 payday is still at 2026 rates; Friday, January 15, 2027 is the first payday at 2027 rates.',
      'Retired pay and VA compensation are paid once a month, for the month before.',
    ]);
    expect(activeDutyLabel()).toBe(
      "DFAS hasn't posted its 2027 active-duty payday table (checked November 13, 2026). These dates apply the DoD payday rule (FMR Vol. 7A, ch. 1, 010701–010702) to OPM's 2027 federal holidays. The same rule reproduces DFAS's 2026 table exactly.",
    );
    expect(retireeColaLine()).toBe(
      'The 3.6% retiree COLA (effective December 1, 2026) first appears in the December 2026 retired pay, paid December 31, 2026 (annuitants: January 4, 2027).',
    );
    const vaStatus = getCalendar2027().find((e) => e.id === 'va-cola')!.status;
    if (vaStatus === 'pending') {
      expect(vaColaLine()).toBe(
        "VA's 2027 rates (the Social Security COLA, 3.6%) apply once Congress passes the annual VA COLA law and VA publishes its rate tables.",
      );
    }
  });

  test('title ≤60 with suffix; description ≤155; no figures beyond dates', () => {
    expect(`${PAY_DATES_TITLE} | MilPayTools`).toBe('Military Pay Dates 2027: Active Duty & Retiree | MilPayTools');
    expect(`${PAY_DATES_TITLE} | MilPayTools`.length).toBeLessThanOrEqual(60);
    expect(PAY_DATES_DESCRIPTION.length).toBeLessThanOrEqual(155);
    expect(PAY_DATES_DESCRIPTION).not.toMatch(/[$%]/);
  });

  test('FAQ: six questions in order; no dollar figures, bank names, LES dates or advice', () => {
    const faqs = payDatesFaqs();
    expect(faqs.map((f) => f.question)).toEqual([
      'When does the military get paid in 2027?',
      'When is the first paycheck with the 2027 raise?',
      'Why is there a payday on December 31?',
      'When do military retirees get the 2027 COLA?',
      'When is VA disability paid in 2027?',
      'Do Guard and Reserve members get paid on the same days?',
    ]);
    const all = [...faqs.map((f) => f.answer), GUARD_RESERVE_TEXT].join(' ');
    expect(all).not.toContain('$');
    expect(all).not.toMatch(/\bLES\b|early deposit|USAA|Navy Federal|PenFed|Armed Forces Bank|bank/i);
    expect(all).not.toMatch(/you should|we recommend|3.?5 days/i);
    expect(faqs[0].answer).toContain(
      "February 12 (Feb 15 is Washington's Birthday), April 30 (May 1 is a Saturday), May 14 (May 15 is a Saturday), July 30 (Aug 1 is a Sunday) and August 13 (Aug 15 is a Sunday)",
    );
    expect(faqs[3].answer).toContain('paid December 31, 2026 (SBP annuitants: January 4, 2027)');
    expect(faqs[4].answer).toContain(
      'December 2026 on December 31, 2026, April 2027 on April 30, 2027, July 2027 on July 30, 2027 and December 2027 on December 31, 2027',
    );
  });
});

test.describe('retiree COLA timing fix', () => {
  test('first-payment dates equal DFAS retired/annuitant dates for the effective month', () => {
    const month = RETIREE_COLA_2027.effectiveDate.slice(0, 7);
    const row = DFAS_RETIRED_PAY.find((r) => r.month === month)!;
    expect(RETIREE_COLA_2027.firstRetiredPayDate).toBe(row.retired);
    expect(RETIREE_COLA_2027.firstAnnuitantPayDate).toBe(row.annuitant);
  });

  test('FAQ + calendar row carry the corrected wording', () => {
    const sentence =
      'It takes effect December 1, 2026 and first appears in the December 2026 retired pay, paid December 31, 2026 (SBP annuitants: January 4, 2027).';
    expect(retireeColaFaq().answer).toContain(sentence);
    const row = getCalendar2027().find((e) => e.id === 'retiree-cola')!;
    expect(row.dateLabel).toBe('Tuesday, December 1, 2026 (first in the December 31, 2026 retired pay)');
    expect(row.body).toContain(sentence);
    expect(`${row.dateLabel} ${row.body}`).not.toMatch(/first paid/i);
  });

  test('no "first paid … January 2027" for military retirees anywhere in src/ or public/', () => {
    const git = (args: string[]) => {
      try {
        return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
      } catch (e) {
        const err = e as { status?: number; stdout?: string };
        if (err.status === 1) return ''; // no matches
        throw e;
      }
    };
    // --untracked: also search files not yet committed (a new page on a branch).
    const control = git(['grep', '--untracked', '-n', 'RETIREE_COLA_2027', '--', 'src']).trim().split('\n').filter(Boolean);
    console.log(`control hits: ${control.length}`);
    expect(control.length).toBeGreaterThan(0);
    const hits = git(['grep', '--untracked', '-niE', 'first paid (in )?(the )?january|firstPaidMonth', '--', 'src', 'public']).trim();
    expect(hits).toBe('');
  });
});
