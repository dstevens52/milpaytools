'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import type { PayGrade } from '@/types/military';
import { fireDeepLinkEvent, type DeepLinkFromPage, type DeepLinkToCalculator } from '@/lib/analytics';

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  /** Where the link sits (calc_deeplink_click `from_page_type`). */
  fromPageType: DeepLinkFromPage;
  /** Calculator it opens (calc_deeplink_click `to_calculator`). */
  toCalculator: DeepLinkToCalculator;
  grade?: PayGrade;
};

/**
 * A next/link that sends calc_deeplink_click when clicked. Lets server pages
 * (no client JS of their own) track their page-to-calculator links; renders
 * the same <a> as a plain <Link>.
 */
export function TrackedLink({ fromPageType, toCalculator, grade, ...linkProps }: TrackedLinkProps) {
  return <Link {...linkProps} onClick={() => fireDeepLinkEvent(fromPageType, toCalculator, { grade })} />;
}
