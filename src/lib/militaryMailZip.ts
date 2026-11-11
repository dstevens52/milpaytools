/**
 * Military mail (APO/FPO/DPO) ZIP prefixes. These ZIPs route mail to overseas
 * units; they are not BAH ZIPs. Verified 2026-11-11: none of the 40,959 ZIPs
 * in src/data/bah/2026/zipToMha.ts match these prefixes, so this check can't
 * shadow a real stateside result.
 *
 *   09xxx      APO/FPO AE (Europe, Middle East, Africa)
 *   340xx      APO/FPO AA (the Americas)
 *   962–966xx  APO/FPO AP (Pacific)
 *
 * Works on partial ZIPs of 3+ digits (the PCS estimator classifies as the
 * user types); BaseSearchInput only calls it with a complete 5-digit ZIP.
 */
export function isMilitaryMailZip(zip: string): boolean {
  if (!/^\d{3,5}$/.test(zip)) return false;
  const p3 = zip.slice(0, 3);
  return zip.startsWith('09') || p3 === '340' || (p3 >= '962' && p3 <= '966');
}
