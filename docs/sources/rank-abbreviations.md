# Rank abbreviations by pay grade (build RL)

Source: U.S. Military Rank Insignia, war.gov (https://www.war.gov/Our-Story/Insignias/). Table compiled by Claude Chat; verified against war.gov at PR review before merge.

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

Warrant grades (W-1 to W-5) keep the site's existing labels (WO1, CW2–CW5), shown once for all
services; see the build report for the open questions on service-specific warrant titles.

Read by `src/data/ranks/rankTitles.ts`. `tests/e2e/rank-titles-unit.spec.ts` checks the module
against this table as written here (the expected values are typed into the test from this file,
not read from the module).
