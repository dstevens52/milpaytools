# Rank abbreviations by pay grade (build RL)

Source: U.S. Military Rank Insignia, war.gov (https://www.war.gov/Our-Story/Insignias/). Table compiled by Claude Chat; verified against war.gov at PR review before merge.

Verified by Claude Chat against war.gov on 2026-11-25.

Order (DoD order of precedence): Army · Marine Corps · Navy · Air Force · Space Force. The Coast
Guard uses Navy rank names, so the site's helper line says "Navy & Coast Guard".

| Grade | Army | Marine Corps | Navy | Air Force | Space Force |
|---|---|---|---|---|---|
| E-1 | PVT | Pvt | SR | AB | Spc1 |
| E-2 | PV2 | PFC | SA | Amn | Spc2 |
| E-3 | PFC | LCpl | SN | A1C | Spc3 |
| E-4 | SPC / CPL | Cpl | PO3 | SrA | Spc4 |
| E-5 | SGT | Sgt | PO2 | SSgt | Sgt |
| E-6 | SSG | SSgt | PO1 | TSgt | TSgt |
| E-7 | SFC | GySgt | CPO | MSgt | MSgt |
| E-8 | MSG / 1SG | MSgt / 1stSgt | SCPO | SMSgt | SMSgt |
| E-9 | SGM / CSM | MGySgt / SgtMaj | MCPO | CMSgt | CMSgt |
| O-1 | 2LT | 2ndLt | ENS | 2d Lt | 2d Lt |
| O-2 | 1LT | 1stLt | LTJG | 1st Lt | 1st Lt |
| O-3 | CPT | Capt | LT | Capt | Capt |
| O-4 | MAJ | Maj | LCDR | Maj | Maj |
| O-5 | LTC | LtCol | CDR | Lt Col | Lt Col |
| O-6 | COL | Col | CAPT | Col | Col |
| O-7 | BG | BGen | RDML | Brig Gen | Brig Gen |
| O-8 | MG | MajGen | RADM | Maj Gen | Maj Gen |
| O-9 | LTG | LtGen | VADM | Lt Gen | Lt Gen |
| O-10 | GEN | Gen | ADM | Gen | Gen |

War.gov shows no abbreviation for Army, Marine Corps and Air Force E-1. PVT, Pvt and AB are the
services' standard forms.

## Warrant officers

Per war.gov. There are no Air Force warrant officers ("There are no warrant officers in the Air
Force"), and none are listed for the Space Force (— = none). The Coast Guard has CWO2–CWO4 only.

| Grade | Army | Marine Corps | Navy | Coast Guard | Air Force | Space Force |
|---|---|---|---|---|---|---|
| W-1 | WO1 | WO | WO1 | — | — | — |
| W-2 | CW2 | CWO2 | CWO2 | CWO2 | — | — |
| W-3 | CW3 | CWO3 | CWO3 | CWO3 | — | — |
| W-4 | CW4 | CWO4 | CWO4 | CWO4 | — | — |
| W-5 | CW5 | CWO5 | CWO5 | — | — | — |

The dropdown label merges identical abbreviations for warrant grades ("W-2 (CW2 · CWO2)"); the
helper line names the services and ends "no Air Force or Space Force warrant officers". At W-1 and
W-5 the Navy slot reads "Navy", not "Navy & Coast Guard".

## Full titles

E-1 to O-6 reuse the wording of the `/pay/[rank]` pages. O-7 to O-10 are the standard titles;
Navy and Coast Guard O-7 and O-8 use war.gov's wording, "Rear Admiral Lower Half" and "Rear Admiral
Upper Half".

Read by `src/data/ranks/rankTitles.ts`. `tests/e2e/rank-titles-unit.spec.ts` checks the module
against this table as written here (the expected values are typed into the test from this file,
not read from the module).
