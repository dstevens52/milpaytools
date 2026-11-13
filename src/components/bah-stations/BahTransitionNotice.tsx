/**
 * Release-day → January 1 line for /bah and CONUS /bah/[slug]: the new rates are
 * the headline, but the prior year's rate is paid until January 1. Shown only in
 * the 'transition' notice mode (BAH_EFFECTIVE_NOTICE in src/data/bah/current.ts).
 * Copy: bahTransitionText() in src/lib/calculations/bahTransition.ts.
 */
export function BahTransitionNotice({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="bah-transition-notice" role="note">
      <p className="text-sm text-zinc-700 leading-relaxed">{text}</p>
    </div>
  );
}
