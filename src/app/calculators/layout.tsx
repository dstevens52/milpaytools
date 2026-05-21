import { CalculatorEmailSignup } from '@/components/CalculatorEmailSignup';
import { CalculatorFeedbackLink } from '@/components/CalculatorFeedbackLink';

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <CalculatorFeedbackLink />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalculatorEmailSignup />
      </div>
    </>
  );
}
