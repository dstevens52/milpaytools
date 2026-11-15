# Station search-result test, November 2026

A split test of the **title and meta description** on CONUS BAH station pages (`/bah/[slug]`). Overseas station pages are not part of it.

- **Why:** station pages rank around position 7–8 on Google but get about 0.42% CTR. The meta description gives the E-5 rate, so nobody needs to click. Overseas stations, where Google shows no number, get 2.2%.
- **Start:** START_DATE_PLACEHOLDER (the production deploy of Build 03).
- **Read-out:** **Wednesday, Dec 9, 2026**, after three weeks, before the BAH release changes every title.
- **Code:** arm lists and the on/off flag are in `src/data/bah/serpTest.ts`; both variants are in `src/lib/stationSerp.ts`.

## Variants

| | Title | Meta description |
|---|---|---|
| **A** (control) | Today's, byte-identical: `{name} ({former}) BAH Rates {year}` or `{name} BAH Rates {year} — {city}, {ST}`, plus " \| MilPayTools" | Today's: leads with the E-5 with- and without-dependents rates |
| **B** | Absolute, no site name, first that fits 60 characters: `{n} BAH {year}: E-1 to O-7, With & Without Dependents` → `… All Ranks, With & Without Dependents` → `… by Rank, With/Without Dependents` → `… Every Rank + Dependents` → `{n} BAH Rates {year} by Rank` → `{n} BAH Rates {year}`. `{n}` = `searchName` ?? `name`. | `{year} BAH at {name}, {ST} ({city}): {min}–{max}/mo across {count} pay grades. Pick your rank to see your rate, the change from {priorYear} and local rent.` If over 160 characters, "and local rent" is dropped, then " ({city})". A former name is added after {name} only if it still fits (none does). |

Both variants keep the site name in `og:title` / `twitter:title`.

**Changed on both arms at the same start date** (not part of the test, so it affects both equally):
- the H1 is now `{name} BAH Rates {year}`;
- the "{year} BAH Rates" pill above it is gone;
- MHA names are cased for display (AFB, NAS, McGuire…).

## Arms

The CONUS station URLs with a row in the GSC 3-month pages export (`gsc_pages_3mo.csv`, about Aug 12 – Nov 12, 2026) were sorted by impressions and assigned **A-B-B-A** down the list. The 5 pages with no row are in B and **excluded from the read-out**: `/bah/camp-pendleton`, `/bah/fort-irwin`, `/bah/marine-corps-base-quantico`, `/bah/minot-afb`, `/bah/schriever-sfb`. Pages added later are A.

### 3-month baseline (from the data pack)

| Arm | Pages in read-out | Clicks | Impressions | CTR | Avg. position (impr.-weighted) |
|---|---|---|---|---|---|
| A | 69 | 386 | 85,696 | 0.45% | 7.74 |
| B | 68 | 325 | 84,522 | 0.38% | 8.20 |

**B's baseline CTR is already 0.854 × A's.** That's why the read-out compares each arm with its own pre-period, never B with A directly.

## Read-out rules (decided 2026-11-15)

Pull both arms from GSC → Performance → Search results, with a **Page** filter of **Custom (regex)** and the arm's regex below, for two windows:
- **pre:** the 21 days before the start date;
- **post:** the 21 days from the start date.

GSC data lags about two days, so a Dec 9 read covers the post window only if the start was on or before Nov 16. Otherwise use the latest 21 complete days, and the same length for pre.

1. **Decision (CTR).** For each arm, CTR = clicks ÷ impressions. Compute **R = (B post CTR ÷ B pre CTR) ÷ (A post CTR ÷ A pre CTR)**.
   - **Ship B to every CONUS station page on BAH release day unless R ≤ 0.9.** Set `SERP_TEST_MODE = 'all-b'`.
   - If R ≤ 0.9, revert: `'all-a'`.
2. **Ranking check (position).** For each arm, record the impression-weighted average position, pre and post. Compute **ΔB − ΔA**, where Δ = post − pre and a higher number is a worse position.
   - **If B's position worsens by more than about 1.0 relative to A (ΔB − ΔA > +1.0), flag the read-out as ranking-confounded.** CTR changes then can't be read as a packaging effect alone.
   - Record this in the read-out, next to R.

Expect about 150 clicks per arm over three weeks at today's CTR, so small differences in R are noise.

## GSC regex per arm

**Arm A** (69 pages, 1216 characters):

```
^https://www\.milpaytools\.com/bah/(naval-station-norfolk|camp-lejeune|naval-base-kitsap|peterson-sfb|fort-jackson|schofield-barracks|macdill-afb|travis-afb|fort-stewart|joint-base-pearl-harbor-hickam|fort-lee|joint-base-lewis-mcchord|presidio-of-monterey|walter-reed-nmmc|nas-jacksonville|naval-air-station-oceana|fort-wainwright|joint-base-charleston|joint-base-andrews|offutt-afb|fort-belvoir|seymour-johnson-afb|fe-warren-afb|naval-base-ventura-county|fort-gordon|dam-neck-annex|naval-air-station-pensacola|robins-afb|wright-patterson-afb|patrick-sfb|nas-whiting-field|moody-afb|fort-knox|marine-corps-air-station-cherry-point|fort-hamilton|keesler-afb|tinker-afb|goodfellow-afb|nas-patuxent-river|west-point|eielson-afb|cannon-afb|fort-rucker|joint-base-elmendorf-richardson|joint-base-mcguire-dix-lakehurst|mcas-yuma|naval-station-newport|marine-corps-air-station-beaufort|fort-polk|naval-station-great-lakes|marine-corps-air-station-miramar|hanscom-afb|fort-detrick|vandenberg-sfb|whiteman-afb|us-coast-guard-academy|nas-kingsville|naws-china-lake|fort-leonard-wood|vance-afb|malmstrom-afb|mcrd-parris-island|tyndall-afb|nas-meridian|naval-submarine-base-new-london|altus-afb|dyess-afb|hill-afb|nab-coronado)$
```

**Arm B, read-out pages** (68 pages, 1154 characters; excludes the 5 above):

```
^https://www\.milpaytools\.com/bah/(fort-bragg|fort-hood|fort-benning|naval-air-station-whidbey-island|mcb-hawaii|davis-monthan-afb|eglin-afb|naval-station-san-diego|marine-corps-air-ground-combat-center|fort-meade|hurlburt-field|joint-base-langley-eustis|us-naval-academy|naval-station-everett|joint-base-san-antonio|luke-afb|fort-carson|fort-sill|little-rock-afb|scott-afb|joint-base-myer-henderson-hall|fairchild-afb|barksdale-afb|fort-bliss|los-angeles-afb|base-kodiak|nas-lemoore|nellis-afb|beale-afb|holloman-afb|edwards-afb|fort-drum|joint-base-little-creek-fort-story|fort-campbell|shaw-afb|mcas-new-river|mountain-home-afb|usaf-academy|nas-fallon|nas-key-west|fort-leavenworth|naval-station-mayport|buckley-sfb|nas-north-island|naval-medical-center-portsmouth|fort-huachuca|sheppard-afb|aberdeen-proving-ground|fort-riley|joint-base-anacostia-bolling|maxwell-afb|tracen-cape-may|carlisle-barracks|columbus-afb|kirtland-afb|grand-forks-afb|ellsworth-afb|fort-mcnair|mcrd-san-diego|naval-postgraduate-school|joint-base-cape-cod|laughlin-afb|fort-mccoy|fort-shafter|redstone-arsenal|naval-submarine-base-kings-bay|nas-corpus-christi|mcconnell-afb)$
```

## Arm A pages (69)

| # | Page | Impr. | Clicks | CTR | Pos. |
|---|---|---|---|---|---|
| 1 | `/bah/naval-station-norfolk` | 21,834 | 114 | 0.52% | 6.4 |
| 4 | `/bah/camp-lejeune` | 8,087 | 29 | 0.36% | 7.7 |
| 5 | `/bah/naval-base-kitsap` | 6,459 | 50 | 0.77% | 7.5 |
| 8 | `/bah/peterson-sfb` | 4,152 | 18 | 0.43% | 10.3 |
| 9 | `/bah/fort-jackson` | 4,083 | 19 | 0.47% | 6.7 |
| 12 | `/bah/schofield-barracks` | 3,469 | 14 | 0.40% | 8.8 |
| 13 | `/bah/macdill-afb` | 3,439 | 14 | 0.41% | 8.2 |
| 16 | `/bah/travis-afb` | 2,750 | 16 | 0.58% | 6.1 |
| 17 | `/bah/fort-stewart` | 2,627 | 7 | 0.27% | 7.8 |
| 20 | `/bah/joint-base-pearl-harbor-hickam` | 2,354 | 5 | 0.21% | 9.3 |
| 21 | `/bah/fort-lee` | 2,124 | 9 | 0.42% | 12.3 |
| 24 | `/bah/joint-base-lewis-mcchord` | 1,853 | 1 | 0.05% | 8.1 |
| 25 | `/bah/presidio-of-monterey` | 1,841 | 8 | 0.43% | 8.3 |
| 28 | `/bah/walter-reed-nmmc` | 1,463 | 4 | 0.27% | 11.5 |
| 29 | `/bah/nas-jacksonville` | 1,461 | 3 | 0.21% | 8.0 |
| 32 | `/bah/naval-air-station-oceana` | 1,211 | 4 | 0.33% | 7.3 |
| 33 | `/bah/fort-wainwright` | 1,182 | 4 | 0.34% | 7.8 |
| 36 | `/bah/joint-base-charleston` | 952 | 3 | 0.32% | 7.7 |
| 37 | `/bah/joint-base-andrews` | 857 | 0 | 0.00% | 6.7 |
| 40 | `/bah/offutt-afb` | 741 | 4 | 0.54% | 7.9 |
| 41 | `/bah/fort-belvoir` | 702 | 0 | 0.00% | 8.4 |
| 44 | `/bah/seymour-johnson-afb` | 659 | 3 | 0.46% | 7.3 |
| 45 | `/bah/fe-warren-afb` | 650 | 9 | 1.38% | 6.8 |
| 48 | `/bah/naval-base-ventura-county` | 625 | 5 | 0.80% | 6.4 |
| 49 | `/bah/fort-gordon` | 595 | 1 | 0.17% | 8.4 |
| 52 | `/bah/dam-neck-annex` | 528 | 4 | 0.76% | 18.5 |
| 53 | `/bah/naval-air-station-pensacola` | 514 | 2 | 0.39% | 7.9 |
| 56 | `/bah/robins-afb` | 459 | 1 | 0.22% | 7.0 |
| 57 | `/bah/wright-patterson-afb` | 449 | 1 | 0.22% | 6.7 |
| 60 | `/bah/patrick-sfb` | 425 | 1 | 0.24% | 6.7 |
| 61 | `/bah/nas-whiting-field` | 421 | 9 | 2.14% | 15.7 |
| 64 | `/bah/moody-afb` | 387 | 3 | 0.78% | 6.6 |
| 65 | `/bah/fort-knox` | 379 | 2 | 0.53% | 7.6 |
| 68 | `/bah/marine-corps-air-station-cherry-point` | 336 | 0 | 0.00% | 8.5 |
| 69 | `/bah/fort-hamilton` | 330 | 0 | 0.00% | 6.1 |
| 72 | `/bah/keesler-afb` | 317 | 0 | 0.00% | 7.7 |
| 73 | `/bah/tinker-afb` | 295 | 0 | 0.00% | 7.3 |
| 76 | `/bah/goodfellow-afb` | 270 | 2 | 0.74% | 7.4 |
| 77 | `/bah/nas-patuxent-river` | 269 | 1 | 0.37% | 7.8 |
| 80 | `/bah/west-point` | 266 | 2 | 0.75% | 7.7 |
| 81 | `/bah/eielson-afb` | 259 | 1 | 0.39% | 6.8 |
| 84 | `/bah/cannon-afb` | 236 | 0 | 0.00% | 7.3 |
| 85 | `/bah/fort-rucker` | 235 | 2 | 0.85% | 7.1 |
| 88 | `/bah/joint-base-elmendorf-richardson` | 228 | 1 | 0.44% | 8.5 |
| 89 | `/bah/joint-base-mcguire-dix-lakehurst` | 225 | 0 | 0.00% | 6.5 |
| 92 | `/bah/mcas-yuma` | 218 | 0 | 0.00% | 7.8 |
| 93 | `/bah/naval-station-newport` | 199 | 2 | 1.01% | 8.9 |
| 96 | `/bah/marine-corps-air-station-beaufort` | 189 | 0 | 0.00% | 9.1 |
| 97 | `/bah/fort-polk` | 184 | 1 | 0.54% | 7.7 |
| 100 | `/bah/naval-station-great-lakes` | 171 | 1 | 0.58% | 7.2 |
| 101 | `/bah/marine-corps-air-station-miramar` | 167 | 1 | 0.60% | 7.3 |
| 104 | `/bah/hanscom-afb` | 160 | 1 | 0.63% | 8.2 |
| 105 | `/bah/fort-detrick` | 147 | 0 | 0.00% | 7.5 |
| 108 | `/bah/vandenberg-sfb` | 130 | 0 | 0.00% | 9.4 |
| 109 | `/bah/whiteman-afb` | 130 | 0 | 0.00% | 6.4 |
| 112 | `/bah/us-coast-guard-academy` | 127 | 0 | 0.00% | 7.3 |
| 113 | `/bah/nas-kingsville` | 117 | 2 | 1.71% | 7.3 |
| 116 | `/bah/naws-china-lake` | 106 | 0 | 0.00% | 5.2 |
| 117 | `/bah/fort-leonard-wood` | 96 | 1 | 1.04% | 6.8 |
| 120 | `/bah/vance-afb` | 92 | 1 | 1.09% | 7.3 |
| 121 | `/bah/malmstrom-afb` | 86 | 0 | 0.00% | 7.0 |
| 124 | `/bah/mcrd-parris-island` | 71 | 0 | 0.00% | 10.3 |
| 125 | `/bah/tyndall-afb` | 71 | 0 | 0.00% | 5.9 |
| 128 | `/bah/nas-meridian` | 53 | 0 | 0.00% | 8.1 |
| 129 | `/bah/naval-submarine-base-new-london` | 50 | 0 | 0.00% | 6.7 |
| 132 | `/bah/altus-afb` | 44 | 0 | 0.00% | 8.3 |
| 133 | `/bah/dyess-afb` | 42 | 0 | 0.00% | 8.1 |
| 136 | `/bah/hill-afb` | 27 | 0 | 0.00% | 7.9 |
| 137 | `/bah/nab-coronado` | 21 | 0 | 0.00% | 7.3 |

## Arm B pages in the read-out (68)

| # | Page | Impr. | Clicks | CTR | Pos. |
|---|---|---|---|---|---|
| 2 | `/bah/fort-bragg` | 15,663 | 57 | 0.36% | 7.2 |
| 3 | `/bah/fort-hood` | 13,989 | 55 | 0.39% | 7.1 |
| 6 | `/bah/fort-benning` | 5,329 | 13 | 0.24% | 8.5 |
| 7 | `/bah/naval-air-station-whidbey-island` | 4,844 | 41 | 0.85% | 6.1 |
| 10 | `/bah/mcb-hawaii` | 3,845 | 10 | 0.26% | 10.4 |
| 11 | `/bah/davis-monthan-afb` | 3,676 | 11 | 0.30% | 6.9 |
| 14 | `/bah/eglin-afb` | 3,134 | 4 | 0.13% | 8.0 |
| 15 | `/bah/naval-station-san-diego` | 3,012 | 3 | 0.10% | 9.3 |
| 18 | `/bah/marine-corps-air-ground-combat-center` | 2,426 | 5 | 0.21% | 10.2 |
| 19 | `/bah/fort-meade` | 2,362 | 14 | 0.59% | 8.5 |
| 22 | `/bah/hurlburt-field` | 2,076 | 10 | 0.48% | 8.2 |
| 23 | `/bah/joint-base-langley-eustis` | 1,943 | 9 | 0.46% | 8.3 |
| 26 | `/bah/us-naval-academy` | 1,573 | 9 | 0.57% | 22.4 |
| 27 | `/bah/naval-station-everett` | 1,481 | 8 | 0.54% | 7.8 |
| 30 | `/bah/joint-base-san-antonio` | 1,402 | 1 | 0.07% | 8.5 |
| 31 | `/bah/luke-afb` | 1,332 | 4 | 0.30% | 8.0 |
| 34 | `/bah/fort-carson` | 1,064 | 3 | 0.28% | 8.0 |
| 35 | `/bah/fort-sill` | 1,035 | 3 | 0.29% | 7.7 |
| 38 | `/bah/little-rock-afb` | 831 | 5 | 0.60% | 7.6 |
| 39 | `/bah/scott-afb` | 831 | 2 | 0.24% | 7.3 |
| 42 | `/bah/joint-base-myer-henderson-hall` | 684 | 2 | 0.29% | 26.0 |
| 43 | `/bah/fairchild-afb` | 679 | 1 | 0.15% | 6.7 |
| 46 | `/bah/barksdale-afb` | 649 | 3 | 0.46% | 6.2 |
| 47 | `/bah/fort-bliss` | 633 | 1 | 0.16% | 8.1 |
| 50 | `/bah/los-angeles-afb` | 541 | 2 | 0.37% | 8.1 |
| 51 | `/bah/base-kodiak` | 534 | 13 | 2.43% | 9.3 |
| 54 | `/bah/nas-lemoore` | 481 | 2 | 0.42% | 7.8 |
| 55 | `/bah/nellis-afb` | 463 | 2 | 0.43% | 6.7 |
| 58 | `/bah/beale-afb` | 437 | 1 | 0.23% | 7.4 |
| 59 | `/bah/holloman-afb` | 432 | 1 | 0.23% | 7.3 |
| 62 | `/bah/edwards-afb` | 389 | 1 | 0.26% | 8.2 |
| 63 | `/bah/fort-drum` | 387 | 0 | 0.00% | 6.9 |
| 66 | `/bah/joint-base-little-creek-fort-story` | 373 | 1 | 0.27% | 7.4 |
| 67 | `/bah/fort-campbell` | 368 | 3 | 0.82% | 6.8 |
| 70 | `/bah/shaw-afb` | 324 | 1 | 0.31% | 8.4 |
| 71 | `/bah/mcas-new-river` | 321 | 0 | 0.00% | 7.8 |
| 74 | `/bah/mountain-home-afb` | 282 | 1 | 0.35% | 8.7 |
| 75 | `/bah/usaf-academy` | 282 | 1 | 0.35% | 6.5 |
| 78 | `/bah/nas-fallon` | 266 | 0 | 0.00% | 7.3 |
| 79 | `/bah/nas-key-west` | 266 | 2 | 0.75% | 7.5 |
| 82 | `/bah/fort-leavenworth` | 252 | 0 | 0.00% | 6.9 |
| 83 | `/bah/naval-station-mayport` | 243 | 1 | 0.41% | 6.7 |
| 86 | `/bah/buckley-sfb` | 231 | 3 | 1.30% | 8.3 |
| 87 | `/bah/nas-north-island` | 230 | 0 | 0.00% | 7.5 |
| 90 | `/bah/naval-medical-center-portsmouth` | 223 | 0 | 0.00% | 7.8 |
| 91 | `/bah/fort-huachuca` | 220 | 1 | 0.45% | 7.1 |
| 94 | `/bah/sheppard-afb` | 199 | 0 | 0.00% | 7.3 |
| 95 | `/bah/aberdeen-proving-ground` | 193 | 3 | 1.55% | 22.1 |
| 98 | `/bah/fort-riley` | 182 | 0 | 0.00% | 7.7 |
| 99 | `/bah/joint-base-anacostia-bolling` | 182 | 1 | 0.55% | 8.1 |
| 102 | `/bah/maxwell-afb` | 166 | 1 | 0.60% | 7.3 |
| 103 | `/bah/tracen-cape-may` | 161 | 6 | 3.73% | 10.0 |
| 106 | `/bah/carlisle-barracks` | 141 | 0 | 0.00% | 7.2 |
| 107 | `/bah/columbus-afb` | 137 | 0 | 0.00% | 8.1 |
| 110 | `/bah/kirtland-afb` | 129 | 0 | 0.00% | 6.9 |
| 111 | `/bah/grand-forks-afb` | 128 | 1 | 0.78% | 7.6 |
| 114 | `/bah/ellsworth-afb` | 109 | 0 | 0.00% | 8.7 |
| 115 | `/bah/fort-mcnair` | 109 | 0 | 0.00% | 7.5 |
| 118 | `/bah/mcrd-san-diego` | 95 | 0 | 0.00% | 12.8 |
| 119 | `/bah/naval-postgraduate-school` | 93 | 0 | 0.00% | 6.8 |
| 122 | `/bah/joint-base-cape-cod` | 85 | 2 | 2.35% | 7.9 |
| 123 | `/bah/laughlin-afb` | 74 | 0 | 0.00% | 7.7 |
| 126 | `/bah/fort-mccoy` | 70 | 1 | 1.43% | 7.5 |
| 127 | `/bah/fort-shafter` | 56 | 0 | 0.00% | 7.7 |
| 130 | `/bah/redstone-arsenal` | 50 | 0 | 0.00% | 7.9 |
| 131 | `/bah/naval-submarine-base-kings-bay` | 48 | 0 | 0.00% | 7.4 |
| 134 | `/bah/nas-corpus-christi` | 41 | 0 | 0.00% | 8.6 |
| 135 | `/bah/mcconnell-afb` | 36 | 0 | 0.00% | 7.6 |

## Arm B pages excluded from the read-out (5; no GSC row)

- `/bah/camp-pendleton`
- `/bah/fort-irwin`
- `/bah/marine-corps-base-quantico`
- `/bah/minot-afb`
- `/bah/schriever-sfb`

## Turning it off

One line in `src/data/bah/serpTest.ts`:
- `SERP_TEST_MODE = 'all-b'` puts every CONUS station page on B;
- `'all-a'` puts every page back on today's output.

`tests/e2e/station-serp-data.spec.ts` checks both modes. A's output is held byte-identical to the pre-test snapshot in `tests/e2e/fixtures/station-serp-main-snapshot.json`.
