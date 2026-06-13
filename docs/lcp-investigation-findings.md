# LCP Render-Delay Investigation — Findings

**Scope:** read-only investigation of the ~2.3s (swinging to ~10.4s) LCP render delay on
`/calculators/total-compensation` (mobile, throttled), plus a separate note on
`/calculators/va-disability` main-thread cost. **No code was changed.** This document
records what the code shows and what still needs a runtime trace to confirm.

**TL;DR:** The heading is static server-rendered text, and the font is *already* loaded
with `display: swap` + `next/font`'s metric-matched fallback (CLS is 0, which confirms the
fallback metrics are working). That means this is **not** a classic FOIT/font-block. The
heading's paint is gated by two things that are on the critical path of *every* page:
(1) the single render-blocking Tailwind CSS bundle, and (2) main-thread contention from
hydration + the Microsoft Clarity script on a 4×-throttled CPU. The run-to-run swing
(2.3↔10.4s) is the signature of a contended critical-request chain, not a deterministic
font stall. The font hypothesis in the brief is plausible on its face but is **largely
ruled out by the code** — see §1.

---

## 1. Exactly how the heading font is loaded today

### The setup (file-level)

- **`src/app/layout.tsx:3,10-14`** — Inter is loaded via `next/font/google`:
  ```ts
  import { Inter } from 'next/font/google';
  const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
  });
  ```
  - No `weight` is specified, so Next loads the **variable font** — a single file that
    contains *all* weights including 800 (`font-extrabold`). The heading weight is therefore
    available from the same font file as everything else; there is no separate 700/800 fetch.
  - `display: 'swap'` is set explicitly → the generated `@font-face` carries
    `font-display: swap`.
  - `preload` and `adjustFontFallback` are **not** set, so they take their defaults:
    `preload: true` and `adjustFontFallback: true`. The metric-matched fallback is what keeps
    CLS at 0 when Inter swaps in.

- **`src/app/layout.tsx:52`** — the generated class is applied as a *variable* only:
  ```tsx
  <html lang="en" className={inter.variable}>
  ```
  `inter.variable` defines the CSS custom property `--font-inter`; it does **not** itself set
  `font-family`.

- **`src/app/globals.css:1,16-19`** — Tailwind v4 (`@import "tailwindcss"`) with a theme token:
  ```css
  @theme {
    --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  }
  ```
  The heading reaches Inter **indirectly**: Tailwind v4's preflight sets
  `font-family: var(--font-sans)` on `html`, and `--font-sans` resolves to `var(--font-inter)`.
  The `<h1>` (`src/app/calculators/total-compensation/page.tsx:100`) carries no font-family
  class of its own — it inherits through this chain.

### Why this is *not* the primary cause of the render delay

1. **`display: swap` is on.** With swap, the browser paints the heading in the fallback font
   immediately once styling is available, then swaps to Inter when it arrives. The heading is
   never hidden waiting for the font (that would be FOIT, which requires `display: block`/`auto`
   with a block period — not the case here).
2. **The fallback is metric-matched** (`adjustFontFallback` default + CLS = 0). The fallback
   paint is the same size as the final Inter paint, so the swap does not move layout and does
   not create a *new, larger* LCP candidate. LCP for this text is therefore recorded at the
   **fallback** paint, not at the Inter swap.
3. **Weight 800 is in the same variable file** as all other text. There is no special,
   separately-fetched heavy weight that could stall just the heading.

Net: the heading's paint time is governed by *when styled paint first becomes possible* and
*when the main thread is free to commit that paint* — i.e. CSS delivery and CPU contention —
**not** by font download. See §3.

> ⚠️ **One item genuinely needs runtime confirmation (see §5):** whether Next actually emits
> `<link rel="preload" as="font">` for the Inter file. Because the font-family is applied only
> through compiled CSS (`@theme` → preflight) rather than through a rendered `className` on an
> element, it is worth verifying in the live `<head>` that the preload link is present. Even if
> it is missing, `display: swap` means the *text still paints* in fallback — a missing preload
> would delay the Inter *swap*, not the heading's first paint.

---

## 2. The single smallest fix

**The heading is already off the FOIT path** (swap + metric fallback are in place), so there
is no font change that will deterministically remove the 2.3s. The smallest change that
actually moves the needle on first styled paint is on the **CSS critical path**, not the font:

> **Smallest high-confidence fix:** get the render-blocking Tailwind stylesheet to first
> paint faster / stop it competing with other critical requests — concretely, **add an
> explicit `<link rel="preload">` for the compiled CSS (and confirm the font preload exists)**
> so the stylesheet is fetched at highest priority at the very top of the chain, and trim what
> the stylesheet has to deliver before the hero can paint.

This applies **site-wide**: the CSS bundle and the heading font are shared by every page
through the root layout and `globals.css`, so any improvement to the CSS critical path
benefits all 16 calculators and every other route, not just total-compensation.

If a font-level change is wanted as belt-and-suspenders (low risk, site-wide because the font
is global), the only meaningful one is to **explicitly confirm/force `preload: true`** in the
`Inter({ ... })` call and verify the preload link renders. This speeds the *swap*, removing
the residual FOUT flash, but will not by itself fix the 2.3s render delay.

**Expected impact:** Removing CSS/critical-chain contention is what should collapse the
2.3↔10.4s swing toward FCP (~0.9s). The font preload confirmation is a smaller, polish-level
win. Exact numbers require a before/after Lighthouse run (see §5).

---

## 3. Render-blocking resource list

What is on the critical path to first paint, from the code:

| Resource | Where | Render-blocking? | Lowest-risk way to make it non-blocking |
|---|---|---|---|
| **Compiled Tailwind CSS** (`@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`, `src/app/globals.css:1-2`) | Auto-injected `<link rel="stylesheet">` in `<head>` | **Yes** — gates *all* styled paint | Preload it at top priority; trim unused CSS so the file is smaller (the typography plugin pulls in prose styles used only on blog/MDX, not on calculator pages). This is the ~530–730ms "render-blocking requests" insight. |
| **Inter font file** (next/font, `layout.tsx:10-14`) | Self-hosted by Next; preload link expected | Not blocking *text* paint (swap), but competes for bandwidth on the critical chain | Confirm the `rel=preload as=font` link is present (§5). It's already `subsets: ['latin']` + variable, which is the right minimal footprint. |
| **GA4 inline loader** (`layout.tsx:58-76`) | `<Script strategy="afterInteractive">`, production + allowed-host only | **No** (runs after hydration) | Already deferred. Does not block first paint; contributes to post-load main-thread/TBT only. |
| **Microsoft Clarity inline loader** (`layout.tsx:77-83`) | `<Script strategy="afterInteractive">`, **all environments/hosts** | **No** for first paint, but **yes for main-thread contention** that can delay the LCP *commit* on a throttled CPU | Consider gating Clarity to production + real hostname like GA already is, and/or `strategy="lazyOnload"`. Clarity installs DOM mutation observers and is a well-known source of forced reflow + long tasks — this is the most likely driver of the va-disability main-thread numbers in §4. |
| **Client-component hydration** (`Header` is `'use client'`, `src/components/layout/Header.tsx:1`; each calculator is a client component) | Served as static HTML, hydrated after load | **No** for first paint (HTML is server-rendered) | Hydration JS parse/execute competes for the main thread under Lighthouse's 4× CPU throttle and can defer the LCP paint commit. Tie-in to the "Reduce unused JS (~95 KiB) / Legacy JS (~14 KiB)" insights. |

**Why the swing (2.3↔10.4s):** none of the above is render-blocking *text* in a hard sense
once CSS arrives, but on throttled mobile the single CSS bundle + font + JS chunks contend on
the same critical-request chain and the same throttled CPU. When the CSS lands late or the
main thread is busy hydrating/running Clarity, the heading paint is deferred — producing the
high-variance LCP. That is the "Network dependency tree" flag.

---

## 4. va-disability main-thread findings *(separate, later build)*

**This is independent of the LCP fix.** Reported: 860ms TBT, 2.2s main-thread, 11 long tasks,
forced-reflow flag on `/calculators/va-disability`.

What the code shows (`src/components/calculators/va-disability/VADisabilityCalculator.tsx`):

- **The combined-rating computation is synchronous and runs in `useMemo` on every relevant
  state change** (`result` line 173, `compensation` lines 174-177, `whatIfResults` lines
  188-196). `whatIfResults` is the heaviest: it loops `WHAT_IF_RATINGS` (5 values) and calls
  `whatIfAddRating` + `getCompensation` for each, i.e. ~5 full re-derivations per change.
- **However, this is unlikely to be the cause of the *load-time* TBT**, for two reasons:
  1. The inputs that feed the calculation are **discrete buttons and +/- counters**, not a
     text stream. The one free-text field, "Condition Label" (`newLabel`, lines 326-332),
     does **not** feed the calculation — it's only consumed on submit in `addDisability`
     (lines 199-214). So there is no per-keystroke compute storm.
  2. On a bare page load with no URL params, `disabilities` is empty, so the entire results
     subtree — `whatIfResults`, `StepBreakdown`, and `VADisabilityUnlocks` — does **not
     render** (lines 424-595 are behind `disabilities.length > 0`). The expensive memos
     return early. So load-time main-thread cost is **not** coming from the rating math.
- **No forced-reflow source exists in app code.** A grep for `getBoundingClientRect`,
  `offsetWidth/Height`, `clientWidth/Height`, `scrollIntoView`, `getComputedStyle`, `offsetTop`
  across the va-disability tree **and** all shared components returned **nothing**. The
  forced-reflow flag is therefore almost certainly from a **third-party script** — Microsoft
  Clarity (`layout.tsx:77-83`) is the prime suspect; it walks/observes the DOM for session
  recording and is a classic forced-reflow + long-task generator. Its cost scales with DOM
  size, and va-disability has a large, deeply-nested interactive form.

**Most probable real cause:** main-thread time is dominated by **hydrating a large client
component bundle** (`VADisabilityCalculator` + `VADisabilityUnlocks` are sizable
`'use client'` trees) **plus Clarity's DOM instrumentation**, not by the rating arithmetic.

**Direction for the later build (not implemented):**
1. Gate/defer Clarity (production + hostname gate like GA, or `strategy="lazyOnload"`) and
   re-measure TBT/long-tasks/forced-reflow — likely the biggest single lever.
2. Reduce the hydrated client surface (e.g. split `VADisabilityUnlocks`, which only matters
   after a rating is entered, behind a dynamic import / interaction).
3. The `useMemo` compute pattern is fine as-is; debouncing is **not** warranted because the
   inputs are discrete and the label field doesn't trigger compute. Re-verify only if a future
   trace actually attributes long tasks to the calc functions.

---

## 5. Code-determined vs. needs runtime confirmation

**Determined from code (high confidence):**
- The `<h1>` is static text in a **server component** (`page.tsx:38,100-102`) — **not**
  injected or revealed by a client component. Hydration is ruled out as the cause; the fix
  space is CSS/critical-chain, not client rendering.
- Font is `next/font/google` Inter, variable (incl. weight 800), `display: 'swap'`, applied via
  Tailwind v4 `@theme` → preflight. `preload`/`adjustFontFallback` use their `true` defaults.
- CLS = 0 is consistent with the metric-matched fallback working, which is why this is not FOIT.
- The Tailwind CSS bundle is the one hard render-blocking resource on first paint.
- GA4 and Clarity are `afterInteractive` (not first-paint-blocking); Clarity is ungated by env/host.
- No forced-reflow-causing layout reads exist in app code (grep-confirmed).
- On mobile, the hero `desk-soldier.png` is `hidden sm:block` (`page.tsx:70`) → not loaded on
  mobile, so it is **not** an LCP/contention factor for the throttled-mobile run.

**Needs a runtime trace / live `<head>` inspection to confirm:**
- Whether Next actually emits `<link rel="preload" as="font">` for the Inter file, given the
  `@theme`-indirection usage pattern. (If absent, it delays the Inter *swap*, not the heading's
  first paint — but it's worth verifying.)
- The compiled CSS bundle's actual transferred size and download time on throttled mobile, to
  quantify the render-blocking cost vs. the ~530–730ms PSI estimate.
- Whether the 1.4s gap between FCP (~0.9s) and the LCP heading paint is dominated by late CSS
  arrival vs. main-thread contention (hydration + Clarity) deferring the paint commit. A
  Performance-panel trace under 4× CPU throttle would attribute this directly.
- For va-disability: a main-thread trace to confirm Clarity + hydration (not the rating math)
  own the 11 long tasks and the forced-reflow flag.

---

*Investigation only — no fixes implemented, nothing pushed.*
