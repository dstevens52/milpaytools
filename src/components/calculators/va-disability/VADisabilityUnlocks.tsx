'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  getCompensation,
  whatIfAddRating,
  type CompensationResult,
  type DependentConfig,
  type DisabilityEntry,
} from '@/lib/calculations/va-disability';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
  roundedRating: number;
  compensation: CompensationResult;
  deps: DependentConfig;
  disabilities: DisabilityEntry[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDollars(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// ─── Sub-components ────────────────────────────────────────────────────────

function BenefitCell({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-zinc-900 mb-1">{title}</p>
      <p className="text-xs text-zinc-600 leading-relaxed">{body}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function VADisabilityUnlocks({
  roundedRating,
  compensation,
  deps,
  disabilities,
}: Props) {
  const [ptExpanded, setPtExpanded] = useState(false);

  const isCompensable = roundedRating >= 10;
  const hasDependent    = roundedRating >= 30;
  const hasStatePlus    = roundedRating >= 50;
  const isMax           = roundedRating >= 100;

  // Next threshold
  const nextThreshold = !isMax && roundedRating > 0 ? roundedRating + 10 : null;

  const nextData = useMemo(() => {
    if (!nextThreshold || disabilities.length === 0) return null;
    const testRatings = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    for (const r of testRatings) {
      const { newRounded } = whatIfAddRating(disabilities, r);
      if (newRounded >= nextThreshold) {
        const nextComp = getCompensation(nextThreshold, deps);
        const diff = nextComp.monthly - compensation.monthly;
        return {
          minRating: r,
          newRounded,
          diff,
          diffAnnual: diff * 12,
        };
      }
    }
    return null;
  }, [nextThreshold, disabilities, deps, compensation.monthly]);

  // Nothing to show for 0% combined or no conditions entered
  if (!isCompensable || disabilities.length === 0) return null;

  return (
    <div className="rounded-lg bg-white border border-zinc-200 p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-900 text-base">
          What Your {roundedRating}% Rating Means Beyond Monthly Pay
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Common threshold benefits — verify specifics with the VA or a VSO.
        </p>
      </div>

      {/* ── Funding fee waiver — prominent green card ─────────────────── */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <p className="text-sm font-semibold text-green-900">VA Loan Funding Fee Waiver</p>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-green-200 text-green-800 px-1.5 py-0.5 rounded">
            Every VA loan use
          </span>
        </div>
        <p className="text-sm text-green-800 leading-relaxed mb-3">
          Your service-connected rating waives the VA loan funding fee on every VA loan use —
          purchase, refinance, and subsequent use. This savings never expires.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded border border-green-100 px-3 py-2">
            <p className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">
              $350K first-use purchase
            </p>
            <p className="text-base font-bold text-green-900 tabular-nums">$7,525 saved</p>
            <p className="text-[10px] text-green-600">(2.15% fee waived)</p>
          </div>
          <div className="bg-white rounded border border-green-100 px-3 py-2">
            <p className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">
              $400K subsequent-use
            </p>
            <p className="text-base font-bold text-green-900 tabular-nums">$13,200 saved</p>
            <p className="text-[10px] text-green-600">(3.30% fee waived)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/calculators/va-loan"
            className="text-sm font-semibold text-green-800 hover:text-green-900 underline transition-colors"
          >
            Estimate your VA loan payment →
          </Link>
          <Link
            href="/blog/va-loan-funding-fee-explained"
            className="text-sm text-green-700 hover:text-green-800 underline transition-colors"
          >
            Funding fee rates and exemptions →
          </Link>
        </div>
      </div>

      {/* ── Core benefits grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BenefitCell
          label="Tax Treatment"
          title="Excluded from federal taxable income"
          body="VA disability compensation is not reported as wages. Not subject to federal income tax or FICA."
        />

        <BenefitCell
          label="VA Healthcare"
          title="VA healthcare enrollment eligibility"
          body="A compensable rating qualifies you for VA healthcare enrollment. Priority group and costs depend on your rating percentage and other factors."
        />

        {hasDependent && (
          <BenefitCell
            label="Dependent Allowances (30%+)"
            title="Additional pay for qualifying dependents"
            body="At 30% or higher, VA adds allowances for a qualifying spouse, children, and dependent parents. Use the dependent inputs above to see your full amount."
          />
        )}

        {hasStatePlus && (
          <BenefitCell
            label="State Benefits (50%+)"
            title="Additional state-level programs"
            body="Many states offer property tax exemptions, vehicle registration waivers, and education benefits for dependents at 50%+. Benefits and thresholds vary significantly by state."
          />
        )}
      </div>

      {/* ── 100% P&T conditional section ─────────────────────────────── */}
      {isMax && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">
            If Your 100% Rating Is Designated Permanent &amp; Total (P&amp;T)
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            P&amp;T status must appear on your VA rating decision — the calculator cannot determine it.
            If your 100% rating is P&amp;T, additional benefits may include:
          </p>
          <button
            type="button"
            onClick={() => setPtExpanded((v) => !v)}
            className="mt-2 text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
          >
            {ptExpanded ? 'Hide P&T benefits' : 'Show additional P&T benefits'}
          </button>
          {ptExpanded && (
            <div className="mt-3 space-y-2.5 text-sm text-amber-900">
              <div>
                <span className="font-semibold">Chapter 35 DEA</span> — Up to 36 months of
                Dependents&apos; Educational Assistance for eligible spouses and children,
                separate from your GI Bill entitlement.
              </div>
              <div>
                <span className="font-semibold">CHAMPVA</span> — Healthcare coverage for
                your spouse and dependents who are not eligible for TRICARE.
              </div>
              <div>
                <span className="font-semibold">Commissary and exchange access</span> for dependents.
              </div>
              <div>
                <span className="font-semibold">Full property tax exemptions</span> in many states
                at 100% P&amp;T — eligibility and benefit amounts vary significantly by state.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Next threshold section ────────────────────────────────────── */}
      {!isMax && nextThreshold && nextData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">
            How Close Are You to {nextThreshold}%?
          </p>
          <p className="text-sm text-blue-900 leading-relaxed">
            You&apos;re at <strong>{roundedRating}%</strong> combined. The next rating level
            is <strong>{nextThreshold}%</strong>.
          </p>
          <p className="text-sm text-blue-800 leading-relaxed mt-1.5">
            An additional condition rated at approximately{' '}
            <strong>{nextData.minRating}%</strong> or higher would bring your combined rating
            to {nextData.newRounded}%, which rounds to <strong>{nextThreshold}%</strong>.
          </p>
          {nextData.diff > 0.5 && (
            <p className="text-sm text-blue-900 font-medium mt-2 tabular-nums">
              Monthly compensation increase:{' '}
              <strong>approximately +{fmtDollars(nextData.diff)}/month</strong>{' '}
              <span className="font-normal text-blue-700">
                (+{fmtDollars(nextData.diffAnnual)}/year, based on your current dependent status)
              </span>
            </p>
          )}
          {/* Threshold-specific notes */}
          {nextThreshold === 30 && (
            <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
              At 30%, VA dependent allowances activate for a qualifying spouse, children, and dependent
              parents — if you have qualifying dependents, the total monthly increase is typically
              larger than the base rate difference.
            </p>
          )}
          {nextThreshold === 50 && (
            <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
              At 50%, VA healthcare priority group placement typically improves, which may reduce
              or eliminate copays for many types of care.
            </p>
          )}
          {nextThreshold === 100 && (
            <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
              At 100%, you reach the maximum schedular rating and may be eligible for Permanent
              &amp; Total (P&amp;T) designation, which unlocks additional benefits for dependents.
            </p>
          )}
          <p className="text-[10px] text-blue-600 mt-2">
            Assumes one additional non-bilateral condition. Actual combined rating depends on
            what VA grants — work with a VSO on your specific conditions.
          </p>
        </div>
      )}

      {/* ── State benefits note ───────────────────────────────────────── */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 leading-relaxed">
        <strong className="text-zinc-800">State veterans benefits:</strong>{' '}
        Many states offer additional benefits based on VA disability rating, including property
        tax exemptions, vehicle registration waivers, education benefits for dependents, and more.
        Benefits and thresholds vary significantly by state — check your state&apos;s department
        of veterans affairs or{' '}
        <a
          href="https://www.benefits.va.gov/statedvabenefit/stateDirectory.asp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline"
        >
          the VA&apos;s state directory
        </a>.
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <p className="text-xs text-zinc-400 leading-relaxed">
        Benefit eligibility depends on your specific VA determination, including whether your
        rating is static or permanent, schedular or extraschedular, and other individual factors.
        This is an educational overview of common threshold benefits, not a guarantee of
        eligibility. Verify specific benefits with the VA, your state veterans affairs office,
        or a veterans service organization.
      </p>
    </div>
  );
}
