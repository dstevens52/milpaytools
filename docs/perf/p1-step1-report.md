# P1 performance — Step 1 measurement report (FIX_QUEUE row 11)

**Date:** 2026-11-19 · **Branch:** `perf/measure` (tooling and docs only; no app code changed) · **Status: HOLD** for Claude Chat to pick the Step 2 fixes.

**Sources**
- CI workflow `.github/workflows/perf-measure.yml`. Runs [44612766179](https://github.com/dstevens52/milpaytools/actions/runs/44612766179) and [44615269180](https://github.com/dstevens52/milpaytools/actions/runs/44615269180). Tables below come from the second run; the first agreed within a few percent. Artifact `perf-out`, kept 30 days, holds the JSON, Chrome traces and Turbopack analyzer data.
- Production HTML weight: `scripts/perf/html-weight.sh` (curl, all 263 sitemap URLs) → `p1-step1-html-weight-prod.tsv`.
- Full generated tables: `p1-step1-ci-summary.md`.

**Lab setup and limits.** Chromium uses Playwright's Pixel 7 profile (412×915, touch) with 4× CPU throttling and no network throttling. WebKit uses the iPhone 14 profile and can't be CPU-throttled. Lab numbers rank problems; they don't reproduce field values. The CI runner with 4× throttling is still faster than a mid-range phone: my desktop at 4× measured the `/bah/changes` sort at 920 ms, against 200 ms in CI. Production passes ran GA4, Clarity and Vercel Analytics with every collection request aborted (`scripts/perf/policy.ts`), so nothing was recorded.

**Tests.** No spec files changed, so no Playwright suite ran and there is no `stats` block. Local checks for the new scripts: `tsc --noEmit` exit 0; `eslint scripts/perf` clean.

**Lab vs field (needs Clarity).** Clarity reports INP ≈ 1.5 s. The worst lab interaction is about 200 ms (the `/bah/changes` sort, 4× Chromium). No single handler explains 1.5 s. Likely contributors, in order:
1. A tap during load waits behind long tasks of 100–150 ms: gtag.js, hydration, Clarity (item 6).
2. Big DOM re-renders (`/bah/changes`, `/pay/raise`), slowed further on low-end Android.
3. Possibly a Safari-only cost (WebKit ZIP entry, item 4).

Claude Chat: please pull Clarity INP **by page and by browser/OS**. If the 1.5 s comes mostly from Chrome on Android, items 6/4 fit. If iPhone Safari reports INP at all and dominates, the WebKit lead in item 4 moves up.

---

## 1. First-load JS per route (production build in CI, `next start`)
"First-party JS" = every `/_next/static` chunk the page fetched before it went quiet. Gzip is computed with zlib level 9. Median across all 263 pages: **285.5 KB gzip** (min 158.1, max 400.9). Next.js 16 no longer prints sizes in `next build`, so these are measured per page in the browser.

**15 heaviest pages**
| Page | JS files | JS raw KB | JS gzip KB |
|---|---:|---:|---:|
| /guides/retirement-tsp | 19 | 1400.2 | 400.9 |
| /calculators/retirement | 18 | 1334.3 | 380.5 |
| /calculators/tsp | 18 | 1324.6 | 377.7 |
| / | 24 | 1132.9 | 329.4 |
| /guides/pcs | 19 | 1043.1 | 301.2 |
| /guides/va-home-loans | 19 | 1017.4 | 290.1 |
| /calculators/transition-readiness | 18 | 1006.7 | 289.1 |
| /transition | 18 | 1006.7 | 289.1 |
| /bah/fort-bragg (and all CONUS station pages, same chunks) | 19 | 997.2 | 285.5 |

(Places 10–15 are more station pages at 997.2 / 285.5.)

**Top-traffic pages**
| Page | JS files | JS raw KB | JS gzip KB |
|---|---:|---:|---:|
| /calculators/deployment | 17 | 958.6 | 274.4 |
| /calculators/pcs | 18 | 980.0 | 280.6 |
| /calculators/total-compensation | 16 | 892.7 | 253.2 |
| /pay/raise | 18 | 929.8 | 266.3 |
| /bah/naval-station-norfolk | 19 | 997.2 | 285.5 |
| /bah/fort-bragg | 19 | 997.2 | 285.5 |
| /bah | 20 | 982.7 | 283.0 |
| /bah/changes | 19 | 955.0 | 272.9 |
| /calculators/va-disability | 18 | 960.5 | 274.0 |
| /pay/e5 | 19 | 930.1 | 266.6 |

Every page also loads 112 KB raw / 19.7 KB gzip of render-blocking CSS and 47–131 KB of fonts. On production, gtag.js adds 500.8 KB raw / 168 KB gzip, the largest single script on every page (item 6).

## 2. HTML weight per page (production, curl, 2026-11-19)
All 263 sitemap URLs returned 200. "Wire" = bytes actually sent (Brotli).

| Page | raw KB | gzip -9 KB | wire (br) KB | RSC payload KB* |
|---|---:|---:|---:|---:|
| /calculators/deployment | 103.3 | 21.5 | 18.6 | 48.1 |
| /calculators/pcs | 116.0 | 23.4 | 21.3 | 50.0 |
| /calculators/total-compensation | 117.3 | 23.2 | 20.2 | 56.0 |
| **/pay/raise** | **833.2** | 41.0 | 33.6 | **511.9** |
| /bah/naval-station-norfolk | 141.9 | 23.4 | 21.2 | 40.9 |
| /bah/fort-bragg | 136.4 | 23.0 | 20.8 | 39.0 |
| **/bah** | **454.6** | **89.5** | **87.2** | **316.3** (one 242.5 KB row: the `#stations` section) |
| **/bah/changes** | **372.1** | 43.2 | 41.9 | 110.6 (one 45.9 KB row: the all-areas table) |
| /calculators/va-disability | 126.4 | 24.6 | 20.9 | 62.7 |
| /pay/e5 | 100.2 | 18.6 | 16.5 | 53.0 |

\*RSC payload = the `self.__next_f` scripts inside the HTML, the serialized React tree used for hydration. Measured on the CI build (≈ production).

Largest overall: `/pay/raise` 833 KB, `/bah` 455 KB, `/bah/changes` 372 KB, `/pay` 178 KB, `/transition` 169 KB, then guides and station pages at 140–163 KB. `/pay/raise` server-renders **22 pay tables (704 rows)**, one per years-of-service panel, and shows one at a time. Its RSC payload repeats the same tables (511.9 KB). That's small on the wire (34 KB br) but about 0.8 MB for a phone to parse.

## 3. What runs on load: client JS by module (Turbopack analyzer)
From `next experimental-analyze -o`, read by `scripts/perf/analyze-modules.ts`. "Compressed" is the analyzer's own estimate. The nomodule polyfill (110 KB) is excluded because modern browsers don't download it. Turbopack 16.2 ignores `productionBrowserSourceMaps` (51 of 52 chunks had no map in run 1), so source maps weren't usable.

| Module / package | total comp | station (/bah/[slug]) | /bah/changes | notes |
|---|---:|---:|---:|---|
| Next.js router/runtime | 269.6 (110.3) | 284.5 (118.0) | 269.6 (110.3) | framework baseline, every page |
| react-dom | 198.7 (62.7) | 198.7 (62.7) | 198.7 (62.7) | framework baseline |
| **src/data/duty-stations/stations.ts** | **228.9 (57.4)** | — | — | full station records for type-ahead (item 5) |
| react-server-dom + react | 31.7 (10.9) | 31.7 (10.9) | 31.7 (10.9) | baseline |
| page component | TotalCompensationCalculator 20.3 | StationPageClient 26.6 + StationTotalPayTable 6.3 + CollapsibleRateTable 4.3 | BahChangesTable 3.7 | |
| src/data/calculatorUrlParams.ts | 17.7 (5.0) | — | — | on 19 calculator routes |
| Nav.tsx | 9.9 | 9.9 | 9.9 | every page |
| installations-lookup + BaseSearchInput | 16.9 | — | — | |
| @vercel/analytics | 2.5 | 2.5 | 2.5 | |
| **Total client JS** | **845.8 (283.9)** | **589.4 (218.0)** | **537.7 (198.7)** | KB minified (compressed) |

Other routes: retirement / TSP / `/guides/retirement-tsp` add **recharts 207–212 KB (≈90 KB compressed)**, plus es-toolkit 18 KB and immer 17 KB. No chart library appears on the three traced pages. Fonts: Inter (next/font, `display: swap`), 47 KB on most pages and 131 KB where extra weights are used.

**Not JS, but the biggest single download found:** `/images/desk-soldier.png`, **1,734,360 bytes** (1916×821 PNG). It's the hero background of `/calculators/total-compensation`, inside a `hidden sm:block` wrapper. Browsers still download an `<img>` under `display:none`, so **phones download it on total comp** (Pixel 7 viewport: requested at +305 ms). It also downloads **wherever a link to total comp is on screen**, through Next's link prefetch. On station pages the "total pay" link (`/calculators/total-compensation?rank=e5&zip=…`) triggers it at about +1.0–1.4 s on a phone. At desktop width the header link triggers it on **every page** (route-weights run: 1.74 MB of images on all pages measured).

## 4. Interaction cost (CI, median of 3 runs)
**Chromium, Pixel 7, 4× CPU, local build (no analytics)**
| Page | DOM nodes | load long tasks (ms total / blocking) | interaction | Event Timing ms | breakdown (delay / processing / presentation) |
|---|---:|---|---|---:|---|
| total comp | 569 | 3 (243 / 93) | rank select | 16 | 2 / 8 / 6 |
| | | | ZIP typed | 24 | worst on the 5th digit |
| /bah/fort-bragg | 1,035 | 2 (214 / 114) | pay grade select | 56 | ~7 / **45** / 12 (React re-render of StationPageClient) |
| **/bah/changes** | **2,678** | 4 (437 / 237) | **sort by name** | **200** | 2 / 1 / **~220** (re-layout of 338 rows) |

**Production with analytics running (collection blocked), same profile**
| Page | load long tasks (ms total / blocking) | interaction | Event Timing ms |
|---|---|---|---:|
| total comp | 6 (529 / 229) | rank select / ZIP | 16 / 24 |
| /bah/fort-bragg | 5 (491 / 241) | pay grade select | 72 |
| /bah/changes | 8 (771 / 371) | sort by name | 192 |

Top scripts in long animation frames during load (production, first of the 3 runs):
- `/bah/changes`: gtag.js eval 130 ms; first-party chunk eval 106 ms; gtag timer 95 ms; React hydration task 88 ms; Clarity about 63 ms.
- `/bah/fort-bragg`: gtag eval 153 ms; first-party chunk 104 ms; gtag timer 98 ms; Clarity 63 ms.
- total comp: gtag eval 127 ms; Turbopack runtime chunk 111 ms; gtag timer 99 ms; Clarity 64 ms.

On interactions, the time is React's discrete-event handler (react-dom chunk), plus layout/paint for `/bah/changes`. Clarity's mutation observer adds a timer task after DOM-heavy changes (62 ms after the sort in the desktop smoke run).

**WebKit, iPhone 14, unthrottled:** sort 80 ms, grade select 24 ms, rank select ≤ 64 ms. **Lead:** ZIP entry on total comp shows a **184 ms median (200–336 ms)** Event Timing entry on the keyup of the 5th digit, all of it "presentation". Chromium at 4× shows 24 ms, and the in-page input-to-next-frame for that same key is only about 53 ms. This may be an artifact of headless WebKit on Linux. It should be checked on a real iPhone (Safari Web Inspector timeline) before anything is built for it.

## 5. Data shipped to the browser
| Module in client JS | KB minified | routes |
|---|---:|---|
| **src/data/duty-stations/stations.ts** | **228.9** (57 compressed) | 8: /bah, total comp, PCS, compare, COLA, dual-military BAH, transition readiness, VA loan |
| src/data/calculatorUrlParams.ts | 17.7 | 19 calculator routes (the whole parameter list, for one calculator's keys) |
| src/data/state-military-retirement-tax.ts | 11.9 | transition readiness |
| src/data/installations-lookup.ts | 8.9 | the same 8 as stations.ts |
| pay tables, VA rates, OCONUS station files | 2.7–4.5 each | per calculator; these are slices |

Cause of the big one: `BaseSearchInput` → `src/lib/stationSearch.ts` imports `DUTY_STATIONS`, the full records with housing tips, neighborhoods and market data, to search names and ZIPs. The station page itself (04b) and `/bah/changes` are already server-first: neither ships `stations.ts`. The BAH rate table (`mhaRates.ts`, 189 KB) and ZIP map (`zipToMha.ts`, 656 KB) are **not** in any client chunk; lookups go through `/api/bah/lookup`.

RSC payload (data serialized into the HTML):
- `/bah`: 242.5 KB for the station-card section (147 cards rendered by the client `StationSearch` component).
- `/pay/raise`: 512 KB of repeated server markup (22 panels).
- `/bah/changes`: 46 KB for the 338-row table props.

## 6. Third-party scripts (production, Chromium 4×)
| Script | How it loads | starts (ms after navigation, run 1) | size | main-thread during load (median, 4×) |
|---|---|---|---|---:|
| GA4 `gtag/js` | `next/script` afterInteractive, inline loader injects async script | 515–694 | 500.8 KB raw / 168 KB gz | **≈ 221–229 ms** (eval 127–153 ms + timer 95–99 ms) |
| Vercel Analytics `/_vercel/insights/script.js` | `<Analytics />` | 519–698 | 4.4 KB | ≈ 0 |
| Microsoft Clarity tag + `clarity.js` | `lazyOnload` (after load) | 583–747 tag, 889–1035 runtime | not measured (cross-origin, no Timing-Allow-Origin) | ≈ 63–65 ms (+ timer work after DOM changes) |
| First-party chunks (for comparison) | | | | 85–195 ms |

None of them blocks first render: they start after hydration, and Clarity after the load event. During load, GA4 is **the largest single main-thread cost on every page**, more than any first-party chunk. A tap in roughly the first 1–1.5 s on a slow phone can wait behind a gtag task of 100–150 ms at 4×, likely more on low-end devices. Speed Insights isn't installed.

---

## Candidate fixes, ranked (none built)
| # | Fix | Expected gain | Risk | Pages helped |
|---|---|---|---|---|
| 1 | **desk-soldier.png**: re-encode (AVIF/WebP at real display size; estimate ~80–150 KB) and stop phones and prefetches downloading it (`<picture>` with a `min-width` media source and an empty fallback, or a CSS background on `sm:`). | **−1.6 to −1.73 MB per affected visit**; LCP on slow phone networks (it competes with the HTML, CSS and JS) | Low (one desktop image; visual check) | total comp on phones; every station page on phones (prefetch); every page on desktop (header prefetch) |
| 2 | **Slim station-search index**: a generated or derived list of name, slug, ZIP, aliases and state for `stationSearch.ts`, not `DUTY_STATIONS`. Same search results, locked by a test that the slim list matches the full one. | **≈ −215 KB minified / −50 KB compressed JS** per route; less parse/compile (est. 20–60 ms at 4×) | Low–medium (search behavior must be identical; existing BaseSearchInput specs) | /bah, total comp, PCS, compare, COLA, dual-military BAH, transition readiness, VA loan |
| 3 | **Defer GA4** until first interaction or idle after load (keep the URL cleaning and opt-out; Clarity already uses lazyOnload). | **≈ −220 ms main-thread time in the load window per page** (4×); fewer early taps waiting | Medium: page_views from very short visits may drop; GA4 key-event setup (02b-2) and `GaPageView` must keep working; check GA4 numbers the week after | every page |
| 4 | **/bah/changes table**: hydrate and render without all 338 rows at once (first N rows + "show all", or `content-visibility: auto` on the table body), and keep server-rendered rows for crawlers. | Sort **≈ 200 → < 80 ms** (4×); load blocking −100 ms (est.) | Low–medium (bah-changes specs count rows; release-day page) | /bah/changes |
| 5 | **/bah station list**: render the 147 cards on the server and keep only the filter input client-side (hide or show by DOM, or pass a slim list). | HTML **−~240 KB raw / −~45 KB br** on /bah; hydration of 147 cards removed | Low–medium (links must stay in HTML for SEO; filter behavior) | /bah (top traffic) |
| 6 | **/pay/raise panels**: send the 22 YOS panels as one compact data prop rendered by the existing client panel switcher (still SSR'd, so the HTML keeps the default panel), or render only the default panel plus "Full chart". | HTML **−~450 to −700 KB raw** (−~15 KB br); parse time on phones | Medium (SEO content of all panels, pay meta guard until ~Dec 10, raise specs) | /pay/raise |
| 7 | **recharts on demand**: dynamic-import the chart below the fold. | ≈ −90 KB compressed JS | Low–medium | retirement, TSP, /guides/retirement-tsp (not top-traffic) |
| 8 | **Station grade select**: memoize the rank-independent sections of `StationPageClient`. | ≈ 56 → ~25 ms (4×) | Low | 142 station pages |
| — | WebKit ZIP-entry lead (item 4) | unknown | — | Verify on a real iPhone first |

Not worth doing: framework baseline (Next + React ≈ 500 KB minified, about 185 KB compressed, on every page), the nomodule polyfill (not downloaded), `calculatorUrlParams.ts` (5 KB compressed).

**Every Step 2 fix keeps outputs identical** (math and data specs green) and keeps the 1c pre-hydration behavior. Each is checked before and after with the same workflow: push to `perf/fixes` runs `perf-measure.yml` unchanged.

## Notes
- **Stray analytics hits (my mistake).** An early smoke run of `route-weights.ts` against production (before the no-collection policy existed) loaded `/bah`, `/bah/changes` and `/calculators/total-compensation` once each with GA4 and Vercel Analytics live. That's probably 3 GA4 page views and 3 Vercel page views from headless Chromium earlier on 2026-11-19. Clarity was not loaded (webdriver skip). Every run since, including all CI runs, aborts all collection requests.
- Production passes keep `navigator.webdriver` false so Clarity loads (its loader skips automated browsers). Collection is still blocked at the network level (`policy.ts` lists what's allowed).
