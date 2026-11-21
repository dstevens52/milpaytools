'use client';

import Link from 'next/link';
import type { PayGrade } from '@/types/military';
import { fireDeepLinkEvent } from '@/lib/analytics';
import { vaLoanBahHref } from '@/lib/vaFunnel';

interface VaLoanBahCardProps {
  /** Calculator the card sits in (calc_deeplink_click `from_page_type`). */
  fromPageType: 'bah-calculator' | 'pcs-calculator';
  /** MHA display name from the BAH lookup (displayMhaName). */
  location: string;
  zip: string;
  grade: PayGrade;
  hasDependents: boolean;
}

/**
 * V3b: one line under a BAH result that opens the VA loan calculator with the
 * BAH comparison filled in from the lookup just run. The caller renders it only
 * for a CONUS ZIP that returned a BAH rate (see isConusMha).
 */
export function VaLoanBahCard({ fromPageType, location, zip, grade, hasDependents }: VaLoanBahCardProps) {
  return (
    <Link
      href={vaLoanBahHref(zip, grade, hasDependents)}
      onClick={() => fireDeepLinkEvent(fromPageType, 'va-loan', { grade, placement: 'result-card' })}
      data-testid="va-loan-bah-card"
      className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-zinc-200 bg-white py-3 pl-5 pr-4 text-sm shadow-sm hover:border-zinc-300 hover:shadow transition-all"
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-red-600" />
      <span className="text-zinc-800">
        Thinking about buying near <strong>{location}</strong>? See how a VA loan payment compares with this BAH
      </span>
      <span className="flex-none text-red-600">→</span>
    </Link>
  );
}
