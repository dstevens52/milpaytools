# PCS rules check for build #7 (Claude Chat, 2026-11-18)

Checked against DTMO, DFAS, PDTATAC (JTR change memos and computation examples) and GSA / Federal Register. Before coding each rule, confirm it against the current JTR PDF (travel.dod.mil, August 2026 edition or later). If the JTR text differs from this note, the JTR wins, and the report says so.

## 1. POV travel days (JTR par. 050205)
- 400 miles or less: 1 day.
- More than 400 miles: official distance ÷ 350, rounded down, plus 1 more day if the remainder is 51 miles or more.
- Worked examples from PDTATAC: 1,500 mi → 4 rem 100 → 5 days (CE-MPDT-01). 2,627 mi → 7 rem 177 → 8 days (CE-CPDT-20). 1,010 mi → 2 rem 300 → 3 days (CE-MPDT-07).
- Distance is the official DTOD distance, not the miles actually driven.
- Sources: https://www.travel.dod.mil/Portals/119/Documents/JTR/CE/CE-MPDT-01.pdf ; DTMO CY2026 POV mileage memo (MAP/CAP 46-26(I)): https://media.defense.gov/2026/Jul/30/2003972149/-1/-1/1/UTD-CTD_FOR_MAP-CAP_46-26(I)_UPDATED_CY2026_PRIVATELY_OWNED_VEHICLE_(POV)_MILEAGE_RATES.PDF/UTD-CTD_FOR_MAP-CAP_46-26(I)_UPDATED_CY2026_PRIVATELY_OWNED_VEHICLE_(POV)_MILEAGE_RATES.PDF

## 2. PCS en route per diem by POV (JTR par. 050301, Table 5-4: "MALT Plus")
**Corrected 2026-11-18, 8:45 pm, after reading the JTR text.** An earlier version of this note said 75% M&IE on the first and last day. That rule belongs to Lodging Plus travel (air, train, bus, or mixed days that fall under par. 020310), **not** to POV travel.
- JTR Table 5-4, row 1: "MALT Plus at the standard CONUS per diem rate is paid for each authorized travel day."
- JTR Appendix A spells MALT Plus out as "Monetary Allowance in Lieu of Transportation Plus **Flat** Per Diem."
- So for a POV PCS: member gets the full standard CONUS per diem (lodging + M&IE, no 75% cut on any day) × authorized travel days. Authorized travel days are the lesser of the authorized travel time (section 1) and the actual elapsed time (par. 0503).
- Table 5-4, row 4: if a day falls under Lodging Plus (e.g., arrival at a TDY location or port of embarkation), that day uses the par. 020310 rules instead and isn't a MALT Plus travel day. The calculator doesn't model that; one note is enough.
- Source: JTR edition dated Oct 1, 2024 (copy at https://api.army.mil/e2/c/downloads/2024/10/09/6820fc93/jtr-october-2024.pdf; travel.dod.mil blocks automated fetches). The only later change found that touches en route per diem is MAP 03-26(R), effective July 6, 2026: it changed **Table 5-5** (airplane/train/ship/bus), giving lodging + 75% M&IE on the day travel ends when lodging is needed. It doesn't change POV/MALT Plus.
  - MAP 03-26(R): https://media.defense.gov/2026/Jul/10/2003960170/-1/-1/0/UTD_FOR_MAP_03-26(R)_LODGING_FOR_THE_LAST_DAY_OF_TRAVEL_TO_THE_NEW_PERMANENT_DUTY_STATION.PDF
- Dependents traveling with the member: 75% of the member's rate each for age 12 or older; 50% for under 12. Source: https://www.dfas.mil/MilitaryMembers/travelpay/armypcs/En-Route-Travel

## 3. Standard CONUS per diem rates (GSA)
- FY2026 (Oct 1, 2025 – Sep 30, 2026): lodging $110, M&IE $68. Source: FTR Bulletin 26-01, https://www.federalregister.gov/documents/2025/08/19/2025-15771/maximum-per-diem-reimbursement-rates-for-the-continental-united-states-conus
- FY2027 (Oct 1, 2026 – Sep 30, 2027): lodging $113, M&IE $68. Source: FTR Bulletin 27-01, https://www.federalregister.gov/documents/2026/09/10/2026-18439/maximum-per-diem-reimbursement-rates-for-the-continental-united-states-conus
- **DATA flag resolved:** the calculator's M&IE of $69 is wrong. Standard CONUS M&IE is $68 in both years. Moves on or after Oct 1, 2026 use $113 lodging. Store both years with their source URLs and pick by travel date (or use FY2027 with a label).

## 4. TLE (JTR par. 050601, Tables 5-13 and 5-17)
- Days: **21** for a new PDS in CONUS (up from 14, effective Nov 27, 2024, MAP 66-24(R)); 7 for CONUS → OCONUS moves.
  - **DATA flag resolved:** 21 is correct; 14 is out of date.
  - The days are a total across the old and new locations, not 21 at each.
  - Sources: https://myairforcebenefits.us.af.mil/DoD-Authorizes-Additional-7-Days-to-CONUS-Temporary-Lodging-Expense ; DTMO FAQ https://www.travel.dod.mil/Support/ALL-FAQs/Article/3174593
- Daily cap: $290 (DTMO FAQ above).
- Percentages of the locality lodging and M&IE rates (Table 5-17):
  - member or one dependent alone: 65%
  - member + one dependent, or two dependents: 100%
  - each additional dependent age 12 or older: +35%
  - each additional dependent under 12: +25%
  - Sources: DFAS https://www.dfas.mil/MilitaryMembers/travelpay/armypcs/tle ; PDTATAC CE-MPDT-17 https://www.travel.dod.mil/Portals/119/Documents/JTR/CE/CE-MPDT-17.pdf
- Daily amount = lesser of $290 and (lesser of actual lodging or % × locality lodging) + % × locality M&IE.
- Lodging taxes and mandatory fees count inside the $290 (MAP 55-24(I)).
- Extensions: some MHAs with housing shortages get more days, up to 60 (e.g., Palmdale/Edwards, Vandenberg, NAS Fallon). The list changes often. Don't model it: add one sentence plus a link to DTMO's "Locations with Approved TLE Extensions" supplement.

## 5. HHG weight allowance (JTR par. 051401, Table 5-37, "PCS and NTS Weight Allowances (Pounds)")
Copied from the JTR edition dated Oct 1, 2024 (pages 5C-8 and 5C-9). No later change to these values was found.

| Grade | With dependents | Without dependents |
|---|---|---|
| O-10 to O-6 | 18,000 | 18,000 |
| O-5 or W-5 | 17,500 | 16,000 |
| O-4 or W-4 | 17,000 | 14,000 |
| O-3 or W-3 | 14,500 | 13,000 |
| O-2 or W-2 | 13,500 | 12,500 |
| O-1, W-1, or Service Academy Graduate | 12,000 | 10,000 |
| E-9 | 15,000 | 13,000 |
| E-8 | 14,000 | 12,000 |
| E-7 | 13,000 | 11,000 |
| E-6 | 11,000 | 8,000 |
| E-5 | 9,000 | 7,000 |
| E-4 | 8,000 | 7,000 |
| E-3 to E-1 | 8,000 | 5,000 |

- The table has no O-1E/O-2E/O-3E rows: prior-enlisted officers use the O-1/O-2/O-3 rows.
- "With dependents" means a dependent eligible to travel at government expense on the PCS (par. 051401).
- The weight allowance follows the pay grade on the PCS order's effective date.
- Pro-gear (PBP&E) doesn't count against the allowance.
- The audit's suspicion (PCS-03) is right: the current constants mix the two columns. Replace them with this table.

## 5b. MALT for a second POV (JTR par. 050203, Table 5-1)
- "A Service member or dependent who uses a POV may be authorized MALT."
- Table 5-1: when a Service member and dependent use two POVs, or dependents use two POVs without the member, reimbursement is authorized for each vehicle, for only two POVs (exceptions need authorization).
- A member without dependents traveling alone gets MALT for one POV.

## 6. PPM (DATA flag)
- A PPM pays an incentive of 100% of the Government Constructed Cost (GCC), i.e., what it would have cost the government to move the same weight and distance. The temporary 130% from summer 2025 has ended.
- DoD publishes no single dollar-per-cwt rate. The GCC is computed per move by the transportation office / the move system.
- **Recommendation:** remove any computed PPM dollar figure that rests on a typed $/cwt rate (no hand-keyed figures). Explain how the incentive works and point to the official estimate in the member's move system / transportation office. The separate PPM calculator decision stays on the Dec 9 list.
- Re-verify the "100% of GCC" status on an official .mil page during the build before the copy says it.

## 7. Sources added at review (Claude Chat, 2026-11-18, PR #53)
- **PPM incentive = 100% of the GCC:** Defense Personal Property Program (PPA), "Personally Procured Moves": https://www.ppa.mil/Your-Move/Personally-Procured-Moves/ , opened by Claude Chat in a browser on 2026-11-19; it says "You will be paid 100% of this estimated GCC". Also Military OneSource, "Preparing to Move or PCS" ("the government will pay you 100% of the government's constructed 'best value' cost"; advance "up to 60 percent of the incentive value"): https://www.militaryonesource.mil/resources/millife-guides/preparing-to-move-or-pcs/
- **PPM tax wording:** USMC LOGCOM PPM checklist and expense certification: "The PPM incentive payment is taxable income. Eligible operating expenses ... can reduce the taxed portion." https://www.logcom.marines.mil/Portals/184/Docs/Sites/tvcd/files/forms/PPM-Checklist-032818-1.pdf
- Site wording that follows from it (calculator, /guides/pcs, PCS posts): "The incentive is taxable income; documented moving costs (truck rental, fuel, packing materials) reduce the taxable part."
- Note on provenance (corrected 2026-11-19): ppa.mil and logcom.marines.mil return 403 to automated fetches. The PPA page was opened by Claude Chat in a browser on 2026-11-19 (quote above). The USMC LOGCOM PPM checklist was found by a web search for the official PDF but was not opened; the quote above is from that search result, not from reading the PDF. The Military OneSource page was fetched in the build.
