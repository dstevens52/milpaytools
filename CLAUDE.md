# CLAUDE.md — MilPayTools.com

## Project Overview

MilPayTools.com is a "decision engine" for active-duty service members and veterans — interactive financial calculators that don't just show numbers but interpret results, explain what they mean, and recommend actionable next steps.

**Core principle:** Every tool follows an "Explain → Decide → Act" loop:
1. Show the result (accurate math)
2. Interpret it ("Here's what this means for you")
3. Recommend action ("Here's what to do next")
4. Link to a monetized resource when natural

**Target audience:** Active-duty military (all branches), Guard/Reserve, veterans, and military spouses. Assume users range from E-1s who've never seen a pay stub to O-5s planning retirement. Write interpretive content for the least experienced user without being condescending.

**Competitive advantage:** Genuinely complex financial math that users can't do themselves — combined VA disability ratings, tax-advantaged compensation breakdowns, TSP projections with BRS matching, PCS cost layering. Quality over quantity. Every calculator should be the best version of that tool on the internet.

---

## Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (auto-deploy from GitHub `main` branch)
- **Repository:** github.com/dstevens52/milpaytools

---

## Project Structure

```
milpaytools/
├── CLAUDE.md                  # This file
├── src/
│   ├── app/                   # App Router pages
│   │   ├── layout.tsx         # Root layout (nav, footer, metadata)
│   │   ├── page.tsx           # Homepage
│   │   └── calculators/       # Calculator pages
│   │       ├── total-compensation/page.tsx
│   │       ├── bah/page.tsx
│   │       ├── va-disability/page.tsx
│   │       └── [future-calculators]/page.tsx
│   ├── components/
│   │   ├── ui/                # Shared UI primitives (buttons, inputs, cards, selects)
│   │   ├── layout/            # Header, Footer, Nav
│   │   ├── calculators/       # Calculator-specific components
│   │   │   ├── shared/        # Shared calculator UI (ResultCard, ActStep, Disclaimer)
│   │   │   ├── total-compensation/
│   │   │   ├── bah/
│   │   │   └── va-disability/
│   │   └── home/              # Homepage sections
│   ├── data/                  # Static data files (see Data Layer below)
│   │   ├── pay-tables/
│   │   ├── bah-rates/
│   │   ├── va-rates/
│   │   └── constants.ts       # Shared constants (current year, TSP limits, BAS rates, etc.)
│   ├── lib/                   # Calculation logic (pure functions, no UI)
│   │   ├── calculations/
│   │   │   ├── total-compensation.ts
│   │   │   ├── bah.ts
│   │   │   ├── va-disability.ts
│   │   │   └── tsp.ts
│   │   └── utils.ts           # Formatting, currency, rounding helpers
│   ├── types/                 # TypeScript type definitions
│   │   ├── military.ts        # Rank, PayGrade, Branch, etc.
│   │   └── calculator.ts      # Calculator input/output types
│   └── styles/
│       └── globals.css        # Tailwind base + custom CSS variables
└── public/
    └── ...                    # Static assets
```

---

## Data Layer

### Philosophy
All military rate data lives in `src/data/` as structured TypeScript files or JSON. Calculators import from this directory — they never hardcode rates. This is critical because:
- Pay tables update every January
- BAH rates update every January
- VA disability rates update every December
- TSP contribution limits update every January

When annual updates happen, you change data files in `src/data/` and every calculator that imports them is automatically updated.

### Data directory structure

```
src/data/
├── pay-tables/
│   └── 2026.ts              # Monthly base pay by grade and years of service
├── bah-rates/
│   └── 2026.ts              # BAH rates by ZIP, grade, dependency status
├── va-rates/
│   └── 2026.ts              # VA disability compensation by rating and dependents
├── constants.ts              # Things that change annually:
│                              #   - BAS rates (enlisted/officer)
│                              #   - TSP contribution limits
│                              #   - TSP matching rules (BRS)
│                              #   - SGLI coverage amounts/premiums
│                              #   - Current tax brackets (for tax advantage calc)
│                              #   - DATA_YEAR: "2026" (display string for UI)
└── types.ts                  # Types for data structures
```

### Data format conventions
- All monetary values stored as numbers (not strings), in dollars (not cents)
- Pay tables keyed by pay grade string (e.g., "E-1", "O-3", "W-2") and years of service
- BAH rates keyed by ZIP code string (preserve leading zeros)
- VA rates keyed by disability percentage (0-100) and dependent count
- Every data file exports a `DATA_YEAR` constant so the UI can display "Based on 2026 rates"
- Include a comment at the top of each data file with the official source URL

### Annual update process
When new rates are published:
1. Create new year file (e.g., `pay-tables/2027.ts`)
2. Update the import in the calculator that uses it
3. Update `DATA_YEAR` in `constants.ts`
4. Old year files stay in the repo for reference

---

## Calculator Architecture

### Separation of concerns
Every calculator has three layers:

1. **Data** (`src/data/`) — Raw rates and tables. No logic.
2. **Calculation logic** (`src/lib/calculations/`) — Pure TypeScript functions. No UI, no React. Takes typed inputs, returns typed outputs. Must be independently testable.
3. **UI** (`src/components/calculators/` + `src/app/calculators/`) — React components that collect inputs, call calculation functions, and render results.

This separation means:
- Calculation logic can be unit tested without rendering anything
- Data can be swapped out annually without touching logic
- UI can be redesigned without touching math

### Calculator page pattern
Every calculator page follows this structure:

```tsx
// src/app/calculators/[name]/page.tsx

export const metadata = { ... } // SEO metadata

export default function CalculatorPage() {
  return (
    <>
      {/* Brief intro: what this calculator does, who it's for (2-3 sentences) */}
      <CalculatorIntro />

      {/* The interactive calculator */}
      <CalculatorComponent />

      {/* Educational content below the calculator */}
      <CalculatorExplainer />

      {/* Disclaimer */}
      <Disclaimer />
    </>
  )
}
```

### Input UX conventions
- All calculators are client components ("use client")
- Results update dynamically as the user changes inputs (no submit button)
- Use controlled form inputs with React state
- Dropdowns for rank/grade selection (grouped by Enlisted, Warrant Officer, Officer)
- ZIP code inputs: 5-digit text field with validation
- Years of service: number input or dropdown (0-40)
- Default to reasonable starting values so the calculator shows results immediately on load (e.g., E-5 with 6 years of service)
- Mobile-first layout: inputs stack vertically, results below

### Output pattern: "Explain → Decide → Act"
Every calculator result section must include these three layers:

**1. The Result (Explain)**
Clear, large numbers. Monthly and annual views where applicable. Use the `ResultCard` component.

```
Your Total Military Compensation: $68,424/year ($5,702/month)
```

**2. The Interpretation (Decide)**
Plain-language context that helps the user understand what the number means. This is what separates us from every other calculator.

```
"A civilian in [ZIP] would need to earn approximately $91,200 before taxes
to match your total compensation, because your BAH and BAS are tax-free."
```

**3. The Action Step (Act)**
A natural next step the user can take. This is where monetization lives eventually — but even without affiliate links, there should always be an actionable recommendation.

```
"Consider increasing your TSP contribution — even 1% more could add
$X to your retirement balance."
```

Use the `ActStep` component for these. It accepts an optional `href` prop for when we add affiliate links later. When no href is provided, it renders as informational text only (no empty links, no placeholder URLs, no "coming soon" language).

---

## Shared Components

### ResultCard
Displays a key calculator output with label, value, and optional sublabel.
```tsx
<ResultCard
  label="Total Monthly Compensation"
  value="$5,702"
  sublabel="Based on 2026 pay tables"
/>
```

### ActStep
Displays an action recommendation. Optional link.
```tsx
<ActStep
  text="Your BAH exceeds median rent by $340/month in this area — that gap could build equity."
  href="/resources/va-home-loans"  // optional, omit if no link yet
  linkText="Learn about VA home loans" // optional
/>
```

### Disclaimer
Standard disclaimer that appears on every calculator page.
```tsx
<Disclaimer />
// Renders: "This calculator provides estimates based on [year] published rates.
// It is not financial, tax, or legal advice. Verify all figures with official
// DoD and VA sources. [Links to official sources]"
```

### Calculator input components
- `RankSelect` — Dropdown grouped by Enlisted/Warrant/Officer with grade labels
- `YearsOfServiceInput` — Number input (0-40)
- `ZipCodeInput` — 5-digit text with validation
- `DependentStatusSelect` — With/without dependents (expand later for dependent count)

---

## Design System

### Color palette
- **Primary:** Deep red — `#B91C1C` (Tailwind `red-700`) for primary actions, active states, key highlights
- **Primary hover:** `#991B1B` (Tailwind `red-800`)
- **Neutral background:** `#FAFAFA` (Tailwind `zinc-50`)
- **Card background:** `#FFFFFF` white
- **Text primary:** `#18181B` (Tailwind `zinc-900`)
- **Text secondary:** `#52525B` (Tailwind `zinc-600`)
- **Borders:** `#E4E4E7` (Tailwind `zinc-200`)
- **Success/positive:** `#15803D` (Tailwind `green-700`) for positive financial indicators
- **Accent/info:** `#1D4ED8` (Tailwind `blue-700`) for links and informational callouts
- **Result highlight background:** `#FEF2F2` (Tailwind `red-50`) subtle red tint for result cards

### Typography
- Use system font stack via Tailwind defaults (or Inter if we add it)
- Calculator result numbers: `text-3xl font-bold` or `text-4xl font-bold`
- Section headings: `text-xl font-semibold` or `text-2xl font-semibold`
- Body text: `text-base` (16px)
- Interpretive/context text: `text-base text-zinc-600`
- All financial figures use `tabular-nums` for aligned digits

### Layout
- Max content width: `max-w-4xl mx-auto` for calculator pages
- Max content width: `max-w-6xl mx-auto` for homepage
- Card pattern: white background, `rounded-lg`, `border border-zinc-200`, `shadow-sm`, `p-6`
- Spacing between sections: `space-y-8` or `space-y-12`
- Mobile-first: single column by default, two columns on `md:` breakpoint where appropriate

### Design principles
- Clean, modern, utility-focused
- NO military clichés: no camo patterns, no eagles, no stars-and-stripes backgrounds, no dog tags
- The red is an accent, not a theme — use it sparingly for key actions and highlights, not for large background areas
- White space is your friend. Financial data needs room to breathe.
- Trust comes from clarity and accuracy, not from decoration

---

## Content Guidelines

### Voice and tone
- Direct, clear, respectful
- Use military terminology correctly (say "BAH" not "housing allowance stipend")
- Assume the reader is intelligent but may not know financial jargon
- Explain acronyms on first use in any page context, then use the acronym
- Never condescending, never "dumbed down"

### Legal/compliance boundaries — STRICT
- **DO:** Explain how things work procedurally ("Here's how VA disability math works")
- **DO:** Show factual calculations based on published government data
- **DO:** Recommend actions like "talk to a financial advisor" or "review your TSP allocation"
- **DO NOT:** Provide tax advice ("you should..." regarding tax strategy)
- **DO NOT:** Provide legal advice ("you should file..." regarding legal proceedings)
- **DO NOT:** Provide investment advice ("you should invest in..." regarding specific funds)
- **DO NOT:** Recommend specific financial products by name in calculator outputs (affiliate links will go in designated ActStep components only)
- **ALWAYS:** Include the Disclaimer component on every calculator page
- **ALWAYS:** Cite the official source for any rate data displayed

### SEO metadata
Every page needs:
- Unique `title` (format: "[Calculator Name] | MilPayTools")
- Unique `description` (under 155 characters, include primary keyword)
- Canonical URL

---

## Development Workflow

### First session (site scaffold)
The initial Claude Code session should:
1. Set up the project structure as defined above
2. Create all shared UI components (ResultCard, ActStep, Disclaimer, input components)
3. Build the homepage with navigation to calculator pages
4. Build the site layout (header, footer, nav)
5. Set up the data directory with placeholder structure
6. Deploy and verify

### Subsequent sessions (one calculator per session)
Each calculator session should:
1. Add the data files needed (or verify existing ones)
2. Write the calculation logic in `src/lib/calculations/` as pure functions
3. Build the calculator UI component
4. Create the calculator page with intro, calculator, explainer, and disclaimer
5. Add to the site navigation
6. Test edge cases (E-1 < 4 months, warrant officers, high years of service)
7. Commit and push (auto-deploys to Vercel)

### Commit conventions
- `feat: add [calculator name] calculator`
- `data: update 2026 pay tables`
- `fix: correct [description]`
- `style: [description]`
- `refactor: [description]`

### Testing calculator math
- Every calculation function should be testable with known inputs/outputs
- Cross-reference outputs against official DoD/VA published examples
- Test edge cases: E-1 with < 4 months, O-10 with 40 years, warrant officers, prior-enlisted officers

---

## Cross-Promotion

MilPayTools.com serves the same audience as VARefinance.com (also owned by this developer). Where natural:
- BAH calculator results can link to VARefinance for home buying content
- Total compensation calculator can reference VA loan eligibility
- These cross-links go in ActStep components and are clearly editorial, not ads

---

## Future Additions (do not build yet)

These are planned but should not be implemented until explicitly requested:
- MDX blog system (Phase 2)
- Display ad placements (Phase 3)
- Affiliate link integrations (Phase 3)
- GA4 analytics (add after initial calculators are live)
- Google Search Console setup (add after initial calculators are live)
- llms.txt file (add after content exists)
- Social media meta tags / Open Graph images
