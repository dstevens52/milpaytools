import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CALCULATOR_URL_PARAMS, type CalculatorKey } from '@/data/calculatorUrlParams';

/**
 * Input made BEFORE the page hydrates must reach the calculator (build 1c).
 *
 * On a slow phone the prerendered calculator is on screen before its JavaScript
 * runs. A rank picked or a ZIP typed in that window stays in the DOM, but React
 * hydrates without reading it: it leaves the DOM value alone, records it as the
 * "last known" value, and keeps its own default in state. The visitor sees their
 * choice next to results for the default.
 *
 *   const { attach: gaAttach, hasInteracted: gaInteracted, root: gaRoot } = useUserInputGate();
 *   useEffect(() => { ...read URL params... }, []);
 *   const hydrated = usePreHydrationSync(gaRoot, { calculator: 'total-compensation', shareUrl: getShareUrl });
 *
 * **Call it after the calculator's URL-reading effect.** Mount effects run in
 * declaration order, so the visitor's value is applied after the URL prefill and
 * wins over it (the 1b rule).
 *
 * What it does, once, on mount:
 * 1. Every select, text/number/range input, checkbox, radio and textarea under
 *    `root()` whose DOM value differs from the value React hydrated with is
 *    replayed as a native input/change/click event. The calculator's own
 *    onChange runs, so the value goes through the same parser as a value typed
 *    after hydration (a half-typed ZIP stays incomplete, a grade is a grade).
 *    Skipped: disabled, read-only, hidden/email/password/file inputs, anything
 *    inside `[data-presync="off"]`.
 * 2. The replayed events are real DOM events inside the calculator root, so
 *    `useUserInputGate` counts them as an interaction and `calculation_run` fires
 *    once when the result changes, as for any other change. A page load with
 *    nothing changed replays nothing and fires nothing.
 * 3. If anything was replayed and the page URL had query parameters, the URL is
 *    updated to match the screen: the calculator's own parameters are replaced
 *    with `shareUrl()`'s (built from the state after the replay); anything else
 *    in the query (utm tags) is kept. A URL with no query is left alone.
 *
 * Button-driven controls (Yes/No buttons, chips, +/− steppers) can't be read
 * back from the DOM. Render them with `aria-disabled={hydrated ? undefined : true}`
 * using the returned flag (or `useHydrated()` in a child component): unchanged on
 * screen, announced as unavailable, and a click on any `[aria-disabled="true"]`
 * element under the root is swallowed. Playwright also waits for them to be enabled.
 *
 * Returns `hydrated`: false on the server and in the hydration render, true from
 * the first render after mount. A mount effect, not useSyncExternalStore: a
 * store-based flag caused early selects in other calculators to be lost (1b).
 */
export function usePreHydrationSync(
  root: () => HTMLElement | null,
  options: { calculator?: CalculatorKey; shareUrl?: () => string } = {},
): boolean {
  const [hydrated, setHydrated] = useState(false);
  const [urlPending, setUrlPending] = useState(false);

  // Latest shareUrl, read after the replayed values have rendered.
  const shareUrlRef = useRef(options.shareUrl);
  useEffect(() => {
    shareUrlRef.current = options.shareUrl;
  });

  // A click on an aria-disabled control is a no-op, including in the moment
  // between the hydration commit and the mount effect below.
  useLayoutEffect(() => {
    const el = root();
    if (!el) return;
    el.addEventListener('click', swallowInertClick, true);
    return () => el.removeEventListener('click', swallowInertClick, true);
  }, [root]);

  useEffect(() => {
    const el = root();
    const replayed = el ? replayPreHydrationInput(el) : 0;
    setHydrated(true);
    if (replayed > 0 && window.location.search) setUrlPending(true);
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculator = options.calculator;
  useEffect(() => {
    if (!urlPending) return;
    const build = shareUrlRef.current;
    if (!build) return;
    const next = new URL(build(), window.location.href).searchParams;
    const params = new URLSearchParams(window.location.search);
    if (calculator) for (const p of CALCULATOR_URL_PARAMS[calculator].params) params.delete(p.name);
    for (const k of new Set(next.keys())) params.delete(k);
    for (const [k, v] of next) params.append(k, v);
    window.history.replaceState(null, '', `?${params.toString()}${window.location.hash}`);
  }, [urlPending, calculator]);

  return hydrated;
}

/** Mount flag for a child component's button-driven controls (see usePreHydrationSync). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag (build 1b)
    setHydrated(true);
  }, []);
  return hydrated;
}

function swallowInertClick(e: Event) {
  const t = e.target;
  if (t instanceof Element && t.closest('[aria-disabled="true"]')) {
    e.preventDefault();
    e.stopPropagation();
  }
}

const SKIP_INPUT_TYPES = new Set(['hidden', 'email', 'password', 'file', 'submit', 'button', 'reset', 'image']);

/** The option the server rendered as selected (React writes `selected` on it). */
function serverSelectValue(sel: HTMLSelectElement): string {
  for (const o of sel.options) if (o.defaultSelected) return o.value;
  return sel.options[0]?.value ?? '';
}

/**
 * The prototype's value setter, which bypasses React's per-node tracker. React
 * fires onChange only when the DOM value differs from the value it last saw.
 */
function setValueUntracked(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
}

/**
 * Replays each pre-hydration change as the event React listens for. Returns the
 * number of fields replayed. During hydration React sets `defaultValue` /
 * `defaultChecked` to its own (server) value and leaves the DOM value alone, so
 * a difference between the two is a change the visitor made before hydration.
 */
function replayPreHydrationInput(root: HTMLElement): number {
  let replayed = 0;
  const fields = root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea',
  );
  for (const el of fields) {
    if (el.disabled || el.closest('[data-presync="off"]')) continue;

    if (el instanceof HTMLSelectElement) {
      if (el.multiple || el.value === serverSelectValue(el)) continue;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      replayed++;
      continue;
    }

    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
      if (el.checked === el.defaultChecked) continue;
      // In a radio group the newly checked radio carries the change.
      if (el.type === 'radio' && !el.checked) continue;
      const checked = el.checked;
      el.checked = !checked; // through React's tracker: its last-seen value is the server's
      el.click(); // back to the visitor's choice; React sees the change and runs onChange
      replayed++;
      continue;
    }

    if (el.readOnly || (el instanceof HTMLInputElement && SKIP_INPUT_TYPES.has(el.type))) continue;
    if (el.value === el.defaultValue) continue;
    const value = el.value;
    el.value = el.defaultValue; // through React's tracker: its last-seen value is the server's
    setValueUntracked(el, value); // DOM back to the visitor's text, tracker untouched
    el.dispatchEvent(new Event('input', { bubbles: true }));
    replayed++;
  }
  return replayed;
}
