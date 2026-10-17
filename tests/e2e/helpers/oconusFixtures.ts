import type { OconusStation } from '../../../src/data/oconus/types';
import { ramstein } from '../../../src/data/oconus/ramstein';

// Lint fixtures: copies of the Ramstein entry with one deliberate violation each.

function clone(overrides: Partial<OconusStation>): OconusStation {
  return { ...structuredClone(ramstein), slug: 'fixture-station', ...overrides };
}

export const currencyFixture = clone({
  localContext: { value: 'Winter heating can run €150 a month in older homes.', sourceUrl: 'TODO-DAN', verifiedOn: null },
});

export const voiceFixture = clone({
  beforeYouMove: [{ value: 'You should file your VAT forms on arrival.', sourceUrl: 'TODO-DAN', verifiedOn: null }],
});

export const publishedUnverifiedFixture = clone({ published: true });
