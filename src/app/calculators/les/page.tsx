import type { Metadata } from 'next';
import Link from 'next/link';
import { ogImage } from '@/lib/og';
import { ExampleBox } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { GuidePromo } from '@/components/calculators/shared/GuidePromo';
import { LesCheckerCalculator } from '@/components/calculators/les/LesCheckerCalculator';
import { LesComparisonTable } from '@/components/calculators/les/LesComparisonTable';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema, faqPageSchema } from '@/lib/schema';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import { expectedBasePay, expectedBAS, compareLine } from '@/lib/calculations/lesCheck';
import { LES_EXAMPLE } from '@/data/les/scenarios';
import { formatCurrency } from '@/lib/utils';

const TITLE = 'LES Pay Checker 2026: Base Pay, BAH & BAS';
const DESCRIPTION =
  'Check the base pay, BAH, and BAS on your LES against official 2026 DFAS and DTMO rates. Four questions, three numbers, no upload — see what each line should be and what to do if it’s off.';
const LAST_REVIEWED = 'September 19, 2026';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/calculators/les' },
  openGraph: {
    title: `${TITLE} | MilPayTools`,
    description: DESCRIPTION,
    type: 'website',
    url: '/calculators/les',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'LES Pay Checker 2026', sub: 'Is your base pay, BAH, and BAS right? Check it against 2026 rates' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | MilPayTools`,
    description: DESCRIPTION,
    images: ogImage({ type: 'calculator', title: 'LES Pay Checker 2026', sub: 'Is your base pay, BAH, and BAS right? Check it against 2026 rates' }),
  },
};

export default function LesCheckerPage() {
  // ── Worked example, every figure computed from the data libraries ──────────
  // E-5 over 6 at Fort Bragg, recently married. The LES still pays BAH at the
  // without-dependents rate; base pay and BAS are correct.
  const ex = LES_EXAMPLE;
  const exMha = getMHACode(ex.zip);
  const exRatesW = exMha ? getMHARates(exMha, true) : null;
  const exRatesWO = exMha ? getMHARates(exMha, false) : null;
  const exBase = expectedBasePay(ex.grade, ex.yos);
  const exBas = expectedBAS(ex.grade);
  const exBahShould = (ex.hasDependents ? exRatesW : exRatesWO)?.[ex.grade] ?? null;
  const exBahOnLes = (ex.lesBahHasDependents ? exRatesW : exRatesWO)?.[ex.grade] ?? null;
  const exRows = [
    compareLine('basePay', exBase, exBase),
    compareLine('bah', exBahOnLes, exBahShould),
    compareLine('bas', exBas, exBas),
  ];
  const exBahRow = exRows[1];
  const exMonthlyGap = Math.abs(exBahRow.diff ?? 0);
  const exAnnualGap = Math.abs(exBahRow.annualDiff ?? 0);

  // ── FAQ: single source for the visible list and the FAQPage schema ─────────
  const faqs: { question: string; answer: string }[] = [
    {
      question: 'How do I read my LES?',
      answer:
        'Your Leave and Earnings Statement (LES) is your monthly military pay statement, available in myPay. The Entitlements column lists what you earned (base pay, BAH, BAS, special pays); Deductions lists taxes, SGLI, and TSP; Allotments lists transfers you set up. Net pay is entitlements minus deductions and allotments. To check whether you are paid correctly, compare the Entitlements lines against the official rate for your grade, years of service, duty station, and dependency status.',
    },
    {
      question: 'What do BASE PAY, BAH, and BAS mean on my LES?',
      answer:
        'BASE PAY is your taxable basic pay, set by pay grade and years of service in the DFAS pay table. BAH (Basic Allowance for Housing) is a generally non-taxable housing allowance set by duty station ZIP, pay grade, and dependency status. BAS (Basic Allowance for Subsistence) is a generally non-taxable food allowance — one flat rate for enlisted members and one for officers.',
    },
    {
      question: 'What should I do if the BAH on my LES is wrong?',
      answer:
        'First rule out the legitimate reasons: BAH rate protection (you keep a higher prior-year rate if your area’s rate dropped and nothing about your grade, station, or dependents changed), a partial month after a move or promotion, government housing, or dual military rules. If none apply, consider contacting your servicing Finance Office — you can also file a pay inquiry through myPay. If the cause is your dependency status or duty station on record, your MPF or S1/G1 corrects the record, and the pay follows.',
    },
    {
      question: 'Why is my BAH higher than the 2026 rate?',
      answer:
        'Most often it is BAH rate protection. When an area’s BAH rate goes down on January 1, members already assigned there keep the higher rate as long as their pay grade, duty station, and dependency status do not change. A promotion, PCS, or dependency change resets you to the current rate.',
    },
    {
      question: 'How far back can I claim underpaid military pay?',
      answer:
        'Claims for underpaid military pay are generally subject to a six-year limitation under 31 U.S.C. § 3702, so an error from a prior year may still be claimable. This is general information, not legal advice — your Finance Office can explain how a back-pay claim works for your situation.',
    },
    {
      question: 'Does this LES checker store or upload my pay information?',
      answer:
        'No. There is no upload and no account. The dollar figures you type are compared in your browser and never sent or stored. Only your duty station is looked up against the 2026 BAH rate table, the same way the BAH calculator works.',
    },
  ];

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'LES Pay Checker 2026', description: DESCRIPTION, url: '/calculators/les' })} />
      <JsonLdScript schema={faqPageSchema(faqs)} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Upload &middot; Nothing Stored &middot; Official 2026 DoD Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Check Your LES: Is Your Base Pay, BAH &amp; BAS Right?
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Enter your grade, years of service, duty station, and dependents, then the three amounts from your LES.
            See what each line should be under the official 2026 rates — and what to do if one is off.
          </p>
        </div>
        <CalcStepStrip noBg steps={[
          { title: 'Tell us your grade, years, station, and dependents' },
          { title: 'Type base pay, BAH, and BAS from your LES' },
          { title: 'See what matches — and who to call if not' },
        ]} />
      </section>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <LesCheckerCalculator />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-10">
        {/* ── What this can't check ─────────────────────────────────── */}
        <section data-testid="les-cant-check" className="rounded-xl border border-zinc-300 bg-zinc-50 p-5">
          <h2 className="text-xl font-bold text-zinc-900 mb-3">What this can’t check</h2>
          <p className="text-sm text-zinc-600 mb-3">
            This tool checks three lines against the published monthly rates. A difference on any of these is not an error,
            and the tool can’t see it:
          </p>
          <ul className="space-y-2 text-sm text-zinc-700 list-disc pl-5">
            <li><strong>BAH rate protection</strong> — a higher prior-year rate you keep after your area’s rate drops.</li>
            <li><strong>Partial months</strong> — a mid-month PCS, promotion, arrival, or separation prorates every line.</li>
            <li><strong>Government quarters or barracks</strong> — no full BAH; some single members see a small partial-rate BAH line.</li>
            <li>
              <strong>Dual military couples</strong> — only one member draws the with-dependents rate. Use the{' '}
              <Link href="/calculators/dual-military-bah" className="text-red-700 underline">Dual Military BAH Calculator</Link>.
            </li>
            <li><strong>Overseas stations</strong> — Overseas Housing Allowance (OHA) and overseas COLA aren’t covered.</li>
            <li>
              <strong>Everything below the entitlements</strong> — tax withholding elections, allotments, debts, advance pay,
              garnishments, bonuses, special and incentive pays, and leave sell-back.
            </li>
          </ul>
        </section>

        {/* ── Worked example ─────────────────────────────────────────── */}
        <section className="calc-example" data-testid="les-example">
          <ExampleBox>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              Example: An E-5 at Fort Bragg Whose BAH Didn’t Change After Marriage
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Scenario: an E-5 over 6 years at {ex.stationName} (ZIP {ex.zip}), married two months ago. Base pay and BAS on the
              LES are correct, but BAH is still paid at the without-dependents rate. 2026 rates.
            </p>
            <LesComparisonTable rows={exRows} mode="confirmed" caption="Example check — 2026 rates" />
            <p className="text-sm leading-relaxed text-zinc-700 mt-4">
              <strong>What this means:</strong> the LES shows {formatCurrency(exMonthlyGap, true)} a month less BAH than the
              with-dependents rate at Fort Bragg — {formatCurrency(exAnnualGap, true)} over a year. The usual cause is a
              dependency status that hasn’t caught up with the marriage in the pay record. Updating DEERS and bringing the
              marriage certificate to the personnel office (MPF or S1) is the typical fix, after which Finance can review
              back pay.
            </p>
          </ExampleBox>
        </section>

        {/* ── What each line is ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">What each line on your LES is</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h3 className="font-semibold text-zinc-900 mb-1.5">Base pay</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Taxable pay set by pay grade and years of service, counted from your Pay Entry Base Date (PEBD). It rises at
                each step in the{' '}
                <Link href="/pay" className="text-red-700 underline">2026 pay table</Link> and with each promotion.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h3 className="font-semibold text-zinc-900 mb-1.5">BAH</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Basic Allowance for Housing — generally non-taxable, set by your duty station’s Military Housing Area, pay
                grade, and whether you have dependents. Look up any station on the{' '}
                <Link href="/bah" className="text-red-700 underline">BAH calculator</Link>.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h3 className="font-semibold text-zinc-900 mb-1.5">BAS</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Basic Allowance for Subsistence — a generally non-taxable food allowance. One flat monthly rate for enlisted
                members, a lower one for officers; it doesn’t change with grade or location.
              </p>
            </div>
          </div>
        </section>

        {/* ── Common LES errors ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Common LES errors</h2>
          <div className="space-y-4">
            {[
              {
                h: 'BAH not updated after a PCS, promotion, or dependency change',
                p: 'BAH should switch to the new station’s rate after a PCS, to the new grade’s rate after a promotion, and to the with- or without-dependents rate after a status change. When the update lags, the old rate keeps paying.',
              },
              {
                h: 'BAS stopped during field time or deployment — and not restarted',
                p: 'BAS can stop or change when government meals are provided. Check that it comes back once you return.',
              },
              {
                h: 'Dependency status out of date',
                p: 'Marriage, divorce, or a new child changes your BAH rate, but only after DEERS and your personnel record are updated. Until then, the LES pays the old rate.',
              },
              {
                h: 'State tax withheld for the wrong state',
                p: 'State income tax follows your state of legal residence, shown in the tax section of your LES — not your duty station. If it’s wrong, consider asking Finance about the DD Form 2058.',
              },
            ].map((e) => (
              <div key={e.h} className="rounded-lg border border-zinc-200 bg-white p-4">
                <h3 className="font-semibold text-zinc-900 mb-1">{e.h}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{e.p}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-600 mt-4">
            For a line-by-line walkthrough of the whole statement, see{' '}
            <Link href="/blog/how-to-read-your-les" className="text-red-700 underline">How to Read Your LES</Link>.
          </p>
        </section>

        {/* ── Where to go next ──────────────────────────────────────── */}
        <section className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Related tools</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/calculators/total-compensation" className="font-medium text-blue-800 hover:underline">Total Compensation Calculator →</Link> <span className="text-blue-700">what the full package is worth</span></li>
            <li><Link href="/bah" className="font-medium text-blue-800 hover:underline">BAH Calculator →</Link> <span className="text-blue-700">rates for any duty station</span></li>
            <li><Link href="/calculators/dual-military-bah" className="font-medium text-blue-800 hover:underline">Dual Military BAH Calculator →</Link> <span className="text-blue-700">when both spouses serve</span></li>
          </ul>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5">Frequently asked questions</h2>
          <div className="space-y-5">
            {faqs.map((f, i) => (
              <div key={f.question} className={i > 0 ? 'border-t border-zinc-100 pt-5' : ''}>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{f.question}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <GuidePromo
          guides={[
            { slug: 'military-pay', title: 'Military Pay & Compensation Guide' },
            { slug: 'pcs', title: 'PCS & Duty Station Financial Guide' },
          ]}
        />

        {/* ── Sources + last reviewed ───────────────────────────────── */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          Sources:{' '}
          <a href="https://militarypay.defense.gov/Pay/Military-Pay-Charts/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
            DFAS 2026 military pay tables
          </a>{' '}
          (effective January 1, 2026);{' '}
          <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
            DTMO 2026 BAH rates
          </a>
          ;{' '}
          <a href="https://militarypay.defense.gov/Pay/Allowances/bas/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
            2026 BAS rates
          </a>
          . Last reviewed: {LAST_REVIEWED}.
        </p>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            This tool compares figures you enter against official 2026 DoD rate tables for educational purposes only. It
            can’t see your pay record, and a difference is not proof of an error. Your servicing Finance Office is the
            authority on your pay. This tool is not affiliated with the Department of Defense or any government agency.
          </p>
        </div>
      </div>
    </>
  );
}
