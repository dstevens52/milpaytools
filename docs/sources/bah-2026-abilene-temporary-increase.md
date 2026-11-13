# BAH 2026 — Abilene/Dyess AFB temporary increase (official source record)

**MHA:** TX270 — ABILENE/DYESS AFB, TX (28 ZIPs in `sorted_zipmha26.txt`)
**Effective:** May 16, 2026 (DTMO year selector label: "2026 Abilene Temporary Increase (Effective 05/16/2026)")
**Source:** DTMO BAH ASCII package `BAH-ASCII-2026.zip` — https://www.travel.dod.mil/Portals/119/Documents/BAH/BAH_Rates_All_Locations_All_Pay_Grades/ASCII/BAH-ASCII-2026.zip — files `bahw26.txt` (current) vs `bahw26 - old.txt` (January), and the same for `bahwo26`.
**Retrieved and verified:** 2026-11-12 by Claude Chat. TX270 is the **only** MHA that differs between the current and "old" files (both with and without dependents).
**Column order check:** the "old" TX270 row matches the repo's `src/data/bah/2026/mhaRates.ts` TX270 entry value-for-value in this order: E-1…E-9, W-1…W-5, O-1E, O-2E, O-3E, O-1…O-7, then O-8/O-9/O-10 (= O-7).

## With dependents (bahw26.txt)
| Grade | Jan 2026 (old) | Current (eff. 05/16/2026) |
|---|---|---|
| E-1 | 1458 | 1761 |
| E-2 | 1458 | 1761 |
| E-3 | 1458 | 1761 |
| E-4 | 1458 | 1761 |
| E-5 | 1554 | 1872 |
| E-6 | 2214 | 2820 |
| E-7 | 2238 | 2844 |
| E-8 | 2247 | 2853 |
| E-9 | 2298 | 2895 |
| W-1 | 2235 | 2841 |
| W-2 | 2244 | 2850 |
| W-3 | 2256 | 2862 |
| W-4 | 2325 | 2919 |
| W-5 | 2448 | 3030 |
| O-1E | 2241 | 2847 |
| O-2E | 2250 | 2856 |
| O-3E | 2343 | 2937 |
| O-1 | 1635 | 1989 |
| O-2 | 2205 | 2805 |
| O-3 | 2253 | 2859 |
| O-4 | 2484 | 3063 |
| O-5 | 2676 | 3234 |
| O-6 | 2694 | 3258 |
| O-7 | 2712 | 3282 |

## Without dependents (bahwo26.txt)
| Grade | Jan 2026 (old) | Current (eff. 05/16/2026) |
|---|---|---|
| E-1 | 1170 | 1380 |
| E-2 | 1170 | 1380 |
| E-3 | 1170 | 1380 |
| E-4 | 1170 | 1380 |
| E-5 | 1287 | 1545 |
| E-6 | 1662 | 2115 |
| E-7 | 1680 | 2133 |
| E-8 | 1692 | 2145 |
| E-9 | 1884 | 2352 |
| W-1 | 1677 | 2130 |
| W-2 | 1689 | 2142 |
| W-3 | 1908 | 2382 |
| W-4 | 2211 | 2817 |
| W-5 | 2220 | 2826 |
| O-1E | 1686 | 2139 |
| O-2E | 1842 | 2286 |
| O-3E | 2208 | 2814 |
| O-1 | 1362 | 1644 |
| O-2 | 1683 | 2136 |
| O-3 | 1974 | 2475 |
| O-4 | 2214 | 2820 |
| O-5 | 2223 | 2829 |
| O-6 | 2226 | 2832 |
| O-7 | 2241 | 2859 |

## Raw rows (verbatim)
```
bahw26.txt          TX270,1761.00,1761.00,1761.00,1761.00,1872.00,2820.00,2844.00,2853.00,2895.00,2841.00,2850.00,2862.00,2919.00,3030.00,2847.00,2856.00,2937.00,1989.00,2805.00,2859.00,3063.00,3234.00,3258.00,3282.00,3282.00,3282.00,3282.00
bahw26 - old.txt    TX270,1458.00,1458.00,1458.00,1458.00,1554.00,2214.00,2238.00,2247.00,2298.00,2235.00,2244.00,2256.00,2325.00,2448.00,2241.00,2250.00,2343.00,1635.00,2205.00,2253.00,2484.00,2676.00,2694.00,2712.00,2712.00,2712.00,2712.00
bahwo26.txt         TX270,1380.00,1380.00,1380.00,1380.00,1545.00,2115.00,2133.00,2145.00,2352.00,2130.00,2142.00,2382.00,2817.00,2826.00,2139.00,2286.00,2814.00,1644.00,2136.00,2475.00,2820.00,2829.00,2832.00,2859.00,2859.00,2859.00,2859.00
bahwo26 - old.txt   TX270,1170.00,1170.00,1170.00,1170.00,1287.00,1662.00,1680.00,1692.00,1884.00,1677.00,1689.00,1908.00,2211.00,2220.00,1686.00,1842.00,2208.00,1362.00,1683.00,1974.00,2214.00,2223.00,2226.00,2241.00,2241.00,2241.00,2241.00
```

## Lesson for the annual update process
DTMO can issue **mid-year** BAH changes for individual MHAs (here, a "temporary increase"). The January update alone doesn't catch them. Add a quarterly check: compare the current DTMO ASCII package against the repo data, and look for "old" files or new options in the DTMO year selector.

## Expiration and rate protection
Resolved by Claude Chat, 2026-11-13.

- **The temporary rates expire December 31, 2026.** DTMO notice "Temporary BAH Increase for
  Abilene/Dyess AFB" (May 13, 2026),
  https://www.travel.dod.mil/About/News/Article/Article/4485972/temporary-bah-increase-for-abilenedyess-afb/ :
  the temporary rates expire December 31, 2026; 2027 rates will be announced later and may be
  different. The notice does not mention rate protection.
- **Precedent: rate protection does not apply to temporary increases.**
  - DTMO, "DoD Authorizes an Automatic Increase to 2022 BAH Rates for Certain Locations",
    https://www.travel.dod.mil/About/News/Article/Article/3167951/dod-authorizes-an-automatic-increase-to-2022-bah-rates-for-certain-locations :
    "by law, normal BAH rate protection―which protects members from decreases in housing market
    costs―does not apply to these rate increases."
  - The same for the 2021 temporary increase (DoD, Sept 2021, e.g.
    https://www.33fw.af.mil/News/Article/2792602/ : "BAH rate protection ... does not apply to
    temporary rate increases").

How the site uses this (data: the `temporary` block on TX270 in
`src/data/bah/2026/midYearChanges.ts`; text: `src/data/bah/midYear.ts`):
- **Now (2026 rates):** `/bah/dyess-afb` says the temporary rates expire December 31, 2026, that
  DTMO says 2027 rates may be different, and that in DoD's 2021 and 2022 temporary increases rate
  protection did not apply to the temporary amounts.
- **Once 2027 rates load:** for any MHA with a temporary increase in the prior year (data-driven,
  not a TX270 check), the station page shows "The temporary 2026 rates for {area} (effective {date})
  expire December 31, 2026. DoD has said rate protection doesn't apply to temporary increases, so
  the 2027 rate replaces them for pay grades where it's lower." instead of the rate-protection
  paragraph. Year-over-year figures compare against the temporary rate (the rate in effect on
  December 31, 2026) and say so. The import report lists these MHAs under
  "Temporary increase ending", not under "Decreases".
