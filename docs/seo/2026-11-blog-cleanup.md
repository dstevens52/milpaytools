# Blog cleanup (S7, FIX_QUEUE row 9) — November 2026

Branch: `seo/s7-blog-cleanup`. Seven near-duplicate blog posts were merged into their pair. In each
pair the kept URL is the one Google already shows more (more impressions); the other URL is now a
permanent redirect (308, `next.config.ts`) to it, and its MDX file is deleted. The kept post keeps
its title, H1 and meta description and gains the sections it lacked. Full detail:
`S7_BLOG_CLEANUP_REPORT.md` and `S7_BLOG_CLEANUP_DIFF_REPORT.md`.

**Merge date:** 2026-11-23. PR #88, merge commit `93efe98` (merged 15:27 UTC). Confirmed live in
production the same day: all 7 old URLs return 308 to their kept posts; `/blog/brs-vs-high-3-difference`
shows the computed $6,118.50 and $612/month. IndexNow sent the same day (HTTP 200), 15 URLs: the 7 kept
URLs, the 7 redirected URLs and `/llms.txt`.

**Read-out:** 8 weeks after merge: **Mon Jan 18, 2027.**

## Part A pairs and the 90-day baseline

Source: Claude Chat, Google Search Console, Aug 24 – Nov 21, 2026 (impressions, 90 days).

| # | Redirected post | Kept URL | Impressions, redirected | Impressions, kept |
|---|---|---|---|---|
| 1 | `/blog/les-abbreviations-explained` | `/blog/how-to-read-your-les` | 1,205 | 20,580 |
| 2 | `/blog/how-deployment-pay-works` | `/blog/deployment-pay-explained` | 160 | 1,464 |
| 3 | `/blog/brs-vs-high-3-retirement` | `/blog/brs-vs-high-3-difference` | 0 | 121 |
| 4 | `/blog/gi-bill-vs-tuition-assistance` | `/blog/tuition-assistance-and-gi-bill-together` | 0 | 1,800 |
| 5 | `/blog/sgli-vgli-private-life-insurance` | `/blog/is-sgli-enough-life-insurance` | 0 | 552 |
| 6 | `/blog/what-is-scra-military-protection` | `/blog/scra-mla-protections-new-service-members` | 7 | 0 |
| 7 | `/blog/pcs-out-of-pocket-costs` | `/blog/pcs-financial-planning-guide` | 32 | 511 |

Pair 6: both posts get almost nothing; the fuller post (`scra-mla-protections-new-service-members`,
1,820 words vs 524, and the one covering both SCRA and MLA) was kept as the base.

## What to compare at the read-out

For each **kept URL**, in GSC (Pages, exact URL), compare:

| Window | If merged Nov 23 |
|---|---|
| 28 days before merge | Oct 26 – Nov 22, 2026 |
| Weeks 5–8 after merge | Dec 21, 2026 – Jan 17, 2027 |

| Kept URL | Impr. before | Impr. weeks 5–8 | Clicks before | Clicks weeks 5–8 | Position before | Position weeks 5–8 |
|---|---|---|---|---|---|---|
| `/blog/how-to-read-your-les` | | | | | | |
| `/blog/deployment-pay-explained` | | | | | | |
| `/blog/brs-vs-high-3-difference` | | | | | | |
| `/blog/tuition-assistance-and-gi-bill-together` | | | | | | |
| `/blog/is-sgli-enough-life-insurance` | | | | | | |
| `/blog/scra-mla-protections-new-service-members` | | | | | | |
| `/blog/pcs-financial-planning-guide` | | | | | | |

Weeks 1–4 are left out on purpose: Google needs time to process the redirects and re-crawl the
kept posts. The mid-December BAH release and the holidays move military-pay traffic in general, so
read each kept URL against the blog as a whole over the same windows, not in isolation.

For each **redirected URL**, record at the read-out whether it has left the index (GSC URL
Inspection: "Page with redirect" / not indexed, and whether it still shows in Performance):

| Redirected URL | Left the index? | Still getting impressions? |
|---|---|---|
| `/blog/les-abbreviations-explained` | | |
| `/blog/how-deployment-pay-works` | | |
| `/blog/brs-vs-high-3-retirement` | | |
| `/blog/gi-bill-vs-tuition-assistance` | | |
| `/blog/sgli-vgli-private-life-insurance` | | |
| `/blog/what-is-scra-military-protection` | | |
| `/blog/pcs-out-of-pocket-costs` | | |

**What success looks like:** each kept URL's impressions in weeks 5–8 at least match the 28 days
before plus what its redirected partner brought in, with position steady or better. Pairs 1, 2, 4
and 7 are the meaningful tests (pair 1 especially: 1,205 impressions folded into a 20,580-impression
page). Pairs 3, 5 and 6 started near zero on one or both sides, so read them as indexing checks
(does the merged post get indexed and shown at all?) rather than traffic tests.

**If a kept URL drops:** check URL Inspection first (indexed? canonical as expected?) before
changing content. A redirect can't be undone cleanly once Google has processed it; fix forward.
