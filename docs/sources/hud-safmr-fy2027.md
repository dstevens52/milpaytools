# HUD Small Area Fair Market Rents, FY2027

Verified by Claude Chat on 2026-11-20 on HUD USER's Small Area FMR page (read in a browser).

| Item | Value |
|---|---|
| Publisher | U.S. Department of Housing and Urban Development, HUD USER |
| Page | https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html ("FY2027 Small Area FMRs") |
| File | https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_safmrs.xlsx |
| Size / Last-Modified (HTTP HEAD, 2026-11-20) | 4,388,722 bytes / Mon, 31 Aug 2026 14:42:22 GMT |
| Revised version | None listed on 2026-11-20 (FY2026 had `fy2026_safmrs_revised.xlsx`; check again on release day) |
| Methodology | https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27-Public-SAFMR-Methodology.pdf |
| Online lookup (for spot checks) | https://www.huduser.gov/datasets/fmr/fmr2027/safmr |
| Federal Register | Notice of Fiscal Year (FY) 2027 Fair Market Rents, FR Doc. 2026-17891 |
| Period | HUD fiscal year 2027: Oct. 1, 2026 – Sept. 30, 2027 |

SHA-256 of the downloaded file: `532d862a0a95ebb6ef7ff35a9a12924d2451a5fc985ca57a83fc334f229f0a8a` (4,388,722 bytes; downloaded 2026-11-20 by Claude Code through Chrome, since HUD answers plain `curl` with an empty HTTP 202; saved to the gitignored `data/sources/hud/FY27_safmrs.xlsx`). Sheet `SAFMRs`; headers `ZIP Code` and `SAFMR 0BR`–`SAFMR 4BR` after newline normalization, as in FY2026. 51,871 rows, 38,601 unique ZIPs.

## Use on MilPayTools
- Same method as FY2026 (`scripts/build-fmr-data.py`): per MHA, p25 / median / p75 of each bedroom size's SAFMR across the MHA's covered ZIPs. Rents come only from this file.
- Pairing: 2026 BAH is compared with FY2026 SAFMR; 2027 BAH with FY2027 SAFMR. The pair switches with the BAH year, so pages don't change until 2027 BAH is loaded.
- Label on pages: "HUD FY2027 Small Area Fair Market Rent" (HUD's fiscal year, which began Oct. 1, 2026).
