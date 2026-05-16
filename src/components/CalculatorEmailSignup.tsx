'use client';

import { usePathname } from 'next/navigation';
import { EmailSignup } from '@/components/EmailSignup';

export function CalculatorEmailSignup() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() ?? 'unknown';
  const source = `calculator-${slug}`;

  return (
    <EmailSignup
      variant="card"
      headline="Want updated numbers when 2027 rates drop?"
      subtext="One email per year in January with new pay tables, BAH rates, and TSP limits. No spam."
      source={source}
    />
  );
}
