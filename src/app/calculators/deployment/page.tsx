import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CalculatorSummary } from '@/components/calculators/shared/CalculatorSummary';
import { DeploymentCalculator } from '@/components/calculators/deployment/DeploymentCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { calculateDeployment } from '@/lib/calculations/deployment';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';
import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import { TSP_CONSTANTS_2027, TSP_LIMITS_2027_NOTICE } from '@/data/tsp/2027/constants';
import { SENIOR_ENLISTED_BASIC_PAY } from '@/data/pay-tables/2026';
import { officerCZTEMonthlyCap } from '@/lib/calculations/deployment';
import { FILING_STATUS_LABEL } from '@/lib/calculations/federalTax';

import { CALCULATOR_LAST_REVIEWED, formatReviewedDate } from '@/data/lastReviewed';

// Same date the sitemap uses (src/data/lastReviewed.ts).
const DEPLOYMENT_LAST_REVIEWED = formatReviewedDate(CALCULATOR_LAST_REVIEWED.deployment);
const R = DEPLOYMENT_RATES_2026;
const T26 = TSP_CONSTANTS_2026;

export const metadata: Metadata = {
  title: { absolute: 'Deployment Pay Calculator 2026: Army, Navy, Air Force, USMC' },
  description:
    'Free 2026 deployment pay calculator for every branch: HFP/IDP, Hardship Duty Pay, FSA, CZTE tax savings and Savings Deposit Program interest. All ranks.',
  alternates: {
    canonical: '/calculators/deployment',
  },
  openGraph: {
    title: 'Deployment Pay Calculator 2026: Army, Navy, Air Force, USMC',
    description:
      'Free 2026 deployment pay calculator for every branch: HFP/IDP, Hardship Duty Pay, FSA, CZTE tax savings and Savings Deposit Program interest. All ranks.',
    type: 'website',
    url: '/calculators/deployment',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'Deployment Pay Calculator 2026', sub: 'HFP/IDP, hardship pay, FSA, and combat-zone tax savings' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deployment Pay Calculator 2026: Army, Navy, Air Force, USMC',
    description:
      'Free 2026 deployment pay calculator for every branch: HFP/IDP, Hardship Duty Pay, FSA, CZTE tax savings and Savings Deposit Program interest. All ranks.',
    images: ogImage({ type: 'calculator', title: 'Deployment Pay Calculator 2026', sub: 'HFP/IDP, hardship pay, FSA, and combat-zone tax savings' }),
  },
};

export default function DeploymentPage() {
  // ── Worked-example values; home-station BAH resolved server-side from bah.ts ───
  // Scenario: E-5, 8 yrs, married (family at Fort Bragg, 28310), 9-month CZTE
  // deployment with IDP + FSA, no HDP, no SDP.
  const depMha = getMHACode('28310');
  const depBah = (depMha && getMHARates(depMha, true)?.['E-5']) || 0;
  const dep = calculateDeployment({
    payGrade: 'E-5',
    yearsOfService: 8,
    hasDependents: true,
    zipCode: '28310',
    monthlyBAH: depBah,
    bahFound: true,
    deploymentMonths: 9,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: false,
    sdpDeposit: 0,
  });

  // Hero sample strip: E-5, 6 yrs, 6-month combat zone, with dependents, IDP + FSA, $10,000 SDP.
  const sample = calculateDeployment({
    payGrade: 'E-5',
    yearsOfService: 6,
    hasDependents: true,
    zipCode: '28310',
    monthlyBAH: depBah,
    bahFound: true,
    deploymentMonths: 6,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: true,
    sdpDeposit: R.sdpMaxDeposit,
  });

  // Filing status follows the calculator default (with dependents → married filing jointly).
  const depFiling = FILING_STATUS_LABEL[dep.filingStatus];
  const sampleFiling = sample.filingStatus === 'mfj' ? 'MFJ' : FILING_STATUS_LABEL[sample.filingStatus];
  const capWithIdp = officerCZTEMonthlyCap(true);

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Deployment Pay Calculator 2026', description: 'Free 2026 deployment pay calculator for every branch: HFP/IDP, Hardship Duty Pay, FSA, CZTE tax savings and Savings Deposit Program interest. All ranks.', url: '/calculators/deployment' })} />
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
            Deployment Pay Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            See how much more you take home during a deployment — HFP, tax exclusion, Family Separation Allowance, and SDP growth in one view.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your rank, location, and deployment length' },
          { title: 'See combat zone pay, tax savings, and SDP growth' },
          { title: 'Calculate your total deployment financial impact' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Deployment to a qualifying combat zone activates several pay changes: Imminent Danger Pay ({formatCurrency(R.idp)}/month) or Hostile Fire Pay ({formatCurrency(R.hfp)}/month) — never both for the same period — at rates effective {R.ratesEffectiveDate}, Family Separation Allowance ($300/month for qualifying members with dependents for 30+ days), and the Combat Zone Tax Exclusion, which excludes all enlisted and warrant officer military pay from federal taxable income in eligible months (officers up to a monthly cap). The Savings Deposit Program additionally pays 10% guaranteed annual interest on up to $10,000 deposited during a combat zone deployment.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; 6 yrs &middot; 6-mo combat zone &middot; w/dep &middot; {sampleFiling}
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">IDP <span className="font-semibold text-zinc-700">{formatCurrency(sample.during.monthlyIDP)}/mo</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">Tax savings <span className="font-semibold text-zinc-700">{formatCurrency(sample.tour.totalCZTESavings)}</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">SDP <span className="font-semibold text-zinc-700">{formatCurrency(sample.tour.sdpInterestEarned)}</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Total impact: <span className="font-semibold text-red-700">{formatCurrency(sample.tour.totalTourBenefit)}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── What changed (October 1, 2026 rate change) ─────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-zinc-700 leading-relaxed">
          <p>
            <span className="font-semibold text-zinc-900">What changed on {R.ratesEffectiveDate}:</span>{' '}
            Hostile Fire Pay rose to {formatCurrency(R.hfp)}/month and Imminent Danger Pay to{' '}
            {formatCurrency(R.idp)}/month (prorated at {formatCurrency(R.idpDaily, true)}/day) — the first
            change since {R.hfpIdpUnchangedSince}, when both were set at the same flat monthly rate. Consistent with the maximum allowed for
            combined HDP-L and HFP or IDP payments, the top Hardship Duty Pay–Location rate dropped from {formatCurrency(R.hdpLTopRatePrior)} to {formatCurrency(Math.max(...R.hdpLevels))}/month. Earlier periods used
            the prior rates — this calculator uses the new ones.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Source: Assistant Secretary of War (Manpower &amp; Reserve Affairs) memorandum signed July 14,
            2026, under DoWI 1340.09; DoW 7000.14-R, Volume 7a, Chapters 10 and 17. Statutory authority
            (37 U.S.C. § 351) and the October 2002 history: DoD release,{' '}
            <a href={R.releaseUrl} className="underline hover:text-zinc-700" target="_blank" rel="noopener noreferrer">
              &ldquo;Statement by Chief Pentagon Spokesman, Sean Parnell, on the Department of War&apos;s
              Historic Increase to Hostile Fire and Imminent Danger Pay&rdquo;
            </a>
            , war.gov, October 1, 2026.
          </p>
        </div>
      </div>

      {/* ── Calculator ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <DeploymentCalculator />
      </div>

      <CalculatorSummary calc="deployment" />

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            How Much More Does an E-5 Take Home on a 9-Month Combat Zone Deployment?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5, 8 years of service, married and filing jointly on one income (family at Fort Bragg, NC), deploying to a designated Combat Zone Tax Exclusion (CZTE) area for 9 months. Receives Imminent Danger Pay for full months and Family Separation Allowance. No Hardship Duty Pay. 2026 rates.
          </p>
          <ExampleTable>
            <ExampleRow label="Monthly base pay (E-5, 8 yrs)" value={`${formatCurrency(dep.pre.monthlyBasePay)}/mo`} />
            <ExampleRow label="BAH continues at home station (Fort Bragg, w/deps)" value={`${formatCurrency(dep.pre.monthlyBAH)}/mo`} />
            <ExampleRow label="BAS" value={`${formatCurrency(dep.pre.monthlyBAS)}/mo`} />
            <ExampleRow label="Imminent Danger Pay (IDP)" value={`+${formatCurrency(dep.during.monthlyIDP)}/mo`} />
            <ExampleRow label="Family Separation Allowance (FSA — married 30+ days away)" value={`+${formatCurrency(dep.during.monthlyFSA)}/mo`} />
            <ExampleRow label={`Federal income tax before deployment (${depFiling.toLowerCase()})`} value={`−${formatCurrency(dep.pre.monthlyFederalTax)}/mo`} />
            <ExampleRow label="CZTE: base pay and IDP excluded from federal taxable income" value={`−${formatCurrency(dep.during.monthlyFederalTax)}/mo federal income tax during`} />
            <ExampleRow label="FICA on base pay (still withheld in a combat zone)" value={`−${formatCurrency(dep.during.monthlyFICA)}/mo`} />
            <ExampleRow label="Take-home after federal income tax and FICA — before deployment" value={`${formatCurrency(dep.pre.monthlyTakeHome)}/mo`} />
            <ExampleRow label="Take-home after federal income tax and FICA — during deployment" value={`${formatCurrency(dep.during.monthlyTakeHome)}/mo`} highlight />
            <ExampleRow label="Monthly increase" value={`+${formatCurrency(dep.during.monthlyIncrease)}/mo (+${Math.round(dep.during.percentIncrease)}%)`} highlight />
            <ExampleRow label={`9-month tour total benefit (allowances ${formatCurrency(dep.tour.totalAdditionalAllowancePay)} + CZTE tax savings ${formatCurrency(dep.tour.totalCZTESavings)})`} value={formatCurrency(dep.tour.totalTourBenefit)} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> This E-5 takes home {formatCurrency(dep.during.monthlyIncrease)} more per month during the deployment — and because family expenses typically drop while a spouse is deployed (one fewer car, shared housing costs), many families can bank $1,000–$2,000+ per month. Over 9 months the CZTE alone saves {formatCurrency(dep.tour.totalCZTESavings)} in federal income tax ({depFiling.toLowerCase()}; assumes the deployment falls in one tax year). That is the tax on the year with this pay minus the tax on the same year with the excluded pay removed. Roth TSP contributions from pay excluded from federal taxable income can create a powerful combination: no federal income tax going in, and qualified withdrawals are not taxed if Roth rules are met — making deployment a significant opportunity for long-term TSP growth.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <hr className="border-zinc-200" />

        <div id="by-branch">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Does deployment pay differ by branch?
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed mb-3">
            For the pays this calculator covers, no. Hostile Fire/Imminent Danger Pay, Hardship Duty
            Pay–Location, Family Separation Allowance, the Combat Zone Tax Exclusion, and the Savings
            Deposit Program are set by federal law and Department of Defense regulation, so they work
            the same way for Army, Navy, Air Force, Marine Corps, and Space Force members. What
            changes your total is your rank, where you deploy, how long, and whether you have
            dependents — not your branch.
          </p>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Some branch-specific pays (such as Navy sea pay or aviation incentive pay) aren&apos;t
            included here. Your LES and finance office are the final word on what you receive.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Source: DoW 7000.14-R, Volume 7a; 37 U.S.C. § 427; 26 U.S.C. § 112; 10 U.S.C. § 1035.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Combat Zone Tax Exclusion (CZTE)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Service members in a designated combat zone receive federal income tax relief under
              26 U.S.C. § 112. Enlisted members and warrant officers have all military pay excluded
              from federal taxable income for any month they serve in the combat zone — even one day in a
              month qualifies the entire month. The exclusion covers federal income tax only: Social
              Security and Medicare (FICA) are still withheld from base pay.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Commissioned officers receive the same exclusion up to a monthly cap: the basic pay of the
              senior enlisted member ({formatCurrency(SENIOR_ENLISTED_BASIC_PAY, true)} in 2026) plus the
              hostile fire or imminent danger pay the officer actually receives that month — for an
              officer drawing IDP, {formatCurrency(capWithIdp, true)}. Base pay, IDP and hardship duty pay
              above the cap stay in federal taxable income. State income tax treatment varies by state —
              many states follow the federal exclusion, others do not.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Source: 26 U.S.C. § 112(b), (c)(5); DFAS Basic Pay – Officers, effective January 1, 2026,
              Note 2, and Basic Pay – Enlisted, Note 3.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Savings Deposit Program (SDP)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The SDP is a government-backed savings account offering a 10% annual return
              — available only to service members deployed to designated combat zones for 30 or more
              consecutive days. The maximum deposit is {formatCurrency(R.sdpMaxDeposit)}; interest compounds monthly
              and is paid quarterly (DFAS).
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              SDP interest continues for 90 days after leaving the combat zone. The calculator keeps it
              simple: it shows simple interest on the full deposit from day one at 10% a year, without
              monthly compounding, the limit of depositing from current pay, or those 90 extra days. The
              SDP is administered through DFAS — open an account through your unit finance office or myPay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Hostile Fire Pay / Imminent Danger Pay
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Effective {R.ratesEffectiveDate}, Hostile Fire Pay is {formatCurrency(R.hfp)}/month and
              Imminent Danger Pay is {formatCurrency(R.idp)}/month. HFP is typically paid as a flat
              monthly rate for members engaged with or under threat of hostile fire. IDP is prorated at{' '}
              {formatCurrency(R.idpDaily, true)} per day based on actual time in a designated imminent
              danger area — verify with your finance office how your specific deployment is categorized.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              You cannot receive both HFP and IDP for the same period of service. This calculator models
              IDP for full months; it does not yet prorate partial months or model HFP separately.
              Periods before {R.ratesEffectiveDate} were paid at the prior rates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Family Separation Allowance (FSA)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              FSA is authorized when a service member with dependents is deployed away from them for
              30 or more consecutive days. The FY2026 NDAA increased FSA from $250 to $300/month —
              the first increase since 2002. FSA is a non-taxable allowance.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              FSA requires dependents to be enrolled — it is not paid to single members without
              dependents. Authorization is under 37 U.S.C. § 427.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              TSP during deployment
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              {`In a combat zone, contributions from tax-exempt combat-zone pay don't count toward the elective deferral limit (IRC § 402(g): ${formatCurrency(T26.electiveDeferralLimit)} for 2026; ${formatCurrency(TSP_CONSTANTS_2027.electiveDeferralLimit)} for 2027). That lets total contributions go up to the annual additions limit (IRC § 415(c)), which applies to everyone: ${formatCurrency(T26.annualAdditionsLimit)} for 2026 and ${formatCurrency(TSP_CONSTANTS_2027.annualAdditionsLimit)} for 2027. The § 415(c) limit itself doesn't change in a combat zone.`}
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Important:</strong>{' '}
              {`Roth TSP contributions remain capped at the elective deferral limit (${formatCurrency(T26.electiveDeferralLimit)} for 2026; ${formatCurrency(TSP_CONSTANTS_2027.electiveDeferralLimit)} for 2027) — even in a combat zone. Contributions above that limit from tax-exempt combat-zone pay go into the traditional tax-exempt portion of TSP, not Roth. You cannot contribute the full annual additions limit to Roth TSP.`}
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Plan your contribution percentage in advance; DFAS processes TSP elections and changes
              through myPay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Hardship Duty Pay — Location (HDP-L)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              HDP-L is a tiered allowance authorized under 37 U.S.C. § 305 for service in locations
              designated as hardship duty areas. The level is determined by the specific deployment
              location designation, not by personal election.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Effective {R.ratesEffectiveDate}, the top HDP-L rate dropped from {formatCurrency(R.hdpLTopRatePrior)} to{' '}
              {formatCurrency(Math.max(...R.hdpLevels))}/month (DoW 7000.14-R, Volume 7a, Chapter 17),
              so the tiers are now{' '}
              {R.hdpLevels.filter((l) => l > 0).map((l) => formatCurrency(l)).join(' and ')}, or $0 for
              locations without a designation.
            </p>
          </div>
        </div>

        {/* Cross-links */}
        <div className="space-y-3">
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-800">Planning for retirement?</span>{' '}
            The{' '}
            <a href="/calculators/tsp" className="text-blue-700 hover:underline font-medium">
              TSP Growth Projector
            </a>{' '}
            can model the long-term impact of maxing your TSP contributions during a combat zone
            {` deployment — in a combat zone, contributions can go up to the annual additions limit (${formatCurrency(T26.annualAdditionsLimit)} for 2026; ${formatCurrency(TSP_CONSTANTS_2027.annualAdditionsLimit)} for 2027), though Roth contributions remain capped at the elective deferral limit (${formatCurrency(T26.electiveDeferralLimit)} for 2026; ${formatCurrency(TSP_CONSTANTS_2027.electiveDeferralLimit)} for 2027) and excess tax-exempt contributions go into traditional TSP.`}
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-800">Leaving dependents behind?</span>{' '}
            The{' '}
            <Link href="/bah" className="text-blue-700 hover:underline font-medium">
              BAH Calculator
            </Link>{' '}
            can help your family understand the housing allowance that continues during deployment —
            BAH does not stop when you deploy.
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on published 2026 DoD and IRS rates. Actual
            entitlements depend on your deployment orders, official combat zone designation, DFAS
            processing, and individual tax situation. HFP {formatCurrency(R.hfp)}/month, IDP {formatCurrency(R.idp)}/month
            ({formatCurrency(R.idpDaily, true)}/day), HDP-L up to {formatCurrency(Math.max(...R.hdpLevels))}/month,
            effective {R.ratesEffectiveDate} (DoWI 1340.09; DoW 7000.14-R, Volume 7a, Chapters 10 and 17;
            statutory authority 37 U.S.C. § 351 per the DoD release of October 1, 2026).
            FSA: $300/month (37 U.S.C. § 427, FY2026 NDAA). CZTE: 26 U.S.C. § 112 and IRS
            {` Publication 3. SDP: 10 U.S.C. § 1035. TSP: IRC § 415(c) annual additions limit ${formatCurrency(T26.annualAdditionsLimit)} for 2026 (${formatCurrency(TSP_CONSTANTS_2027.annualAdditionsLimit)} for 2027, ${TSP_LIMITS_2027_NOTICE}); tax-exempt combat-zone contributions don't count toward the IRC § 402(g) elective deferral limit, and Roth TSP remains capped at ${formatCurrency(T26.electiveDeferralLimit)} for 2026 (${formatCurrency(TSP_CONSTANTS_2027.electiveDeferralLimit)} for 2027).`}
            Federal income tax uses 2026 tax brackets and the standard deduction for the filing status
            you choose (single, married filing jointly or head of household), with no other income or
            deductions. FICA (Social Security and Medicare) is taken from base pay only; state income
            tax, SGLI, your own TSP contribution and the Social Security wage base are not modeled.
            Always verify your specific entitlements with your finance office and DFAS.
          </p>
          <p className="mt-2">Last reviewed: {DEPLOYMENT_LAST_REVIEWED}.</p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
