import { useCallback, useRef } from 'react';

/**
 * Tells a calculator whether the person has interacted with it yet, so
 * `calculation_run` means "a person used the calculator" and never "the page
 * loaded" or "a shared link filled the inputs in".
 *
 *   const { attach: gaAttach, hasInteracted: gaInteracted } = useUserInputGate();
 *   useEffect(() => {
 *     if (!result || !gaInteracted()) return;
 *     ...debounce 800 ms, then fireCalculatorEvent(name)
 *   }, [result, gaInteracted]);
 *   return <div ref={gaAttach}>...inputs...</div>;
 *
 * Any `input`, `change` or `click` inside the attached element counts as an
 * interaction. Defaults and URL prefill only call setState and never dispatch
 * DOM events, so they don't count. The event fires when the result changes after
 * an interaction: async results still count (e.g. BAH after a typed ZIP), and a
 * click that doesn't change the result (Share, an accordion) sends nothing.
 *
 * Listeners use the capture phase on the calculator root, which runs before
 * React's own listener on the app root, so the flag is set before the state
 * update renders and the effect runs.
 *
 * Both returned functions are stable across renders.
 */
const EVENTS = ['input', 'change', 'click'] as const;

export function useUserInputGate<T extends HTMLElement = HTMLDivElement>() {
  const touched = useRef(false);
  const detach = useRef<(() => void) | null>(null);

  const attach = useCallback((el: T | null) => {
    detach.current?.();
    detach.current = null;
    if (!el) return;
    const mark = () => {
      touched.current = true;
    };
    for (const e of EVENTS) el.addEventListener(e, mark, true);
    detach.current = () => {
      for (const e of EVENTS) el.removeEventListener(e, mark, true);
    };
  }, []);

  const hasInteracted = useCallback(() => touched.current, []);

  return { attach, hasInteracted };
}
