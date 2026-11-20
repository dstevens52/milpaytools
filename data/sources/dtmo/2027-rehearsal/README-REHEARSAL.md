# REHEARSAL DATA: NOT DTMO RATES

**Synthetic data generated for a rehearsal. Not DTMO rates.**

Branch `rehearsal/bah-2027-r2` only (draft PR "REHEARSAL — DO NOT MERGE"). Never copy any file in
this folder to `main`, `docs/sources/`, `src/data/bah/` on another branch, or a test fixture.

Generated 2026-11-20 by `npx tsx scripts/rehearsal/make-fake-dtmo-2027.ts` from the real 2026
DTMO ASCII files in `data/sources/dtmo/2026/`, in DTMO's file names and byte format (each line's
own line ending kept: LF in the rate and name files, CRLF in the ZIP file).

- **Seed:** `milpaytools-bah-r2-2026-11-20`. Every choice is `sha256(seed:purpose:key)`, so a
  re-run writes byte-identical files. `manifest.json` lists every choice.
- **Increases (287 MHAs):** each MHA +1% to +9% (from the hash of its code), every cell × the same
  factor, rounded to whole dollars. Distribution: 1% ×35, 2% ×33, 3% ×34, 4% ×28, 5% ×32,
  6% ×29, 7% ×26, 8% ×39, 9% ×31.
- **Decreases (40 MHAs, −1% to −5%):** AL001 −5, AL005 −1, AZ016 −2, CA028 −4, CA042 −2,
  FL067 −5, FL068 −3, FL070 −5, FL424 −1, GA076 −5, HI409 −5, IL092 −1, IN399 −3, KS105 −4,
  LA116 −1, MD129 −3, MD130 −2, MI152 −2, MI155 −5, MI156 −4, MN158 −4, MS168 −4, MT347 −2,
  NC179 −3, NC185 −1, NJ200 −1, NJ201 −4, NJ202 −3, NJ203 −4, NM206 −3, TX281 −2, TX356 −2,
  VA301 −4, WA306 −2, WI316 −3, ZZ520 −3, ZZ530 −3, ZZ590 −1, ZZ680 −5, ZZ720 −2.
- **Unchanged (10 MHAs):** CA024, CA038 (San Diego), FL057, GA077, HI414, OH227, VA296, ZZ510,
  ZZ660, ZZ840.
- **TX270 (Abilene/Dyess AFB):** January 2026 DTMO ASCII rates +4%. The generator asserts every
  cell is **below** the 2026 temporary increase (May 16, 2026) shipped in
  `src/data/bah/2026/mhaRates.ts` (E-5 with dependents: temporary $1,872 → fake 2027 $1,616).
- **ZIP remaps (3; all other 40,956 ZIPs keep their 2026 MHA):**
  - 17582 PA247 → PA250
  - 06858 CT051 → CT049
  - 99011 WA310 → WA307 — **a station-page ZIP (Fairchild AFB)**
- `mhanames27.txt` is a byte copy of `mhanames26.txt` (no MHA added, removed or renamed).
