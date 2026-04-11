/**
 * Number-formatting helpers that mirror how each calculator formats output.
 * Using the same locale and decimal settings as the actual components ensures
 * test assertions match exactly what the browser renders.
 */

// ─── ResultCard format ────────────────────────────────────────────────────────
// ResultCard uses: `$${monthly.toLocaleString()}/mo · $${(monthly * 12).toLocaleString()}/yr`
// `toLocaleString()` without args uses runtime locale (en-US in test browser).
// Numbers with fractional parts preserve decimals; integers show none.

/**
 * Formats a number the same way ResultCard does.
 * e.g. 4109.86 → "4,109.86", 1900 → "1,900"
 */
export function resultCardNum(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Full ResultCard row format: "$X,XXX.XX/mo · $XX,XXX.XX/yr"
 */
export function resultCardRow(monthly: number): string {
  return `$${resultCardNum(monthly)}/mo · $${resultCardNum(monthly * 12)}/yr`;
}

// ─── Pay Charts format ────────────────────────────────────────────────────────
// PayChartsClient uses Intl.NumberFormat with minimumFractionDigits: 2

const payChartsFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** e.g. 4109.86 → "$4,109.86" */
export function payChartsAmount(n: number): string {
  return payChartsFmt.format(n);
}

// ─── BAH Calculator format ────────────────────────────────────────────────────
// BAH uses: '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/** e.g. 2100 → "$2,100" */
export function bahAmount(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── VA Disability format ─────────────────────────────────────────────────────
// VA uses: '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** e.g. 1808.45 → "$1,808.45" */
export function vaAmount(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Generic formatCurrency (0 decimal places, matches lib/utils default) ────

const genericFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** e.g. 5702 → "$5,702" */
export function formatCurrency(n: number): string {
  return genericFmt.format(n);
}
