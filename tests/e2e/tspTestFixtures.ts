/**
 * Shared fixtures for TSP E2E tests.
 *
 * SAMPLE_BAR_SCENARIO and sampleFmt are defined in
 * src/lib/calculations/tspSampleDefaults.ts — a non-test module imported by
 * both page.tsx (server render) and this file (E2E assertion). They are
 * re-exported here so test files only need one import.
 *
 * The page and the test now share a single source of truth: update the
 * scenario in tspSampleDefaults.ts and both consumers update automatically.
 */

export { SAMPLE_BAR_SCENARIO, sampleFmt } from '@/lib/calculations/tspSampleDefaults';
