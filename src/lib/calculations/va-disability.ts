/**
 * VA Disability Compensation calculation logic.
 *
 * Combined rating uses the "whole person" method:
 *   1. Sort ratings highest to lowest.
 *   2. Apply first rating to whole person (100%).
 *   3. Each subsequent rating is applied to the remaining "able-bodied" percentage.
 *   4. Round the final combined value to nearest 10 (VA rounding rules).
 *
 * Pure functions — no React, no side effects.
 */

import type { VADisabilityInput, VADisabilityOutput } from '@/types/calculator';
import { vaRates, DATA_YEAR } from '@/data/va-rates/2026';
import { roundToNearest } from '@/lib/utils';

/**
 * Calculate combined VA disability rating using the whole-person method.
 * Returns a value 0–100 (before rounding).
 */
export function calculateCombinedRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;

  // Sort descending
  const sorted = [...ratings].sort((a, b) => b - a);

  let remaining = 100;
  for (const rating of sorted) {
    const reduction = remaining * (rating / 100);
    remaining -= reduction;
  }

  return 100 - remaining;
}

/**
 * Round combined rating to the nearest 10% per VA rules.
 * Values >= 95% round to 100%.
 */
export function roundVARating(combinedRating: number): number {
  if (combinedRating >= 95) return 100;
  return roundToNearest(combinedRating, 10);
}

/**
 * Calculate monthly VA disability compensation based on rating and dependents.
 */
export function calculateVACompensation(input: VADisabilityInput): VADisabilityOutput {
  const rawRatings = input.ratings.map((r) => r.percentage);
  const combinedRating = calculateCombinedRating(rawRatings);
  const roundedRating = roundVARating(combinedRating);

  const rateEntry = vaRates[roundedRating];
  if (!rateEntry) {
    // Should never happen with valid input
    return buildEmptyOutput(combinedRating, roundedRating);
  }

  // Determine base rate
  let monthlyCompensation: number;
  let breakdown = {
    baseCompensation: 0,
    spouseAddition: 0,
    childrenAddition: 0,
    parentAddition: 0,
    aaAddition: 0,
  };

  if (!input.hasSpouse && input.dependentChildren === 0) {
    monthlyCompensation = rateEntry.veteranAlone;
    breakdown.baseCompensation = rateEntry.veteranAlone;
  } else if (input.hasSpouse && input.dependentChildren === 0) {
    monthlyCompensation = input.spouseAA
      ? rateEntry.withSpouseAA
      : rateEntry.withSpouse;
    breakdown.baseCompensation = rateEntry.veteranAlone;
    breakdown.spouseAddition = monthlyCompensation - rateEntry.veteranAlone;
    if (input.spouseAA) {
      breakdown.aaAddition = rateEntry.withSpouseAA - rateEntry.withSpouse;
      breakdown.spouseAddition = rateEntry.withSpouse - rateEntry.veteranAlone;
    }
  } else {
    // With children
    let base: number;
    const children = input.dependentChildren;

    if (input.hasSpouse) {
      if (children === 1) base = rateEntry.withSpouseAndOneChild;
      else if (children === 2) base = rateEntry.withSpouseAndTwoChildren;
      else base = rateEntry.withSpouseAndThreeChildren;

      const extraChildren = Math.max(0, children - 3);
      const extra = extraChildren * rateEntry.additionalChild;
      monthlyCompensation = base + extra;

      breakdown.baseCompensation = rateEntry.veteranAlone;
      breakdown.spouseAddition = rateEntry.withSpouse - rateEntry.veteranAlone;
      breakdown.childrenAddition = monthlyCompensation - rateEntry.withSpouse;
    } else {
      if (children === 1) base = rateEntry.withOneChild;
      else if (children === 2) base = rateEntry.withTwoChildren;
      else base = rateEntry.withThreeChildren;

      const extraChildren = Math.max(0, children - 3);
      const extra = extraChildren * rateEntry.additionalChild;
      monthlyCompensation = base + extra;

      breakdown.baseCompensation = rateEntry.veteranAlone;
      breakdown.childrenAddition = monthlyCompensation - rateEntry.veteranAlone;
    }
  }

  // Dependent parents
  const parentAddition = Math.min(2, input.dependentParents) * rateEntry.additionalParent;
  monthlyCompensation += parentAddition;
  breakdown.parentAddition = parentAddition;

  const annualCompensation = monthlyCompensation * 12;

  // Determine CRDP eligibility (30%+ combined rating + military retirement)
  const isCRDPEligible =
    roundedRating >= 50 && (input.isMedicallyRetired || (input.militaryRetiredPay ?? 0) > 0);

  return {
    combinedRating,
    roundedRating,
    monthlyCompensation,
    annualCompensation,
    taxFreeAnnual: annualCompensation, // VA disability is entirely tax-free
    isCRDPEligible,
    breakdown,
  };
}

function buildEmptyOutput(combinedRating: number, roundedRating: number): VADisabilityOutput {
  return {
    combinedRating,
    roundedRating,
    monthlyCompensation: 0,
    annualCompensation: 0,
    taxFreeAnnual: 0,
    isCRDPEligible: false,
    breakdown: {
      baseCompensation: 0,
      spouseAddition: 0,
      childrenAddition: 0,
      parentAddition: 0,
      aaAddition: 0,
    },
  };
}
