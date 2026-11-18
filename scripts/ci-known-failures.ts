// Classifies a merged Playwright JSON report against tests/known-failures.json.
//
//   npx tsx scripts/ci-known-failures.ts <merged-report.json> [--expected <list.json>] [--summary <file>]
//
// <merged-report.json>  `npx playwright merge-reports --reporter=json` output (or any JSON-reporter run)
// --expected <list.json> `npx playwright test --list --reporter=json` output for the same commit.
//                        Every listed test must appear in the report; a missing one fails the gate
//                        (a shard that crashed or timed out is not a pass).
// --summary <file>       Also append the markdown result here (CI: $GITHUB_STEP_SUMMARY).
//
// Prints, per CLAUDE.md "Verification Conventions" (an empty result is evidence of nothing):
//   - the total test count and the verbatim `stats` block
//   - 1. New failures            -> fail the gate
//   - 2. Known failures still failing
//   - 3. Known failures now passing (candidates to remove; Dan / Claude Chat decide)
// Exit code 1 when: new failures, zero tests, or tests missing versus --expected.
//
// Matching is by browser (project) + spec file + full title (describe titles joined with " › ").
// Line numbers are not used because they drift whenever a spec file is edited.

import { appendFileSync, readFileSync } from 'node:fs';

type Kind = 'failure' | 'flaky';

interface KnownEntry {
  id: string;
  kind: Kind;
  file: string;
  title: string;
  browsers: string[];
  ciOnly?: boolean;
  reason: string;
  section: string;
}

interface Row {
  project: string;
  file: string;
  title: string;
  line: number;
  status: string; // expected | unexpected | flaky | skipped
  error?: string;
}

interface Suite {
  title: string;
  file?: string;
  specs?: { title: string; file: string; line: number; tests: Test[] }[];
  suites?: Suite[];
}
interface Test {
  projectName: string;
  status: string;
  results?: { status?: string; error?: { message?: string } }[];
}

function args() {
  const a = process.argv.slice(2);
  const out: { report?: string; expected?: string; summary?: string } = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--expected') out.expected = a[++i];
    else if (a[i] === '--summary') out.summary = a[++i];
    else if (!out.report) out.report = a[i];
  }
  if (!out.report) {
    console.error('usage: ci-known-failures.ts <merged-report.json> [--expected <list.json>] [--summary <file>]');
    process.exit(2);
  }
  return out;
}

function flatten(suites: Suite[]): Row[] {
  const rows: Row[] = [];
  const walk = (s: Suite, path: string[]) => {
    for (const sp of s.specs ?? []) {
      for (const t of sp.tests) {
        const last = t.results?.[t.results.length - 1];
        rows.push({
          project: t.projectName,
          file: sp.file.replace(/\\/g, '/'),
          title: [...path, sp.title].join(' › '),
          line: sp.line,
          status: t.status,
          error: last?.error?.message?.split('\n')[0]?.replace(/\u001b\[[0-9;]*m/g, '').slice(0, 200),
        });
      }
    }
    for (const c of s.suites ?? []) walk(c, [...path, c.title]);
  };
  // Top-level suites are files; their title is the file name, not part of the test title.
  for (const s of suites) walk(s, []);
  return rows;
}

const key = (project: string, file: string, title: string) => `${project}\u0000${file}\u0000${title}`;

function main() {
  const opt = args();
  const report = JSON.parse(readFileSync(opt.report!, 'utf8'));
  const known: KnownEntry[] = JSON.parse(readFileSync('tests/known-failures.json', 'utf8')).entries;
  const rows = flatten(report.suites ?? []);
  const lines: string[] = [];
  const say = (s = '') => lines.push(s);
  let gateFail = false;

  const byKey = new Map<string, Row>();
  for (const r of rows) byKey.set(key(r.project, r.file, r.title), r);

  const knownFor = (r: Row) =>
    known.find((k) => k.file === r.file && k.title === r.title && k.browsers.includes(r.project));

  const failed = rows.filter((r) => r.status === 'unexpected');
  const newFailures = failed.filter((r) => !knownFor(r));
  const knownStillFailing = failed.filter((r) => knownFor(r));

  const nowPassing: { entry: KnownEntry; row: Row }[] = [];
  const notFound: { entry: KnownEntry; browser: string }[] = [];
  for (const k of known) {
    for (const b of k.browsers) {
      const r = byKey.get(key(b, k.file, k.title));
      if (!r) notFound.push({ entry: k, browser: b });
      else if (r.status === 'expected' || r.status === 'flaky') nowPassing.push({ entry: k, row: r });
    }
  }

  const projects = [...new Set(rows.map((r) => r.project))].sort();
  const perProject = projects
    .map((p) => {
      const pr = rows.filter((r) => r.project === p);
      const c = (s: string) => pr.filter((r) => r.status === s).length;
      return `| ${p} | ${pr.length} | ${c('expected')} | ${c('unexpected')} | ${c('skipped')} | ${c('flaky')} |`;
    })
    .join('\n');

  say('## E2E gate — known-failure classification');
  say();
  say(`**Total tests in report: ${rows.length}**`);
  if (rows.length === 0) {
    say();
    say('**FAIL: the report contains zero tests.** An empty result is evidence of nothing.');
    gateFail = true;
  }

  // Missing tests versus the --list of the same commit.
  if (opt.expected) {
    const list = JSON.parse(readFileSync(opt.expected, 'utf8'));
    const listed = flatten(list.suites ?? []);
    const missing = listed.filter((l) => !byKey.has(key(l.project, l.file, l.title)));
    say(`Expected (from \`--list\`): ${listed.length} · in report: ${rows.length} · missing: ${missing.length}`);
    if (listed.length === 0) {
      say('**FAIL: the expected-test list is empty** — the listing step did not run correctly.');
      gateFail = true;
    }
    if (missing.length > 0) {
      gateFail = true;
      say();
      say(`**FAIL: ${missing.length} test(s) listed for this commit are missing from the report** (a shard crashed, timed out or was cancelled). First 20:`);
      for (const m of missing.slice(0, 20)) say(`- [${m.project}] ${m.file}:${m.line} — ${m.title}`);
    }
  } else {
    say('Expected-test list: not provided (no missing-test check).');
  }

  say();
  say('### stats (verbatim)');
  say('```json');
  say(JSON.stringify(report.stats ?? null, null, 2));
  say('```');
  say();
  say('| project | tests | expected | unexpected | skipped | flaky |');
  say('|---|---|---|---|---|---|');
  say(perProject || '| (none) | 0 | 0 | 0 | 0 | 0 |');
  say();

  say(`### 1. New failures: ${newFailures.length}`);
  if (newFailures.length) gateFail = true;
  for (const r of newFailures) say(`- [${r.project}] \`${r.file}:${r.line}\` — ${r.title}${r.error ? `\n  - \`${r.error.replace(/`/g, "'")}\`` : ''}`);
  say();

  say(`### 2. Known failures still failing: ${knownStillFailing.length}`);
  for (const r of knownStillFailing) {
    const k = knownFor(r)!;
    say(`- [${r.project}] \`${r.file}:${r.line}\` — ${r.title} _(${k.kind}${k.ciOnly ? ', CI only' : ''}; KNOWN_FAILURES.md: "${k.section}")_`);
  }
  say();

  say(`### 3. Known failures now passing: ${nowPassing.length}`);
  for (const { entry, row } of nowPassing) {
    say(`- [${row.project}] \`${row.file}:${row.line}\` — ${row.title} _(${entry.kind}${entry.kind === 'flaky' ? ' — one pass alone does not clear a flake' : ' — candidate to remove'})_`);
  }
  if (notFound.length) {
    say();
    say(`Known-failure entries that match no test in this report: ${notFound.length} (title changed or test removed — update tests/known-failures.json)`);
    for (const { entry, browser } of notFound) say(`- [${browser}] ${entry.file} — ${entry.title} (id: ${entry.id})`);
  }
  say();
  say(gateFail ? '**Gate: FAIL**' : '**Gate: PASS** (zero new failures, no missing tests)');

  const text = lines.join('\n');
  console.log(text);
  if (opt.summary) appendFileSync(opt.summary, text + '\n');
  process.exit(gateFail ? 1 : 0);
}

main();
