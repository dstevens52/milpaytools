import { TAMP_ELIGIBILITY, TAMP_VOLUNTARY_NOTE } from '@/data/separation/rules';

// Who qualifies for TAMP, from the one shared list (src/data/separation/rules.ts,
// 10 U.S.C. § 1145(a)(2)); MDX posts can't import data modules. Build 10a.
export function TampEligibilityList() {
  return (
    <>
      <ul data-testid="tamp-eligibility">
        {TAMP_ELIGIBILITY.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{TAMP_VOLUNTARY_NOTE}</p>
    </>
  );
}
