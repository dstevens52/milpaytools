/**
 * llms.txt "Calculator link settings" ↔ the URL parameters each calculator reads.
 *
 * Data-only: no page fixture, so no browser is launched. Run it without a server
 * via `npm run test:llms-params` (a non-localhost BASE_URL turns off the config's
 * webServer).
 *
 * Three checks, so llms.txt can't list a parameter a calculator doesn't read or
 * miss one it does:
 *   1. The llms.txt section is exactly what src/data/calculatorUrlParams.ts renders
 *      (fix: `npm run llms:params`), and it has no dollar figures.
 *   2. Per calculator, the parameter names llms.txt lists equal the declared names.
 *   3. Per calculator, the names its source code reads from the URL equal the
 *      declared names (the calculators read through readUrlParams, whose get() is
 *      typed to the declared names; this scan also catches a declared name that
 *      nothing reads).
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CALCULATOR_URL_PARAMS,
  LLMS_CALCULATOR_ORDER,
  LLMS_SECTION_END,
  LLMS_SECTION_START,
  renderLlmsUrlSettings,
  type CalculatorKey,
  type CalculatorUrlSpec,
} from '@/data/calculatorUrlParams';

const ROOT = join(__dirname, '..', '..');
const llms = readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8').replace(/\r\n/g, '\n');
const KEYS = Object.keys(CALCULATOR_URL_PARAMS) as CalculatorKey[];
const spec = (k: CalculatorKey): CalculatorUrlSpec => CALCULATOR_URL_PARAMS[k];

function llmsSection(): string {
  const start = llms.indexOf(LLMS_SECTION_START);
  const end = llms.indexOf(LLMS_SECTION_END);
  expect(start, 'llms.txt has the calculator link settings start marker').toBeGreaterThan(-1);
  expect(end, 'llms.txt has the end marker after the start marker').toBeGreaterThan(start);
  return llms.slice(start, end + LLMS_SECTION_END.length);
}

/** Parameter names llms.txt lists under each "### Title (path)" heading. */
function llmsNamesByPath(section: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let current: string[] | null = null;
  for (const line of section.split('\n')) {
    const h = line.match(/^### .+ \((\/[^)]*)\)$/);
    if (h) {
      current = [];
      out.set(h[1], current);
      continue;
    }
    const p = line.match(/^- `([^`]+)`: /);
    if (p && current) current.push(p[1]);
  }
  return out;
}

/** Names a source file reads from the URL. */
function namesReadIn(source: string): string[] {
  const names = new Set<string>();
  // Variables holding a URL reader: readUrlParams(...), new URLSearchParams(search),
  // or the VA calculator's rawParams(search).
  const readers = [...source.matchAll(
    /const (\w+) = (?:readUrlParams\([^)]*\)|new URLSearchParams\((?:window\.location\.)?search\))/g,
  )].map((m) => m[1]);
  const rawObjects = [...source.matchAll(/const (\w+) = rawParams\(search\)/g)].map((m) => m[1]);
  expect(readers.length + rawObjects.length, 'found the URL reader variable in the source').toBeGreaterThan(0);
  for (const v of readers) {
    for (const m of source.matchAll(new RegExp(`\\b${v}\\.get\\(\\s*'([^']+)'`, 'g'))) names.add(m[1]);
  }
  // The VA parser's rawParams() object is read by property (params.sp, params.r ...).
  for (const v of rawObjects) {
    for (const m of source.matchAll(new RegExp(`\\b${v}\\.(\\w+)\\b(?!\\s*\\()`, 'g'))) names.add(m[1]);
    for (const m of source.matchAll(new RegExp(`\\b${v}\\[\\s*'([^']+)'\\s*\\]`, 'g'))) names.add(m[1]);
  }
  // Helpers that wrap the reader: deployment's int('key'), the VA parser's has('key').
  for (const m of source.matchAll(/\b(?:int|has)\(\s*'([^']+)'\s*\)/g)) names.add(m[1]);
  return [...names].sort();
}

test.describe('llms.txt calculator link settings', () => {
  test('section matches the shared list exactly and has no dollar figures', () => {
    const section = llmsSection();
    expect(section, 'llms.txt is out of date: run npm run llms:params').toBe(renderLlmsUrlSettings());
    expect(section).not.toMatch(/\$/);
  });

  test('every calculator in the list is in llms.txt once, in order', () => {
    expect([...LLMS_CALCULATOR_ORDER].sort()).toEqual([...KEYS].sort());
    const byPath = llmsNamesByPath(llmsSection());
    expect([...byPath.keys()]).toEqual(LLMS_CALCULATOR_ORDER.map((k) => spec(k).path));
  });

  for (const key of KEYS) {
    test(`${key}: llms.txt lists exactly the parameters the calculator reads`, () => {
      const declared = spec(key).params.map((p) => p.name).sort();
      expect(new Set(declared).size, 'no duplicate names').toBe(declared.length);

      const listed = (llmsNamesByPath(llmsSection()).get(spec(key).path) ?? []).slice().sort();
      expect(listed, `llms.txt parameters for ${spec(key).path}`).toEqual(declared);

      const read = spec(key).sources.flatMap((f) => namesReadIn(readFileSync(join(ROOT, f), 'utf8')));
      expect([...new Set(read)].sort(), `parameters read in ${spec(key).sources.join(', ')}`).toEqual(declared);

      // The example link only uses declared settings.
      for (const name of Object.keys(spec(key).example.params)) expect(declared).toContain(name);
    });
  }
});
