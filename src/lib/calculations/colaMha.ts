// Client-safe half of the CONUS COLA lookup: MHA code → 2026 eligibility.
// No ZIP data imported here, so client components (ColaCalculator, PCS Compare)
// can use it without shipping zipToMha. The ZIP entry point is lookupCola() in
// ./cola.ts (server/tests).

import { getColaAreaByMha } from '@/data/cola/2026/constants';

export interface ColaEligible {
  status: 'eligible';
  eligible: true;
  mhaCode: string;
  /** Area name as printed by DTMO, e.g. "Seattle". */
  dtmoName: string;
  /** MHA name from the BAH dataset, e.g. "Seattle, WA". */
  mhaName: string;
  state: string;
  /** Official 2026 COLA index, in percent. */
  index: number;
}

export interface ColaNotEligible {
  status: 'not-eligible';
  eligible: false;
  mhaCode: string;
  mhaName: string;
}

export interface ColaNotFound {
  status: 'not-found';
  eligible: false;
}

export type ColaLookupResult = ColaEligible | ColaNotEligible | ColaNotFound;

/** Resolve eligibility for an already-known MHA code + display name. */
export function colaForMha(mhaCode: string, mhaName: string): ColaEligible | ColaNotEligible {
  const area = getColaAreaByMha(mhaCode);
  if (!area) return { status: 'not-eligible', eligible: false, mhaCode, mhaName };
  return {
    status: 'eligible',
    eligible: true,
    mhaCode,
    dtmoName: area.dtmoName,
    mhaName,
    state: area.state,
    index: area.index,
  };
}
