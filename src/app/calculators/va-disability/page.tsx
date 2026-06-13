import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { VADisabilityCalculator } from '@/components/calculators/va-disability/VADisabilityCalculator';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema, faqPageSchema } from '@/lib/schema';
import { calculateCombinedRating, getCompensation } from '@/lib/calculations/va-disability';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: 'VA Disability Rating Calculator 2026 | Combined Rating' },
  description:
    'Calculate your combined VA disability rating and 2026 monthly compensation — every step shown, bilateral factor automatic.',
  alternates: {
    canonical: '/calculators/va-disability',
  },
  openGraph: {
    title: 'VA Disability Rating Calculator 2026 | Combined Rating',
    description:
      'Calculate your combined VA disability rating and 2026 monthly compensation — every step shown, bilateral factor automatic.',
    type: 'website',
    url: '/calculators/va-disability',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'VA Disability Rating Calculator 2026', sub: 'See your combined rating with step-by-step VA math' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VA Disability Rating Calculator 2026 | Combined Rating',
    description:
      'Calculate your combined VA disability rating and 2026 monthly compensation — every step shown, bilateral factor automatic.',
    images: ogImage({ type: 'calculator', title: 'VA Disability Rating Calculator 2026', sub: 'See your combined rating with step-by-step VA math' }),
  },
};

export default function VADisabilityPage() {
  // ── Worked-example values, computed server-side from the VA combined-rating lib ──
  // Scenario (matches the narrative below): 50% lumbar spine (non-bilateral) plus a
  // bilateral knee pair (30% left, 20% right), veteran alone (no dependents).
  const exRating = calculateCombinedRating([
    { id: 'back', rating: 50, label: 'lumbar spine', side: 'none', pairKey: null },
    { id: 'left-knee', rating: 30, label: 'left knee', side: 'left', pairKey: 'leg' },
    { id: 'right-knee', rating: 20, label: 'right knee', side: 'right', pairKey: 'leg' },
  ]);
  const exComp = getCompensation(exRating.rounded, {
    hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
  });
  const exPair = exRating.bilateralPairs[0];
  const exRemAfterBilateral = 100 - exPair.combinedAfterFactor; // capacity left after the knees
  const exBackReduction = exRemAfterBilateral * 0.5; // 50% back applied to that remainder

  // ── 2026 reference rate table — every figure read from the same lib/data the
  //    calculator uses (getCompensation → vaRates 2026). No hand-keyed dollars. ──
  const aloneDeps = { hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0 };
  const spouseDeps = { hasSpouse: true, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0 };
  const spouseChildDeps = { hasSpouse: true, childrenUnder18: 1, schoolChildren: 0, dependentParents: 0 };
  const rateRows = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((rating) => ({
    rating,
    alone: getCompensation(rating, aloneDeps).monthly,
    spouse: getCompensation(rating, spouseDeps).monthly,
    spouseChild: getCompensation(rating, spouseChildDeps).monthly,
  }));
  const comp70Alone = getCompensation(70, aloneDeps).monthly;

  // ── FAQ: single source for both the visible list and the FAQPage schema.
  //    Dollar figures (Q4) are lib-rendered; the combined-rating arithmetic is
  //    fixed algorithm text. ──
  const faqs: { question: string; answer: string }[] = [
    {
      question: "Why doesn't 50% + 30% equal 80%?",
      answer:
        'VA disability ratings are never added together. The VA uses a "whole person" formula (38 CFR § 4.25): you start at 100% healthy, and each rating applies only to the capacity that remains. A 50% rating leaves 50% efficiency; a 30% rating then reduces that remaining 50% by 15 points, for a combined value of 65%. The VA rounds the final combined value to the nearest 10%, so 50% and 30% combine to a 70% rating — not 80%.',
    },
    {
      question: 'How does the VA combined rating work?',
      answer:
        'The VA lists your ratings highest to lowest, then combines them one at a time using the 38 CFR § 4.25 table. Each rating applies to your remaining healthy capacity rather than the original 100%, so each additional condition adds less than its face value. After combining every condition — and adding the bilateral factor where it applies — the VA rounds the final value once to the nearest 10%. It never rounds between steps.',
    },
    {
      question: 'What is the bilateral factor?',
      answer:
        'The bilateral factor (38 CFR § 4.26) is a 10% bonus the VA adds when you have compensable disabilities on both sides of a paired body part — both arms or both legs. The two sides are combined first, then 10% of that combined value is added before the result is folded into your overall rating. It applies only when both sides carry a rating above 0%, and it does not apply to vision or hearing, which are rated under separate rules (38 CFR §§ 4.75–4.79).',
    },
    {
      question: 'How much is 70% VA disability in 2026?',
      answer: `In 2026, a 70% VA disability rating pays ${formatCurrency(comp70Alone, true)}/month for a veteran with no dependents (effective December 1, 2025, after the 2.8% COLA). Veterans rated 30% or higher receive more when they have a spouse, children, or dependent parents. VA disability compensation is not subject to federal income tax.`,
    },
    {
      question: 'Are VA disability benefits taxable?',
      answer:
        'No. VA disability compensation is not subject to federal income tax and is not reported as income on your federal return. This is different from military retired pay, which is normally taxable. State treatment can vary, but most states do not tax VA disability compensation.',
    },
    {
      question: 'Can my combined rating change if I add a condition?',
      answer:
        'Yes. A new service-connected condition combines with your existing ratings through the same § 4.25 table, so your combined value can rise — though by less than the new condition’s face value, because it applies only to your remaining capacity. A small change near a rounding threshold can move you to the next 10% level. You can model how an added condition would change your combined rating using the calculator above.',
    },
  ];

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'VA Disability Rating Calculator 2026', description: 'Calculate your combined VA disability rating and 2026 monthly compensation — every step shown, bilateral factor automatic.', url: '/calculators/va-disability' })} />
      <JsonLdScript schema={faqPageSchema(faqs)} />

      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200" style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
            VA Disability Combined Rating Calculator
          </h1>
          <p className="text-red-700 font-semibold mt-1.5 mb-3 md:mb-0 text-sm sm:text-base leading-snug">
            Stop guessing your VA combined rating.
          </p>
          <p className="hidden md:block text-zinc-600 mt-1 text-sm leading-relaxed max-w-2xl mb-3">
            Enter each service-connected condition to see the official VA whole-person formula
            applied step by step, with the bilateral factor calculated automatically.
          </p>
          <div className="inline-flex items-center gap-2.5 rounded-full bg-zinc-900 px-4 py-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <div className="hidden md:block"><DataCurrencyBadge source="Official VA rates effective December 1, 2025 (2.8% COLA)" /></div>
        </div>
      </div>

      {/* ── 3-step plan strip ────────────────────────────────────────── */}
      <CalcStepStrip steps={[
        { title: 'Enter each condition' },
        { title: 'See the VA math' },
        { title: 'Estimate your compensation' },
      ]} />

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <VADisabilityCalculator />

      {/* ── What this calculator does and does not do ────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1.5">This calculator estimates:</p>
              <ul className="text-xs text-zinc-600 space-y-1 leading-relaxed list-disc list-inside">
                <li>Combined VA disability rating using the whole-person formula</li>
                <li>Bilateral factor impact on paired body parts</li>
                <li>2026 monthly compensation based on rating and dependents</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1.5">This calculator does not estimate:</p>
              <ul className="text-xs text-zinc-600 space-y-1 leading-relaxed list-disc list-inside">
                <li>Whether VA will grant service connection for a condition</li>
                <li>The rating VA will assign for a specific medical condition</li>
                <li>Effective dates or back pay amounts</li>
                <li>Special Monthly Compensation (SMC)</li>
                <li>TDIU approval</li>
                <li>Spouse Aid &amp; Attendance added amounts</li>
                <li>VA healthcare priority group or state-level benefits</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-200">
            A small difference near a rounding threshold can move you from 60% to 70%, or from 90% to 100% — this calculator shows the math before you file, appeal, or plan around your expected rating. Always verify estimates with your VA decision letter, C&P exam results, or an accredited VSO.
          </p>
        </div>
      </div>

      {/* ── Example Calculation ──────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          The VA combined rating is not calculated by adding percentages together — it uses a whole-person formula (38 CFR § 4.25) where each additional rating is applied to the remaining healthy capacity, not the original 100%. That is why 50% + 30% equals 65% combined (which rounds to 70%), not 80%. This calculator applies the official VA math step by step, including the bilateral factor, and shows your 2026 monthly compensation — excluded from federal taxable income. This calculator estimates the combined rating math — it does not determine whether VA will grant service connection or what rating VA will assign to any specific condition.
        </p>
      </div>
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            How Does the VA Rate a Veteran with Back and Bilateral Knee Conditions?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: Three service-connected conditions — 50% lumbar spine (back), 30% left knee, 20% right knee. The knees trigger the bilateral factor under 38 CFR § 4.26 because both sides of the same joint are rated.
          </p>
          <ExampleTable>
            <ExampleRow label="Left knee (30%) + right knee (20%) combined" value={`${exPair.combinedBeforeFactor.toFixed(1)}% before factor`} />
            <ExampleRow label="Bilateral factor added (+10% of combined)" value={`+${exPair.factorAddition.toFixed(1)} pts → ${exPair.combinedAfterFactor.toFixed(1)}%`} />
            <ExampleRow label={`50% back applied to remaining ${exRemAfterBilateral.toFixed(1)}%`} value={`−${exBackReduction.toFixed(1)} pts`} />
            <ExampleRow label="Combined before rounding" value={`${exRating.exact.toFixed(1)}%`} />
            <ExampleRow label="VA rounded rating (nearest 10%)" value={`${exRating.rounded}%`} highlight />
            <ExampleRow label="2026 monthly compensation — veteran alone" value={`${formatCurrency(exComp.monthly, true)}/mo`} highlight />
            <ExampleRow label="Annual VA compensation" value={`${formatCurrency(exComp.annual)}/yr`} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> Without the bilateral factor, the knees would combine to 44% instead of 48%, and combining that with the 50% back still reaches 72% — which also rounds to 70%, so in this particular case the rounded result is the same either way. But the bilateral factor matters enormously in cases near a rounding threshold: a combined value of 63% without the factor becomes 67% with it, changing the rounded rating from 60% to 70% and adding hundreds of dollars per month. VA rules require the bilateral adjustment whenever both sides of a paired joint carry compensable ratings. At {exRating.rounded}%, this veteran receives {formatCurrency(exComp.monthly, true)}/month in VA disability compensation, which is excluded from federal taxable income, and may qualify for additional dependent-based increases if they have a spouse or children.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">How VA math works</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The VA reads combined ratings off the &ldquo;whole person&rdquo; table in 38 CFR
              § 4.25. The idea: you start at 100% healthy, and each disability is applied to the
              capacity that remains — not the original 100%. A 50% disability leaves 50%; a later
              30% disability reduces that remaining 50%, not the full 100%.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              This is why 50% + 30% does <strong>not</strong> equal 80%. On the § 4.25 table,
              50 combined with 30 is 65 — which rounds to <strong>70%</strong>.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The VA&apos;s position is that you cannot be more than 100% disabled — so each
              additional condition has diminishing impact the higher your existing combined rating.
              Do not round to the nearest 10% between each condition. VA combines the ratings first,
              applies any bilateral factor when applicable, and converts the final combined value to
              the nearest 10%.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mt-3">
              For a full walkthrough with more worked examples — including 10%+10%, 70%+50%,
              and multi-condition cases — see{' '}
              <a href="/blog/va-disability-math-explained" className="text-blue-700 underline">
                VA Disability Math Explained →
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">The bilateral factor explained</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Under 38 CFR § 4.26, if you have compensable disabilities affecting <em>both sides</em>{' '}
              of a paired body part — both arms, both legs, or paired skeletal muscles — you receive a
              10% bonus on the combined value of those bilateral disabilities.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Example:</strong> Left knee 20% + Right knee 10%. On the § 4.25 table these
              combine to 28%. The bilateral factor adds 10% of 28 (= 2.8), giving 30.8%, which
              rounds to 31%. That 31% is then combined with your other disabilities as if it were a
              single rating.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The bilateral factor only applies when <strong>both</strong> sides have a compensable
              (greater than 0%) rating. A 0% rating on one side does not trigger it. If both sides
              are affected, review whether each side is separately documented and claimed. An
              accredited VSO can help confirm how to file bilateral conditions.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Note: Vision impairment in both eyes is rated under the VA&apos;s separate visual
              impairment rules (38 CFR §§ 4.75–4.79) and does not receive the § 4.26 bilateral factor.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Key rating thresholds</h2>
            <div className="space-y-2">
              {[
                { pct: '0%', text: 'Service-connected with no monthly compensation. Establishes the condition for VA purposes but does not increase the combined percentage unless later increased.' },
                { pct: '10–20%', text: 'Flat compensation rate — no dependent additions at these levels' },
                { pct: '30%+', text: 'Dependent compensation kicks in (spouse, children, parents)' },
                { pct: '50%+', text: 'At 50% or higher, veterans are usually placed in Priority Group 1 for VA healthcare, with reduced or eliminated copays for many types of care. Exact healthcare eligibility, copays, and covered services depend on care type, priority group, and current VA rules.' },
                { pct: '70%+', text: 'May qualify for TDIU (see below) if unable to work' },
                { pct: '100%', text: 'Maximum schedular rating — highest compensation tier, P&T status if permanent' },
              ].map(({ pct, text }) => (
                <div key={pct} className="flex gap-3">
                  <span className="shrink-0 font-mono font-bold text-red-700 text-sm w-14">{pct}</span>
                  <p className="text-sm text-zinc-600">{text}</p>
                </div>
              ))}
              <p className="text-xs text-zinc-400 mt-1 pl-0">
                Note: Comprehensive VA dental care has separate eligibility rules and is not automatic at 50%.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Common VA math mistakes</h2>
            <div className="space-y-3">
              {[
                {
                  mistake: 'Adding ratings together',
                  fix: 'Ratings are never added. Each is applied to the remaining healthy percentage.',
                },
                {
                  mistake: 'Rounding between steps',
                  fix: 'VA works down the § 4.25 table one condition at a time, applies any bilateral factor, then converts to the nearest 10% only at the end — never rounding to a 10% step in between.',
                },
                {
                  mistake: 'Forgetting the bilateral factor',
                  fix: 'If you have rated disabilities on both sides of a paired body part, the bilateral factor can push you to the next threshold.',
                },
                {
                  mistake: 'Filing only one side of a bilateral condition',
                  fix: 'If symptoms affect both sides of a paired body part, make sure both sides are documented in your records. Review the filing approach with an accredited VSO or attorney before submitting.',
                },
              ].map(({ mistake, fix }) => (
                <div key={mistake}>
                  <p className="text-sm font-semibold text-zinc-800">✗ {mistake}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{fix}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">TDIU — Total Disability Based on Individual Unemployability</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TDIU allows veterans to receive compensation at the 100% rate even if their combined
              schedular rating is below 100%, if the disabilities prevent them from maintaining
              substantially gainful employment.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>General eligibility:</strong> Combined rating of at least 70% with one
              disability rated at least 40%, OR a single disability rated at least 60%. The VA may
              also grant TDIU on an extraschedular basis in exceptional cases.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              TDIU requires a separate VA Form 21-8940 (Veteran&apos;s Application for Increased
              Compensation Based on Unemployability). Work with an accredited VSO to file.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mt-2">
              Marginal employment and protected work environments can be nuanced — review TDIU
              questions with an accredited VSO or attorney.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Special Monthly Compensation (SMC)</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              SMC provides additional compensation above the 100% rate for veterans with specific
              severe disabilities: loss of use of limbs, blindness, need for regular aid and
              attendance, housebound status, and others.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              SMC calculations are complex and depend heavily on your specific conditions and
              combination of ratings. This calculator does not compute SMC — if you believe you may
              qualify, contact an accredited VSO or the VA directly.
            </p>
          </div>
        </div>

        {/* ── 2026 reference rate table (lib-rendered) ──────────────────── */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            2026 VA disability monthly compensation by rating
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed mb-4">
            Monthly compensation for each combined rating, effective December 1, 2025 (2.8% COLA).
            Dependent additions begin at 30% — at 10% and 20% the rate is the same regardless of
            dependents.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left">
                  <th className="px-4 py-2.5 font-semibold text-zinc-700">Combined rating</th>
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 text-right">Veteran alone</th>
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 text-right">With spouse</th>
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 text-right">With spouse + 1 child</th>
                </tr>
              </thead>
              <tbody>
                {rateRows.map((row) => (
                  <tr key={row.rating} className="border-t border-zinc-100">
                    <td className="px-4 py-2.5 font-mono font-semibold text-red-700">{row.rating}%</td>
                    <td className="px-4 py-2.5 text-right text-zinc-700 tabular-nums">{formatCurrency(row.alone, true)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-700 tabular-nums">{formatCurrency(row.spouse, true)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-700 tabular-nums">{formatCurrency(row.spouseChild, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Published VA lookup-table amounts, not computed additions. Veterans with additional
            children, school-age children (18–23), dependent parents, or a spouse receiving Aid &amp;
            Attendance receive more — enter your situation in the calculator above for an exact figure.
          </p>
        </div>

        {/* ── FAQ — single source shared with the FAQPage schema ────────── */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5">Frequently asked questions</h2>
          <div className="space-y-5">
            {faqs.map((f, i) => (
              <div key={f.question} className={i > 0 ? 'border-t border-zinc-100 pt-5' : ''}>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{f.question}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sources + last reviewed ───────────────────────────────────── */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          Sources:{' '}
          <a
            href="https://www.va.gov/disability/compensation-rates/veteran-rates/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            VA.gov 2026 compensation rates
          </a>{' '}
          (effective December 1, 2025); combined-rating method per 38 CFR §§ 4.25–4.26.
          Last reviewed: June 13, 2026.
        </p>

        {/* Disclaimer */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            This calculator provides estimates based on the official VA combined rating formula
            (38 CFR § 4.25–4.26) and{' '}
            <a
              href="https://www.va.gov/disability/compensation-rates/veteran-rates/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              2026 VA compensation rates
            </a>{' '}
            (effective December 1, 2025, 2.8% COLA). Actual ratings are determined by the VA
            based on medical evidence, C&amp;P exam findings, and adjudicator review. This tool is
            not affiliated with the Department of Veterans Affairs or the Department of Defense.
            Verify all figures with your regional VA office or an{' '}
            <a
              href="https://www.va.gov/ogc/apps/accreditation/index.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              accredited VSO or attorney
            </a>
            .
          </p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Benefits Guide: ratings, the bilateral factor &amp; 2026 rates →</a>
          </div>
        </div>

      </div>
    </>
  );
}
