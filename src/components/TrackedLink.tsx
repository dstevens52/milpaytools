'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import type { PayGrade } from '@/types/military';
import {
  fireDeepLinkEvent,
  type DeepLinkFromPage,
  type DeepLinkPlacement,
  type DeepLinkToCalculator,
} from '@/lib/analytics';

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  /** Where the link sits (calc_deeplink_click `from_page_type`). */
  fromPageType: DeepLinkFromPage;
  /** Calculator it opens (calc_deeplink_click `to_calculator`). */
  toCalculator: DeepLinkToCalculator;
  grade?: PayGrade;
  /** Which link on the page (calc_deeplink_click `placement`). */
  placement?: DeepLinkPlacement;
};

/**
 * A next/link that sends calc_deeplink_click when clicked. Lets server pages
 * (no client JS of their own) track their page-to-calculator links; renders
 * the same <a> as a plain <Link>. Also registered as an MDX component, so a
 * blog post can track a link (string props only: next-mdx-remote drops `{}`).
 */
export function TrackedLink({ fromPageType, toCalculator, grade, placement, ...linkProps }: TrackedLinkProps) {
  return <Link {...linkProps} onClick={() => fireDeepLinkEvent(fromPageType, toCalculator, { grade, placement })} />;
}
