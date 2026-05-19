# MilPayTools — Project Conventions

## What This Is
MilPayTools.com is a free military financial calculator and education platform for active-duty service members, Guard/Reserve, and veterans. Every tool follows an "Explain → Decide → Act" pattern. The site is positioning for DoD TAP curriculum integration and military leadership endorsement.

## Stack
- Next.js / TypeScript / Tailwind CSS / App Router
- GitHub (dstevens52/milpaytools) → Vercel auto-deploy from main
- MDX for blog posts and guide content
- Playwright for E2E tests (`npm run test:e2e`, 650+ tests)
- Beehiiv API for email capture (env vars: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID)
- Vercel Analytics

## Data Layer
- BAH rates: `src/data/bah/2026/` — ZIP-to-MHA mapping (40,959 ZIPs → 338 MHAs) + rate tables by rank/dependent status. Source: DTMO
- Pay tables: `src/data/` — 2026 DoD pay tables from DFAS PDFs
- Station data: station-level data files with BAH rates, local market data (median rent, home prices), branch, installation details
- National averages: computed dynamically via `getNationalAverages()` in `src/lib/calculations/bah.ts` using median across all 338 MHAs
- All data updates annually in January. The data layer is designed for versioned annual replacement.

## Site Structure (as of May 2026)
- 16 calculators at /calculators/[name]
- 65 BAH station pages at /bah/[slug] with full StoryBrand content (hero, money strip, housing costs, "What to know before you move", CTAs, email signup)
- ~135+ additional basic BAH pages with rate tables only
- 37 blog posts (MDX)
- 7 guide hub pages at /guides/[name]
- /guides/starting-service — dedicated journey landing page for new service members
- /guides/navigating-service — dedicated journey landing page for mid-career (PCS, deployment, duty station)
- /transition — transition hub page
- Homepage with journey cards, 1-2-3 process strip with proof card, calculator grid with filter pills

## Key Components
- `StationPageClient.tsx` — BAH station page template. Conditionally renders StoryBrand sections when data exists. Rank selector drives all dynamic content.
- `EmailSignup` — reusable Beehiiv signup component. Props: headline, subtext, source, stationName, variant ("inline" | "card")
- `BaseSearchInput` — type-ahead input for base names and ZIP codes, used across BAH, Dual Military BAH, COLA, and PCS calculators
- Calculator pages share common patterns: 3-step plan (dark strip), trust pill badges, static example, disclaimer, post-result email signup
- Branch emblems: SVGs in /public/images/branches/, rendered as semi-transparent watermarks in BAH page heroes

## Content Guidelines
- NEVER imply first-person military service. Dan writes from "someone who builds financial tools" perspective.
- NEVER give financial, tax, legal, or housing advice. Present data and let users decide.
- Use "Common among:" not "Best for:" when describing demographics
- Use "What to know before you move" not "Mistake to avoid"
- All housing data must cite sources (Zillow, Redfin, BestPlaces, GreatSchools)
- Master disclaimer required on all station pages with housing data
- No display ads ever — preserves institutional credibility for TAP/endorsement path
- Voice: explain something important to a smart friend in the military. Not military slang, not corporate stiff.
- Blog posts: write for a real person, not Google first. Plain English, zero unexplained jargon. Include summary tables for scannability. End with clear action items.

## Testing
- Run `npm run test:e2e` after any changes
- 650+ Playwright tests covering all calculators, BAH pages, and cross-browser (Chrome/Firefox/WebKit)
- Fort Bragg and Fort Hood are commonly used as test reference pages

## Environment Variables (Vercel + .env.local)
- BEEHIIV_API_KEY
- BEEHIIV_PUBLICATION_ID

## Prompt Efficiency Rules
- Reference specific file paths rather than describing files
- One type of change at a time for code modifications
- Cap at 5-8 files for code changes per prompt
- Verify between builds
- Run Playwright after every change
