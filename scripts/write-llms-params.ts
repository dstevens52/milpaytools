// Writes the "Calculator link settings" section of public/llms.txt from
// src/data/calculatorUrlParams.ts (the list the calculators read through
// readUrlParams). Replaces the section between its markers, or inserts it before
// "## Guides" the first time. Never touches anything else in the file.
//
//   npm run llms:params
//
// tests/e2e/llms-url-params.spec.ts fails when llms.txt and the list differ.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LLMS_SECTION_END, LLMS_SECTION_START, renderLlmsUrlSettings } from '../src/data/calculatorUrlParams';

const file = join(process.cwd(), 'public', 'llms.txt');
const before = readFileSync(file, 'utf8');
// Keep the file's own line endings (it is checked in with CRLF).
const eol = before.includes('\r\n') ? '\r\n' : '\n';
const section = renderLlmsUrlSettings().split('\n').join(eol);

let after: string;
const start = before.indexOf(LLMS_SECTION_START);
if (start !== -1) {
  const endMarker = before.indexOf(LLMS_SECTION_END, start);
  if (endMarker === -1) throw new Error('llms.txt has the start marker but no end marker');
  after = before.slice(0, start) + section + before.slice(endMarker + LLMS_SECTION_END.length);
} else {
  const anchor = before.indexOf(`${eol}## Guides`);
  if (anchor === -1) throw new Error('llms.txt: no "## Guides" heading to insert before');
  const at = anchor + eol.length;
  after = before.slice(0, at) + section + eol + eol + before.slice(at);
}

if (after === before) {
  console.log('llms.txt: calculator link settings already up to date');
} else {
  writeFileSync(file, after, 'utf8');
  console.log(`llms.txt: calculator link settings written (${before.length} → ${after.length} bytes)`);
}
