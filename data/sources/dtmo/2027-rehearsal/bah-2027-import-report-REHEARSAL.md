# BAH 2027 import report

Generated 2026-11-20 by `npm run bah:import -- --year 2027 --src data/sources/dtmo/2027-rehearsal --prior 2026`.
Compared against the 2026 data as shipped in `src/data/bah/2026/` (including any mid-year changes).

## Inputs

Source: `data/sources/dtmo/2027-rehearsal`

| file | bytes | lines | SHA-256 |
|---|---|---|---|
| bahw27.txt | 75,036 | 338 | `6dc4bd4616548c8946653a14882018dda518ef41ca8ec634569f3ee2b7f98d59` |
| bahwo27.txt | 75,008 | 338 | `a53fb2c5216d77a4cfbb62d938d8858bd6ff2e0b5e6fac96c1eebdc1b468fee6` |
| sorted_zipmha27.txt | 532,467 | 40,959 | `0c3681ca66f06db27ef6ae8ab38b49ac5b18c4a3dd31c9cebca64f0dfd0fed54` |
| mhanames27.txt | 8,004 | 339 | `bfb679a60f1df82357f5437bd8191c733ee6585ce73163e91a2bd0a03583a3bf` |

## Counts

| | 2027 | 2026 | change |
|---|---|---|---|
| ZIP codes | 40,959 | 40,959 | 0 (+0.0%) |
| XX499 territory ZIPs | 214 | 214 | |
| MHAs with rates | 338 | 338 | 0 |
| MHA names | 339 | | |

## MHAs added / removed

Added (0): none

Removed (0): none

## ZIP changes

Remapped to a different MHA: **3**. New ZIPs: 0. Dropped ZIPs: 0.

| ZIP | was | now |
|---|---|---|
| 06858 | CT051 | CT049 |
| 17582 | PA247 | PA250 |
| 99011 | WA310 | WA307 |

Station-page ZIPs remapped: Fairchild AFB 99011 WA310→WA307

Every remapped ZIP is written to `src/data/bah/2027/zipPriorMha.ts`. Register it (`BAH_LOOKUP_TABLES['2027'].priorMhaByZip`) so year-over-year figures and the "2026 rate applies" line use each ZIP's 2026 MHA. A remapped station page also shows a new MHA name and rates: check it on the preview.

## 2026 mid-year changes in the comparison base

The 2026 rates compared below include these DTMO mid-year changes, so a "decrease" there may be the end of a temporary increase rather than a cut to the January 2026 rate:

- TX270 (Abilene/Dyess Afb, TX): 2026 Abilene Temporary Increase (Effective 05/16/2026), effective 2026-05-16

## E-5 with dependents: % change distribution

338 MHAs present in both years. Median +4.0%, p10 −1.3%, p90 +8.0%. Unchanged: 10. (This is not DoD's national-average increase; that figure comes only from the DoD release.)

### Top 10 by % change

| MHA | name | stations | old | new | change |
|---|---|---|---|---|---|
| ND188 | Bismarck, ND |  | $1,596 | $1,740 | +$144 (+9.0%) |
| NC177 | Morehead/Cherry Pt Mcas, NC | MCAS Cherry Point | $1,851 | $2,018 | +$167 (+9.0%) |
| MD135 | Patuxent River, MD | NAS Patuxent River | $2,406 | $2,623 | +$217 (+9.0%) |
| ZZ770 | County Cost Group 770 |  | $1,752 | $1,910 | +$158 (+9.0%) |
| FL064 | Pensacola, FL | Naval Air Station Pensacola | $1,863 | $2,031 | +$168 (+9.0%) |
| MT175 | Malmstrom Sfb/Great Falls, MT | Malmstrom AFB | $1,608 | $1,753 | +$145 (+9.0%) |
| VA297 | Hampton/Newport News, VA | Joint Base Langley-Eustis | $2,274 | $2,479 | +$205 (+9.0%) |
| WI317 | Milwaukee, WI |  | $2,607 | $2,842 | +$235 (+9.0%) |
| SD264 | Rapid City/Ellsworth Afb, SD | Ellsworth AFB | $1,986 | $2,165 | +$179 (+9.0%) |
| VA298 | Norfolk/Portsmouth, VA | Naval Station Norfolk, Joint Base Little Creek-Fort Story, Naval Air Station Oceana, Naval Medical Center Portsmouth, Dam Neck Annex | $2,430 | $2,649 | +$219 (+9.0%) |

### Bottom 10 by % change

| MHA | name | stations | old | new | change |
|---|---|---|---|---|---|
| TX270 | Abilene/Dyess Afb, TX | Dyess AFB | $1,872 | $1,616 | −$256 (−13.7%) |
| HI409 | Hawaii County, HI |  | $3,594 | $3,414 | −$180 (−5.0%) |
| MI155 | Ann Arbor, MI |  | $2,559 | $2,431 | −$128 (−5.0%) |
| GA076 | Robins Afb, GA | Robins AFB | $1,800 | $1,710 | −$90 (−5.0%) |
| FL067 | West Palm Beach, FL |  | $3,423 | $3,252 | −$171 (−5.0%) |
| FL070 | Volusia County, FL |  | $2,286 | $2,172 | −$114 (−5.0%) |
| AL001 | Anniston/Fort Mcclellan, AL |  | $1,185 | $1,126 | −$59 (−5.0%) |
| ZZ680 | County Cost Group 680 |  | $1,470 | $1,397 | −$73 (−5.0%) |
| MN158 | Duluth, MN |  | $2,064 | $1,981 | −$83 (−4.0%) |
| NJ203 | Trenton, NJ |  | $3,465 | $3,326 | −$139 (−4.0%) |

## Temporary increase ending

These 2026 rates were temporary increases. Rate protection doesn't apply to them (DoD 2021, DTMO 2022), so where the new rate is lower, it replaces the temporary rate. Station pages show the "temporary rates ended" wording here, not the rate-protection paragraph. Not counted under Decreases below.

| MHA | name | stations | temporary since | expires | cells lower than the temporary rate |
|---|---|---|---|---|---|
| TX270 | Abilene/Dyess Afb, TX | Dyess AFB | 2026-05-16 | 2026-12-31 | 48 |

| MHA | grade | dep | temporary | new |
|---|---|---|---|---|
| TX270 | E-1 | with | $1,761 | $1,516 |
| TX270 | E-2 | with | $1,761 | $1,516 |
| TX270 | E-3 | with | $1,761 | $1,516 |
| TX270 | E-4 | with | $1,761 | $1,516 |
| TX270 | E-5 | with | $1,872 | $1,616 |
| TX270 | E-6 | with | $2,820 | $2,303 |
| TX270 | E-7 | with | $2,844 | $2,328 |
| TX270 | E-8 | with | $2,853 | $2,337 |
| TX270 | E-9 | with | $2,895 | $2,390 |
| TX270 | W-1 | with | $2,841 | $2,324 |
| TX270 | W-2 | with | $2,850 | $2,334 |
| TX270 | W-3 | with | $2,862 | $2,346 |
| TX270 | W-4 | with | $2,919 | $2,418 |
| TX270 | W-5 | with | $3,030 | $2,546 |
| TX270 | O-1E | with | $2,847 | $2,331 |
| TX270 | O-2E | with | $2,856 | $2,340 |
| TX270 | O-3E | with | $2,937 | $2,437 |
| TX270 | O-1 | with | $1,989 | $1,700 |
| TX270 | O-2 | with | $2,805 | $2,293 |
| TX270 | O-3 | with | $2,859 | $2,343 |
| TX270 | O-4 | with | $3,063 | $2,583 |
| TX270 | O-5 | with | $3,234 | $2,783 |
| TX270 | O-6 | with | $3,258 | $2,802 |
| TX270 | O-7 | with | $3,282 | $2,820 |
| TX270 | E-1 | without | $1,380 | $1,217 |
| TX270 | E-2 | without | $1,380 | $1,217 |
| TX270 | E-3 | without | $1,380 | $1,217 |
| TX270 | E-4 | without | $1,380 | $1,217 |
| TX270 | E-5 | without | $1,545 | $1,338 |
| TX270 | E-6 | without | $2,115 | $1,728 |
| TX270 | E-7 | without | $2,133 | $1,747 |
| TX270 | E-8 | without | $2,145 | $1,760 |
| TX270 | E-9 | without | $2,352 | $1,959 |
| TX270 | W-1 | without | $2,130 | $1,744 |
| TX270 | W-2 | without | $2,142 | $1,757 |
| TX270 | W-3 | without | $2,382 | $1,984 |
| TX270 | W-4 | without | $2,817 | $2,299 |
| TX270 | W-5 | without | $2,826 | $2,309 |
| TX270 | O-1E | without | $2,139 | $1,753 |
| TX270 | O-2E | without | $2,286 | $1,916 |
| TX270 | O-3E | without | $2,814 | $2,296 |
| TX270 | O-1 | without | $1,644 | $1,416 |
| TX270 | O-2 | without | $2,136 | $1,750 |
| TX270 | O-3 | without | $2,475 | $2,053 |
| TX270 | O-4 | without | $2,820 | $2,303 |
| TX270 | O-5 | without | $2,829 | $2,312 |
| TX270 | O-6 | without | $2,832 | $2,315 |
| TX270 | O-7 | without | $2,859 | $2,331 |

## Decreases

**1920** MHA × grade × dependency cells decreased, across **40** MHAs (not counting 48 cells listed under "Temporary increase ending").

Station-page MHAs with a decrease: 10.

| MHA | stations | grade | dep | old | new |
|---|---|---|---|---|---|
| AL005 | Maxwell AFB | E-1 | with | $1,605 | $1,589 |
| AL005 | Maxwell AFB | E-2 | with | $1,605 | $1,589 |
| AL005 | Maxwell AFB | E-3 | with | $1,605 | $1,589 |
| AL005 | Maxwell AFB | E-4 | with | $1,605 | $1,589 |
| AL005 | Maxwell AFB | E-5 | with | $1,683 | $1,666 |
| AL005 | Maxwell AFB | E-6 | with | $1,758 | $1,740 |
| AL005 | Maxwell AFB | E-7 | with | $1,818 | $1,800 |
| AL005 | Maxwell AFB | E-8 | with | $1,887 | $1,868 |
| AL005 | Maxwell AFB | E-9 | with | $2,034 | $2,014 |
| AL005 | Maxwell AFB | W-1 | with | $1,773 | $1,755 |
| AL005 | Maxwell AFB | W-2 | with | $1,845 | $1,827 |
| AL005 | Maxwell AFB | W-3 | with | $1,935 | $1,916 |
| AL005 | Maxwell AFB | W-4 | with | $2,073 | $2,052 |
| AL005 | Maxwell AFB | W-5 | with | $2,244 | $2,222 |
| AL005 | Maxwell AFB | O-1E | with | $1,827 | $1,809 |
| AL005 | Maxwell AFB | O-2E | with | $1,920 | $1,901 |
| AL005 | Maxwell AFB | O-3E | with | $2,100 | $2,079 |
| AL005 | Maxwell AFB | O-1 | with | $1,701 | $1,684 |
| AL005 | Maxwell AFB | O-2 | with | $1,755 | $1,737 |
| AL005 | Maxwell AFB | O-3 | with | $1,932 | $1,913 |
| AL005 | Maxwell AFB | O-4 | with | $2,298 | $2,275 |
| AL005 | Maxwell AFB | O-5 | with | $2,565 | $2,539 |
| AL005 | Maxwell AFB | O-6 | with | $2,583 | $2,557 |
| AL005 | Maxwell AFB | O-7 | with | $2,598 | $2,572 |
| AL005 | Maxwell AFB | E-1 | without | $1,269 | $1,256 |
| AL005 | Maxwell AFB | E-2 | without | $1,269 | $1,256 |
| AL005 | Maxwell AFB | E-3 | without | $1,269 | $1,256 |
| AL005 | Maxwell AFB | E-4 | without | $1,269 | $1,256 |
| AL005 | Maxwell AFB | E-5 | without | $1,431 | $1,417 |
| AL005 | Maxwell AFB | E-6 | without | $1,527 | $1,512 |
| AL005 | Maxwell AFB | E-7 | without | $1,605 | $1,589 |
| AL005 | Maxwell AFB | E-8 | without | $1,704 | $1,687 |
| AL005 | Maxwell AFB | E-9 | without | $1,713 | $1,696 |
| AL005 | Maxwell AFB | W-1 | without | $1,590 | $1,574 |
| AL005 | Maxwell AFB | W-2 | without | $1,701 | $1,684 |
| AL005 | Maxwell AFB | W-3 | without | $1,719 | $1,702 |
| AL005 | Maxwell AFB | W-4 | without | $1,764 | $1,746 |
| AL005 | Maxwell AFB | W-5 | without | $1,833 | $1,815 |
| AL005 | Maxwell AFB | O-1E | without | $1,680 | $1,663 |
| AL005 | Maxwell AFB | O-2E | without | $1,710 | $1,693 |
| AL005 | Maxwell AFB | O-3E | without | $1,746 | $1,729 |
| AL005 | Maxwell AFB | O-1 | without | $1,524 | $1,509 |
| AL005 | Maxwell AFB | O-2 | without | $1,662 | $1,645 |
| AL005 | Maxwell AFB | O-3 | without | $1,725 | $1,708 |
| AL005 | Maxwell AFB | O-4 | without | $1,815 | $1,797 |
| AL005 | Maxwell AFB | O-5 | without | $1,923 | $1,904 |
| AL005 | Maxwell AFB | O-6 | without | $1,938 | $1,919 |
| AL005 | Maxwell AFB | O-7 | without | $1,950 | $1,931 |
| AZ016 | MCAS Yuma | E-1 | with | $1,551 | $1,520 |
| AZ016 | MCAS Yuma | E-2 | with | $1,551 | $1,520 |
| AZ016 | MCAS Yuma | E-3 | with | $1,551 | $1,520 |
| AZ016 | MCAS Yuma | E-4 | with | $1,551 | $1,520 |
| AZ016 | MCAS Yuma | E-5 | with | $1,695 | $1,661 |
| AZ016 | MCAS Yuma | E-6 | with | $1,845 | $1,808 |
| AZ016 | MCAS Yuma | E-7 | with | $1,917 | $1,879 |
| AZ016 | MCAS Yuma | E-8 | with | $1,998 | $1,958 |
| AZ016 | MCAS Yuma | E-9 | with | $2,115 | $2,073 |
| AZ016 | MCAS Yuma | W-1 | with | $1,860 | $1,823 |
| AZ016 | MCAS Yuma | W-2 | with | $1,950 | $1,911 |
| AZ016 | MCAS Yuma | W-3 | with | $2,052 | $2,011 |
| AZ016 | MCAS Yuma | W-4 | with | $2,139 | $2,096 |
| AZ016 | MCAS Yuma | W-5 | with | $2,253 | $2,208 |
| AZ016 | MCAS Yuma | O-1E | with | $1,929 | $1,890 |
| AZ016 | MCAS Yuma | O-2E | with | $2,034 | $1,993 |
| AZ016 | MCAS Yuma | O-3E | with | $2,157 | $2,114 |
| AZ016 | MCAS Yuma | O-1 | with | $1,722 | $1,688 |
| AZ016 | MCAS Yuma | O-2 | with | $1,842 | $1,805 |
| AZ016 | MCAS Yuma | O-3 | with | $2,049 | $2,008 |
| AZ016 | MCAS Yuma | O-4 | with | $2,283 | $2,237 |
| AZ016 | MCAS Yuma | O-5 | with | $2,454 | $2,405 |
| AZ016 | MCAS Yuma | O-6 | with | $2,472 | $2,423 |
| AZ016 | MCAS Yuma | O-7 | with | $2,487 | $2,437 |
| AZ016 | MCAS Yuma | E-1 | without | $1,239 | $1,214 |
| AZ016 | MCAS Yuma | E-2 | without | $1,239 | $1,214 |
| AZ016 | MCAS Yuma | E-3 | without | $1,239 | $1,214 |
| AZ016 | MCAS Yuma | E-4 | without | $1,239 | $1,214 |
| AZ016 | MCAS Yuma | E-5 | without | $1,338 | $1,311 |
| AZ016 | MCAS Yuma | E-6 | without | $1,413 | $1,385 |
| AZ016 | MCAS Yuma | E-7 | without | $1,554 | $1,523 |
| AZ016 | MCAS Yuma | E-8 | without | $1,731 | $1,696 |
| AZ016 | MCAS Yuma | E-9 | without | $1,764 | $1,729 |
| AZ016 | MCAS Yuma | W-1 | without | $1,512 | $1,482 |
| AZ016 | MCAS Yuma | W-2 | without | $1,728 | $1,693 |
| AZ016 | MCAS Yuma | W-3 | without | $1,773 | $1,738 |
| AZ016 | MCAS Yuma | W-4 | without | $1,854 | $1,817 |
| AZ016 | MCAS Yuma | W-5 | without | $1,935 | $1,896 |
| AZ016 | MCAS Yuma | O-1E | without | $1,692 | $1,658 |
| AZ016 | MCAS Yuma | O-2E | without | $1,758 | $1,723 |
| AZ016 | MCAS Yuma | O-3E | without | $1,833 | $1,796 |
| AZ016 | MCAS Yuma | O-1 | without | $1,401 | $1,373 |
| AZ016 | MCAS Yuma | O-2 | without | $1,650 | $1,617 |
| AZ016 | MCAS Yuma | O-3 | without | $1,785 | $1,749 |
| AZ016 | MCAS Yuma | O-4 | without | $1,914 | $1,876 |
| AZ016 | MCAS Yuma | O-5 | without | $1,956 | $1,917 |
| AZ016 | MCAS Yuma | O-6 | without | $2,031 | $1,990 |
| AZ016 | MCAS Yuma | O-7 | without | $2,061 | $2,020 |
| CA028 | Fort Irwin (National Training Center) | E-1 | with | $1,890 | $1,814 |
| CA028 | Fort Irwin (National Training Center) | E-2 | with | $1,890 | $1,814 |
| CA028 | Fort Irwin (National Training Center) | E-3 | with | $1,890 | $1,814 |
| CA028 | Fort Irwin (National Training Center) | E-4 | with | $1,890 | $1,814 |
| CA028 | Fort Irwin (National Training Center) | E-5 | with | $2,001 | $1,921 |
| CA028 | Fort Irwin (National Training Center) | E-6 | with | $2,430 | $2,333 |
| CA028 | Fort Irwin (National Training Center) | E-7 | with | $2,547 | $2,445 |
| CA028 | Fort Irwin (National Training Center) | E-8 | with | $2,673 | $2,566 |
| CA028 | Fort Irwin (National Training Center) | E-9 | with | $2,814 | $2,701 |
| CA028 | Fort Irwin (National Training Center) | W-1 | with | $2,451 | $2,353 |
| CA028 | Fort Irwin (National Training Center) | W-2 | with | $2,598 | $2,494 |
| CA028 | Fort Irwin (National Training Center) | W-3 | with | $2,751 | $2,641 |
| CA028 | Fort Irwin (National Training Center) | W-4 | with | $2,838 | $2,724 |
| CA028 | Fort Irwin (National Training Center) | W-5 | with | $2,946 | $2,828 |
| CA028 | Fort Irwin (National Training Center) | O-1E | with | $2,568 | $2,465 |
| CA028 | Fort Irwin (National Training Center) | O-2E | with | $2,730 | $2,621 |
| CA028 | Fort Irwin (National Training Center) | O-3E | with | $2,856 | $2,742 |
| CA028 | Fort Irwin (National Training Center) | O-1 | with | $2,058 | $1,976 |
| CA028 | Fort Irwin (National Training Center) | O-2 | with | $2,427 | $2,330 |
| CA028 | Fort Irwin (National Training Center) | O-3 | with | $2,748 | $2,638 |
| CA028 | Fort Irwin (National Training Center) | O-4 | with | $2,976 | $2,857 |
| CA028 | Fort Irwin (National Training Center) | O-5 | with | $3,144 | $3,018 |
| CA028 | Fort Irwin (National Training Center) | O-6 | with | $3,168 | $3,041 |
| CA028 | Fort Irwin (National Training Center) | O-7 | with | $3,189 | $3,061 |
| CA028 | Fort Irwin (National Training Center) | E-1 | without | $1,557 | $1,495 |
| CA028 | Fort Irwin (National Training Center) | E-2 | without | $1,557 | $1,495 |
| CA028 | Fort Irwin (National Training Center) | E-3 | without | $1,557 | $1,495 |
| CA028 | Fort Irwin (National Training Center) | E-4 | without | $1,557 | $1,495 |
| CA028 | Fort Irwin (National Training Center) | E-5 | without | $1,695 | $1,627 |
| CA028 | Fort Irwin (National Training Center) | E-6 | without | $1,824 | $1,751 |
| CA028 | Fort Irwin (National Training Center) | E-7 | without | $1,911 | $1,835 |
| CA028 | Fort Irwin (National Training Center) | E-8 | without | $2,091 | $2,007 |
| CA028 | Fort Irwin (National Training Center) | E-9 | without | $2,214 | $2,125 |
| CA028 | Fort Irwin (National Training Center) | W-1 | without | $1,866 | $1,791 |
| CA028 | Fort Irwin (National Training Center) | W-2 | without | $2,088 | $2,004 |
| CA028 | Fort Irwin (National Training Center) | W-3 | without | $2,232 | $2,143 |
| CA028 | Fort Irwin (National Training Center) | W-4 | without | $2,454 | $2,356 |
| CA028 | Fort Irwin (National Training Center) | W-5 | without | $2,574 | $2,471 |
| CA028 | Fort Irwin (National Training Center) | O-1E | without | $1,998 | $1,918 |
| CA028 | Fort Irwin (National Training Center) | O-2E | without | $2,187 | $2,100 |
| CA028 | Fort Irwin (National Training Center) | O-3E | without | $2,424 | $2,327 |
| CA028 | Fort Irwin (National Training Center) | O-1 | without | $1,776 | $1,705 |
| CA028 | Fort Irwin (National Training Center) | O-2 | without | $1,968 | $1,889 |
| CA028 | Fort Irwin (National Training Center) | O-3 | without | $2,274 | $2,183 |
| CA028 | Fort Irwin (National Training Center) | O-4 | without | $2,550 | $2,448 |
| CA028 | Fort Irwin (National Training Center) | O-5 | without | $2,616 | $2,511 |
| CA028 | Fort Irwin (National Training Center) | O-6 | without | $2,730 | $2,621 |
| CA028 | Fort Irwin (National Training Center) | O-7 | without | $2,778 | $2,667 |
| GA076 | Robins AFB | E-1 | with | $1,692 | $1,607 |
| GA076 | Robins AFB | E-2 | with | $1,692 | $1,607 |
| GA076 | Robins AFB | E-3 | with | $1,692 | $1,607 |
| GA076 | Robins AFB | E-4 | with | $1,692 | $1,607 |
| GA076 | Robins AFB | E-5 | with | $1,800 | $1,710 |
| GA076 | Robins AFB | E-6 | with | $1,878 | $1,784 |
| GA076 | Robins AFB | E-7 | with | $1,992 | $1,892 |
| GA076 | Robins AFB | E-8 | with | $2,118 | $2,012 |
| GA076 | Robins AFB | E-9 | with | $2,283 | $2,169 |
| GA076 | Robins AFB | W-1 | with | $1,893 | $1,798 |
| GA076 | Robins AFB | W-2 | with | $2,043 | $1,941 |
| GA076 | Robins AFB | W-3 | with | $2,202 | $2,092 |
| GA076 | Robins AFB | W-4 | with | $2,313 | $2,197 |
| GA076 | Robins AFB | W-5 | with | $2,451 | $2,328 |
| GA076 | Robins AFB | O-1E | with | $2,013 | $1,912 |
| GA076 | Robins AFB | O-2E | with | $2,178 | $2,069 |
| GA076 | Robins AFB | O-3E | with | $2,334 | $2,217 |
| GA076 | Robins AFB | O-1 | with | $1,818 | $1,727 |
| GA076 | Robins AFB | O-2 | with | $1,875 | $1,781 |
| GA076 | Robins AFB | O-3 | with | $2,199 | $2,089 |
| GA076 | Robins AFB | O-4 | with | $2,496 | $2,371 |
| GA076 | Robins AFB | O-5 | with | $2,709 | $2,574 |
| GA076 | Robins AFB | O-6 | with | $2,730 | $2,594 |
| GA076 | Robins AFB | O-7 | with | $2,745 | $2,608 |
| GA076 | Robins AFB | E-1 | without | $1,341 | $1,274 |
| GA076 | Robins AFB | E-2 | without | $1,341 | $1,274 |
| GA076 | Robins AFB | E-3 | without | $1,341 | $1,274 |
| GA076 | Robins AFB | E-4 | without | $1,341 | $1,274 |
| GA076 | Robins AFB | E-5 | without | $1,491 | $1,416 |
| GA076 | Robins AFB | E-6 | without | $1,590 | $1,511 |
| GA076 | Robins AFB | E-7 | without | $1,695 | $1,610 |
| GA076 | Robins AFB | E-8 | without | $1,824 | $1,733 |
| GA076 | Robins AFB | E-9 | without | $1,833 | $1,741 |
| GA076 | Robins AFB | W-1 | without | $1,668 | $1,585 |
| GA076 | Robins AFB | W-2 | without | $1,821 | $1,730 |
| GA076 | Robins AFB | W-3 | without | $1,839 | $1,747 |
| GA076 | Robins AFB | W-4 | without | $1,896 | $1,801 |
| GA076 | Robins AFB | W-5 | without | $2,019 | $1,918 |
| GA076 | Robins AFB | O-1E | without | $1,797 | $1,707 |
| GA076 | Robins AFB | O-2E | without | $1,830 | $1,739 |
| GA076 | Robins AFB | O-3E | without | $1,866 | $1,773 |
| GA076 | Robins AFB | O-1 | without | $1,581 | $1,502 |
| GA076 | Robins AFB | O-2 | without | $1,770 | $1,682 |
| GA076 | Robins AFB | O-3 | without | $1,842 | $1,750 |
| GA076 | Robins AFB | O-4 | without | $1,992 | $1,892 |
| GA076 | Robins AFB | O-5 | without | $2,064 | $1,961 |
| GA076 | Robins AFB | O-6 | without | $2,181 | $2,072 |
| GA076 | Robins AFB | O-7 | without | $2,217 | $2,106 |
| IL092 | Naval Station Great Lakes | E-1 | with | $2,202 | $2,180 |
| IL092 | Naval Station Great Lakes | E-2 | with | $2,202 | $2,180 |
| IL092 | Naval Station Great Lakes | E-3 | with | $2,202 | $2,180 |
| IL092 | Naval Station Great Lakes | E-4 | with | $2,202 | $2,180 |
| IL092 | Naval Station Great Lakes | E-5 | with | $2,427 | $2,403 |
| IL092 | Naval Station Great Lakes | E-6 | with | $2,760 | $2,732 |
| IL092 | Naval Station Great Lakes | E-7 | with | $2,853 | $2,824 |
| IL092 | Naval Station Great Lakes | E-8 | with | $2,955 | $2,925 |
| IL092 | Naval Station Great Lakes | E-9 | with | $3,120 | $3,089 |
| IL092 | Naval Station Great Lakes | W-1 | with | $2,778 | $2,750 |
| IL092 | Naval Station Great Lakes | W-2 | with | $2,895 | $2,866 |
| IL092 | Naval Station Great Lakes | W-3 | with | $3,021 | $2,991 |
| IL092 | Naval Station Great Lakes | W-4 | with | $3,156 | $3,124 |
| IL092 | Naval Station Great Lakes | W-5 | with | $3,327 | $3,294 |
| IL092 | Naval Station Great Lakes | O-1E | with | $2,871 | $2,842 |
| IL092 | Naval Station Great Lakes | O-2E | with | $3,000 | $2,970 |
| IL092 | Naval Station Great Lakes | O-3E | with | $3,183 | $3,151 |
| IL092 | Naval Station Great Lakes | O-1 | with | $2,475 | $2,450 |
| IL092 | Naval Station Great Lakes | O-2 | with | $2,757 | $2,729 |
| IL092 | Naval Station Great Lakes | O-3 | with | $3,018 | $2,988 |
| IL092 | Naval Station Great Lakes | O-4 | with | $3,381 | $3,347 |
| IL092 | Naval Station Great Lakes | O-5 | with | $3,645 | $3,609 |
| IL092 | Naval Station Great Lakes | O-6 | with | $3,675 | $3,638 |
| IL092 | Naval Station Great Lakes | O-7 | with | $3,702 | $3,665 |
| IL092 | Naval Station Great Lakes | E-1 | without | $1,653 | $1,636 |
| IL092 | Naval Station Great Lakes | E-2 | without | $1,653 | $1,636 |
| IL092 | Naval Station Great Lakes | E-3 | without | $1,653 | $1,636 |
| IL092 | Naval Station Great Lakes | E-4 | without | $1,653 | $1,636 |
| IL092 | Naval Station Great Lakes | E-5 | without | $1,854 | $1,835 |
| IL092 | Naval Station Great Lakes | E-6 | without | $2,067 | $2,046 |
| IL092 | Naval Station Great Lakes | E-7 | without | $2,211 | $2,189 |
| IL092 | Naval Station Great Lakes | E-8 | without | $2,499 | $2,474 |
| IL092 | Naval Station Great Lakes | E-9 | without | $2,592 | $2,566 |
| IL092 | Naval Station Great Lakes | W-1 | without | $2,133 | $2,112 |
| IL092 | Naval Station Great Lakes | W-2 | without | $2,496 | $2,471 |
| IL092 | Naval Station Great Lakes | W-3 | without | $2,604 | $2,578 |
| IL092 | Naval Station Great Lakes | W-4 | without | $2,778 | $2,750 |
| IL092 | Naval Station Great Lakes | W-5 | without | $2,874 | $2,845 |
| IL092 | Naval Station Great Lakes | O-1E | without | $2,424 | $2,400 |
| IL092 | Naval Station Great Lakes | O-2E | without | $2,571 | $2,545 |
| IL092 | Naval Station Great Lakes | O-3E | without | $2,751 | $2,723 |
| IL092 | Naval Station Great Lakes | O-1 | without | $1,977 | $1,957 |
| IL092 | Naval Station Great Lakes | O-2 | without | $2,355 | $2,331 |
| IL092 | Naval Station Great Lakes | O-3 | without | $2,637 | $2,611 |
| IL092 | Naval Station Great Lakes | O-4 | without | $2,853 | $2,824 |
| IL092 | Naval Station Great Lakes | O-5 | without | $2,907 | $2,878 |
| IL092 | Naval Station Great Lakes | O-6 | without | $3,000 | $2,970 |
| IL092 | Naval Station Great Lakes | O-7 | without | $3,051 | $3,020 |
| MD130 | Fort Detrick | E-1 | with | $2,466 | $2,417 |
| MD130 | Fort Detrick | E-2 | with | $2,466 | $2,417 |
| MD130 | Fort Detrick | E-3 | with | $2,466 | $2,417 |
| MD130 | Fort Detrick | E-4 | with | $2,466 | $2,417 |
| MD130 | Fort Detrick | E-5 | with | $2,682 | $2,628 |
| MD130 | Fort Detrick | E-6 | with | $3,063 | $3,002 |
| MD130 | Fort Detrick | E-7 | with | $3,132 | $3,069 |
| MD130 | Fort Detrick | E-8 | with | $3,207 | $3,143 |
| MD130 | Fort Detrick | E-9 | with | $3,345 | $3,278 |
| MD130 | Fort Detrick | W-1 | with | $3,081 | $3,019 |
| MD130 | Fort Detrick | W-2 | with | $3,162 | $3,099 |
| MD130 | Fort Detrick | W-3 | with | $3,258 | $3,193 |
| MD130 | Fort Detrick | W-4 | with | $3,375 | $3,308 |
| MD130 | Fort Detrick | W-5 | with | $3,525 | $3,455 |
| MD130 | Fort Detrick | O-1E | with | $3,144 | $3,081 |
| MD130 | Fort Detrick | O-2E | with | $3,243 | $3,178 |
| MD130 | Fort Detrick | O-3E | with | $3,399 | $3,331 |
| MD130 | Fort Detrick | O-1 | with | $2,733 | $2,678 |
| MD130 | Fort Detrick | O-2 | with | $3,060 | $2,999 |
| MD130 | Fort Detrick | O-3 | with | $3,255 | $3,190 |
| MD130 | Fort Detrick | O-4 | with | $3,573 | $3,502 |
| MD130 | Fort Detrick | O-5 | with | $3,804 | $3,728 |
| MD130 | Fort Detrick | O-6 | with | $3,837 | $3,760 |
| MD130 | Fort Detrick | O-7 | with | $3,864 | $3,787 |
| MD130 | Fort Detrick | E-1 | without | $2,016 | $1,976 |
| MD130 | Fort Detrick | E-2 | without | $2,016 | $1,976 |
| MD130 | Fort Detrick | E-3 | without | $2,016 | $1,976 |
| MD130 | Fort Detrick | E-4 | without | $2,016 | $1,976 |
| MD130 | Fort Detrick | E-5 | without | $2,160 | $2,117 |
| MD130 | Fort Detrick | E-6 | without | $2,295 | $2,249 |
| MD130 | Fort Detrick | E-7 | without | $2,472 | $2,423 |
| MD130 | Fort Detrick | E-8 | without | $2,763 | $2,708 |
| MD130 | Fort Detrick | E-9 | without | $2,871 | $2,814 |
| MD130 | Fort Detrick | W-1 | without | $2,400 | $2,352 |
| MD130 | Fort Detrick | W-2 | without | $2,760 | $2,705 |
| MD130 | Fort Detrick | W-3 | without | $2,886 | $2,828 |
| MD130 | Fort Detrick | W-4 | without | $3,075 | $3,014 |
| MD130 | Fort Detrick | W-5 | without | $3,147 | $3,084 |
| MD130 | Fort Detrick | O-1E | without | $2,679 | $2,625 |
| MD130 | Fort Detrick | O-2E | without | $2,847 | $2,790 |
| MD130 | Fort Detrick | O-3E | without | $3,054 | $2,993 |
| MD130 | Fort Detrick | O-1 | without | $2,247 | $2,202 |
| MD130 | Fort Detrick | O-2 | without | $2,613 | $2,561 |
| MD130 | Fort Detrick | O-3 | without | $2,922 | $2,864 |
| MD130 | Fort Detrick | O-4 | without | $3,129 | $3,066 |
| MD130 | Fort Detrick | O-5 | without | $3,168 | $3,105 |
| MD130 | Fort Detrick | O-6 | without | $3,234 | $3,169 |
| MD130 | Fort Detrick | O-7 | without | $3,291 | $3,225 |
| MS168 | Keesler AFB | E-1 | with | $1,509 | $1,449 |
| MS168 | Keesler AFB | E-2 | with | $1,509 | $1,449 |
| MS168 | Keesler AFB | E-3 | with | $1,509 | $1,449 |
| MS168 | Keesler AFB | E-4 | with | $1,509 | $1,449 |
| MS168 | Keesler AFB | E-5 | with | $1,602 | $1,538 |
| MS168 | Keesler AFB | E-6 | with | $1,620 | $1,555 |
| MS168 | Keesler AFB | E-7 | with | $1,770 | $1,699 |
| MS168 | Keesler AFB | E-8 | with | $1,938 | $1,860 |
| MS168 | Keesler AFB | E-9 | with | $2,139 | $2,053 |
| MS168 | Keesler AFB | W-1 | with | $1,635 | $1,570 |
| MS168 | Keesler AFB | W-2 | with | $1,836 | $1,763 |
| MS168 | Keesler AFB | W-3 | with | $2,046 | $1,964 |
| MS168 | Keesler AFB | W-4 | with | $2,175 | $2,088 |
| MS168 | Keesler AFB | W-5 | with | $2,331 | $2,238 |
| MS168 | Keesler AFB | O-1E | with | $1,800 | $1,728 |
| MS168 | Keesler AFB | O-2E | with | $2,016 | $1,935 |
| MS168 | Keesler AFB | O-3E | with | $2,199 | $2,111 |
| MS168 | Keesler AFB | O-1 | with | $1,614 | $1,549 |
| MS168 | Keesler AFB | O-2 | with | $1,617 | $1,552 |
| MS168 | Keesler AFB | O-3 | with | $2,040 | $1,958 |
| MS168 | Keesler AFB | O-4 | with | $2,379 | $2,284 |
| MS168 | Keesler AFB | O-5 | with | $2,625 | $2,520 |
| MS168 | Keesler AFB | O-6 | with | $2,643 | $2,537 |
| MS168 | Keesler AFB | O-7 | with | $2,658 | $2,552 |
| MS168 | Keesler AFB | E-1 | without | $1,305 | $1,253 |
| MS168 | Keesler AFB | E-2 | without | $1,305 | $1,253 |
| MS168 | Keesler AFB | E-3 | without | $1,305 | $1,253 |
| MS168 | Keesler AFB | E-4 | without | $1,305 | $1,253 |
| MS168 | Keesler AFB | E-5 | without | $1,365 | $1,310 |
| MS168 | Keesler AFB | E-6 | without | $1,416 | $1,359 |
| MS168 | Keesler AFB | E-7 | without | $1,509 | $1,449 |
| MS168 | Keesler AFB | E-8 | without | $1,611 | $1,547 |
| MS168 | Keesler AFB | E-9 | without | $1,617 | $1,552 |
| MS168 | Keesler AFB | W-1 | without | $1,488 | $1,428 |
| MS168 | Keesler AFB | W-2 | without | $1,608 | $1,544 |
| MS168 | Keesler AFB | W-3 | without | $1,620 | $1,555 |
| MS168 | Keesler AFB | W-4 | without | $1,653 | $1,587 |
| MS168 | Keesler AFB | W-5 | without | $1,806 | $1,734 |
| MS168 | Keesler AFB | O-1E | without | $1,599 | $1,535 |
| MS168 | Keesler AFB | O-2E | without | $1,614 | $1,549 |
| MS168 | Keesler AFB | O-3E | without | $1,650 | $1,584 |
| MS168 | Keesler AFB | O-1 | without | $1,410 | $1,354 |
| MS168 | Keesler AFB | O-2 | without | $1,575 | $1,512 |
| MS168 | Keesler AFB | O-3 | without | $1,623 | $1,558 |
| MS168 | Keesler AFB | O-4 | without | $1,785 | $1,714 |
| MS168 | Keesler AFB | O-5 | without | $1,968 | $1,889 |
| MS168 | Keesler AFB | O-6 | without | $2,025 | $1,944 |
| MS168 | Keesler AFB | O-7 | without | $2,058 | $1,976 |
| NM206 | Kirtland AFB | E-1 | with | $1,992 | $1,932 |
| NM206 | Kirtland AFB | E-2 | with | $1,992 | $1,932 |
| NM206 | Kirtland AFB | E-3 | with | $1,992 | $1,932 |
| NM206 | Kirtland AFB | E-4 | with | $1,992 | $1,932 |
| NM206 | Kirtland AFB | E-5 | with | $2,211 | $2,145 |
| NM206 | Kirtland AFB | E-6 | with | $2,328 | $2,258 |
| NM206 | Kirtland AFB | E-7 | with | $2,352 | $2,281 |
| NM206 | Kirtland AFB | E-8 | with | $2,379 | $2,308 |
| NM206 | Kirtland AFB | E-9 | with | $2,472 | $2,398 |
| NM206 | Kirtland AFB | W-1 | with | $2,343 | $2,273 |
| NM206 | Kirtland AFB | W-2 | with | $2,361 | $2,290 |
| NM206 | Kirtland AFB | W-3 | with | $2,400 | $2,328 |
| NM206 | Kirtland AFB | W-4 | with | $2,502 | $2,427 |
| NM206 | Kirtland AFB | W-5 | with | $2,631 | $2,552 |
| NM206 | Kirtland AFB | O-1E | with | $2,355 | $2,284 |
| NM206 | Kirtland AFB | O-2E | with | $2,391 | $2,319 |
| NM206 | Kirtland AFB | O-3E | with | $2,520 | $2,444 |
| NM206 | Kirtland AFB | O-1 | with | $2,235 | $2,168 |
| NM206 | Kirtland AFB | O-2 | with | $2,325 | $2,255 |
| NM206 | Kirtland AFB | O-3 | with | $2,397 | $2,325 |
| NM206 | Kirtland AFB | O-4 | with | $2,670 | $2,590 |
| NM206 | Kirtland AFB | O-5 | with | $2,871 | $2,785 |
| NM206 | Kirtland AFB | O-6 | with | $2,892 | $2,805 |
| NM206 | Kirtland AFB | O-7 | with | $2,910 | $2,823 |
| NM206 | Kirtland AFB | E-1 | without | $1,557 | $1,510 |
| NM206 | Kirtland AFB | E-2 | without | $1,557 | $1,510 |
| NM206 | Kirtland AFB | E-3 | without | $1,557 | $1,510 |
| NM206 | Kirtland AFB | E-4 | without | $1,557 | $1,510 |
| NM206 | Kirtland AFB | E-5 | without | $1,689 | $1,638 |
| NM206 | Kirtland AFB | E-6 | without | $1,794 | $1,740 |
| NM206 | Kirtland AFB | E-7 | without | $2,001 | $1,941 |
| NM206 | Kirtland AFB | E-8 | without | $2,241 | $2,174 |
| NM206 | Kirtland AFB | E-9 | without | $2,265 | $2,197 |
| NM206 | Kirtland AFB | W-1 | without | $1,926 | $1,868 |
| NM206 | Kirtland AFB | W-2 | without | $2,238 | $2,171 |
| NM206 | Kirtland AFB | W-3 | without | $2,271 | $2,203 |
| NM206 | Kirtland AFB | W-4 | without | $2,325 | $2,255 |
| NM206 | Kirtland AFB | W-5 | without | $2,355 | $2,284 |
| NM206 | Kirtland AFB | O-1E | without | $2,208 | $2,142 |
| NM206 | Kirtland AFB | O-2E | without | $2,259 | $2,191 |
| NM206 | Kirtland AFB | O-3E | without | $2,316 | $2,247 |
| NM206 | Kirtland AFB | O-1 | without | $1,770 | $1,717 |
| NM206 | Kirtland AFB | O-2 | without | $2,142 | $2,078 |
| NM206 | Kirtland AFB | O-3 | without | $2,280 | $2,212 |
| NM206 | Kirtland AFB | O-4 | without | $2,343 | $2,273 |
| NM206 | Kirtland AFB | O-5 | without | $2,358 | $2,287 |
| NM206 | Kirtland AFB | O-6 | without | $2,376 | $2,305 |
| NM206 | Kirtland AFB | O-7 | without | $2,415 | $2,343 |
| VA301 | Fort Lee | E-1 | with | $2,157 | $2,071 |
| VA301 | Fort Lee | E-2 | with | $2,157 | $2,071 |
| VA301 | Fort Lee | E-3 | with | $2,157 | $2,071 |
| VA301 | Fort Lee | E-4 | with | $2,157 | $2,071 |
| VA301 | Fort Lee | E-5 | with | $2,358 | $2,264 |
| VA301 | Fort Lee | E-6 | with | $2,628 | $2,523 |
| VA301 | Fort Lee | E-7 | with | $2,676 | $2,569 |
| VA301 | Fort Lee | E-8 | with | $2,727 | $2,618 |
| VA301 | Fort Lee | E-9 | with | $2,835 | $2,722 |
| VA301 | Fort Lee | W-1 | with | $2,646 | $2,540 |
| VA301 | Fort Lee | W-2 | with | $2,694 | $2,586 |
| VA301 | Fort Lee | W-3 | with | $2,763 | $2,652 |
| VA301 | Fort Lee | W-4 | with | $2,862 | $2,748 |
| VA301 | Fort Lee | W-5 | with | $2,991 | $2,871 |
| VA301 | Fort Lee | O-1E | with | $2,682 | $2,575 |
| VA301 | Fort Lee | O-2E | with | $2,751 | $2,641 |
| VA301 | Fort Lee | O-3E | with | $2,883 | $2,768 |
| VA301 | Fort Lee | O-1 | with | $2,400 | $2,304 |
| VA301 | Fort Lee | O-2 | with | $2,625 | $2,520 |
| VA301 | Fort Lee | O-3 | with | $2,760 | $2,650 |
| VA301 | Fort Lee | O-4 | with | $3,030 | $2,909 |
| VA301 | Fort Lee | O-5 | with | $3,231 | $3,102 |
| VA301 | Fort Lee | O-6 | with | $3,255 | $3,125 |
| VA301 | Fort Lee | O-7 | with | $3,276 | $3,145 |
| VA301 | Fort Lee | E-1 | without | $1,728 | $1,659 |
| VA301 | Fort Lee | E-2 | without | $1,728 | $1,659 |
| VA301 | Fort Lee | E-3 | without | $1,728 | $1,659 |
| VA301 | Fort Lee | E-4 | without | $1,728 | $1,659 |
| VA301 | Fort Lee | E-5 | without | $1,866 | $1,791 |
| VA301 | Fort Lee | E-6 | without | $1,971 | $1,892 |
| VA301 | Fort Lee | E-7 | without | $2,163 | $2,076 |
| VA301 | Fort Lee | E-8 | without | $2,418 | $2,321 |
| VA301 | Fort Lee | E-9 | without | $2,490 | $2,390 |
| VA301 | Fort Lee | W-1 | without | $2,094 | $2,010 |
| VA301 | Fort Lee | W-2 | without | $2,415 | $2,318 |
| VA301 | Fort Lee | W-3 | without | $2,502 | $2,402 |
| VA301 | Fort Lee | W-4 | without | $2,631 | $2,526 |
| VA301 | Fort Lee | W-5 | without | $2,685 | $2,578 |
| VA301 | Fort Lee | O-1E | without | $2,355 | $2,261 |
| VA301 | Fort Lee | O-2E | without | $2,475 | $2,376 |
| VA301 | Fort Lee | O-3E | without | $2,619 | $2,514 |
| VA301 | Fort Lee | O-1 | without | $1,950 | $1,872 |
| VA301 | Fort Lee | O-2 | without | $2,295 | $2,203 |
| VA301 | Fort Lee | O-3 | without | $2,526 | $2,425 |
| VA301 | Fort Lee | O-4 | without | $2,670 | $2,563 |
| VA301 | Fort Lee | O-5 | without | $2,694 | $2,586 |
| VA301 | Fort Lee | O-6 | without | $2,739 | $2,629 |
| VA301 | Fort Lee | O-7 | without | $2,784 | $2,673 |
| WA306 | Naval Base Kitsap | E-1 | with | $2,265 | $2,220 |
| WA306 | Naval Base Kitsap | E-2 | with | $2,265 | $2,220 |
| WA306 | Naval Base Kitsap | E-3 | with | $2,265 | $2,220 |
| WA306 | Naval Base Kitsap | E-4 | with | $2,265 | $2,220 |
| WA306 | Naval Base Kitsap | E-5 | with | $2,364 | $2,317 |
| WA306 | Naval Base Kitsap | E-6 | with | $2,730 | $2,675 |
| WA306 | Naval Base Kitsap | E-7 | with | $2,844 | $2,787 |
| WA306 | Naval Base Kitsap | E-8 | with | $2,967 | $2,908 |
| WA306 | Naval Base Kitsap | E-9 | with | $3,105 | $3,043 |
| WA306 | Naval Base Kitsap | W-1 | with | $2,751 | $2,696 |
| WA306 | Naval Base Kitsap | W-2 | with | $2,895 | $2,837 |
| WA306 | Naval Base Kitsap | W-3 | with | $3,048 | $2,987 |
| WA306 | Naval Base Kitsap | W-4 | with | $3,126 | $3,063 |
| WA306 | Naval Base Kitsap | W-5 | with | $3,228 | $3,163 |
| WA306 | Naval Base Kitsap | O-1E | with | $2,865 | $2,808 |
| WA306 | Naval Base Kitsap | O-2E | with | $3,024 | $2,964 |
| WA306 | Naval Base Kitsap | O-3E | with | $3,144 | $3,081 |
| WA306 | Naval Base Kitsap | O-1 | with | $2,415 | $2,367 |
| WA306 | Naval Base Kitsap | O-2 | with | $2,727 | $2,672 |
| WA306 | Naval Base Kitsap | O-3 | with | $3,045 | $2,984 |
| WA306 | Naval Base Kitsap | O-4 | with | $3,258 | $3,193 |
| WA306 | Naval Base Kitsap | O-5 | with | $3,411 | $3,343 |
| WA306 | Naval Base Kitsap | O-6 | with | $3,438 | $3,369 |
| WA306 | Naval Base Kitsap | O-7 | with | $3,462 | $3,393 |
| WA306 | Naval Base Kitsap | E-1 | without | $1,974 | $1,935 |
| WA306 | Naval Base Kitsap | E-2 | without | $1,974 | $1,935 |
| WA306 | Naval Base Kitsap | E-3 | without | $1,974 | $1,935 |
| WA306 | Naval Base Kitsap | E-4 | without | $1,974 | $1,935 |
| WA306 | Naval Base Kitsap | E-5 | without | $2,091 | $2,049 |
| WA306 | Naval Base Kitsap | E-6 | without | $2,169 | $2,126 |
| WA306 | Naval Base Kitsap | E-7 | without | $2,265 | $2,220 |
| WA306 | Naval Base Kitsap | E-8 | without | $2,442 | $2,393 |
| WA306 | Naval Base Kitsap | E-9 | without | $2,547 | $2,496 |
| WA306 | Naval Base Kitsap | W-1 | without | $2,244 | $2,199 |
| WA306 | Naval Base Kitsap | W-2 | without | $2,439 | $2,390 |
| WA306 | Naval Base Kitsap | W-3 | without | $2,562 | $2,511 |
| WA306 | Naval Base Kitsap | W-4 | without | $2,754 | $2,699 |
| WA306 | Naval Base Kitsap | W-5 | without | $2,871 | $2,814 |
| WA306 | Naval Base Kitsap | O-1E | without | $2,361 | $2,314 |
| WA306 | Naval Base Kitsap | O-2E | without | $2,523 | $2,473 |
| WA306 | Naval Base Kitsap | O-3E | without | $2,724 | $2,670 |
| WA306 | Naval Base Kitsap | O-1 | without | $2,163 | $2,120 |
| WA306 | Naval Base Kitsap | O-2 | without | $2,337 | $2,290 |
| WA306 | Naval Base Kitsap | O-3 | without | $2,595 | $2,543 |
| WA306 | Naval Base Kitsap | O-4 | without | $2,847 | $2,790 |
| WA306 | Naval Base Kitsap | O-5 | without | $2,913 | $2,855 |
| WA306 | Naval Base Kitsap | O-6 | without | $3,027 | $2,966 |
| WA306 | Naval Base Kitsap | O-7 | without | $3,078 | $3,016 |

## Station-page MHAs: E-5 old → new

| MHA | name | stations | lookup ZIP | E-5 w/dep | E-5 w/o dep |
|---|---|---|---|---|---|
| AK403 | Kodiak Island, AK | Coast Guard Base Kodiak | 99615 | $2,865 → $3,008 | $2,148 → $2,255 |
| AK404 | Anchorage, AK | Joint Base Elmendorf-Richardson | 99501 | $2,874 → $3,018 | $2,157 → $2,265 |
| AK405 | Fairbanks, AK | Fort Wainwright, Eielson AFB | 99701 | $2,436 → $2,558 | $1,827 → $1,918 |
| AL002 | Fort Rucker, AL | Fort Rucker | 36362 | $1,572 → $1,603 | $1,251 → $1,276 |
| AL003 | Huntsville, AL | Redstone Arsenal | 35801 | $1,797 → $1,923 | $1,443 → $1,544 |
| AL005 | Montgomery, AL | Maxwell AFB | 36108 | $1,683 → $1,666 | $1,431 → $1,417 |
| AR010 | Little Rock, AR | Little Rock AFB | 72076 | $1,848 → $1,885 | $1,548 → $1,579 |
| AZ013 | Phoenix, AZ | Luke AFB | 85301 | $2,289 → $2,403 | $1,740 → $1,827 |
| AZ014 | Fort Huachuca, AZ | Fort Huachuca | 85635 | $1,719 → $1,771 | $1,347 → $1,387 |
| AZ015 | Davis-Monthan Afb, AZ | Davis-Monthan AFB | 85701 | $1,905 → $2,019 | $1,428 → $1,514 |
| AZ016 | Yuma, AZ | MCAS Yuma | 85365 | $1,695 → $1,661 | $1,338 → $1,311 |
| CA021 | China Lake, CA | Naval Air Weapons Station China Lake | 93555 | $1,563 → $1,594 | $1,428 → $1,457 |
| CA023 | Lemoore Nas, CA | NAS Lemoore | 93245 | $2,139 → $2,267 | $1,680 → $1,781 |
| CA024 | Camp Pendleton, CA | Marine Corps Base Camp Pendleton | 92054 | $3,963 → $3,963 | $3,093 → $3,093 |
| CA025 | Ventura, CA | Naval Base Ventura County | 93041 | $3,537 → $3,572 | $3,018 → $3,048 |
| CA026 | Vandenberg Sfb, CA | Vandenberg Space Force Base | 93436 | $3,333 → $3,400 | $2,778 → $2,834 |
| CA028 | Barstow/Fort Irwin, CA | Fort Irwin (National Training Center) | 92311 | $2,001 → $1,921 | $1,695 → $1,627 |
| CA032 | Twenty Nine Palms Mcb, CA | MCAGCC Twentynine Palms | 92277 | $1,980 → $2,099 | $1,782 → $1,889 |
| CA033 | Beale Afb, CA | Beale AFB | 95901 | $2,967 → $3,056 | $2,367 → $2,438 |
| CA036 | Vallejo/Travis Afb, CA | Travis AFB | 94533 | $3,369 → $3,672 | $2,664 → $2,904 |
| CA037 | Los Angeles, CA | Los Angeles AFB | 90245 | $3,882 → $4,154 | $3,048 → $3,261 |
| CA038 | San Diego, CA | Naval Station San Diego, MCAS Miramar, Naval Amphibious Base Coronado, NAS North Island, MCRD San Diego | 92106 | $3,975 → $3,975 | $3,147 → $3,147 |
| CA039 | Monterey, CA | Presidio of Monterey, Naval Postgraduate School | 93940 | $3,465 → $3,742 | $2,844 → $3,072 |
| CA457 | Edwards Afb/Palmdale, CA | Edwards AFB | 93534 | $2,658 → $2,897 | $2,148 → $2,341 |
| CO045 | Denver, CO | Buckley Space Force Base | 80011 | $2,841 → $2,926 | $2,148 → $2,212 |
| CO046 | Colorado Springs, CO | Fort Carson, Peterson Space Force Base, Schriever Space Force Base, U.S. Air Force Academy | 80903 | $2,358 → $2,547 | $1,860 → $2,009 |
| CT049 | New London, CT | Naval Submarine Base New London, U.S. Coast Guard Academy | 06340 | $2,580 → $2,812 | $2,148 → $2,341 |
| DC053 | Washington, DC Metro Area | Joint Base Andrews, Joint Base Myer-Henderson Hall, Fort Belvoir, Walter Reed National Military Medical Center, Fort McNair, Joint Base Anacostia-Bolling | 20748 | $3,132 → $3,414 | $2,832 → $3,087 |
| FL056 | Eglin Afb, FL | Eglin AFB, Hurlburt Field, NAS Whiting Field | 32547 | $2,433 → $2,652 | $2,157 → $2,351 |
| FL058 | Jacksonville, FL | Naval Station Mayport, NAS Jacksonville | 32233 | $2,181 → $2,290 | $1,803 → $1,893 |
| FL059 | Patrick Sfb, FL | Patrick Space Force Base | 32931 | $2,502 → $2,677 | $2,037 → $2,180 |
| FL063 | Panama City, FL | Tyndall AFB | 32407 | $2,163 → $2,293 | $1,863 → $1,975 |
| FL064 | Pensacola, FL | Naval Air Station Pensacola | 32501 | $1,863 → $2,031 | $1,644 → $1,792 |
| FL066 | Tampa, FL | MacDill AFB | 33607 | $2,709 → $2,926 | $2,187 → $2,362 |
| FL069 | Florida Keys, FL | NAS Key West | 33040 | $3,969 → $4,247 | $3,459 → $3,701 |
| GA073 | Fort Gordon, AL | Fort Gordon | 30901 | $1,890 → $1,947 | $1,644 → $1,693 |
| GA074 | Kings Bay/Brunswick, GA | Naval Submarine Base Kings Bay | 31547 | $2,133 → $2,304 | $1,806 → $1,950 |
| GA075 | Fort Benning, GA | Fort Benning | 31901 | $1,716 → $1,819 | $1,482 → $1,571 |
| GA076 | Robins Afb, GA | Robins AFB | 31088 | $1,800 → $1,710 | $1,491 → $1,416 |
| GA080 | Fort Stewart, GA | Fort Stewart | 31313 | $2,310 → $2,472 | $1,947 → $2,083 |
| GA081 | Moody Afb, GA | Moody AFB | 31601 | $1,524 → $1,539 | $1,416 → $1,430 |
| HI408 | Honolulu County, HI | Schofield Barracks, Joint Base Pearl Harbor-Hickam, Fort Shafter, Marine Corps Base Hawaii | 96786 | $3,663 → $3,883 | $2,856 → $3,027 |
| ID086 | Mountain Home Afb, ID | Mountain Home AFB | 83647 | $1,605 → $1,749 | $1,524 → $1,661 |
| IL092 | Great Lakes Navtracen, IL | Naval Station Great Lakes | 60064 | $2,427 → $2,403 | $1,854 → $1,835 |
| KS100 | Fort Riley, KS | Fort Riley | 66441 | $1,314 → $1,419 | $1,158 → $1,251 |
| KS101 | Wichita/Mcconnell Afb, KS | McConnell AFB | 67221 | $1,377 → $1,432 | $1,212 → $1,260 |
| KS102 | Fort Leavenworth, KS | Fort Leavenworth | 66048 | $1,815 → $1,833 | $1,569 → $1,585 |
| KY106 | Fort Campbell, KY | Fort Campbell | 37040 | $1,815 → $1,851 | $1,593 → $1,625 |
| KY110 | Fort Knox, KY | Fort Knox | 40160 | $1,647 → $1,696 | $1,443 → $1,486 |
| LA115 | Fort Polk, LA | Fort Polk | 71446 | $1,218 → $1,303 | $1,128 → $1,207 |
| LA117 | Shreveport/Barksdale Afb, LA | Barksdale AFB | 71111 | $1,845 → $1,993 | $1,452 → $1,568 |
| MA124 | Cape Cod-Plymouth, MA | Joint Base Cape Cod | 02532 | $3,924 → $4,277 | $3,285 → $3,581 |
| MA377 | Hanscom Afb, MA | Hanscom AFB | 01730 | $4,188 → $4,314 | $3,516 → $3,621 |
| MD127 | Aberdeen Proving Grounds, MD | Aberdeen Proving Ground | 21001 | $2,478 → $2,676 | $1,986 → $2,145 |
| MD128 | Annapolis, MD | U.S. Naval Academy | 21402 | $2,928 → $2,987 | $2,475 → $2,525 |
| MD130 | Fort Detrick, MD | Fort Detrick | 21701 | $2,682 → $2,628 | $2,160 → $2,117 |
| MD133 | Fort G. G. Meade, MD | Fort George G. Meade | 20755 | $2,901 → $2,959 | $2,436 → $2,485 |
| MD135 | Patuxent River, MD | NAS Patuxent River | 20670 | $2,406 → $2,623 | $2,040 → $2,224 |
| MO161 | St. Louis, MO | Scott AFB | 62025 | $2,436 → $2,460 | $1,947 → $1,966 |
| MO162 | Whiteman Afb, MO | Whiteman AFB | 64093 | $1,611 → $1,740 | $1,215 → $1,312 |
| MO163 | Fort Leonard Wood, MO | Fort Leonard Wood | 65473 | $1,479 → $1,494 | $1,290 → $1,303 |
| MS168 | Gulfport, MS | Keesler AFB | 39531 | $1,602 → $1,538 | $1,365 → $1,310 |
| MS169 | Columbus Afb, MS | Columbus AFB | 39705 | $1,398 → $1,440 | $1,158 → $1,193 |
| MS171 | Meridian, MS | NAS Meridian | 39307 | $1,290 → $1,316 | $1,062 → $1,083 |
| MT175 | Malmstrom Sfb/Great Falls, MT | Malmstrom AFB | 59401 | $1,608 → $1,753 | $1,392 → $1,517 |
| NC177 | Morehead/Cherry Pt Mcas, NC | MCAS Cherry Point | 28532 | $1,851 → $2,018 | $1,722 → $1,877 |
| NC178 | Camp Lejeune, NC | Marine Corps Base Camp Lejeune, MCAS New River | 28540 | $1,584 → $1,679 | $1,476 → $1,565 |
| NC182 | Fort Bragg/Pope, NC | Fort Bragg | 28301 | $1,806 → $1,896 | $1,527 → $1,603 |
| NC183 | Seymour Johnson Afb, NC | Seymour Johnson AFB | 27530 | $1,521 → $1,536 | $1,428 → $1,442 |
| ND190 | Grand Forks, ND | Grand Forks AFB | 58201 | $1,731 → $1,748 | $1,299 → $1,312 |
| ND191 | Minot Afb, ND | Minot AFB | 58701 | $1,548 → $1,672 | $1,260 → $1,361 |
| NE192 | Omaha/Offutt Afb, NE | Offutt AFB | 68005 | $2,085 → $2,252 | $1,587 → $1,714 |
| NJ198 | Cape May, NJ | Training Center Cape May | 08204 | $2,754 → $2,947 | $2,172 → $2,324 |
| NJ204 | Jb Mcguire-Dix-Lakehurst, NJ | Joint Base McGuire-Dix-Lakehurst | 08640 | $2,823 → $3,049 | $2,421 → $2,615 |
| NM205 | Holloman Afb/Alamogordo, NM | Holloman AFB | 88310 | $1,590 → $1,606 | $1,197 → $1,209 |
| NM206 | Albuquerque/Kirtland Afb, NM | Kirtland AFB | 87101 | $2,211 → $2,145 | $1,689 → $1,638 |
| NM207 | Cannon Afb/Clovis, NM | Cannon AFB | 88101 | $1,365 → $1,488 | $1,107 → $1,207 |
| NV211 | Fallon Nas, NV | NAS Fallon | 89406 | $1,596 → $1,724 | $1,455 → $1,571 |
| NV212 | Nellis Afb/Las Vegas, NV | Nellis AFB | 89115 | $2,070 → $2,153 | $1,737 → $1,806 |
| NY217 | West Point, NY | United States Military Academy at West Point | 10996 | $3,468 → $3,676 | $2,859 → $3,031 |
| NY219 | New York City, NY | Fort Hamilton | 11209 | $5,070 → $5,273 | $4,980 → $5,179 |
| NY225 | Fort Drum/Watertown, NY | Fort Drum | 13601 | $1,665 → $1,715 | $1,422 → $1,465 |
| OH231 | Wright-Patterson Afb, OH | Wright-Patterson AFB | 45431 | $1,650 → $1,782 | $1,341 → $1,448 |
| OK235 | Altus Afb, OK | Altus AFB | 73521 | $1,254 → $1,317 | $1,032 → $1,084 |
| OK236 | Vance Afb/Enid, OK | Vance AFB | 73701 | $1,200 → $1,248 | $1,065 → $1,108 |
| OK237 | Fort Sill/Lawton, OK | Fort Sill | 73501 | $1,233 → $1,282 | $1,092 → $1,136 |
| OK239 | Oklahoma City, OK | Tinker AFB | 73110 | $1,644 → $1,677 | $1,365 → $1,392 |
| PA247 | Carlisle Barracks, PA | Carlisle Barracks | 17013 | $2,076 → $2,201 | $1,617 → $1,714 |
| RI256 | Newport, RI | Naval Station Newport | 02841 | $2,847 → $2,932 | $2,361 → $2,432 |
| SC258 | Beaufort/Parris Island, SC | MCAS Beaufort, MCRD Parris Island | 29902 | $2,403 → $2,427 | $2,103 → $2,124 |
| SC259 | Charleston, SC | Joint Base Charleston | 29405 | $2,385 → $2,457 | $1,941 → $1,999 |
| SC260 | Columbia/Fort Jackson, SC | Fort Jackson | 29201 | $1,878 → $1,934 | $1,647 → $1,696 |
| SC263 | Sumter/Shaw Afb, SC | Shaw AFB | 29150 | $1,503 → $1,548 | $1,290 → $1,329 |
| SD264 | Rapid City/Ellsworth Afb, SD | Ellsworth AFB | 57701 | $1,986 → $2,165 | $1,545 → $1,684 |
| TX270 | Abilene/Dyess Afb, TX | Dyess AFB | 79601 | $1,872 → $1,616 | $1,545 → $1,338 |
| TX275 | Corpus Christi, TX | NAS Corpus Christi, NAS Kingsville | 78412 | $1,788 → $1,949 | $1,413 → $1,540 |
| TX278 | Laughlin Afb/Del Rio, TX | Laughlin AFB | 78840 | $1,470 → $1,529 | $1,209 → $1,257 |
| TX279 | El Paso, TX | Fort Bliss | 79901 | $1,809 → $1,972 | $1,437 → $1,566 |
| TX284 | Goodfellow Afb, TX | Goodfellow AFB | 76901 | $1,578 → $1,610 | $1,230 → $1,255 |
| TX285 | San Antonio, TX | Joint Base San Antonio | 78201 | $1,869 → $1,888 | $1,500 → $1,515 |
| TX286 | Fort Hood, TX | Fort Hood | 76541 | $1,695 → $1,729 | $1,530 → $1,561 |
| TX288 | Wichita Fls/Sheppard Afb, TX | Sheppard AFB | 76301 | $1,491 → $1,521 | $1,182 → $1,206 |
| UT291 | Ogden/Hill Afb, UT | Hill AFB | 84401 | $2,118 → $2,139 | $1,668 → $1,685 |
| VA296 | Quantico/Woodbridge, VA | Marine Corps Base Quantico | 22134 | $2,955 → $2,955 | $2,361 → $2,361 |
| VA297 | Hampton/Newport News, VA | Joint Base Langley-Eustis | 23665 | $2,274 → $2,479 | $1,779 → $1,939 |
| VA298 | Norfolk/Portsmouth, VA | Naval Station Norfolk, Joint Base Little Creek-Fort Story, Naval Air Station Oceana, Naval Medical Center Portsmouth, Dam Neck Annex | 23503 | $2,430 → $2,649 | $1,908 → $2,080 |
| VA301 | Richmond/Fort Lee, VA | Fort Lee | 23801 | $2,358 → $2,264 | $1,866 → $1,791 |
| WA306 | Bremerton, WA | Naval Base Kitsap | 98312 | $2,364 → $2,317 | $2,091 → $2,049 |
| WA307 | Everett, WA | Fairchild AFB, Naval Station Everett | 99011 | $2,748 → $2,913 | $2,277 → $2,414 |
| WA311 | Tacoma, WA | Joint Base Lewis-McChord | 98499 | $2,556 → $2,786 | $2,121 → $2,312 |
| WA312 | Whidbey Island, WA | Naval Air Station Whidbey Island | 98277 | $2,073 → $2,218 | $1,905 → $2,038 |
| WI318 | Sparta/Fort Mccoy, WI | Fort McCoy | 54656 | $1,395 → $1,465 | $1,290 → $1,355 |
| WY324 | Cheyenne, WY | F.E. Warren AFB | 82001 | $1,653 → $1,736 | $1,326 → $1,392 |

## Spot-check sample (verify against the DTMO online BAH lookup)

10 cells chosen by a PRNG seeded from the rate files' SHA-256 (`25dc247c`), so a re-run picks the same cells. Enter the lookup ZIP in DTMO's BAH calculator (it takes a ZIP, not an MHA code).

| # | MHA | name | lookup ZIP | grade | dependents | monthly | ✓ |
|---|---|---|---|---|---|---|---|
| 1 | OK240 | Tulsa, OK | 74008 | O-3 | with | $2,253 | ☐ |
| 2 | AL004 | Mobile, AL | 36505 | O-2 | without | $1,913 | ☐ |
| 3 | KS105 | Topeka, KS | 66402 | W-5 | without | $1,875 | ☐ |
| 4 | VA295 | Charlottesville, VA | 22901 | E-3 | with | $2,372 | ☐ |
| 5 | FL057 | Gainesville, FL | 32601 | W-3 | with | $2,700 | ☐ |
| 6 | AL002 | Fort Rucker, AL | 36362 | O-4 | without | $1,980 | ☐ |
| 7 | NM210 | Santa Fe/Los Alamos, NM | 87010 | E-6 | with | $3,585 | ☐ |
| 8 | ZZ690 | County Cost Group 690 | 12922 | O-3 | without | $1,755 | ☐ |
| 9 | SC263 | Sumter/Shaw Afb, SC | 29150 | E-9 | without | $1,777 | ☐ |
| 10 | NY218 | Long Island, NY | 00501 | W-1 | with | $4,839 | ☐ |
