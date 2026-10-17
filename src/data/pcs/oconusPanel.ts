// PCS estimator — overseas result mode. Verbatim copy from the fix/pcs-oconus
// spec. Kept as plain strings so scripts/lint-oconus.ts can lint exactly what
// ships, and the URLs are included in the monthly OCONUS link check.

export const PCS_OVERSEAS_DLA_LABEL = 'Dislocation Allowance (DLA)';

export const PCS_OVERSEAS_DLA_NOTE =
  "DLA is a flat amount based on pay grade and dependency status. It doesn't depend on how far you move.";

export const PCS_OVERSEAS_HEADING = "What's different about an overseas move";

export const PCS_OVERSEAS_INTRO =
  'Most PCS costs for an overseas move are handled differently than a stateside move, so this estimator shows only your Dislocation Allowance. Your transportation office and orders determine the rest.';

export const PCS_OVERSEAS_POINTS: { strong: string; body: string }[] = [
  {
    strong: 'Travel.',
    body: "Travel to an overseas station is usually by air on government-arranged travel, so mileage-based allowances from a stateside move generally don't apply.",
  },
  {
    strong: 'Household goods.',
    body: 'The government generally ships your household goods through the Defense Personal Property Program. Overseas shipments can have different rules and timelines than stateside moves, so confirm what applies to your orders with your transportation office.',
  },
  {
    strong: 'Your vehicle.',
    body: 'You may be authorized to ship a vehicle to some overseas locations. Ask your transportation office what your orders allow before deciding whether to ship, store, or sell.',
  },
  {
    strong: 'Temporary lodging.',
    body: 'Temporary lodging at an overseas station is covered by the Temporary Lodging Allowance (TLA), which works differently from stateside temporary lodging expense.',
  },
  {
    strong: 'Self-moves.',
    body: 'Rules for moving some or all of your belongings yourself differ for overseas moves. Ask your transportation office before planning one.',
  },
];

export const PCS_OVERSEAS_RESOURCES_HEADING = 'Official resources';

export const PCS_OVERSEAS_LINKS: { label: string; url: string }[] = [
  { label: 'Dislocation Allowance (DTMO)', url: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Dislocation-Allowance/' },
  { label: 'Temporary Lodging Allowance (DTMO)', url: 'https://www.travel.dod.mil/Allowances/Temporary-Lodging-Allowance/' },
  { label: 'Moving your personal property (Military OneSource)', url: 'https://www.militaryonesource.mil/moving-pcs/moving-personal-property/' },
  { label: 'Overseas living (Military OneSource)', url: 'https://www.militaryonesource.mil/moving-pcs/living-oconus/' },
];

/** Link to a published v2 OCONUS station guide; {name} is the station name. */
export const PCS_OVERSEAS_GUIDE_LINK = 'See the {name} housing & COLA guide →';

/** Every panel string, for the lints. URLs excluded. */
export function pcsOverseasPanelCopy(): { field: string; text: string }[] {
  const out = [
    { field: 'PCS_OVERSEAS_DLA_LABEL', text: PCS_OVERSEAS_DLA_LABEL },
    { field: 'PCS_OVERSEAS_DLA_NOTE', text: PCS_OVERSEAS_DLA_NOTE },
    { field: 'PCS_OVERSEAS_HEADING', text: PCS_OVERSEAS_HEADING },
    { field: 'PCS_OVERSEAS_INTRO', text: PCS_OVERSEAS_INTRO },
    { field: 'PCS_OVERSEAS_RESOURCES_HEADING', text: PCS_OVERSEAS_RESOURCES_HEADING },
    { field: 'PCS_OVERSEAS_GUIDE_LINK', text: PCS_OVERSEAS_GUIDE_LINK },
  ];
  PCS_OVERSEAS_POINTS.forEach((p, i) => {
    out.push({ field: `PCS_OVERSEAS_POINTS[${i}].strong`, text: p.strong });
    out.push({ field: `PCS_OVERSEAS_POINTS[${i}].body`, text: p.body });
  });
  PCS_OVERSEAS_LINKS.forEach((l, i) => out.push({ field: `PCS_OVERSEAS_LINKS[${i}].label`, text: l.label }));
  return out;
}
