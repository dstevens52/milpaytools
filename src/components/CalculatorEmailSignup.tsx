'use client';

import { usePathname } from 'next/navigation';
import { EmailSignup } from '@/components/EmailSignup';

export function CalculatorEmailSignup({
  headline = 'Want updated numbers when 2027 rates drop?',
}: { headline?: string } = {}) {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() ?? 'unknown';
  const source = `calculator-${slug}`;

  return (
    <EmailSignup
      variant="card"
      headline={headline}
      subtext="Updates when pay tables, BAH rates, or tools change. No spam."
      source={source}
    />
  );
}
