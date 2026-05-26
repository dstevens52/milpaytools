/* eslint-disable @typescript-eslint/no-explicit-any */
export function fireCalculatorEvent(calculatorName: string): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'calculation_run', {
      calculator_name: calculatorName,
      event_category: 'calculator',
    });
  }
}
