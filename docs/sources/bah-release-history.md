# BAH national average increases and release dates (official sources)

Verified by Claude Chat, Nov 13, 2026. "Released" is the date DoD published the rates
(dateline of the DoD release). Rates take effect January 1 of the rates year.
No estimates or projections in this file.

| Rates year | Avg increase | Released | Official source |
|---|---|---|---|
| 2026 | 4.2% | 2025-12-11 | Department of War release, dateline "WASHINGTON, December 11, 2025" (myairforcebenefits.us.af.mil): https://myairforcebenefits.us.af.mil/Department-of-War-Releases-2026-Basic-Allowance-for-Housing-Rates . About $29.9B to about 1M members. |
| 2025 | 5.4% | 2024-12-13 | DoD release / DOD News, Dec 13, 2024: https://www.army.mil/article/282083 . About $29.2B; 299 MHAs surveyed. |
| 2024 | 5.4% | 2023-12-14 | DoD release, dateline "WASHINGTON, December 14, 2023" (myairforcebenefits.us.af.mil): https://www.myairforcebenefits.us.af.mil/News/DOD-Releases-2024-Basic-Allowance-for-Housing-Rates . About $27.9B. |
| 2023 | 12.1% | 2022-12-14 | DoD release "DoD releases 2023 basic allowance for housing rates", Dec 14, 2022: https://www.army.mil/article/262868/dod_releases_2023_basic_allowance_for_housing_rates ("increase an average of 12.1 percent when the new rates take effect on January 1, 2023"). About $26.8B. |
| 2022 | 5.1% | 2021-12-15 | DoD release "DoD Releases 2022 Basic Allowance for Housing Rates" (reposted on mycg.uscg.mil Dec 16, 2021): https://www.mycg.uscg.mil/News/Article/2875710/dod-releases-2022-basic-allowance-for-housing-rates/ ("increase an average of 5.1 percent when the new rates take effect on January 1, 2022"). Release date Wednesday Dec 15, 2021 per same-day coverage (Stars and Stripes, 2021-12-15; MOAA "announced the 2022 BAH rates Dec. 15"). About $25.6B. |
| 2021 | 2.9% | 2020-12-15 | DoD release "DOD releases 2021 Basic Allowance for Housing rates", Dec 15, 2020: https://www.army.mil/article/241796/dod_releases_2021_basic_allowance_for_housing_rates ; percent per the same release as reposted at https://www.aetc.af.mil/News/Article-Display/Article/2459119/dod-releases-2021-basic-allowance-for-housing-rates/ ("increase an average of 2.9 percent when the new rates take effect Jan. 1, 2021"). About $23B. |

Correction: earlier notes had the 2021-rates release as Dec 29, 2020 (a base listing). The DoD release is dated Dec 15, 2020.

Correction: the site previously gave the 2024-rates release as 2023-12-15. That date came from a JBSA repost listing, not the DoD release, whose dateline is "WASHINGTON, December 14, 2023".

Data file: `src/data/bah/releaseHistory.ts` mirrors the table row for row (most recent first;
`sourceUrl` is the first URL in the "Official source" cell). `tests/e2e/bah-release-history.spec.ts`
checks it. On release day, add the 2027 row here first, then to the data file
(`docs/RELEASE_DAY_BAH_2027.md`).

## How BAH is set (DoD releases)
- "Median current market rent and average utilities (including electricity, heat, and water/sewer) comprise the total housing cost for each military housing area and are included in the Basic Allowance for Housing computation." (2023 release)
- Member cost-sharing: "five percent of the national average housing cost by pay grade." (2022, 2025, 2026 releases)

## Rate protection
- DoD 2024 release: "No matter what happens to measured housing costs – including the out-of-pocket expense adjustment – an individual member who maintains uninterrupted Basic Allowance for Housing eligibility in a given location will not see his/her Basic Allowance for Housing rate decrease."
- DTMO FAQ (travel.dod.mil, "BAH Rate Changes / Rate Protection"): protected at the previous rate if higher "as long as he/she does not have a reduction in pay grade or change in dependency status." A promotion does not end protection.
- Temporary increases are not covered: DTMO 2022 notice, "by law, normal BAH rate protection―which protects members from decreases in housing market costs―does not apply to these rate increases" (https://www.travel.dod.mil/About/News/Article/Article/3167951/). See `bah-2026-abilene-temporary-increase.md` for TX270.
