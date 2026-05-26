/* eslint-disable @typescript-eslint/no-explicit-any */
export function fireCalculatorEvent(calculatorName: string): void {
  if (typeof window === 'undefined') return;

  // GA4
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'calculation_run', {
      calculator_name: calculatorName,
      event_category: 'calculator',
    });
  }

  // Redis counter — fire-and-forget, never blocks UI
  fetch('/api/track-calculation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calculator: calculatorName }),
    keepalive: true,
  }).catch(() => {});
}
