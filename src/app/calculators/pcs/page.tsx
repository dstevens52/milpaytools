import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CalculatorSummary } from '@/components/calculators/shared/CalculatorSummary';
import { PCSCalculator } from '@/components/calculators/pcs/PCSCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { calculatePCS, calculateTLE, calculateTravelDays } from '@/lib/calculations/pcs';
import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';
import { PCS_PER_DIEM_RATE } from '@/data/pcs/conusPerDiem';
import { formatCurrency } from '@/lib/utils';

// Absolute title (no " | MilPayTools" suffix) — 54 chars.
const PCS_TITLE = 'PCS & PPM Calculator 2026: Army, Navy, Air Force, USMC';
const PCS_DESC =
  '2026 PCS calculator: DLA, MALT, per diem, TLE and PPM (DITY) proceeds at official DTMO rates. Army, Navy, Air Force, Marines, Space Force and Coast Guard.';

// ── Figures used in copy and FAQs — all from the data files ─────────────────
const R = PCS_RATES_2026;
const PD = PCS_PER_DIEM_RATE;
const PD_DAILY = PD.lodging + PD.mie;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const miles = (n: number) => n.toLocaleString('en-US');

// Travel-day worked example (JTR 050205).
const TD_EX_MILES = 1120;
const TD_EX_DAYS = calculateTravelDays(TD_EX_MILES);
const TD_EX_BLOCKS = Math.floor(TD_EX_MILES / R.milesPerTravelDay);
const TD_EX_REM = TD_EX_MILES % R.milesPerTravelDay;

// TLE worked example: member, spouse and two children under 12, standard CONUS rate.
const TLE_EX = calculateTLE(1, 0, 1, 2);

const PCS_FAQS: FaqItem[] = [
  {
    question: 'Is there a separate Army, Navy or Air Force PCS calculator?',
    answer:
      "No. PCS allowances (DLA, MALT, per diem, TLE) and PPM incentive rules come from the Joint Travel Regulations and DTMO rate tables, which apply to all branches. Your branch's transportation office handles the paperwork, but the allowance rates are the same.",
  },
  {
    question: 'What is a PPM, and is it the same as a DITY move?',
    answer:
      'A Personally Procured Move (PPM) is when you move some or all of your belongings yourself and are reimbursed. It replaced the older "DITY" name. Some branches still use the older term informally.',
  },
  {
    question: 'How many travel days do I get for a PCS by car?',
    answer:
      `${R.milesOneDayMax} miles or less is 1 travel day. For a longer move, divide the official distance by ${R.milesPerTravelDay}, round down, and add 1 day if ${R.milesRemainderForExtraDay} or more miles are left over. ` +
      `Example: ${miles(TD_EX_MILES)} miles ÷ ${R.milesPerTravelDay} = ${TD_EX_BLOCKS} with ${TD_EX_REM} miles left over, so ${TD_EX_DAYS} travel days. ` +
      'The distance is the official DTOD distance on your orders, not the miles you actually drive.',
  },
  {
    question: 'How much is PCS per diem when I drive?',
    answer:
      `Driving is paid as MALT Plus: the full standard CONUS per diem for each authorized travel day, with no reduced first or last day. The ${PD.fiscalYear} standard CONUS rate is ${usd(PD_DAILY)} a day (${usd(PD.lodging)} lodging + ${usd(PD.mie)} meals and incidentals). ` +
      `Each dependent traveling with you gets ${pct(R.dependentPerDiemShare.age12OrOlder)} of your rate if 12 or older and ${pct(R.dependentPerDiemShare.under12)} if under 12. ` +
      `Mileage (MALT) is $${R.maltPerMile} a mile per vehicle, for up to ${R.maltMaxPOVs} vehicles; the second needs a dependent traveling with you.`,
  },
  {
    question: 'How much TLE can I get for a PCS?',
    answer:
      `Up to ${R.tle.maxDaysConus} days in total for a move to a new duty station in CONUS, split across the old and new locations (${R.tle.maxDaysConusToOconus} days when moving from CONUS overseas). ` +
      `The daily amount is a percentage of the local lodging and meals rate: ${pct(R.tle.percent.onePerson)} for one person, ${pct(R.tle.percent.twoPeople)} for the member and one dependent, plus ${pct(R.tle.percent.eachAdditional12OrOlder)} for each additional dependent 12 or older and ${pct(R.tle.percent.eachAdditionalUnder12)} for each one under 12. ` +
      `It's never more than $${R.tle.dailyCap} a day, lodging taxes and fees included, and the lodging part can't exceed what you actually pay. ` +
      `Example: a member, spouse and two children under 12 at the ${PD.fiscalYear} standard CONUS rate get up to ${pct(TLE_EX.percent)} × ${usd(PD_DAILY)} = ${usd(TLE_EX.dailyRate)} a day. Higher-cost areas have higher locality rates.`,
  },
  {
    question: 'How is the PPM incentive calculated?',
    answer:
      `It's ${pct(R.ppmIncentivePercentOfGcc)} of the Government Constructed Cost (GCC): what it would have cost the government to move the same weight the same distance. ` +
      'It is computed for your move in your move system (MilMove or DPS) or by your transportation office, so there is no single rate per pound. ' +
      `You can request an advance of up to ${pct(R.ppmAdvancePercent)} of the incentive. The incentive is taxable income; documented moving costs such as truck rental, fuel and packing materials reduce the taxable part.`,
  },
];

export const metadata: Metadata = {
  title: { absolute: PCS_TITLE },
  description: PCS_DESC,
  alternates: {
    canonical: '/calculators/pcs',
  },
  openGraph: {
    title: PCS_TITLE,
    description: PCS_DESC,
    type: 'website',
    url: '/calculators/pcs',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'PCS Calculator 2026', sub: 'DLA, MALT, per diem, TLE and PPM pay explained' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: PCS_TITLE,
    description: PCS_DESC,
    images: ogImage({ type: 'calculator', title: 'PCS Calculator 2026', sub: 'DLA, MALT, per diem, TLE and PPM pay explained' }),
  },
};

export default function PCSPage() {
  // ── Worked-example values, computed server-side from the PCS lib ──────────────
  // Scenario: E-6, spouse + 1 child under 12 (3 travelers), Fort Campbell, KY → JBLM, WA
  // (~2,200 mi), 1 POV, 20 combined TLE days, full PPM.
  const exMiles = 2200;
  const exPcs = calculatePCS({
    rank: 'E-6',
    hasDependents: true,
    depsAge12Plus: 1,
    depsUnder12: 1,
    moveType: 'full-ppm',
    distance: exMiles,
    numPOVs: 1,
    hhgWeight: 11000,
    tleOldDays: 10,
    tleNewDays: 10,
  });

  // Hero sample strip: E-5 with a spouse, Fort Bragg → JBLM (estimated 2,973 mi), 1 POV.
  const heroMiles = 2973;
  const hero = calculatePCS({
    rank: 'E-5',
    hasDependents: true,
    depsAge12Plus: 1,
    depsUnder12: 0,
    moveType: 'gov',
    distance: heroMiles,
    numPOVs: 1,
    hhgWeight: 0,
    tleOldDays: 0,
    tleNewDays: 0,
  });
  const whole = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'PCS Calculator 2026', description: PCS_DESC, url: '/calculators/pcs' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        {/* ── Intro ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            PCS Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Estimate your military move: DLA, MALT, per diem, TLE, and what a PPM (DITY) move could net.
          </p>
          <p className="text-zinc-600 text-sm leading-relaxed max-w-2xl mt-2">
            Doing a PPM (DITY) move?{' '}
            <a href="#ppm" className="text-blue-700 hover:underline font-medium">
              See how PPM pay works below.
            </a>
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your origin and destination' },
          { title: 'See your full PCS entitlements (DLA, MALT, per diem, TLE)' },
          { title: 'Compare government move vs. PPM/DITY' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          A PCS move triggers several financial entitlements — Dislocation Allowance (DLA), MALT mileage at ${R.maltPerMile}/mile, per diem for travel days, and Temporary Lodging Expense (TLE) for transition. Service members who arrange a Personally Procured Move (PPM) get an incentive of {pct(R.ppmIncentivePercentOfGcc)} of what the government would have paid to move the same weight the same distance.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; w/spouse &middot; Fort Bragg &rarr; JBLM &middot; {miles(heroMiles)} mi
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">DLA <span className="font-semibold text-zinc-700">{whole(hero.dla)}</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">MALT <span className="font-semibold text-zinc-700">{whole(hero.malt)}</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">Per diem <span className="font-semibold text-zinc-700">{whole(hero.perDiemTotal)}</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Gov move total: <span className="font-semibold text-red-700">{whole(hero.govMoveTotal)}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <PCSCalculator />
      </div>

      <CalculatorSummary calc="pcs" />

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Government Move vs. PPM: E-6 from Fort Campbell, KY to JBLM, WA
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6, spouse and one child under 12 (3 travelers), PCS from Fort Campbell, KY to Joint Base Lewis-McChord, WA — approximately {miles(exMiles)} miles. Assumes 1 POV, {exPcs.travelDays} travel days, and {exPcs.tleDays} days combined TLE. 2026 DTMO rates and the {PD.fiscalYear} standard CONUS per diem rate.
          </p>
          <ExampleTable>
            <ExampleRow label="DLA — Dislocation Allowance (E-6 with dependents)" value={formatCurrency(exPcs.dla)} />
            <ExampleRow label={`MALT mileage (${miles(exMiles)} mi × $${R.maltPerMile}, 1 POV)`} value={formatCurrency(exPcs.malt)} />
            <ExampleRow label={`Per diem — member (${exPcs.travelDays} days × ${usd(PD_DAILY)})`} value={formatCurrency(exPcs.perDiemMember)} />
            <ExampleRow label={`Per diem — spouse (${pct(R.dependentPerDiemShare.age12OrOlder)}) and child under 12 (${pct(R.dependentPerDiemShare.under12)})`} value={formatCurrency(exPcs.perDiemDependents)} />
            <ExampleRow label={`TLE — up to ${exPcs.tleDays} days × ${usd(exPcs.tleDailyRate)} (${pct(exPcs.tlePercent)} of ${usd(PD_DAILY)})`} value={formatCurrency(exPcs.tleTotal)} />
            <ExampleRow label="Total government move entitlement" value={formatCurrency(exPcs.govMoveTotal)} highlight />
            <ExampleRow label={`HHG weight allowance (E-6 with dependents, JTR Table 5-37)`} value={`${exPcs.weightAllowance.toLocaleString('en-US')} lbs`} />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> DLA, MALT, per diem, and TLE ({formatCurrency(exPcs.govMoveTotal)}, with TLE at its ceiling) are paid the same way whichever move type you choose. With a full PPM, the E-6 also gets an incentive of {pct(R.ppmIncentivePercentOfGcc)} of what the government would have paid to move the same weight, up to {exPcs.weightAllowance.toLocaleString('en-US')} lbs, the same distance. That figure is computed for each move: get it from your move system or transportation office before you decide.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is DLA?</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Dislocation Allowance (DLA) is a one-time payment intended to partially reimburse the
              cost of disruption that a PCS causes to your household. It is paid per move — not per
              mile — and varies by rank and dependency status.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              DLA is not the same as your moving reimbursement. It covers the incidental costs of
              uprooting a household: utility hookups, lease break fees, initial supplies at a new
              location. Keep it separate in your mental accounting from HHG shipping costs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">MALT and the DTOD distance</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              MALT (Monetary Allowance in Lieu of Transportation) reimburses you for driving your
              POV at a flat per-mile rate — ${R.maltPerMile}/mile in 2026, for up to {R.maltMaxPOVs} vehicles
              (the second needs a dependent traveling with you). The reimbursable distance is the
              official DTOD (Defense Table of Official Distances) route, not what your GPS shows.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              DTOD distances are typically slightly different from Google Maps or Waze. Look up the
              official DTOD mileage at{' '}
              <a
                href="https://www.dtod.sddc.army.mil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                dtod.sddc.army.mil
              </a>{' '}
              to get the exact number to use in your voucher.
            </p>
          </div>

          <div id="ppm" className="scroll-mt-20">
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">PPM calculator: what a PPM (DITY) move pays</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              A PPM move (formerly DITY — Do It Yourself) lets you move your own household goods.
              The incentive is {pct(R.ppmIncentivePercentOfGcc)}{' '}of the Government Constructed Cost (GCC): what it
              would have cost the government to move the same weight the same distance. The GCC is
              computed for each move, so there is no single rate per pound and this calculator
              doesn&apos;t estimate a dollar figure. Get the official estimate in your move system
              (MilMove or DPS) or from your transportation office.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The incentive is paid on the weight on your weight tickets, up to your weight allowance,
              and you can request an advance of up to {pct(R.ppmAdvancePercent)}. It is taxable income;
              documented moving costs (truck rental, fuel, packing materials) reduce the taxable part.
              Keep every receipt and weight ticket.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">TLE: Temporary Lodging Expense</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TLE reimburses temporary lodging and meals near your old or new duty station during a PCS: up to {R.tle.maxDaysConus} days in total for a new duty station in CONUS, split across both locations, and {R.tle.maxDaysConusToOconus} days when moving from CONUS overseas, where TLA (Temporary Lodging Allowance) takes over. The daily amount is {pct(R.tle.percent.onePerson)} of the local lodging and meals rate for one person, {pct(R.tle.percent.twoPeople)} for two people, plus {pct(R.tle.percent.eachAdditional12OrOlder)} for each additional family member 12 or older and {pct(R.tle.percent.eachAdditionalUnder12)} under 12, capped at ${R.tle.dailyCap} a day including lodging taxes.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              This calculator uses the {PD.fiscalYear} standard CONUS rate ({usd(PD_DAILY)}/day) as the local rate, so its TLE figure is an &ldquo;up to&rdquo;
              amount; higher-cost areas have higher locality rates. Some housing-shortage areas allow extra days: see DTMO&apos;s{' '}
              <a href={R.tle.extensionsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Locations with Approved TLE Extensions</a>.
              You must submit lodging receipts to your finance office to be reimbursed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Weight allowances</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The weight allowance is the maximum household goods weight the government will ship
              or reimburse for a PPM move. Exceeding your allowance means paying out-of-pocket for
              the overage. It rises with rank and is higher with dependents: an E-5 gets{' '}
              {R.weightAllowance.withDependents['E-5'].toLocaleString('en-US')} lbs with dependents and{' '}
              {R.weightAllowance.withoutDependents['E-5'].toLocaleString('en-US')} lbs without (JTR Table 5-37).
              Prior-enlisted officers (O-1E to O-3E) use the O-1 to O-3 rows.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Pro-gear (professional books, papers, equipment) doesn&apos;t count against your weight
              allowance. Unaccompanied baggage and items in temporary storage may have separate limits.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Per diem travel days</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              When you drive, you get 1 travel day for {R.milesOneDayMax} miles or less. Longer moves get the
              official distance ÷ {R.milesPerTravelDay}, rounded down, plus 1 day if {R.milesRemainderForExtraDay} or more
              miles are left over: {miles(TD_EX_MILES)} miles is {TD_EX_DAYS} days. Each day pays the full
              standard CONUS rate ({usd(PD_DAILY)} for {PD.fiscalYear}), with no reduced first or last day.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Dependents traveling with you receive {pct(R.dependentPerDiemShare.age12OrOlder)}{' '}of the member&apos;s
              rate each if 12 or older and {pct(R.dependentPerDiemShare.under12)}{' '}if under 12. Days when you fly part
              of the way follow different rules that this calculator doesn&apos;t model.
            </p>
          </div>
        </div>

        <FaqSection faqs={PCS_FAQS} />

        {/* Cross-link */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-800">Comparing duty stations?</span>{' '}
          The{' '}
          <a href="/calculators/compare" className="text-blue-700 hover:underline font-medium">
            Compare Your PCS Move
          </a>{' '}
          shows BAH difference, state income tax impact, CONUS COLA eligibility, and estimated
          take-home pay at each location — before you finalize which orders to accept.
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on published 2026 DoD rates. Actual entitlements
            depend on your specific orders, authorized DTOD route, and Finance Office approval. DLA
            rates from DTMO (verify at{' '}
            <a
              href="https://www.travel.dod.mil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              travel.dod.mil
            </a>
            ). MALT rate: ${R.maltPerMile}/mile. Per diem and the TLE ceiling use the {PD.fiscalYear} standard
            CONUS rate ({usd(PD.lodging)} lodging + {usd(PD.mie)}{' '}M&amp;IE); actual TLE requires documented
            lodging receipts. The PPM incentive is computed for each move by your transportation
            office and is not estimated here. Always verify
            your specific entitlements with your TMO and Finance Office before making financial
            decisions about your move.
          </p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
