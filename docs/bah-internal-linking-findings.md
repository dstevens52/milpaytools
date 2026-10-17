# Internal-Linking Authority Toward BAH Station Pages — Investigation

**Date:** 2026-06-13
**Mode:** Read-only. No code changed (this findings doc is the only write). All numbers computed from the repo source, not live GSC.
**Scope:** the 146 `/bah/[slug]` station pages and every internal source that can link to them.

---

## TL;DR

- **146 station pages** render at `/bah/[slug]` (66 with full StoryBrand data, 80 rate-table-only). The `/bah` hub links **all 146** in server-rendered HTML, so nothing is truly orphaned — but a hub-only link is the weakest possible profile.
- **Non-hub inbound is extremely thin and lopsided.** Counting the three real contextual sources (station "nearby" cross-links, `/pay/[rank]` example-station links, and blog/guide body links):
  - **29 stations (20%) have ZERO non-hub inbound links** — reachable only from the hub.
  - **68 stations (47%) have ≤2 non-hub inbound links.**
  - The top 15 hoard the equity (San Diego 17, JB Andrews 14, Norfolk 14, Bragg 13…).
- **The station cross-link graph is rigid and badly reciprocated.** Every station emits **exactly 3** "nearby" links (hard-capped by the curated `nearby:` array), and **216 of those edges are one-way** (A→B but B doesn't link back). 31 stations are never named in *anyone's* `nearby` list.
- **The single biggest contextual gap is the blog.** Only **9 of 63 MDX files** contain any `/bah/` link, and two posts carry most of them (`best-worst…` 13, `bah-rates-2026-complete-guide` 11). The marquee BAH posts that *should* link every base they name don't: **`the-47000-gap-bah-duty-station` (0 links)** and **`what-is-bah-military-housing-allowance` (0 links)** name 5–6 station-page bases each in comparison tables.
- **`/pay/[rank]` is already doing this right** — it links 3 example stations per rank with strong anchors ("Fort Bragg BAH rates"). It's the model to copy, not a gap. But its 45 links concentrate on 28 popular bases.
- **No per-station GSC/position data exists in the repo** (only blog-post positions, in `docs/indexation-investigation-findings.md`). The well-linked→better-ranking correlation can't be confirmed from repo data; the structural finding stands on its own.

Recommended order (highest impact / smallest blast radius first): **(1) link the bases already named in BAH blog posts → (2) enrich the nearby cross-link component → (3) a guarded auto-linker for the long tail.**

---

## 1. Inbound-link distribution

### Sources that can link a station page

| Source | Mechanism | Reach |
|---|---|---|
| `/bah` hub | `StationSearch` SSRs **all** stations (empty query returns full list, grouped by state, real `<Link>`s) — `src/components/bah-stations/StationSearch.tsx:18-20,77-100` | **All 146**, server HTML. Crawlable but it's a single hub link (low weight). |
| Station "nearby" block | `nearbyDeltas(slug)` reads each station's hand-curated `nearby:` array — `bahStats.ts:191-212`, rendered `StationPageClient.tsx:1153-1187` | Exactly **3 outbound** per station. |
| Station "same-MHA siblings" | `siblingInstallations()` auto-computed from shared MHA — `bahStats.ts:170-174`, rendered `StationPageClient.tsx:882-890` | Only fires when two stations share an MHA (most don't). |
| `/pay/[rank]` pages | `rank.exampleStations` `{slug,name}` → `<Link href="/bah/${slug}">{name} BAH rates` — `pay/[rank]/page.tsx:546-555` | 45 links → **28 distinct** stations. |
| Blog / guides (MDX) | hand-authored `](/bah/slug)` markdown links | 9 files, ~37 links total. |
| Footer / Nav / Homepage | link only the **`/bah` hub**, never individual stations — `Footer.tsx:27`, `Nav.tsx:14` | hub only. |

### Non-hub inbound distribution (nearby + pay + content combined)

```
 0 inbound : 29 stations   ← hub-only (link-starved)
 1 inbound : 23
 2 inbound : 16
 3 inbound : 21
 4 inbound : 12
 5 inbound : 12
 6 inbound :  9
 7 inbound :  4
 8 inbound :  3
 9 inbound :  5
10 inbound :  3
11 inbound :  2
12 inbound :  1
13 inbound :  3
14 inbound :  2
17 inbound :  1
```

**Link-starved (0 non-hub inbound) — 29 stations, hub-only:**
`fort-detrick, ramstein-air-base, fort-lee, fort-mccoy, carlisle-barracks, walter-reed-nmmc, mcconnell-afb, little-rock-afb, shaw-afb, beale-afb, grand-forks-afb, hanscom-afb, nas-patuxent-river, naval-station-everett, naval-submarine-base-kings-bay, nas-key-west, mcas-new-river, mcas-yuma, naws-china-lake, nas-meridian, nas-whiting-field, mcrd-san-diego, mcrd-parris-island, naval-medical-center-portsmouth, us-naval-academy, dam-neck-annex, tracen-cape-may, us-coast-guard-academy, base-kodiak`

These are overwhelmingly the **rate-table-only (basic) stations** — they have no StoryBrand content, aren't in anyone's `nearby` list, aren't pay-page examples, and aren't named in blogs. They depend entirely on the hub.

**Well-linked (top 15):**

| Station | total | nearby | pay | content |
|---|---|---|---|---|
| naval-station-san-diego | 17 | 8 | 3 | 6 |
| joint-base-andrews | 14 | 12 | 2 | 0 |
| naval-station-norfolk | 14 | 7 | 3 | 4 |
| fort-bragg | 13 | 3 | 4 | 6 |
| joint-base-san-antonio | 13 | 7 | 3 | 3 |
| camp-pendleton | 13 | 10 | 1 | 2 |
| fort-hood | 12 | 6 | 3 | 3 |
| joint-base-lewis-mcchord | 11 | 6 | 1 | 4 |
| naval-air-station-pensacola | 11 | 10 | 0 | 0 |
| fort-campbell | 10 | 3 | 2 | 5 |
| fort-meade | 10 | 9 | 1 | 0 |
| joint-base-mcguire-dix-lakehurst | 10 | 10 | 0 | 0 |
| kirtland-afb | 9 | 9 | 0 | 0 |
| offutt-afb | 9 | 9 | 0 | 0 |
| joint-base-pearl-harbor-hickam | 9 | 7 | 1 | 1 |

**Correlation to ranking:** not verifiable from the repo — there is no per-station GSC export. `docs/indexation-investigation-findings.md` only carries blog-post positions and uses `/bah/fort-riley` as a "deep leaf, reasonable but thin" example. The structural reality (47% of stations on ≤2 contextual links, 20% on none) is the actionable finding regardless of GSC.

---

## 2. Missed contextual links in content (the biggest opportunity)

Only **9 of 63 MDX files** link any station, and the links cluster in two posts:

| File | `/bah/` links present |
|---|---|
| best-worst-bah-duty-stations-2026 | 13 |
| bah-rates-2026-complete-guide | 11 |
| va-home-loan-basics | 3 |
| how-much-does-an-e5-really-make-2026 | 3 |
| dual-military-bah-guide | 3 |
| guides/pcs | 2 |
| guides/military-pay | 2 |
| pcs-that-costs-14000-vs-makes-6000 | 1 |
| how-bah-builds-wealth | 1 |

A scan for station **names** (and curated colloquial aliases) that appear in body copy but are **not** linked to their `/bah/[slug]` page found **33 high-confidence "named but unlinked" mentions** across 9 files. Highest-value, lead-with-these:

| Post (current `/bah` links) | Named-but-unlinked station pages | Note |
|---|---|---|
| **the-47000-gap-bah-duty-station** (0) | `fort-sill` (×11), `naval-station-san-diego` (×16 as "San Diego"), `fort-hood` (×3), `fort-campbell` (×2), `joint-base-pearl-harbor-hickam` (Pearl Harbor ×2), `joint-base-lewis-mcchord` (JBLM) | **Prime target.** The whole post is a Fort Sill→San Diego BAH comparison table (lines 45-50, 66-71) naming JBLM, Pearl Harbor, Fort Hood, Fort Campbell — and links **none** of them. Every row in those two tables is a station page. |
| **what-is-bah-military-housing-allowance** (0) | `fort-bragg` (×3), `fort-hood`, `fort-sill`, `fort-polk`, `naval-station-san-diego` (×2), `camp-pendleton` | The canonical "what is BAH" explainer names six station-page bases and links none. |
| **best-worst-bah-duty-stations-2026** (12) | `camp-lejeune`, `joint-base-pearl-harbor-hickam`, `presidio-of-monterey` (×2), `hanscom-afb` | Already the best-linked post, but still names Camp Lejeune (its own opening $1,584 example, line 15), Monterey, JBPHH/Schofield, and Hanscom unlinked. |
| **what-civilian-salary-do-i-need** (0) | `fort-bragg` (×3), `joint-base-san-antonio`, `naval-station-san-diego` (×4) | |
| **bah-rates-2026-complete-guide** (11) | `fort-polk`, `vance-afb`, `naval-medical-center-portsmouth` | Mostly covered; a few tail bases unlinked. |
| **ppm-dity-move-worth-it** (0) | `fort-campbell` (×2), `joint-base-lewis-mcchord` | |
| **can-i-use-va-loan-again** (0) | `fort-bragg`, `fort-hood` | |
| **dual-military-bah-rules** (0) | `fort-bragg` | (note: this post is also a 301 consolidation candidate per the indexation doc) |
| **are-you-financially-ready-to-leave-the-military** (0) | `joint-base-san-antonio` | |
| **file-va-disability-before-separation** (0) | `camp-lejeune` | |

A second pass on **city/market names** surfaced 48 more matches, but these are **mostly noise and demonstrate why a naive city-based auto-linker is dangerous** (see §5):
- "San Diego" matches *three* station pages (`naval-station-san-diego`, `mcrd-san-diego`, `marine-corps-air-station-miramar`) — genuinely ambiguous.
- "Washington" matches `fort-mcnair` + `joint-base-anacostia-bolling`; "Honolulu" matches `fort-shafter` + others.
- **False positive:** "Montgomery **GI Bill**" matches `maxwell-afb` (city = Montgomery, AL) across the education posts. A city auto-linker would wrongly link a benefit name to a base page.

**Note on the brief's guesses:** `using-bah-to-buy-a-home` was flagged as a prime suspect but actually names **no** station-page bases (it's generic) — low opportunity. The real prizes are `the-47000-gap…` and `what-is-bah…`.

**`/pay/[rank]` is not a gap** — `pay/[rank]/page.tsx:546-555` already links 3 example stations per rank with the ideal descriptive anchor ("`{name} BAH rates`"). Its 45 links cover only 28 distinct, mostly-popular bases (`fort-bragg` ×4; `naval-station-san-diego`, `naval-station-norfolk`, `joint-base-san-antonio`, `fort-hood` ×3 each). Diversifying a few `exampleStations` toward link-starved bases is a minor, optional win.

---

## 3. Station-to-station cross-link density

- **Outbound is uniform and capped: every station emits exactly 3 "nearby" links.** There is no "more connected" station — `nearby:` is a hand-curated 3-element array on every record (`stations.ts`).
- **Inbound is wildly uneven** (degree 0→12): JB Andrews 12, Camp Pendleton / NAS Pensacola / JB McGuire-Dix-Lakehurst 10 each; while **31 stations are named in nobody's `nearby` list** (`fort-carson, ramstein-air-base, fort-lee, fort-leonard-wood, mcconnell-afb, shaw-afb, beale-afb, grand-forks-afb, hanscom-afb, nas-patuxent-river, naval-station-everett, naval-submarine-base-kings-bay, nas-key-west, mcas-new-river, mcas-yuma, naws-china-lake, nas-meridian, nas-whiting-field, mcrd-san-diego, mcrd-parris-island, naval-medical-center-portsmouth, us-naval-academy, dam-neck-annex, tracen-cape-may, us-coast-guard-academy, base-kodiak, …`).
- **216 of the ~438 nearby edges are one-way** — A lists B as nearby, but B doesn't list A. The graph is closer to a popularity ranking than a true proximity mesh, so equity pools in the popular nodes instead of circulating.
- **Same-MHA "siblings" help only a handful** — most stations are the lone installation in their MHA, so the sibling block is empty for them. It can't substitute for `nearby`.
- The under-connected long-tail bases (the 31 above) are exactly the ones also missing from pay/blog links → they are the true hub-dependent orphans.

---

## 4. Hub & downward flow + anchor text

- **Hub → all stations: confirmed and crawlable.** `/bah` SSRs all 146 as `<Link>`s by default (`StationSearch.tsx`), grouped by state. Good.
- **High-authority pages pass nothing to individual stations.** Homepage, Footer (`Footer.tsx:27`), and Nav (`Nav.tsx:14`) link only the **`/bah` hub**, never a station. Per the indexation doc, footer/boilerplate links are discounted by Google anyway, so the hub is doing most of the work alone.
- **Anchor text is good where links exist:**
  - Pay pages: "**Fort Bragg BAH rates**" — descriptive, keyword-aligned. Ideal.
  - Nearby/sibling blocks: anchor is the station **name** ("Fort Campbell") — fine, contextually clear.
  - Blog links: the few that exist use the base/market name as anchor ("Fort Campbell", "San Diego, CA") — acceptable; could be richer ("Fort Campbell BAH rates") but not a problem.
  - **No generic "click here"/"this page" anchors found.** Anchor quality is not the issue; anchor *quantity* is.

---

## 5. Implementation recommendation

A **mix**, sequenced by ROI and risk. The three mechanisms address different parts of the graph:

### (A) Manual contextual links in the BAH-topic blog posts — do first
The highest-authority, highest-relevance, lowest-risk wins are the ~33 named-but-unlinked mentions in §2, especially the two zero-link marquee posts (`the-47000-gap…`, `what-is-bah…`). These are editorial, first-mention links inside the body — exactly the high-weight contextual links Google rewards, and they target real, on-topic bases the author already chose to name. ~10 posts, hand-edited. No new machinery.

### (B) Enrich the station cross-link component — do second
The `nearby:` model is the right idea but too rigid: hard-capped at 3, one-way, and it strands 31 bases. Options, smallest first:
1. **Reciprocity pass** on the data: for each one-way A→B edge, consider adding B→A — circulates equity and guarantees every nearby target also has inbound. Pure data edit.
2. **Guarantee minimum inbound:** ensure the 31 never-referenced bases appear in at least one other station's `nearby` list (or are surfaced via the auto-computed sibling/percentile-neighbor logic already in `bahStats.ts`).
3. **Render a few more cross-links** (e.g. same-state or nearest-by-rate neighbors computed in `bahStats.ts`) so the long tail isn't capped at 3. This is component + build-time logic, larger blast radius — separate build.

### (C) A *guarded* auto-linker for the long tail — do last, name-only
An auto-linker that, in MDX render, links the **first mention** of a station to its `/bah/[slug]`, **skips self/own-page**, and **caps per page**, is the right scalable mechanism for the blog tail — **but only keyed on unambiguous full base names, never cities.** The city scan proved the risk:
- **Ambiguity:** "San Diego" → 3 bases; "Washington"/"Honolulu" → multiple. City keys can't pick a target.
- **False positives:** "Montgomery GI Bill" → Maxwell AFB. Plain-word collisions are real.
- **Over-linking / context-blindness:** must skip links inside headings, existing links, code, and the post's own subject.

**Recommended auto-linker guardrails (if built):** match only against the canonical `name` + a small curated alias allowlist (e.g. "Camp Lejeune", "Pearl Harbor", "JBLM"); **exclude all bare city names**; first-mention-only; max 3–5 auto-links/post; never inside existing `<a>`/headings; manual override list. Given the modest blog volume (63 files), **(A) by hand will capture ~90% of the value with zero risk** — treat the auto-linker as an optional consistency layer, not a prerequisite.

**Risks to watch across all three:** over-linking (dilutes each link), linking a station to itself, and linking the same target repeatedly within one page.

---

## 6. Build sequence (one change type per build, smallest blast radius first)

| Build | Change | Files | Risk |
|---|---|---|---|
| **1** | Add contextual `/bah/` links to the named-but-unlinked bases in `the-47000-gap-bah-duty-station` and `what-is-bah-military-housing-allowance` (the two zero-link marquee posts). | 2 MDX | Trivial. Content only. |
| **2** | Same treatment for the remaining ~7 posts in §2 (best-worst tail, what-civilian-salary, ppm-dity, can-i-use-va-loan-again, file-va-disability, etc.). | ~7 MDX | Trivial. |
| **3** | `nearby:` reciprocity + minimum-inbound data pass so all 31 never-referenced bases gain ≥1 sibling inbound. Re-run the §1 distribution to confirm the 0-inbound bucket shrinks. | `stations.ts` (data only) | Low. Build-time, no schema change. |
| **4** (optional) | Diversify a few `rank.exampleStations` toward link-starved bases. | `ranks.ts` | Low. |
| **5** (optional) | Render additional computed cross-links (same-state / nearest-by-rate) in the nearby component, lifting the 3-link cap. | `bahStats.ts` + `StationPageClient.tsx` | Medium. Touches the template. |
| **6** (optional) | Guarded name-only first-mention auto-linker in the MDX pipeline. | MDX render util | Medium. Only if §2 hand-linking proves too tedious to maintain. |

Verify each build with `npm run test:e2e` and a `grep`/build check that the new `<a href="/bah/…">`s appear in the rendered HTML.

---

## Appendix — how the numbers were derived

- Station list, `nearby` arrays, `bahVsHousing`/`localHousingTips` (rich-vs-basic split): parsed from `src/data/duty-stations/stations.ts` (146 records; 66 rich, 80 basic).
- Pay inbound: `slug: '…', name:` pairs in `src/data/pay-pages/ranks.ts` (45 refs → 28 distinct), linked at `pay/[rank]/page.tsx:546-555`.
- Content inbound + named-but-unlinked scan: regex over `src/content/blog/*.mdx` + `src/content/guides/*.mdx` for `](/bah/slug)` (present links) vs. word-boundary matches of station names/aliases (mentions). City-name pass run separately to demonstrate ambiguity.
- Cross-link graph metrics (inbound degree, one-way edges, never-referenced set): computed over the parsed `nearby` arrays.
- No GSC/position data per station exists in the repo; see `docs/indexation-investigation-findings.md` for the blog-level positions and the broader crawlability context.
