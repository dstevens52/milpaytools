# Indexation & Canonicalization Investigation

**Date:** 2026-06-13
**Mode:** Read-only investigation. No code changed. Live HTTP checks run against production.
**Canonical host:** `www.milpaytools.com` (`metadataBase` in `src/app/layout.tsx:17`)

---

## TL;DR

Three independent problems, none of them a `noindex` bug:

1. **www / non-www duplication is real and caused by a wrong redirect status.** The apex (`milpaytools.com`) → `www` redirect serves **HTTP 307 Temporary** at the Vercel platform layer, which preempts the correct `permanent: true` (308) rule in `next.config.ts`. A 307 does **not** tell Google to drop the non-www URL, so both stay indexed. Canonical tags themselves are correct (always `www`).
2. **The four "missing" calculators are not technically orphaned, but their crawlable internal-link profile is weak.** They are absent from the footer, their only homepage link is inside a CSS-collapsed (`max-height:0`) container, and the header nav exposes them **only** inside JS-gated dropdowns that are not in the DOM at all. Net: very low internal PageRank → "discovered – not indexed."
3. **Blog cannibalization is real.** Several near-duplicate clusters split ranking signals. Two phantom LES slugs are already 301'd; the live clusters still need consolidation.

Recommended order (cheapest + highest impact first): **www 308 fix → internal-linking fix → blog canonical/redirect consolidation.**

---

## 1. "Discovered – not indexed" root cause

### Shared technical facts (verified)

| Check | Result |
|---|---|
| `noindex` anywhere on target pages | **None.** Only `worksheet`, `feedback`, `admin/stats`, `home-v2`, `home-v3` carry `robots: { index: false }` (`grep` of `src/**`). |
| `X-Robots-Tag` header | **None** on sampled pages (live `curl -I`). |
| Canonical tags | Correct. `metadataBase` = `https://www.milpaytools.com`, so every relative canonical resolves to `www`. Verified live: `/calculators/cola` → `<link rel="canonical" href="https://www.milpaytools.com/calculators/cola">`. |
| Sitemap coverage | **Complete.** `src/app/sitemap.ts` includes all hubs, all 18 calculators (cola line 73–78, education 67–72, guard-reserve 61–66, retirement 49–54), `/blog`, `/guides`, and every duty station via `DUTY_STATIONS.map`. |

**Conclusion:** there is no canonical/noindex/sitemap bug. The cause is **internal-link weakness + crawl-budget deprioritization**, page-group specific below.

### Crawlable vs. non-crawlable internal links (the core issue)

The header nav (`src/components/layout/Nav.tsx`, `'use client'`) renders the Calculators and Guides menus as:

```tsx
{open && (
  <div role="menu"> …all the calculator/guide links… </div>
)}
```

`open` defaults to `false`, so **these links are never in the server HTML and never in the hydrated DOM** until a user hovers/clicks. Googlebot does not open hover menus → **the header nav contributes zero crawlable links to any calculator or guide.** Only the top-level `<Link href="/blog">`, `/about`, `/feedback` (always rendered) are crawlable from the nav.

Contrast the homepage `ExpandableCalcGrid` (`src/app/home-v3/ExpandableCalcGrid.tsx`, `'use client'`): the extra 12 calculators are rendered into a `style={{ maxHeight: expanded ? '2000px' : '0', overflow: 'hidden' }}` container. These `<a>` tags **are** in the DOM (CSS-collapsed, not conditionally rendered), so they are crawlable — but visually hidden links carry reduced weight.

### Per-URL findings

| URL | HTTP (live) | In sitemap | noindex | Canonical | Crawlable internal inlinks (where) |
|---|---|---|---|---|---|
| `/blog` | 200 | ✅ | no | self → www | Header nav top-level `<Link>` (sitewide, server HTML) **+** Footer "Blog" (sitewide). **Strong.** |
| `/calculators` | 200 | ✅ | no | self → www (absolute) | Footer "View all calculators →" (sitewide). `/guides` bottom CTA. **NOT** linked from homepage (the "View all 16" control is a `<button>`, not a link). Adequate but footer-only. |
| `/guides` | 200 | ✅ | no | self → www | Footer "View all guides →" (sitewide). Header Guides dropdown contains **no** `/guides` link. Footer-only. |
| `/calculators/cola` | 200 | ✅ | no | self → www | Homepage `ExpandableCalcGrid` (CSS-collapsed) · `/calculators` hub · `/calculators/compare` · `/transition` · `oconus-cola-trap` blog. **Not in footer.** |
| `/calculators/education` | 200 | ✅ | no | self → www | Homepage `ExpandableCalcGrid` (collapsed) · `/calculators` hub · `/guides/education-benefits` (well-linked, ~10 refs) · several GI-Bill blog posts. **Not in footer.** Best-linked of the four. |
| `/calculators/guard-reserve` | 200 | ✅ | no | self → www | Homepage `ExpandableCalcGrid` (collapsed) · `/calculators` hub. Almost nothing contextual. **Not in footer. Weakest profile.** |
| `/calculators/retirement` | 200 | ✅ | no | self → www | Homepage `ExpandableCalcGrid` (collapsed) · `/calculators` hub · `/guides/retirement-tsp` (~5 refs) · retirement/BRS blog posts. **Not in footer.** |
| `/bah/fort-riley` | 200 | ✅ (`DUTY_STATIONS`) | no | self → www | `/bah` hub (server-rendered: `StationSearch` SSRs all stations with empty query) · "nearby" cross-links from 4 other station pages (`stations.ts`). `/bah` itself is footer-linked sitewide. Reasonable, but a deep leaf on a younger site. |

**Verdict on the hypothesis (orphaned calculators):** *Partially confirmed, with an important correction.* They are **not** strictly orphaned — each has a homepage link (CSS-collapsed) and a `/calculators` hub link, and `education`/`retirement` also have decent contextual links. But the hypothesis is right that the **footer omits all four** and the **header nav gives them no crawlable link** (JS-gated dropdown). Their only always-visible homepage link is hidden behind "View all 16 calculators." That is a thin, low-weight internal-link profile, which is the classic driver of "discovered – not indexed."

**Verdict on the hubs (`/blog`, `/calculators`, `/guides`):** They **are** genuinely linked in server-rendered HTML — `/blog` from both header and footer, `/calculators` and `/guides` from the footer (sitewide). No canonical/noindex suppression. Their "discovered – not indexed" is most consistent with **crawl-budget / site-authority deprioritization**, made worse by the fact that `/calculators` and `/guides` rely on **footer boilerplate links only** (Google discounts site-wide footer links). Adding higher-weight contextual/body links is the lever, not a bug fix.

---

## 2. www / non-www canonicalization leak — CONFIRMED, with exact cause

### Live evidence

```
apex   GET https://milpaytools.com/blog/dual-military-financial-strategies
       → HTTP/1.1 307 Temporary Redirect → https://www.milpaytools.com/blog/dual-military-financial-strategies

apex   GET https://milpaytools.com/                → 307 Temporary → https://www.milpaytools.com/
apex   GET https://milpaytools.com/resources        → 307 Temporary → https://www.milpaytools.com/resources   (path rule NOT applied)
www    GET https://www.milpaytools.com/resources    → 308 Permanent → /partners                                (next.config rule DOES run)
www    GET https://www.milpaytools.com/calculators/cola → 200, canonical = https://www.milpaytools.com/calculators/cola
```

### Interpretation

- The apex **does** redirect to www (it does *not* serve a 200 duplicate), **but it returns 307 Temporary, not 301/308 Permanent.** A 307 tells Google the original (non-www) URL is still the canonical one to keep — so Google retains both in the index. This matches the GSC symptom exactly.
- The redirect fires at the **Vercel platform/edge layer**, *before* the Next.js app: proof is that apex `/resources` redirects host-only to `www/resources` and never applies the `/resources → /partners` rule, whereas the same request on www correctly 308s to `/partners`.
- The `next.config.ts` host rule (lines 6–11) is **correct** — `permanent: true` would emit 308 — but it is **preempted** by the platform redirect and therefore never executes for apex requests. (Verified that `next.config` redirects *do* work on www: `/resources` → 308.)
- **Canonical tags are correct and consistently `www`** on both a normal page (`/calculators/cola`) and a known-duplicated post (`/blog/dual-military-financial-strategies`). So the canonical side needs no change; only the redirect status is wrong.

### Where to enforce the fix

The redirect is owned by **Vercel's domain configuration**, not the code. Fix is one of:

- **(Preferred) Vercel → Project → Settings → Domains:** ensure `milpaytools.com` is set to redirect to `www.milpaytools.com` as a **Permanent (308)** redirect. The current behavior is emitting 307.
- **Alternative:** if the platform redirect cannot be made permanent, remove the Vercel-level apex redirect and assign the apex to the project so the existing `next.config.ts` `permanent: true` host rule (already 308-correct) executes.

This is a configuration change (Dan / Vercel dashboard), not a code change. No file edit can override a platform-level edge redirect.

---

## 3. Blog cannibalization catalog

All slugs below verified against `src/content/blog/*.mdx`. Positions/impressions are from the prompt's GSC notes; "—" = not provided and should be pulled from GSC before acting. AI-citation counts unknown except where noted.

### Clusters named in the brief

| Cluster | Live URLs (file exists) | Pos (GSC) | Recommended canonical winner | Action for losers |
|---|---|---|---|---|
| **LES** | `how-to-read-your-les` · `les-abbreviations-explained` | ~29 · ~22 | Two distinct intents — **keep both.** `how-to-read-your-les` = "how to read your LES" walkthrough (also the 301 target for the two retired slugs); `les-abbreviations-explained` = acronym/glossary intent. | Already done: `how-to-read-your-military-les` (~20) and `how-to-read-military-les-2026` 301 → `how-to-read-your-les` (`next.config.ts:17-18`). **Differentiate titles + cross-link** the two survivors. If they keep trading positions, fold abbreviations into the walkthrough as a section, then 301. |
| **Deployment pay** | `deployment-pay-explained` · `how-deployment-pay-works` · `deployment-financial-planning` | ~33 · ~41 · not indexed | **`deployment-pay-explained`** (best ranker). | `how-deployment-pay-works` (~41, has FAQ schema) and `deployment-pay-explained` are near-duplicate "how deployment pay works" intent → after porting unique content + the FAQ schema, **301 → winner.** `deployment-financial-planning` (not indexed, planning angle) → re-angle to budgeting *or* **301 → winner** if thin/overlapping (check content first). |
| **TSP fund options** | `tsp-fund-options-explained` · `tsp-fund-options-military` | ~13 (#1 AI-cited) · ~10 | **`tsp-fund-options-explained`** (AI-cited, strategic). | Near-duplicate. `tsp-fund-options-military` ranks slightly better (~10) and carries FAQ schema — port its FAQ + any unique content into the keeper, then **301 → explained.** Tradeoff: sacrifices the ~10 URL, but consolidating link equity + the AI citation onto one URL should net positive. If reluctant to lose the ~10 ranker, use `rel=canonical` military → explained instead of 301. |
| **Tax advantages** | `military-tax-advantages-by-state` · `military-tax-advantages` | — · not indexed | Intent-dependent — **verify GSC impressions.** If `by-state` owns the head term, make `military-tax-advantages` the broad pillar and `by-state` the deep-dive; if they cannibalize, **301 `military-tax-advantages` → `by-state`** (since the broad one is already unindexed/likely seen as a dup). | Decide on impressions data. Default: consolidate the unindexed broad post into the indexed specific one. |
| **Dual-military BAH** | `dual-military-bah-guide` · `dual-military-bah-rules` | — · — | **`dual-military-bah-guide`** (pillar; links the dual-military-bah calculator). | Both carry FAQ schema (`blog/[slug]/page.tsx` POST_FAQS). `rules` is the narrower sibling → merge unique FAQs/content into `guide`, then **301 `rules` → `guide`.** (`dual-military-financial-strategies` is broader/distinct — leave.) |

### Additional clusters found (not in the brief — verify before acting)

| Cluster | Live URLs | Note |
|---|---|---|
| **BRS vs High-3** | `brs-vs-high-3-difference` · `brs-vs-high-3-retirement` | **Blatant near-duplicate pair** — same head term. Pick the stronger ranker, 301 the other. Highest-confidence additional finding. |
| **VA disability math** | `va-disability-math-explained` · `va-math-costs-you-money` | Overlapping "VA combined-rating math" intent. `va-disability-math-explained` has FAQ schema and is the calculator's linked explainer → likely keeper; re-angle or canonical `va-math-costs-you-money`. |
| **GI Bill ↔ Tuition Assistance** | `gi-bill-vs-tuition-assistance` · `tuition-assistance-and-gi-bill-together` | Both cover "TA + GI Bill" sequencing. Differentiate (comparison vs. stacking) or consolidate. |
| **SGLI / life insurance** | `is-sgli-enough-life-insurance` · `sgli-to-vgli-conversion-after-separation` · `sgli-vgli-private-life-insurance` | Three overlapping life-insurance posts; "adequacy" vs "conversion" vs "vs private" are arguably distinct — confirm they're not splitting the same queries. |
| **PCS cost** | `pcs-financial-planning-guide` · `pcs-out-of-pocket-costs` · `pcs-that-costs-14000-vs-makes-6000` · `ppm-dity-move-worth-it` | Some overlap on PCS cost/PPM intent; lower priority, verify in GSC. |

---

## 4. Prioritized fix plan (one change type per build, smallest blast radius first)

> Note: the brief suggested internal-linking → www → blog canonicals. I'd reorder to put the www fix first because it is config-only, zero code risk, and stops an entire class of duplicate URLs immediately.

### Build 1 — Make the apex→www redirect permanent (308) · *config only, no code*
- **Where:** Vercel → Domains. Set `milpaytools.com` to **Permanent (308)** redirect to `www`. (Fallback: drop the platform redirect so the existing `next.config.ts` `permanent:true` rule runs.)
- **Verify:** `curl -I https://milpaytools.com/` returns **308** (not 307).
- **Expected impact:** Google consolidates non-www duplicates into www over subsequent crawls; the `/blog/...` double-indexing class resolves. Highest impact / lowest risk. No deploy needed.

### Build 2 — Strengthen crawlable internal links to the four calculators (+ hubs)
- **Smallest-blast-radius option:** add the four missing calculators (`cola`, `education`, `guard-reserve`, `retirement`) to the **footer** `CALCULATORS` array (`src/components/layout/Footer.tsx:4-11`). One file, sitewide server-rendered links, immediate crawlability.
- **Higher-leverage follow-up (separate build):** render the header-nav dropdown links in the DOM (e.g. always-rendered but visually hidden, or an SSR `<details>`/sitemap-style block) so the nav contributes crawlable links instead of `{open && …}`. Touches `Nav.tsx` only.
- **Optional:** add a real `<Link href="/calculators">` and `<Link href="/guides">` to the homepage body (currently the "View all 16" control is a `<button>`).
- **Verify:** `curl -s <page> | grep` shows the new `<a href>`s in server HTML (not JS-gated).
- **Expected impact:** raises internal PageRank to the four calculators and the two hubs; should move them from "discovered" to "crawled/indexed" over a few crawl cycles. `guard-reserve` and `cola` benefit most.

### Build 3 — Consolidate blog cannibalization clusters
- Start with the **highest-confidence, lowest-risk** consolidations: `brs-vs-high-3-*` (301 the weaker), then the deployment-pay pair, then TSP fund options (port FAQ schema first). Add `next.config.ts` 301s (mirroring the existing LES pattern at lines 16–18) and/or `rel=canonical` where you want to keep a page live.
- **Pre-step:** pull current GSC position + impressions for each pair to choose the winner; port unique content/FAQ schema into the survivor **before** redirecting so nothing is lost.
- **Verify:** redirected slugs 308 to the survivor; survivor still renders merged FAQ schema; sitemap no longer lists retired slugs.
- **Expected impact:** consolidates split ranking signals onto one URL per intent; should lift the survivors out of the ~20s/~30s plateau over weeks.

---

## Appendix — files reviewed

- `next.config.ts` (redirects), `src/app/layout.tsx` (metadataBase, robots), `src/app/sitemap.ts`
- `src/components/layout/Footer.tsx`, `Nav.tsx`, `Header.tsx`
- `src/app/page.tsx` (production homepage), `src/app/home-v3/ExpandableCalcGrid.tsx`
- `src/app/calculators/page.tsx`, `src/app/blog/page.tsx` + `BlogFilters.tsx`, `src/app/guides/page.tsx`
- `src/app/blog/[slug]/page.tsx` (canonical, POST_FAQS), `src/app/bah/page.tsx` + `StationSearch.tsx`, `src/app/bah/[slug]/page.tsx` (canonical)
- `src/data/duty-stations/stations.ts` (fort-riley), `src/content/blog/*.mdx` (cluster slugs)
- Live HTTP checks via `curl` against production (redirect status + canonical tags)
- *Unused/legacy components noted (not on production homepage): `HomeBody.tsx`, `FilterableCalculatorGrid.tsx`, `CalculatorGrid.tsx`.*
