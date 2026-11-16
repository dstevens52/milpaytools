import { expect, type Locator } from '@playwright/test';

/**
 * Wait until React has hydrated the page and owns `control`, so an interaction
 * reaches React instead of being lost.
 *
 * Why not `networkidle`: it waits on Next.js link prefetches and third-party
 * scripts, not on hydration. It can settle before hydration, or never settle
 * under load (follow-up 4, GA4_EVENTS_REPORT.md).
 *
 * Two checks, both React internals (React 19). If React renames them, this
 * times out and the test fails; it can never pass early.
 * - Root committed: Next.js hydrates `document`; its `__reactContainer$…` host
 *   root reports `isDehydrated === false` once the hydration commit is done.
 *   Callback refs and layout effects (e.g. `useUserInputGate`'s listener) are in
 *   place by then. Measured: 3–45 ms after the gate attaches.
 * - `control` has React's `__reactProps$…` key: the element itself was hydrated
 *   (covers a control inside a later-hydrating Suspense boundary). On its own this
 *   is too early: React sets it while rendering, 25–77 ms before the commit.
 *
 * The locator is re-resolved on every poll, so a node React replaces still works.
 */
export async function waitForHydration(control: Locator, timeout = 15_000): Promise<void> {
  await expect
    .poll(
      () =>
        control
          .evaluate((el) => {
            const doc = document as unknown as Record<string, { stateNode?: { current?: { memoizedState?: { isDehydrated?: boolean } } } }>;
            const key = Object.keys(document).find((k) => k.startsWith('__reactContainer$'));
            const rootDone = !!key && doc[key]?.stateNode?.current?.memoizedState?.isDehydrated === false;
            return rootDone && Object.keys(el).some((k) => k.startsWith('__reactProps$'));
          }, null, { timeout: 1_000 })
          .catch(() => false),
      { message: 'React hydration (root committed and control owned by React)', timeout, intervals: [50, 100, 250] },
    )
    .toBe(true);
}
