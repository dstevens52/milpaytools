/**
 * The one "last checked" date for pending official data.
 *
 * Update this single line whenever the status of next year's data is
 * re-checked (weekly while anything is pending). It feeds:
 *   - /pay/raise (src/data/pay-raise/2027.ts → lastChecked)
 *   - the 2027 BAH notice on /bah and every CONUS /bah/[slug] page
 *     (src/data/bah/2027-status.ts)
 */
export const DATA_LAST_CHECKED = '2026-11-11';
