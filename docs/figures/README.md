# Dollar-figure report

Blog posts and guide pages hard-code dollar figures as text. They don't update when
`src/data/` is replaced each January. `npm run check:figures` finds every figure and works out
which ones come from the data layer, so the January update has an exact worklist.

It is a **report, not a test**. It never fails the build. A figure it can't match is normal:
most are annual totals, differences, approximations or civilian examples.

## Commands

| Command | Writes |
|---|---|
| `npm run check:figures` | `report.md` and `report.json` (git-ignored working copies) |
| `npm run check:figures -- --baseline` | also `<year>-baseline.md` and `.json` (committed) |
| `npm run check:figures -- --next-year 2027` | `year-change-2027.md` and `.json`: the January worklist |
| `… --next-year 2027 --traffic gsc-pages.csv` | the same, with the worklist sorted by Search Console clicks |
| `… --scan src/content/blog,src/app/guides` | overrides the scanned directories (these two are the default) |

The scripts are `scripts/check-figures.ts` (CLI) and `scripts/figures/lib.ts` (logic).
`npm run test:figures` guards the tool.

## The three classes

| Class | Meaning |
|---|---|
| `data` | Exactly equal, to the cent, to a current-year data value. Every matching source is listed, e.g. `pay:E-5@6`, `bas:enlisted`, `va:70%/veteranAlone`, `bah:NC182/E-5/w`, `deployment:hfp`. |
| `data-derived` | A whole-dollar rounding of a data value (`round(pay:E-1@0)` for `$2,407`), or 12 × a monthly value: pay, BAS, VA, and monthly-rate constants (`12×deployment:hfp` for `$5,400`). |
| `unbound` | Everything else. **Not an error.** |

When a figure's only exact match is a BAH value but it is also a clean derivation of a non-BAH
value, it is classed `data-derived` and keeps both kinds of source.

## `weak`

A `data` or `data-derived` match is marked `weak` when it may be a coincidence:

- every source is BAH (16,000+ values), a COLA estimate band, or a healthcare illustration value
  (round numbers like $500 and $2,000), or
- the figure is a whole number under $100, or
- the figure is approximate (`~`, "about", "approximately", "roughly" just before it), or
- the figure is one end of a dash range (`$1,000–$2,000`).

Weak matches are still listed and still checked in year-change mode. Check the context before
editing one.

## Year-change mode

`--next-year 2027` loads each 2027 data file that exists and lists every `data` or
`data-derived` figure whose source value changed, with the old and new values
(`pay:E-5@6 4,110.00 → 4,250.00`). The worklist is every file with a changed figure, plus every
file with "2026" in its title or slug.

Sources without a 2027 file yet are listed as skipped, and figures that match only those
sources are counted as "not checked". The tool never fails for a missing file.

`src/data/constants.ts` (BAS, TSP limits, SGLI, tax brackets) is not year-versioned: it is
edited in place. It counts as 2027 data once its `DATA_YEAR` is `'2027'`. The 2026 values are
then taken from `2026-baseline.json`.
