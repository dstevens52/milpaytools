## 1. First-load JS per page (local production build, 263 sitemap pages)
First-party = `/_next/static` chunks fetched before the page went quiet. Sorted by gzip.

**15 heaviest**
| Page | JS files | JS raw KB | JS gzip KB | CSS raw KB |
|---|---:|---:|---:|---:|
| /guides/retirement-tsp | 19 | 1400.2 | 400.9 | 112.0 |
| /calculators/retirement | 18 | 1334.3 | 380.5 | 112.0 |
| /calculators/tsp | 18 | 1324.6 | 377.7 | 112.0 |
| / | 24 | 1132.9 | 329.4 | 112.0 |
| /guides/pcs | 19 | 1043.1 | 301.2 | 112.0 |
| /guides/va-home-loans | 19 | 1017.4 | 290.1 | 112.0 |
| /calculators/transition-readiness | 18 | 1006.7 | 289.1 | 112.0 |
| /transition | 18 | 1006.7 | 289.1 | 112.0 |
| /bah/fort-bragg | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-campbell | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-hood | 19 | 997.2 | 285.5 | 112.0 |
| /bah/joint-base-lewis-mcchord | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-carson | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-drum | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-bliss | 19 | 997.2 | 285.5 | 112.0 |

**Top-traffic pages**
| Page | JS files | JS raw KB | JS gzip KB | CSS raw KB |
|---|---:|---:|---:|---:|
| /calculators/deployment | 17 | 958.6 | 274.4 | 112.0 |
| /calculators/pcs | 18 | 980.0 | 280.6 | 112.0 |
| /calculators/total-compensation | 16 | 892.7 | 253.2 | 112.0 |
| /pay/raise | 18 | 929.8 | 266.3 | 112.0 |
| /bah/naval-station-norfolk | 19 | 997.2 | 285.5 | 112.0 |
| /bah/fort-bragg | 19 | 997.2 | 285.5 | 112.0 |
| /bah | 20 | 982.7 | 283.0 | 112.0 |
| /bah/changes | 19 | 955.0 | 272.9 | 112.0 |
| /calculators/va-disability | 18 | 960.5 | 274.0 | 112.0 |
| /pay/e5 | 19 | 930.1 | 266.6 | 112.0 |

Median first-party JS (gzip) across all pages: 285.5 KB; min 158.1 KB; max 400.9 KB.

## 2b/5. HTML composition (local build): RSC payload = data serialized for hydration
| Page | HTML raw KB | HTML gzip KB | RSC payload KB | JSON-LD KB | Largest RSC row KB | Largest row starts with |
|---|---:|---:|---:|---:|---:|---|
| /calculators/deployment | 97.6 | 20.2 | 48.1 | 0.5 | 4.9 | `0:{"P":null,"c":["","calculators","deployment"],"q":"","i":false,"f":[` |
| /calculators/pcs | 110.0 | 22.1 | 50.0 | 3.5 | 4.9 | `0:{"P":null,"c":["","calculators","pcs"],"q":"","i":false,"f":[[["",{"` |
| /calculators/total-compensation | 111.4 | 21.9 | 56.0 | 1.6 | 4.9 | `0:{"P":null,"c":["","calculators","total-compensation"],"q":"","i":fal` |
| /pay/raise | 827.3 | 39.8 | 511.9 | 4.7 | 5.0 | `1a:Tf3a,{"@context":"https://schema.org","@type":"FAQPage","mainEntity` |
| /bah/naval-station-norfolk | 136.3 | 21.5 | 40.9 | 5.4 | 12.8 | `24:["$","$L25",null,{"station":{"name":"Naval Station Norfolk","slug":` |
| /bah/fort-bragg | 130.7 | 20.8 | 39.0 | 4.7 | 11.8 | `24:["$","$L25",null,{"station":{"name":"Fort Bragg","slug":"fort-bragg` |
| /bah | 448.8 | 87.9 | 316.3 | 3.5 | 242.5 | `20:["$","section",null,{"id":"stations","className":"bg-zinc-50 border` |
| /bah/changes | 366.6 | 42.1 | 110.6 | 3.7 | 45.9 | `34:["$","section",null,{"aria-labelledby":"all-h","children":[["$","h2` |
| /calculators/va-disability | 120.6 | 23.4 | 62.7 | 3.7 | 4.9 | `0:{"P":null,"c":["","calculators","va-disability"],"q":"","i":false,"f` |
| /pay/e5 | 94.7 | 16.6 | 53.0 | 3.5 | 4.9 | `0:{"P":null,"c":["","pay","e5"],"q":"","i":false,"f":[[["",{"children"` |
| /pay | 172.5 | 21.7 | 52.3 | 2.8 | 4.8 | `0:{"P":null,"c":["","pay"],"q":"","i":false,"f":[[["",{"children":["pa` |
| /transition | 162.2 | 26.3 | 90.4 | 0.6 | 4.8 | `0:{"P":null,"c":["","transition"],"q":"","i":false,"f":[[["",{"childre` |
| /guides/va-home-loans | 157.1 | 28.2 | 88.8 | 4.9 | 5.1 | `1a:T10e6,{"@context":"https://schema.org","@type":"FAQPage","mainEntit` |
| /guides/va-disability | 138.4 | 27.3 | 77.9 | 4.6 | 4.9 | `0:{"P":null,"c":["","guides","va-disability"],"q":"","i":false,"f":[[[` |
| /bah/joint-base-myer-henderson-hall | 138.3 | 21.9 | 41.0 | 5.6 | 12.6 | `24:["$","$L25",null,{"station":{"name":"Joint Base Myer-Henderson Hall` |

## 3. What each route’s client JS is made of (Turbopack analyzer; all client chunks of the route; nomodule polyfill excluded)
**/calculators/total-compensation** — 845.8 KB minified / 283.9 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| src/data/duty-stations/stations.ts | 228.9 | 57.4 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/components/calculators/total-compensation/TotalCompensationCalculator.tsx | 20.3 | 6.0 |
| src/data/calculatorUrlParams.ts | 17.7 | 5.0 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| src/data/installations-lookup.ts | 8.9 | 2.7 |
| npm:react (via next) | 8.0 | 3.2 |
| src/components/calculators/shared/BaseSearchInput.tsx | 8.0 | 2.2 |

**/bah/[slug]** — 589.4 KB minified / 218.0 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 284.5 | 118.0 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| src/components/calculators/bah/StationPageClient.tsx | 26.6 | 7.5 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| npm:react (via next) | 8.0 | 3.2 |
| src/components/calculators/bah/StationTotalPayTable.tsx | 6.3 | 2.3 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |
| src/components/calculators/bah/CollapsibleRateTable.tsx | 4.3 | 1.4 |
| npm:@vercel/analytics | 2.5 | 1.1 |

**/bah/changes** — 537.7 KB minified / 198.7 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| npm:react (via next) | 8.0 | 3.2 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |
| src/components/bah-stations/BahChangesTable.tsx | 3.7 | 1.3 |
| npm:@vercel/analytics | 2.5 | 1.1 |
| [turbopack]/browser/runtime/dom/runtime-backend-dom.ts | 2.5 | 0.9 |
| [turbopack]/browser/runtime/base/runtime-base.ts | 2.3 | 1.1 |

**/calculators/deployment** — 598.9 KB minified / 220.5 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| src/components/calculators/deployment/DeploymentCalculator.tsx | 25.5 | 7.8 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/data/calculatorUrlParams.ts | 17.7 | 5.0 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| npm:react (via next) | 8.0 | 3.2 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |
| src/components/calculators/shared/SaveOrShareResults.tsx | 4.7 | 1.7 |
| src/data/pay-tables/2026.ts | 2.7 | 1.2 |

**/calculators/pcs** — 871.2 KB minified / 293.4 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| src/data/duty-stations/stations.ts | 228.9 | 57.4 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| src/components/calculators/pcs/PCSCalculator.tsx | 26.7 | 8.2 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/data/calculatorUrlParams.ts | 17.7 | 5.0 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| src/data/installations-lookup.ts | 8.9 | 2.7 |
| npm:react (via next) | 8.0 | 3.2 |
| src/components/calculators/shared/BaseSearchInput.tsx | 8.0 | 2.2 |

**/pay/raise** — 569.5 KB minified / 210.3 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/data/calculatorUrlParams.ts | 17.9 | 5.0 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| npm:react (via next) | 8.0 | 3.2 |
| src/components/calculators/pay-raise/PayRaiseCalculator.tsx | 5.7 | 2.1 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |
| src/data/pay-tables/2026.ts | 2.7 | 1.2 |
| npm:@vercel/analytics | 2.5 | 1.1 |

**/bah** — 830.8 KB minified / 278.6 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| src/data/duty-stations/stations.ts | 228.9 | 57.4 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/data/calculatorUrlParams.ts | 17.7 | 5.0 |
| src/components/calculators/bah/BAHCalculator.tsx | 12.4 | 4.2 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| src/data/installations-lookup.ts | 8.9 | 2.7 |
| npm:react (via next) | 8.0 | 3.2 |
| src/components/calculators/shared/BaseSearchInput.tsx | 8.0 | 2.2 |

**/calculators/va-disability** — 600.8 KB minified / 220.3 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/data/calculatorUrlParams.ts | 17.7 | 5.0 |
| src/components/calculators/va-disability/VADisabilityCalculator.tsx | 15.7 | 4.9 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| src/components/calculators/va-disability/VADisabilityUnlocks.tsx | 9.4 | 3.1 |
| npm:react (via next) | 8.0 | 3.2 |
| src/lib/calculations/va-disability.ts | 5.5 | 2.2 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |

**/pay/[rank]** — 532.7 KB minified / 196.9 KB compressed
| Module or package | KB | compressed KB |
|---|---:|---:|
| npm:next (router/runtime) | 269.6 | 110.3 |
| npm:react-dom (via next) | 198.7 | 62.7 |
| npm:react-server-dom (via next) | 23.7 | 7.7 |
| src/components/layout/Nav.tsx | 9.9 | 2.4 |
| npm:react (via next) | 8.0 | 3.2 |
| [turbopack]/shared/runtime/runtime-utils.ts | 5.1 | 2.2 |
| npm:@vercel/analytics | 2.5 | 1.1 |
| [turbopack]/browser/runtime/dom/runtime-backend-dom.ts | 2.5 | 0.9 |
| [turbopack]/browser/runtime/base/runtime-base.ts | 2.3 | 1.1 |
| src/components/EmailSignup.tsx | 2.2 | 1.1 |

## 5. `src/data` and `src/lib` modules in client JS (top 20)
| Module | KB (minified) | routes shipping it |
|---|---:|---|
| src/data/duty-stations/stations.ts | 228.9 | 8: /bah, /calculators/cola, /calculators/compare, /calculators/dual-military-bah, /calculators/pcs, /calculators/total-compensation, /calculators/transition-readiness, /calculators/va-loan |
| src/data/calculatorUrlParams.ts | 17.7 | 19: /bah, /calculators/cola, /calculators/compare, /calculators/deployment, /calculators/dual-military-bah, /calculators/education, /calculators/guard-reserve, /calculators/healthcare-comparison, … |
| src/data/state-military-retirement-tax.ts | 11.9 | 1: /calculators/transition-readiness |
| src/data/installations-lookup.ts | 8.9 | 8: /bah, /calculators/cola, /calculators/compare, /calculators/dual-military-bah, /calculators/pcs, /calculators/total-compensation, /calculators/transition-readiness, /calculators/va-loan |
| src/lib/calculations/transition-readiness.ts | 8.4 | 1: /calculators/transition-readiness |
| src/lib/calculations/education.ts | 8.2 | 1: /calculators/education |
| src/data/duty-stations/coordinates.ts | 5.8 | 1: /calculators/pcs |
| src/lib/calculations/va-disability.ts | 5.5 | 1: /calculators/va-disability |
| src/data/oconus/ramstein.ts | 4.5 | 1: /calculators/pcs |
| src/data/oconus/raf-lakenheath.ts | 4.1 | 1: /calculators/pcs |
| src/data/va-rates/2026.ts | 4.0 | 3: /calculators/retirement, /calculators/transition-readiness, /calculators/va-disability |
| src/lib/calculations/retirement.ts | 3.7 | 2: /calculators/retirement, /calculators/transition-readiness |
| src/data/oconus/yokota-air-base.ts | 3.6 | 1: /calculators/pcs |
| src/data/oconus/camp-humphreys.ts | 3.5 | 1: /calculators/pcs |
| src/data/compare/stateTax.ts | 3.2 | 1: /calculators/compare |
| src/data/oconus/kadena-air-base.ts | 3.1 | 1: /calculators/pcs |
| src/data/pay-tables/2026.ts | 2.7 | 9: /calculators/compare, /calculators/deployment, /calculators/guard-reserve, /calculators/retirement, /calculators/total-compensation, /calculators/transition-readiness, /calculators/tsp, /pay, … |
| src/lib/calculations/healthcare.ts | 2.3 | 1: /calculators/healthcare-comparison |
| src/lib/calculations/deployment.ts | 2.3 | 1: /calculators/deployment |
| src/lib/calculations/tspGrowth.ts | 2.3 | 3: /calculators/retirement, /calculators/transition-readiness, /calculators/tsp |

## 4/6. Main thread — local build, Chromium Pixel 7, 4× CPU (3 runs, median)
| Page | status | DOM nodes | FCP ms | LCP ms | load long tasks | long-task ms | blocking ms (TBT-like) | interaction | worst interaction ms (Event Timing) | input→next frame ms | value changed |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|
| /calculators/total-compensation | 200 | 569 | 172 | 172 | 3 | 243 | 93 | rank select (ArrowDown) | 16 | 16 | yes |
|  |  |  |  |  |  |  |  | duty station / ZIP typed | 24 | 28 | yes |
| /bah/fort-bragg | 200 | 1035 | 200 | 200 | 2 | 214 | 114 | pay grade select (ArrowDown) | 56 | 60 | yes |
| /bah/changes | 200 | 2678 | 260 | 260 | 4 | 437 | 237 | sort by name (click) | 200 | 208 | yes |

**/calculators/total-compensation** — run 1 top long tasks during load: 105 ms @257, 86 ms @88, 60 ms @410, 52 ms @175
Top LoAF scripts during load (run 1): 103 ms classic-script `/_next/static/chunks/0.~2ky53fo~10.js`  (http://localhost:3000/_next/static/chunks/0.~2ky53); 60 ms event-listener `/_next/static/chunks/0.~2ky53fo~10.js` fn O (MessagePort.onmessage); 5 ms classic-script `/_next/static/chunks/turbopack-122.rs5.89ha8.js`  (http://localhost:3000/_next/static/chunks/turbopac)
- rank select (ArrowDown) on `SELECT#rank-/-pay-grade` (E-5 → E-6): keydown 16 ms [delay 3 / processing 8 / presentation 5]
- duty station / ZIP typed on `INPUT#duty-station` ( → 28310): pointerdown 16 ms [delay 5 / processing 1 / presentation 10], keydown 16 ms [delay 0 / processing 1 / presentation 15], keydown 16 ms [delay 1 / processing 1 / presentation 15], keydown 32 ms [delay 1 / processing 1 / presentation 31]
  - LoAF scripts: 9 ms event-listener MessagePort.onmessage `/_next/static/chunks/0.~2ky53fo~10.js`
- CPU profile, load (self time by source): ((idle)) 2515, ((program)) 191, chunk:0.~2ky53fo~10.js 98, chunk:turbopack-122.rs5.89ha8.js 85, chunk:0-~ji4117.d54.js 38, chunk:0l-z443b9x8mf.js 37, ((garbage collector)) 4, chunk:0svcpwq6q.jna.js 4, chunk:0e03.-~8.pkyr.js 2, (fetch) 2, (appendChild) 2, chunk:0pqt~8bl3ukh4.js 1
- CPU profile, rank select (ArrowDown): ((idle)) 2526, ((program)) 107, (native) 12, (query) 6, (InjectedScript) 4, chunk:0.~2ky53fo~10.js 3, (focus) 2, (evaluate) 2, (fetch) 2, chunk:0e03.-~8.pkyr.js 2
- CPU profile, duty station / ZIP typed: ((idle)) 3212, ((program)) 161, chunk:0.~2ky53fo~10.js 28, chunk:0l-z443b9x8mf.js 6, (native) 5, ((garbage collector)) 4, (query) 3, (evaluate) 2, (fetch) 2, chunk:0svcpwq6q.jna.js 2

**/bah/fort-bragg** — run 1 top long tasks during load: 107 ms @73, 106 ms @211
Top LoAF scripts during load (run 1): 104 ms classic-script `/_next/static/chunks/0.~2ky53fo~10.js`  (http://localhost:3000/_next/static/chunks/0.~2ky53)
- pay grade select (ArrowDown) on `SELECT#station-pay-grade` (E-5 → E-6): keydown 56 ms [delay 5 / processing 46 / presentation 5]
- CPU profile, load (self time by source): ((idle)) 2519, ((program)) 251, chunk:0.~2ky53fo~10.js 102, chunk:turbopack-122.rs5.89ha8.js 76, chunk:0-~ji4117.d54.js 60, chunk:0nhjz8oh.d3as.js 32, (fetch) 9, chunk:11_.17s61-p07.js 7, chunk:0-qctnuguwpjb.js 5, ((garbage collector)) 4, chunk:0e03.-~8.pkyr.js 4, (appendChild) 3
- CPU profile, pay grade select (ArrowDown): ((idle)) 2515, ((program)) 141, chunk:0.~2ky53fo~10.js 23, (query) 11, (native) 10, chunk:0-~ji4117.d54.js 6, (InjectedScript) 4, (evaluate) 4, chunk:11_.17s61-p07.js 3, ((garbage collector)) 2

**/bah/changes** — run 1 top long tasks during load: 169 ms @85, 109 ms @354, 90 ms @521, 79 ms @271
Top LoAF scripts during load (run 1): 107 ms classic-script `/_next/static/chunks/0.~2ky53fo~10.js`  (http://localhost:3000/_next/static/chunks/0.~2ky53); 90 ms event-listener `/_next/static/chunks/0.~2ky53fo~10.js` fn O (MessagePort.onmessage)
- sort by name (click) on `BUTTON` ( → ): pointerdown 216 ms [delay 7 / processing 2 / presentation 207]
  - LoAF scripts: 101 ms event-listener #document.onclick `/_next/static/chunks/0.~2ky53fo~10.js`
- CPU profile, load (self time by source): ((idle)) 2508, ((program)) 345, chunk:0.~2ky53fo~10.js 96, chunk:0xpee2mj1yxao.js 87, chunk:turbopack-122.rs5.89ha8.js 68, chunk:0-~ji4117.d54.js 46, ((garbage collector)) 9, chunk:0-qctnuguwpjb.js 9, chunk:0e03.-~8.pkyr.js 5, (RegExp: [\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight) 3, chunk:0n4z.7yu76je-.js 2, (appendChild) 2
- CPU profile, sort by name (click): ((idle)) 2469, ((program)) 260, chunk:0xpee2mj1yxao.js 60, chunk:0-~ji4117.d54.js 47, (fetch) 33, chunk:0.~2ky53fo~10.js 30, (query) 20, (appendChild) 13, (native) 12, (decode) 6

## 4/6. Main thread — local build, WebKit iPhone 14, no throttling (input → next frame only) (3 runs, median)
| Page | status | DOM nodes | FCP ms | LCP ms | load long tasks | long-task ms | blocking ms (TBT-like) | interaction | worst interaction ms (Event Timing) | input→next frame ms | value changed |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|
| /calculators/total-compensation | 200 | 569 | 87 | 339 | 0 | 0 | 0 | rank select (ArrowDown) | 0 | 9 | yes |
|  |  |  |  |  |  |  |  | duty station / ZIP typed | 184 | 26 | yes |
| /bah/fort-bragg | 200 | 1035 | 104 | 371 | 0 | 0 | 0 | pay grade select (ArrowDown) | 24 | 21 | yes |
| /bah/changes | 200 | 2678 | 118 | 118 | 0 | 0 | 0 | sort by name (click) | 80 | 89 | yes |

**/calculators/total-compensation** — run 1 top long tasks during load: none
Top LoAF scripts during load (run 1): none
- rank select (ArrowDown) on `SELECT#rank-/-pay-grade` (E-5 → E-6): no Event Timing entry ≥16 ms
- duty station / ZIP typed on `INPUT#duty-station` ( → 28310): keyup 16 ms [delay 0 / processing 0 / presentation 16], keydown 16 ms [delay 0 / processing 0 / presentation 16], keyup 184 ms [delay 0 / processing 0 / presentation 184]

**/bah/fort-bragg** — run 1 top long tasks during load: none
Top LoAF scripts during load (run 1): none
- pay grade select (ArrowDown) on `SELECT#station-pay-grade` (E-5 → E-6): keyup 24 ms [delay 8 / processing 0 / presentation 16]

**/bah/changes** — run 1 top long tasks during load: none
Top LoAF scripts during load (run 1): none
- sort by name (click) on `BUTTON` ( → ): pointerdown 80 ms [delay 1 / processing 1 / presentation 78]

## 4/6. Main thread — production with analytics running (collection blocked), Chromium Pixel 7, 4× CPU (3 runs, median)
| Page | status | DOM nodes | FCP ms | LCP ms | load long tasks | long-task ms | blocking ms (TBT-like) | interaction | worst interaction ms (Event Timing) | input→next frame ms | value changed |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|
| /calculators/total-compensation | 200 | 578 | 248 | 248 | 6 | 529 | 229 | rank select (ArrowDown) | 16 | 16 | yes |
|  |  |  |  |  |  |  |  | duty station / ZIP typed | 24 | 31 | yes |
| /bah/fort-bragg | 200 | 1044 | 256 | 256 | 5 | 491 | 241 | pay grade select (ArrowDown) | 72 | 76 | yes |
| /bah/changes | 200 | 2687 | 292 | 292 | 8 | 771 | 371 | sort by name (click) | 192 | 192 | yes |

**/calculators/total-compensation** — run 1 top long tasks during load: 128 ms @723, 113 ms @378, 99 ms @855, 85 ms @254, 65 ms @1042
Top LoAF scripts during load (run 1): 127 ms classic-script `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (https://www.googletagmanager.com/gtag/js?id=G-YQFJ); 111 ms classic-script `/_next/static/chunks/turbopack-11g.azg79d5~8.js?dpl=dpl_ELhm`  (https://www.milpaytools.com/_next/static/chunks/tu); 99 ms user-callback `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (TimerHandler:setTimeout); 64 ms classic-script `https://scripts.clarity.ms/0.8.80-beta/clarity.js`  (https://scripts.clarity.ms/0.8.80-beta/clarity.js); 58 ms event-listener `/_next/static/chunks/0.~2ky53fo~10.js?dpl=dpl_ELhmTLQvzTBHR9` fn O (MessagePort.onmessage)
- rank select (ArrowDown) on `SELECT#rank-/-pay-grade` (E-5 → E-6): keydown 16 ms [delay 3 / processing 8 / presentation 5]
- duty station / ZIP typed on `INPUT#duty-station` ( → 28310): pointerdown 16 ms [delay 5 / processing 1 / presentation 10], keydown 16 ms [delay 0 / processing 1 / presentation 15], keydown 16 ms [delay 1 / processing 0 / presentation 15], keydown 32 ms [delay 1 / processing 0 / presentation 31]
- CPU profile, load (self time by source): ((idle)) 2741, ((program)) 226, www.googletagmanager.com 156, scripts.clarity.ms 98, chunk:0.~2ky53fo~10.js 98, chunk:turbopack-11g.azg79d5~8.js 87, chunk:0l-z443b9x8mf.js 36, chunk:125u.klmuzt88.js 35, ((garbage collector)) 14, chunk:0-qctnuguwpjb.js 7, chunk:0e03.-~8.pkyr.js 6, (native) 4
- CPU profile, rank select (ArrowDown): ((idle)) 2511, ((program)) 141, www.googletagmanager.com 22, (query) 7, (native) 7, chunk:0.~2ky53fo~10.js 4, (evaluate) 4, (InjectedScript) 3, (fetch) 3, (previewNode) 2
- CPU profile, duty station / ZIP typed: ((idle)) 3207, ((program)) 192, chunk:0.~2ky53fo~10.js 24, www.googletagmanager.com 16, (native) 7, (query) 5, chunk:0l-z443b9x8mf.js 5, (fetch) 4, ((garbage collector)) 3, (get cookie) 2
- Scripts (load order, ms from navigation start, transfer bytes): www.googletagmanager.com/gtag/js 641–711 0B; www.milpaytools.com/_vercel/insights/script.js 646–674 2380B; www.clarity.ms/tag/wpo718gj4q 688–928 0B; scripts.clarity.ms/0.8.80-beta/clarity.js 978–1041 0B
- Collection requests aborted in run 1: 15 (POST https://www.milpaytools.com/_vercel/insights/view; POST https://www.google-analytics.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh; POST https://www.google.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh1h1v924890; GET https://c.clarity.ms/c.gif; POST https://p.clarity.ms/collect; POST https://www.google-analytics.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh)

**/bah/fort-bragg** — run 1 top long tasks during load: 153 ms @592, 119 ms @114, 106 ms @267, 98 ms @759, 64 ms @953
Top LoAF scripts during load (run 1): 153 ms classic-script `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (https://www.googletagmanager.com/gtag/js?id=G-YQFJ); 104 ms classic-script `/_next/static/chunks/0-qctnuguwpjb.js?dpl=dpl_ELhmTLQvzTBHR9`  (https://www.milpaytools.com/_next/static/chunks/0-); 98 ms user-callback `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (TimerHandler:setTimeout); 63 ms classic-script `https://scripts.clarity.ms/0.8.80-beta/clarity.js`  (https://scripts.clarity.ms/0.8.80-beta/clarity.js); 6 ms classic-script `/_next/static/chunks/turbopack-11g.azg79d5~8.js?dpl=dpl_ELhm`  (https://www.milpaytools.com/_next/static/chunks/tu)
- pay grade select (ArrowDown) on `SELECT#station-pay-grade` (E-5 → E-6): keydown 72 ms [delay 5 / processing 60 / presentation 7]
  - LoAF scripts: 53 ms event-listener #document.onchange `/_next/static/chunks/0.~2ky53fo~10.js?dpl=dpl_ELhm`
- CPU profile, load (self time by source): ((idle)) 2655, ((program)) 318, www.googletagmanager.com 165, scripts.clarity.ms 141, chunk:0.~2ky53fo~10.js 111, chunk:turbopack-11g.azg79d5~8.js 75, chunk:125u.klmuzt88.js 52, chunk:0nhjz8oh.d3as.js 32, ((garbage collector)) 24, (fetch) 11, chunk:0e03.-~8.pkyr.js 6, chunk:11_.17s61-p07.js 4
- CPU profile, pay grade select (ArrowDown): ((idle)) 2517, ((program)) 170, chunk:0.~2ky53fo~10.js 19, www.googletagmanager.com 15, (native) 10, (query) 9, chunk:125u.klmuzt88.js 5, (get cookie) 4, (InjectedScript) 3, (evaluate) 3
- Scripts (load order, ms from navigation start, transfer bytes): www.googletagmanager.com/gtag/js 515–580 0B; www.milpaytools.com/_vercel/insights/script.js 519–542 2380B; www.clarity.ms/tag/wpo718gj4q 583–837 0B; scripts.clarity.ms/0.8.80-beta/clarity.js 889–951 0B
- Collection requests aborted in run 1: 8 (POST https://www.milpaytools.com/_vercel/insights/view; POST https://www.google-analytics.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh; POST https://www.google.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh1v92489035; GET https://c.clarity.ms/c.gif; POST https://r.clarity.ms/collect)

**/bah/changes** — run 1 top long tasks during load: 168 ms @122, 130 ms @794, 109 ms @310, 95 ms @927, 89 ms @555
Top LoAF scripts during load (run 1): 130 ms classic-script `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (https://www.googletagmanager.com/gtag/js?id=G-YQFJ); 106 ms classic-script `/_next/static/chunks/0pqt~8bl3ukh4.js?dpl=dpl_ELhmTLQvzTBHR9`  (https://www.milpaytools.com/_next/static/chunks/0p); 95 ms user-callback `https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52`  (TimerHandler:setTimeout); 88 ms event-listener `/_next/static/chunks/0.~2ky53fo~10.js?dpl=dpl_ELhmTLQvzTBHR9` fn O (MessagePort.onmessage); 64 ms classic-script `https://scripts.clarity.ms/0.8.80-beta/clarity.js`  (https://scripts.clarity.ms/0.8.80-beta/clarity.js); 50 ms user-callback ``  (IdleRequestCallback)
- sort by name (click) on `BUTTON` ( → ): pointerdown 208 ms [delay 6 / processing 2 / presentation 200]
  - LoAF scripts: 99 ms event-listener #document.onclick `/_next/static/chunks/0.~2ky53fo~10.js?dpl=dpl_ELhm`
- CPU profile, load (self time by source): ((idle)) 2649, ((program)) 405, scripts.clarity.ms 186, www.googletagmanager.com 156, chunk:0.~2ky53fo~10.js 105, chunk:0xpee2mj1yxao.js 87, chunk:turbopack-11g.azg79d5~8.js 70, chunk:125u.klmuzt88.js 40, ((garbage collector)) 37, chunk:0e03.-~8.pkyr.js 8, chunk:0-qctnuguwpjb.js 7, (fetch) 5
- CPU profile, sort by name (click): ((idle)) 2479, ((program)) 276, chunk:0xpee2mj1yxao.js 58, chunk:125u.klmuzt88.js 36, chunk:0.~2ky53fo~10.js 32, (fetch) 18, (query) 14, (appendChild) 13, (native) 11, (decode) 8
- Scripts (load order, ms from navigation start, transfer bytes): www.googletagmanager.com/gtag/js 694–775 0B; www.milpaytools.com/_vercel/insights/script.js 698–723 2380B; www.clarity.ms/tag/wpo718gj4q 747–995 0B; scripts.clarity.ms/0.8.80-beta/clarity.js 1035–1114 0B
- Collection requests aborted in run 1: 8 (POST https://www.milpaytools.com/_vercel/insights/view; POST https://www.google-analytics.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh; POST https://www.google.com/g/collect?v=2&tid=G-YQFJ5J3P52&gtm=45je6bh1v92489035; GET https://c.clarity.ms/c.gif; POST https://u.clarity.ms/collect)

