import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CalculatorGrid } from '@/components/home/CalculatorGrid';
import { ValueProp } from '@/components/home/ValueProp';

export const metadata: Metadata = {
  title: 'MilPayTools — Military Pay & Benefits Calculators',
  description:
    'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CalculatorGrid />
      <ValueProp />
    </>
  );
}
